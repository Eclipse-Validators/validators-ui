import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID_CONTROLS } from "../constants";

export const getMinterStatsPda = (deployment: PublicKey, minter: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("minter_stats"), deployment.toBuffer(), minter.toBuffer()],
    new PublicKey(PROGRAM_ID_CONTROLS)
  );
};
