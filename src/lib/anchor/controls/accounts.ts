
import { IdlAccounts, IdlTypes } from "@coral-xyz/anchor";
import { BorshCoder, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";


import { LibreplexEditionsControls } from "./libreplex_editions_controls";

export type EditionsControls = IdlAccounts<LibreplexEditionsControls>["editionsControls"];

export const getBase64FromDatabytes = (dataBytes: Buffer, dataType: string) => {
  console.log({ dataBytes });
  const base = dataBytes.toString("base64");
  return `data:${dataType};base64,${base}`;
};

export const decodeEditionsControls =
  (program: Program<LibreplexEditionsControls>) =>
  (buffer: Buffer | undefined, pubkey: PublicKey) => {
    const coder = new BorshCoder(program.idl);
    const liquidity = buffer
      ? coder.accounts.decode<EditionsControls>("editionsControls", buffer)
      : null;

    return {
      item: liquidity,
      pubkey,
    };
  };
