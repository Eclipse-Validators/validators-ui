import React from "react";

import { BlipNftCard, BlipNftData } from "./blipNftCard";

export function BlipNftGrid({
  nfts,
  loading,
}: {
  nfts: BlipNftData[];
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {nfts.map((nft) => (
        <BlipNftCard key={nft.address} nft={nft} loading={loading} />
      ))}
    </div>
  );
}
