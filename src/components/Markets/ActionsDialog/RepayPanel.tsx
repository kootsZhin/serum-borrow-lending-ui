import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { Box, TextField, Stack, Button, Grid, Typography, Switch } from '@mui/material';
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    getAccount,
    Account,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError
} from '@solana/spl-token';
import { useCallback, useState } from 'react';
import { findWhere, find } from 'underscore';
import { PublicKey } from '@solana/web3.js';

import { depositReserveLiquidityAndObligationCollateralInstruction, initObligationInstruction, refreshReserveInstruction, refreshObligationInstruction, repayObligationLiquidityInstruction } from '../../../models/instructions';
import { OBLIGATION_SIZE } from '../../../models';
import { BASEURI } from '../../../constants';
import { getObligations } from '../../../utils';

export function RepayPanel(props: { index: number, market: string, value: number }) {
    const { value, market, index, ...other } = props;
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [depositAmount, setDepositAmount] = useState(0);

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        const config = await (await fetch(`${BASEURI}/api/markets`)).json();
        const instructions = [];

        const assetConfig = findWhere(config.assets, { symbol: market });
        const reserveConfig = findWhere(config.markets[0].reserves, { asset: market });
        const oracleConfig = findWhere(config.oracles.assets, { asset: market });

        const seed = config.markets[0].address.slice(0, 32);
        const sourceLiquidity = await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);
        const obligationAccount = await PublicKey.createWithSeed(publicKey, seed, new PublicKey(config.programID));

        const allObligation = await getObligations(connection, config, config.markets[0].address);
        const userObligation = find(allObligation, (r) => r!.data.owner.toString() === publicKey.toString());

        let userDepositedReserves: PublicKey[] = [];
        let userBorrowedReserves: PublicKey[] = [];
        if (userObligation) {
            userObligation.data.deposits.forEach((deposit) => { userDepositedReserves.push(deposit.depositReserve) });
            userObligation.data.borrows.forEach((borrow) => { userBorrowedReserves.push(borrow.borrowReserve) });
        }

        instructions.push(refreshReserveInstruction(
            new PublicKey(reserveConfig.address),
            new PublicKey(config.programID),
            new PublicKey(oracleConfig.priceAddress)
        ))

        instructions.push(refreshObligationInstruction(
            userObligation.pubkey,
            new PublicKey(config.programID),
            userDepositedReserves,
            userBorrowedReserves,
        ))

        instructions.push(repayObligationLiquidityInstruction(
            depositAmount * 10 ** assetConfig.decimals,
            new PublicKey(config.programID),
            sourceLiquidity,
            new PublicKey(reserveConfig.liquidityAddress),
            new PublicKey(reserveConfig.address),
            userObligation.pubkey,
            new PublicKey(config.markets[0].address),
            publicKey
        ))

        const tx = new Transaction().add(...instructions);

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, "processed");
        console.log("repay")

    }, [depositAmount, publicKey, sendTransaction, connection]);

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
                        <TextField id="outlined-basic" label={`Enter ${market} Amount`} variant="outlined" onChange={(event) => { setDepositAmount(Number(event.target.value)) }} />
                        <Button variant="contained" onClick={onClick}>Repay {market}</Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}