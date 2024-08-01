import React, { KeyboardEvent, useEffect, useState } from "react"

import { useAddressTokens2022 } from "@/lib/hooks/useAddressTokens2022"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NFTCard, NFTData } from "@/components/mint/nftCard"

export function WalletPeeker() {
  const [address, setAddress] = useState("")
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null)
  const { tokens, loading, error } = useAddressTokens2022(searchedAddress, true)

  const handleSearch = () => {
    setSearchedAddress(address)
    const queryParams = new URLSearchParams(window.location.search)
    queryParams.set("wallet", address)
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    const wallet = queryParams.get("wallet")

    if (wallet) {
      setAddress(wallet)
      setSearchedAddress(wallet)
    }
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Enter an address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6">
            <Input
              autoComplete="off"
              placeholder="Enter Solana address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-3/4"
            />
            <Button className="w-1/4" onClick={handleSearch}>
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent>
            <div className="p-4">
              <p className="text-center text-red-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="h-64">
                <div className="mb-4 h-40 w-full rounded-md bg-gray-300"></div>
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
                <div className="h-4 w-1/2 rounded bg-gray-300"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && tokens.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tokens.map((token, index) => (
            <NFTCard
              key={token.tokenAccount}
              nft={{
                address: token.mint,
                metadata: {
                  name: token.metadata?.name || `Token #${index + 1}`,
                  image: token.metadata?.image || "",
                },
              }}
              index={index}
              loading={false}
            />
          ))}
        </div>
      )}

      {!loading && tokens.length === 0 && searchedAddress && (
        <Card>
          <CardContent>
            <p>No tokens found for this address.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
