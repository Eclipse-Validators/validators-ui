'use client';
import React, { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditionsControlProgram } from '@/components/providers/EditionsControlProgramContext';
import { mintWithControls } from '@/lib/anchor/controls/mintWithControls';
import { useEditionsProgram } from '@/components/providers/EditionsProgramContext';
import { Wallet } from '@coral-xyz/anchor';
import { toast, Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export default function MintPage() {
    const { program: editionsControlsProgram } = useEditionsControlProgram();
    const { program: editionsProgram } = useEditionsProgram();
    const wallet = useAnchorWallet();
    const { connection } = useConnection();
    const [numberOfMints, setNumberOfMints] = useState(1);
    const [isMinting, setIsMinting] = useState(false);
    const { theme } = useTheme();

    const handleMint = async () => {
        if (!editionsControlsProgram || !editionsProgram || !wallet?.publicKey) return;

        setIsMinting(true);
        try {
            await mintWithControls({
                wallet: wallet as Wallet,
                params: {
                    editionsId: 'GmYSwRy2VHePvxpqE4giwKAms9y3639HMQG14pUcdk45',
                    phaseIndex: 0,
                    numberOfMints
                },
                connection,
                editionsProgram,
                editionsControlsProgram
            });
            toast.success('Minting successful!');
        } catch (error) {
            console.error('Minting failed:', error);
            toast.error('Minting failed. Please check the console for details.');
        } finally {
            setIsMinting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
            <Toaster theme={theme as 'light' | 'dark'} />
            <div className="relative w-full max-w-md space-y-8 z-10">
                <Card className="bg-card/80 backdrop-blur-sm border-border">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold">Mint NFT</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="number"
                            placeholder="Number of Mints"
                            value={numberOfMints}
                            onChange={(e) => setNumberOfMints(Number(e.target.value))}
                            min={1}
                            className="bg-input border-input"
                        />
                        <Button
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={handleMint}
                            disabled={!wallet?.publicKey || isMinting}
                        >
                            {isMinting ? 'Minting...' : 'Mint NFT'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}