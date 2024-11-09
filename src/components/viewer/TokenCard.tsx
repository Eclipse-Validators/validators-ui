import React from "react";
import { FetchedTokenInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyableText } from "@/components/ui/copyableText";
import { ExternalLink } from "lucide-react";

interface TokenCardProps {
    token: FetchedTokenInfo;
}

export const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
    return (
        <Card className="w-full">
            <CardHeader className="p-4 sm:p-6 pb-0">
                <div className="flex items-start gap-4">
                    {token.metadata?.image && (
                        <img
                            src={token.metadata.image}
                            alt={token.metadata.name}
                            className="h-16 w-16 rounded object-cover"
                        />
                    )}
                    <CardTitle className="flex flex-1 items-center justify-between text-base sm:text-lg">
                        <div className="flex items-center gap-2 truncate">
                            <span className="truncate">
                                {token.metadata?.name ||
                                    token.mint.slice(0, 4) + "..." + token.mint.slice(-4)}
                            </span>
                            {token.metadata?.symbol && (
                                <span className="text-sm text-muted-foreground">
                                    ({token.metadata.symbol})
                                </span>
                            )}
                        </div>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                    <p className="text-sm">Balance: {token.amount}</p>
                    <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                            <p>
                                <b>Mint:</b> <CopyableText text={token.mint} maxLength={8} />
                            </p>
                        </div>
                        <a
                            href={`/rugcheck?mint=${token.mint}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                        >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs">Rugcheck</span>
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}; 