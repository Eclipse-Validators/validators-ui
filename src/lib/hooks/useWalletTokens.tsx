import { useEffect, useState } from "react"
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"

interface TokenInfo {
  mint: string
  amount: number
  tokenAccount: string
}

export function useWalletTokens() {
  const [tokens, setTokens] = useState<TokenInfo[]>([])
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

        const tokenInfo = tokenAccounts.value.map((account) => ({
          mint: account.account.data.parsed.info.mint,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
          tokenAccount: account.pubkey.toBase58(),
        }))

        setTokens(tokenInfo)
      } catch (err) {
        console.error("Error fetching wallet tokens:", err)
        setError("Failed to fetch wallet tokens")
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [connection, publicKey])

  const refreshTokens = () => {
    setLoading(true)
    // This will trigger the useEffect to run again
  }

  return { tokens, loading, error, refreshTokens }
}
