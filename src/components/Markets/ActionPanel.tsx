import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Dialog, Grid, Stack, Tab, Table, TableBody, TableCell, TableRow, Tabs, TextField } from '@mui/material';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useWallet } from "@solana/wallet-adapter-react";
import { useCallback, useContext, useMemo, useState } from 'react';

import { findWhere } from 'underscore';
import * as actions from "../../actions";
import { useNotify } from '../../notify';

import { Connection, Transaction } from '@solana/web3.js';
import { DataContext } from '../../../context';
import { RPC_ENDPOINT } from '../../constants';

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
    const [onClickDisable, setOnClickDisable] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const [amount, setAmount] = useState("");

    const data = useContext(DataContext);

    let marketStats;
    try {
        marketStats = data.market;
    } catch (e) {
        marketStats = undefined;
    }
    let poolStats;
    try {
        poolStats = findWhere(marketStats.pools, { symbol: asset });
    } catch (e) {
        poolStats = undefined;
    }

    let userStats;
    try {
        userStats = data.user;
    } catch (e) {
        userStats = undefined;
    }
    let userPoolStats;
    try {
        userPoolStats = findWhere(userStats.pools, { symbol: asset });
    } catch (e) {
        userPoolStats = undefined;
    }

    // TODO: for some reason useConnection() is not working
    // const { connection } = useConnection();
    const connection = useMemo(
        () => new Connection(RPC_ENDPOINT, 'confirmed'), []
    );
    const { publicKey, sendTransaction }
        = useWallet();


    const handleClose =
        () => {
            setOnClickDisable(true);
            onClose();
            setValue(0);
        };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        if (displayAmount === "") {
            setOnClickDisable(true);
        } else {
            setOnClickDisable(false);
        }
        setValue(newValue);
    };

    const idToActions = {
        0: "deposit",
        1: "repay",
        2: "withdraw",
        3: "borrow",
    }

    const handleInputChange = (event) => {
        _handleInputChange(event.target.value.toString());
    }

    const _handleInputChange = (inputValue) => {
        setAmount(inputValue.toString());
        inputValue ? setDisplayAmount(inputValue.toString()) : setDisplayAmount("")
        inputValue ? setOnClickDisable(false) : setOnClickDisable(true)
    }

    const useMax = () => {
        let max;
        switch (value) {
            case 0:
                max = userPoolStats.balance;
                break;
            case 1:
                max = userPoolStats.balance > userPoolStats.borrowed ? userPoolStats.borrowed : userPoolStats.balance;
                break;
            case 2:
                max = Math.min(userPoolStats.deposited, userStats.platform.remainingBorrowingPower / poolStats.ltv / userPoolStats.price);
                break;
            case 3:
                max = Math.min(userStats.platform.remainingBorrowingPower / poolStats.price, poolStats.totalAvailable);
                break;
            default:
                break
        }

        if (!max) {
            notify("info", `Your max ${idToActions[value]} value equals to ${max}`);
        }

        _handleInputChange(max);
    }

    const useHalfMax = () => {
        let max;
        switch (value) {
            case 0:
                max = userPoolStats.balance;
                break;
            case 1:
                max = userPoolStats.balance > userPoolStats.borrowed ? userPoolStats.borrowed : userPoolStats.balance;
                break;
            case 2:
                max = Math.min(userPoolStats.deposited, userStats.platform.remainingBorrowingPower / poolStats.ltv / userPoolStats.price);
                break;
            case 3:
                max = Math.min(userStats.platform.remainingBorrowingPower / poolStats.price, poolStats.totalAvailable);
                break;
            default:
                break
        }

        if (!max) {
            notify("info", `Your max ${idToActions[value]} value equals to ${max}`);
        }

        _handleInputChange(max * 0.5);
    }

    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        setOnClickDisable(true);
        setIsLoading(true);

        let instructions = [];
        let signers = undefined;
        switch (value) {
            case 0:
                ({ instructions, signers } = await actions.deposit(connection, publicKey, asset, Number(amount)));
                break;
            case 1:
                ({ instructions, signers } = await actions.repay(connection, publicKey, asset, Number(amount)));
                break;
            case 2:
                ({ instructions, signers } = await actions.withdraw(connection, publicKey, asset, Number(amount)));
                break;
            case 3:
                ({ instructions, signers } = await actions.borrow(connection, publicKey, asset, Number(amount)));
                break;
            default:
                break
        }

        try {
            const tx = new Transaction();

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            tx.add(...instructions);
            tx.recentBlockhash = blockhash;

            const signature = await sendTransaction(tx, connection, {
                minContextSlot: minContextSlot,
                signers: signers
            });

            notify('info', 'Transaction sent:', signature);

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            notify('success', 'Transaction successful!', signature);
        } catch (error: unknown) {
            notify("error", `Error: ${error}`);
        }

        setOnClickDisable(false);
        setIsLoading(false);

    }, [amount, publicKey, sendTransaction, notify, value, asset, connection]);



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
                        <TextField
                            label={`Enter ${asset} Amount`}
                            type="number"
                            variant="outlined"
                            onChange={handleInputChange}
                            required
                            value={displayAmount}
                            helperText={`${displayAmount} ${asset} = $${poolStats ? (Number(displayAmount) * poolStats.price).toFixed(2) : "-"}`}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <Grid container spacing={0}>
                            <Grid item xs={6}>
                                <Button disabled={!publicKey} sx={{ width: '100%', overflow: 'hidden' }} variant="outlined" onClick={useMax}>max</Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button disabled={!publicKey} sx={{ width: '100%', overflow: 'hidden' }} variant="outlined" onClick={useHalfMax}>50% max</Button>
                            </Grid>
                        </Grid>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Remaining borrowing power</TableCell>
                                    <TableCell>${userStats ? ((userStats.platform.remainingBorrowingPower).toFixed(2)) : "-"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Utilization</TableCell>
                                    <TableCell>{userStats ? ((userStats.platform.borrowed / userStats.platform.borrowingPower * 100).toFixed(2)) : "-"}%</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <LoadingButton
                            disabled={!publicKey || onClickDisable}
                            loading={isLoading}
                            variant="contained"
                            onClick={onClick}>
                            {
                                publicKey ?
                                    `${idToActions[value]} ${displayAmount} ${asset}`
                                    : "Connect Wallet"
                            }
                        </LoadingButton>
                    </Stack>
                </Box>
            </div >
        </Dialog>
    );
}
