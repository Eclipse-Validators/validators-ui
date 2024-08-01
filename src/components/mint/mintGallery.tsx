"use client";

import React, { useEffect, useState } from "react";
import {
  getGroupMemberPointerState,
  getGroupPointerState,
  getMint,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

import { decodeMember2022 } from "@/lib/anchor/members";

import { NFTCard, NFTData } from "./nftCard";

export default function MintGallery({
  mintAddresses,
}: {
  mintAddresses: string[];
}) {
  const [mintsData, setMintsData] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();

  useEffect(() => {
    const fetchMintData = async () => {
      const fetchedData: NFTData[] = [];
      for (const address of mintAddresses) {
        try {
          const mint = await getMint(
            connection,
            new PublicKey(address),
            "confirmed",
            TOKEN_2022_PROGRAM_ID
          );
          const accountInfo = await connection.getAccountInfo(
            new PublicKey(address)
          );
          if (accountInfo) {
            const getGroupMember = decodeMember2022(
              accountInfo,
              new PublicKey(address)
            );
            console.log(
              "getGroupMember",
              getGroupMember,
              getGroupMember.item?.group?.toBase58()
            );
          }

          console.log("mint", mint);
          const groupMember = getGroupMemberPointerState(mint);
          const group = getGroupPointerState(mint);
          if (groupMember) {
            console.log(
              "group",
              group,
              group?.authority?.toBase58(),
              group?.groupAddress?.toBase58()
            );
            console.log(
              "groupMember",
              groupMember,
              groupMember.authority?.toBase58(),
              groupMember.memberAddress?.toBase58()
            );
          }
          const tokenMetadata = await getTokenMetadata(
            connection,
            new PublicKey(address),
            "confirmed",
            TOKEN_2022_PROGRAM_ID
          );
          console.log("tokenMetadata", tokenMetadata);

          if (tokenMetadata?.uri) {
            const metadataResponse = await fetch(tokenMetadata.uri);
            const metadata = await metadataResponse.json();

            fetchedData.push({
              address,
              metadata: {
                name: metadata.name,
                image: metadata.image,
                attributes: metadata.attributes,
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
  }, [connection, mintAddresses]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mintsData.map((nft, index) => (
        <NFTCard key={nft.address} nft={nft} index={index} loading={loading} />
      ))}
      {loading &&
        mintAddresses.length > mintsData.length &&
        Array.from({ length: mintAddresses.length - mintsData.length }).map(
          (_, index) => (
            <NFTCard
              key={`loading-${index}`}
              nft={{ address: "" }}
              index={mintsData.length + index}
              loading={true}
            />
          )
        )}
    </div>
  );
}
