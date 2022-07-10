import { TableCell } from "@mui/material"
import { findWhere } from "underscore";
import { useContext } from "react";

import { MarketContext } from "../../../context/MarketContext";

const MarketTableRow = ({ token }: { token: string }) => {
    const marketStats = useContext(MarketContext);
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
            <TableCell>{poolStats ? `${poolStats.depositAPR.toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats ? `${poolStats.borrowAPR.toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats ? `${poolStats.ltv.toFixed(2)}%` : "-"}</TableCell>
        </>
    )
}

export default MarketTableRow