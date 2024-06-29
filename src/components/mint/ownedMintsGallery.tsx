'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from 'lucide-react';
import { useGroupMembers } from '@/components/providers/GroupMembersContext';
import { PublicKey } from "@solana/web3.js";
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useWalletTokens } from '@/lib/hooks/useWalletTokens';
import Link from 'next/link';

interface NFTData {
    address: string;
    metadata?: {
        name: string;
        image: string;
    };
}

const BATCH_SIZE = 10; // Number of NFTs to render at a time

export default function OwnedNFTsGallery() {
    const [nftsData, setNftsData] = useState<NFTData[]>([]);
    const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
    const [loading, setLoading] = useState(true);
    const { connection } = useConnection();
    const { tokens, loading: tokensLoading, refreshTokens } = useWalletTokens();
    const { hashlist, isLoading: membersLoading, refreshMembers } = useGroupMembers();
    const fetchedTokens = useRef(new Set<string>());

    const fetchNFTMetadata = useCallback(async (tokenMint: string): Promise<NFTData> => {
        try {
            const tokenMetadata = await getTokenMetadata(connection, new PublicKey(tokenMint), 'confirmed', TOKEN_2022_PROGRAM_ID);
            if (tokenMetadata?.uri) {
                const metadataResponse = await fetch(tokenMetadata.uri);
                const metadata = await metadataResponse.json();
                return {
                    address: tokenMint,
                    metadata: {
                        name: metadata.name,
                        image: metadata.image,
                    },
                };
            }
        } catch (error) {
            console.error(`Error fetching metadata for NFT ${tokenMint}:`, error);
        }
        return { address: tokenMint };
    }, [connection]);

    useEffect(() => {
        const fetchNFTData = async () => {
            if (membersLoading || tokensLoading) return;

            setLoading(true);
            const uniqueTokens = new Set(tokens.map(token => token.mint));
            const groupTokens = Array.from(uniqueTokens).filter(tokenMint => hashlist.has(tokenMint));

            const newNftsData: NFTData[] = [];
            for (const tokenMint of groupTokens) {
                if (!fetchedTokens.current.has(tokenMint)) {
                    const nftData = await fetchNFTMetadata(tokenMint);
                    newNftsData.push(nftData);
                    fetchedTokens.current.add(tokenMint);
                }
            }

            setNftsData(prevData => {
                const combinedData = [...prevData, ...newNftsData];
                // Remove any duplicates that might have slipped through
                return Array.from(new Map(combinedData.map(item => [item.address, item])).values());
            });
            setLoading(false);
        };

        fetchNFTData();
    }, [connection, tokens, hashlist, membersLoading, tokensLoading, fetchNFTMetadata]);

    const handleRefresh = () => {
        fetchedTokens.current.clear();
        setNftsData([]);
        setVisibleCount(BATCH_SIZE);
        refreshTokens();
        refreshMembers();
    };

    const loadMore = () => {
        setVisibleCount(prevCount => prevCount + BATCH_SIZE);
    };

    const getExplorerUrl = (address: string) => {
        return `${process.env.NEXT_PUBLIC_EXPLORER ?? 'https://explorer.dev.eclipsenetwork.xyz'}/address/${address}`;
    };

    if (nftsData.length === 0) {
        return (
            <div className="space-y-4 text-center">
                <h1 className="text-2xl font-bold">Your Owned Validators</h1>
                <p className="text-gray-400">No Validators found!</p>
                <Link href="/mint" passHref>
                    <button className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-700 transition-colors">
                        Go to Mint Page
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Your Owned NFTs</h1>
            <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Refresh NFTs
            </button>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {nftsData.slice(0, visibleCount).map((nft, index) => (
                    <Card key={nft.address} className="bg-gray-800 overflow-hidden">
                        <CardContent className="p-0">
                            {nft.metadata ? (
                                <div className="relative pb-[100%]">
                                    <img
                                        src={nft.metadata.image}
                                        alt={nft.metadata.name}
                                        className="absolute top-0 left-0 w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="aspect-square bg-gray-700 flex items-center justify-center">
                                    No image
                                </div>
                            )}
                            <div className="p-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-semibold truncate">
                                        {nft.metadata?.name || `NFT #${index + 1}`}
                                    </h3>
                                    <a
                                        href={getExplorerUrl(nft.address)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </div>
                                <p className="text-xs text-gray-400 truncate">{nft.address.slice(0, 6)}...</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {loading && Array.from({ length: BATCH_SIZE }).map((_, index) => (
                    <Card key={`skeleton-${index}`} className="bg-gray-800 overflow-hidden">
                        <CardContent className="p-0">
                            <Skeleton className="w-full aspect-square" />
                            <div className="p-2">
                                <Skeleton className="w-full h-4 mb-2" />
                                <Skeleton className="w-2/3 h-3" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            {!loading && visibleCount < nftsData.length && (
                <button
                    onClick={loadMore}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Load More
                </button>
            )}
        </div>
    );
}