import { PublicKey } from "@solana/web3.js"
import { toBufferLE } from "bigint-buffer"

import { PROGRAM_ID_CONTROLS } from "../constants"

export const getMinterStatsPhasePda = (
  deployment: PublicKey,
  minter: PublicKey,
  phaseIndex: number
) => {
  // console.log({minter: minter.toBase58(), phaseIndex})
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("minter_stats_phase"),
      deployment.toBuffer(),
      minter.toBuffer(),
      toBufferLE(BigInt(phaseIndex), 4),
    ],
    new PublicKey(PROGRAM_ID_CONTROLS)
  )
}
