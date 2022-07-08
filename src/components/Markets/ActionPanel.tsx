import { Dialog, Box, Tabs, Tab, TextField, Stack, Button, Grid, Typography, Switch } from '@mui/material';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useCallback, useState } from 'react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';

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

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [amount, setAmount] = useState(0);

    const handleClose = () => {
        onClose();
        setValue(0);
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
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
                        <Button disabled={!publicKey} variant="contained" onClick={onClick}>
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
