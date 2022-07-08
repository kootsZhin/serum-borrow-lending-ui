import { Connection } from '@solana/web3.js';
import { PublicKey } from "@solana/web3.js";
import { findWhere, find } from 'underscore';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError
} from '@solana/spl-token';

import { refreshReserveInstruction, refreshObligationInstruction, borrowObligationLiquidityInstruction } from '../models/instructions';
import { getObligations } from '../utils';
import { getReserves } from '../utils';
import { Config } from '../global';
import { refreshReserves } from './refreshReserves';

export const borrow = async (connection: Connection, publicKey: PublicKey, asset: string, withdrawAmount: number) => {
    const config: Config = await (await fetch("/api/markets")).json();
    const instructions = [];

    const assetConfig = findWhere(config.assets, { symbol: asset });
    const reserveConfig = findWhere(config.markets[0].reserves, { asset: asset });
    const oracleConfig = findWhere(config.oracles.assets, { asset: asset });

    const allObligation = await getObligations(connection, config, config.markets[0].address);
    const userObligation = find(allObligation, (r) => r!.data.owner.toString() === publicKey.toString());

    let userDepositedReserves: PublicKey[] = [];
    let userBorrowedReserves: PublicKey[] = [];
    if (userObligation) {
        userObligation.data.deposits.forEach((deposit) => { userDepositedReserves.push(deposit.depositReserve) });
        userObligation.data.borrows.forEach((borrow) => { userBorrowedReserves.push(borrow.borrowReserve) });
    }

    const userLiquidityAccount = await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);
    try {
        await getAccount(connection, userLiquidityAccount);
    } catch (error: unknown) {
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
            instructions.push(createAssociatedTokenAccountInstruction(
                publicKey,
                userLiquidityAccount,
                publicKey,
                new PublicKey(assetConfig.mintAddress)
            ));
        }
    }

    const [authority] = await PublicKey.findProgramAddress(
        [new PublicKey(config.markets[0].address).toBuffer()],
        new PublicKey(config.programID)
    );

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

    instructions.push(borrowObligationLiquidityInstruction(
        withdrawAmount * 10 ** assetConfig.decimals,
        new PublicKey(config.programID),
        new PublicKey(reserveConfig.liquidityAddress),
        userLiquidityAccount,
        new PublicKey(reserveConfig.address),
        new PublicKey(reserveConfig.liquidityFeeReceiverAddress),
        userObligation.pubkey,
        new PublicKey(config.markets[0].address),
        authority,
        publicKey
    ))

    return instructions;
}