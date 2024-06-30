// app/owned-nfts/page.tsx
"use client"

import React from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { PublicKey } from "@solana/web3.js"

import NFTGallery from "@/components/mint/nftGallery"
import { GroupMembersProvider } from "@/components/providers/GroupMembersContext"

export default function OwnedNFTsPage() {
  const { publicKey } = useWallet()
  const deploymentId = new PublicKey(process.env.NEXT_PUBLIC_DEPLOYMENTID ?? "")

  return (
    <div className="main-bg min-h-screen bg-cover bg-fixed bg-center bg-no-repeat text-foreground">
      <main className="container mx-auto p-4">
        {publicKey ? (
          <GroupMembersProvider deploymentId={deploymentId}>
            <NFTGallery />
          </GroupMembersProvider>
        ) : (
          <div className="py-20 text-center">
            <p className="mb-4 text-xl">
              Connect your wallet to view your NFTs
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
