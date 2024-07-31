"use client"

import React, { useState, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "../ui/button"
import { Icons } from "../icons"
import { useGroupMembers } from "@/components/providers/GroupMembersContext"
import { useWalletTokens } from "@/lib/hooks/useWalletTokens"
import { NFTData } from "./nftCard"
import { OwnedNFTGallery } from "./ownedGallery"
import { AllNFTGallery } from "./allGallery"

export default function NFTGallery() {
  const [activeTab, setActiveTab] = useState("owned")
  const { refreshMembers } = useGroupMembers()
  const { refreshTokens } = useWalletTokens()
  const [ownedNftsData, setOwnedNftsData] = useState<NFTData[]>([])

  const handleRefresh = useCallback(() => {
    refreshTokens()
    refreshMembers()
    setOwnedNftsData([])
  }, [refreshTokens, refreshMembers])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Validators Gallery</h1>
        <Button variant="outline" size={"icon"} onClick={handleRefresh}>
          <Icons.refresh />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="owned">Your Validators</TabsTrigger>
          <TabsTrigger value="all">All Validators</TabsTrigger>
        </TabsList>
        <TabsContent value="owned">
          <OwnedNFTGallery setOwnedNftsData={setOwnedNftsData} ownedNftsData={ownedNftsData} />
        </TabsContent>
        <TabsContent value="all">
          <AllNFTGallery ownedNftsData={ownedNftsData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}