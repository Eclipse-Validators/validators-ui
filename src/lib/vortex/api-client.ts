interface PrepareResponse {
  transaction: string;
  message: string;
  lockRecordId: string;
  assetAddress: string;
  requiresUserSignature: boolean;
}

interface CompleteResponse {
  success: boolean;
  txSignature: string;
  assetAddress: string;
  lockRecordId: string;
}

interface MintStatusResponse {
  status: "processing" | "ready" | "minted";
  lockRecordId: string;
  solanaAsset?: string;
  solanaTxSignature?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      body?.error ?? body?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

export const vortexMintApi = {
  prepareMint(walletAddress: string, eclipseMint: string) {
    return request<PrepareResponse>("/api/mint/prepare", {
      method: "POST",
      body: JSON.stringify({ walletAddress, eclipseMint }),
    });
  },

  completeMint(
    lockRecordId: string,
    finalTxSignature: string,
    assetAddress: string,
  ) {
    return request<CompleteResponse>("/api/mint/complete", {
      method: "POST",
      body: JSON.stringify({ lockRecordId, finalTxSignature, assetAddress }),
    });
  },

  getMintStatus(lockRecordId: string) {
    return request<MintStatusResponse>(`/api/mint/status/${lockRecordId}`);
  },
};
