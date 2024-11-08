import * as anchor from "@coral-xyz/anchor";
import { Connection, Keypair } from "@solana/web3.js";
import { IDL, ValidatorBurn } from "../anchor/burn/burn";

export type ValidatorBurnCustomWallet = {
    publicKey: anchor.web3.PublicKey;
    signTransaction: <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(
        transaction: T
    ) => Promise<T>;
    signAllTransactions: <T extends anchor.web3.Transaction | anchor.web3.VersionedTransaction>(
        transactions: T[]
    ) => Promise<T[]>;
};

export function createValidatorBurnProgram(
    connection: Connection,
    wallet: ValidatorBurnCustomWallet
) {
    const provider = new anchor.AnchorProvider(
        connection,
        wallet,
        anchor.AnchorProvider.defaultOptions()
    );

    anchor.setProvider(provider);
    return new anchor.Program<ValidatorBurn>(
        IDL,
        provider
    );
}

export function createValidatorBurnProgramFromKeypair(
    connection: Connection,
    keypair: Keypair
) {
    const wallet: ValidatorBurnCustomWallet = {
        publicKey: keypair.publicKey,
        signTransaction: async (transaction) => {
            if (transaction instanceof anchor.web3.Transaction) {
                transaction.sign(keypair);
            }
            return transaction;
        },
        signAllTransactions: async (transactions) => {
            return transactions.map((tx) => {
                if (tx instanceof anchor.web3.Transaction) {
                    tx.sign(keypair);
                }
                return tx;
            });
        },
    };

    return createValidatorBurnProgram(connection, wallet);
}