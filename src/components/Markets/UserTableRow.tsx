import { Grid, Typography, Card, CardContent, CardActionArea, Stack, TableRow, TableCell } from "@mui/material"
import { useState, useEffect } from "react";
import { ActionsPanel } from "./ActionsPanel";
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { findWhere, find } from "underscore";
import { PublicKey, Connection, clusterApiUrl } from "@solana/web3.js";
import { getTokensOracleData } from "../../pyth";
import { getAssociatedTokenAddress, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } from '@solana/spl-token';
import { getReserves, getObligations } from '../../utils';
import { BASEURI } from '../../constants';

const UserTableRow = ({ token }: { token: string }) => {

    const [userDeposited, setUserDeposited] = useState("");
    const [userDepositedValue, setUserDepositedValue] = useState("");
    const [userBorrowed, setUserBorrowed] = useState("");
    const [userBorrowedValue, setUserBorrowedValue] = useState("");
    const [userBalance, setUserBalance] = useState("");
    const [userBalanceValue, setUserBalanceValue] = useState("");

    const { connection } = useConnection();
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            getUserMetrics(publicKey);
        }
    }, [publicKey])

    const getUserMetrics = async (publicKey: PublicKey) => {
        const config = await (await fetch(`${BASEURI}/api/markets`)).json();
        const asset = findWhere(config.assets, { symbol: token });
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves: any = await getReserves(connection, config, config.markets[0].address);
        const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });
        const reserve = findWhere(config.markets[0].reserves, { asset: asset.symbol });
        const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

        const tokenAddress = await getAssociatedTokenAddress(new PublicKey(asset.mintAddress), publicKey);
        let tokenAssetsBalance = 0;
        try {
            tokenAssetsBalance = await (await connection.getTokenAccountBalance(tokenAddress)).value.uiAmount;
        } catch (error: unknown) {
            tokenAssetsBalance = 0;
        }

        const allObligation = await getObligations(connection, config, config.markets[0].address);

        let depositedBalance = 0;
        let depositedBalanceValue = 0;
        let borrowedBalance = 0;
        let borrowedBalanceValue = 0;
        const userObligation = find(allObligation, (r) => r!.data.owner.toString() === publicKey.toString());
        if (userObligation) {
            const userDeposit = find(userObligation.data.deposits, (r) => r!.depositReserve.toString() === reserve.address);
            const userBorrow = find(userObligation.data.borrows, (r) => r!.borrowReserve.toString() === reserve.address);
            const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });

            depositedBalance = userDeposit ? Number(userDeposit.depositedAmount.toString()) / 10 ** reserveConfig.liquidity.mintDecimals : 0;
            depositedBalanceValue = depositedBalance * tokenOracle.price;

            borrowedBalance = userBorrow ? Number(userBorrow.borrowedAmountWads.toString()) / 10 ** reserveConfig.liquidity.mintDecimals : 0;
            borrowedBalanceValue = borrowedBalance * tokenOracle.price;
        }

        setUserBalance(tokenAssetsBalance.toFixed(2).toString());
        setUserBalanceValue((tokenAssetsBalance * tokenOracle.price)!.toFixed(2).toString());

        setUserDeposited(depositedBalance.toFixed(2).toString());
        setUserDepositedValue(depositedBalanceValue.toFixed(2).toString());

        setUserBorrowed(borrowedBalance.toFixed(2).toString());
        setUserBorrowedValue(borrowedBalanceValue.toFixed(2).toString());
    }


    return (
        <>
            <TableCell>{userDeposited ? `${userDeposited} ($${(userDepositedValue).toLocaleString('en')})` : "-"}</TableCell>
            <TableCell>{userBorrowed ? `${userBorrowed} ($${userBorrowedValue})` : "-"}</TableCell>
            <TableCell>{userBalance ? `${userBalance} ($${userBalanceValue})` : "-"}</TableCell>
        </>
    )
}

export default UserTableRow