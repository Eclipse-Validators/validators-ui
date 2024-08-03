"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { AccountInfo, ParsedAccountData, PublicKey } from "@solana/web3.js";

import { FetchedTokenInfo } from "@/lib/types";
import { fetchTokenInfo } from "@/lib/utils";
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
        const tokenAccount = await connection.getTokenLargestAccounts(mint);
        if (tokenAccount.value.length > 0) {
          const currentHolder = tokenAccount.value.find(
            (account) => account.amount === "1"
          );
          const tokenAccountInfo = await connection.getParsedAccountInfo(
            currentHolder?.address || tokenAccount.value[0].address
          );
          console.log("tokenAccountInfo", tokenAccountInfo);
          const fetchInfos = await fetchTokenInfo(
            connection,
            [
              {
                pubkey: currentHolder?.address || tokenAccount.value[0].address,
                account:
                  tokenAccountInfo.value as AccountInfo<ParsedAccountData>,
              },
            ],
            TOKEN_2022_PROGRAM_ID,
            true
          );
          console.log("tokenAccount", fetchInfos);
          setNft(fetchInfos[0]);
        } else {
          setError(`Failed to fetch ${address}`);
        }
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
