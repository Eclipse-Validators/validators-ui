import BurnTokens from "@/components/burn/BurnTokens";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Burn Tokens & NFTs | Validators.wtf',
    description: 'Safely burn unwanted tokens and NFTs on Eclipse blockchain. The Eclipse token and NFT burning tool by Validators.wtf.',
    keywords: 'Eclipse token burn, Eclipse NFT burn, Eclipse blockchain, burn tokens on Eclipse, token burning, NFT burning, Eclipse validator, validators.wtf, Eclipse crypto',
    openGraph: {
        title: 'Burn Tokens & NFTs | Validators.wtf',
        description: 'Eclipse token and NFT burning tool. Safely burn unwanted tokens and NFTs on Eclipse blockchain.',
        url: 'https://validators.wtf/blackhole',
        siteName: 'Validators.wtf',
        type: 'website',
        images: [siteConfig.ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Burn Tokens & NFTs | Validators.wtf',
        description: 'Eclipse token and NFT burning tool. Safely burn unwanted tokens and NFTs on Eclipse blockchain.',
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
