'use client';
import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { getMint, getExtensionTypes, ExtensionType, TOKEN_2022_PROGRAM_ID, getTokenMetadata } from '@solana/spl-token';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnection } from '@solana/wallet-adapter-react';
import { ExternalLink } from 'lucide-react';

interface MintData {
    address: string;
    metadata?: {
        name: string;
        image: string;
    };
}

export default function MintGallery({ mintAddresses }: { mintAddresses: string[] }) {
    const [mintsData, setMintsData] = useState<MintData[]>([]);
    const [loading, setLoading] = useState(true);
    const { connection } = useConnection();
    useEffect(() => {
        const fetchMintData = async () => {

            const fetchedData: MintData[] = [];

            for (const address of mintAddresses) {
                try {
                    const mint = await getMint(
                        connection,
                        new PublicKey(address),
                        'confirmed',
                        TOKEN_2022_PROGRAM_ID
                    );

                    console.log('mint', mint)

                    const tokenMetadata = await getTokenMetadata(connection, new PublicKey(address), 'confirmed', TOKEN_2022_PROGRAM_ID);
                    console.log('tokenMetadata', tokenMetadata);

                    if (tokenMetadata?.uri) {
                        const metadataResponse = await fetch(tokenMetadata.uri);
                        const metadata = await metadataResponse.json();

                        fetchedData.push({
                            address,
                            metadata: {
                                name: metadata.name,
                                image: metadata.image,
                            },
                        });
                    } else {
                        fetchedData.push({ address });
                    }
                } catch (error) {
                    console.error(`Error fetching data for mint ${address}:`, error);
                    fetchedData.push({ address });
                }
            }

            setMintsData(fetchedData);
            setLoading(false);
        };

        fetchMintData();
    }, [mintAddresses]);

    const getExplorerUrl = (address: string) => {
        // Adjust this URL based on whether you're using devnet or mainnet
        return `${process.env.NEXT_PUBLIC_EXPLORER ?? 'https://explorer.dev.eclipsenetwork.xyz'}/address/${address}`;
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, index) => (
                    <Card key={index} className="bg-gray-800 overflow-hidden">
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
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mintsData.map((mint, index) => (
                <Card key={mint.address} className="bg-gray-800 overflow-hidden">
                    <CardContent className="p-0">
                        {mint.metadata ? (
                            <div className="relative pb-[100%]">
                                <img
                                    src={mint.metadata.image}
                                    alt={mint.metadata.name}
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
                                    {mint.metadata?.name || `Validators #${index + 1}`}
                                </h3>
                                <a
                                    href={getExplorerUrl(mint.address)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                            <p className="text-xs text-gray-400 truncate">{mint.address.slice(0, 6)}...</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}