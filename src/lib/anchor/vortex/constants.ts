import { PublicKey } from "@solana/web3.js";

export const VORTEX_PROGRAM_ID = new PublicKey(
    "vtxM7RzWqnpvzWxATC9yzM5Uqx1o7BMoqtqsWAYZ8RR"
);

export const VAULT_SEED = "vault";

export function getVaultPda(
    nftMint: PublicKey,
    programId: PublicKey = VORTEX_PROGRAM_ID
) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(VAULT_SEED), nftMint.toBuffer()],
        programId
    );
}
