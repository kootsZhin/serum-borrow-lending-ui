import { createContext, useState } from "react";

interface UserInterface {
    platform: {
        deposited: number,
        borrowed: number,
    },
    pools: UserPoolInterface[]
}

interface UserPoolInterface {
    symbol: string,
    name: string,
    price: number,
    deposited: number,
    depositedValue: number,
    borrowed: number,
    borrowedValue: number,
    balance: number,
    balanceValue: number,
}

export const UserContext = createContext<UserInterface>(undefined);

const INITIAL_VALUE = {
    platform: {
        deposited: 100,
        borrowed: 200,
    },
    pools: [
        {
            symbol: "BTC",
            name: "Bitcoin",
            price: 0,
            deposited: 50,
            depositedValue: 100,
            borrowed: 1,
            borrowedValue: 1,
            balance: 50,
            balanceValue: 100,
        },
        {
            symbol: "SOL",
            name: "Solana",
            price: 0,
            deposited: 50,
            depositedValue: 100,
            borrowed: 1,
            borrowedValue: 1,
            balance: 50,
            balanceValue: 100,
        }
    ]
}

export default function UserProvider({ children }) {
    const [userStats, setUserStats] = useState(INITIAL_VALUE);

    // useEffect(() => {
    //     fetchUserStats();
    //     const interval = setInterval(fetchUserStats, 5000);

    //     return () => clearInterval(interval);
    // }, []);

    // const fetchUserStats = async () => {
    //     const userStats = await getUserStats();
    //     setUserStats(userStats);
    // }

    return (
        <UserContext.Provider value={userStats}>
            {children}
        </UserContext.Provider>
    )
}