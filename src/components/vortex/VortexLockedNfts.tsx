"use client";

import React, { useState } from "react";
import { useSolanaMainnetWallet } from "./SolanaMainnetWalletProvider";
import { VortexLockedNft } from "@/lib/types/vortex";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyableText } from "@/components/ui/copyableText";
import { SkeletonCard } from "@/components/loading/skeletonCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Lock,
  CheckCircle2,
  ExternalLink,
  Rocket,
  Wallet,
  Loader2,
  ArrowRight,
  CircleDot,
} from "lucide-react";

function LockedNftCard({
  nft,
  solanaConnected,
}: {
  nft: VortexLockedNft;
  solanaConnected: boolean;
}) {
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER;
  const isMinted = nft.status === "minted";

  return (
    <Card
      className={`w-full transition-all duration-300 ${
        isMinted
          ? "border-emerald-500/40 opacity-60"
          : "border-violet-500/20 hover:border-violet-500/40"
      }`}
    >
      <CardHeader className="p-4 pb-0 sm:p-6 sm:pb-0">
        <div className="flex items-start gap-4">
          {nft.metadata?.image ? (
            <div
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg ring-2 ${
                isMinted ? "ring-emerald-500/30" : "ring-violet-500/30"
              }`}
            >
              <img
                src={nft.metadata.image}
                alt={nft.metadata?.name || "NFT"}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
              <Lock className="h-8 w-8 text-violet-400" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center justify-between gap-2 text-base sm:text-lg">
              <span className="truncate">
                {nft.metadata?.name ||
                  nft.eclipseMint.slice(0, 4) +
                    "..." +
                    nft.eclipseMint.slice(-4)}
              </span>
              {isMinted && (
                <Badge
                  variant="outline"
                  className="flex-shrink-0 border-emerald-400 text-emerald-400"
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Minted
                </Badge>
              )}
            </CardTitle>
            {nft.metadata?.symbol && (
              <span className="text-sm text-muted-foreground">
                {nft.metadata.symbol}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <b className="text-foreground">Mint:</b>{" "}
            <CopyableText text={nft.eclipseMint} maxLength={8} />
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-xs">
              Locked {new Date(nft.lockedAt).toLocaleDateString()}
            </span>
            {explorerUrl && (
              <a
                href={`${explorerUrl}/tx/${nft.eclipseTxSignature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-violet-400 hover:text-violet-300"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {isMinted ? (
            <div className="rounded-md bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-400">
              Minted on Solana
            </div>
          ) : (
            <Button
              className="w-full bg-green-600 text-white hover:bg-green-700"
              disabled={!solanaConnected}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Mint on Solana
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SwitchWalletModal({
  open,
  onOpenChange,
  solanaConnecting,
  onConnectSolana,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solanaConnecting: boolean;
  onConnectSolana: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-violet-500/30 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-violet-400" />
            Switch to Solana Wallet
          </DialogTitle>
          <DialogDescription>
            Your wallet extension needs to be on the Solana network to mint your
            NFTs. Your Eclipse session will stay active.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400 ring-2 ring-violet-500/50">
                1
              </div>
              <p className="text-sm text-muted-foreground">
                Open your wallet extension and switch the active network from
                Eclipse to <b className="text-foreground">Solana</b>.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 rounded-md bg-violet-500/10 p-3">
              <div className="flex items-center gap-1.5">
                <CircleDot className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-400">
                  Eclipse
                </span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center gap-1.5">
                <CircleDot className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">
                  Solana
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-bold text-violet-400 ring-2 ring-violet-500/50">
                2
              </div>
              <p className="text-sm text-muted-foreground">
                Once switched, click the button below to connect your Solana
                wallet.
              </p>
            </div>

            <Button
              onClick={onConnectSolana}
              disabled={solanaConnecting}
              className="w-full bg-green-600 text-white hover:bg-green-700"
            >
              {solanaConnecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              {solanaConnecting
                ? "Connecting..."
                : "I've Switched — Connect Solana Wallet"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface VortexLockedNftsProps {
  locks: VortexLockedNft[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onEnterSwitchMode?: () => void;
  onExitSwitchMode?: () => void;
}

export function VortexLockedNfts({
  locks,
  isLoading,
  error,
  onEnterSwitchMode,
  onExitSwitchMode,
}: VortexLockedNftsProps) {
  const { publicKey, connected, connecting, connect, disconnect } =
    useSolanaMainnetWallet();
  const hasUnminted = locks?.some((l) => l.status !== "minted");

  const [switchModalOpen, setSwitchModalOpen] = useState(false);

  const handleConnectClick = () => {
    onEnterSwitchMode?.();
    setSwitchModalOpen(true);
  };

  const handleModalClose = (open: boolean) => {
    setSwitchModalOpen(open);
    if (!open) {
      onExitSwitchMode?.();
    }
  };

  const handleConnectSolana = async () => {
    try {
      await connect();
      setSwitchModalOpen(false);
      onExitSwitchMode?.();
    } catch (err) {
      console.error("Failed to connect Solana wallet:", err);
    }
  };

  if (!isLoading && (!locks || locks.length === 0) && !error) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Locked NFTs
        </h2>
        {locks && locks.length > 0 && (
          <Badge
            variant="outline"
            className="border-violet-500/50 text-violet-400"
          >
            {locks.length}
          </Badge>
        )}
      </div>

      {hasUnminted && !connected && (
        <div className="mb-6 rounded-lg border border-violet-500/30 bg-violet-950/30 p-4">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-violet-400" />
              <p className="text-sm text-muted-foreground">
                Connect your Solana wallet to mint your locked NFTs on Solana.
              </p>
            </div>
            <Button
              onClick={handleConnectClick}
              disabled={connecting}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              {connecting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="mr-2 h-4 w-4" />
              )}
              {connecting ? "Connecting..." : "Connect Solana Wallet"}
            </Button>
          </div>
        </div>
      )}

      {connected && publicKey && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="h-4 w-4 text-green-400" />
          <span>Solana wallet:</span>
          <CopyableText text={publicKey.toBase58()} maxLength={6} />
          <button
            onClick={disconnect}
            className="ml-2 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            Disconnect
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
          Failed to load locked NFTs. They may appear after a refresh.
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, i) => <SkeletonCard key={i} />)
          : locks?.map((nft) => (
              <LockedNftCard
                key={nft.id}
                nft={nft}
                solanaConnected={connected}
              />
            ))}
      </div>

      <SwitchWalletModal
        open={switchModalOpen}
        onOpenChange={handleModalClose}
        solanaConnecting={connecting}
        onConnectSolana={handleConnectSolana}
      />
    </div>
  );
}
