import { Card, Grid, Typography } from '@mui/material'
import { useContext } from 'react';

import { UserContext } from '../../../context/UserContext';
import { DataContext } from '../../../context';

const UserPlatformAssets = () => {

    const data = useContext(DataContext);

    let userStats;
    try {
        userStats = data.user;
    } catch (e) {
        userStats = undefined;
    }

    return (
        <Card sx={{ width: '100%', overflow: 'hidden' }}>
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
                        Borrowing Power:
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        {
                            userStats ?
                                `$${userStats.platform.deposited.toFixed(2)}` :
                                "-"
                        }
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        {
                            userStats ?
                                `$${userStats.platform.borrowed.toFixed(2)}` :
                                "-"
                        }
                    </Typography>
                </Grid>

                <Grid item xs={4}>
                    <Typography variant="body2">
                        {
                            userStats ?
                                `$${userStats.platform.borrowingPower.toFixed(2)}` :
                                "-"
                        }
                    </Typography>
                </Grid>

            </Grid>
        </Card>
    );
}

export default UserPlatformAssets;