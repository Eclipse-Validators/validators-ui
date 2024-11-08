import React from "react";
import { FetchedTokenInfo } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface EmptyAccountCardProps {
    token: FetchedTokenInfo;
    isSelected: boolean;
    onSelect: () => void;
}

export const EmptyAccountCard: React.FC<EmptyAccountCardProps> = ({
    token,
    isSelected,
    onSelect,
}) => (
    <Card
        className={`w-full max-w-sm cursor-pointer ${isSelected ? "ring-2 ring-purple-500" : ""}`}
        onClick={onSelect}
    >
        <CardHeader>
            <CardTitle className="flex items-center justify-between">
                <span>
                    {token.metadata?.name ||
                        token.mint.slice(0, 4) + "..." + token.mint.slice(-4)}
                </span>
                <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex items-center space-x-4">
                {token.metadata?.image && (
                    <img
                        src={token.metadata.image}
                        alt={token.metadata.name}
                        className="h-16 w-16 rounded"
                    />
                )}
                <div>
                    <p>
                        <b>Empty Account</b>
                    </p>
                    <p>
                        <b>Symbol:</b> {token.metadata?.symbol || "N/A"}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
);