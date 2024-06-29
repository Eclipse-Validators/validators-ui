'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from 'sonner';
import { useTheme } from 'next-themes';
import { useWalletBalance } from '@/lib/hooks/useWalletBalance';

export default function AirdropPage() {
    const wallet = useAnchorWallet();
    const { balance, refreshBalance } = useWalletBalance();
    const { connection } = useConnection();
    const [isAirdropping, setIsAirdropping] = useState(false);
    const { theme } = useTheme();

    const handleAirdrop = async (amount: number) => {
        if (!wallet?.publicKey) {
            toast.error('Please connect your wallet first');
            return;
        }
        setIsAirdropping(true);
        try {
            const signature = await connection.requestAirdrop(wallet.publicKey, amount * LAMPORTS_PER_SOL);
            await connection.confirmTransaction(signature);
            toast.success(`Airdropped ${amount} ETH successfully!`);
            await refreshBalance();
        } catch (error) {
            console.error('Airdrop failed:', error);
            toast.error('Airdrop failed. Please check the console for details.');
        } finally {
            setIsAirdropping(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <Toaster theme={theme as 'light' | 'dark'} />
            <div className="relative w-full max-w-md space-y-8 z-10">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Request Airdrop</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">Connected Address: {wallet?.publicKey.toString()}</p>
                        <p className="text-sm text-muted-foreground">Balance: {balance.toFixed(2)}</p>
                        <div className="flex justify-between">
                            <Button
                                onClick={() => handleAirdrop(1)}
                                disabled={isAirdropping || !wallet?.publicKey}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                1 ETH
                            </Button>
                            <Button
                                onClick={() => handleAirdrop(5)}
                                disabled={isAirdropping || !wallet?.publicKey}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                5 ETH
                            </Button>
                            <Button
                                onClick={() => handleAirdrop(10)}
                                disabled={isAirdropping || !wallet?.publicKey}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                10 ETH
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}