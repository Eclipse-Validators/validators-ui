import { siteConfig } from '@/config/site'
import { Metadata } from 'next'


export const metadata: Metadata = {
    title: 'Token Rug Check | Validators.wtf',
    description: 'Analyze Eclipse tokens for potential red flags and risks. Check mint authority, freeze authority, and token holder distribution.',
    keywords: 'Eclipse, Solana, token analysis, rug check, token security, cryptocurrency, SPL token, Token 2022',
    openGraph: {
        title: 'Token Rug Check | Validators.wtf',
        description: 'Analyze Eclipse tokens for potential red flags and risks. Check mint authority, freeze authority, and token holder distribution.',
        url: 'https://validators.wtf/rugcheck',
        siteName: 'Validators.wtf',
        images: [
            {
                url: siteConfig.ogImage, // Add this image to your public folder
                width: 1200,
                height: 630,
                alt: 'Eclipse Token Rug Check Tool',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Token Rug Check | Validators.wtf',
        description: 'Analyze Eclipse tokens for potential red flags and risks. Check mint authority, freeze authority, and token holder distribution.',
        images: [siteConfig.ogImage],
    },
}

export default function RugCheckLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
} 