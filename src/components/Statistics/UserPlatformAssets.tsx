import { Card, Grid, Typography } from '@mui/material'
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { getReserves } from '../../utils';
import { getTokensOracleData } from "../../actions/pyth";
import { findWhere } from 'underscore';

function getDeposited() {
    return 0;
}

function getBorrowed() {
    return 0;
}

const UserPlatformAssets = () => {
    const [deposited, setDeposited] = useState(0);
    const [borrowed, setBorrowed] = useState(0);
    const [loanHealth, setLoanHealth] = useState(100);

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            getUserMetrics(publicKey);
        }
    }, [publicKey])

    const getUserMetrics = async (publicKey: PublicKey) => {
        const config = await (await fetch('http://localhost:3001/api/markets')).json();
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves: any = await getReserves(connection, config, config.markets[0].address);

        let userDepositedValue = 0;
        for (const reserve of allReserves) {
            const totalAvailable = Number(reserve.data.liquidity.availableAmount) / 10 ** reserve.data.liquidity.mintDecimals;
            const totalBorrow = Number(reserve.data.liquidity.borrowedAmountWads) / 10 ** reserve.data.liquidity.mintDecimals;
            const totalDeposit = totalAvailable + totalBorrow;

            const tokenOracle = findWhere(tokensOracle, { reserveAddress: reserve.pubkey.toBase58() });
            console.log(tokenOracle);

            const collateralToken = await getAssociatedTokenAddress(reserve.data.collateral.mintPubkey, publicKey);
            let userCollateralBalance: number;
            try {
                userCollateralBalance = (await connection.getTokenAccountBalance(collateralToken)).value.uiAmount!;
            } catch (error: unknown) {
                userCollateralBalance = 0;
            }

            const totalCollateralSupply = await (await connection.getTokenSupply(reserve.data.collateral.mintPubkey)).value.uiAmount || 1;

            userDepositedValue += (totalDeposit * userCollateralBalance / totalCollateralSupply) * tokenOracle.price;
        }

        setDeposited(userDepositedValue.toFixed(2));
    }

    return (
        <Card>
            <Grid container spacing={1} padding={2}>
                <Grid item xs={12}>
                    <Typography variant='h6'>
                        My platform assets
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        Deposited:
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        Borrowed:
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        Loan Health:
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        ${deposited}
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        ${borrowed}
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        {loanHealth}%
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    );
}

export default UserPlatformAssets;