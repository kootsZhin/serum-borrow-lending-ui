import { Keypair, SystemProgram, Transaction } from '@solana/web3.js';
import { Box, TextField, Stack, Button } from '@mui/material';
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

import { depositReserveLiquidityInstruction, refreshReserveInstruction } from '../../../models/instructions';

export function DepositPanel(props: { index: number, market: string, value: number }) {
    const { value, market, index, ...other } = props;
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [depositAmount, setDepositAmount] = useState(0);

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();
        const config = await (await fetch('http://localhost:3001/api/markets')).json();
        const instructions = [];

        const assetConfig = findWhere(config.assets, { symbol: market });
        const reserveConfig = findWhere(config.markets[0].reserves, { asset: market });
        const oracleConfig = findWhere(config.oracles.assets, { asset: market });

        // Get or create the token account for collateral token
        const collateralToken = await getAssociatedTokenAddress(new PublicKey(reserveConfig!.collateralMintAddress), publicKey);
        let collateralAccount: Account;
        try {
            collateralAccount = await getAccount(connection, collateralToken);
        } catch (error: unknown) {
            if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
                instructions.push(createAssociatedTokenAccountInstruction(
                    publicKey,
                    collateralToken,
                    publicKey,
                    new PublicKey(reserveConfig!.collateralMintAddress
                    )
                ));
            }
        }

        const [authority] = await PublicKey.findProgramAddress(
            [new PublicKey(config.markets[0].address).toBuffer()],
            new PublicKey(config.programID)
        );

        const liquidityAddress = await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);
        console.log(oracleConfig.priceAddress)
        instructions.push(refreshReserveInstruction(
            new PublicKey(reserveConfig!.address),
            new PublicKey(config.programID),
            new PublicKey(oracleConfig.priceAddress)
        ))

        // deposit
        instructions.push(depositReserveLiquidityInstruction(
            depositAmount * 10 ** assetConfig.decimals,
            new PublicKey(config.programID),
            liquidityAddress,
            collateralToken,
            new PublicKey(reserveConfig!.address),
            new PublicKey(reserveConfig!.liquidityAddress),
            new PublicKey(reserveConfig!.collateralMintAddress),
            new PublicKey(config.markets[0].address),
            authority,
            publicKey
        ));

        const tx = new Transaction().add(...instructions);

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, "processed");

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
                        <TextField id="outlined-basic" label={`Enter ${market} Value`} variant="outlined" onChange={(event) => { setDepositAmount(Number(event.target.value)) }} />
                        <Button variant="contained" onClick={onClick}>Deposit</Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}