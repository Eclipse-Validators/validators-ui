"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import * as anchor from "@coral-xyz/anchor";
import {
    useAnchorWallet,
    useConnection,
} from "@solana/wallet-adapter-react";
import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    VersionedTransaction,
} from "@solana/web3.js";

import { ValidatorBurn, IDL } from "@/lib/anchor/burn/burn";
import { getConfigPda } from "@/lib/anchor/burn/constants";

interface Wallet {
    signTransaction<T extends Transaction | VersionedTransaction>(
        tx: T
    ): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(
        txs: T[]
    ): Promise<T[]>;
    publicKey: PublicKey;
}

type ProgramContextType = {
    program: anchor.Program<ValidatorBurn> | null;
    configAccount: {
        burnTokenFee: anchor.BN;
        burnNftFee: anchor.BN;
        closeTokenFee: anchor.BN;
        isEnabled: boolean;
        bump: number;
    } | null;
};

const ValidatorBurnContext = createContext<ProgramContextType>({
    program: null,
    configAccount: null,
});

export function ValidatorBurnProgramProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [program, setProgram] =
        useState<anchor.Program<ValidatorBurn> | null>(null);
    const [configAccount, setConfigAccount] = useState<{
        burnTokenFee: anchor.BN;
        burnNftFee: anchor.BN;
        closeTokenFee: anchor.BN;
        isEnabled: boolean;
        bump: number;
    } | null>(null);
    const wallet = useAnchorWallet();
    const { connection } = useConnection();

    useEffect(() => {
        const setupProgram = async () => {
            let walletAdapter: Wallet;
            if (wallet) {
                walletAdapter = wallet;
            } else {
                const dummyKeypair = Keypair.generate();
                walletAdapter = {
                    publicKey: dummyKeypair.publicKey,
                    signTransaction: async (tx) => {
                        console.log("no signer");
                        return tx;
                    },
                    signAllTransactions: async (txs) => {
                        return txs.map((tx) => {
                            console.log("no signer");
                            return tx;
                        });
                    },
                };
            }

            const provider = new anchor.AnchorProvider(
                connection,
                walletAdapter
            );
            anchor.setProvider(provider);
            const program = new anchor.Program<ValidatorBurn>(
                IDL,
                provider
            );

            setProgram(program);

            try {
                const [configPda] = getConfigPda(program.programId);
                const config = await program.account.validatorBurnConfig.fetchNullable(configPda);
                setConfigAccount(config);
            } catch (error) {
                console.error("Error fetching config account:", error);
                setConfigAccount(null);
            }
        };

        setupProgram();
    }, [wallet, wallet?.publicKey, connection]);

    return (
        <ValidatorBurnContext.Provider value={{ program, configAccount }}>
            {children}
        </ValidatorBurnContext.Provider>
    );
}

export function useValidatorBurnProgram() {
    const context = useContext(ValidatorBurnContext);
    if (context === undefined) {
        throw new Error("useValidatorBurnProgram must be used within a ValidatorBurnProgramProvider");
    }
    return context;
}