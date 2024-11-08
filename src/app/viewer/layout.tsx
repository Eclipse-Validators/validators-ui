import { Metadata } from "next";
import { siteConfig } from "@/config/site";


export const metadata: Metadata = {
    title: 'Wallet Explorer | Validators.wtf',
    description: 'Explore any wallet on Eclipse. View transaction history, token balances, and on-chain activity in real-time.',
    openGraph: {
        title: 'Wallet Explorer | Validators.wtf',
        description: 'Explore any wallet on Eclipse. View transaction history, token balances, and on-chain activity in real-time.',
        url: 'https://validators.wtf/viewer',
        siteName: 'Validators.wtf',
        type: 'website',
        images: [siteConfig.ogImage],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Wallet Explorer | Validators.wtf',
        description: 'Explore any wallet on Eclipse. View transaction history, token balances, and on-chain activity in real-time.',
        images: [siteConfig.ogImage],
        creator: '@Validators_',
    }
};

export default function BlipLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>;
} 