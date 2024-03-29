import { Transaction } from '@solana/web3.js';

export const sendAndNotifyTransactions = async (connection, sendTransaction, notify, instructions, signers?) => {
    try {
        const tx = new Transaction().add(...instructions);
        const signature = await sendTransaction(tx, connection, { signers: signers });

        notify('info', 'Transaction sent:', signature);

        await connection.confirmTransaction(signature, 'confirmed');
        notify('success', 'Transaction successful!', signature);
    } catch (error: unknown) {
        notify("error", `Error: ${error}`);
    }
}