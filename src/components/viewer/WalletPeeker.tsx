import React, { KeyboardEvent, useEffect, useState, useDeferredValue, useCallback } from "react";
import { useSPLTokens } from "@/lib/hooks/useWalletSplTokens";
import { useCoreAssets } from "@/lib/hooks/useCoreAssets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NFTCard } from "@/components/mint/nftCard";
import { SkeletonCard } from "@/components/loading/skeletonCard";
import { useWalletTokens } from "@/lib/hooks/useWalletTokens";
import { TokenCard } from "@/components/viewer/TokenCard";
import { useEclipseDomains } from '@/hooks/use-eclipse-domains'
import { Skeleton } from "../ui/skeleton";
import { useEclipseDomainLookup } from '@/hooks/use-eclipse-domain-lookup';
import { PublicKey } from "@solana/web3.js";
import { useDebounce } from "@/lib/hooks/useDebounce";

function DomainCard({ address }: { address: string }) {
  const { data: domainsData, isLoading } = useEclipseDomains(address)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Owned Domains</CardTitle>
        </CardHeader>
        <CardContent className="flex h-16 items-center justify-center">
          <Skeleton className="h-4 w-48" />
        </CardContent>
      </Card>
    )
  }

  if (!domainsData?.domains.length) {
    return null // Don't show anything if no domains
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Owned Domains</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-2 py-4">
        <div className="flex flex-wrap gap-2">
          {domainsData.domains.map((domain, index) => (
            <div
              key={index}
              className="rounded-full bg-muted px-3 py-1 text-sm font-medium"
            >
              {domain.domain}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function WalletPeeker() {
  const [input, setInput] = useState("");
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("spl");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const deferredSearch = useDeferredValue(debouncedSearch);
  const debouncedInput = useDebounce(input, 300);

  const { tokens: token2022Tokens, loading: loading2022, error: error2022 } = useWalletTokens(true, searchedAddress);
  const { tokens: splTokens, loading: loadingSPL, error: errorSPL } = useSPLTokens(true, searchedAddress);
  const { tokens: coreAssets, loading: loadingCore, error: errorCore } = useCoreAssets(searchedAddress);

  const { data: domainLookup, isLoading: isLookingUpDomain } = useEclipseDomainLookup(
    /\./.test(debouncedInput) ? debouncedInput : undefined
  );

  const [isValidInput, setIsValidInput] = useState(false);

  useEffect(() => {
    const validateInput = () => {
      if (!debouncedInput) {
        setIsValidInput(false);
        return;
      }

      if (/\./.test(debouncedInput)) {
        setIsValidInput(Boolean(domainLookup?.publicKey && !domainLookup.error));
        return;
      }

      try {
        new PublicKey(debouncedInput);
        setIsValidInput(true);
      } catch {
        setIsValidInput(false);
      }
    };

    validateInput();
  }, [debouncedInput, domainLookup]);

  const handleSearch = useCallback(() => {
    if (/\./.test(debouncedInput)) {
      if (domainLookup?.publicKey && !domainLookup.error) {
        setSearchedAddress(domainLookup.publicKey);
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set("wallet", domainLookup.publicKey);
        window.history.pushState({}, "", `${window.location.pathname}?${queryParams.toString()}`);
      }
    } else {
      setSearchedAddress(debouncedInput);
      const queryParams = new URLSearchParams(window.location.search);
      queryParams.set("wallet", debouncedInput);
      window.history.pushState({}, "", `${window.location.pathname}?${queryParams.toString()}`);
    }
  }, [debouncedInput, domainLookup]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && isValidInput && !isLookingUpDomain) {
      handleSearch();
    }
  };

  const [initialQueryParamHandled, setInitialQueryParamHandled] = useState(false);

  useEffect(() => {
    const handleQueryParam = async () => {
      if (initialQueryParamHandled) return;

      const queryParams = new URLSearchParams(location.search);
      const wallet = queryParams.get("wallet");

      if (wallet) {
        setInput(wallet);

        if (/\./.test(wallet)) {
          if (domainLookup?.publicKey && !domainLookup.error) {
            const resolvedAddress = domainLookup.publicKey;
            setSearchedAddress(resolvedAddress);
            queryParams.set("wallet", resolvedAddress);
            window.history.pushState({}, "", `${window.location.pathname}?${queryParams.toString()}`);
            setInitialQueryParamHandled(true);
          }
        } else {
          try {
            new PublicKey(wallet);
            setSearchedAddress(wallet);
            setInitialQueryParamHandled(true);
          } catch {
            console.log('invalid address');
          }
        }
      }
    };

    handleQueryParam();
  }, [domainLookup, initialQueryParamHandled]);

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
          <CardTitle>Enter an address or domain</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-6">
              <Input
                autoComplete="off"
                placeholder="Enter Solana address or domain"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-3/4 ${debouncedInput && (
                  isValidInput ? "border-green-500" :
                    isLookingUpDomain ? "border-yellow-500" :
                      "border-red-500"
                )}`}
              />
              <Button
                className="w-1/4"
                onClick={handleSearch}
                disabled={isLookingUpDomain || !isValidInput}
              >
                {isLookingUpDomain ? "Looking up..." : "Search"}
              </Button>
            </div>
            {debouncedInput && !isValidInput && (
              <p className="text-sm text-red-500">
                {/\./.test(debouncedInput)
                  ? (isLookingUpDomain
                    ? "Looking up domain..."
                    : domainLookup?.error || "Domain not found")
                  : "Please enter a valid Solana address or domain"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {searchedAddress && (
        <>
          <DomainCard address={searchedAddress} />
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
        </>
      )}
    </div>
  );
}
