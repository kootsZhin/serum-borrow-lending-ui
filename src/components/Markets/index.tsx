import { Card, CardContent, Stack, Typography } from '@mui/material'
import MetricsHeading from './MetricsHeading'
import SingleMarketMetrics from './SingleMarketMetrics'
import { useState, useEffect } from 'react'
import { BASEURI } from '../../constants'

const Markets = () => {
    const [markets, setMarkets] = useState([]);

    useEffect(() => {
        if (markets.length === 0) {
            getMarkets();
        }
    }, []);

    async function getMarkets() {

        const res = await fetch(`${BASEURI}/api/markets`);
        const config = await res.json()

        let markets: any = [];
        for (const reserve of config.markets[0].reserves) {
            markets.push(reserve.asset)
        }

        setMarkets(markets);
    }

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Typography variant='h6'>All Markets</Typography>
                    <MetricsHeading />
                    {
                        markets.map((market) => (
                            <SingleMarketMetrics market={market} key={market} />
                        ))
                    }
                </Stack>
            </CardContent>
        </Card>
    )
}

export default Markets