"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTheme } from "next-themes";
import { toast, Toaster } from "sonner";

import { useWalletBalance } from "@/lib/hooks/useWalletBalance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AirdropPage() {
  const wallet = useAnchorWallet();
  const { balance, refreshBalance } = useWalletBalance();
  const { connection } = useConnection();
  const [isAirdropping, setIsAirdropping] = useState(false);
  const { theme } = useTheme();

  const handleAirdrop = async (amount: number) => {
    if (!wallet?.publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }
    setIsAirdropping(true);
    try {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        amount * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      toast.success(`Airdropped ${amount} ETH successfully!`);
      await refreshBalance();
    } catch (error) {
      console.error("Airdrop failed:", error);
      toast.error("Airdrop failed. Please check the console for details.");
    } finally {
      setIsAirdropping(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <Toaster theme={theme as "light" | "dark"} />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Request Airdrop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connected Address: {wallet?.publicKey.toString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Balance: {balance.toFixed(2)}
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleAirdrop(1)}
                disabled={isAirdropping || !wallet?.publicKey}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                1 ETH
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
