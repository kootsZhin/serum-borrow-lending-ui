import { TableCell } from "@mui/material"
import { findWhere } from "underscore";
import { useContext } from "react";

import { MarketContext } from "../../../context/MarketContext";
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
            <TableCell>{poolStats ? `${(poolStats.depositAPR * 100).toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats ? `${(poolStats.borrowAPR * 100).toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats ? `${(poolStats.ltv * 100).toFixed(2)}%` : "-"}</TableCell>
        </>
    )
}

export default MarketTableRow