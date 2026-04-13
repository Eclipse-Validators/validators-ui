import VortexLockWrapper from "@/components/vortex/VortexLockWrapper";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Vortex - NFT Migration | Validators.wtf',
    description: 'Lock your Eclipse Validators NFTs into a vault for migration to Solana. Permanent, irreversible NFT locking by Validators.wtf.',
    keywords: 'Eclipse NFT migration, Solana migration, Validators, NFT lock, Eclipse to Solana, validators.wtf',
    openGraph: {
        title: 'Vortex - NFT Migration | Validators.wtf',
        description: 'Lock Eclipse Validators NFTs into a vault for migration to Solana.',
        url: 'https://validators.wtf/vortex',
        siteName: 'Validators.wtf',
        type: 'website',
        images: [siteConfig.ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Vortex - NFT Migration | Validators.wtf',
        description: 'Lock Eclipse Validators NFTs into a vault for migration to Solana.',
        images: [siteConfig.ogImage],
        creator: "@Validators_",
    }
};

export default function VortexPage() {
    return (
        <main className="min-h-screen">
            <VortexLockWrapper />
        </main>
    );
}
