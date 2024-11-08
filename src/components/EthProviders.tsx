// app/providers.tsx
"use client"

import { WagmiProvider, createConfig, fallback, http } from "wagmi";
import { mainnet, sepolia } from "viem/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { NETWORK_CONFIG } from "@/lib/config";
const config = createConfig(
    getDefaultConfig({
        chains: [mainnet, sepolia],
        transports: {
            [mainnet.id]: fallback([
                http(NETWORK_CONFIG.mainnet.rpc),
                http('https://eth.llamarpc.com'),
                http('https://rpc.mevblocker.io'),
                http('https://rpc.flashbots.net/'),
                http('https://rpc.ankr.com/eth'),
            ]),
            [sepolia.id]: fallback([
                http(NETWORK_CONFIG.sepolia.rpc),
                http('https://ethereum-sepolia-rpc.publicnode.com'),
                http('https://1rpc.io/sepolia'),
            ]),
        },
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        appName: "Eclipse Bridge",
        appDescription: "Bridge ETH to Eclipse blockchain",
        appUrl: "https://your-app-url.com",
        appIcon: "https://your-app-icon-url.com",
    }),
);

const queryClient = new QueryClient();

export function EthereumProviders({ children }: { children: React.ReactNode }) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider>
                    {children}
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}