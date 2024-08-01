"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { useWalletTokens } from "@/lib/hooks/useWalletTokens";
import { useGroupMembers } from "@/components/providers/GroupMembersContext";

import { Button } from "../ui/button";
import { NFTData } from "./nftCard";
import { NFTGrid } from "./nftGrid";

const CHUNK_SIZE = 20;
const INITIAL_VISIBLE_COUNT = 20;

export function OwnedNFTGallery({
  ownedNftsData,
  setOwnedNftsData,
}: {
  ownedNftsData: NFTData[];
  setOwnedNftsData: React.Dispatch<React.SetStateAction<NFTData[]>>;
}) {
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const { connection } = useConnection();
  const { tokens, loading: tokensLoading } = useWalletTokens();
  const { hashlist, isLoading: membersLoading } = useGroupMembers();
  const fetchedTokens = useRef(new Set<string>());
  const remainingTokens = useRef<string[]>([]);

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

  const fetchOwnedNFTs = useCallback(async () => {
    if (membersLoading || tokensLoading) return;

    setLoading(true);
    const uniqueTokens = new Set(tokens.map((token) => token.mint));
    const groupTokens = Array.from(uniqueTokens).filter((tokenMint) =>
      hashlist.has(tokenMint)
    );

    remainingTokens.current = groupTokens.filter(
      (tokenMint) => !fetchedTokens.current.has(tokenMint)
    );
    const chunk = remainingTokens.current.splice(0, CHUNK_SIZE);
    const newOwnedNftsData = await fetchNFTChunk(chunk);

    setOwnedNftsData((prev) => {
      const uniqueNfts = [...prev, ...newOwnedNftsData].filter(
        (nft, index, self) =>
          index === self.findIndex((t) => t.address === nft.address)
      );
      return uniqueNfts;
    });
    chunk.forEach((tokenMint) => fetchedTokens.current.add(tokenMint));
    setLoading(false);
  }, [
    fetchNFTChunk,
    hashlist,
    tokens,
    membersLoading,
    tokensLoading,
    setOwnedNftsData,
  ]);

  useEffect(() => {
    fetchOwnedNFTs();
  }, [fetchOwnedNFTs]);

  const loadMore = useCallback(async () => {
    if (fetchingMore) return;
    setFetchingMore(true);
    const chunk = remainingTokens.current.splice(0, CHUNK_SIZE);
    const newNftsData = await fetchNFTChunk(chunk);
    setOwnedNftsData((prev) => {
      const uniqueNfts = [...prev, ...newNftsData].filter(
        (nft, index, self) =>
          index === self.findIndex((t) => t.address === nft.address)
      );
      return uniqueNfts;
    });
    setVisibleCount((prev) => prev + CHUNK_SIZE);
    chunk.forEach((tokenMint) => fetchedTokens.current.add(tokenMint));
    setFetchingMore(false);
  }, [fetchNFTChunk, fetchingMore, setOwnedNftsData]);

  return (
    <>
      <NFTGrid
        nfts={ownedNftsData}
        visibleCount={visibleCount}
        loadMore={loadMore}
        loading={loading}
      />
      {remainingTokens.current.length > 0 && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={fetchingMore}>
            {fetchingMore ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
      {ownedNftsData.length === 0 && !loading && (
        <div className="py-10 text-center">
          <p className="mb-4 text-muted-foreground">
            No NFTs found in your wallet for this collection.
          </p>
          <Link href="/" passHref>
            <Button variant="outline">Go to Mint Page</Button>
          </Link>
        </div>
      )}
    </>
  );
}
