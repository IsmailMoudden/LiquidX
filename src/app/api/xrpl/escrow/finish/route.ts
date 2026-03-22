import { NextRequest, NextResponse } from "next/server";
import { finishXRPLEscrow } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sequence: number | undefined = typeof body?.sequence === "number" ? body.sequence : undefined;
    const result = await finishXRPLEscrow(sequence);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/escrow/finish:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
