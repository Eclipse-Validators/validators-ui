'use client';
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Wallet } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useTheme } from "next-themes";
import { toast, Toaster } from "sonner";
import { PlusIcon, MinusIcon } from "lucide-react";

import { mintWithControls } from "@/lib/anchor/controls/mintWithControls";
import { useWalletBalance } from "@/lib/hooks/useWalletBalance";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEditionsControlProgram } from "@/components/providers/EditionsControlProgramContext";
import { useEditionsProgram } from "@/components/providers/EditionsProgramContext";
import MintGallery from "@/components/mint/mintGallery";
import { getHashlistPda } from "@/lib/anchor/editions/pdas/getHashlistPda";
import { PublicKey } from "@solana/web3.js";

function InfoBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded bg-muted p-2 text-sm">
      <div className="mb-1 font-semibold">{label}</div>
      <div className="rounded bg-card p-2 text-center font-bold">{value}</div>
    </div>
  );
}

export default function Home() {
  const { program: editionsControlsProgram } = useEditionsControlProgram();
  const { program: editionsProgram } = useEditionsProgram();
  const { balance, refreshBalance } = useWalletBalance();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [numberOfMints, setNumberOfMints] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [remainingMints, setRemainingMints] = useState(0);
  const [mintedAddresses, setMintedAddresses] = useState<string[]>([]);
  const { theme } = useTheme();

  const getRemainingMints = useCallback(async () => {
    if (!editionsProgram) return;
    const deploymentId = new PublicKey(process.env.NEXT_PUBLIC_DEPLOYMENTID as string ?? "HaCuUQ3nQKB4bVCoWqCmhWuySueS4WLWU9ZaohxkNYKP");
    const hashlistPda = getHashlistPda(deploymentId);
    const hashlistAccount = await editionsProgram?.account.hashlist.fetch(hashlistPda[0]);
    if (!hashlistAccount) return;
    const amount = hashlistAccount.issues.length;
    setRemainingMints(3333 - amount)
  }, [editionsProgram]);

  useEffect(() => {
    getRemainingMints();
  }, [getRemainingMints]);

  const handleMint = async (amount: number) => {
    if (!editionsControlsProgram || !editionsProgram || !wallet?.publicKey) return;
    if (amount < 1) {
      toast.error("Number of mints must be greater than 0");
      return;
    }
    toast.info(`Minting ${amount} validator${amount > 1 ? 's' : ''}...`);
    setIsMinting(true);
    try {
      const results = await mintWithControls({
        wallet: wallet as Wallet,
        params: {
          editionsId: process.env.NEXT_PUBLIC_DEPLOYMENTID as string ?? "HaCuUQ3nQKB4bVCoWqCmhWuySueS4WLWU9ZaohxkNYKP",
          phaseIndex: 0,
          numberOfMints: amount,
        },
        connection,
        editionsProgram,
        editionsControlsProgram,
      });
      setMintedAddresses((prevAddresses) => [
        ...prevAddresses,
        ...results.mints.map((m) => m.toBase58()),
      ]);
      toast.success(`Successfully minted ${amount} validator${amount > 1 ? 's' : ''}!`);
    } catch (error) {
      console.error("Minting failed:", error);
      toast.error("Minting failed. Please check the console for details.");
    } finally {
      setIsMinting(false);
      await refreshBalance();
      await getRemainingMints();
    }
  };

  return (
    <div className="main-bg min-h-screen bg-cover bg-fixed bg-center bg-no-repeat p-4 text-foreground mt-4">
      <Toaster theme={theme as "light" | "dark"} />
      <div className="mx-auto max-w-4xl">

        {/* <div className="flex justify-center">
          <Image src="/logo/logotrans.png" alt="Validators Logo" width={150} height={50} />
        </div> */}
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Mint a Validator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <InfoBox label="Mint Price" value="0.03 ETH" />
              <InfoBox label="Wallet Balance" value={`${balance.toFixed(2)} ETH`} />
              <InfoBox label="Remaining" value={remainingMints} />
              {/* Add more InfoBox components here as needed */}
            </div>
            <div className="flex items-center justify-center">
              <Image src="/logo/logotrans.png" alt="Validators Logo" width={150} height={50} />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Validators on Eclipse.
            </p>
            <div>
              <p className="text-sm text-center text-muted-foreground">
                Select the number of validators you want to mint. You can mint up to 10 validators at a time.
              </p>
            </div>
            <div className="flex justify-center space-x-4">
              <div className="w-1/2 flex items-center space-x-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setNumberOfMints(Math.max(1, numberOfMints - 1))}
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={numberOfMints}
                  onChange={(e) => setNumberOfMints(Math.min(10, Math.max(1, Number(e.target.value))))}
                  className="text-center"
                  min={1}
                  max={10}
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setNumberOfMints(Math.min(10, numberOfMints + 1))}
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                className="w-1/2"
                onClick={() => handleMint(numberOfMints)}
                variant="default"
                disabled={!wallet?.publicKey || isMinting}
              >
                {isMinting ? "Minting..." : `Mint ${numberOfMints}`}
              </Button>
            </div>
          </CardContent>
        </Card>
        {mintedAddresses.length > 0 && (
          <Card className="border-border backdrop-blur-sm mt-8">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Your Recent Mints</CardTitle>
            </CardHeader>
            <CardContent>
              <MintGallery mintAddresses={mintedAddresses} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}