import { PublicKey } from "@solana/web3.js";

export const WAD = "1".concat(Array(18 + 1).join("0"));

export const WRAPPED_SOL_MINT = new PublicKey(
    "So11111111111111111111111111111111111111112"
);

export const CONTEXT_UPDATE_INTERVAL = 5000; // 1000 = 1 second