import { Card, Grid, Typography } from '@mui/material'

function getTotalAssets() { //TODOs
    return 0;
}

function getBorrowingPower() {
    return 0;
}

const UserWalletAssets = () => {
    return (
        <Card>
            <Grid container spacing={1} padding={2}>
                <Grid item xs={12}>
                    <Typography variant='h6'>
                        My wallet assets
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        Total Assets: {getTotalAssets()}
                    </Typography>
                </Grid>

                <Grid item xs={6}>
                    <Typography variant="body2">
                        Borrowing Power: {getBorrowingPower()}
                    </Typography>
                </Grid>

            </Grid>
        </Card>
    );
}

export default UserWalletAssets;