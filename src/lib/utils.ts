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
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { Attribute } from "@/components/mint/nftCard";
import { fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata"
import { FetchedTokenInfo } from "./types";
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchTokenMetadataHelper(
  connection: Connection,
  mintAddress: PublicKey,
  programId: PublicKey = TOKEN_2022_PROGRAM_ID
) {
  const umi = createUmi(connection.rpcEndpoint).use(mplTokenMetadata());

  try {
    // Try Token-2022 metadata first
    let tokenMetadata = await getTokenMetadata(
      connection,
      mintAddress,
      "confirmed",
      programId
    );

    // If no Token-2022 metadata, try MPL Token Metadata
    if (!tokenMetadata) {
      const metadataPda = await fetchDigitalAsset(umi, publicKey(mintAddress.toString()));
      console.log('metadatapda', metadataPda);
      if (metadataPda) {
        tokenMetadata = {
          mint: mintAddress,
          updateAuthority: new PublicKey(metadataPda.metadata.updateAuthority.toString()),
          uri: metadataPda.metadata.uri,
          name: metadataPda.metadata.name,
          symbol: metadataPda.metadata.symbol,
          additionalMetadata: []
        };
      }
    }

    if (tokenMetadata?.uri) {
      const metadata = await fetchMetadata(tokenMetadata.uri);
      return {
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        json: tokenMetadata.uri,
        image: metadata.image,
        description: metadata.description,
        attributes: metadata.attributes || [],
      };
    }
  } catch (err) {
    console.error("Error fetching token metadata:", err);
  }

  return null;
}

async function fetchMetadata(uri: string) {
  try {
    const response = await fetch(uri);
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('image/')) {
      return { image: uri };
    }

    try {
      const metadata = await response.json();
      return {
        image: metadata.image,
        description: metadata.description,
        attributes: metadata.attributes
      };
    } catch {
      return { image: uri };
    }
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {};
  }
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
      let metadata = null;

      if (fetchTokenMetadata) {
        metadata = await fetchTokenMetadataHelper(
          connection,
          new PublicKey(account.account.data.parsed.info.mint),
          programId
        );
      }

      return {
        owner: account.account.data.parsed.info.owner,
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        tokenAccount: account.pubkey.toBase58(),
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        programId: programId.toBase58(),
        metadata,
      };
    })
  );
}

export async function createTransferTransaction(
  connection: Connection,
  publicKey: PublicKey,
  destinationAddress: string,
  token: FetchedTokenInfo,
  amount: number,
  programId: typeof TOKEN_PROGRAM_ID | typeof TOKEN_2022_PROGRAM_ID
): Promise<Transaction> {
  const transaction = new Transaction();

  const instructions = await createTokenTransferInstructions(
    connection,
    publicKey,
    new PublicKey(destinationAddress),
    token,
    amount,
    programId
  );

  transaction.add(...instructions);

  return transaction;
}

export const createSolTransferInstruction = (
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number
): TransactionInstruction => {
  return SystemProgram.transfer({
    fromPubkey,
    toPubkey,
    lamports: amount,
  });
};

export const createTokenTransferInstructions = async (
  connection: Connection,
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  token: FetchedTokenInfo,
  amount: number,
  programId: typeof TOKEN_PROGRAM_ID | typeof TOKEN_2022_PROGRAM_ID
): Promise<TransactionInstruction[]> => {
  const instructions: TransactionInstruction[] = [];

  const destinationTokenAccount = getAssociatedTokenAddressSync(
    new PublicKey(token.mint),
    toPubkey,
    true,
    programId
  );

  // Check if the destination token account exists
  const accountInfo = await connection.getAccountInfo(destinationTokenAccount);
  if (!accountInfo || !accountInfo.data || accountInfo.data.length === 0) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        fromPubkey,
        destinationTokenAccount,
        toPubkey,
        new PublicKey(token.mint),
        programId
      )
    );
  }

  instructions.push(
    createTransferInstruction(
      new PublicKey(token.tokenAccount),
      destinationTokenAccount,
      fromPubkey,
      amount * Math.pow(10, token.decimals),
      [],
      programId
    )
  );

  // Close account if all tokens are being transferred
  if (amount === token.amount) {
    instructions.push(
      createCloseAccountInstruction(
        new PublicKey(token.tokenAccount),
        fromPubkey,
        fromPubkey,
        [],
        programId
      )
    );
  }

  return instructions;
};
