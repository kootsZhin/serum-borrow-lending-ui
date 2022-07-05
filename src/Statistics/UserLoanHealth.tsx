import { Card, Grid, Typography } from '@mui/material'

function getHealthReserve() {
    return 0;
}

const UserLoanHealth = () => {
    return (
        <Card>
            <Grid container spacing={1} padding={2}>
                <Grid item xs={12}>
                    <Typography variant='h6'>
                        My loan health
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2">
                        Health Reserve: {getHealthReserve()}
                    </Typography>
                </Grid>
            </Grid>
        </Card>
    );
}

export default UserLoanHealth;