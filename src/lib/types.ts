export interface FetchedTokenInfo {
    mint: string
    amount: number
    tokenAccount: string,
    decimals: number,
    metadata?: {
      name?: string,
      symbol?: string,
      image?: string | null,
      json?: string | null,
    } | null
  }