import React from "react";
import { X } from "lucide-react";
import { FetchedTokenInfo } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useValidatorBurnProgram } from "../providers/ValidatorBurnProgramContext";

const ETH_RETURN_AMOUNT = 0.000009924;

interface BurnCartProps {
    selectedTokens: { token: FetchedTokenInfo; amount?: string }[];
    onRemove: (tokenAccount: string) => void;
    onBurn: () => Promise<void>;
    isBurnDisabled: boolean;
}

const BurnCart: React.FC<BurnCartProps> = ({
    selectedTokens,
    onRemove,
    onBurn,
    isBurnDisabled,
}) => {
    const { configAccount } = useValidatorBurnProgram();

    const calculateEstimatedEth = () => {
        if (!configAccount) return 0;

        let totalEth = 0;

        selectedTokens.forEach(({ token, amount }) => {
            const baseReturn = ETH_RETURN_AMOUNT;
            let fee = 0;

            if (token.amount === 0) {
                fee = configAccount.closeTokenFee.toNumber() / LAMPORTS_PER_SOL;
                totalEth += baseReturn - fee;
            } else if (token.decimals === 0) {
                fee = configAccount.burnNftFee.toNumber() / LAMPORTS_PER_SOL;
                totalEth += baseReturn - fee;
            } else {
                const burnAmount = parseFloat(amount || "0");
                if (burnAmount === token.amount) {
                    fee = configAccount.burnTokenFee.toNumber() / LAMPORTS_PER_SOL;
                    const closeFee = configAccount.closeTokenFee.toNumber() / LAMPORTS_PER_SOL;
                    totalEth += baseReturn - fee - closeFee;
                }
            }
        });

        return totalEth;
    };

    if (selectedTokens.length === 0) {
        return null;
    }

    const estimatedEth = calculateEstimatedEth();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-3 sm:p-4 z-50">
            <div className="container mx-auto">
                <div className="flex flex-col space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold">Selected for Burning</h3>
                        <div className="flex flex-row sm:flex-col items-start sm:items-end justify-between sm:justify-start gap-2">
                            <span className="text-xs sm:text-sm text-muted-foreground">
                                {selectedTokens.length} item(s)
                            </span>
                            <span className="text-xs sm:text-sm font-medium">
                                Estimated Rent Reclaim: {estimatedEth.toFixed(9)} ETH
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
                        {selectedTokens.map(({ token, amount }) => (
                            <Card key={token.tokenAccount} className="min-w-[160px] sm:min-w-[200px] flex-shrink-0">
                                <CardContent className="p-2 sm:p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            {token.metadata?.image && (
                                                <img
                                                    src={token.metadata.image}
                                                    alt={token.metadata.name}
                                                    className="h-6 w-6 sm:h-8 sm:w-8 rounded"
                                                />
                                            )}
                                            <span className="text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[100px]">
                                                {token.metadata?.name || token.mint.slice(0, 8)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onRemove(token.tokenAccount)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground">
                                        Burning: {amount || '0'} {token.metadata?.symbol || 'tokens'}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button
                        onClick={onBurn}
                        disabled={isBurnDisabled || selectedTokens.some(item =>
                            item.token.amount > 0 && !item.amount
                        )}
                        className="w-full text-sm sm:text-base py-2 sm:py-3"
                        variant="destructive"
                    >
                        {isBurnDisabled
                            ? "Burning..."
                            : `${selectedTokens.some(item => item.token.amount === 0) ? 'Close' : 'Burn'} ${selectedTokens.length} Account${selectedTokens.length === 1 ? "" : "s"}`}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BurnCart;