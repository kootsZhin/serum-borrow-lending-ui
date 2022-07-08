import { Box, TextField, Stack, Button, Grid, Typography, Switch } from '@mui/material';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useCallback, useState } from 'react';
import { Transaction } from '@solana/web3.js';

import { withdraw } from "../../../actions";
import { useNotify } from '../../../notify';
import { sendAndNotifyTransactions } from '../../../actions/sendAndNotifyTransactions';

export function WithdrawPanel(props: { index: number, asset: string, value: number }) {
    const { value, asset, index, ...other } = props;
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [withdrawAmount, setWithdrawAmount] = useState(0);

    const notify = useNotify();

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const instructions = await withdraw(connection, publicKey, asset, withdrawAmount);
        sendAndNotifyTransactions(connection, sendTransaction, notify, instructions);

    }, [withdrawAmount, publicKey, sendTransaction, connection, notify]);

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`action-tabpanel-${index}`}
            aria-labelledby={`action-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <TextField id="outlined-basic" label={`Enter ${asset} Amount`} variant="outlined" onChange={(event) => { setWithdrawAmount(Number(event.target.value)) }} />
                        <Button disabled={!publicKey} variant="contained" onClick={onClick}>
                            {publicKey ? `Withdraw ${asset}` : "Connect Wallet"}
                        </Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}