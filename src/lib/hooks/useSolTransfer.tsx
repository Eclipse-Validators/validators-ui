import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { useLogger } from "next-axiom";
import { toast } from "sonner";

import { useWalletBalance } from "@/lib/hooks/useWalletBalance";

export const useSolTransfer = () => {
  const logger = useLogger();
  const { connection } = useConnection();
  const { publicKey, signAllTransactions } = useWallet();
  const { balance: solBalance, refreshBalance } = useWalletBalance();
  const [isTransferDisabled, setIsTransferDisabled] = useState(false);

  const handleSolTransfer = async (
    destinationAddress: string,
    amount: string
  ) => {
    if (!publicKey || !signAllTransactions) return;

    try {
      setIsTransferDisabled(true);
      const transferAmount = parseFloat(amount);
      if (
        isNaN(transferAmount) ||
        transferAmount <= 0 ||
        transferAmount > solBalance
      ) {
        toast.error("Invalid SOL amount");
        return;
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(destinationAddress),
          lamports: transferAmount * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signAllTransactions([transaction]);
      const signature = await connection.sendRawTransaction(
        signedTransaction[0].serialize()
      );
      const confirmation = await connection.confirmTransaction(signature);

      if (confirmation.value.err) {
        logger.error("SOL transfer failed", {
          signature: signature,
          error: confirmation.value.err,
        });
        toast.error("SOL transfer failed. Please try again.");
      } else {
        toast.success(`Successfully transferred ${transferAmount} SOL`, {
          description:
            "You can now view your transaction on the Solana blockchain",
          action: {
            label: "View Transaction",
            onClick: () =>
              window.open(
                `${process.env.NEXT_PUBLIC_EXPLORER!}/tx/${signature}`,
                "_blank"
              ),
          },
        });
      }
    } catch (error) {
      logger.error("SOL transfer failed:", {
        error: error,
        destinationAddress: destinationAddress,
        amount: amount,
      });
      toast.error("SOL transfer failed. Please try again.");
    } finally {
      setIsTransferDisabled(false);
      // Refresh SOL balance
      refreshBalance();
    }
  };

  return { solBalance, isTransferDisabled, handleSolTransfer };
};
