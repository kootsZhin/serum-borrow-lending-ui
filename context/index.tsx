import { createContext, useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { UserInterface, getUserStats } from "./UserContext";
import { MarketInterface, getMarketStats } from "./MarketContext";
import { CONTEXT_UPDATE_INTERVAL } from "../src/constants";
import { PublicKey } from "@solana/web3.js";

interface DataInterface {
    market: MarketInterface;
    user: UserInterface;
}

export const DataContext = createContext<DataInterface | undefined>(undefined);

const getData: (PublicKey) => Promise<DataInterface> = async (publicKey: PublicKey) => {
    const market = await getMarketStats();

    let user;
    if (publicKey) {
        user = await getUserStats(publicKey);
    } else {
        user = undefined;
    }

    return { market, user };
}

export default function DataProvider({ children }) {
    const [data, setData] = useState(undefined);

    const { publicKey } = useWallet();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, CONTEXT_UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [publicKey]);

    const fetchData = async () => {
        const data = await getData(publicKey);
        setData(data);
    }

    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    )
}