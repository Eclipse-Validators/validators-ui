import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSolTransfer } from '@/lib/hooks/useSolTransfer';

interface EthTransferProps {
    destinationAddress: string;
    isValidAddress: boolean;
}

export const EthTransfer: React.FC<EthTransferProps> = ({ destinationAddress, isValidAddress }) => {
    const [solAmount, setSolAmount] = useState("");
    const { solBalance, isTransferDisabled, handleSolTransfer } = useSolTransfer();

    const onTransfer = () => {
        handleSolTransfer(destinationAddress, solAmount);
        setSolAmount("");
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <p>ETH Balance: {solBalance !== null ? solBalance.toFixed(4) : "Loading..."} ETH</p>
            <Input
                type="number"
                value={solAmount}
                onChange={(e) => setSolAmount(e.target.value)}
                placeholder="Enter ETH amount"
                className="w-96"
            />
            <Button
                className="w-96"
                variant="outline"
                onClick={onTransfer}
                disabled={!isValidAddress || !solAmount || isTransferDisabled}
            >
                {isTransferDisabled ? "Sending..." : "Send ETH"}
            </Button>
        </div>
    );
};