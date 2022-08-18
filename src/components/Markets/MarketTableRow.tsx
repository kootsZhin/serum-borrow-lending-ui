import { TableCell } from "@mui/material";
import { useContext } from "react";
import { findWhere } from "underscore";

import { DataContext } from "../../../context";

const MarketTableRow = ({ token }: { token: string }) => {
    const data = useContext(DataContext);

    let marketStats;
    try {
        marketStats = data.market;
    } catch (e) {
        marketStats = undefined;
    }

    let poolStats;
    try {
        poolStats = findWhere(marketStats.pools, { symbol: token });
    } catch (e) {
        poolStats = undefined;
    }

    return (
        <>
            <TableCell>{token}</TableCell>
            <TableCell>{poolStats ? `${poolStats.totalDeposit.toFixed(2)} ($${poolStats.totalDepositValue.toFixed(2)})` : "-"}</TableCell>
            <TableCell>{poolStats ? `${poolStats.totalBorrow.toFixed(2)} ($${poolStats.totalBorrowValue.toFixed(2)})` : "-"}</TableCell>
            <TableCell>{poolStats ? `${poolStats.totalAvailable} ($${poolStats.totalAvailableValue.toFixed(2)})` : "-"}</TableCell>
            <TableCell>{poolStats ? `${(poolStats.depositAPY * 100).toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats ? `${(poolStats.borrowAPY * 100).toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats ? `${(poolStats.ltv * 100).toFixed(2)}%` : "-"}</TableCell>
        </>
    )
}

export default MarketTableRow