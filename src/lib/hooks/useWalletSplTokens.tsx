import { useCallback, useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

import { FetchedTokenInfo } from "../types";
import { fetchTokenInfo } from "../utils";
import { PublicKey } from "@solana/web3.js";

export function useSPLTokens(fetchTokenMetadata: boolean = false, address?: string | null) {
  const [tokens, setTokens] = useState<FetchedTokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { connection } = useConnection();
  const { publicKey: walletPublicKey } = useWallet();

  const fetchTokens = useCallback(async () => {
    const targetAddress = address ? new PublicKey(address) : walletPublicKey;
    if (!targetAddress) {
      setTokens([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        targetAddress,
        { programId: TOKEN_PROGRAM_ID }
      );
      const tokenInfo = await fetchTokenInfo(
        connection,
        tokenAccounts.value,
        TOKEN_PROGRAM_ID,
        fetchTokenMetadata
      );
      setTokens(tokenInfo);
    } catch (err) {
      console.error("Error fetching SPL tokens:", err);
      setError("Failed to fetch SPL tokens");
    } finally {
      setLoading(false);
    }
  }, [connection, address, fetchTokenMetadata, walletPublicKey]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens, refreshTrigger]);

  const refreshTokens = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return { tokens, loading, error, refreshTokens };
}
