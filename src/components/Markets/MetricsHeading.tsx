import { Grid, Typography, Card, CardContent } from "@mui/material"

const MetricsHeading = () => {
    return (
        <Card>
            <CardContent>
                <Grid container columns={9}>
                    <Grid item xs={1}>
                        <Typography variant="body1">Token</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">Total deposit</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">Total borrow</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">Total available</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">Deposit APR</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">Borrow APR</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">My deposited</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">My borrowed</Typography>
                    </Grid>
                    <Grid item xs={1}>
                        <Typography variant="body1">My balance</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default MetricsHeading