"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AssetV1, fetchAssetsByOwner } from "@metaplex-foundation/mpl-core";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { base58, base64 } from "@metaplex-foundation/umi/serializers";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
import { toast } from "sonner";

import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEclipseDomainLookup } from "@/hooks/use-eclipse-domain-lookup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlipNftData } from "@/components/mint/blipNftCard";
import { BlipNftGrid } from "@/components/mint/blipNftGrid";

import { generateBlip, getConfigTemplates } from "./actions";

type Template = {
  uri: string;
  mint: string;
  artistWallet: string;
  artistName: string;
  artistSocials: string;
  feePremiumLamports: number;
};

// Add this new component at the top of the file, before the MessagePage component
const FloatingHearts = React.memo(() => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Large hearts */}
    {[...Array(25)].map((_, i) => (
      <div
        key={i}
        className="animate-float absolute"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${12 + Math.random() * 8}s`,
          opacity: 0.15,
        }}
      >
        <div
          style={{
            transform: `rotate(${Math.random() * 360}deg)`,
            width: `${1.5 + Math.random() * 2}rem`,
            height: `${1.5 + Math.random() * 2}rem`,
          }}
        >
          {Math.random() > 0.5 ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </div>
      </div>
    ))}
    {/* Small hearts */}
    {[...Array(20)].map((_, i) => (
      <div
        key={`small-${i}`}
        className="animate-float-slow absolute"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 10}s`,
          animationDuration: `${15 + Math.random() * 10}s`,
          opacity: 0.15,
        }}
      >
        <div
          style={{
            transform: `rotate(${Math.random() * 360}deg)`,
            width: `${0.8 + Math.random() * 0.8}rem`,
            height: `${0.8 + Math.random() * 0.8}rem`,
          }}
        >
          {Math.random() > 0.5 ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
        </div>
      </div>
    ))}
  </div>
));

FloatingHearts.displayName = "FloatingHearts";

export default function MessagePage() {
  const [to, setTo] = useState<string>("");
  const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
  const debouncedTo = useDebounce(to, 300);

  // Only lookup domain if input contains a period
  const { data: domainLookup, isLoading: isLookingUpDomain } = useEclipseDomainLookup(
    /\./.test(debouncedTo) ? debouncedTo : undefined
  );

  // Validate input and update resolved address
  useEffect(() => {
    if (!debouncedTo) {
      setResolvedAddress(null);
      return;
    }

    if (/\./.test(debouncedTo)) {
      // Handle domain
      if (domainLookup?.publicKey && !domainLookup.error) {
        setResolvedAddress(domainLookup.publicKey);
      } else {
        setResolvedAddress(null);
      }
    } else {
      // Handle direct address
      try {
        new PublicKey(debouncedTo);
        setResolvedAddress(debouncedTo);
      } catch {
        setResolvedAddress(null);
      }
    }
  }, [debouncedTo, domainLookup]);

  const isValidInput = useCallback(() => {
    if (!to) return false;

    if (/\./.test(to)) {
      return Boolean(domainLookup?.publicKey && !domainLookup.error);
    }

    try {
      new PublicKey(to);
      return true;
    } catch {
      return false;
    }
  }, [to, domainLookup]);

  const [message, setMessage] = useState<string>("");
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isSending, setIsSending] = useState(false);
  const [isLoadingBlips, setIsLoadingBlips] = useState(false);
  const [walletBlipNfts, setWalletBlipNfts] = useState<BlipNftData[]>([]);
  const [templates, setTemplates] = useState<Template[]>([
    {
      uri: "https://arweave.net/PGGyjImnEhdicy9RMDng-vowIqbY7CpTUKi2_5XZl08?ext=png",
      mint: "B6cawaKXzRDVA7c1YdaVrgrxBKWxRN9p5ADvr1gNsN6A",
      artistWallet: "6onrnEdTbQKprwgF5VhLSRN3HH9x2JtDetVBxMoqiwmH",
      artistName: "Validators",
      feePremiumLamports: 0,
      artistSocials: "https://x.com/Validators_",
    },
    {
      uri: "https://arweave.net/Tv6NY-P8jSHWgX5-t_DswyOUpQ6SsOd6rsfZXnCtU_Y?ext=png",
      mint: "TVogK47MS2TFYpdwj7J1qgUuKZvdo2NBz8sRUz3GN57",
      artistWallet: "4iuPZBgmwqKeRF6bDdPCvdnyxB46dJrJshZsXMZHbwis",
      artistName: "94L1",
      feePremiumLamports: 300_000,
      artistSocials: "https://x.com/94l1_",
    },
    // {
    //   uri: "https://arweave.net/Opo1BMaJOEL7frhtnlsstOpeTMj2uK71KHBGpRx3LJA?ext=gif",
    //   mint: "4kmandkHVYKaJxPvNC5aQHGLhyY5AjH3DipBzzv2eAfP",
    //   artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
    //   artistName: "Ash",
    //   feePremiumLamports: 300_000,
    //   artistSocials: "https://x.com/Ashes_arc",
    // },
    // {
    //   uri: "https://arweave.net/Ot1Ju61AtjpOl2Tt5lyioOJeEi8SChjqUIuB35pKVDs?ext=gif",
    //   mint: "7joBw7ZoEqT4kAsmjPhwdqxmW6eAG312z9GL2GkZWQc8",
    //   artistWallet: "9DbD6nmkeiYStSn8DNuMhkezpK5P3xGLBx5RFkYKNEBx",
    //   artistName: "Ash",
    //   feePremiumLamports: 300_000,
    //   artistSocials: "https://x.com/Ashes_arc",
    // },
    // {
    //   uri: "https://arweave.net/sfEUHNREXt3fme5kJkhizJDFzeLcndfIt3bgs80uRp0?ext=png",
    //   mint: "HiJuJ2qQRFVXBUr7booTU4RKqYxLcH5YXcMQmUJKTFfv",
    //   artistWallet: "61YD2RUbhDcfUpP1Uy6vzXwRoV8nkVzYJcC6NVxsBC3h",
    //   artistName: "Apotiq1",
    //   feePremiumLamports: 300_000,
    //   artistSocials: "https://x.com/Apotiq1",
    // },
    // {
    //   uri: "https://arweave.net/6s2Jv_O2sFuw12p38wMq4NTit_KwiR8ADu9YcKeNdk8?ext=png",
    //   mint: "8rVdhKZGGgBdTCGsfos7KJxzGgJRgFNSeUeTRW1r469n",
    //   artistWallet: "4iuPZBgmwqKeRF6bDdPCvdnyxB46dJrJshZsXMZHbwis",
    //   artistName: "94L1",
    //   feePremiumLamports: 300_000,
    //   artistSocials: "https://x.com/94l1_",
    // },
    // {
    //   uri: "https://arweave.net/5wCoYqrfh0nr10sdpzHSm1uaUadmfDxdJI4TN-n4Ljk?ext=png",
    //   mint: "DiCVrorLafQHpkNTYvWxKYX4mYbs7Z6wjE492LZbDszp",
    //   artistWallet: "6smBKDhMPxf9AD3Na7GkXnt5trhwKkfSEf1aWT4y5Aka",
    //   artistName: "DanFarz",
    //   feePremiumLamports: 300_000,
    //   artistSocials: "https://t.me/DanFarz",
    // },
    // {
    //   uri: "https://arweave.net/wTPoJZ5Ru0OmQRyKQHHeYTH6ww1i8GJn51aC4Q70x08?ext=png",
    //   mint: "2EJinsv31EQxPUw2SHmezkMYDW5fp4X31mhSeNZScZWE",
    //   artistWallet: "zELCQXYo3Q5ePGjLBvirRJn72B7d8bHFARvNpwekmxY",
    //   artistName: "Notrev",
    //   feePremiumLamports: 300_000,
    //   artistSocials: "https://x.com/NotRevv__",
    // },
  ]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    templates[0]
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const umi = createUmi(connection.rpcEndpoint);

  useEffect(() => {
    async function loadBlips() {
      if (!wallet?.publicKey) {
        return;
      }

      setIsLoadingBlips(true);

      const fetchCoreAssets = async () => {
        if (!wallet?.publicKey) {
          return [];
        }
        const ownedAssets = await fetchAssetsByOwner(umi, publicKey(wallet.publicKey.toBase58()), {
          skipDerivePlugins: false,
        })
        console.log("ownedAssets", ownedAssets)
        const ownedBlips = ownedAssets.filter((asset) => asset.updateAuthority.address === publicKey("7MWzy1jbS3KC561EnY6DBixqToVwMfDqd7eXcGXZkj2A"))
        return ownedBlips;
      };

      const mappedBlips = async (assets: AssetV1[]): Promise<BlipNftData[]> => {
        const blipDataPromises = assets.map(async (asset) => {
          try {
            const response = await fetch(asset.uri);
            if (!response.ok) {
              throw new Error(`Failed to fetch JSON from ${asset.uri}`);
            }
            const data = await response.json();
            return {
              address: asset.publicKey.toString(),
              metadata: {
                image: data.image,
                attributes: data.attributes || [],
              },
            } as BlipNftData;
          } catch (error) {
            console.error(`Error processing asset ${asset.publicKey.toString()}:`, error);
            return null; // Skip this asset if there's an error
          }
        });

        const blipData = await Promise.all(blipDataPromises);
        // Filter out any null values resulting from fetch errors
        return blipData.filter((nft): nft is BlipNftData => nft !== null);
      };

      const blipNfts = await mappedBlips(await fetchCoreAssets());

      setWalletBlipNfts(
        blipNfts.filter((nft): nft is BlipNftData => nft !== null)
      );
      setIsLoadingBlips(false);
    }

    // async function loadTemplates() {
    //   setIsLoadingTemplates(true);
    //   const templates = await getConfigTemplates();
    //   setTemplates(templates);
    //   if (templates.length > 0) {
    //     setSelectedTemplate(templates[0]);
    //   }
    //   setIsLoadingTemplates(false);
    // }
    // loadTemplates();

    loadBlips();
  }, [wallet.publicKey]);

  async function handleSendBlip(
    template: Template,
    message: string,
    to: string
  ) {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet.",
      });
      return;
    }

    let targetAddress = to;
    if (/\./.test(to) && domainLookup?.publicKey) {
      targetAddress = domainLookup.publicKey;
    }

    try {
      new PublicKey(targetAddress);
    } catch (error) {
      toast.error("Invalid Recipient Address", {
        description: "Please enter a valid Solana address or domain.",
      });
      return;
    }

    if (!message) {
      toast.error("No Message Provided", {
        description: "Please enter a message for your Blip!",
      });
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Generating your Blip image...");

    umi.use(walletAdapterIdentity(wallet, true));

    let txnSignature: string | null = null;
    try {
      const from = wallet.publicKey.toString();
      const response = await generateBlip(
        template,
        message,
        targetAddress,
        from
      );
      if (!response.data || response.error) {
        toast.error("Error generating Blip!", {
          id: toastId,
          description: response.error ?? "Unknown error",
        });
        setIsSending(false);
        return;
      }

      toast.loading("Sending transaction...", { id: toastId });

      const deserializedTxnAsU8 = base64.serialize(response.serializedTxn);
      const deserializedTxn = umi.transactions.deserialize(deserializedTxnAsU8);
      const signedTxn = await umi.identity.signTransaction(deserializedTxn);
      txnSignature = base58.deserialize(
        await umi.rpc.sendTransaction(signedTxn)
      )[0];

      toast.success(`Successfully sent Blip!`, {
        id: toastId,
        description: "You can view your transacton on the Eclipse Explorer",
        action: {
          label: "View Transactions",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_EXPLORER!}/tx/${txnSignature}`,
              "_blank"
            ),
        },
      });
    } catch (error) {
      console.error(`Error SENDING blip (txn sig: ${txnSignature}):`, error);
      toast.error("Error sending Blip!", {
        id: toastId,
        description: error instanceof Error ? error.message : "Unknown error",
      });
      if (error instanceof SendTransactionError) {
        const logs = await error.getLogs(connection);
        console.log(error.logs, logs);
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <div className="relative min-h-screen bg-[#C8003C] p-4 text-white">
        {/* Background pattern */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23ffffff' /%3E%3C/svg%3E")`,
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Replace the existing hearts code with the new component */}
        <FloatingHearts />

        {/* Update Card background colors */}
        <div className="relative z-10 mx-auto max-w-4xl">
          <Card className="border-white/30 bg-[#B4003C]/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-center text-center text-2xl font-bold">
                <Image
                  src="/blip/logo.png"
                  alt="Blip"
                  width={200}
                  height={200}
                />
              </CardTitle>
              <p className="flex items-center justify-center pt-4">
                Want to send a special Valentine&apos;s message on Eclipse? 💝
              </p>
              <p className="flex items-center justify-center">
                Share your heart, express your affection, or send your secret
                admirer a note via Blip&nbsp;
                <Image
                  src="/logo/small.webp"
                  alt="Validators"
                  width={20}
                  height={20}
                />
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-4 w-full space-y-2 rounded-lg border border-[#ff4d94]/30 bg-[#8b283c]/20 p-4">
                    <p className="pb-2 text-center font-medium">
                      Choose Your Love Letter Design
                    </p>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {isLoadingTemplates
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={i}
                                className="aspect-square w-full animate-pulse rounded-lg bg-[#ff4d94]/20"
                              />
                            ))
                        : templates.map((template) => (
                            <button
                              key={template.mint}
                              onClick={() => setSelectedTemplate(template)}
                              className={`group relative flex w-full flex-col items-center rounded-lg border transition-all hover:opacity-90 ${
                                selectedTemplate?.mint === template.mint
                                  ? "border-[#ff4d94] shadow-md shadow-[#ff4d94]/20"
                                  : "border-[#ff4d94]/30"
                              }`}
                            >
                              {template.artistName !== "Validators" && (
                                <div className="absolute -right-3 -top-2 z-[999] rounded-full bg-[#ff4d94] px-2 py-0.5 text-[10px] font-medium text-white">
                                  New!
                                </div>
                              )}
                              <div className="relative z-0 aspect-square w-full">
                                <Image
                                  src={template.uri}
                                  alt={`${template.artistName} Template`}
                                  layout="fill"
                                  objectFit="contain"
                                  className="p-1"
                                />
                              </div>
                              <span className="py-1 text-xs">
                                {template.artistName}
                              </span>
                            </button>
                          ))}
                    </div>
                  </div>

                  <Input
                    type="text"
                    placeholder="Enter your Valentine's address or domain"
                    className={`mb-2 border-[#ff4d94]/30 bg-[#8b283c]/20 text-white placeholder:text-white/70 focus:border-[#ff4d94] focus:ring-[#ff4d94]/20 ${
                      to &&
                      (isLookingUpDomain
                        ? "border-yellow-500"
                        : isValidInput()
                          ? "border-[#ff4d94]"
                          : "border-red-500")
                    }`}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    disabled={isLoadingTemplates}
                  />
                  {to && (
                    <div className="text-sm">
                      {isLookingUpDomain ? (
                        <p className="text-yellow-500">Looking up domain...</p>
                      ) : /\./.test(to) ? (
                        domainLookup?.publicKey ? (
                          <p className="text-[#ff4d94]">
                            Resolved address:{" "}
                            {domainLookup.publicKey.slice(0, 4)}
                            ...{domainLookup.publicKey.slice(-4)}
                          </p>
                        ) : (
                          <p className="text-red-500">
                            Invalid or unregistered domain
                          </p>
                        )
                      ) : isValidInput() ? (
                        <p className="text-[#ff4d94]">Valid Solana address</p>
                      ) : (
                        <p className="text-red-500">Invalid Solana address</p>
                      )}
                    </div>
                  )}
                  <Textarea
                    placeholder="Write your heartfelt message..."
                    className="mb-4 h-32 border-[#ff4d94]/30 bg-[#8b283c]/20 text-white placeholder:text-white/70 focus:border-[#ff4d94] focus:ring-[#ff4d94]/20"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isLoadingTemplates}
                  />
                  {wallet?.publicKey ? (
                    <Button
                      className="w-full bg-[#ff4d94] hover:bg-[#ff4d94]/90"
                      variant="default"
                      onClick={() => {
                        if (!selectedTemplate) {
                          toast.error("No template selected", {
                            description: "Please select a template",
                          });
                          return;
                        }
                        handleSendBlip(selectedTemplate, message, to);
                      }}
                      disabled={
                        isSending || !wallet?.publicKey || !isValidInput()
                      }
                      loading={isSending}
                      loadingText={isSending ? "Sending Transaction" : ""}
                    >
                      Send Love! 💘
                    </Button>
                  ) : (
                    <div className="text-center">
                      Connect wallet to send Valentine&apos;s Blip
                    </div>
                  )}
                </div>
                <div>
                  <div className="relative aspect-square rounded-lg border border-[#ff4d94]/30 bg-[#8b283c]/20">
                    {selectedTemplate?.uri && (
                      <Image
                        src={selectedTemplate?.uri}
                        alt="Blip Template"
                        layout="fill"
                        objectFit="contain"
                      />
                    )}
                    <div
                      className={`absolute w-full p-4 ${
                        selectedTemplate?.artistName === "Ash"
                          ? "ml-[40px] mt-[60px]"
                          : "ml-[40px] mt-[100px]"
                      }`}
                    >
                      <div className="w-auto max-w-none">
                        <p
                          className={`whitespace-nowrap text-[21px] ${
                            selectedTemplate?.artistName === "Ash"
                              ? "text-black"
                              : "text-foreground"
                          }`}
                        >
                          {formatMessage(message)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-2 rounded-lg border border-[#ff4d94]/30 bg-[#8b283c]/20 p-4 text-center text-sm">
                <p className="font-medium">Love Letter Delivery Fees</p>
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>
                    <span className="text-white/70">Cost of Love:</span>{" "}
                    <code className="font-semibold text-[#ff4d94]">
                      ~
                      {(
                        (738000 + (selectedTemplate?.feePremiumLamports || 0)) /
                        1_000_000_000
                      ).toFixed(6)}{" "}
                      ETH
                    </code>
                    <span className="ml-2 text-white/70">
                      (includes delivery and Cupid&apos;s fees)
                    </span>
                  </div>
                  {selectedTemplate?.artistName !== "Validators" && (
                    <div className="text-xs text-white/70">
                      A portion of the fee will go to{" "}
                      {selectedTemplate?.artistName}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 rounded-lg bg-[#B4003C]/90 p-4 backdrop-blur-sm">
            <h1 className="text-2xl font-bold">Your Love Letters</h1>
            <div className="mt-4">
              {wallet?.publicKey ? (
                <BlipNftGrid nfts={walletBlipNfts} loading={isLoadingBlips} />
              ) : (
                "Connect your wallet to see your collection of love letters!"
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
