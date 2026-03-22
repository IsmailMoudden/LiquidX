import { NextRequest, NextResponse } from "next/server";
import { signCollateralContract } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const { issuerAddress, contractJson } = await req.json();
    if (!issuerAddress || !contractJson) {
      return NextResponse.json({ error: "issuerAddress and contractJson are required" }, { status: 400 });
    }
    const result = await signCollateralContract(issuerAddress, contractJson);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/contract/sign:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
