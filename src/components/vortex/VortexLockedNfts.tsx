"use client";

import React, { useCallback, useState } from "react";
import { Transaction } from "@solana/web3.js";
import bs58 from "bs58";
import { toast } from "sonner";
import { useSolanaMainnetWallet } from "./SolanaMainnetWalletProvider";
import { VortexLockedNft } from "@/lib/types/vortex";
import { vortexMintApi } from "@/lib/vortex/api-client";
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
  XCircle,
} from "lucide-react";

type MintStatus =
  | "idle"
  | "preparing"
  | "signing"
  | "submitting"
  | "confirming"
  | "completing"
  | "done"
  | "failed";

const MINT_STATUS_LABELS: Record<Exclude<MintStatus, "idle">, string> = {
  preparing: "Preparing transaction...",
  signing: "Waiting for wallet signature...",
  submitting: "Submitting to Solana...",
  confirming: "Confirming on-chain...",
  completing: "Finalizing mint...",
  done: "Minted!",
  failed: "Mint failed",
};

function LockedNftCard({
  nft,
  solanaConnected,
  mintStatus,
  mintError,
  mintSignature,
  onMint,
}: {
  nft: VortexLockedNft;
  solanaConnected: boolean;
  mintStatus: MintStatus;
  mintError: string | null;
  mintSignature: string | null;
  onMint: () => void;
}) {
  const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER;
  const isMinted = nft.status === "minted" || mintStatus === "done";
  const isBusy =
    mintStatus !== "idle" && mintStatus !== "done" && mintStatus !== "failed";

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
            <div className="space-y-2">
              <div className="rounded-md bg-emerald-500/10 px-3 py-2 text-center text-sm text-emerald-400">
                Minted on Solana
              </div>
              {(mintSignature || nft.solanaAsset) && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  {(nft.solanaAsset || mintSignature) && (
                    <a
                      href={`https://explorer.solana.com/tx/${mintSignature}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300"
                    >
                      View transaction
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {isBusy && (
                <div className="flex items-center gap-2 rounded-md bg-violet-500/10 px-3 py-2 text-sm text-violet-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {MINT_STATUS_LABELS[mintStatus]}
                </div>
              )}
              {mintStatus === "failed" && mintError && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{mintError}</span>
                </div>
              )}
              {nft.status === "processing" && (
                <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Indexing lock — mint will be available shortly
                </div>
              )}
              <Button
                onClick={onMint}
                className="w-full bg-green-600 text-white hover:bg-green-700"
                disabled={!solanaConnected || isBusy || nft.status !== "ready"}
              >
                {isBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="mr-2 h-4 w-4" />
                )}
                {isBusy ? "Minting..." : "Mint on Solana"}
              </Button>
            </div>
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
  const {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    connection,
    signTransaction,
  } = useSolanaMainnetWallet();
  const hasUnminted = locks?.some((l) => l.status !== "minted");

  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [mintingLockId, setMintingLockId] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<MintStatus>("idle");
  const [mintError, setMintError] = useState<string | null>(null);
  const [mintSignature, setMintSignature] = useState<string | null>(null);
  const [mintedIds, setMintedIds] = useState<
    Record<string, { signature: string }>
  >({});

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

  const handleMint = useCallback(
    async (nft: VortexLockedNft) => {
      if (!publicKey || !signTransaction || mintingLockId) return;

      setMintingLockId(nft.id);
      setMintStatus("preparing");
      setMintError(null);
      setMintSignature(null);

      try {
        const {
          transaction: serializedTx,
          assetAddress,
          lockRecordId,
        } = await vortexMintApi.prepareMint(
          publicKey.toBase58(),
          nft.eclipseMint,
        );

        setMintStatus("signing");

        const txBuffer = bs58.decode(serializedTx);
        const transaction = Transaction.from(txBuffer);

        const signedTransaction = await signTransaction(transaction);

        setMintStatus("submitting");

        const rawTx = signedTransaction.serialize();
        const signature = await connection.sendRawTransaction(rawTx, {
          skipPreflight: true,
          maxRetries: 0,
        });
        setMintSignature(signature);

        setMintStatus("confirming");

        const blockhashResp = await connection.getLatestBlockhash("confirmed");
        const lastValid = blockhashResp.lastValidBlockHeight;

        const RETRY_INTERVAL_MS = 500;
        let blockHeight = await connection.getBlockHeight("confirmed");

        while (blockHeight < lastValid) {
          const status = await connection.getSignatureStatus(signature);
          if (
            status?.value?.confirmationStatus === "confirmed" ||
            status?.value?.confirmationStatus === "finalized"
          ) {
            break;
          }
          if (status?.value?.err) {
            throw new Error("Transaction failed on-chain");
          }

          connection.sendRawTransaction(rawTx, {
            skipPreflight: true,
            maxRetries: 0,
          });

          await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
          blockHeight = await connection.getBlockHeight("confirmed");
        }

        const finalStatus = await connection.getSignatureStatus(signature);
        if (!finalStatus?.value?.confirmationStatus) {
          throw new Error("Transaction expired — please try again");
        }
        if (finalStatus.value.err) {
          throw new Error("Transaction failed on-chain");
        }

        setMintStatus("completing");

        await vortexMintApi.completeMint(lockRecordId, signature, assetAddress);

        setMintStatus("done");
        setMintedIds((prev) => ({ ...prev, [nft.id]: { signature } }));

        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            NFT minted on Solana!
          </div>,
        );
      } catch (err: unknown) {
        console.error("Mint failed:", err);

        const message =
          err instanceof Error ? err.message : String(err);
        const isRejection =
          message.includes("User rejected") ||
          message.includes("rejected the request") ||
          (err as { code?: number })?.code === 4001;

        setMintStatus("failed");
        setMintError(
          isRejection
            ? "Transaction rejected by wallet"
            : message || "Mint failed",
        );

        if (!isRejection) {
          toast.error("Failed to mint NFT on Solana");
        }
      } finally {
        setMintingLockId(null);
      }
    },
    [publicKey, signTransaction, connection, mintingLockId],
  );

  const getMintStateForNft = useCallback(
    (nft: VortexLockedNft) => {
      if (mintedIds[nft.id]) {
        return {
          status: "done" as MintStatus,
          error: null,
          signature: mintedIds[nft.id].signature,
        };
      }
      if (mintingLockId === nft.id) {
        return { status: mintStatus, error: mintError, signature: mintSignature };
      }
      return { status: "idle" as MintStatus, error: null, signature: null };
    },
    [mintingLockId, mintStatus, mintError, mintSignature, mintedIds],
  );

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
          : locks?.map((nft) => {
              const state = getMintStateForNft(nft);
              return (
                <LockedNftCard
                  key={nft.id}
                  nft={nft}
                  solanaConnected={connected}
                  mintStatus={state.status}
                  mintError={state.error}
                  mintSignature={state.signature}
                  onMint={() => handleMint(nft)}
                />
              );
            })}
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
