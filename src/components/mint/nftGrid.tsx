import React from "react"
import { NFTCard, NFTData } from "./nftCard"

export function NFTGrid({
    nfts,
    visibleCount,
    loadMore,
    loading,
}: {
    nfts: NFTData[]
    visibleCount: number
    loadMore: () => void
    loading: boolean
}) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {nfts.slice(0, visibleCount).map((nft, index) => (
                <NFTCard
                    key={nft.address}
                    nft={nft}
                    index={index}
                    loading={loading}
                />
            ))}
        </div>
    )
}