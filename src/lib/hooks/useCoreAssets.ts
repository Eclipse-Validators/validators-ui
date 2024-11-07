"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { AssetV1, collectionAddress, fetchAssetsByOwner, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { FetchedTokenInfo } from "@/lib/types";

interface JsonMetadata {
    name?: string;
    symbol?: string;
    image?: string;
    description?: string;
    attributes?: Array<{ trait_type: string; value: string }>;
}

export function useCoreAssets() {
    const { publicKey: walletPublicKey } = useWallet();
    const { connection } = useConnection();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokens, setTokens] = useState<FetchedTokenInfo[]>([]);
    const [assets, setAssets] = useState<AssetV1[]>([])

    useEffect(() => {
        async function fetchCoreAssets() {
            if (!walletPublicKey) {
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
                    publicKey(walletPublicKey.toBase58())
                );

                // Fetch metadata for each asset
                const mappedTokensPromises = assets.map(async asset => {
                    let metadata: JsonMetadata = {};

                    if (asset.uri) {
                        try {
                            const response = await fetch(asset.uri);
                            if (response.ok) {
                                metadata = await response.json();
                            }
                        } catch (err) {
                            console.error(`Error fetching metadata for ${asset.publicKey.toString()}:`, err);
                        }
                    }

                    return {
                        tokenAccount: collectionAddress(asset),
                        mint: asset.publicKey.toString(),
                        amount: 1,
                        decimals: 0,
                        metadata: {
                            name: metadata.name || asset.name,
                            symbol: metadata.symbol || "",
                            image: metadata.image || asset.uri,
                            attributes: asset.attributes?.attributeList
                        },
                        owner: walletPublicKey.toBase58(),
                        programId: MPL_CORE_PROGRAM_ID.toString()
                    } as FetchedTokenInfo;
                });

                const mappedTokens = await Promise.all(mappedTokensPromises);
                setTokens(mappedTokens);
                setAssets(assets);
            } catch (err) {
                console.error("Error fetching core assets:", err);
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }

        fetchCoreAssets();
    }, [walletPublicKey, connection]);

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