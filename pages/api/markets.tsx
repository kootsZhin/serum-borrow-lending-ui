// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Config } from '../../src/global'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Config>
) {
    res.status(200).json(
        {
            "programID": `${process.env.NEXT_PUBLIC_PROGRAM_ID}`,
            "assets": [
                {
                    "name": "Bitcon",
                    "symbol": "USDC",
                    "decimals": Number(`${process.env.NEXT_PUBLIC_USDC_DECIMAL}`),
                    "mintAddress": `${process.env.NEXT_PUBLIC_USDC_ADDR}`,
                },
                {
                    "name": "Wrapped SOL",
                    "symbol": "SOL",
                    "decimals": Number(`${process.env.NEXT_PUBLIC_WRAPPED_SOL_DECIMAL}`),
                    "mintAddress": `${process.env.NEXT_PUBLIC_WRAPPED_SOL_ADDR}`,
                }
            ],
            "markets": [
                {
                    "name": "main",
                    "address": `${process.env.NEXT_PUBLIC_MARKET_ADDR}`,
                    "authority": `${process.env.NEXT_PUBLIC_MARKET_AUTHORITY}`,
                    "reserves": [
                        {
                            "asset": "USDC",
                            "address": `${process.env.NEXT_PUBLIC_USDC_RESERVE_ADDR}`,
                            "collateralMintAddress": `${process.env.NEXT_PUBLIC_USDC_COLLATERAL_MINT_ADDR}`,
                            "collateralSupplyAddress": `${process.env.NEXT_PUBLIC_USDC_COLLATERAL_SUPPLY_ADDR}`,
                            "liquidityAddress": `${process.env.NEXT_PUBLIC_USDC_RESERVE_LIQUIDITY_ADDR}`,
                            "liquidityFeeReceiverAddress": `${process.env.NEXT_PUBLIC_USDC_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDR}`
                        },
                        {
                            "asset": "SOL",
                            "address": `${process.env.NEXT_PUBLIC_WRAPPED_SOL_RESERVE_ADDR}`,
                            "collateralMintAddress": `${process.env.NEXT_PUBLIC_WRAPPED_SOL_COLLATERAL_MINT_ADDR}`,
                            "collateralSupplyAddress": `${process.env.NEXT_PUBLIC_WRAPPED_SOL_COLLATERAL_SUPPLY_ADDR}`,
                            "liquidityAddress": `${process.env.NEXT_PUBLIC_WRAPPED_SOL_RESERVE_LIQUIDITY_ADDR}`,
                            "liquidityFeeReceiverAddress": `${process.env.NEXT_PUBLIC_WRAPPED_SOL_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDR}`
                        }
                    ]
                }
            ],
            "oracles": {
                "pythProgramID": "FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWpe4975bi2epH",
                "assets": [
                    {
                        "asset": "USDC",
                        "priceAddress": "GVXRSBjFk6e6J3NbVPXohDJetcTjaeeuykUpbQF8UoMU" // 5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7 using USDC oracle for better stability
                    },
                    {
                        "asset": "SOL",
                        "priceAddress": "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG"
                    }
                ]
            }
        }
    )
}

