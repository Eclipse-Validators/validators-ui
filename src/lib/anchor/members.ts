import {
  ExtensionType,
  getExtensionData,
  getExtensionTypes,
  Mint,
  MintLayout,
  TOKEN_2022_PROGRAM_ID,
  unpackMint,
} from "@solana/spl-token";
import {
  TokenMetadata,
  unpack as unpackTokenMetadata,
} from "@solana/spl-token-metadata";
import { AccountInfo, PublicKey } from "@solana/web3.js";

export const decodeMember2022 = (
  accountInfo: AccountInfo<Buffer>,
  pubkey: PublicKey
) => {
  try {
    return {
      item: {
        mint: new PublicKey(accountInfo.data.subarray(12, 12 + 32)),
        group: new PublicKey(accountInfo.data.subarray(44, 44 + 32)),
      },
      pubkey,
    };
  } catch (e) {
    console.log(e);
    return {
      item: null,
      pubkey,
    };
  }
};

export const decodeMint = (buffer: Buffer, pubkey: PublicKey) => {
  try {
    // console.log({buffer});
    const mint = MintLayout.decode(Uint8Array.from(buffer));

    return {
      item: mint ?? null, //metadata ?? null,
      pubkey,
    };
  } catch (e) {
    // console.log(e);
    return {
      item: null,
      pubkey,
    };
  }
};
