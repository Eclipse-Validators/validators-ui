import { Metadata } from 'next';
import Bridge from "@/components/bridge/Bridge";
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
    title: 'Bridge ETH to Eclipse | Validators.wtf',
    description: 'Securely bridge your assets from Ethereum mainnet to Eclipse L2. Fast, reliable, and gas-efficient bridging for your ETH and tokens.',
    openGraph: {
        title: 'Bridge ETH to Eclipse | Validators.wtf',
        description: 'Securely bridge your assets from Ethereum mainnet to Eclipse L2. Fast, reliable, and gas-efficient bridging for your ETH and tokens.',
        url: 'https://validators.wtf/bridge',
        siteName: 'Validators.wtf',
        type: 'website',
        images: [siteConfig.ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Bridge ETH to Eclipse | Validators.wtf',
        description: 'Securely bridge your assets from Ethereum mainnet to Eclipse L2. Fast, reliable, and gas-efficient bridging for your ETH and tokens.',
        images: [siteConfig.ogImage],
        creator: "@Validators_",
    }
};

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <Bridge />
        </main>
    );
}
