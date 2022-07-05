import { Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import MetricsHeading from './MetricsHeading'
import SingleMarketMetrics from './SingleMarketMetrics'

function getMarkets() {
    return ["SOL", "USDC"];
}

const Markets = () => {
    return (
        <Card>
            <CardContent>
                <Typography variant='h6'>All Markets</Typography>
                <Stack spacing={2}>
                    <MetricsHeading />
                    {
                        getMarkets().map((market) => (
                            <SingleMarketMetrics market={market} />
                        ))
                    }
                </Stack>
            </CardContent>
        </Card>
    )
}

export default Markets