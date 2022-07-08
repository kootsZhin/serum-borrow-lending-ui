import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { findWhere } from "underscore";
import { Config } from "../global";
import { refreshReserveInstruction } from "../models/instructions";

export const refreshReserves = async (instructions: TransactionInstruction[], reserves: PublicKey[], config: Config) => {
    for (const reserve in reserves) {
        const reserveConfig = findWhere(config.markets[0].reserves, { "address": reserves[reserve].toString() });
        const oracleConfig = findWhere(config.oracles.assets, { asset: reserveConfig.asset });
        instructions.push()
        instructions.push(refreshReserveInstruction(
            reserves[reserve],
            new PublicKey(config.programID),
            new PublicKey(oracleConfig.priceAddress),
        ))
    }
}