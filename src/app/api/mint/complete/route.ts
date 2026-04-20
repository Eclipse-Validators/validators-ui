import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { lockRecordId, finalTxSignature, assetAddress } = await req.json();

    if (!lockRecordId || !finalTxSignature || !assetAddress) {
      return NextResponse.json(
        { error: "lockRecordId, finalTxSignature, and assetAddress are required" },
        { status: 400 },
      );
    }

    const rows = await sql`
      SELECT id, solana_asset
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

    if (record.solana_asset) {
      return NextResponse.json(
        { error: "NFT already minted for this lock record" },
        { status: 400 },
      );
    }

    await sql`
      UPDATE lock_records
      SET solana_tx_signature = ${finalTxSignature},
          solana_asset = ${assetAddress},
          minted_at = NOW()
      WHERE id = ${lockRecordId}
    `;

    return NextResponse.json({
      success: true,
      txSignature: finalTxSignature,
      assetAddress,
      lockRecordId,
    });
  } catch (err) {
    console.error("Mint complete failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
