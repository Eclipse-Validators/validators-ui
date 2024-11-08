"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { base58, base64 } from "@metaplex-foundation/umi/serializers";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SendTransactionError } from "@solana/web3.js";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlipNftData } from "@/components/mint/blipNftCard";
import { BlipNftGrid } from "@/components/mint/blipNftGrid";
import { AssetV1, fetchAssetsByOwner } from '@metaplex-foundation/mpl-core';

import { generateBlip } from "./actions";


export default function MessagePage() {
  const [to, setTo] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isSending, setIsSending] = useState(false);
  const [isLoadingBlips, setIsLoadingBlips] = useState(false);
  const [walletBlipNfts, setWalletBlipNfts] = useState<BlipNftData[]>([]);

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

    loadBlips();
  }, [wallet.publicKey]);

  async function handleSendBlip(message: string, to: string) {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions) {
      toast.error("Wallet Not Connected", {
        description: "Please connect your wallet.",
      });
      return;
    }

    try {
      new PublicKey(to);
    } catch (error) {
      toast.error("Invalid Recipient Address", {
        description: "Please enter a valid Solana address.",
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

    umi.use(walletAdapterIdentity(wallet, true));

    let txnSignature: string | null = null;
    try {
      const from = wallet.publicKey.toString();
      const response = await generateBlip(message, to, from);
      if (!response.data || response.error) {
        toast.error("Error generating Blip!", {
          description: response.error ?? "Unknown error",
        });
        setIsSending(false);
        return;
      }

      const deserializedTxnAsU8 = base64.serialize(response.serializedTxn);
      const deserializedTxn = umi.transactions.deserialize(deserializedTxnAsU8);
      const signedTxn = await umi.identity.signTransaction(deserializedTxn);
      txnSignature = base58.deserialize(
        await umi.rpc.sendTransaction(signedTxn)
      )[0];

      toast.success(`Successfully sent Blip!`, {
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
    <div className="main-bg mt-4 min-h-screen bg-cover bg-fixed bg-center bg-no-repeat p-4 text-foreground">
      <div className="mx-auto max-w-4xl">
        <Card className="border-border bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-center text-2xl font-bold">
              <Image src="/blip/logo.png" alt="Blip" width={200} height={200} />
            </CardTitle>
            <p className="flex items-center justify-center pt-4">
              Want to send a message to a wallet on Eclipse?
            </p>
            <p className="flex items-center justify-center">
              Say you want to buy a NFT, or send a special message to an enemy,
              or just say hi, with a Blip&nbsp;
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
                <Input
                  type="text"
                  placeholder="Enter Eclipse Wallet Address"
                  className="mb-4"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
                <Textarea
                  placeholder="Write your message..."
                  className="mb-4 h-32"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {wallet?.publicKey ? (
                  <Button
                    className="w-full"
                    variant="default"
                    onClick={() => handleSendBlip(message, to)}
                    disabled={isSending || !wallet?.publicKey}
                    loading={isSending}
                    loadingText={isSending ? "Sending Transaction" : ""}
                  >
                    Send Blip!
                  </Button>
                ) : (
                  <div className="text-center">
                    Connect wallet to send a Blip
                  </div>
                )}
              </div>
              <div>
                <div className="relative aspect-square rounded-lg border border-border">
                  <Image
                    src="/blip/placeholder.png"
                    alt="Blip Placeholder"
                    layout="fill"
                    objectFit="contain"
                  />
                  <div className="absolute ml-[40px] mt-[100px] w-full p-4">
                    <div className="w-auto max-w-none">
                      <p className="whitespace-nowrap text-[21px] text-foreground">
                        {formatMessage(message)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className="ml-2"></span>
                </div>
              </div>
            </div>

            <div className="w-full pt-4 text-center text-[12px]">
              Each Blip costs .0007 ETH and ~.000038 ETH for mint account costs.{" "}
              <i>Metaplex charges .000018 as a protocol fee.</i>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <h1 className="text-2xl font-bold">Your Blips</h1>
          <div className="mt-4">
            {wallet?.publicKey ? (
              <BlipNftGrid nfts={walletBlipNfts} loading={isLoadingBlips} />
            ) : (
              "Connect your wallet to check for Blips!"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
