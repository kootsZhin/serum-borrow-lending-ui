import { createContext } from "react";
import { find, findWhere } from "underscore";

import { getTokensOracleData } from "../src/pyth";
import { getReserves } from "../src/utils";

interface PoolsInterface {
    symbol: string,
    name: string,
    price: number,
    totalDeposit: number,
    totalDepositValue: number,
    totalBorrow: number,
    totalBorrowValue: number,
    totalAvailable: number,
    totalAvailableValue: number,
    depositAPY: number,
    borrowAPY: number,
    ltv: number,
}

export interface MarketInterface {
    overview: {
        totalSupply: number,
        totalBorrows: number,
        tvl: number,
        assetsCount: number,
    },
    pools: PoolsInterface[],
}

export const MarketContext = createContext<MarketInterface | undefined>(undefined);

export const getMarketStats = async (connection) => {
    const config = await (await fetch("/api/markets")).json();

    let overallDepositValue = 0;
    let overallBorrowValue = 0;
    let overallAvailableValue = 0;
    let assetCount = 0;
    const pools = [];

    for (const asset of config.assets) {
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves: any = await getReserves(connection, config, config.markets[0].address);
        const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });

        const reserve = findWhere(config.markets[0].reserves, { asset: asset.symbol });
        const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

        const totalAvailable = Number(reserveConfig.liquidity.availableAmount.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
        const totalBorrow = Number(reserveConfig.liquidity.borrowedAmountWads.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
        const totalDeposit = totalAvailable + totalBorrow;

        const currentUtilization = (totalBorrow ? totalBorrow / totalDeposit : 0)
        const optimalUtilization = (reserveConfig.config.optimalUtilizationRate / 100)

        let borrowAPY = 0;
        if (optimalUtilization === 1.0 || currentUtilization < optimalUtilization) {
            const normalizedFactor = currentUtilization / optimalUtilization;
            const optimalBorrowRate = reserveConfig.config.optimalBorrowRate / 100;
            const minBorrowRate = reserveConfig.config.minBorrowRate / 100;
            borrowAPY =
                normalizedFactor * (optimalBorrowRate - minBorrowRate) + minBorrowRate;
        } else {
            const normalizedFactor =
                (currentUtilization - optimalUtilization) / (1 - optimalUtilization);
            const optimalBorrowRate = reserveConfig.config.optimalBorrowRate / 100;
            const maxBorrowRate = reserveConfig.config.maxBorrowRate / 100;
            borrowAPY =
                normalizedFactor * (maxBorrowRate - optimalBorrowRate) +
                optimalBorrowRate;
        }

        const depositAPY = borrowAPY * currentUtilization;

        const loanToValue = reserveConfig.config.loanToValueRatio / 100;

        pools.push({
            symbol: asset.symbol,
            name: asset.name,
            price: Number(tokenOracle.price.toString()),
            totalDeposit: totalDeposit,
            totalDepositValue: totalDeposit * tokenOracle.price,
            totalBorrow: totalBorrow,
            totalBorrowValue: totalBorrow * tokenOracle.price,
            totalAvailable: totalAvailable,
            totalAvailableValue: totalAvailable * tokenOracle.price,
            depositAPY: depositAPY,
            borrowAPY: borrowAPY,
            ltv: loanToValue,
        })

        overallDepositValue += totalDeposit * tokenOracle.price
        overallBorrowValue += totalBorrow * tokenOracle.price
        overallAvailableValue += totalAvailable * tokenOracle.price;
        assetCount++;
    }

    return {
        overview: {
            totalSupply: overallDepositValue,
            totalBorrows: overallBorrowValue,
            tvl: overallAvailableValue,
            assetsCount: assetCount,
        },
        pools: pools,
    }
}