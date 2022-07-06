import { useConnection, useWallet } from "@solana/wallet-adapter-react"

export const getWalletAssets = async () => {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    if (!publicKey) {
        return "-";
    }

    const res = await connection.getBalance(publicKey);
    return res.toString();
}