import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Connection, PublicKey } from "@solana/web3.js"
import { getTokenMetadata } from "@solana/spl-token"
import { FetchedTokenInfo } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function fetchTokenInfo(
  connection: Connection,
  tokenAccounts: any[],
  programId: PublicKey,
  fetchTokenMetadata: boolean
): Promise<FetchedTokenInfo[]> {
  return Promise.all(tokenAccounts.map(async (account) => {
    let tokenMetadata: any = null;
    let imageUri: string | null = null;
    if (fetchTokenMetadata) {
      try {
        tokenMetadata = await getTokenMetadata(connection, new PublicKey(account.account.data.parsed.info.mint), 'confirmed', programId)
        if (tokenMetadata && tokenMetadata.uri) {
          try {
            const metadataResponse = await fetch(tokenMetadata.uri)
            const metadata = await metadataResponse.json()
            imageUri = metadata.image;
          } catch (error) {
            console.error('Error fetching or parsing metadata:', error, tokenMetadata.uri);
          }
        }
      } catch (err) {
        console.log('Error fetching token metadata:', err);
      }
    }
    return {
      mint: account.account.data.parsed.info.mint,
      amount: account.account.data.parsed.info.tokenAmount.uiAmount,
      tokenAccount: account.pubkey.toBase58(),
      decimals: account.account.data.parsed.info.tokenAmount.decimals,
      metadata: tokenMetadata ? {
        name: tokenMetadata?.name,
        symbol: tokenMetadata?.symbol,
        json: tokenMetadata?.uri,
        image: imageUri,
      } : null
    }
  }));
}