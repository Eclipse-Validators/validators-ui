import { useCallback, useEffect, useState } from "react";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { FetchedTokenInfo } from "../types";
import { fetchTokenInfo } from "../utils";

export function useWalletTokens(fetchTokenMetadata: boolean = false) {
  const [tokens, setTokens] = useState<FetchedTokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const fetchTokens = useCallback(async () => {
    if (!publicKey) {
      setTokens([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_2022_PROGRAM_ID }
      );
      const tokenInfo = await fetchTokenInfo(
        connection,
        tokenAccounts.value,
        TOKEN_2022_PROGRAM_ID,
        fetchTokenMetadata
      );

      setTokens(tokenInfo.filter((token) => token.amount > 0));
    } catch (err) {
      console.error("Error fetching wallet tokens:", err);
      setError("Failed to fetch wallet tokens");
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, fetchTokenMetadata]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens, refreshTrigger]);

  const refreshTokens = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return { tokens, loading, error, refreshTokens };
}
