import { NextRequest, NextResponse } from "next/server";
import { createXRPLEscrow } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const { amountUsdc, destination, destinationTag, assetId } = await req.json();
    if (!amountUsdc || typeof amountUsdc !== "number") {
      return NextResponse.json({ error: "amountUsdc is required" }, { status: 400 });
    }
    const result = await createXRPLEscrow(amountUsdc, destination, destinationTag, assetId);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/escrow/create:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
