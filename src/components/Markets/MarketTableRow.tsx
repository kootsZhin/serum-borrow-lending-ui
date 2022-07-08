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

const MarketTableRow = ({ token }: { token: string }) => {

    const [totalDeposit, setTotalDeposit] = useState("");
    const [totalDepositValue, setTotalDepositValue] = useState("");
    const [totalBorrow, setTotalBorrow] = useState("");
    const [totalBorrowValue, setTotalBorrowValue] = useState("");
    const [totalAvailable, setTotalAvailable] = useState("");
    const [totalAvailableValue, setTotalAvailableValue] = useState("");
    const [depositAPR, setdepositAPR] = useState("");
    const [borrowAPR, setborrowAPR] = useState("");
    const [loanToValue, setLoanToValue] = useState("");

    useEffect(() => {
        getReserveMetrics();
    }, [])

    const getReserveMetrics = async () => {
        const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

        const config = await (await fetch(`${BASEURI}/api/markets`)).json();
        const asset = findWhere(config.assets, { symbol: token });
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves: any = await getReserves(connection, config, config.markets[0].address);
        const tokenOracle = findWhere(tokensOracle, { symbol: asset.symbol });
        const reserve = findWhere(config.markets[0].reserves, { asset: asset.symbol });
        const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

        const availableAmount = Number(reserveConfig.liquidity.availableAmount.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
        const totalBorrowedAmount = Number(reserveConfig.liquidity.borrowedAmountWads.toString()) / (10 ** reserveConfig.liquidity.mintDecimals);
        const totalDeposit = availableAmount + totalBorrowedAmount;

        const availableAmountValue = availableAmount * tokenOracle.price
        const totalBorrowedAmountValue = totalBorrowedAmount * tokenOracle.price
        const totalDepositValue = availableAmountValue + totalBorrowedAmountValue;

        const currentUtilization = (totalBorrowedAmount ? totalBorrowedAmount / totalDeposit : 0)
        const optimalUtilization = (reserveConfig.config.optimalUtilizationRate / 100)

        let borrowAPR = 0;
        if (optimalUtilization === 1.0 || currentUtilization < optimalUtilization) {
            const normalizedFactor = currentUtilization / optimalUtilization;
            const optimalBorrowRate = reserveConfig.config.optimalBorrowRate / 100;
            const minBorrowRate = reserveConfig.config.minBorrowRate / 100;
            borrowAPR =
                normalizedFactor * (optimalBorrowRate - minBorrowRate) + minBorrowRate;
        } else {
            const normalizedFactor =
                (currentUtilization - optimalUtilization) / (1 - optimalUtilization);
            const optimalBorrowRate = reserveConfig.config.optimalBorrowRate / 100;
            const maxBorrowRate = reserveConfig.config.maxBorrowRate / 100;
            borrowAPR =
                normalizedFactor * (maxBorrowRate - optimalBorrowRate) +
                optimalBorrowRate;
        }

        const depositAPR = borrowAPR * currentUtilization;

        const loanToValue = reserveConfig.config.loanToValueRatio;

        setTotalAvailable(availableAmount.toFixed(2).toString());
        setTotalAvailableValue(availableAmountValue.toFixed(2).toString());

        setTotalBorrow(totalBorrowedAmount.toFixed(2).toString());
        setTotalBorrowValue(totalBorrowedAmountValue.toFixed(2).toString());

        setTotalDeposit(totalDeposit.toFixed(2).toString());
        setTotalDepositValue(totalDepositValue.toFixed(2).toString());

        setborrowAPR((borrowAPR * 100).toFixed(2).toString());
        setdepositAPR((depositAPR * 100).toFixed(2).toString());

        setLoanToValue(loanToValue.toString());
    }


    return (
        <>
            <TableCell>{token}</TableCell>
            <TableCell>{totalDeposit ? `${totalDeposit} ($${totalDepositValue})` : "-"}</TableCell>
            <TableCell>{totalBorrow ? `${totalBorrow} ($${totalBorrowValue})` : "-"}</TableCell>
            <TableCell>{totalAvailable ? `${totalAvailable} ($${totalAvailableValue})` : "-"}</TableCell>
            <TableCell>{depositAPR ? depositAPR : "-"}</TableCell>
            <TableCell>{borrowAPR ? borrowAPR : "-"}</TableCell>
            <TableCell>{loanToValue ? loanToValue : "-"}</TableCell>
        </>
    )
}

export default MarketTableRow