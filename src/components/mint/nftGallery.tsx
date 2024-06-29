'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useGroupMembers } from '@/components/providers/GroupMembersContext';
import { PublicKey } from "@solana/web3.js";
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useWalletTokens } from '@/lib/hooks/useWalletTokens';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

interface Attribute {
    trait_type: string;
    value: string | number;
}

interface NFTData {
    address: string;
    metadata?: {
        name: string;
        image: string;
        attributes?: Attribute[];
    };
}

function AttributesList({ attributes }: { attributes: Attribute[] }) {
    return (
        <div className="grid grid-cols-2 gap-2 mt-2">
            {attributes.map((attr, index) => (
                <div key={index} className="bg-muted rounded p-1 text-xs">
                    <div className="font-semibold mb-1">{attr.trait_type}</div>
                    <div className="bg-card p-1 rounded">{attr.value}</div>
                </div>
            ))}
        </div>
    );
}

function NFTCard({ nft, index }: { nft: NFTData; index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    const getExplorerUrl = (address: string) => {
        return `${process.env.NEXT_PUBLIC_EXPLORER ?? 'https://explorer.dev.eclipsenetwork.xyz'}/address/${address}`;
    };

    return (
        <Card className="bg-card overflow-hidden">
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
                    <div className="aspect-square bg-muted flex items-center justify-center">
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
                            className="text-muted-foreground hover:text-white transition-colors"
                        >
                            <ExternalLink size={16} />
                        </a>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{nft.address.slice(0, 6)}...</p>

                    {nft.metadata?.attributes && nft.metadata.attributes.length > 0 && (
                        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
                            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-muted-foreground">
                                Attributes
                                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <AttributesList attributes={nft.metadata.attributes} />
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function NFTGrid({ nfts, visibleCount, loadMore }: { nfts: NFTData[], visibleCount: number, loadMore: () => void }) {
    return (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {nfts.slice(0, visibleCount).map((nft, index) => (
                    <NFTCard key={nft.address} nft={nft} index={index} />
                ))}
            </div>
            {visibleCount < nfts.length && (
                <button
                    onClick={loadMore}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Load More
                </button>
            )}
        </>
    );
}

const BATCH_SIZE = 10; // Number of NFTs to render at a time


export default function NFTGallery() {
    const [activeTab, setActiveTab] = useState('owned');
    const [ownedNftsData, setOwnedNftsData] = useState<NFTData[]>([]);
    const [allNftsData, setAllNftsData] = useState<NFTData[]>([]);
    const [ownedVisibleCount, setOwnedVisibleCount] = useState(BATCH_SIZE);
    const [allVisibleCount, setAllVisibleCount] = useState(BATCH_SIZE);
    const [loading, setLoading] = useState(true);
    const { connection } = useConnection();
    const { tokens, loading: tokensLoading, refreshTokens } = useWalletTokens();
    const { members, hashlist, isLoading: membersLoading, refreshMembers } = useGroupMembers();
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
                        attributes: metadata.attributes,
                    },
                };
            }
        } catch (error) {
            console.error(`Error fetching metadata for NFT ${tokenMint}:`, error);
        }
        return { address: tokenMint };
    }, [connection]);

    const fetchOwnedNFTs = useCallback(async () => {
        if (membersLoading || tokensLoading) return;

        setLoading(true);
        const uniqueTokens = new Set(tokens.map(token => token.mint));
        const groupTokens = Array.from(uniqueTokens).filter(tokenMint => hashlist.has(tokenMint));

        const newOwnedNftsData: NFTData[] = [];

        for (const tokenMint of groupTokens) {
            if (!fetchedTokens.current.has(tokenMint)) {
                const nftData = await fetchNFTMetadata(tokenMint);
                newOwnedNftsData.push(nftData);
                fetchedTokens.current.add(tokenMint);
            }
        }

        setOwnedNftsData(prevData => {
            const combinedData = [...prevData, ...newOwnedNftsData];
            return Array.from(new Map(combinedData.map(item => [item.address, item])).values());
        });

        setLoading(false);
    }, [fetchNFTMetadata, hashlist, members, membersLoading, tokens, tokensLoading]);

    const fetchAllNFTs = useCallback(async () => {
        if (membersLoading) return;

        setLoading(true);
        const newAllNftsData: NFTData[] = [];

        for (const member of members) {
            if (!fetchedTokens.current.has(member?.mint ?? '') && member.mint) {
                const nftData = await fetchNFTMetadata(member.mint);
                newAllNftsData.push(nftData);
                fetchedTokens.current.add(member.mint);
            }
        }

        setAllNftsData(prevData => {
            const combinedData = [...prevData, ...newAllNftsData];
            return Array.from(new Map(combinedData.map(item => [item.address, item])).values());
        });

        setLoading(false);
    }, [fetchNFTMetadata, members, membersLoading]);

    useEffect(() => {
        if (activeTab === 'owned') {
            fetchOwnedNFTs();
        } else if (activeTab === 'all' && allNftsData.length === 0) {
            fetchAllNFTs();
        }
    }, [activeTab, fetchOwnedNFTs, fetchAllNFTs, allNftsData.length]);

    const handleRefresh = () => {
        fetchedTokens.current.clear();
        setOwnedNftsData([]);
        setAllNftsData([]);
        setOwnedVisibleCount(BATCH_SIZE);
        setAllVisibleCount(BATCH_SIZE);
        refreshTokens();
        refreshMembers();
        if (activeTab === 'owned') {
            fetchOwnedNFTs();
        } else {
            fetchAllNFTs();
        }
    };

    const loadMoreOwned = () => setOwnedVisibleCount(prevCount => prevCount + BATCH_SIZE);
    const loadMoreAll = () => setAllVisibleCount(prevCount => prevCount + BATCH_SIZE);

    if (loading && ownedNftsData.length === 0 && allNftsData.length === 0) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Validators Gallery</h1>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: BATCH_SIZE }).map((_, index) => (
                        <Card key={`skeleton-${index}`} className="bg-card overflow-hidden">
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
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Validators Gallery</h1>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Refresh NFTs
                </button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                    <TabsTrigger value="owned">Your Validators</TabsTrigger>
                    <TabsTrigger value="all">All Validators</TabsTrigger>
                </TabsList>
                <TabsContent value="owned">
                    {ownedNftsData.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground mb-4">No NFTs found in your wallet for this collection.</p>
                            <Link href="/mint" passHref>
                                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                                    Go to Mint Page
                                </button>
                            </Link>
                        </div>
                    ) : (
                        <NFTGrid nfts={ownedNftsData} visibleCount={ownedVisibleCount} loadMore={loadMoreOwned} />
                    )}
                </TabsContent>
                <TabsContent value="all">
                    {loading && allNftsData.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">Loading collection NFTs...</p>
                        </div>
                    ) : (
                        <NFTGrid nfts={allNftsData} visibleCount={allVisibleCount} loadMore={loadMoreAll} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}