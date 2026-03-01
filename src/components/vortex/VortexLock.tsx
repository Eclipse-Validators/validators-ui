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
import { AlertTriangleIcon, CheckCircle2Icon, ArrowRight, Lock } from "lucide-react";
import { SkeletonCard } from "../loading/skeletonCard";

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

/* ---------- Vortex Portal (pure CSS) ---------- */

function VortexPortal() {
    return (
        <div className="relative mx-auto mb-8 flex h-[280px] w-[280px] items-center justify-center sm:h-[340px] sm:w-[340px]">
            {/* Outermost ring */}
            <div
                className="vortex-spin-slow absolute inset-0 rounded-full opacity-30"
                style={{
                    background:
                        "conic-gradient(from 0deg, transparent, rgba(139,92,246,0.4), transparent, rgba(139,92,246,0.2), transparent)",
                }}
            />
            {/* Outer ring */}
            <div
                className="vortex-spin absolute inset-4 rounded-full opacity-50"
                style={{
                    background:
                        "conic-gradient(from 0deg, transparent, rgba(139,92,246,0.6), transparent, rgba(168,85,247,0.4), transparent)",
                }}
            />
            {/* Middle ring */}
            <div
                className="vortex-spin-reverse absolute inset-12 rounded-full opacity-70"
                style={{
                    background:
                        "conic-gradient(from 90deg, transparent, rgba(168,85,247,0.7), transparent, rgba(192,132,252,0.5), transparent)",
                }}
            />
            {/* Inner ring */}
            <div
                className="vortex-spin absolute inset-20 rounded-full opacity-80"
                style={{
                    background:
                        "conic-gradient(from 180deg, transparent, rgba(192,132,252,0.8), transparent, rgba(139,92,246,0.6), transparent)",
                }}
            />
            {/* Core glow */}
            <div className="vortex-pulse absolute inset-[45%] rounded-full bg-violet-500/60 blur-xl" />
            <div className="absolute inset-[47%] rounded-full bg-violet-300/40 blur-md" />

            {/* Center text */}
            <div className="relative z-10 text-center">
                <div className="text-4xl font-black tracking-wider text-white sm:text-5xl"
                    style={{ textShadow: "0 0 30px rgba(139,92,246,0.8), 0 0 60px rgba(139,92,246,0.4)" }}>
                    VORTEX
                </div>
            </div>

            {/* Orbiting particles */}
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="vortex-particle absolute rounded-full bg-violet-400"
                    style={{
                        width: `${2 + Math.random() * 4}px`,
                        height: `${2 + Math.random() * 4}px`,
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        "--tx": `${(Math.random() - 0.5) * 200}px`,
                        "--ty": `${(Math.random() - 0.5) * 200}px`,
                        "--duration": `${3 + Math.random() * 4}s`,
                        "--delay": `${-Math.random() * 5}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

/* ---------- Migration flow steps ---------- */

function MigrationFlow({ lockedCount, totalCount }: { lockedCount: number; totalCount: number }) {
    return (
        <div className="mx-auto mb-8 flex max-w-lg items-center justify-center gap-3 sm:gap-4">
            <div className="flex flex-col items-center gap-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/20 ring-2 ring-violet-500/50 sm:h-14 sm:w-14">
                    <span className="text-lg font-bold text-violet-400">E</span>
                </div>
                <span className="text-xs text-muted-foreground">Eclipse</span>
            </div>

            <div className="flex flex-1 items-center">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-violet-500/50 to-violet-500" />
                <ArrowRight className="mx-1 h-4 w-4 flex-shrink-0 text-violet-400" />
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="vortex-pulse flex h-12 w-12 items-center justify-center rounded-full bg-violet-600/30 ring-2 ring-violet-400 sm:h-14 sm:w-14">
                    <Lock className="h-5 w-5 text-violet-300" />
                </div>
                <span className="text-xs font-medium text-violet-400">Vortex</span>
            </div>

            <div className="flex flex-1 items-center">
                <ArrowRight className="mx-1 h-4 w-4 flex-shrink-0 text-green-400" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-green-500 to-green-500/50" />
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 ring-2 ring-green-500/50 sm:h-14 sm:w-14">
                    <span className="text-lg font-bold text-green-400">S</span>
                </div>
                <span className="text-xs text-muted-foreground">Solana</span>
            </div>
        </div>
    );
}

/* ---------- Stats bar ---------- */

function VortexStats({ lockedCount, totalCount }: { lockedCount: number; totalCount: number }) {
    if (totalCount === 0) return null;
    const percentage = totalCount > 0 ? Math.round((lockedCount / totalCount) * 100) : 0;

    return (
        <div className="mx-auto mb-6 max-w-lg">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{lockedCount} of {totalCount} NFTs locked</span>
                <span className="text-violet-400 font-medium">{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-violet-500/10">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-700"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

/* ---------- Main component ---------- */

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

    const lockedCount = useMemo(() => {
        return Object.values(lockedMints).filter(Boolean).length;
    }, [lockedMints]);

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
                    NFT entered the vortex:{" "}
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
                <Card className="col-span-full border-violet-500/20">
                    <CardContent className="flex h-32 items-center justify-center">
                        <p className="text-center text-muted-foreground">No Token-2022 NFTs found</p>
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
            {/* Hero portal */}
            <VortexPortal />

            {/* Migration flow */}
            <MigrationFlow lockedCount={lockedCount} totalCount={nfts.length} />

            {/* Description */}
            <div className="mx-auto mb-6 max-w-2xl text-center">
                <p className="text-base text-muted-foreground sm:text-lg">
                    Lock your Token-2022 NFTs into a vault on Eclipse to migrate them to Solana.
                    Once locked, your NFTs can be re-minted on the other side.
                </p>
            </div>

            {/* Warning */}
            <div className="mx-auto mb-8 max-w-2xl">
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-4">
                    <p className="mb-1 flex items-center font-semibold text-yellow-400">
                        <AlertTriangleIcon className="mr-2 h-4 w-4" />
                        Irreversible Action
                    </p>
                    <p className="text-sm text-yellow-500/80">
                        Locking is permanent. Your NFT will be transferred to a program-controlled vault.
                        Only proceed if you intend to complete the migration to Solana.
                    </p>
                </div>
            </div>

            {/* Stats bar */}
            <VortexStats lockedCount={lockedCount} totalCount={nfts.length} />

            {/* Search */}
            <div className="relative mb-4">
                <Input
                    type="text"
                    placeholder="Search NFTs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-full border-violet-500/20 focus:border-violet-500/50 sm:max-w-sm"
                />
            </div>

            {/* NFT Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {renderNftCards()}
            </div>

            {/* Confirmation dialog */}
            <Dialog open={!!confirmToken} onOpenChange={() => setConfirmToken(null)}>
                <DialogContent className="border-violet-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-violet-400" />
                            Enter the Vortex
                        </DialogTitle>
                        <DialogDescription>
                            This action is permanent and cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {confirmToken && (
                        <div className="flex items-center gap-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                            {confirmToken.metadata?.image && (
                                <img
                                    src={confirmToken.metadata.image}
                                    alt={confirmToken.metadata?.name || "NFT"}
                                    className="h-20 w-20 rounded-lg object-cover ring-2 ring-violet-500/30"
                                />
                            )}
                            <div>
                                <p className="font-medium text-lg">
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
                            className="bg-violet-600 hover:bg-violet-700 text-white"
                            onClick={() => confirmToken && handleLock(confirmToken)}
                            disabled={lockingMint !== null}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            {lockingMint ? "Entering Vortex..." : "Lock Forever"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default VortexLock;
