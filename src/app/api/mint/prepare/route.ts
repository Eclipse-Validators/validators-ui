import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { sql } from "@/lib/db";
import { LockRecord } from "@/lib/types/vortex";
import uriData from "@/uris.json";

const FLARE_PROGRAM_ID = new PublicKey(
  "f1rkFKWURh2596WG4n6wPbQWx5vC8vpnvgVEKdncSWv",
);
const MPL_CORE_PROGRAM_ID = new PublicKey(
  "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
);

const uriMap = new Map(
  (uriData as { mint: string; newUri: string }[]).map((e) => [e.mint, e.newUri]),
);

function getAuthorityKeypair(): Keypair {
  const raw = process.env.AUTHORITY_PRIVATE_KEY;
  if (!raw) throw new Error("AUTHORITY_PRIVATE_KEY is not set");
  if (raw.trimStart().startsWith("[")) {
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(raw)));
  }
  return Keypair.fromSecretKey(bs58.decode(raw));
}

function getCollectionAddress(): PublicKey {
  const addr = process.env.COLLECTION_ADDRESS;
  if (!addr) throw new Error("COLLECTION_ADDRESS is not set");
  return new PublicKey(addr);
}

function getSolanaConnection(): Connection {
  const url =
    process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
  return new Connection(url);
}

function buildMintNftData(name: string, uri: string): Buffer {
  const discriminator = createHash("sha256")
    .update("global:mint_nft")
    .digest()
    .slice(0, 8);

  const nameBytes = Buffer.from(name, "utf8");
  const uriBytes = Buffer.from(uri, "utf8");

  const buf = Buffer.alloc(8 + 4 + nameBytes.length + 4 + uriBytes.length);

  let offset = 0;
  discriminator.copy(buf, offset);
  offset += 8;
  buf.writeUInt32LE(nameBytes.length, offset);
  offset += 4;
  nameBytes.copy(buf, offset);
  offset += nameBytes.length;
  buf.writeUInt32LE(uriBytes.length, offset);
  offset += 4;
  uriBytes.copy(buf, offset);

  return buf;
}

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, eclipseMint } = await req.json();

    if (!walletAddress || !eclipseMint) {
      return NextResponse.json(
        { error: "walletAddress and eclipseMint are required" },
        { status: 400 },
      );
    }

    const rows = await sql<LockRecord[]>`
      SELECT id, eclipse_wallet, eclipse_mint, eclipse_tx_signature,
             nft_metadata, solana_tx_signature, solana_asset,
             locked_at, minted_at
      FROM lock_records
      WHERE eclipse_mint = ${eclipseMint}
      LIMIT 1
    `;
    const record = rows[0];

    if (!record) {
      return NextResponse.json(
        { error: "No lock record found for this mint" },
        { status: 404 },
      );
    }

    if (record.solana_asset) {
      return NextResponse.json(
        { error: "NFT already minted for this lock record" },
        { status: 400 },
      );
    }

    const uri = uriMap.get(eclipseMint);
    if (!uri) {
      return NextResponse.json(
        { error: "No metadata URI found for this mint" },
        { status: 404 },
      );
    }

    const numMatch = uri.match(/\/(\d+)\.json$/);
    const name = numMatch ? `VALIDATOR #${numMatch[1]}` : "VALIDATOR";

    const authority = getAuthorityKeypair();
    const collection = getCollectionAddress();
    const connection = getSolanaConnection();
    const payer = new PublicKey(walletAddress);
    const assetKeypair = Keypair.generate();

    const ix = new TransactionInstruction({
      programId: FLARE_PROGRAM_ID,
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: authority.publicKey, isSigner: true, isWritable: false },
        { pubkey: assetKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: collection, isSigner: false, isWritable: true },
        { pubkey: MPL_CORE_PROGRAM_ID, isSigner: false, isWritable: false },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: buildMintNftData(name, uri),
    });

    const tx = new Transaction().add(ix);
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;

    tx.partialSign(authority, assetKeypair);

    const serialized = tx.serialize({ requireAllSignatures: false });

    return NextResponse.json({
      transaction: bs58.encode(serialized),
      message: "Transaction prepared and partially signed",
      lockRecordId: record.id,
      assetAddress: assetKeypair.publicKey.toBase58(),
      requiresUserSignature: true,
    });
  } catch (err) {
    console.error("Mint prepare failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
