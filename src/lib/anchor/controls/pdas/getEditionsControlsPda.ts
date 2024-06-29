import { toBufferLE } from "bigint-buffer";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID_CONTROLS } from "../constants";

export const getEditionsControlsPda = (editionsDeployment: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("editions_controls"), editionsDeployment.toBuffer()],
    new PublicKey(PROGRAM_ID_CONTROLS)
  )[0];
};
