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
    Keypair,
    PublicKey,
    Transaction,
    VersionedTransaction,
} from "@solana/web3.js";

import { Vortex, IDL } from "@/lib/anchor/vortex/vortex";

interface Wallet {
    signTransaction<T extends Transaction | VersionedTransaction>(
        tx: T
    ): Promise<T>;
    signAllTransactions<T extends Transaction | VersionedTransaction>(
        txs: T[]
    ): Promise<T[]>;
    publicKey: PublicKey;
}

type VortexProgramContextType = {
    program: anchor.Program<Vortex> | null;
};

const VortexContext = createContext<VortexProgramContextType>({
    program: null,
});

export function VortexProgramProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [program, setProgram] =
        useState<anchor.Program<Vortex> | null>(null);
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
            const program = new anchor.Program<Vortex>(
                IDL,
                provider
            );

            setProgram(program);
        };

        setupProgram();
    }, [wallet, wallet?.publicKey, connection]);

    return (
        <VortexContext.Provider value={{ program }}>
            {children}
        </VortexContext.Provider>
    );
}

export function useVortexProgram() {
    const context = useContext(VortexContext);
    if (context === undefined) {
        throw new Error("useVortexProgram must be used within a VortexProgramProvider");
    }
    return context;
}
