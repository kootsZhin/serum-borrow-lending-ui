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
            <TableCell>{poolStats.totalDeposit ? `${poolStats.totalDeposit} ($${poolStats.totalDepositValue})` : "-"}</TableCell>
            <TableCell>{poolStats.totalBorrow ? `${poolStats.totalBorrow} ($${poolStats.totalBorrowValue})` : "-"}</TableCell>
            <TableCell>{poolStats.totalAvailable ? `${poolStats.totalAvailable} ($${poolStats.totalAvailableValue})` : "-"}</TableCell>
            <TableCell>{poolStats.depositAPR ? `${poolStats.depositAPR}%` : "-"}</TableCell>
            <TableCell>{poolStats.borrowAPR ? `${poolStats.borrowAPR}%` : "-"}</TableCell>
            <TableCell>{poolStats.ltv ? `${poolStats.ltv}%` : "-"}</TableCell>
        </>
    )
}

export default MarketTableRow