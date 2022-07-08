import { Box, TextField, Stack, Button } from '@mui/material';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Transaction } from '@solana/web3.js';

import { useCallback, useState } from 'react';

import { repay } from '../../../actions';

export function RepayPanel(props: { index: number, asset: string, value: number }) {
    const { value, asset, index, ...other } = props;
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [repayAmount, setRepayAmount] = useState(0);

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const instructions = await repay(connection, publicKey, asset, repayAmount);

        const tx = new Transaction().add(...instructions);

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, "processed");

    }, [repayAmount, publicKey, sendTransaction, connection]);

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
                        <TextField id="outlined-basic" label={`Enter ${asset} Amount`} variant="outlined" onChange={(event) => { setRepayAmount(Number(event.target.value)) }} />
                        <Button disabled={!publicKey} variant="contained" onClick={onClick}>
                            {publicKey ? `Repay ${asset}` : "Connect Wallet"}
                        </Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}