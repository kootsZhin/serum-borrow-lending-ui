import { Dialog, Box, Tabs, Tab, TextField, Stack, Button, TableCell, Table, TableBody, TableRow } from '@mui/material';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useCallback, useState, useEffect } from 'react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { getReserves, getObligations } from '../../utils';
import { getTokensOracleData } from "../../pyth";
import { findWhere, find } from 'underscore';
import { useNotify } from '../../notify';
import * as actions from "../../actions";

import { sendAndNotifyTransactions } from '../../actions/sendAndNotifyTransactions';

function a11yProps(index: number) {
    return {
        id: `actions-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function ActionsPanel(props: { open: boolean, asset: string, onClose: () => void }) {
    const { onClose, asset, open } = props;
    const [value, setValue] = useState(0);
    const [displayAmount, setDisplayAmount] = useState("");
    const [onClickDisable, setOnClickDisable] = useState(false);

    const [userBorrowLimit, setUserBorrowLimit] = useState(0);
    const [utilization, setUtilizatoin] = useState(0);

    const [deposited, setDeposited] = useState(0);
    const [borrowed, setBorrowed] = useState(0);

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [amount, setAmount] = useState(0);

    useEffect(() => {
        if (publicKey) {
            getUserMetrics(publicKey);
        }
    }, [publicKey])

    const getUserMetrics = async (publicKey: PublicKey) => {
        const config = await (await fetch("/api/markets")).json();
        const tokensOracle = await getTokensOracleData(connection, config, config.markets[0].reserves);
        const allReserves: any = await getReserves(connection, config, config.markets[0].address);
        const allObligation = await getObligations(connection, config, config.markets[0].address);
        const reserve = findWhere(config.markets[0].reserves, { asset: asset });
        const reserveConfig = find(allReserves, (r) => r!.pubkey.toString() === reserve.address)!.data;

        const loanToValue = reserveConfig.config.loanToValueRatio / 100;

        const userObligation = find(allObligation, (r) => r!.data.owner.toBase58() === publicKey.toBase58());

        let userDepositedValue = 0;
        let userBorrowedValue = 0;
        if (userObligation) {

            for (const reserve of allReserves) {
                const userDepositedToken = find(userObligation.data.deposits, (r) => r!.depositReserve.toBase58() === reserve.pubkey.toBase58());
                const userDepositedTokenBalance = userDepositedToken ? Number(userDepositedToken.depositedAmount.toString()) / 10 ** reserve.data.liquidity.mintDecimals : 0;
                const tokenOracle = findWhere(tokensOracle, { reserveAddress: reserve.pubkey.toBase58() });
                const userDepositedTokenBalanceValue = userDepositedTokenBalance * tokenOracle.price;

                const userBorrowedToken = find(userObligation.data.borrows, (r) => r!.borrowReserve.toBase58() === reserve.pubkey.toBase58());
                const userBorrowedTokenBalance = userBorrowedToken ? Number(userBorrowedToken.borrowedAmountWads.toString()) / 10 ** reserve.data.liquidity.mintDecimals : 0;
                const userBorrowedTokenBalanceValue = userBorrowedTokenBalance * tokenOracle.price;

                userDepositedValue += userDepositedTokenBalanceValue;
                userBorrowedValue += userBorrowedTokenBalanceValue;
            }
        }

        const borrowLimit = userDepositedValue * loanToValue;
        const utilization = userBorrowedValue / borrowLimit;

        setDeposited(userDepositedValue);
        setBorrowed(userBorrowedValue);

        setUserBorrowLimit(borrowLimit);
        setUtilizatoin(utilization);
    }

    const handleClose = () => {
        setOnClickDisable(false);
        onClose();
        setValue(0);
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setOnClickDisable(false);
        setValue(newValue);
    };

    const idToActions = {
        0: "deposit",
        1: "repay",
        2: "withdraw",
        3: "borrow",
    }

    const handleInputChange = (event) => {
        setAmount(Number(event.target.value))
        Number(event.target.value) ? setDisplayAmount(Number(event.target.value).toString()) : setDisplayAmount("")
    }

    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        let instructions = [];
        switch (value) {
            case 0:
                instructions = await actions.deposit(connection, publicKey, asset, amount);
                break;
            case 1:
                instructions = await actions.repay(connection, publicKey, asset, amount);
                break;
            case 2:
                instructions = await actions.withdraw(connection, publicKey, asset, amount);
                break;
            case 3:
                instructions = await actions.borrow(connection, publicKey, asset, amount);
                break;
            default:
                break
        }

        sendAndNotifyTransactions(connection, sendTransaction, notify, instructions);

    }, [amount, publicKey, sendTransaction, connection, notify]);


    return (
        <Dialog onClose={handleClose} open={open}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs variant="fullWidth" value={value} onChange={handleChange}>
                    <Tab label="Deposit" {...a11yProps(0)} />
                    <Tab label="Repay" {...a11yProps(1)} />
                    <Tab label="Withdraw" {...a11yProps(2)} />
                    <Tab label="Borrow" {...a11yProps(3)} />
                </Tabs>
            </Box>
            <div
                role="tabpanel"
                id={`action-tabpanel-${value}`}
                aria-labelledby={`action-tab-${value}`}
            >
                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <TextField id="outlined-basic" label={`Enter ${asset} Amount`} variant="outlined" onChange={handleInputChange} />
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>User borrow limit</TableCell>
                                    <TableCell>${userBorrowLimit.toFixed(2)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Utilization</TableCell>
                                    <TableCell>{(utilization * 100).toFixed(2)}%</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <Button disabled={!publicKey || onClickDisable} variant="contained" onClick={onClick}>
                            {
                                publicKey ?
                                    `${idToActions[value]} ${displayAmount} ${asset}`
                                    : "Connect Wallet"
                            }
                        </Button>
                    </Stack>
                </Box>
            </div >
        </Dialog>
    );
}
