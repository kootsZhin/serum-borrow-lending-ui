import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'

const AllMarkets = () => {
    return (
        <Grid item xs={12}>
            <Stack spacing={2}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="h2">All Markets</Typography>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Stack spacing={2}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="h2">BTC</Typography>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="h2">ETH</Typography>
                                </CardContent>
                            </Card>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Grid>
    )
}

export default AllMarkets