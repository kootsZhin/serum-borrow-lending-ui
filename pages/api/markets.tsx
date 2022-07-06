// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Config } from '../../src/global'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Config>
) {
    res.status(200).json(
        {
            "programID": "8m2bMPEwnSDhwpZS1798vNbBq7AvoTtABhnh2MMgYqf1",
            "assets": [
                {
                    "name": "USD coin",
                    "symbol": "USDC",
                    "decimals": 6,
                    "mintAddress": "5YBF1PdGBuN9QQBjU3tx9bHXrKPsEFVr9ZCFWNAxo93m"
                },
                {
                    "name": "Wrapped SOL",
                    "symbol": "SOL",
                    "decimals": 9,
                    "mintAddress": "So11111111111111111111111111111111111111112",
                }
            ],
            "markets": [
                {
                    "name": "main",
                    "address": "Fyr8sJhQEZuEwpwioui3R73KmDppokzKFENGFmHW5632",
                    "authorityAddress": "",
                    "reserves": [
                        {
                            "asset": "USDC",
                            "address": "5we5bNhXks97uRZzcK2FvLjLuUnYnCNb9kC4Vh4d78Vq",
                            "collateralMintAddress": "8YZZ6ZN12UvbTgSMQZiDnMELNr6Jy1pxAUMiS7wzcj2Y",
                            "collateralSupplyAddress": "6xKkGzC5cMAHRpkyD1xt2Va97nbsPLtHxkdLuhgUK5tv",
                            "liquidityAddress": "4uz86qaHrY9wfHi5X8iJg9CJEvaNYtPAtxRKwSxCyV7e",
                            "liquidityFeeReceiverAddress": "GPwirKFawYo7Y8UvCzYBT1zVw6CoEQr8odruzNjbpLMR"
                        },
                        {
                            "asset": "SOL",
                            "address": "Ecxqb6JVFMbYzjHqV31CQsT8oEyhQVDijek57NKh7HaX",
                            "collateralMintAddress": "ACVd31DuzotWTfarju5z54taFgiZsQBL5m2vPYk9xAQc",
                            "collateralSupplyAddress": "F56f28tNNeAkNvxorsP5EvqiJGqYcfj4b4qthLYJX2Xc",
                            "liquidityAddress": "GAJeRc6rTNMwTgad3FG95e8krgWBVbR3zbAJmukhBF4L",
                            "liquidityFeeReceiverAddress": "HYzE3a97Sq7yYWQdZTKR7Co5izksf9oDyjjNdeeT4zop"
                        }
                    ]
                }
            ],
            "oracles": {
                "pythProgramID": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
                "assets": [
                    {
                        "asset": "USDC",
                        "priceAddress": "5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7"
                    },
                    {
                        "asset": "SOL",
                        "priceAddress": "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"
                    }
                ]
            }
        }
    )
}
