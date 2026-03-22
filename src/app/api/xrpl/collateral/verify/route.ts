import { NextRequest, NextResponse } from "next/server";
import { verifyCollateralEscrow } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const { userAddress, requiredAmount } = await req.json();
    if (!userAddress || requiredAmount === undefined) {
      return NextResponse.json({ error: "userAddress and requiredAmount are required" }, { status: 400 });
    }
    const result = await verifyCollateralEscrow(userAddress, requiredAmount);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/collateral/verify:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
