import { useCallback, useEffect, useState } from "react";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FetchedTokenInfo } from "../types";
import { fetchTokenInfo } from "../utils";

export function useEmptyTokenAccounts() {
    const [emptyAccounts, setEmptyAccounts] = useState<FetchedTokenInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const fetchEmptyAccounts = useCallback(async () => {
        if (!publicKey) {
            setEmptyAccounts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch both TOKEN and TOKEN-2022 accounts
            const [tokenAccounts, token2022Accounts] = await Promise.all([
                connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: TOKEN_PROGRAM_ID,
                }),
                connection.getParsedTokenAccountsByOwner(publicKey, {
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
            ]);

            // Fetch token info for both account types
            const [tokenInfo, token2022Info] = await Promise.all([
                fetchTokenInfo(connection, tokenAccounts.value, TOKEN_PROGRAM_ID, true),
                fetchTokenInfo(
                    connection,
                    token2022Accounts.value,
                    TOKEN_2022_PROGRAM_ID,
                    true
                ),
            ]);

            // Combine and filter for empty accounts
            const allEmptyAccounts = [...tokenInfo, ...token2022Info].filter(
                (token) => token.amount === 0
            );

            setEmptyAccounts(allEmptyAccounts);
        } catch (err) {
            console.error("Error fetching empty token accounts:", err);
            setError("Failed to fetch empty token accounts");
        } finally {
            setLoading(false);
        }
    }, [connection, publicKey]);

    useEffect(() => {
        fetchEmptyAccounts();
    }, [fetchEmptyAccounts, refreshTrigger]);

    const refreshEmptyAccounts = useCallback(() => {
        setRefreshTrigger((prev) => prev + 1);
    }, []);

    return { emptyAccounts, loading, error, refreshEmptyAccounts };
}