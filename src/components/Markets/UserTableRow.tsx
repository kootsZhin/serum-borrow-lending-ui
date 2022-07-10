import { useContext } from "react";
import { findWhere } from "underscore";
import { TableCell } from "@mui/material"

import { UserContext } from "../../../context/UserContext";

const UserTableRow = ({ token }: { token: string }) => {

    const userStats = useContext(UserContext);

    let userPoolStats;
    try {
        userPoolStats = findWhere(userStats.pools, { symbol: token });
    } catch (e) {
        userPoolStats = undefined;
    }

    return (
        <>
            <TableCell>{userPoolStats ? `${userPoolStats.deposited.toFixed(2)} ($${(userPoolStats.depositedValue.toFixed(2))})` : "-"}</TableCell>
            <TableCell>{userPoolStats ? `${userPoolStats.borrowed.toFixed(2)} ($${userPoolStats.borrowedValue.toFixed(2)})` : "-"}</TableCell>
            <TableCell>{userPoolStats ? `${userPoolStats.balance.toFixed(2)} ($${userPoolStats.balanceValue.toFixed(2)})` : "-"}</TableCell>
        </>
    )
}

export default UserTableRow