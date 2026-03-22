import { NextResponse } from "next/server";

export async function POST() {
  const secret = process.env.XRPL_TEST_USER_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "XRPL_TEST_USER_SECRET not configured" }, { status: 400 });
  }

  try {
    const { Client, Wallet } = await import("xrpl");
    const wallet = Wallet.fromSeed(secret);
    const address = wallet.address;
    const did = `did:xrpl:${address}`;

    // Minimal DID document — must be ≤ 256 raw bytes (XRPL limit).
    // Only @context + id is required for our verifyDIDDocument check.
    const minDoc = { "@context": ["https://www.w3.org/ns/did/v1"], id: did };
    const docHex = Buffer.from(JSON.stringify(minDoc)).toString("hex").toUpperCase();
    console.log(`[DID Setup] doc bytes: ${Buffer.from(JSON.stringify(minDoc)).length}`);

    const WSS = process.env.XRPL_WSS ?? "wss://s.devnet.rippletest.net:51233";
    const client = new Client(WSS, { connectionTimeout: 8000, timeout: 15000 });
    await client.connect();

    try {
      const tx = await client.submitAndWait(
        {
          TransactionType: "DIDSet",
          Account: address,
          DIDDocument: docHex,
        } as Parameters<typeof client.submitAndWait>[0],
        { wallet }
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = (tx.result as any).meta ?? (tx.result as any).metaData;
      const txResult: string = meta?.TransactionResult ?? "unknown";
      if (txResult !== "tesSUCCESS") {
        return NextResponse.json({ error: `DIDSet failed: ${txResult}` }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        address,
        did,
        hash: tx.result.hash,
        ledger: tx.result.ledger_index,
        explorerUrl: `${process.env.NEXT_PUBLIC_XRPL_EXPLORER ?? "https://devnet.xrpl.org/transactions"}/${tx.result.hash}`,
      });
    } finally {
      await client.disconnect();
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[DID Setup]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
