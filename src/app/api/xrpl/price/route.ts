import { NextResponse } from "next/server";

let _cache: { usd: number; fetchedAt: number } | null = null;

export async function GET() {
  if (_cache && Date.now() - _cache.fetchedAt < 60_000) {
    return NextResponse.json({ usd: _cache.usd });
  }
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );
    const data = await res.json() as { ripple?: { usd?: number } };
    const usd = data?.ripple?.usd ?? 0.5;
    _cache = { usd, fetchedAt: Date.now() };
    return NextResponse.json({ usd });
  } catch {
    return NextResponse.json({ usd: 0.5 });
  }
}
