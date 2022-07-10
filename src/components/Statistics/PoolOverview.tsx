import { Card, Grid, Typography } from '@mui/material'
import { useContext } from 'react';
import { MarketContext } from "../../../context/MarketContext";

const PoolOverview = () => {
    const marketStats = useContext(MarketContext);

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
                        ${marketStats.overview.totalSupply}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        ${marketStats.overview.totalBorrows}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        ${marketStats.overview.tvl}
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">
                        {marketStats.overview.assetsCount}
                    </Typography>
                </Grid>

            </Grid>
        </Card>
    );
}

export default PoolOverview;