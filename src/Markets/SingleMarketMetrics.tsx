import { Grid, Typography, Card, CardContent, CardActionArea } from "@mui/material"
import { ActionPanel } from "./ActionsPanel"
import { useState } from "react";

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
    return (
        <Card>
            <CardActionArea>
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
                            <Typography variant="body2">{getUserBalance(market)}</Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </CardActionArea>
        </Card >
    )
}

export default SingleMarketMetrics