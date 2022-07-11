import { Card, Grid, Typography } from '@mui/material'
import { useContext } from 'react';
import { DataContext } from '../../../context';
import { MarketContext } from "../../../context/MarketContext";

const PoolOverview = () => {
    const data = useContext(DataContext);

    let marketStats;
    try {
        marketStats = data.market;
    } catch (e) {
        marketStats = undefined;
    }

    return (
        <Card sx={{ width: '100%', overflow: 'hidden' }}>
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
                        Asset(s)
                    </Typography>
                </Grid>

                <Grid item xs={3}>
                    <Typography variant="body2">{
                        marketStats ?
                            `$${marketStats.overview.totalSupply.toFixed(2)}` :
                            "-"
                    }
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">{
                        marketStats ?
                            `$${marketStats.overview.totalBorrows.toFixed(2)}` :
                            "-"
                    }
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">{
                        marketStats ?
                            `$${marketStats.overview.tvl.toFixed(2)}` :
                            "-"
                    }
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <Typography variant="body2">{
                        marketStats ?
                            `${marketStats.overview.assetsCount}` :
                            "-"
                    }
                    </Typography>
                </Grid>

            </Grid>
        </Card>
    );
}

export default PoolOverview;