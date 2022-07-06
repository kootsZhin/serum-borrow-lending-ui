import { Card, CardContent, Stack, Typography } from '@mui/material'
import MetricsHeading from './MetricsHeading'
import SingleMarketMetrics from './SingleMarketMetrics'
import { useState, useEffect } from 'react'


const Markets = () => {
    const [markets, setMarkets] = useState([]);

    useEffect(() => {
        console.log('useEffect')
        if (markets.length === 0) {
            console.log('Loading markets...');
            getMarkets();
        }
    }, []);

    async function getMarkets() {

        const res = await fetch('http://localhost:3001/api/markets');
        const config = await res.json()


        let markets: any = [];

        for (const reserve of config.markets[0].reserves) {
            markets.push(reserve.asset)
        }
        console.log("markets", markets)
        setMarkets(markets);
    }

    return (
        <Card>
            <CardContent>
                <Typography variant='h6'>All Markets</Typography>
                <Stack spacing={2}>
                    <MetricsHeading />
                    {
                        markets.map((market) => (
                            <SingleMarketMetrics market={market} />
                        ))
                    }
                </Stack>
            </CardContent>
        </Card>
    )
}

export default Markets