import {
  createAssociatedTokenAccountInstruction,
  createCloseAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AccountInfo,
  Connection,
  ParsedAccountData,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Attribute } from "@/components/mint/nftCard";

import { FetchedTokenInfo } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchTokenInfo(
  connection: Connection,
  tokenAccounts: {
    pubkey: PublicKey;
    account: AccountInfo<ParsedAccountData>;
  }[],
  programId: PublicKey,
  fetchTokenMetadata: boolean
): Promise<FetchedTokenInfo[]> {
  return Promise.all(
    tokenAccounts.map(async (account) => {
      let tokenMetadata: any = null;
      let imageUri: string | null = null;
      let attributes: Attribute[] = [];
      if (fetchTokenMetadata) {
        try {
          tokenMetadata = await getTokenMetadata(
            connection,
            new PublicKey(account.account.data.parsed.info.mint),
            "confirmed",
            programId
          );
          if (tokenMetadata && tokenMetadata.uri) {
            try {
              const metadataResponse = await fetch(tokenMetadata.uri);
              const metadata = await metadataResponse.json();
              imageUri = metadata.image;
              attributes = metadata.attributes;
            } catch (error) {
              console.error(
                "Error fetching or parsing metadata:",
                error,
                tokenMetadata.uri
              );
            }
          }
        } catch (err) {
          console.log("Error fetching token metadata:", err);
        }
      }
      return {
        owner: account.account.data.parsed.info.owner,
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        tokenAccount: account.pubkey.toBase58(),
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        metadata: tokenMetadata
          ? {
              name: tokenMetadata?.name,
              symbol: tokenMetadata?.symbol,
              json: tokenMetadata?.uri,
              image: imageUri,
              attributes,
            }
          : null,
      };
    })
  );
}

// export async function fetchTokenInfoFromAddresses(
//   connection: Connection,
//   addresses: PublicKey[],
//   programId: PublicKey,
//   fetchTokenMetadata: boolean
// ): Promise<FetchedTokenInfo[]> {
//   return Promise.all(
//     addresses.map(async (account) => {
//       let tokenMetadata: any = null;
//       let imageUri: string | null = null;
//       let attributes: Attribute[] = [];
//       if (fetchTokenMetadata) {
//         try {
//           tokenMetadata = await getTokenMetadata(
//             connection,
//             account,
//             "confirmed",
//             programId
//           );
//           if (tokenMetadata && tokenMetadata.uri) {
//             try {
//               const metadataResponse = await fetch(tokenMetadata.uri);
//               const metadata = await metadataResponse.json();
//               imageUri = metadata.image;
//               attributes = metadata.attributes;
//             } catch (error) {
//               console.error(
//                 "Error fetching or parsing metadata:",
//                 error,
//                 tokenMetadata.uri
//               );
//             }
//           }
//         } catch (err) {
//           console.log("Error fetching token metadata:", err);
//         }
//       }
//       return {
//         owner: account.account.owner.toBase58(),
//         mint: account.account.data.parsed.info.mint,
//         amount: account.account.data.parsed.info.tokenAmount.uiAmount,
//         tokenAccount: account.pubkey.toBase58(),
//         decimals: account.account.data.parsed.info.tokenAmount.decimals,
//         metadata: tokenMetadata
//           ? {
//             name: tokenMetadata?.name,
//             symbol: tokenMetadata?.symbol,
//             json: tokenMetadata?.uri,
//             image: imageUri,
//             attributes
//           }
//           : null,
//       };
//     })
//   );
// }

export async function createTransferTransaction(
  connection: Connection,
  publicKey: PublicKey,
  destinationAddress: string,
  token: FetchedTokenInfo,
  amount: number,
  programId: typeof TOKEN_PROGRAM_ID | typeof TOKEN_2022_PROGRAM_ID
): Promise<Transaction> {
  const transaction = new Transaction();

  const destinationTokenAccount = getAssociatedTokenAddressSync(
    new PublicKey(token.mint),
    new PublicKey(destinationAddress),
    true,
    programId
  );

  // Check if the destination token account exists
  const accountInfo = await connection.getAccountInfo(destinationTokenAccount);
  if (!accountInfo || !accountInfo.data || accountInfo.data.length === 0) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        publicKey,
        destinationTokenAccount,
        new PublicKey(destinationAddress),
        new PublicKey(token.mint),
        programId
      )
    );
  }

  const transferInstruction = createTransferInstruction(
    new PublicKey(token.tokenAccount),
    destinationTokenAccount,
    publicKey,
    amount * Math.pow(10, token.decimals),
    [],
    programId
  );

  transaction.add(transferInstruction);

  // Close account if all tokens are being transferred
  if (amount === token.amount) {
    const tokenCloseInstruction = createCloseAccountInstruction(
      new PublicKey(token.tokenAccount),
      publicKey,
      publicKey,
      [],
      programId
    );
    transaction.add(tokenCloseInstruction);
  }

  return transaction;
}
