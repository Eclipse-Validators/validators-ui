import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID_EDITIONS } from "../constants";


export const getHashlistMarkerPda = (editionsDeployment: PublicKey, mint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("hashlist_marker"), editionsDeployment.toBuffer(), mint.toBuffer()],
    new PublicKey(PROGRAM_ID_EDITIONS)
  );
};
