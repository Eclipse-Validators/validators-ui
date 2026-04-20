import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { lockRecordId: string } },
) {
  const { lockRecordId } = params;

  try {
    const rows = await sql`
      SELECT id, is_processed, solana_asset, solana_tx_signature
      FROM lock_records
      WHERE id = ${lockRecordId}
    `;
    const record = rows[0];

    if (!record) {
      return NextResponse.json(
        { error: "Lock record not found" },
        { status: 404 },
      );
    }

    let status: "processing" | "ready" | "minted";
    if (record.solana_asset) status = "minted";
    else if (record.is_processed) status = "ready";
    else status = "processing";

    return NextResponse.json({
      status,
      lockRecordId,
      solanaAsset: record.solana_asset ?? undefined,
      solanaTxSignature: record.solana_tx_signature ?? undefined,
    });
  } catch (err) {
    console.error("Mint status check failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
