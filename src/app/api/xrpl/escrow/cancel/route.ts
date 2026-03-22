import { NextResponse } from "next/server";
import { cancelXRPLEscrow } from "@/lib/xrpl";

export async function POST() {
  try {
    const result = await cancelXRPLEscrow();
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/escrow/cancel:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
