import { ACCOUNT_SIZE, TOKEN_PROGRAM_ID, getMinimumBalanceForRentExemptAccount, createInitializeAccountInstruction } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, SystemProgram, Keypair, PublicKey } from "@solana/web3.js"
import { WRAPPED_SOL_MINT } from "../constants";

export const wrapSol = async (connection, publicKey, amount) => {
    const wrappedSolAccount = Keypair.generate();
    const instructions = [];
    const signers = [wrappedSolAccount];
    instructions.push(
        SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: wrappedSolAccount.publicKey,
            lamports: await getMinimumBalanceForRentExemptAccount(connection),
            space: ACCOUNT_SIZE,
            programId: TOKEN_PROGRAM_ID
        })
    );

    if (amount) {
        instructions.push(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: wrappedSolAccount.publicKey,
                lamports: Math.floor(amount * LAMPORTS_PER_SOL),
            })
        );
    }

    instructions.push(
        createInitializeAccountInstruction(
            wrappedSolAccount.publicKey,
            new PublicKey(WRAPPED_SOL_MINT),
            publicKey
        )
    );

    return { instructions, signers };
}