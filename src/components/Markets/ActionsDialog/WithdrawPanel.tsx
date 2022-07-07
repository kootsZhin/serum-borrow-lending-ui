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

import { depositReserveLiquidityAndObligationCollateralInstruction, initObligationInstruction, refreshReserveInstruction, refreshObligationInstruction } from '../../../models/instructions';
import { OBLIGATION_SIZE } from '../../../models';
import { BASEURI } from '../../../constants';
import { getReserves, getObligations } from '../../../utils';
import { withdrawObligationCollateralAndRedeemReserveLiquidity } from '../../../models/instructions/withdrawObligationCollateralAndRedeemReserveLiquidity';
import { WAD } from '../../../constants';
import { BigNumber } from 'bignumber.js';

export function WithdrawPanel(props: { index: number, market: string, value: number }) {
    const { value, market, index, ...other } = props;
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    const [withdrawAmount, setWithdrawAmount] = useState(0);

    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();
        const config = await (await fetch(`${BASEURI}/api/markets`)).json();
        const instructions = [];

        const assetConfig = findWhere(config.assets, { symbol: market });
        const reserveConfig = findWhere(config.markets[0].reserves, { asset: market });
        const oracleConfig = findWhere(config.oracles.assets, { asset: market });

        const allObligation = await getObligations(connection, config, config.markets[0].address);
        const userObligation = find(allObligation, (r) => r!.data.owner.toString() === publicKey.toString());

        let userDepositedReserves: PublicKey[] = [];
        let userBorrowedReserves: PublicKey[] = [];
        if (userObligation) {
            userObligation.data.deposits.forEach((deposit) => { userDepositedReserves.push(deposit.depositReserve) });
            userObligation.data.borrows.forEach((borrow) => { userBorrowedReserves.push(borrow.borrowReserve) });
        }

        const userCollateralAccount = await getAssociatedTokenAddress(new PublicKey(reserveConfig.collateralMintAddress), publicKey);
        const userLiquidityAccount = await getAssociatedTokenAddress(new PublicKey(assetConfig.mintAddress), publicKey);

        const allReserves: any = await getReserves(connection, config, config.markets[0].address);
        const reserveParsed = find(allReserves, (r) => r!.pubkey.toString() === reserveConfig.address)!.data;

        const [authority] = await PublicKey.findProgramAddress(
            [new PublicKey(config.markets[0].address).toBuffer()],
            new PublicKey(config.programID)
        );

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


        const totalBorrowWads = reserveParsed.liquidity.borrowedAmountWads;
        const totalLiquidityWads = (new BigNumber(reserveParsed.liquidity.availableAmount)).multipliedBy(WAD);
        const totalDepositWads = totalBorrowWads.plus(totalLiquidityWads);
        const cTokenExchangeRate = totalDepositWads.dividedBy(new BigNumber(reserveParsed.collateral.mintTotalSupply)).dividedBy(WAD);

        instructions.push(withdrawObligationCollateralAndRedeemReserveLiquidity(
            Number((new BigNumber(withdrawAmount * 10 ** assetConfig.decimals))
                .dividedBy(cTokenExchangeRate)
                .integerValue(BigNumber.ROUND_FLOOR).toString()),
            new PublicKey(config.programID),
            new PublicKey(reserveConfig.collateralSupplyAddress),
            userCollateralAccount,
            new PublicKey(reserveConfig.address),
            userObligation.pubkey,
            new PublicKey(config.markets[0].address),
            authority,
            userLiquidityAccount,
            new PublicKey(reserveConfig.collateralMintAddress),
            new PublicKey(reserveConfig.liquidityAddress),
            publicKey,
            publicKey
        ))

        const tx = new Transaction().add(...instructions);

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, "processed");

    }, [withdrawAmount, publicKey, sendTransaction, connection]);

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
                        <TextField id="outlined-basic" label={`Enter ${market} Value`} variant="outlined" onChange={(event) => { setWithdrawAmount(Number(event.target.value)) }} />
                        <Grid container>
                            <Grid item >
                                <Typography>Borrow funds</Typography>
                            </Grid>
                            <Grid item >
                                <Switch />
                            </Grid>
                        </Grid>
                        <Button variant="contained" onClick={onClick}>Withdraw</Button>
                    </Stack>
                </Box>
            )}
        </div >
    );
}