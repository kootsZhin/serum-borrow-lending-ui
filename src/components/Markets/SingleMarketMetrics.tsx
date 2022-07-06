import { Grid, Typography, Card, CardContent, CardActionArea } from "@mui/material"
import { useState, useEffect } from "react";
import { ActionsDialog } from "./ActionsDialog";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { findWhere } from "underscore";
import { PublicKey } from "@solana/web3.js";
import { getTokensOracleData } from "../../actions/pyth";
import { getAssociatedTokenAddress } from '@solana/spl-token';

function getMarket(market: string) {
    return market;
}
function getTotalDeposit(market: string) {
    return 0;
}
function getTotalBorrow(market: string) {
    return 0;
}
function getTotalAvailable(market: string) {
    return 0;
}
function getDepositAPY(market: string) {
    return 0;
}
function getBorrowAPR(market: string) {
    return 0;
}
function getUserDeposited(market: string) {
    return 0;
}
function getUserBorrowed(market: string) {
    return 0;
}
function getUserBalance(market: string) {
    return 0;
}

const SingleMarketMetrics = ({ market }: { market: string }) => {
    const [open, setOpen] = useState(false);
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    const [userBalance, setUserBalance] = useState("-");
    const [userBalanceValue, setUserBalanceValue] = useState("-");

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

        if (tokenAddress) {
            let tokenAssets = await connection.getTokenAccountBalance(tokenAddress);
            const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });
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
                            <Typography variant="body2">{getMarket(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getTotalDeposit(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getTotalBorrow(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getTotalAvailable(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getDepositAPY(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getBorrowAPR(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getUserDeposited(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{getUserBorrowed(market)}</Typography>
                        </Grid>
                        <Grid item xs={1}>
                            <Typography variant="body2">{userBalance} (${userBalanceValue})</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </CardActionArea>
            <ActionsDialog
                open={open}
                market={getMarket(market)}
                onClose={handleClose}
            />
        </Card >
    )
}

export default SingleMarketMetrics