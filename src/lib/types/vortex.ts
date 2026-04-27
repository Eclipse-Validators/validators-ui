export interface NftMetadata {
  name?: string;
  symbol?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  properties?: Record<string, unknown>;
}

export interface LockRecord {
  id: string;
  eclipse_wallet: string;
  eclipse_mint: string;
  eclipse_tx_signature: string;
  nft_metadata: NftMetadata | null;
  solana_tx_signature: string | null;
  solana_asset: string | null;
  locked_at: string;
  minted_at: string | null;
}

export type LockRecordStatus = "ready" | "minted";

export interface VortexLockedNft {
  id: string;
  eclipseMint: string;
  eclipseTxSignature: string;
  metadata: NftMetadata | null;
  status: LockRecordStatus;
  solanaAsset: string | null;
  lockedAt: string;
  mintedAt: string | null;
}

export function deriveLockStatus(record: LockRecord): LockRecordStatus {
  return record.solana_asset ? "minted" : "ready";
}

export function toLockNft(record: LockRecord): VortexLockedNft {
  return {
    id: record.id,
    eclipseMint: record.eclipse_mint,
    eclipseTxSignature: record.eclipse_tx_signature,
    metadata: record.nft_metadata,
    status: deriveLockStatus(record),
    solanaAsset: record.solana_asset,
    lockedAt: record.locked_at,
    mintedAt: record.minted_at,
  };
}
