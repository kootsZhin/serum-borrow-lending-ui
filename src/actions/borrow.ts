import {
    createAssociatedTokenAccountInstruction,
    createCloseAccountInstruction,
    getAccount, getAssociatedTokenAddress, TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError
} from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { find, findWhere } from 'underscore';

import { Config } from '../global';
import { borrowObligationLiquidityInstruction, refreshObligationInstruction } from '../models/instructions';
import { getObligations, pushIfNotExists } from '../utils';
import { refreshReserves } from './refreshReserves';
import { wrapSol } from './wrapSol';

export const borrow = async (connection: Connection, publicKey: PublicKey, asset: string, withdrawAmount: number) => {
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

    const userLiquidityAccount = signers ? signers[0].publicKey : await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);
    try {
        await getAccount(connection, userLiquidityAccount);
    } catch (error: unknown) {
        if (!(asset === "SOL" || asset === "WSOL") && (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError)) {
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

    instructions.push(refreshObligationInstruction(
        userObligation.pubkey,
        new PublicKey(config.programID),
        userDepositedReserves,
        userBorrowedReserves,
    ))

    instructions.push(borrowObligationLiquidityInstruction(
        Math.floor(withdrawAmount * 10 ** assetConfig.decimals),
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

    if (signers) {
        instructions.push(createCloseAccountInstruction(
            signers[0].publicKey,
            publicKey,
            publicKey
        ));
    }

    return { instructions, signers };
}