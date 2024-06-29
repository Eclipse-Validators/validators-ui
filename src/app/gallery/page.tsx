// app/owned-nfts/page.tsx
'use client';

import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { GroupMembersProvider } from '@/components/providers/GroupMembersContext';
import { PublicKey } from '@solana/web3.js';
import OwnedNFTsGallery from '@/components/mint/ownedMintsGallery';

export default function OwnedNFTsPage() {
    const { publicKey } = useWallet();
    const deploymentId = new PublicKey(process.env.NEXT_PUBLIC_DEPLOYMENTID ?? '');

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <main className="container mx-auto p-4">
                {publicKey ? (
                    <GroupMembersProvider deploymentId={deploymentId}>
                        <OwnedNFTsGallery />
                    </GroupMembersProvider>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-xl mb-4">Connect your wallet to view your NFTs</p>
                        <WalletMultiButton />
                    </div>
                )}
            </main>
        </div>
    );
}