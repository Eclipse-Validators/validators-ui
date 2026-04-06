import VortexLock from "@/components/vortex/VortexLock";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Vortex - NFT Migration | Validators.wtf',
    description: 'Lock your Eclipse Token-2022 NFTs into a vault for migration to Solana. Permanent, irreversible NFT locking by Validators.wtf.',
    keywords: 'Eclipse NFT migration, Solana migration, Token-2022, NFT lock, Eclipse to Solana, validators.wtf',
    openGraph: {
        title: 'Vortex - NFT Migration | Validators.wtf',
        description: 'Lock Eclipse Token-2022 NFTs into a vault for migration to Solana.',
        url: 'https://validators.wtf/vortex',
        siteName: 'Validators.wtf',
        type: 'website',
        images: [siteConfig.ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Vortex - NFT Migration | Validators.wtf',
        description: 'Lock Eclipse Token-2022 NFTs into a vault for migration to Solana.',
        images: [siteConfig.ogImage],
        creator: "@Validators_",
    }
};

export default function VortexPage() {
    return (
        <main className="min-h-screen">
            <VortexLock />
        </main>
    );
}
