import { Grid, Typography, Card, CardContent, CardActionArea, Stack } from "@mui/material"
import { useState, useEffect } from "react";
import { ActionsDialog } from "./ActionsDialog";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { findWhere, find } from "underscore";
import { PublicKey } from "@solana/web3.js";
import { getTokensOracleData } from "../../actions/pyth";
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { getReserves } from '../../utils';
import { ConnectedTvOutlined } from "@mui/icons-material";

function getdepositAPR(market: string) {
    return 0;
}
function getborrowAPR(market: string) {
    return 0;
}
function getUserDeposited(market: string) {
    return 0;
}
function getUserBorrowed(market: string) {
    return 0;
}

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
    const [userBalance, setUserBalance] = useState("");
    const [userBalanceValue, setUserBalanceValue] = useState("");

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            getUserMetrics(publicKey);
        }
    }, [publicKey])

    const getUserMetrics = async (publicKey: PublicKey) => {
        const config = await (await fetch('http://localhost:3001/api/markets')).json();
        const asset = findWhere(config.assets, { symbol: market });
        const tokenAddress = await getAssociatedTokenAddress(new PublicKey(asset.mintAddress), publicKey);
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves = await getReserves(connection, config, config.markets[0].address);

        if (tokenAddress) {
            let tokenAssets = await connection.getTokenAccountBalance(tokenAddress);
            const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });
            const reserve = findWhere(config.markets[0].reserves, { asset: asset.symbol });
            const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

            const availableAmount = Number(reserveConfig.liquidity.availableAmount.toString()) / (10 ** asset.decimals);
            const totalBorrowedAmount = Number(reserveConfig.liquidity.borrowedAmountWads.toString()) / (10 ** asset.decimals);
            const totalDeposit = availableAmount + totalBorrowedAmount;

            const availableAmountValue = availableAmount * tokenOracle.price
            const totalBorrowedAmountValue = totalBorrowedAmount * tokenOracle.price
            const totalDepositValue = availableAmountValue + totalBorrowedAmountValue;

            const currentUtilization = (totalBorrow ? totalBorrowedAmount / totalDeposit : 0)
            const optimalUtilization = (reserveConfig.config.optimalUtilizationRate / 100)

            let borrowAPR: number;
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

            setTotalDeposit(availableAmount.toFixed(2).toString());
            setTotalDepositValue(availableAmountValue.toFixed(2).toString());

            setTotalBorrow(totalBorrowedAmount.toFixed(2).toString());
            setTotalBorrowValue(totalBorrowedAmountValue.toFixed(2).toString());

            setTotalAvailable(totalDeposit.toFixed(2).toString());
            setTotalAvailableValue(totalDepositValue.toFixed(2).toString());

            setborrowAPR((borrowAPR * 100).toString());
            setdepositAPR((depositAPR * 100).toString());

            setUserBalance(tokenAssets.value.uiAmount!.toFixed(2).toString());
            setUserBalanceValue((tokenAssets.value.uiAmount! * tokenOracle.price)!.toFixed(2).toString());
        }
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
                            <Typography variant="body2">{getUserDeposited(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getUserBorrowed(market)}</Typography>
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
            <ActionsDialog
                open={open}
                market={market}
                onClose={handleClose}
            />
        </Card >
    )
}

export default SingleMarketMetrics