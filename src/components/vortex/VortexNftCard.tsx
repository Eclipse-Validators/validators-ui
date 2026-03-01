"use client";

import React from "react";
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
    return (
        <Card className={`w-full ${isLocked ? "opacity-60 ring-2 ring-green-500" : ""}`}>
            <CardHeader className="p-4 sm:p-6 pb-0">
                <div className="flex items-start gap-4">
                    {token.metadata?.image && (
                        <img
                            src={token.metadata.image}
                            alt={token.metadata?.name || "NFT"}
                            className="h-16 w-16 rounded object-cover"
                        />
                    )}
                    <CardTitle className="flex flex-1 items-center justify-between text-base sm:text-lg">
                        <span className="truncate">
                            {token.metadata?.name ||
                                token.mint.slice(0, 4) + "..." + token.mint.slice(-4)}
                        </span>
                        {isLocked && (
                            <Badge variant="outline" className="text-green-500 border-green-500">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Locked
                            </Badge>
                        )}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                    <div className="text-sm">
                        <b>Mint:</b> <CopyableText text={token.mint} maxLength={8} />
                    </div>
                    {!isLocked && (
                        <Button
                            onClick={onLock}
                            disabled={isLocking}
                            variant="destructive"
                            className="w-full"
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            {isLocking ? "Locking..." : "Lock NFT"}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
