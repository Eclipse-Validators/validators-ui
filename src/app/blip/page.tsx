"use client";

import React, { useState } from "react";
import Image from "next/image";
import { transferSol } from "@metaplex-foundation/mpl-toolbox";
import {
  generateSigner,
  publicKey,
  sol,
  transactionBuilder,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { creators, metadata, mint, niftyAsset } from "@nifty-oss/asset";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { generateBlip } from "./actions";

export default function MessagePage() {
  const [to, setTo] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const wallet = useWallet();
  const { connection } = useConnection();

  const formatMessage = (text: string) => {
    return text.split("\n").map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  async function handleSendBlip(message: string, to: string) {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions) {
      return;
    }

    const umi = createUmi(connection.rpcEndpoint).use(niftyAsset());
    umi.use(walletAdapterIdentity(wallet, true));

    try {
      const from = wallet.publicKey.toString();
      const assetUploadData = await generateBlip(message, to, from);
      if (!assetUploadData.data || assetUploadData.error) {
        console.error("Error generating Blip:", assetUploadData.error);
        return;
      }

      const assetSigner = generateSigner(umi);
      const mintBuilderGroup = mint(umi, {
        asset: assetSigner,
        owner: publicKey(to),
        authority: publicKey(to),
        payer: umi.payer,
        mutable: false,
        standard: 0,
        name: "Blip",
        extensions: [
          metadata({
            uri: assetUploadData.data.jsonUri,
            symbol: "Blip",
            description: "",
          }),
          creators([{ address: publicKey(from), share: 100 }]),
        ],
      });

      const transferSolIx = transferSol(umi, {
        source: umi.payer,
        destination: publicKey("6juCmFHoPnJTzhjJfcjFhCXeptCE89vp9dHP91EUaxR8"),
        amount: sol(0.001),
      });

      const txn = await transactionBuilder()
        .add(transferSolIx)
        .add(mintBuilderGroup.merge())
        .buildWithLatestBlockhash(umi);

      const nftSignedTxn = await assetSigner.signTransaction(txn);
      const signedTxn = await umi.identity.signTransaction(nftSignedTxn);

      await umi.rpc.sendTransaction(signedTxn);
    } catch (error) {
      console.error("Error SENDING blip:", error);
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
              Each Blip costs .001 eth fee and .0004 for mint transaction costs.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
