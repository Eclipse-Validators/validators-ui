import { useQuery } from "@tanstack/react-query";
import { VortexLockedNft } from "@/lib/types/vortex";

async function fetchVortexLocks(
  walletAddress: string,
): Promise<VortexLockedNft[]> {
  const res = await fetch(`/api/vortex/locks/${walletAddress}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch vortex locks: ${res.status}`);
  }
  return res.json();
}

export function useVortexLocks(walletAddress?: string) {
  return useQuery({
    queryKey: ["vortex-locks", walletAddress],
    queryFn: () => fetchVortexLocks(walletAddress!),
    enabled: Boolean(walletAddress),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
