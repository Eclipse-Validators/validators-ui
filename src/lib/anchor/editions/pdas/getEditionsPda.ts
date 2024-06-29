import { toBufferLE } from "bigint-buffer";
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID_EDITIONS } from "../constants";

export const getEditionsPda = (symbol: string) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("editions_deployment"), Buffer.from(symbol)],
    new PublicKey(PROGRAM_ID_EDITIONS)
  )[0];
};
