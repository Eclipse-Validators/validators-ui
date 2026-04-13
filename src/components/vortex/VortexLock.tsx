"use client";

import React, { useCallback, useEffect, useDeferredValue, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useWalletTokens } from "@/lib/hooks/useWalletTokens";
import { useGroupMembers } from "@/components/providers/GroupMembersContext";
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
import {
    AlertTriangleIcon,
    CheckCircle2Icon,
    ArrowRight,
    Lock,
    Loader2,
    XCircle,
    ExternalLink,
} from "lucide-react";
import { SkeletonCard } from "../loading/skeletonCard";
import { CopyableText } from "@/components/ui/copyableText";

const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

type LockStatus =
    | "idle"
    | "preparing"
    | "awaiting_approval"
    | "submitted"
    | "confirmed"
    | "failed";

/* ---------- Star field background ---------- */

const STARS = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() < 0.85 ? 1 + Math.random() : 2 + Math.random() * 2,
    duration: 2 + Math.random() * 5,
    delay: -Math.random() * 6,
    color: Math.random() > 0.7 ? "bg-violet-400" : "bg-white",
}));

function StarField() {
    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: -1 }}>
            {STARS.map((star) => (
                <div
                    key={star.id}
                    className={`vortex-star ${star.color}`}
                    style={{
                        left: `${star.x}%`,
                        top: `${star.y}%`,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        "--twinkle-duration": `${star.duration}s`,
                        "--twinkle-delay": `${star.delay}s`,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
}

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

/* ---------- Lock status banner ---------- */

function LockStatusBanner({
    status,
    signature,
    error,
    onDismiss,
}: {
    status: LockStatus;
    signature: string | null;
    error: string | null;
    onDismiss: () => void;
}) {
    if (status === "idle") return null;

    const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER;

    const config: Record<
        Exclude<LockStatus, "idle">,
        { icon: React.ReactNode; label: string; color: string; bg: string }
    > = {
        preparing: {
            icon: <Loader2 className="h-4 w-4 animate-spin" />,
            label: "Preparing transaction...",
            color: "text-violet-400",
            bg: "bg-violet-500/10 border-violet-500/30",
        },
        awaiting_approval: {
            icon: <Loader2 className="h-4 w-4 animate-spin" />,
            label: "Waiting for wallet approval...",
            color: "text-yellow-400",
            bg: "bg-yellow-500/10 border-yellow-500/30",
        },
        submitted: {
            icon: <Loader2 className="h-4 w-4 animate-spin" />,
            label: "Confirming on Eclipse...",
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/30",
        },
        confirmed: {
            icon: <CheckCircle2Icon className="h-4 w-4" />,
            label: "Transaction confirmed!",
            color: "text-green-400",
            bg: "bg-green-500/10 border-green-500/30",
        },
        failed: {
            icon: <XCircle className="h-4 w-4" />,
            label: error || "Transaction failed",
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/30",
        },
    };

    const c = config[status as Exclude<LockStatus, "idle">];

    return (
        <div className="mx-auto mb-6 max-w-2xl">
            <div className={`rounded-lg border p-4 ${c.bg}`}>
                <div className={`flex items-center gap-2 ${c.color}`}>
                    {c.icon}
                    <span className="text-sm font-medium">{c.label}</span>
                    {(status === "confirmed" || status === "failed") && (
                        <button
                            onClick={onDismiss}
                            className="ml-auto rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        >
                            Dismiss
                        </button>
                    )}
                </div>
                {signature && (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Signature:</span>
                        <CopyableText text={signature} maxLength={16} />
                        {explorerUrl && (
                            <a
                                href={`${explorerUrl}/tx/${signature}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-auto text-violet-400 hover:text-violet-300"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------- Main component ---------- */

const VortexLock: React.FC = () => {
    const { connection } = useConnection();
    const { publicKey, signTransaction, sendTransaction } = useWallet();
    const { program } = useVortexProgram();

    const {
        tokens: token2022Tokens,
        loading: loadingTokens,
        error: errorTokens,
        refreshTokens,
    } = useWalletTokens(true);
    const { hashlist, isLoading: membersLoading } = useGroupMembers();

    const [lockedMints, setLockedMints] = useState<Record<string, boolean>>({});
    const [checkingVaults, setCheckingVaults] = useState(false);
    const [lockingMint, setLockingMint] = useState<string | null>(null);
    const [confirmToken, setConfirmToken] = useState<FetchedTokenInfo | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearch = useDeferredValue(searchQuery);
    const [lockStatus, setLockStatus] = useState<LockStatus>("idle");
    const [lockSignature, setLockSignature] = useState<string | null>(null);
    const [lockError, setLockError] = useState<string | null>(null);

    const nfts = useMemo(() => {
        return token2022Tokens.filter(
            (token) => token.decimals === 0 && hashlist.has(token.mint)
        );
    }, [token2022Tokens, hashlist]);

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

    const dismissLockStatus = useCallback(() => {
        setLockStatus("idle");
        setLockSignature(null);
        setLockError(null);
    }, []);

    const isLockPending =
        lockStatus === "preparing" ||
        lockStatus === "awaiting_approval" ||
        lockStatus === "submitted";

    const handleLock = async (token: FetchedTokenInfo) => {
        if (!publicKey || !program || isLockPending) return;

        setLockingMint(token.mint);
        setConfirmToken(null);
        setLockStatus("preparing");
        setLockSignature(null);
        setLockError(null);

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
            const { blockhash, lastValidBlockHeight } =
                await connection.getLatestBlockhash("confirmed");
            tx.recentBlockhash = blockhash;
            tx.feePayer = publicKey;

            setLockStatus("awaiting_approval");

            let sig: string;
            try {
                sig = await sendTransaction(tx, connection);
            } catch (sendErr) {
                const errMsg =
                    sendErr instanceof Error
                        ? sendErr.message
                        : String(sendErr);
                const rejected =
                    errMsg.includes("User rejected") ||
                    errMsg.includes("rejected the request") ||
                    (sendErr as { code?: number })?.code === 4001;

                if (!rejected && signTransaction) {
                    const signedTx = await signTransaction(tx);
                    sig = await connection.sendRawTransaction(
                        signedTx.serialize()
                    );
                } else {
                    throw sendErr;
                }
            }

            setLockStatus("submitted");
            setLockSignature(sig);

            await connection.confirmTransaction(
                { signature: sig, blockhash, lastValidBlockHeight },
                "confirmed"
            );

            setLockStatus("confirmed");

            toast.success(
                <div className="flex items-center gap-2">
                    <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                    NFT entered the vortex
                </div>
            );

            setLockedMints((prev) => ({ ...prev, [token.mint]: true }));
            refreshTokens();
        } catch (err: unknown) {
            console.error("Error locking NFT:", err);

            const message =
                err instanceof Error ? err.message : String(err);
            const isRejection =
                message.includes("User rejected") ||
                message.includes("rejected the request") ||
                (err as { code?: number })?.code === 4001;

            setLockStatus("failed");
            setLockError(
                isRejection
                    ? "Transaction rejected by wallet"
                    : message || "Failed to lock NFT"
            );

            if (!isRejection) {
                toast.error("Failed to lock NFT");
            }
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
        if (loadingTokens || membersLoading || checkingVaults) {
            return Array(6)
                .fill(0)
                .map((_, index) => <SkeletonCard key={index} />);
        }

        if (filteredNfts.length === 0) {
            return (
                <Card className="col-span-full border-violet-500/20">
                    <CardContent className="flex h-32 items-center justify-center">
                        <p className="text-center text-muted-foreground">No Validators NFTs found</p>
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
    }, [filteredNfts, loadingTokens, membersLoading, checkingVaults, lockedMints, lockingMint]);

    if (errorTokens) return <div>Error: {errorTokens}</div>;

    return (
        <div className="vortex-backdrop min-h-screen">
            <StarField />
            <div className="vortex-scanlines" />

            <div className="container relative z-10 mx-auto p-3 pt-12 sm:p-4 sm:pt-16">
            {/* Hero portal */}
            <VortexPortal />

            {/* Migration flow */}
            <MigrationFlow lockedCount={lockedCount} totalCount={nfts.length} />

            {/* Description */}
            <div className="mx-auto mb-6 max-w-2xl text-center">
                <p className="text-base text-muted-foreground sm:text-lg">
                    Lock your Validators NFTs into a vault on Eclipse to migrate them to Solana.
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

            {/* Lock status */}
            <LockStatusBanner
                status={lockStatus}
                signature={lockSignature}
                error={lockError}
                onDismiss={dismissLockStatus}
            />

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
                            disabled={lockingMint !== null || isLockPending}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            {lockingMint ? "Entering Vortex..." : "Lock Forever"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </div>
    );
};

export default VortexLock;
