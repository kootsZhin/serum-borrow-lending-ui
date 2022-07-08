import { getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection } from '@solana/web3.js';
import { PublicKey } from "@solana/web3.js";
import { findWhere, find } from "underscore";

import { refreshReserveInstruction, refreshObligationInstruction, repayObligationLiquidityInstruction } from "../models/instructions";
import { getObligations } from "../utils";
import { Config } from '../global';
import { refreshReserves } from "./refreshReserves";

export const repay = async (connection: Connection, publicKey: PublicKey, asset: string, repayAmount: number) => {
    const config: Config = await (await fetch("/api/markets")).json();
    const instructions = [];

    const assetConfig = findWhere(config.assets, { symbol: asset });
    const reserveConfig = findWhere(config.markets[0].reserves, { asset: asset });
    const oracleConfig = findWhere(config.oracles.assets, { asset: asset });

    const sourceLiquidity = await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);

    const allObligation = await getObligations(connection, config, config.markets[0].address);
    const userObligation = find(allObligation, (r) => r!.data.owner.toString() === publicKey.toString());

    let userDepositedReserves: PublicKey[] = [];
    let userBorrowedReserves: PublicKey[] = [];
    if (userObligation) {
        userObligation.data.deposits.forEach((deposit) => { userDepositedReserves.push(deposit.depositReserve) });
        userObligation.data.borrows.forEach((borrow) => { userBorrowedReserves.push(borrow.borrowReserve) });
    }

    instructions.push(refreshReserveInstruction(
        new PublicKey(reserveConfig.address),
        new PublicKey(config.programID),
        new PublicKey(oracleConfig.priceAddress)
    ))

    refreshReserves(instructions, userDepositedReserves, config);
    refreshReserves(instructions, userBorrowedReserves, config);
    instructions.push(refreshObligationInstruction(
        userObligation.pubkey,
        new PublicKey(config.programID),
        userDepositedReserves,
        userBorrowedReserves,
    ))

    instructions.push(repayObligationLiquidityInstruction(
        repayAmount * 10 ** assetConfig.decimals,
        new PublicKey(config.programID),
        sourceLiquidity,
        new PublicKey(reserveConfig.liquidityAddress),
        new PublicKey(reserveConfig.address),
        userObligation.pubkey,
        new PublicKey(config.markets[0].address),
        publicKey
    ))

    return instructions;
}