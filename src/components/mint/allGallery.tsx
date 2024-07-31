"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"

import { useGroupMembers } from "@/components/providers/GroupMembersContext"
import { Button } from "../ui/button"
import { NFTData } from "./nftCard"
import { NFTGrid } from "./nftGrid"

const CHUNK_SIZE = 20
const INITIAL_VISIBLE_COUNT = 20

export function AllNFTGallery({ ownedNftsData }: { ownedNftsData: NFTData[] }) {
    const [allNftsData, setAllNftsData] = useState<NFTData[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchingMore, setFetchingMore] = useState(false)
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT)
    const { connection } = useConnection()
    const { members, isLoading: membersLoading } = useGroupMembers()
    const fetchedTokens = useRef(new Set<string>())
    const remainingTokens = useRef<string[]>([])

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

    const fetchAllNFTs = useCallback(async () => {
        if (membersLoading) return

        setLoading(true)
        const ownedAddresses = new Set(ownedNftsData.map(nft => nft.address))

        // Prioritize unowned tokens
        const unownedTokens = members
            .map(member => member.mint)
            .filter((mint): mint is string => !!mint && !ownedAddresses.has(mint))

        const ownedTokens = members
            .map(member => member.mint)
            .filter((mint): mint is string => !!mint && ownedAddresses.has(mint))

        remainingTokens.current = [...unownedTokens, ...ownedTokens]
            .filter(mint => !fetchedTokens.current.has(mint))

        const chunk = remainingTokens.current.splice(0, CHUNK_SIZE)
        const newAllNftsData = await fetchNFTChunk(chunk)

        setAllNftsData(newAllNftsData)
        chunk.forEach(tokenMint => fetchedTokens.current.add(tokenMint))
        setLoading(false)
    }, [fetchNFTChunk, members, membersLoading, ownedNftsData])

    useEffect(() => {
        fetchAllNFTs()
    }, [fetchAllNFTs])

    const loadMore = useCallback(async () => {
        if (fetchingMore) return
        setFetchingMore(true)
        const chunk = remainingTokens.current.splice(0, CHUNK_SIZE)
        const newNftsData = await fetchNFTChunk(chunk)
        setAllNftsData(prev => [...prev, ...newNftsData])
        setVisibleCount(prev => prev + CHUNK_SIZE)
        chunk.forEach(tokenMint => fetchedTokens.current.add(tokenMint))
        setFetchingMore(false)
    }, [fetchNFTChunk, fetchingMore])

    return (
        <>
            <NFTGrid
                nfts={allNftsData}
                visibleCount={visibleCount}
                loadMore={loadMore}
                loading={loading}
            />
            {remainingTokens.current.length > 0 && (
                <div className="flex justify-center mt-4">
                    <Button
                        variant="outline"
                        onClick={loadMore}
                        disabled={fetchingMore}
                    >
                        {fetchingMore ? 'Loading...' : 'Load More'}
                    </Button>
                </div>
            )}
        </>
    )
}