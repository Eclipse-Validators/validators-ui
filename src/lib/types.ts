import { Attribute } from "@/components/mint/nftCard";

export interface FetchedTokenInfo {
  owner: string;
  mint: string;
  amount: number;
  tokenAccount: string;
  decimals: number;
  programId: string;
  metadata?: {
    collectionAddress?: string
    name?: string;
    symbol?: string;
    image?: string | null;
    json?: string | null;
    attributes?: Attribute[];
  } | null;
}
