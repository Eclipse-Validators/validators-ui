// app/owned-nfts/page.tsx
"use client";

import React from "react";
import { PublicKey } from "@solana/web3.js";

import NFTGallery from "@/components/mint/nftGallery";
import { GroupMembersProvider } from "@/components/providers/GroupMembersContext";

export default function OwnedNFTsPage() {
  const deploymentId = new PublicKey(
    process.env.NEXT_PUBLIC_DEPLOYMENTID ?? ""
  );

  return (
    <div className="main-bg min-h-screen bg-cover bg-fixed bg-center bg-no-repeat text-foreground">
      <main className="container mx-auto p-4">
        <GroupMembersProvider deploymentId={deploymentId}>
          <NFTGallery />
        </GroupMembersProvider>
      </main>
    </div>
  );
}
