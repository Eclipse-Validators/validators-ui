import { useGlobalConnection } from "@/components/GlobalConnectionProvider"
import { TldParser } from "@onsol/tldparser"
import { useConnection } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

interface DomainLookupResult {
    publicKey?: string;
    error?: string;
}

// Standalone function for domain lookup
export async function lookupEclipseDomain(
    connection: Connection,
    domainName: string
): Promise<DomainLookupResult> {
    if (!domainName) {
        return { error: "No domain provided" };
    }
    try {
        const parser = new TldParser(connection);

        let owner;
        try {
            owner = await parser.getOwnerFromDomainTld(domainName);
        } catch (err) {
            return { error: `Domain "${domainName}" not found` };
        }

        if (!owner) {
            return { error: `Domain "${domainName}" not found` };
        }

        return { publicKey: owner.toBase58() };
    } catch (error) {
        console.error('Error looking up Eclipse domain:', error);
        return {
            error: error instanceof Error
                ? error.message
                : 'Failed to lookup domain'
        };
    }
}

// React hook for domain lookup
export function useEclipseDomainLookup(domainName?: string) {
    const { connection: conn } = useConnection();
    const globalConn = useGlobalConnection();
    const connection = useMemo(() => conn ?? globalConn, [conn, globalConn]);

    return useQuery({
        queryKey: ['eclipse-domain-lookup', domainName?.toLowerCase()],
        queryFn: () => lookupEclipseDomain(connection, domainName!),
        enabled: Boolean(domainName),
        staleTime: 10 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    });
} 