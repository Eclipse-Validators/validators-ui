import { useEffect, useState } from "react"
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { FetchedTokenInfo } from "../types"
import { fetchTokenInfo } from "../utils"

export function useWalletTokens(fetchTokenMetadata: boolean = false) {
  const [tokens, setTokens] = useState<FetchedTokenInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  useEffect(() => {
    async function fetchTokens() {
      if (!publicKey) {
        setTokens([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_2022_PROGRAM_ID }
        )
        const tokenInfo = await fetchTokenInfo(connection, tokenAccounts.value, TOKEN_2022_PROGRAM_ID, fetchTokenMetadata)
        setTokens(tokenInfo)
      } catch (err) {
        console.error("Error fetching wallet tokens:", err)
        setError("Failed to fetch wallet tokens")
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [connection, publicKey, fetchTokenMetadata])

  const refreshTokens = () => {
    setLoading(true)
    // This will trigger the useEffect to run again
  }

  return { tokens, loading, error, refreshTokens }
}