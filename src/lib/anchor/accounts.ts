import { BorshCoder, IdlAccounts, IdlTypes, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

import { LibreplexMetadata } from "./metadata";

// @ts-expect-error Legacy IDL format incompatible with Anchor 0.30 Idl type
export type EditionsDeployment = IdlAccounts<LibreplexMetadata>["collection"];

export const decodeCollection =
  // @ts-expect-error Legacy IDL format incompatible with Anchor 0.30 Idl type
  (program: Program<LibreplexMetadata>) =>
  (buffer: Buffer | undefined, pubkey: PublicKey) => {
    // @ts-expect-error Legacy IDL format incompatible with Anchor 0.30 Idl type
    const coder = new BorshCoder(program.idl);
    const liquidity = buffer
      ? coder.accounts.decode<EditionsDeployment>("editionsDeployment", buffer)
      : null;

    return {
      item: liquidity,
      pubkey,
    };
  };
