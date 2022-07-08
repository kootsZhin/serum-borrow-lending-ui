import { Card, Grid, Typography } from '@mui/material'
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { getReserves, getObligations } from '../../utils';
import { getTokensOracleData } from "../../pyth";
import { findWhere, find } from 'underscore';
import { BASEURI } from '../../constants';

const UserPlatformAssets = () => {
    const [deposited, setDeposited] = useState("-");
    const [borrowed, setBorrowed] = useState("-");

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            getUserMetrics(publicKey);
        }
    }, [publicKey])

    const getUserMetrics = async (publicKey: PublicKey) => {
        const config = await (await fetch(`${BASEURI}/api/markets`)).json();
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves: any = await getReserves(connection, config, config.markets[0].address);
        const allObligation = await getObligations(connection, config, config.markets[0].address);

        const userObligation = find(allObligation, (r) => r!.data.owner.toBase58() === publicKey.toBase58());

        let userDepositedValue = 0;
        let userBorrowedValue = 0;
        if (userObligation) {

            for (const reserve of allReserves) {
                const userDepositedToken = find(userObligation.data.deposits, (r) => r!.depositReserve.toBase58() === reserve.pubkey.toBase58());
                const userDepositedTokenBalance = userDepositedToken ? Number(userDepositedToken.depositedAmount.toString()) / 10 ** reserve.data.liquidity.mintDecimals : 0;
                const tokenOracle = findWhere(tokensOracle, { reserveAddress: reserve.pubkey.toBase58() });
                const userDepositedTokenBalanceValue = userDepositedTokenBalance * tokenOracle.price;

                const userBorrowedToken = find(userObligation.data.borrows, (r) => r!.borrowReserve.toBase58() === reserve.pubkey.toBase58());
                const userBorrowedTokenBalance = userBorrowedToken ? Number(userBorrowedToken.borrowedAmountWads.toString()) / 10 ** reserve.data.liquidity.mintDecimals : 0;
                const userBorrowedTokenBalanceValue = userBorrowedTokenBalance * tokenOracle.price;

                userDepositedValue += userDepositedTokenBalanceValue;
                userBorrowedValue += userBorrowedTokenBalanceValue;
            }
        }

        setDeposited(userDepositedValue.toFixed(2));
        setBorrowed(userBorrowedValue.toFixed(2));
    }

    return (
        <Card>
            <Grid container spacing={1} padding={2}>
                <Grid item xs={12}>
                    <Typography variant='h6'>
                        My platform assets
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        Deposited:
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        Borrowed:
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        ${deposited}
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        ${borrowed}
                    </Typography>
                </Grid>

            </Grid>
        </Card>
    );
}

export default UserPlatformAssets;