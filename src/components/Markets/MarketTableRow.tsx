import { TableCell } from "@mui/material"
import { findWhere } from "underscore";
import { useContext } from "react";

import { MarketContext } from "../../../context/MarketContext";

const MarketTableRow = ({ token }: { token: string }) => {
    const marketStats = useContext(MarketContext);
    const poolStats = findWhere(marketStats.pools, { symbol: token });

    return (
        <>
            <TableCell>{token}</TableCell>
            <TableCell>{poolStats.totalDeposit ? `${poolStats.totalDeposit.toFixed(2)} ($${poolStats.totalDepositValue.toFixed(2)})` : "-"}</TableCell>
            <TableCell>{poolStats.totalBorrow ? `${poolStats.totalBorrow.toFixed(2)} ($${poolStats.totalBorrowValue.toFixed(2)})` : "-"}</TableCell>
            <TableCell>{poolStats.totalAvailable ? `${poolStats.totalAvailable} ($${poolStats.totalAvailableValue.toFixed(2)})` : "-"}</TableCell>
            <TableCell>{poolStats.depositAPR ? `${poolStats.depositAPR.toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats.borrowAPR ? `${poolStats.borrowAPR.toFixed(2)}%` : "-"}</TableCell>
            <TableCell>{poolStats.ltv ? `${poolStats.ltv.toFixed(2)}%` : "-"}</TableCell>
        </>
    )
}

export default MarketTableRow