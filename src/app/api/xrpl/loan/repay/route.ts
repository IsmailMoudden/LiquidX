import { NextRequest, NextResponse } from "next/server";
import { submitLoanPay } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const params = await req.json();
    const result = await submitLoanPay(params);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/loan/repay:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
