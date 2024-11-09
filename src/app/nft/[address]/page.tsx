"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { ParsedAccountData, PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey } from "@metaplex-foundation/umi";
import { collectionAddress, fetchAsset, MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";

import { FetchedTokenInfo, JsonMetadata } from "@/lib/types";
import { fetchTokenMetadataHelper, fetchFullMetadata } from "@/lib/utils";
import { useGlobalConnection } from "@/components/GlobalConnectionProvider";
import NFTCardSkeleton from "@/components/loading/nftCardFullSkeleton";
import NFTCardFull from "@/components/mint/nftCardFull";

export default function NFTPage() {
  const { address } = useParams();
  const connection = useGlobalConnection();
  const [nft, setNft] = useState<FetchedTokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFT = async () => {
      if (!address) return;

      try {
        const mint = new PublicKey(address);

        // First try Token-2022 or traditional Metaplex metadata
        try {
          const tokenAccount = await connection.getTokenLargestAccounts(mint);
          if (tokenAccount.value.length > 0) {
            const currentHolder = tokenAccount.value.find(
              (account) => account.amount === "1"
            );
            const tokenAccountInfo = await connection.getParsedAccountInfo(
              currentHolder?.address || tokenAccount.value[0].address
            );
            console.log(tokenAccountInfo);
            const accountProgramName = (tokenAccountInfo.value?.data as unknown as ParsedAccountData).program?.toString();
            console.log(accountProgramName);
            if (accountProgramName !== "spl-token" &&
              accountProgramName !== "spl-token-2022") {
              throw new Error("Not a Token or Token-2022 account");
            }
            const accountProgramId = accountProgramName === "spl-token" ? TOKEN_PROGRAM_ID : TOKEN_2022_PROGRAM_ID;

            const metadata = await fetchTokenMetadataHelper(connection, mint, accountProgramId);
            if (metadata) {
              setNft({
                tokenAccount: currentHolder?.address.toString() || tokenAccount.value[0].address.toString(),
                mint: mint.toString(),
                amount: 1,
                decimals: 0,
                metadata,
                owner: (tokenAccountInfo?.value?.data as ParsedAccountData)?.parsed?.info?.owner?.toString() || null,
                programId: accountProgramId.toString()
              });
              return;
            }
          }
        } catch (err) {
          console.log("Not a Token-2022/traditional asset, trying Core...");
        }

        // Try Core asset
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
                attributes: metadata.attributes
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
