import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState, useEffect } from 'react'
import MarketTableRow from './MarketTableRow';
import UserTableRow from './UserTableRow';
import ActionsPanel from './ActionPanel';

interface Column {
    id: string;
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columns: readonly Column[] = [
    { id: "token", label: "Token" },
    { id: "totalDeposit", label: "Total Deposit" },
    { id: "totalBorrow", label: "Total Borrow" },
    { id: "totalAvailable", label: "Total Available" },
    { id: "depositAPR", label: "Deposit APR" },
    { id: "borrowAPR", label: "Borrow APR" },
    { id: "loanToValue", label: "LTV", format: (value) => `${value}%` },

    { id: "userDeposit", label: "My Deposited" },
    { id: "userBorrow", label: "My Borrowed" },
    { id: "userBalance", label: "My Balance" },
];

export default function Markets() {
    const [markets, setMarkets] = useState([]);
    const [open, setOpen] = useState("");

    const handleClickOpen = (token) => {
        setOpen(token);
    };
    const handleClose = () => {
        setOpen("");
        getMarkets();
    };

    useEffect(() => {
        if (markets.length === 0) {
            getMarkets();
        }
    }, []);

    async function getMarkets() {

        const res = await fetch("/api/markets");
        const config = await res.json()

        let markets: any = [];
        for (const reserve of config.markets[0].reserves) {
            markets.push(reserve.asset)
        }

        setMarkets(markets);
    }

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <TableContainer sx={{ maxHeight: "70vh" }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                    key={`${column.id}-cell`}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            markets.map((token) => (
                                <TableRow hover onClick={() => { handleClickOpen(token) }} key={`${token}-row`}>
                                    <MarketTableRow token={token} />
                                    <UserTableRow token={token} />
                                </TableRow>
                            ))
                        }
                        {
                            markets.map((token) => (
                                <ActionsPanel
                                    open={open === token}
                                    asset={token}
                                    onClose={handleClose}
                                    key={`${token}-actions-panel`}
                                />
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
