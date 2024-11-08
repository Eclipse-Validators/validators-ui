"use client";

import { useState, useEffect, Suspense } from "react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getMint, AuthorityType, createUpdateAuthorityInstruction, createSetAuthorityInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { ShieldCheck, ExternalLink, Share2, LockIcon } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";

import { useGlobalConnection } from "@/components/GlobalConnectionProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTokenMetadataHelper } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CopyableText } from "@/components/ui/copyableText";
import { FEE_COLLECTOR_ADDRESS } from "@/lib/anchor/burn/constants";

interface TokenAuthority {
    mintAddress: string;
    mintAuthority: string | null;
    freezeAuthority: string | null;
    tokenProgram: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID;
    tokenAccount: string,
    metadata?: {
        name?: string;
        symbol?: string;
        image?: string;
        description?: string;
    };
    isConnectedWalletAuthority: boolean;
}

function RevokeContent() {
    const connection = useGlobalConnection();
    const { publicKey, signTransaction } = useWallet();
    const [mintAddress, setMintAddress] = useState("");
    const [authority, setAuthority] = useState<TokenAuthority | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const mintParam = searchParams.get('mint');

    useEffect(() => {
        if (mintParam && !mintAddress) {
            setMintAddress(mintParam);
            checkAuthority(mintParam);
        }
    }, [mintParam, publicKey]);

    const checkAuthority = async (address?: string) => {
        if (!publicKey) {
            toast.error("Please connect your wallet first");
            return;
        }

        const mintToCheck = address || mintAddress;
        setLoading(true);
        setError(null);

        router.push(`/manage?mint=${mintToCheck}`);

        try {
            const mint = new PublicKey(mintToCheck);
            let tokenProgram;
            let mintInfo;

            try {
                mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
                tokenProgram = TOKEN_2022_PROGRAM_ID;
            } catch (e) {
                try {
                    mintInfo = await getMint(connection, mint, "confirmed", TOKEN_PROGRAM_ID);
                    tokenProgram = TOKEN_PROGRAM_ID;
                } catch (e) {
                    throw new Error("Could not fetch mint info from either token program");
                }
            }

            if (!mintInfo) {
                throw new Error("Could not fetch mint info");
            }

            const metadata = await fetchTokenMetadataHelper(connection, mint, tokenProgram);
            const tokenAccount = getAssociatedTokenAddressSync(mint, publicKey);
            setAuthority({
                mintAddress: mintToCheck,
                mintAuthority: mintInfo.mintAuthority?.toString() || null,
                freezeAuthority: mintInfo.freezeAuthority?.toString() || null,
                tokenProgram,
                tokenAccount: tokenAccount.toBase58(),
                metadata: metadata || undefined,
                isConnectedWalletAuthority:
                    (mintInfo.mintAuthority?.equals(publicKey) || false) ||
                    (mintInfo.freezeAuthority?.equals(publicKey) || false)
            });

        } catch (err) {
            setError("Invalid mint address or error fetching token info");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const revokeAuthority = async (type: 'mint' | 'freeze') => {
        if (!publicKey || !signTransaction || !authority) return;

        try {
            setLoading(true);
            const mint = new PublicKey(authority.mintAddress);
            const setAuthorityIx = createSetAuthorityInstruction(mint,
                publicKey,
                type === 'mint' ? AuthorityType.MintTokens : AuthorityType.FreezeAccount,
                null, undefined,
                authority.tokenProgram);
            const transaction = new Transaction();
            const latestBlockhash = await connection.getLatestBlockhashAndContext();
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = latestBlockhash.value.blockhash;
            transaction.add(setAuthorityIx);

            const tx = await signTransaction(transaction);
            const txSig = await connection.sendRawTransaction(tx.serialize());
            await connection.confirmTransaction(txSig);
            toast.success(`Successfully revoked ${type} authority`, {
                description: "Transaction confirmed on Solana blockchain",
                action: {
                    label: "View Transaction",
                    onClick: () => window.open(
                        `${process.env.NEXT_PUBLIC_EXPLORER!}/tx/${transaction}`,
                        "_blank"
                    ),
                },
            });

            // Refresh authority info
            await checkAuthority();
        } catch (err) {
            console.error(err);
            toast.error(`Failed to revoke ${type} authority`);
        } finally {
            setLoading(false);
        }
    };

    const getExplorerUrl = (address: string) =>
        `https://dev.eclipsescan.xyz/token/${address}`;

    const shareAnalysis = () => {
        const url = `${window.location.origin}/manage?mint=${mintAddress}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Token Management</h1>
                <p className="text-muted-foreground">
                    Enter a token mint address to check and revoke authorities if you are the current authority.
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-l-2 border-primary/50 pl-3">
                    <ShieldCheck className="h-4 w-4" />
                    <p>
                        More management tools coming soon: Update metadata, manage token extensions,
                        and configure advanced Token-2022 features.
                    </p>
                </div>
            </div>

            <div className="flex gap-4">
                <Input
                    placeholder="Enter mint address..."
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                />
                <Button onClick={() => checkAuthority()} disabled={loading}>
                    {loading ? "Checking..." : "Check"}
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {authority && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                {authority.metadata?.name || "Unknown Token"}
                                {!authority.isConnectedWalletAuthority && (
                                    <LockIcon className="h-5 w-5 text-yellow-500" />
                                )}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <a
                                    href={getExplorerUrl(mintAddress)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <ExternalLink size={16} />
                                </a>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={shareAnalysis}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <Share2 size={16} />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Token Basic Info */}
                        <div className="flex items-start gap-6">
                            {authority.metadata?.image && (
                                <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                                    <img
                                        src={authority.metadata.image}
                                        alt={authority.metadata.name || "Token"}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Symbol:</span>
                                    <span>{authority.metadata?.symbol || "Unknown"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Mint:</span>
                                    <div className="flex items-center gap-2">
                                        <CopyableText text={mintAddress} maxLength={8} />
                                    </div>
                                </div>
                                {authority.metadata?.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {authority.metadata.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Authority Management */}
                        <div className="space-y-4">
                            <h3 className="font-semibold">Authority Management</h3>

                            {!authority.isConnectedWalletAuthority && (
                                <Card className="border-yellow-200 bg-yellow-50">
                                    <CardContent className="pt-6 flex items-center gap-2">
                                        <LockIcon className="h-5 w-5 text-yellow-500" />
                                        <p className="text-yellow-700">
                                            Connected wallet does not have authority to revoke any permissions for this token.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="grid gap-4">
                                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Mint Authority</h4>
                                        {authority.mintAuthority ? (
                                            <CopyableText text={authority.mintAuthority} maxLength={8} />
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Disabled
                                            </Badge>
                                        )}
                                    </div>
                                    {authority.mintAuthority && authority.isConnectedWalletAuthority && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => revokeAuthority('mint')}
                                            disabled={loading}
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </div>

                                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                                    <div>
                                        <h4 className="font-medium">Freeze Authority</h4>
                                        {authority.freezeAuthority ? (
                                            <CopyableText text={authority.freezeAuthority} maxLength={8} />
                                        ) : (
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Disabled
                                            </Badge>
                                        )}
                                    </div>
                                    {authority.freezeAuthority && authority.isConnectedWalletAuthority && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => revokeAuthority('freeze')}
                                            disabled={loading}
                                        >
                                            Revoke
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function RevokePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RevokeContent />
        </Suspense>
    );
} 