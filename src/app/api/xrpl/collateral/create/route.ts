import { NextRequest, NextResponse } from "next/server";
import { createCollateralEscrow } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const { userAddress, amountUsdc } = await req.json();
    if (!userAddress || !amountUsdc) {
      return NextResponse.json({ error: "userAddress and amountUsdc are required" }, { status: 400 });
    }
    const result = await createCollateralEscrow(userAddress, amountUsdc);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/collateral/create:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
