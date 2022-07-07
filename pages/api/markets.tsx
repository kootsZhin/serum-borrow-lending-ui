// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { Config } from '../../src/global'
import dotenv from 'dotenv'

dotenv.config();

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Config>
) {
    res.status(200).json(
        {
            "programID": `${process.env.PROGRAM_ID}`,
            "assets": [
                {
                    "name": "USD coin",
                    "symbol": "USDC",
                    "decimals": Number(`${process.env.USDC_DECIMAL}`),
                    "mintAddress": `${process.env.USDC_ADDR}`,
                },
                {
                    "name": "Wrapped SOL",
                    "symbol": "WSOL",
                    "decimals": Number(`${process.env.WRAPPED_SOL_DECIMAL}`),
                    "mintAddress": `${process.env.WRAPPED_SOL_ADDR}`,
                }
            ],
            "markets": [
                {
                    "name": "main",
                    "address": `${process.env.MARKET_ADDR}`,
                    "reserves": [
                        {
                            "asset": "USDC",
                            "address": `${process.env.USDC_RESERVE_ADDR}`,
                            "collateralMintAddress": `${process.env.USDC_COLLATERAL_MINT_ADDR}`,
                            "collateralSupplyAddress": `${process.env.USDC_COLLATERAL_SUPPLY_ADDR}`,
                            "liquidityAddress": `${process.env.USDC_RESERVE_LIQUIDITY_ADDR}`,
                            "liquidityFeeReceiverAddress": `${process.env.USDC_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDR}`
                        },
                        {
                            "asset": "WSOL",
                            "address": `${process.env.WRAPPED_SOL_RESERVE_ADDR}`,
                            "collateralMintAddress": `${process.env.WRAPPED_SOL_COLLATERAL_MINT_ADDR}`,
                            "collateralSupplyAddress": `${process.env.WRAPPED_SOL_COLLATERAL_SUPPLY_ADDR}`,
                            "liquidityAddress": `${process.env.WRAPPED_SOL_RESERVE_LIQUIDITY_ADDR}`,
                            "liquidityFeeReceiverAddress": `${process.env.WRAPPED_SOL_RESERVE_LIQUIDITY_FEE_RECEIVER_ADDR}`
                        }
                    ]
                }
            ],
            "oracles": {
                "pythProgramID": "gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s",
                "assets": [
                    {
                        "asset": "USDC",
                        "priceAddress": "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J" // 5SSkXsEKQepHHAewytPVwdej4epN1nxgLVM84L4KXgy7 using BTC oracle for better stability
                    },
                    {
                        "asset": "WSOL",
                        "priceAddress": "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"
                    }
                ]
            }
        }
    )
}

