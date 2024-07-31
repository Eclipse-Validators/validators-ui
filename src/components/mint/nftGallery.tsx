"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"

import { useWalletTokens } from "@/lib/hooks/useWalletTokens"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGroupMembers } from "@/components/providers/GroupMembersContext"

import { Icons } from "../icons"
import { Button } from "../ui/button"
import { NFTCard, NFTData } from "./nftCard"

const CHUNK_SIZE = 20 // Number of NFTs to fetch in each chunk
const INITIAL_VISIBLE_COUNT = 20 // Number of NFTs to display initially

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
      </div>
    </>
  )
}

export default function NFTGallery() {
  const [activeTab, setActiveTab] = useState("owned")
  const [ownedNftsData, setOwnedNftsData] = useState<NFTData[]>([])
  const [allNftsData, setAllNftsData] = useState<NFTData[]>([])
  const [ownedVisibleCount, setOwnedVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [allVisibleCount, setAllVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
  const [loading, setLoading] = useState(true)
  const [fetchingMore, setFetchingMore] = useState(false)
  const { connection } = useConnection()
  const { tokens, loading: tokensLoading, refreshTokens } = useWalletTokens()
  const {
    members,
    hashlist,
    isLoading: membersLoading,
    refreshMembers,
  } = useGroupMembers()
  const fetchedTokens = useRef(new Set<string>())
  const remainingOwnedTokens = useRef<string[]>([])
  const remainingAllTokens = useRef<string[]>([])

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

  const fetchNFTChunk = useCallback(async (tokenMints: string[]): Promise<NFTData[]> => {
    const nftDataPromises = tokenMints.map(tokenMint => fetchNFTMetadata(tokenMint))
    return await Promise.all(nftDataPromises)
  }, [fetchNFTMetadata])

  const fetchOwnedNFTs = useCallback(async () => {
    if (membersLoading || tokensLoading) return

    setLoading(true)
    const uniqueTokens = new Set(tokens.map((token) => token.mint))
    const groupTokens = Array.from(uniqueTokens).filter((tokenMint) =>
      hashlist.has(tokenMint)
    )

    remainingOwnedTokens.current = groupTokens.filter(tokenMint => !fetchedTokens.current.has(tokenMint))
    const chunk = remainingOwnedTokens.current.splice(0, CHUNK_SIZE)
    const newOwnedNftsData = await fetchNFTChunk(chunk)

    setOwnedNftsData(prev => [...prev, ...newOwnedNftsData])
    chunk.forEach(tokenMint => fetchedTokens.current.add(tokenMint))
    setLoading(false)
  }, [fetchNFTChunk, hashlist, tokens, membersLoading, tokensLoading])

  const fetchAllNFTs = useCallback(async () => {
    if (membersLoading) return

    setLoading(true)
    remainingAllTokens.current = members
      .map(member => member.mint)
      .filter((mint): mint is string => !!mint && !fetchedTokens.current.has(mint))

    const chunk = remainingAllTokens.current.splice(0, CHUNK_SIZE)
    const newAllNftsData = await fetchNFTChunk(chunk)

    setAllNftsData(prev => [...prev, ...newAllNftsData])
    chunk.forEach(tokenMint => fetchedTokens.current.add(tokenMint))
    setLoading(false)
  }, [fetchNFTChunk, members, membersLoading])

  useEffect(() => {
    if (activeTab === "owned" && ownedNftsData.length === 0) {
      fetchOwnedNFTs()
    } else if (activeTab === "all" && allNftsData.length === 0) {
      fetchAllNFTs()
    } else {
      setLoading(false)
    }
  }, [activeTab, fetchOwnedNFTs, fetchAllNFTs, ownedNftsData.length, allNftsData.length])

  const handleRefresh = useCallback(() => {
    fetchedTokens.current.clear()
    remainingOwnedTokens.current = []
    remainingAllTokens.current = []
    setOwnedNftsData([])
    setAllNftsData([])
    setOwnedVisibleCount(INITIAL_VISIBLE_COUNT)
    setAllVisibleCount(INITIAL_VISIBLE_COUNT)
    refreshTokens()
    refreshMembers()
    if (activeTab === "owned") {
      fetchOwnedNFTs()
    } else {
      fetchAllNFTs()
    }
  }, [activeTab, fetchOwnedNFTs, fetchAllNFTs, refreshTokens, refreshMembers])

  const loadMoreOwned = useCallback(async () => {
    if (fetchingMore) return
    setFetchingMore(true)
    const chunk = remainingOwnedTokens.current.splice(0, CHUNK_SIZE)
    const newNftsData = await fetchNFTChunk(chunk)
    setOwnedNftsData(prev => [...prev, ...newNftsData])
    setOwnedVisibleCount(prev => prev + CHUNK_SIZE)
    chunk.forEach(tokenMint => fetchedTokens.current.add(tokenMint))
    setFetchingMore(false)
  }, [fetchNFTChunk, fetchingMore])

  const loadMoreAll = useCallback(async () => {
    if (fetchingMore) return
    setFetchingMore(true)
    const chunk = remainingAllTokens.current.splice(0, CHUNK_SIZE)
    const newNftsData = await fetchNFTChunk(chunk)
    setAllNftsData(prev => [...prev, ...newNftsData])
    setAllVisibleCount(prev => prev + CHUNK_SIZE)
    chunk.forEach(tokenMint => fetchedTokens.current.add(tokenMint))
    setFetchingMore(false)
  }, [fetchNFTChunk, fetchingMore])

  const currentNfts = activeTab === "owned" ? ownedNftsData : allNftsData
  const currentVisibleCount = activeTab === "owned" ? ownedVisibleCount : allVisibleCount
  const currentLoadMore = activeTab === "owned" ? loadMoreOwned : loadMoreAll
  const hasMoreNfts = activeTab === "owned"
    ? remainingOwnedTokens.current.length > 0
    : remainingAllTokens.current.length > 0

  if (loading && currentNfts.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold ">Validators Gallery</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: INITIAL_VISIBLE_COUNT }).map((_, index) => (
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
          {currentNfts.length === 0 && !loading ? (
            <div className="py-10 text-center">
              <p className="mb-4 text-muted-foreground">
                No NFTs found in your wallet for this collection.
              </p>
              <Link href="/" passHref>
                <Button variant="outline">Go to Mint Page</Button>
              </Link>
            </div>
          ) : (
            <>
              <NFTGrid
                nfts={currentNfts}
                visibleCount={currentVisibleCount}
                loadMore={currentLoadMore}
                loading={loading}
              />
              {hasMoreNfts && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={currentLoadMore}
                    disabled={fetchingMore}
                  >
                    {fetchingMore ? 'Loading...' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
        <TabsContent value="all">
          <NFTGrid
            nfts={currentNfts}
            visibleCount={currentVisibleCount}
            loadMore={currentLoadMore}
            loading={loading}
          />
          {hasMoreNfts && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={currentLoadMore}
                disabled={fetchingMore}
              >
                {fetchingMore ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}