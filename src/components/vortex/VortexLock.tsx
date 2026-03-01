"use client";

import React, { useCallback, useEffect, useDeferredValue, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWalletTokens } from "@/lib/hooks/useWalletTokens";
import { FetchedTokenInfo } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useVortexProgram } from "../providers/VortexProgramContext";
import { VortexNftCard } from "./VortexNftCard";
import { getVaultPda } from "@/lib/anchor/vortex/constants";
import { toast } from "sonner";
import { AlertTriangleIcon, CheckCircle2Icon } from "lucide-react";
import { SkeletonCard } from "../loading/skeletonCard";

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const VortexLock: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction } = useWallet();
    const { program } = useVortexProgram();

    const {
        tokens: token2022Tokens,
        loading: loadingTokens,
        error: errorTokens,
        refreshTokens,
    } = useWalletTokens(true);

    const [lockedMints, setLockedMints] = useState<Record<string, boolean>>({});
    const [checkingVaults, setCheckingVaults] = useState(false);
    const [lockingMint, setLockingMint] = useState<string | null>(null);
    const [confirmToken, setConfirmToken] = useState<FetchedTokenInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearch = useDeferredValue(searchQuery);

    // Filter to NFTs only: decimals === 0
    const nfts = useMemo(() => {
        return token2022Tokens.filter(
            (token) => token.decimals === 0
        );
    }, [token2022Tokens]);

    // Check vault status for all NFTs
    const checkVaultStatuses = useCallback(async () => {
        if (nfts.length === 0) return;
        setCheckingVaults(true);
        try {
            const vaultPdas = nfts.map((nft) => {
                const [vaultPda] = getVaultPda(new PublicKey(nft.mint));
                return vaultPda;
            });
            const accounts = await connection.getMultipleAccountsInfo(vaultPdas);
            const statuses: Record<string, boolean> = {};
            nfts.forEach((nft, index) => {
                statuses[nft.mint] = accounts[index] !== null;
            });
            setLockedMints(statuses);
        } catch (error) {
            console.error("Error checking vault statuses:", error);
        } finally {
            setCheckingVaults(false);
        }
    }, [nfts, connection]);

    useEffect(() => {
        checkVaultStatuses();
    }, [checkVaultStatuses]);

    const handleLock = async (token: FetchedTokenInfo) => {
        if (!publicKey || !program || !signTransaction) return;
        setLockingMint(token.mint);
        setConfirmToken(null);

        try {
            const nftMint = new PublicKey(token.mint);
            const [vaultPda] = getVaultPda(nftMint);
            const vaultTokenAccount = getAssociatedTokenAddressSync(
                nftMint,
                vaultPda,
                true,
                TOKEN_2022_PROGRAM_ID
            );

            const ix = await program.methods
                .lockNft()
                .accountsPartial({
                    owner: publicKey,
                    nftMint: nftMint,
                    userTokenAccount: new PublicKey(token.tokenAccount),
                    vault: vaultPda,
                    vaultTokenAccount: vaultTokenAccount,
                    tokenProgram: TOKEN_2022_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                })
                .instruction();

            const tx = new Transaction().add(ix);
            const { blockhash } = await connection.getLatestBlockhash();
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            const signedTx = await signTransaction(tx);
            const sig = await connection.sendRawTransaction(signedTx.serialize());
            await connection.confirmTransaction(sig, "confirmed");

            toast.success(
                <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                    NFT locked successfully:{" "}
                    <a
                        href={`${process.env.NEXT_PUBLIC_EXPLORER}/tx/${sig}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                    >
                        {sig.slice(0, 8)}...
                    </a>
                </div>
            );

            setLockedMints((prev) => ({ ...prev, [token.mint]: true }));
            refreshTokens();
        } catch (error) {
            console.error("Error locking NFT:", error);
            toast.error("Failed to lock NFT");
        } finally {
            setLockingMint(null);
        }
    };

    const filteredNfts = useMemo(() => {
        return nfts.filter(
            (token) =>
                token.metadata?.name
                    ?.toLowerCase()
                    .includes(deferredSearch.toLowerCase()) ||
                token.mint.toLowerCase().includes(deferredSearch.toLowerCase()) ||
                token.metadata?.symbol
                    ?.toLowerCase()
                    .includes(deferredSearch.toLowerCase())
        );
    }, [nfts, deferredSearch]);

    const renderNftCards = useCallback(() => {
        if (loadingTokens || checkingVaults) {
            return Array(6)
                .fill(0)
                .map((_, index) => <SkeletonCard key={index} />);
        }

        if (filteredNfts.length === 0) {
            return (
                <Card>
                    <CardContent className="flex h-32 items-center justify-center">
                        <p className="text-center text-gray-500">No Token-2022 NFTs found</p>
                    </CardContent>
                </Card>
            );
        }

        return filteredNfts.map((token) => (
            <VortexNftCard
                key={token.tokenAccount}
                token={token}
                isLocked={!!lockedMints[token.mint]}
                isLocking={lockingMint === token.mint}
                onLock={() => setConfirmToken(token)}
            />
        ));
    }, [filteredNfts, loadingTokens, checkingVaults, lockedMints, lockingMint]);

    if (errorTokens) return <div>Error: {errorTokens}</div>;

    return (
        <div className="container mx-auto p-3 sm:p-4">
            <h1 className="mb-4 text-xl sm:text-2xl font-bold">Vortex</h1>

            <div className="mb-6 sm:mb-8 space-y-4 max-w-3xl">
                <p className="text-base sm:text-lg text-muted-foreground">
                    Lock your Token-2022 NFTs into a vault on Eclipse as the first step of migrating them to Solana.
                </p>

                <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
                    <p className="font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                        <span className="flex items-center">
                            <AlertTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                            WARNING
                        </span>
                    </p>
                    <p className="text-yellow-700 dark:text-yellow-500">
                        Locking is permanent and irreversible. Once locked, your NFT will be
                        transferred to a program-controlled vault. Only proceed if you intend
                        to migrate this NFT to Solana.
                    </p>
                </div>
            </div>

            <div className="relative mb-4">
                <Input
                    type="text"
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-full sm:max-w-sm"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {renderNftCards()}
            </div>

            <Dialog open={!!confirmToken} onOpenChange={() => setConfirmToken(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm NFT Lock</DialogTitle>
                        <DialogDescription>
                            This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {confirmToken && (
                        <div className="flex items-center gap-4 py-4">
                            {confirmToken.metadata?.image && (
                                <img
                                    src={confirmToken.metadata.image}
                                    alt={confirmToken.metadata?.name || "NFT"}
                                    className="h-16 w-16 rounded object-cover"
                                />
                            )}
                            <div>
                                <p className="font-medium">
                                    {confirmToken.metadata?.name ||
                                        confirmToken.mint.slice(0, 4) +
                                            "..." +
                                            confirmToken.mint.slice(-4)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {confirmToken.mint.slice(0, 8)}...{confirmToken.mint.slice(-8)}
                                </p>
                            </div>
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Your NFT will be transferred to a program-controlled vault as part
                        of the Eclipse-to-Solana migration. This cannot be reversed.
                    </p>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setConfirmToken(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => confirmToken && handleLock(confirmToken)}
                            disabled={lockingMint !== null}
                        >
                            {lockingMint ? "Locking..." : "Lock Forever"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VortexLock;
