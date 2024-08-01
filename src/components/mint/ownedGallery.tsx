"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";

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
  const { publicKey } = useWallet();
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

  const [showCopySuccessIcon, setShowCopySuccessIcon] =
    useState<boolean>(false);

  const copyToClipboard = () => {
    const valueToCopy = publicKey?.toBase58();
    if (!valueToCopy) {
      return;
    }
    navigator.clipboard
      .writeText(
        `${process.env.NEXT_PUBLIC_APP_URL}/viewer/wallet?=${valueToCopy}`
      )
      .then(
        () => {
          setShowCopySuccessIcon(true);
          toast.success("Copied gallery link to clipboard!");
          setTimeout(() => {
            setShowCopySuccessIcon(false);
          }, 2_500);
        },
        () => {
          toast.error(`Failed to copy...`);
        }
      );
  };

  return (
    <>
      <div className="py-10">
        <div className="w-full max-w-[16rem]">
          <div className="relative">
            <input
              type="text"
              className="text-white-500 block w-full rounded-lg border bg-muted p-2.5 text-sm "
              value="Share Gallery Link"
              disabled
            />
            <button
              className="absolute end-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              onClick={copyToClipboard}
            >
              {!showCopySuccessIcon ? (
                <span id="default-icon">
                  <svg
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                  >
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                  </svg>
                </span>
              ) : (
                <span className="inline-flex items-center">
                  <svg
                    className="h-3.5 w-3.5 text-green-300"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="5"
                      d="M1 5.917 5.724 10.5 15 1.5"
                    />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
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
