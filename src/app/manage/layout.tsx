import { siteConfig } from '@/config/site'
import { Metadata } from 'next'


export const metadata: Metadata = {
    title: 'Manage Tokens | Validators.wtf',
    description: 'Manage your Eclipse tokens - revoke mint authority, freeze authority, and control token permissions.',
    keywords: 'Eclipse, Solana, token management, mint authority, freeze authority, SPL token, Token 2022',
    openGraph: {
        title: 'Manage Tokens | Validators.wtf',
        description: 'Manage your Eclipse tokens - revoke mint authority, freeze authority, and control token permissions.',
        url: 'https://validators.wtf/manage',
        siteName: 'Validators.wtf',
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: 'Eclipse Token Management Tool',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Manage Tokens | Validators.wtf',
        description: 'Manage your Eclipse tokens - revoke mint authority, freeze authority, and control token permissions.',
        images: [siteConfig.ogImage],
    },
}

export default function ManageLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
} 