import { createCloseAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token";
import { Connection, PublicKey } from '@solana/web3.js';
import { BigNumber } from "bignumber.js";
import { find, findWhere } from "underscore";

import { Config } from "../global";
import { refreshObligationInstruction, withdrawObligationCollateralAndRedeemReserveLiquidityInstruction } from "../models/instructions";
import { getObligations, getReserves, pushIfNotExists } from "../utils";
import { refreshReserves } from "./refreshReserves";
import { wrapSol } from './wrapSol';

export const withdraw = async (connection: Connection, publicKey: PublicKey, asset: string, withdrawAmount: number) => {
    const config: Config = await (await fetch("/api/markets")).json();

    let instructions;
    let signers;
    if (asset === "SOL" || asset === "WSOL") {
        ({ instructions, signers } = await wrapSol(connection, publicKey, 0));
    } else {
        instructions = [];
        signers = undefined;
    }

    const assetConfig = findWhere(config.assets, { symbol: asset });
    const reserveConfig = findWhere(config.markets[0].reserves, { asset: asset });
    const oracleConfig = findWhere(config.oracles.assets, { asset: asset });

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

    const userCollateralAccount = await getAssociatedTokenAddress(new PublicKey(reserveConfig.collateralMintAddress), publicKey);
    const userLiquidityAccount = signers ? signers[0].publicKey : await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);

    const allReserves: any = await getReserves(connection, config, config.markets[0].address);
    const reserveParsed = find(allReserves, (r) => r!.pubkey.toString() === reserveConfig.address)!.data;

    const [authority] = await PublicKey.findProgramAddress(
        [new PublicKey(config.markets[0].address).toBuffer()],
        new PublicKey(config.programID)
    );

    instructions.push(refreshObligationInstruction(
        userObligation.pubkey,
        new PublicKey(config.programID),
        userDepositedReserves,
        userBorrowedReserves,
    ))

    const totalBorrowWads = reserveParsed.liquidity.borrowedAmountWads;
    const totalLiquidityWads = (new BigNumber(reserveParsed.liquidity.availableAmount));
    const totalDepositWads = totalBorrowWads.plus(totalLiquidityWads);
    const cTokenExchangeRate = totalDepositWads.dividedBy(new BigNumber(reserveParsed.collateral.mintTotalSupply));
    const withdrawCollateralAmount = Number((new BigNumber(Math.floor(withdrawAmount * 10 ** assetConfig.decimals)))
        .dividedBy(cTokenExchangeRate)
        .integerValue(BigNumber.ROUND_FLOOR).toString())

    instructions.push(withdrawObligationCollateralAndRedeemReserveLiquidityInstruction(
        withdrawCollateralAmount,
        new PublicKey(config.programID),
        new PublicKey(reserveConfig.collateralSupplyAddress),
        userCollateralAccount,
        new PublicKey(reserveConfig.address),
        userObligation.pubkey,
        new PublicKey(config.markets[0].address),
        authority,
        userLiquidityAccount,
        new PublicKey(reserveConfig.collateralMintAddress),
        new PublicKey(reserveConfig.liquidityAddress),
        publicKey,
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