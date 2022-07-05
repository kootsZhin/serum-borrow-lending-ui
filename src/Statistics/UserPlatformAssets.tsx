import { Card, Grid, Typography } from '@mui/material'

function getDeposited() {
    return 0;
}

function getBorrowed() {
    return 0;
}

const UserPlatformAssets = () => {
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
                        Deposited: {getDeposited()}
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        Borrowed: {getBorrowed()}
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    );
}

export default UserPlatformAssets;