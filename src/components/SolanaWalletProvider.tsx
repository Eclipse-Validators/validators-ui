"use client"

import { useMemo } from "react"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"
import { initializeWhenDetected, SolflareMetaMaskWallet } from '@solflare-wallet/metamask-wallet-standard';

import { clusterApiUrl } from "@solana/web3.js"

// Import Solana wallet styles
import "@solana/wallet-adapter-react-ui/styles.css"
// import "../styles/custom-wallet-adapter.css"

import { SnapWalletAdapter } from "@drift-labs/snap-wallet-adapter"

export default function SolanaWalletProvider({
    children,
}: {
    children: React.ReactNode
}) {
    // You can also provide a custom RPC endpoint
    const network = process.env.NEXT_PUBLIC_NETWORK
    const endpoint = useMemo(
        () => network ?? clusterApiUrl(WalletAdapterNetwork.Devnet),
        [network]
    )
    initializeWhenDetected();

    const wallets = useMemo(
        () => [new SnapWalletAdapter()],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    )

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}
