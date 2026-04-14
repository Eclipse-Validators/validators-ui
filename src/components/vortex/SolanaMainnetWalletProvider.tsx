"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Connection, PublicKey, Transaction, clusterApiUrl } from "@solana/web3.js";

interface SolanaMainnetWallet {
  publicKey: PublicKey | null;
  connection: Connection;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: ((tx: Transaction) => Promise<Transaction>) | null;
}

const SolanaMainnetWalletContext = createContext<SolanaMainnetWallet | null>(null);

export function useSolanaMainnetWallet(): SolanaMainnetWallet {
  const ctx = useContext(SolanaMainnetWalletContext);
  if (!ctx) {
    throw new Error(
      "useSolanaMainnetWallet must be used within SolanaMainnetWalletProvider",
    );
  }
  return ctx;
}

function getPhantomSolana(): PhantomSolana | null {
  if (typeof window === "undefined") return null;
  const phantom = (window as WindowWithPhantom).phantom;
  if (phantom?.solana?.isPhantom) return phantom.solana;
  return null;
}

interface PhantomSolana {
  isPhantom: boolean;
  publicKey: { toBytes(): Uint8Array } | null;
  connect(): Promise<{ publicKey: { toBytes(): Uint8Array } }>;
  disconnect(): Promise<void>;
  signTransaction(tx: Transaction): Promise<Transaction>;
  on(event: string, cb: (...args: unknown[]) => void): void;
  off(event: string, cb: (...args: unknown[]) => void): void;
}

interface WindowWithPhantom {
  phantom?: { solana?: PhantomSolana };
}

const SOLANA_MAINNET_ENDPOINT = clusterApiUrl("mainnet-beta");

export function SolanaMainnetWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const connection = useMemo(() => new Connection(SOLANA_MAINNET_ENDPOINT), []);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const provider = getPhantomSolana();
    if (!provider) return;

    const handleConnect = () => {
      if (provider.publicKey) {
        setPublicKey(new PublicKey(provider.publicKey.toBytes()));
      }
    };
    const handleDisconnect = () => setPublicKey(null);

    provider.on("connect", handleConnect);
    provider.on("disconnect", handleDisconnect);
    provider.on("accountChanged", handleConnect);

    return () => {
      provider.off("connect", handleConnect);
      provider.off("disconnect", handleDisconnect);
      provider.off("accountChanged", handleConnect);
    };
  }, []);

  const connect = useCallback(async () => {
    const provider = getPhantomSolana();
    if (!provider) {
      window.open("https://phantom.app/", "_blank");
      return;
    }
    setConnecting(true);
    try {
      const resp = await provider.connect();
      setPublicKey(new PublicKey(resp.publicKey.toBytes()));
    } catch (err) {
      console.error("Solana wallet connect failed:", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const provider = getPhantomSolana();
    if (provider) {
      await provider.disconnect();
    }
    setPublicKey(null);
  }, []);

  const signTransaction = useMemo(() => {
    const provider = getPhantomSolana();
    if (!provider || !publicKey) return null;
    return (tx: Transaction) => provider.signTransaction(tx);
  }, [publicKey]);

  const value = useMemo<SolanaMainnetWallet>(
    () => ({
      publicKey,
      connection,
      connected: !!publicKey,
      connecting,
      connect,
      disconnect,
      signTransaction,
    }),
    [publicKey, connection, connecting, connect, disconnect, signTransaction],
  );

  return (
    <SolanaMainnetWalletContext.Provider value={value}>
      {children}
    </SolanaMainnetWalletContext.Provider>
  );
}
