import { NextRequest, NextResponse } from "next/server";
import { sendXRPLPayment } from "@/lib/xrpl";

export async function POST(req: NextRequest) {
  try {
    const { amountUsdc, destination } = await req.json();
    if (!amountUsdc) {
      return NextResponse.json({ error: "amountUsdc is required" }, { status: 400 });
    }
    const result = await sendXRPLPayment(amountUsdc, destination);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[API] /api/xrpl/payment:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
