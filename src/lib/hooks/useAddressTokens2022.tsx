import { useEffect, useMemo, useState } from "react"
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { Connection, PublicKey } from "@solana/web3.js"

import { FetchedTokenInfo } from "../types"
import { fetchTokenInfo } from "../utils"

export function useAddressTokens2022(
  address: string | null,
  fetchTokenMetadata: boolean = false
) {
  const [tokens, setTokens] = useState<FetchedTokenInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const connection = useMemo(() => {
    return new Connection(process.env.NEXT_PUBLIC_NETWORK!)
  }, [])

  useEffect(() => {
    async function fetchTokens() {
      if (!address) {
        setTokens([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const publicKey = new PublicKey(address)
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_2022_PROGRAM_ID }
        )
        const tokenInfo = await fetchTokenInfo(
          connection,
          tokenAccounts.value,
          TOKEN_2022_PROGRAM_ID,
          fetchTokenMetadata
        )
        setTokens(tokenInfo)
      } catch (err) {
        console.error("Error fetching address tokens:", err)
        setError("Failed to fetch address tokens")
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [connection, address, fetchTokenMetadata])

  return { tokens, loading, error }
}
