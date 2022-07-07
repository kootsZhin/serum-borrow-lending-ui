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
import { findWhere } from 'underscore';
import { PublicKey } from '@solana/web3.js';

import { depositReserveLiquidityAndObligationCollateralInstruction, initObligationInstruction } from '../../../models/instructions';
import { OBLIGATION_SIZE } from '../../../models';
import { BASEURI } from '../../../constants';

export function DepositPanel(props: { index: number, market: string, value: number }) {
    const { value, market, index, ...other } = props;
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [depositAmount, setDepositAmount] = useState(0);
    const [repayChecked, setRepayChecked] = useState(false);

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        if (!repayChecked) {
            const config = await (await fetch(`${BASEURI}/api/markets`)).json();
            const instructions = [];

            const assetConfig = findWhere(config.assets, { symbol: market });
            const reserveConfig = findWhere(config.markets[0].reserves, { asset: market });
            const oracleConfig = findWhere(config.oracles.assets, { asset: market });

            // Get or create the token account for collateral token
            const sourceCollateral = await getAssociatedTokenAddress(new PublicKey(reserveConfig!.collateralMintAddress), publicKey);

            try {
                await getAccount(connection, sourceCollateral);
            } catch (error: unknown) {
                if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
                    instructions.push(createAssociatedTokenAccountInstruction(
                        publicKey,
                        sourceCollateral,
                        publicKey,
                        new PublicKey(reserveConfig!.collateralMintAddress)
                    ));
                }
            }

            const [authority] = await PublicKey.findProgramAddress(
                [new PublicKey(config.markets[0].address).toBuffer()],
                new PublicKey(config.programID)
            );

            const sourceLiquidity = await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);

            const seed = config.markets[0].address.slice(0, 32);
            const obligationAccount = await PublicKey.createWithSeed(publicKey, seed, new PublicKey(config.programID));

            if (!(await connection.getAccountInfo(obligationAccount))) {
                instructions.push(SystemProgram.createAccountWithSeed(
                    {
                        fromPubkey: publicKey,
                        newAccountPubkey: obligationAccount,
                        basePubkey: publicKey,
                        seed: seed,
                        lamports: (await connection.getMinimumBalanceForRentExemption(OBLIGATION_SIZE)),
                        space: OBLIGATION_SIZE,
                        programId: new PublicKey(config.programID),
                    }
                ));

                instructions.push(initObligationInstruction(
                    obligationAccount,
                    new PublicKey(config.programID),
                    new PublicKey(config.markets[0].address),
                    publicKey
                ))
            }

            instructions.push(depositReserveLiquidityAndObligationCollateralInstruction(
                depositAmount * 10 ** assetConfig.decimals,
                new PublicKey(config.programID),
                sourceLiquidity,
                sourceCollateral,
                new PublicKey(reserveConfig!.address),
                new PublicKey(reserveConfig!.liquidityAddress),
                new PublicKey(reserveConfig!.collateralMintAddress),
                new PublicKey(config.markets[0].address),
                authority,
                new PublicKey(reserveConfig!.collateralSupplyAddress), // TODO: replace with destination collateral address
                obligationAccount, // TODO: replace with obligagtion address
                publicKey,
                new PublicKey(oracleConfig.priceAddress),
                publicKey
            ));

            const tx = new Transaction().add(...instructions);

            const signature = await sendTransaction(tx, connection);
            await connection.confirmTransaction(signature, "processed");
        }
        else {
            console.log("repay")
        }
    }, [depositAmount, repayChecked, publicKey, sendTransaction, connection]);

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
                        <TextField id="outlined-basic" label={`Enter ${market} Value`} variant="outlined" onChange={(event) => { setDepositAmount(Number(event.target.value)) }} />
                        <Grid container>
                            <Grid item >
                                <Typography>Repay funds</Typography>
                            </Grid>
                            <Grid item >
                                <Switch checked={repayChecked} onChange={(e) => { setRepayChecked(e.target.checked) }} />
                            </Grid>
                        </Grid>
                        <Button variant="contained" onClick={onClick}>Deposit</Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}