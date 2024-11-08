import BurnTokens from "@/components/burn/BurnTokens";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Burn Tokens & NFTs | Validators.wtf',
    description: 'Safely burn unwanted tokens and NFTs on Solana. Reclaim ETH from unused accounts, unwanted nfts or reduce token supply.',
    keywords: 'Eclipse, Solana, burn tokens, NFT burn, wallet cleanup, ETH reclaim, token management, validators.wtf',
    openGraph: {
        title: 'Burn Tokens & NFTs | Validators.wtf',
        description: 'Safely burn unwanted tokens and NFTs on Eclipse. Reclaim ETH from unused accounts or reduce token supply.',
        url: 'https://validators.wtf/blackhole',
        siteName: 'Validators.wtf',
        type: 'website',
        images: [siteConfig.ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Burn Tokens & NFTs | Validators.wtf',
        description: 'Safely burn unwanted tokens and NFTs on Eclipse. Reclaim ETH from unused accounts or reduce token supply.',
        images: [siteConfig.ogImage],
        creator: "@Validators_",
    }
};

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <BurnTokens />
        </main>
    );
}
