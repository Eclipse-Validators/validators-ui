"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo, useDeferredValue } from "react";
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { X } from "lucide-react";

import { useGroupMembers } from "@/components/providers/GroupMembersContext";

import { Button } from "../ui/button";
import { NFTData } from "./nftCard";
import { NFTGrid } from "./nftGrid";
import { Input } from "../ui/input";

const CHUNK_SIZE = 20;
const INITIAL_VISIBLE_COUNT = 20;

export function AllNFTGallery({ ownedNftsData }: { ownedNftsData: NFTData[] }) {
  const [allNftsData, setAllNftsData] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);
  const { connection } = useConnection();
  const { members, isLoading: membersLoading } = useGroupMembers();
  const fetchedTokens = useRef(new Set<string>());
  const remainingTokens = useRef<string[]>([]);
  const allLoadedNfts = useRef<NFTData[]>([]);

  const fetchNFTMetadata = useCallback(
    async (tokenMint: string): Promise<NFTData> => {
      try {
        const tokenMetadata = await getTokenMetadata(
          connection,
          new PublicKey(tokenMint),
          "confirmed",
          TOKEN_2022_PROGRAM_ID
        );
        if (tokenMetadata?.uri) {
          const metadataResponse = await fetch(tokenMetadata.uri);
          const metadata = await metadataResponse.json();
          return {
            address: tokenMint,
            metadata: {
              name: metadata.name,
              image: metadata.image,
              attributes: metadata.attributes,
            },
          };
        }
      } catch (error) {
        console.error(`Error fetching metadata for NFT ${tokenMint}:`, error);
      }
      return { address: tokenMint };
    },
    [connection]
  );

  const fetchNFTChunk = useCallback(
    async (tokenMints: string[]): Promise<NFTData[]> => {
      const nftDataPromises = tokenMints.map((tokenMint) =>
        fetchNFTMetadata(tokenMint)
      );
      return await Promise.all(nftDataPromises);
    },
    [fetchNFTMetadata]
  );

  const fetchAllNFTs = useCallback(async () => {
    if (membersLoading) return;

    setLoading(true);
    const ownedAddresses = new Set(ownedNftsData.map((nft) => nft.address));

    const unownedTokens = members
      .map((member) => member.mint)
      .filter((mint): mint is string => !!mint && !ownedAddresses.has(mint));

    const ownedTokens = members
      .map((member) => member.mint)
      .filter((mint): mint is string => !!mint && ownedAddresses.has(mint));

    remainingTokens.current = [...unownedTokens, ...ownedTokens].filter(
      (mint) => !fetchedTokens.current.has(mint)
    );

    const chunk = remainingTokens.current.splice(0, CHUNK_SIZE);
    const newAllNftsData = await fetchNFTChunk(chunk);

    allLoadedNfts.current = newAllNftsData;
    setAllNftsData(newAllNftsData);
    chunk.forEach((tokenMint) => fetchedTokens.current.add(tokenMint));
    setLoading(false);
  }, [fetchNFTChunk, members, membersLoading, ownedNftsData]);

  const loadMore = useCallback(async () => {
    if (fetchingMore) return;
    setFetchingMore(true);
    const chunk = remainingTokens.current.splice(0, CHUNK_SIZE);
    const newNftsData = await fetchNFTChunk(chunk);
    allLoadedNfts.current = [...allLoadedNfts.current, ...newNftsData];
    setAllNftsData((prev) => [...prev, ...newNftsData]);
    setVisibleCount((prev) => prev + CHUNK_SIZE);
    chunk.forEach((tokenMint) => fetchedTokens.current.add(tokenMint));
    setFetchingMore(false);
  }, [fetchNFTChunk, fetchingMore]);

  const filteredNfts = useMemo(() => {
    if (!deferredSearch) return allLoadedNfts.current;

    return allLoadedNfts.current.filter((nft) =>
      nft.metadata?.name?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      nft.address.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      nft.metadata?.attributes?.some(attr =>
        attr.value?.toString().toLowerCase().includes(deferredSearch.toLowerCase())
      )
    );
  }, [deferredSearch, allLoadedNfts.current]);

  useEffect(() => {
    fetchAllNFTs();
  }, [fetchAllNFTs]);

  return (
    <div className="space-y-4">
      <div className="relative w-full max-w-sm">
        <Input
          type="text"
          placeholder="Search NFTs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-8"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <NFTGrid
        nfts={filteredNfts}
        visibleCount={visibleCount}
        loadMore={loadMore}
        loading={loading}
      />

      {!deferredSearch && remainingTokens.current.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={fetchingMore}>
            {fetchingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
