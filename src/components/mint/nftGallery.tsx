"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react"

import { useWalletTokens } from "@/lib/hooks/useWalletTokens"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGroupMembers } from "@/components/providers/GroupMembersContext"

import { Icons } from "../icons"
import { Button } from "../ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { NFTCard, NFTData } from "./nftCard"

function NFTGrid({
  nfts,
  visibleCount,
  loadMore,
  loading,
}: {
  nfts: NFTData[]
  visibleCount: number
  loadMore: () => void
  loading: boolean
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {nfts.slice(0, visibleCount).map((nft, index) => (
          <NFTCard
            key={nft.address}
            nft={nft}
            index={index}
            loading={loading}
          />
        ))}
        {loading &&
          nfts.length < visibleCount &&
          Array.from({ length: visibleCount - nfts.length }).map((_, index) => (
            <NFTCard
              key={`loading-${index}`}
              nft={{ address: "" }}
              index={nfts.length + index}
              loading={true}
            />
          ))}
      </div>
      {visibleCount < nfts.length && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={loadMore}
            className="mt-4 px-4 py-2"
          >
            Load More
          </Button>
        </div>
      )}
    </>
  )
}

const BATCH_SIZE = 10 // Number of NFTs to render at a time

export default function NFTGallery() {
  const [activeTab, setActiveTab] = useState("owned")
  const [ownedNftsData, setOwnedNftsData] = useState<NFTData[]>([])
  const [allNftsData, setAllNftsData] = useState<NFTData[]>([])
  const [ownedVisibleCount, setOwnedVisibleCount] = useState(BATCH_SIZE)
  const [allVisibleCount, setAllVisibleCount] = useState(BATCH_SIZE)
  const [loading, setLoading] = useState(true)
  const { connection } = useConnection()
  const { tokens, loading: tokensLoading, refreshTokens } = useWalletTokens()
  const {
    members,
    hashlist,
    isLoading: membersLoading,
    refreshMembers,
  } = useGroupMembers()
  const fetchedTokens = useRef(new Set<string>())

  const fetchNFTMetadata = useCallback(
    async (tokenMint: string): Promise<NFTData> => {
      try {
        const tokenMetadata = await getTokenMetadata(
          connection,
          new PublicKey(tokenMint),
          "confirmed",
          TOKEN_2022_PROGRAM_ID
        )
        if (tokenMetadata?.uri) {
          const metadataResponse = await fetch(tokenMetadata.uri)
          const metadata = await metadataResponse.json()
          return {
            address: tokenMint,
            metadata: {
              name: metadata.name,
              image: metadata.image,
              attributes: metadata.attributes,
            },
          }
        }
      } catch (error) {
        console.error(`Error fetching metadata for NFT ${tokenMint}:`, error)
      }
      return { address: tokenMint }
    },
    [connection]
  )

  const fetchOwnedNFTs = useCallback(async () => {
    if (membersLoading || tokensLoading) return

    setLoading(true)
    const uniqueTokens = new Set(tokens.map((token) => token.mint))
    const groupTokens = Array.from(uniqueTokens).filter((tokenMint) =>
      hashlist.has(tokenMint)
    )

    const newOwnedNftsData: NFTData[] = []

    for (const tokenMint of groupTokens) {
      if (!fetchedTokens.current.has(tokenMint)) {
        const nftData = await fetchNFTMetadata(tokenMint)
        newOwnedNftsData.push(nftData)
        fetchedTokens.current.add(tokenMint)
      }
    }

    setOwnedNftsData((prevData) => {
      const combinedData = [...prevData, ...newOwnedNftsData]
      return Array.from(
        new Map(combinedData.map((item) => [item.address, item])).values()
      )
    })
    setLoading(false)
  }, [
    fetchNFTMetadata,
    hashlist,
    members,
    membersLoading,
    tokens,
    tokensLoading,
  ])

  const fetchAllNFTs = useCallback(async () => {
    if (membersLoading) return

    setLoading(true)
    const newAllNftsData: NFTData[] = [...ownedNftsData] // Start with owned NFTs

    for (const member of members) {
      if (!fetchedTokens.current.has(member?.mint ?? "") && member.mint) {
        // Check if this NFT is already in ownedNftsData
        const existingNft = ownedNftsData.find(
          (nft) => nft.address === member.mint
        )
        if (existingNft) {
          newAllNftsData.push(existingNft)
        } else {
          const nftData = await fetchNFTMetadata(member.mint)
          newAllNftsData.push(nftData)
        }
        fetchedTokens.current.add(member.mint)
      }
    }

    setAllNftsData((prevData) => {
      const combinedData = [...prevData, ...newAllNftsData]
      return Array.from(
        new Map(combinedData.map((item) => [item.address, item])).values()
      )
    })

    setLoading(false)
  }, [fetchNFTMetadata, members, membersLoading, ownedNftsData])

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      if (activeTab === "owned") {
        await fetchOwnedNFTs()
      } else if (activeTab === "all" && allNftsData.length === 0) {
        await fetchAllNFTs()
      }
      if (isMounted) setLoading(false)
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [activeTab, fetchOwnedNFTs, fetchAllNFTs, allNftsData.length])

  const handleRefresh = useCallback(() => {
    fetchedTokens.current.clear()
    setOwnedNftsData([])
    setAllNftsData([])
    setOwnedVisibleCount(BATCH_SIZE)
    setAllVisibleCount(BATCH_SIZE)
    refreshTokens()
    refreshMembers()
    if (activeTab === "owned") {
      fetchOwnedNFTs()
    } else {
      fetchAllNFTs()
    }
  }, [activeTab, fetchOwnedNFTs, fetchAllNFTs, refreshTokens, refreshMembers])

  const loadMoreOwned = useCallback(
    () => setOwnedVisibleCount((prevCount) => prevCount + BATCH_SIZE),
    []
  )
  const loadMoreAll = useCallback(
    () => setAllVisibleCount((prevCount) => prevCount + BATCH_SIZE),
    []
  )

  if (loading && ownedNftsData.length === 0 && allNftsData.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold ">Validators Gallery</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: BATCH_SIZE }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden bg-card">
              <CardContent className="p-0">
                <Skeleton className="aspect-square w-full" />
                <div className="p-2">
                  <Skeleton className="mb-2 h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

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
          {ownedNftsData.length === 0 && !loading ? (
            <div className="py-10 text-center">
              <p className="mb-4 text-muted-foreground">
                No NFTs found in your wallet for this collection.
              </p>
              <Link href="/" passHref>
                <Button variant="outline">Go to Mint Page</Button>
              </Link>
            </div>
          ) : (
            <NFTGrid
              nfts={ownedNftsData}
              visibleCount={ownedVisibleCount}
              loadMore={loadMoreOwned}
              loading={loading}
            />
          )}
        </TabsContent>
        <TabsContent value="all">
          <NFTGrid
            nfts={allNftsData}
            visibleCount={allVisibleCount}
            loadMore={loadMoreAll}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
