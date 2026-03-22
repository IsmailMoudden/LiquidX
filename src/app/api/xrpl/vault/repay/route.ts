import { NextRequest, NextResponse } from "next/server";
import { repayVaultLoan } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const { totalAmountUsd } = await req.json();
    const result = await repayVaultLoan(totalAmountUsd);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/vault/repay:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
