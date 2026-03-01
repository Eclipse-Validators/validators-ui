"use client";

import React, { useState } from "react";
import { FetchedTokenInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyableText";
import { Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VortexNftCardProps {
    token: FetchedTokenInfo;
    isLocked: boolean;
    isLocking: boolean;
    onLock: () => void;
}

export const VortexNftCard: React.FC<VortexNftCardProps> = ({
    token,
    isLocked,
    isLocking,
    onLock,
}) => {
    const [animatingOut, setAnimatingOut] = useState(false);

    return (
        <Card
            className={`w-full transition-all duration-300 ${
                isLocked
                    ? "opacity-50 border-green-500/50"
                    : "vortex-card-glow border-violet-500/20 hover:border-violet-500/50"
            } ${animatingOut ? "vortex-suck-in pointer-events-none" : ""}`}
        >
            <CardHeader className="p-4 sm:p-6 pb-0">
                <div className="flex items-start gap-4">
                    {token.metadata?.image ? (
                        <div className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg ${
                            !isLocked ? "ring-2 ring-violet-500/30" : "ring-2 ring-green-500/30"
                        }`}>
                            <img
                                src={token.metadata.image}
                                alt={token.metadata?.name || "NFT"}
                                className="h-full w-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
                            <Lock className="h-8 w-8 text-violet-400" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg">
                            <span className="truncate">
                                {token.metadata?.name ||
                                    token.mint.slice(0, 4) + "..." + token.mint.slice(-4)}
                            </span>
                            {isLocked && (
                                <Badge variant="outline" className="flex-shrink-0 border-green-500 text-green-500">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Locked
                                </Badge>
                            )}
                        </CardTitle>
                        {token.metadata?.symbol && (
                            <span className="text-sm text-muted-foreground">
                                {token.metadata.symbol}
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                        <b className="text-foreground">Mint:</b>{" "}
                        <CopyableText text={token.mint} maxLength={8} />
                    </div>
                    {!isLocked && (
                        <Button
                            onClick={onLock}
                            disabled={isLocking}
                            className={`w-full bg-violet-600 hover:bg-violet-700 text-white ${
                                isLocking ? "animate-pulse" : ""
                            }`}
                        >
                            <Lock className="mr-2 h-4 w-4" />
                            {isLocking ? "Entering Vortex..." : "Enter Vortex"}
                        </Button>
                    )}
                    {isLocked && (
                        <div className="rounded-md bg-green-500/10 px-3 py-2 text-center text-sm text-green-500">
                            Ready to re-mint on Solana
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
