import { Dialog, Box, Tabs, Tab, TextField, Stack, Button, TableCell, Table, TableBody, TableRow } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useCallback, useState, useContext } from 'react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

import { findWhere } from 'underscore';
import { useNotify } from '../../notify';
import * as actions from "../../actions";

import { sendAndNotifyTransactions } from '../../actions/sendAndNotifyTransactions';
import { UserContext } from '../../../context/UserContext';
import { MarketContext } from '../../../context/MarketContext';

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

    const marketStats = useContext(MarketContext);
    let poolStats;
    try {
        poolStats = findWhere(marketStats.pools, { symbol: asset });
    } catch (e) {
        poolStats = undefined;
    }

    const userStats = useContext(UserContext);
    let userPoolStats;
    try {
        userPoolStats = findWhere(userStats.pools, { symbol: asset });
    } catch (e) {
        userPoolStats = undefined;
    }

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const handleClose = () => {
        setOnClickDisable(false);
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
                max = userPoolStats.deposited;
                break;
            case 3:
                max = 0;
                break;
            default:
                break
        }

        if (!max) {
            notify("info", `Your max ${idToActions[value]} value equals to ${max}`);
        }

        _handleInputChange(max);
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
                ({ instructions, signers } = await actions.deposit(connection, publicKey, asset, amount));
                break;
            case 1:
                ({ instructions, signers } = await actions.repay(connection, publicKey, asset, amount));
                break;
            case 2:
                ({ instructions, signers } = await actions.withdraw(connection, publicKey, asset, amount));
                break;
            case 3:
                ({ instructions, signers } = await actions.borrow(connection, publicKey, asset, amount));
                break;
            default:
                break
        }

        await sendAndNotifyTransactions(connection, sendTransaction, notify, instructions, signers);

        setOnClickDisable(false);
        setIsLoading(false);

    }, [amount, publicKey, sendTransaction, connection, notify, value]);


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
                            variant="outlined"
                            onChange={handleInputChange}
                            required
                            value={displayAmount}
                            helperText={`${displayAmount} ${asset} = $${poolStats ? (Number(displayAmount) * poolStats.price).toFixed(2) : "-"}`}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        {/* <Button variant="outlined" onClick={useMax}>Use max</Button> */}
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>User borrow limit</TableCell>
                                    <TableCell>${0}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Utilization</TableCell>
                                    <TableCell>{0}%</TableCell>
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
