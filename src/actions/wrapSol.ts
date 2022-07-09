import { ACCOUNT_SIZE, TOKEN_PROGRAM_ID, getMinimumBalanceForRentExemptAccount, createInitializeAccountInstruction } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, SystemProgram, Keypair, PublicKey } from "@solana/web3.js"

const WRAPPED_SOL_MINT = new PublicKey(
    "So11111111111111111111111111111111111111112"
);

export const wrapSol = async (connection, publicKey, amount) => {
    const wrappedSolAccount = Keypair.generate();
    const instructions = [];
    const signers = [wrappedSolAccount];
    console.log("wrapping sol");
    instructions.push(
        SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: wrappedSolAccount.publicKey,
            lamports: await getMinimumBalanceForRentExemptAccount(connection),
            space: ACCOUNT_SIZE,
            programId: TOKEN_PROGRAM_ID
        })
    );

    instructions.push(
        SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: wrappedSolAccount.publicKey,
            lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        })
    );

    instructions.push(
        createInitializeAccountInstruction(
            wrappedSolAccount.publicKey,
            new PublicKey(WRAPPED_SOL_MINT),
            publicKey
        )
    );

    return { instructions, signers };
}