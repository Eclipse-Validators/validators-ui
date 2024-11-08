import { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
    title: 'Send Messages on Eclipse | Validators.wtf',
    description: 'Send on-chain messages to any wallet on Eclipse. Connect your wallet to send Blips - personalized messages stored permanently on the blockchain.',
    keywords: 'Eclipse, blockchain messaging, on-chain messages, Blip, validators.wtf, blockchain communication',
    openGraph: {
        title: 'Send Messages on Eclipse | Validators.wtf',
        description: 'Send on-chain messages to any wallet on Eclipse. Connect your wallet to send Blips - personalized messages stored permanently on the blockchain.',
        url: 'https://validators.wtf/blip',
        siteName: 'Validators.wtf',
        type: 'website',
        images: [siteConfig.ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Send Messages on Eclipse | Validators.wtf',
        description: 'Send on-chain messages to any wallet on Eclipse. Connect your wallet to send Blips - personalized messages stored permanently on the blockchain.',
        images: [siteConfig.ogImage],
        creator: "@Validators_",
    }
};

export default function BlipLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
} 