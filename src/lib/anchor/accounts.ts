import { BorshCoder, IdlAccounts, IdlTypes, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

import { LibreplexMetadata } from "./metadata";

export type EditionsDeployment = IdlAccounts<LibreplexMetadata>["collection"];

export const decodeCollection =
  (program: Program<LibreplexMetadata>) =>
  (buffer: Buffer | undefined, pubkey: PublicKey) => {
    const coder = new BorshCoder(program.idl);
    const liquidity = buffer
      ? coder.accounts.decode<EditionsDeployment>("editionsDeployment", buffer)
      : null;

    return {
      item: liquidity,
      pubkey,
    };
  };
