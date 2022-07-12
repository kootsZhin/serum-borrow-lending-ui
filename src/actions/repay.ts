import { getAssociatedTokenAddress, createCloseAccountInstruction } from "@solana/spl-token";
import { Connection } from '@solana/web3.js';
import { PublicKey } from "@solana/web3.js";
import { findWhere, find } from "underscore";

import { refreshObligationInstruction, repayObligationLiquidityInstruction } from "../models/instructions";
import { getObligations, pushIfNotExists } from "../utils";
import { Config } from '../global';
import { refreshReserves } from "./refreshReserves";
import { wrapSol } from "./wrapSol";

export const repay = async (connection: Connection, publicKey: PublicKey, asset: string, repayAmount: number) => {
    const config: Config = await (await fetch("/api/markets")).json();

    let instructions;
    let signers;
    if (asset === "SOL" || asset === "WSOL") {
        ({ instructions, signers } = await wrapSol(connection, publicKey, repayAmount));
    } else {
        instructions = [];
        signers = undefined;
    }

    const assetConfig = findWhere(config.assets, { symbol: asset });
    const reserveConfig = findWhere(config.markets[0].reserves, { asset: asset });
    const oracleConfig = findWhere(config.oracles.assets, { asset: asset });

    const sourceLiquidity = signers ? signers[0].publicKey : await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);

    const allObligation = await getObligations(connection, config, config.markets[0].address);
    const userObligation = find(allObligation, (r) => r!.data.owner.toString() === publicKey.toString());

    let reservesToBeRefreshed: PublicKey[] = [];
    let userDepositedReserves: PublicKey[] = [];
    let userBorrowedReserves: PublicKey[] = [];
    if (userObligation) {
        userObligation.data.deposits.forEach((deposit) => {
            userDepositedReserves.push(deposit.depositReserve);
            pushIfNotExists(reservesToBeRefreshed, deposit.depositReserve);
        });
        userObligation.data.borrows.forEach((borrow) => {
            userBorrowedReserves.push(borrow.borrowReserve);
            pushIfNotExists(reservesToBeRefreshed, borrow.borrowReserve);
        });
    }

    pushIfNotExists(reservesToBeRefreshed, new PublicKey(reserveConfig.address));

    refreshReserves(instructions, reservesToBeRefreshed, config);

    instructions.push(refreshObligationInstruction(
        userObligation.pubkey,
        new PublicKey(config.programID),
        userDepositedReserves,
        userBorrowedReserves,
    ))

    instructions.push(repayObligationLiquidityInstruction(
        Math.floor(repayAmount * 10 ** assetConfig.decimals),
        new PublicKey(config.programID),
        sourceLiquidity,
        new PublicKey(reserveConfig.liquidityAddress),
        new PublicKey(reserveConfig.address),
        userObligation.pubkey,
        new PublicKey(config.markets[0].address),
        publicKey
    ))

    if (signers) {
        instructions.push(createCloseAccountInstruction(
            signers[0].publicKey,
            publicKey,
            publicKey
        ));
    }

    return { instructions, signers };
}