import { siteConfig } from "@/config/site";
import { Metadata } from "next";

// Add metadata
export const metadata: Metadata = {
    title: 'Send Messages on Eclipse | Validators.wtf',
    description: 'Send on-chain messages to any wallet on Eclipse. Connect your wallet to send Blips - personalized messages stored permanently on the blockchain.',
    openGraph: {
        title: 'Send Messages on Eclipse | Validators.wtf',
        description: 'Send on-chain messages to any wallet on Eclipse. Connect your wallet to send Blips - personalized messages stored permanently on the blockchain.',
        url: 'https://validators.wtf/blip',
        siteName: 'Validators.wtf',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Send Messages on Eclipse | Validators.wtf',
        description: 'Send on-chain messages to any wallet on Eclipse. Connect your wallet to send Blips - personalized messages stored permanently on the blockchain.',
        images: [siteConfig.ogImage],
        creator: "@Validators_",
    }
};