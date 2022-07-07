import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Card, Grid, Typography } from '@mui/material'
import { useState, useEffect } from 'react';
import { PublicKey } from "@solana/web3.js";
import { getTokensOracleData } from "../../actions/pyth";
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { findWhere, find } from 'underscore';
import { getReserves } from '../../utils';

const UserWalletAssets = () => {
    const [totalAssets, setTotalAssets] = useState("-");
    const [borrowingPower, setBorrowingPower] = useState("-");

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            getTotalAssets(publicKey);
        }
    }, [publicKey])

    const getTotalAssets = async (publicKey: PublicKey) => {
        const config = await (await fetch('http://localhost:3001/api/markets')).json();
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves = await getReserves(connection, config, config.markets[0].address);

        let totalAssetsValue: number = 0;
        let totalBorrowingPower: number = 0;

        for (const asset of config.assets) {
            const tokenAddress = await getAssociatedTokenAddress(new PublicKey(asset.mintAddress), publicKey);
            if (tokenAddress) {
                let tokenAssets = await connection.getTokenAccountBalance(tokenAddress);
                const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });
                const reserve = findWhere(config.markets[0].reserves, { asset: asset.symbol });

                const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

                let tokenValue = tokenAssets.value.uiAmount! * tokenOracle.price;

                totalAssetsValue += tokenValue;
                totalBorrowingPower += tokenValue * (1 - reserveConfig.config.loanToValueRatio / 100);
            }
        }

        setTotalAssets(totalAssetsValue.toFixed(2).toString());
        setBorrowingPower(totalBorrowingPower.toFixed(2).toString());
    }

    return (
        <Card>
            <Grid container spacing={1} padding={2}>
                <Grid item xs={12}>
                    <Typography variant='h6'>
                        My wallet assets (whitelisted assets)
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        Total Assets:
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        Total Borrowing Power:
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        ${totalAssets}
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        ${borrowingPower}
                    </Typography>
                </Grid>

            </Grid>
        </Card>
    );
}

export default UserWalletAssets;