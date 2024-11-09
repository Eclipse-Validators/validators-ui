import React from "react";
import { FetchedTokenInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyableText";
import { ExternalLink } from "lucide-react";

interface TokenCardProps {
    token: FetchedTokenInfo;
    isSelected: boolean;
    onSelect: () => void;
    amount: string;
    onAmountChange: (amount: string) => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({
    token,
    isSelected,
    onSelect,
    amount,
    onAmountChange,
}) => {
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSelected) {
            onSelect(); // Auto-select when amount is entered
        }
        onAmountChange(e.target.value);
    };

    return (
        <Card
            className={`w-full cursor-pointer ${isSelected ? "ring-2 ring-purple-500" : ""}`}
            onClick={(e) => {
                if (e.target instanceof HTMLInputElement) return;
                onSelect();
            }}
        >
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
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={onSelect}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-2">
                    {token.decimals > 0 ? (
                        <p className="text-sm">Balance: {token.amount}</p>
                    ) : null}
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
                            onClick={(e) => e.stopPropagation()}
                            className="text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                        >
                            <ExternalLink className="h-3 w-3" />
                            <span className="text-xs">Rugcheck</span>
                        </a>
                    </div>
                    {token.decimals > 0 && (
                        <div className="flex gap-2 mt-2">
                            <Input
                                type="number"
                                value={amount}
                                onChange={handleAmountChange}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Burn"
                                min="0"
                                max={token.amount.toString()}
                                className="flex-1 text-sm"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isSelected) {
                                        onSelect();
                                    }
                                    onAmountChange(token.amount.toString());
                                }}
                                className="whitespace-nowrap text-sm"
                            >
                                Max
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};