import { PublicKey } from '@solana/web3.js';
export const VALIDATOR_BURN_PROGRAM_ID = new PublicKey("BURN4rs11nKf5apPBLA13XHbNqcTGJFZb9vbBRNc69K7");
export const FEE_COLLECTOR_ADDRESS = new PublicKey("BURNFfoeF8u3s9YPHghgbHwHRgHmUogxQbhJKuAJfHvH");
export const CONFIG_SEED = "config";


export function getConfigPda(programId: PublicKey = VALIDATOR_BURN_PROGRAM_ID) {
    return PublicKey.findProgramAddressSync(
        [Buffer.from(CONFIG_SEED)],
        programId
    );
}