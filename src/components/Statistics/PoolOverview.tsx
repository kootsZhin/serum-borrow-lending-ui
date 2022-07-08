import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Card, Grid, Typography } from '@mui/material'
import { useState, useEffect } from 'react';
import { getTokensOracleData } from "../../pyth";
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { findWhere, find } from 'underscore';
import { getReserves } from '../../utils';
import { BASEURI } from '../../constants';
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { assert } from "console";

const PoolOverview = () => {
    const [totalDepositValue, setTotalDepositValue] = useState(0);
    const [totalBorrowValue, setTotalBorrowValue] = useState(0);
    const [totalAvailableValue, setTotalAvailableValue] = useState(0);
    const [assetCount, setAssetCount] = useState(0);

    useEffect(() => {
        getPoolMetrics();
    }, [])

    const getPoolMetrics = async () => {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        const config = await (await fetch(`${BASEURI}/api/markets`)).json();

        let totalDepositValue = 0;
        let totalBorrowValue = 0;
        let totalAvailableValue = 0;
        let assetCount = 0;
        for (const asset of config.assets) {
            const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
            const allReserves: any = await getReserves(connection, config, config.markets[0].address);
            const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });
            const reserve = findWhere(config.markets[0].reserves, { asset: asset.symbol });
            const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

            const availableAmount = Number(reserveConfig.liquidity.availableAmount.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
            const totalBorrowedAmount = Number(reserveConfig.liquidity.borrowedAmountWads.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
            const totalDeposit = availableAmount + totalBorrowedAmount;

            totalDepositValue += totalDeposit * tokenOracle.price
            totalBorrowValue += totalBorrowedAmount * tokenOracle.price
            totalAvailableValue += availableAmount * tokenOracle.price;
            assetCount++;
        }

        setTotalDepositValue(totalDepositValue);
        setTotalBorrowValue(totalBorrowValue);
        setTotalAvailableValue(totalAvailableValue);
        setAssetCount(assetCount);
    }

    return (
        <Card>
            <Grid container spacing={1} padding={2}>
                <Grid item xs={12}>
                    <Typography variant='h6'>
                        Pool Overview
                    </Typography>
                </Grid>

                <Grid item xs={3}>
                    <Typography variant="body2">
                        Total Supply
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        Total Borrow
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        TVL
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        Assets
                    </Typography>
                </Grid>

                <Grid item xs={3}>
                    <Typography variant="body2">
                        ${totalDepositValue.toFixed(2)}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        ${totalBorrowValue.toFixed(2)}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        ${totalAvailableValue.toFixed(2)}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        {assetCount}
                    </Typography>
                </Grid>

            </Grid>
        </Card>
    );
}

export default PoolOverview;