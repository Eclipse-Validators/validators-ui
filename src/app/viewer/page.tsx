"use client";

import { Metadata } from 'next';
import { siteConfig } from '@/config/site';
import { WalletPeeker } from "@/components/viewer/WalletPeeker";

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

export default function WalletPeekerPage() {
  return (
    <div className="main-bg min-h-screen bg-cover bg-fixed bg-center bg-no-repeat text-foreground">
      <main className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Viewer</h1>
        <WalletPeeker />
      </main>
    </div>
  );
}
