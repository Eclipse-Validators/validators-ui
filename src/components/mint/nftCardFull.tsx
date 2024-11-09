import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Eye, Send, ShareIcon } from "lucide-react";
import { toast } from "sonner";

import { FetchedTokenInfo } from "@/lib/types";
import { createTransferTransaction } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { ViewImageDialog } from "../dialog/viewImageDialog";
import { useGlobalConnection } from "../GlobalConnectionProvider";
import { CopyableText } from "../ui/copyableText";
import { CopyButton } from "../ui/copyButton";

interface NFTFullViewProps {
  nft: FetchedTokenInfo;
}

const NFTCardFull: React.FC<NFTFullViewProps> = ({ nft }) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [destinationAddress, setDestinationAddress] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const connection = useGlobalConnection();
  const wallet = useWallet();

  useEffect(() => {
    const checkOwnership = async () => {
      if (wallet.publicKey && nft.tokenAccount && nft.owner) {
        setIsOwner(wallet.publicKey.toBase58() === nft.owner);
      } else {
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [wallet.publicKey, nft.tokenAccount, nft.owner, connection]);

  const handleTransfer = async () => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !isValidAddress ||
      !isOwner
    )
      return;

    setIsTransferring(true);
    try {
      const programId = TOKEN_2022_PROGRAM_ID;

      const transaction = await createTransferTransaction(
        connection,
        wallet.publicKey,
        destinationAddress,
        nft,
        1,
        programId
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await connection.confirmTransaction(signature);

      toast.success("NFT transferred successfully", {
        description:
          "You can now view your transaction on the Solana blockchain",
        action: {
          label: "View Transaction",
          onClick: () =>
            window.open(
              `${process.env.NEXT_PUBLIC_EXPLORER}/tx/${signature}`,
              "_blank"
            ),
        },
      });
      setIsOwner(false);
      setIsTransferModalOpen(false);
    } catch (error) {
      console.error("Transfer failed:", error);
      toast.error("Transfer failed. Please try again.");
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mx-auto w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 sm:justify-between">
            <span className="break-all">{nft.metadata?.name || "Unnamed NFT"}</span>
            <div className="flex items-center gap-2">
              <CopyButton
                textToCopy={`${process.env.NEXT_PUBLIC_APP_URL}nft/${nft.mint}`}
                buttonText=""
                copyIcon={<ShareIcon className="h-4 w-4" />}
                style={{
                  variant: "outline",
                  size: "icon",
                }}
              />
              {isOwner && (
                <Dialog
                  open={isTransferModalOpen}
                  onOpenChange={setIsTransferModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Send className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Transfer {nft.metadata?.name || "NFT"}
                      </DialogTitle>
                      <DialogDescription>
                        {`Enter the destination address to transfer ${nft.metadata?.name || "NFT"}.`}
                      </DialogDescription>
                    </DialogHeader>
                    <Input
                      value={destinationAddress}
                      onChange={(e) => {
                        setDestinationAddress(e.target.value);
                        try {
                          new PublicKey(e.target.value);
                          setIsValidAddress(true);
                        } catch {
                          setIsValidAddress(false);
                        }
                      }}
                      placeholder="Destination address"
                      className={
                        isValidAddress ? "border-green-500" : "border-red-500"
                      }
                    />
                    {!isValidAddress && destinationAddress && (
                      <p className="text-sm text-red-500">
                        Please enter a valid Solana address
                      </p>
                    )}
                    <Button
                      onClick={handleTransfer}
                      disabled={!isValidAddress || isTransferring}
                    >
                      {isTransferring ? "Transferring..." : "Confirm Transfer"}
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-1/2">
              {nft.metadata?.image && (
                <div className="relative pb-[100%]">
                  <ViewImageDialog
                    name={nft.metadata.name || "Unnamed NFT"}
                    image={nft.metadata.image}
                  />
                </div>
              )}
            </div>
            <div className="w-full md:w-1/2">
              <p className="mb-2 flex flex-wrap items-center gap-1">
                <strong>Symbol:</strong>
                <span className="break-all">{nft.metadata?.symbol || "N/A"}</span>
              </p>
              <p className="mb-2 flex flex-wrap items-center gap-1">
                <strong>Mint:</strong>
                <span className="break-all">
                  <CopyableText text={nft.mint} maxLength={8} />
                </span>
              </p>
              <p className="mb-2">
                <strong>Owner:</strong>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="break-all">
                    <CopyableText text={nft.owner} maxLength={8} />
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 hover:bg-transparent hover:text-foreground"
                    onClick={() => {
                      router.push(`/viewer?wallet=${nft.owner}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </p>
              {nft.metadata?.attributes && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Attributes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {nft.metadata.attributes.map((attr, index) => (
                      <div key={index} className="rounded bg-secondary p-2">
                        <p className="font-bold text-background">
                          {attr.trait_type}
                        </p>
                        <p className="text-background">{attr.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTCardFull;
