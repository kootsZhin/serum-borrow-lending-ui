import { Grid, Typography, Card, CardContent, CardActionArea, Stack } from "@mui/material"
import { useState, useEffect } from "react";
import { ActionsPanel } from "./ActionsPanel";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { findWhere, find } from "underscore";
import { PublicKey } from "@solana/web3.js";
import { getTokensOracleData } from "../../pyth";
import { getAssociatedTokenAddress, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } from '@solana/spl-token';
import { getReserves, getObligations } from '../../utils';
import { BASEURI } from '../../constants';

const SingleMarketMetrics = ({ market }: { market: string }) => {

    // Dialog for actions
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    // Get the market data
    const [totalDeposit, setTotalDeposit] = useState("");
    const [totalDepositValue, setTotalDepositValue] = useState("");
    const [totalBorrow, setTotalBorrow] = useState("");
    const [totalBorrowValue, setTotalBorrowValue] = useState("");
    const [totalAvailable, setTotalAvailable] = useState("");
    const [totalAvailableValue, setTotalAvailableValue] = useState("");
    const [depositAPR, setdepositAPR] = useState("");
    const [borrowAPR, setborrowAPR] = useState("");
    const [userDeposited, setUserDeposited] = useState("");
    const [userDepositedValue, setUserDepositedValue] = useState("");
    const [userBorrowed, setUserBorrowed] = useState("");
    const [userBorrowedValue, setUserBorrowedValue] = useState("");
    const [userBalance, setUserBalance] = useState("");
    const [userBalanceValue, setUserBalanceValue] = useState("");

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            getReserveMetrics(publicKey);
        }
    }, [publicKey])

    const getReserveMetrics = async (publicKey: PublicKey) => {
        const config = await (await fetch(`${BASEURI}/api/markets`)).json();
        const asset = findWhere(config.assets, { symbol: market });
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves: any = await getReserves(connection, config, config.markets[0].address);

        const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });
        const reserve = findWhere(config.markets[0].reserves, { asset: asset.symbol });
        const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

        const availableAmount = Number(reserveConfig.liquidity.availableAmount.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
        const totalBorrowedAmount = Number(reserveConfig.liquidity.borrowedAmountWads.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
        const totalDeposit = availableAmount + totalBorrowedAmount;

        const availableAmountValue = availableAmount * tokenOracle.price
        const totalBorrowedAmountValue = totalBorrowedAmount * tokenOracle.price
        const totalDepositValue = availableAmountValue + totalBorrowedAmountValue;

        const currentUtilization = (totalBorrow ? totalBorrowedAmount / totalDeposit : 0)
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

        const tokenAddress = await getAssociatedTokenAddress(new PublicKey(asset.mintAddress), publicKey);
        let tokenAssetsBalance = 0;
        try {
            tokenAssetsBalance = await (await connection.getTokenAccountBalance(tokenAddress)).value.uiAmount;
        } catch (error: unknown) {
            tokenAssetsBalance = 0;
        }

        const allObligation = await getObligations(connection, config, config.markets[0].address);

        let depositedBalance = 0;
        let depositedBalanceValue = 0;
        let borrowedBalance = 0;
        let borrowedBalanceValue = 0;
        const userObligation = find(allObligation, (r) => r!.data.owner.toString() === publicKey.toString());
        if (userObligation) {
            const userDeposit = find(userObligation.data.deposits, (r) => r!.depositReserve.toString() === reserve.address);
            const userBorrow = find(userObligation.data.borrows, (r) => r!.borrowReserve.toString() === reserve.address);
            const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });

            depositedBalance = userDeposit ? Number(userDeposit.depositedAmount.toString()) / 10 ** reserveConfig.liquidity.mintDecimals : 0;
            depositedBalanceValue = depositedBalance * tokenOracle.price;

            borrowedBalance = userDeposit ? Number(userBorrow.borrowedAmountWads.toString()) / 10 ** reserveConfig.liquidity.mintDecimals : 0;
            borrowedBalanceValue = borrowedBalance * tokenOracle.price;
        }

        setTotalDeposit(availableAmount.toFixed(2).toString());
        setTotalDepositValue(availableAmountValue.toFixed(2).toString());

        setTotalBorrow(totalBorrowedAmount.toFixed(2).toString());
        setTotalBorrowValue(totalBorrowedAmountValue.toFixed(2).toString());

        setTotalAvailable(totalDeposit.toFixed(2).toString());
        setTotalAvailableValue(totalDepositValue.toFixed(2).toString());

        setborrowAPR((borrowAPR * 100).toFixed(2).toString());
        setdepositAPR((depositAPR * 100).toFixed(2).toString());

        setUserBalance(tokenAssetsBalance.toFixed(2).toString());
        setUserBalanceValue((tokenAssetsBalance * tokenOracle.price)!.toFixed(2).toString());

        setUserDeposited(depositedBalance.toFixed(2).toString());
        setUserDepositedValue(depositedBalanceValue.toFixed(2).toString());

        setUserBorrowed(borrowedBalance.toFixed(2).toString());
        setUserBorrowedValue(borrowedBalanceValue.toFixed(2).toString());
    }


    return (
        <Card >
            <CardActionArea onClick={handleClickOpen}>
                <CardContent>
                    <Grid container columns={9}>
                        <Grid item xs={1}>
                            <Typography variant="body2">{market}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Stack>
                                <Typography variant="body2">{totalDeposit ? `${totalDeposit}` : "-"}</Typography>
                                <Typography variant="body2">{totalDeposit ? `($${totalDepositValue})` : "-"}</Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={1}>
                            <Stack>
                                <Typography variant="body2">{totalBorrow ? `${totalBorrow}` : "-"}</Typography>
                                <Typography variant="body2">{totalBorrow ? `($${totalBorrowValue})` : "-"}</Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={1}>
                            <Stack>
                                <Typography variant="body2">{totalAvailable ? `${totalAvailable}` : "-"}</Typography>
                                <Typography variant="body2">{totalAvailable ? `($${totalAvailableValue})` : "-"}</Typography>
                            </Stack>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{depositAPR ? `${depositAPR}%` : "-"}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{borrowAPR ? `${borrowAPR}%` : "-"}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{userDeposited ? `${userDeposited}` : "-"}</Typography>
                            <Typography variant="body2">{userDeposited ? `($${userDepositedValue})` : "-"}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{userBorrowed ? `${userBorrowed}` : "-"}</Typography>
                            <Typography variant="body2">{userBorrowed ? `($${userBorrowedValue})` : "-"}</Typography>
                        </Grid>

                        <Grid item xs={1}>
                            <Stack>
                                <Typography variant="body2">{userBalance ? `${userBalance}` : "-"}</Typography>
                                <Typography variant="body2">{userBalance ? `($${userBalanceValue})` : "-"}</Typography>
                            </Stack>
                        </Grid>
                    </Grid>
                </CardContent>
            </CardActionArea>
            <ActionsPanel
                open={open}
                market={market}
                onClose={handleClose}
            />
        </Card >
    )
}

export default SingleMarketMetrics