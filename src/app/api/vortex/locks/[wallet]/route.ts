import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { LockRecord, toLockNft } from "@/lib/types/vortex";

const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: { wallet: string } },
) {
  const { wallet } = params;

  if (!BASE58_RE.test(wallet)) {
    return NextResponse.json(
      { error: "Invalid wallet address" },
      { status: 400 },
    );
  }

  try {
    const rows = await sql<LockRecord[]>`
      SELECT id, eclipse_wallet, eclipse_mint, eclipse_tx_signature,
             nft_metadata, is_processed, solana_tx_signature, solana_asset,
             locked_at, minted_at
      FROM lock_records
      WHERE eclipse_wallet = ${wallet}
      ORDER BY locked_at DESC
    `;

    const locks = rows.map(toLockNft);
    return NextResponse.json(locks);
  } catch (err) {
    console.error("Failed to fetch vortex locks:", err);
    return NextResponse.json(
      { error: "Failed to fetch lock records" },
      { status: 500 },
    );
  }
}
