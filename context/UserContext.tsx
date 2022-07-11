import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { createContext, useState, useEffect } from "react";
import { findWhere, find } from 'underscore';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { Config } from "../src/global";

import { getTokensOracleData } from "../src/pyth";
import { getReserves, getObligations } from "../src/utils";
import { WRAPPED_SOL_MINT } from "../src/constants";
import { CONTEXT_UPDATE_INTERVAL } from "../src/constants";

interface UserPoolInterface {
    symbol: string,
    name: string,
    price: number,
    deposited: number,
    depositedValue: number,
    borrowed: number,
    borrowedValue: number,
    balance: number,
    balanceValue: number,
}

export interface UserInterface {
    platform: {
        deposited: number,
        borrowed: number,
        borrowingPower: number,
        remainingBorrowingPower: number,
        positionCount: number,
    },
    pools: UserPoolInterface[]
}

export const UserContext = createContext<UserInterface | undefined>(undefined);

export const getUserStats = async (publicKey) => {
    const connection = new Connection(clusterApiUrl("devnet"));
    const config: Config = await (await fetch("/api/markets")).json();
    const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
    const allReserves: any = await getReserves(connection, config, config.markets[0].address);
    const allObligation = await getObligations(connection, config, config.markets[0].address);

    const userObligation = find(allObligation, (r) => r!.data.owner.toBase58() === publicKey.toBase58());
    const pools = [];

    let userDepositedValue = 0;
    let userBorrowedValue = 0;
    let userBorrowingPower = 0;

    if (userObligation) {
        for (const reserve of allReserves) {
            const assetConfig = findWhere(config.assets, { mintAddress: reserve.data.liquidity.mintPubkey.toString() });
            const userDepositedToken = find(userObligation.data.deposits, (r) => r!.depositReserve.toBase58() === reserve.pubkey.toBase58());
            const userDepositedTokenBalance = userDepositedToken ? Number(userDepositedToken.depositedAmount.toString()) / 10 ** reserve.data.liquidity.mintDecimals : 0;
            const tokenOracle = findWhere(tokensOracle, { reserveAddress: reserve.pubkey.toBase58() });
            const userDepositedTokenBalanceValue = userDepositedTokenBalance * tokenOracle.price;

            const userBorrowedToken = find(userObligation.data.borrows, (r) => r!.borrowReserve.toBase58() === reserve.pubkey.toBase58());
            const userBorrowedTokenBalance = userBorrowedToken ? Number(userBorrowedToken.borrowedAmountWads.toString()) / 10 ** reserve.data.liquidity.mintDecimals : 0;
            const userBorrowedTokenBalanceValue = userBorrowedTokenBalance * tokenOracle.price;

            const loanToValue = reserve.data.config.loanToValueRatio / 100;

            let tokenAssetsBalance = 0;
            if (!(reserve.data.liquidity.mintPubkey.toString() === WRAPPED_SOL_MINT.toString())) {
                const tokenAddress = await getAssociatedTokenAddress(reserve.data.liquidity.mintPubkey, publicKey);
                try {
                    tokenAssetsBalance = await (await connection.getTokenAccountBalance(tokenAddress)).value.uiAmount;
                } catch (error: unknown) {
                    tokenAssetsBalance = 0;
                }
            } else {
                tokenAssetsBalance = Number((await connection.getBalance(publicKey)).toString()) / LAMPORTS_PER_SOL;
            }

            userDepositedValue += userDepositedTokenBalanceValue;
            userBorrowedValue += userBorrowedTokenBalanceValue;

            userBorrowingPower += userDepositedTokenBalanceValue * loanToValue;

            pools.push({
                symbol: assetConfig.symbol,
                name: assetConfig.name,
                price: Number(tokenOracle.price.toString()),
                deposited: userDepositedTokenBalance,
                depositedValue: userDepositedTokenBalanceValue,
                borrowed: userBorrowedTokenBalance,
                borrowedValue: userBorrowedTokenBalanceValue,
                balance: tokenAssetsBalance,
                balanceValue: tokenAssetsBalance * tokenOracle.price,
            })
        }
    }

    return {
        platform: {
            deposited: userDepositedValue,
            borrowed: userBorrowedValue,
            borrowingPower: userBorrowingPower,
            remainingBorrowingPower: userBorrowingPower - userBorrowedValue,
            positionsCount: userObligation.data.deposits.length + userObligation.data.borrows.length,

        },
        pools: pools
    }
}