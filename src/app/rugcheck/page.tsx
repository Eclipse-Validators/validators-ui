"use client";

import { useState, useEffect, Suspense } from "react";
import { ParsedAccountData, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getMint, getExtensionTypes, ExtensionType } from "@solana/spl-token";
import { AlertTriangle, ShieldAlert, ExternalLink, ShieldCheck, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useGlobalConnection } from "@/components/GlobalConnectionProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchTokenMetadataHelper } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CopyableText } from "@/components/ui/copyableText";

interface TokenAnalysis {
    mintAuthority: string | null;
    freezeAuthority: string | null;
    supply: bigint;
    decimals: number;
    tokenProgram: typeof TOKEN_2022_PROGRAM_ID | typeof TOKEN_PROGRAM_ID;
    metadata?: {
        name?: string;
        symbol?: string;
        image?: string;
        description?: string;
    };
    largestHolders: {
        owner: string | null;
        address: string;
        amount: string;
        percentage: number;
    }[];
    warnings: {
        level: 'high' | 'medium' | 'low';
        message: string;
    }[];
    extensions?: ExtensionType[];
}

function RugCheckContent() {
    const connection = useGlobalConnection();
    const [mintAddress, setMintAddress] = useState("");
    const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();
    const mintParam = searchParams.get('mint');

    useEffect(() => {
        if (mintParam && !mintAddress) {
            setMintAddress(mintParam);
            analyzeToken(mintParam);
        }
    }, [mintParam]);

    const analyzeToken = async (address?: string) => {
        const mintToAnalyze = address || mintAddress;
        setLoading(true);
        setError(null);

        router.push(`/rugcheck?mint=${mintToAnalyze}`);

        try {
            const mint = new PublicKey(mintToAnalyze);

            let tokenProgram;
            let mintInfo;
            let extensionTypes: ExtensionType[] = [];

            try {
                mintInfo = await getMint(connection, mint, "confirmed", TOKEN_2022_PROGRAM_ID);
                tokenProgram = TOKEN_2022_PROGRAM_ID;
                extensionTypes = getExtensionTypes(mintInfo.tlvData);
            } catch (e) {
                try {
                    mintInfo = await getMint(connection, mint, "confirmed", TOKEN_PROGRAM_ID);
                    tokenProgram = TOKEN_PROGRAM_ID;
                } catch (e) {
                    throw new Error("Could not fetch mint info from either token program");
                }
            }

            if (!mintInfo) {
                throw new Error("Could not fetch mint info from either token program");
            }

            const tokenAccounts = await connection.getTokenLargestAccounts(mint);
            const metadata = await fetchTokenMetadataHelper(connection, mint, tokenProgram);

            const warnings: Array<{
                level: 'high' | 'medium' | 'low';
                message: string;
            }> = [];

            if (mintInfo.mintAuthority) {
                warnings.push({
                    level: 'high',
                    message: "Mint authority is enabled - token supply can be increased"
                });
            }
            if (mintInfo.freezeAuthority) {
                warnings.push({
                    level: 'high',
                    message: "Freeze authority is enabled - accounts can be frozen"
                });
            }

            const holders = await Promise.all(
                tokenAccounts.value.map(async (account) => {
                    const owner = await connection.getParsedAccountInfo(account.address);
                    const ownerAddress = (owner?.value?.data as ParsedAccountData)?.parsed?.info?.owner?.toString() || null;
                    const percentage = Number(account.amount) / Number(mintInfo.supply) * 100;

                    if (percentage > 40) {
                        warnings.push({
                            level: 'high',
                            message: `Wallet ${ownerAddress || account.address.toString()} holds ${percentage.toFixed(2)}% of supply`
                        });
                    } else if (percentage > 20) {
                        warnings.push({
                            level: 'medium',
                            message: `Wallet ${ownerAddress || account.address.toString()} holds ${percentage.toFixed(2)}% of supply`
                        });
                    }

                    return {
                        owner: (owner?.value?.data as ParsedAccountData)?.parsed?.info?.owner?.toString() || null,
                        address: account.address.toString(),
                        amount: account.amount,
                        percentage
                    };
                })
            );

            setAnalysis({
                mintAuthority: mintInfo.mintAuthority?.toString() || null,
                freezeAuthority: mintInfo.freezeAuthority?.toString() || null,
                supply: mintInfo.supply,
                decimals: mintInfo.decimals,
                tokenProgram,
                metadata: metadata || undefined,
                largestHolders: holders,
                warnings,
                extensions: tokenProgram === TOKEN_2022_PROGRAM_ID ? extensionTypes : undefined
            });

        } catch (err) {
            setError("Invalid mint address or error fetching token info");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getExplorerUrl = (address: string) =>
        `https://dev.eclipsescan.xyz/token/${address}`;

    const shareAnalysis = () => {
        const url = `${window.location.origin}/rugcheck?mint=${mintAddress}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    return (
        <div className="container max-w-4xl py-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold">Token Rug Check</h1>
                <p className="text-muted-foreground">
                    Enter a token mint address to analyze potential red flags
                </p>
            </div>

            <div className="flex gap-4">
                <Input
                    placeholder="Enter mint address..."
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                />
                <Button onClick={() => analyzeToken()} disabled={loading}>
                    {loading ? "Analyzing..." : "Check"}
                </Button>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                        <p className="text-red-600">{error}</p>
                    </CardContent>
                </Card>
            )}

            {analysis && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle className="flex items-center gap-2">
                                {analysis.metadata?.name || "Unknown Token"}
                                {analysis.warnings.length > 0 && (
                                    <ShieldAlert className="h-5 w-5 text-yellow-500" />
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
                            {analysis.metadata?.image && (
                                <div className="relative h-24 w-24 overflow-hidden rounded-lg">
                                    <img
                                        src={analysis.metadata.image}
                                        alt={analysis.metadata.name || "Token"}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Symbol:</span>
                                    <span>{analysis.metadata?.symbol || "Unknown"}</span>
                                </div>
                                <div>
                                    <span className="font-semibold">Mint:</span>
                                    <div className="flex items-center gap-2">
                                        <CopyableText text={mintAddress} maxLength={8} />
                                    </div>
                                </div>
                                {analysis.metadata?.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {analysis.metadata.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Warnings Section */}
                        {analysis.warnings.length > 0 ? (
                            <div className="space-y-2 rounded-lg p-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5" />
                                    Risk Analysis
                                </h3>
                                <div className="space-y-2">
                                    {analysis.warnings.map((warning, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex items-center gap-2 p-3 rounded-lg",
                                                warning.level === 'high' && "bg-red-50 text-red-700",
                                                warning.level === 'medium' && "bg-yellow-50 text-yellow-700",
                                                warning.level === 'low' && "bg-blue-50 text-blue-700"
                                            )}
                                        >
                                            <Badge
                                                variant={warning.level === 'high' ? 'destructive' :
                                                    warning.level === 'medium' ? 'secondary' : 'default'}
                                            >
                                                {warning.level.toUpperCase()}
                                            </Badge>
                                            <span>{warning.message}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 rounded-lg p-4 bg-green-50">
                                <h3 className="font-semibold flex items-center gap-2 text-green-700">
                                    <ShieldCheck className="h-5 w-5" />
                                    No Risk Factors Detected
                                </h3>
                                <p className="text-green-600">This token appears to have no common risk factors.</p>
                            </div>
                        )}

                        {/* Token Details */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Token Info</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-medium">Supply: </span>
                                    {Number(analysis.supply) / Math.pow(10, analysis.decimals)}
                                </div>
                                <div>
                                    <span className="font-medium">Decimals: </span>
                                    {analysis.decimals}
                                </div>
                                <div>
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                                        {analysis.tokenProgram === TOKEN_2022_PROGRAM_ID ? 'Token2022' : 'SPL Token'}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="font-medium">Mint Authority: </span>
                                    {analysis.mintAuthority ? (
                                        <CopyableText text={analysis.mintAuthority} maxLength={6} />
                                    ) : (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                            Disabled
                                        </Badge>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium">Freeze Authority: </span>
                                    {analysis.freezeAuthority ? (
                                        <CopyableText text={analysis.freezeAuthority} maxLength={6} />
                                    ) : (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                            Disabled
                                        </Badge>
                                    )}
                                </div>
                                {analysis.extensions && analysis.extensions.length > 0 && (
                                    <div className="col-span-2 space-y-2">
                                        <span className="font-medium">Extensions: </span>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.extensions.map((ext, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="secondary"
                                                    className="bg-purple-50 text-purple-700 hover:bg-purple-50"
                                                >
                                                    {ExtensionType[ext]}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Holders Section */}
                        <div className="space-y-2">
                            <h3 className="font-semibold">Largest Holders</h3>
                            <div className="space-y-2">
                                {analysis.largestHolders.map((holder, i) => (
                                    <div key={i} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                                        <CopyableText text={holder.owner || holder.address} maxLength={8} />
                                        <div className="font-medium">
                                            {holder.percentage.toFixed(2)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function RugCheckPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RugCheckContent />
        </Suspense>
    );
} 