"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { AssetV1, collectionAddress, fetchAssetsByOwner, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { FetchedTokenInfo, JsonMetadata } from "@/lib/types";
import { fetchAllDigitalAssetByOwner } from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import { fetchFullMetadata } from "../utils";

export function useCoreAssets(address?: string | null) {
    const { publicKey: walletPublicKey } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokens, setTokens] = useState<FetchedTokenInfo[]>([]);
    const [assets, setAssets] = useState<AssetV1[]>([])

    useEffect(() => {
        async function fetchCoreAssets() {
            const targetAddress = address ? new PublicKey(address) : walletPublicKey;
            if (!targetAddress) {
                setTokens([]);
                setAssets([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const umi = createUmi(connection.rpcEndpoint);
                const assets = await fetchAssetsByOwner(
                    umi,
                    publicKey(targetAddress.toBase58())
                );
                //TODO: add in normal metaplex nfts at somepoint
                // const traditionalNfts = await fetchAllDigitalAssetByOwner(umi, publicKey(walletPublicKey.toBase58()));
                // const mappedNftTokensPromises = traditionalNfts.map(async asset => {
                //     let metadata: JsonMetadata = {};

                //     if (asset.metadata) {
                //         metadata = await fetchMetadata(asset.metadata.uri);
                //     }
                //     return {
                //         tokenAccount: asset.,
                //         mint: asset.mint.publicKey,
                //         amount: 1,
                //         decimals: 0,
                //         metadata: {
                //             collectionAddress: collectionAddress(asset),
                //             name: metadata.name || asset.name,
                //             symbol: metadata.symbol || "",
                //             image: metadata.image || asset.uri,
                //             json: asset.uri,
                //             attributes: metadata.attributes || asset.attributes?.attributeList
                //         },
                //         owner: walletPublicKey.toBase58(),
                //         programId: MPL_CORE_PROGRAM_ID.toString()
                //     } as FetchedTokenInfo;
                // });
                const mappedTokensPromises = assets.map(async asset => {
                    let metadata: JsonMetadata = {};

                    if (asset.uri) {
                        metadata = await fetchFullMetadata(asset.uri);
                    }
                    return {
                        tokenAccount: asset.publicKey.toString(),
                        mint: asset.publicKey.toString(),
                        amount: 1,
                        decimals: 0,
                        metadata: {
                            collectionAddress: collectionAddress(asset),
                            name: metadata.name || asset.name,
                            symbol: metadata.symbol || "",
                            image: metadata.image || asset.uri,
                            json: asset.uri,
                            attributes: metadata.attributes || asset.attributes?.attributeList
                        },
                        owner: targetAddress.toBase58(),
                        programId: MPL_CORE_PROGRAM_ID.toString()
                    } as FetchedTokenInfo;
                });

                const mappedTokens = await Promise.all(mappedTokensPromises);

                // Sort tokens by name/mint similar to TransferTokens
                const sortedTokens = mappedTokens.sort((a, b) => {
                    const parseNumber = (name: string) => {
                        const match = name.match(/\d+/);
                        return match ? parseInt(match[0]) : 0;
                    };

                    if (a.metadata?.name && b.metadata?.name) {
                        const numA = parseNumber(a.metadata.name);
                        const numB = parseNumber(b.metadata.name);
                        return numA - numB || a.metadata.name.localeCompare(b.metadata.name);
                    }
                    return a.mint.localeCompare(b.mint);
                });
                setAssets(assets);
                setTokens(sortedTokens);
            } catch (err) {
                console.error("Error fetching core assets:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        fetchCoreAssets();
    }, [walletPublicKey, connection, address]);

    const refreshTokens = () => {
        setLoading(true);
    };

    return {
        tokens,
        loading,
        error,
        refreshTokens
    };
} 