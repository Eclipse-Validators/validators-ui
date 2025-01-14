"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getMint } from "@solana/spl-token";
import { Connection, ParsedAccountData, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { collectionAddress, fetchAsset, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { FetchedTokenInfo, JsonMetadata } from "@/lib/types";
import { fetchTokenMetadataHelper, fetchFullMetadata } from "@/lib/utils";
import { useGlobalConnection } from "@/components/GlobalConnectionProvider";
import NFTCardSkeleton from "@/components/loading/nftCardFullSkeleton";
import NFTCardFull from "@/components/mint/nftCardFull";

async function tryTokenAccounts(connection: Connection, mint: PublicKey) {
  try {
    const tokenAccount = await connection.getTokenLargestAccounts(mint);
    if (!tokenAccount.value.length) return null;

    const currentHolder = tokenAccount.value.find(
      (account) => account.amount === "1"
    );
    const tokenAccountInfo = await connection.getParsedAccountInfo(
      currentHolder?.address || tokenAccount.value[0].address
    );

    const accountProgramName = (tokenAccountInfo.value?.data as ParsedAccountData).program?.toString();
    if (!["spl-token", "spl-token-2022"].includes(accountProgramName || "")) {
      return null;
    }

    const programId = accountProgramName === "spl-token" ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID;
    const metadata = await fetchTokenMetadataHelper(connection, mint, programId);
    if (!metadata) return null;

    return {
      tokenAccount: currentHolder?.address.toString() || tokenAccount.value[0].address.toString(),
      mint: mint.toString(),
      amount: 1,
      decimals: 0,
      metadata,
      owner: (tokenAccountInfo?.value?.data as ParsedAccountData)?.parsed?.info?.owner?.toString(),
      programId: programId.toString()
    };
  } catch (err) {
    console.log("Token accounts fetch failed:", err);
    return null;
  }
}

async function tryMintInfo(connection: Connection, mint: PublicKey) {
  try {
    // Try both token programs in parallel
    const [token2022Mint, tokenMint] = await Promise.all([
      getMint(connection, mint, undefined, TOKEN_2022_PROGRAM_ID).catch(() => null),
      getMint(connection, mint, undefined, TOKEN_PROGRAM_ID).catch(() => null)
    ]);
    const mintInfo = token2022Mint || tokenMint;
    const programId = token2022Mint ? TOKEN_2022_PROGRAM_ID : tokenMint ? TOKEN_PROGRAM_ID : null;
    if (!programId) return null;

    const metadata = await fetchTokenMetadataHelper(connection, mint, programId);
    if (!metadata) return null;

    return {
      tokenAccount: mint.toString(),
      mint: mint.toString(),
      amount: 1,
      decimals: mintInfo?.decimals || 0,
      metadata,
      owner: mintInfo?.mintAuthority?.toBase58() || mintInfo?.freezeAuthority?.toBase58() || "unknown",
      programId: programId.toString()
    };
  } catch (err) {
    console.log("Mint info fetch failed:", err);
    return null;
  }
}

export default function NFTPage() {
  const { address } = useParams();
  const connection = useGlobalConnection();
  const [nft, setNft] = useState<FetchedTokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFT = async () => {
      if (!address) return;
      setLoading(true);
      setError(null);

      try {
        const mint = new PublicKey(address);

        // Try token accounts first
        const tokenResult = await tryTokenAccounts(connection, mint);
        if (tokenResult) {
          setNft(tokenResult);
          setLoading(false);
          return;
        }

        // If that fails, try mint info
        const mintResult = await tryMintInfo(connection, mint);
        if (mintResult) {
          setNft(mintResult);
          setLoading(false);
          return;
        }

        // If both fail, try Core asset
        try {
          const umi = createUmi(connection.rpcEndpoint);
          const asset = await fetchAsset(umi, publicKey(mint.toString()));

          if (asset) {
            let metadata: JsonMetadata = {};
            if (asset.uri) {
              metadata = await fetchFullMetadata(asset.uri);
            }

            setNft({
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
                attributes: metadata.attributes,
                description: metadata.description
              },
              owner: asset.owner.toString(),
              programId: MPL_CORE_PROGRAM_ID.toString()
            });
            return;
          }
        } catch (err) {
          console.log("Not a Core asset");
        }

        setError(`Failed to fetch ${address}`);
      } catch (err) {
        console.error("Error fetching NFT:", err);
        setError(`Failed to fetch ${address}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNFT();
  }, [address, connection]);

  if (loading) return <NFTCardSkeleton />;
  if (error) return <NFTCardSkeleton error={error} />;
  if (!nft) return <NFTCardSkeleton error="Not found" />;

  return <NFTCardFull nft={nft} />;
}
