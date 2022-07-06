import { Grid, Typography, Card, CardContent, CardActionArea } from "@mui/material"
import { useState } from "react";
import { ActionsDialog } from "./ActionsDialog";

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

    return (
        <Card>
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
                            <Typography variant="body2">{getUserBalance(market)}</Typography>
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