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
                    "symbol": "BTC",
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
                    "reserves": [
                        {
                            "asset": "BTC",
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
                "pythProgramID": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
                "assets": [
                    {
                        "asset": "BTC",
                        "priceAddress": "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J" // 5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7 using BTC oracle for better stability
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

