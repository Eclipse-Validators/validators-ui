import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID_EDITIONS } from "../constants";


export const getHashlistPda = (deployment: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("hashlist"), deployment.toBuffer()],
    new PublicKey(PROGRAM_ID_EDITIONS)
  );
};
