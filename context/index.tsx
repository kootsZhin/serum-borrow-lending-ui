import { useWallet } from "@solana/wallet-adapter-react";
import { createContext, useEffect, useState } from "react";

import { Connection, PublicKey } from "@solana/web3.js";
import { CONTEXT_UPDATE_INTERVAL, RPC_ENDPOINT } from "../src/constants";
import { getMarketStats, MarketInterface } from "./MarketContext";
import { getUserStats, UserInterface } from "./UserContext";

interface DataInterface {
    market: MarketInterface;
    user: UserInterface;
}

export const DataContext = createContext<DataInterface | undefined>(undefined);

const getData = async (connection: Connection, publicKey: PublicKey) => {
    console.log('getData()');

    const market = await getMarketStats(connection);

    let user;
    if (publicKey) {
        user = await getUserStats(connection, publicKey);
    } else {
        user = undefined;
    }

    return { market, user };
}

export default function DataProvider({ children }) {
    const [data, setData] = useState(undefined);
    const connection = new Connection(RPC_ENDPOINT);

    const { publicKey } = useWallet();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, CONTEXT_UPDATE_INTERVAL);

        return () => clearInterval(interval);
    }, [publicKey]);

    const fetchData = async () => {
        const data = await getData(connection, publicKey);
        setData(data);
    }

    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    )
}