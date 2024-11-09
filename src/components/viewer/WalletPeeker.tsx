import React, { KeyboardEvent, useEffect, useState, useDeferredValue } from "react";
import { useAddressTokens2022 } from "@/lib/hooks/useAddressTokens2022";
import { useSPLTokens } from "@/lib/hooks/useWalletSplTokens";
import { useEmptyTokenAccounts } from "@/lib/hooks/useEmptyTokenAccounts";
import { useCoreAssets } from "@/lib/hooks/useCoreAssets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NFTCard } from "@/components/mint/nftCard";
import { SkeletonCard } from "@/components/loading/skeletonCard";
import { useWalletTokens } from "@/lib/hooks/useWalletTokens";
import { TokenCard } from "@/components/viewer/TokenCard";

export function WalletPeeker() {
  const [address, setAddress] = useState("");
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("spl");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearch = useDeferredValue(searchQuery);

  const { tokens: token2022Tokens, loading: loading2022, error: error2022 } = useWalletTokens(true, searchedAddress);
  const { tokens: splTokens, loading: loadingSPL, error: errorSPL } = useSPLTokens(true, searchedAddress);
  const { tokens: coreAssets, loading: loadingCore, error: errorCore } = useCoreAssets(searchedAddress);

  const handleSearch = () => {
    setSearchedAddress(address);
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set("wallet", address);
    window.history.pushState({}, "", `${window.location.pathname}?${queryParams.toString()}`);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const wallet = queryParams.get("wallet");

    if (wallet) {
      setAddress(wallet);
      setSearchedAddress(wallet);
    }
  }, []);

  const renderTokens = (tokens: any[], loading: boolean) => {
    if (loading) {
      return Array(6).fill(0).map((_, index) => <SkeletonCard key={index} />);
    }

    if (!tokens || tokens.length === 0) {
      return (
        <Card>
          <CardContent className="flex h-32 items-center justify-center">
            <p className="text-center text-gray-500">No tokens found</p>
          </CardContent>
        </Card>
      );
    }

    const filteredTokens = tokens.filter(token =>
      token.metadata?.name?.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      token.mint.toLowerCase().includes(deferredSearch.toLowerCase()) ||
      token.metadata?.symbol?.toLowerCase().includes(deferredSearch.toLowerCase())
    );

    return filteredTokens.map((token, index) => {
      if (token.decimals === 0) {
        return (
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
        );
      }

      return <TokenCard key={token.tokenAccount} token={token} />;
    });
  };

  if (errorSPL || error2022 || errorCore) {
    return <div>Error: {errorSPL || error2022 || errorCore}</div>;
  }

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

      {searchedAddress && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="px-3 sm:px-0 min-w-full">
              <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 h-auto gap-1">
                <TabsTrigger value="spl" className="px-2 py-1.5 text-xs sm:text-sm md:text-base">
                  SPL Tokens
                </TabsTrigger>
                <TabsTrigger value="token2022" className="px-2 py-1.5 text-xs sm:text-sm md:text-base">
                  Token-2022
                </TabsTrigger>
                <TabsTrigger value="nfts" className="px-2 py-1.5 text-xs sm:text-sm md:text-base">
                  NFTs
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-full sm:max-w-sm pr-8"
            />
          </div>

          <TabsContent value="spl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {renderTokens(splTokens, loadingSPL)}
            </div>
          </TabsContent>

          <TabsContent value="token2022">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {renderTokens(token2022Tokens, loading2022)}
            </div>
          </TabsContent>

          <TabsContent value="nfts">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {renderTokens(coreAssets, loadingCore)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
