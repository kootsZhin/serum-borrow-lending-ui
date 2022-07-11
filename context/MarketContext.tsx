import { Connection, clusterApiUrl } from "@solana/web3.js";
import { createContext, useState, useEffect } from "react";
import { findWhere, find } from "underscore";

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
    depositAPR: number,
    borrowAPR: number,
    ltv: number,
}

interface MarketInterface {
    overview: {
        totalSupply: number,
        totalBorrows: number,
        tvl: number,
        assetsCount: number,
    },
    pools: PoolsInterface[],
}

export const MarketContext = createContext<MarketInterface | undefined>(undefined);

const getMarketStats: () => Promise<MarketInterface> = async () => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
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

        let borrowAPR = 0;
        if (optimalUtilization === 1.0 || currentUtilization < optimalUtilization) {
            const normalizedFactor = currentUtilization / optimalUtilization;
            const optimalBorrowRate = reserveConfig.config.optimalBorrowRate / 100;
            const minBorrowRate = reserveConfig.config.minBorrowRate / 100;
            borrowAPR =
                normalizedFactor * (optimalBorrowRate - minBorrowRate) + minBorrowRate;
        } else {
            const normalizedFactor =
                (currentUtilization - optimalUtilization) / (1 - optimalUtilization);
            const optimalBorrowRate = reserveConfig.config.optimalBorrowRate / 100;
            const maxBorrowRate = reserveConfig.config.maxBorrowRate / 100;
            borrowAPR =
                normalizedFactor * (maxBorrowRate - optimalBorrowRate) +
                optimalBorrowRate;
        }

        const depositAPR = borrowAPR * currentUtilization;

        const loanToValue = reserveConfig.config.loanToValueRatio;

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
            depositAPR: depositAPR,
            borrowAPR: borrowAPR,
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

export default function MarketProvider({ children }) {
    const [marketStats, setMarketStats] = useState(undefined);

    useEffect(() => {
        fetchMarketStats();
        const interval = setInterval(fetchMarketStats, 5000);

        return () => clearInterval(interval);
    }, []);

    const fetchMarketStats = async () => {
        const marketStats = await getMarketStats();
        setMarketStats(marketStats);
    }

    return (
        <MarketContext.Provider value={marketStats}>
            {children}
        </MarketContext.Provider>
    )
}