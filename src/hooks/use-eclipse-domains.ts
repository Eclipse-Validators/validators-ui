import { useGlobalConnection } from "@/components/GlobalConnectionProvider"
import { TldParser, NameAccountAndDomain } from "@onsol/tldparser"
import { useConnection } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface EclipseDomainsResult {
    domains: NameAccountAndDomain[];
    error?: string;
}

export async function fetchEclipseDomains(
    connection: Connection,
    publicKeyString?: string
): Promise<EclipseDomainsResult> {
    if (!publicKeyString) {
        return { domains: [] };
    }

    try {
        const publicKey = new PublicKey(publicKeyString);
        const parser = new TldParser(connection);
        const domains = await parser.getParsedAllUserDomains(publicKey);
        return { domains };
    } catch (error) {
        console.error('Error fetching Eclipse domains:', error);
        return {
            domains: [],
            error: error instanceof Error ? error.message : 'Failed to fetch domains'
        };
    }
}

export function useEclipseDomains(publicKeyString?: string) {
    const { connection: conn } = useConnection();
    const globalConn = useGlobalConnection();
    const connection = useMemo(() => conn ?? globalConn, [conn, globalConn]);

    return useQuery({
        queryKey: ['eclipse-domains', publicKeyString],
        queryFn: () => fetchEclipseDomains(connection, publicKeyString),
        enabled: Boolean(publicKeyString),
        staleTime: 10 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
} 