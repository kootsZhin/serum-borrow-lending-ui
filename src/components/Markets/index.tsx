import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useState, useEffect } from 'react'
import { BASEURI } from '../../constants'
import MarketTableRow from './MarketTableRow';
import UserTableRow from './UserTableRow';
import { ActionsPanel } from './ActionsPanel';

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

    { id: "userDeposited", label: "My Deposited" },
    { id: "userBorrowed", label: "My Borrowed" },
    { id: "userBalance", label: "My Balance" },
];

export default function Markets() {
    const [markets, setMarkets] = useState([]);
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (markets.length === 0) {
            getMarkets();
        }
    }, []);

    async function getMarkets() {

        const res = await fetch(`${BASEURI}/api/markets`);
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
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            markets.map((token) => (
                                <>
                                    <TableRow hover onClick={handleClickOpen}>
                                        <MarketTableRow token={token} />
                                        <UserTableRow token={token} />
                                    </TableRow>
                                    <ActionsPanel
                                        open={open}
                                        asset={token}
                                        onClose={handleClose}
                                    />
                                </>

                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
