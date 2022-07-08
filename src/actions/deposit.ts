import { Connection, SystemProgram } from '@solana/web3.js';
import { PublicKey } from "@solana/web3.js";
import { findWhere } from "underscore";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError
} from '@solana/spl-token';

import { initObligationInstruction, depositReserveLiquidityAndObligationCollateralInstruction } from "../models/instructions"
import { OBLIGATION_SIZE } from "../models";
import { BASEURI } from "../constants";

export const deposit = async (connection: Connection, publicKey: PublicKey, asset: string, depositAmount: number) => {
    const config = await (await fetch(`${BASEURI}/api/markets`)).json();
    const instructions = [];

    const assetConfig = findWhere(config.assets, { symbol: asset });
    const reserveConfig = findWhere(config.markets[0].reserves, { asset: asset });
    const oracleConfig = findWhere(config.oracles.assets, { asset: asset });

    // Get or create the token account for collateral token
    const sourceCollateral = await getAssociatedTokenAddress(new PublicKey(reserveConfig!.collateralMintAddress), publicKey);
    try {
        await getAccount(connection, sourceCollateral);
    } catch (error: unknown) {
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
            instructions.push(createAssociatedTokenAccountInstruction(
                publicKey,
                sourceCollateral,
                publicKey,
                new PublicKey(reserveConfig!.collateralMintAddress)
            ));
        }
    }

    const [authority] = await PublicKey.findProgramAddress(
        [new PublicKey(config.markets[0].address).toBuffer()],
        new PublicKey(config.programID)
    );

    const sourceLiquidity = await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);

    // Get or create the obligation account
    const seed = config.markets[0].address.slice(0, 32);
    const obligationAccount = await PublicKey.createWithSeed(publicKey, seed, new PublicKey(config.programID));
    if (!(await connection.getAccountInfo(obligationAccount))) {
        instructions.push(SystemProgram.createAccountWithSeed(
            {
                fromPubkey: publicKey,
                newAccountPubkey: obligationAccount,
                basePubkey: publicKey,
                seed: seed,
                lamports: (await connection.getMinimumBalanceForRentExemption(OBLIGATION_SIZE)),
                space: OBLIGATION_SIZE,
                programId: new PublicKey(config.programID),
            }
        ));

        instructions.push(initObligationInstruction(
            obligationAccount,
            new PublicKey(config.programID),
            new PublicKey(config.markets[0].address),
            publicKey
        ))
    }

    // Deposit Reserve Liquidity and Obligation Collateral
    instructions.push(depositReserveLiquidityAndObligationCollateralInstruction(
        depositAmount * 10 ** assetConfig.decimals,
        new PublicKey(config.programID),
        sourceLiquidity,
        sourceCollateral,
        new PublicKey(reserveConfig!.address),
        new PublicKey(reserveConfig!.liquidityAddress),
        new PublicKey(reserveConfig!.collateralMintAddress),
        new PublicKey(config.markets[0].address),
        authority,
        new PublicKey(reserveConfig!.collateralSupplyAddress),
        obligationAccount,
        publicKey,
        new PublicKey(oracleConfig.priceAddress),
        publicKey
    ));

    return instructions;
}