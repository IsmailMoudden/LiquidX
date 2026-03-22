import { NextRequest, NextResponse } from "next/server";

// Server-side DID resolution — avoids browser WebSocket timeouts.
// Uses XRPL_WSS env var (devnet) instead of defaulting to mainnet.
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address || !address.startsWith("r") || address.length < 25) {
    return NextResponse.json({ error: "Invalid XRPL address" }, { status: 400 });
  }

  const did = `did:xrpl:${address}`;
  const WSS = process.env.XRPL_WSS ?? "wss://s.devnet.rippletest.net:51233";

  try {
    const { Client } = await import("xrpl");
    const client = new Client(WSS, { connectionTimeout: 8000, timeout: 15000 });
    await client.connect();

    let didDocument: Record<string, unknown> | null = null;
    let error: string | null = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (client as any).request({
        command: "account_objects",
        account: address,
        type: "did",
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const objects: any[] = res?.result?.account_objects ?? [];
      const didObj = objects.find((o: Record<string, unknown>) => o.LedgerEntryType === "DID");

      if (didObj?.DIDDocument) {
        const json = Buffer.from(didObj.DIDDocument, "hex").toString("utf8");
        didDocument = JSON.parse(json);
      } else if (didObj?.URI) {
        // URI-based DID — return a synthesized document pointing to the URI
        didDocument = {
          "@context": ["https://www.w3.org/ns/did/v1"],
          id: did,
          service: [{ id: `${did}#linked-domain`, type: "LinkedDomains", serviceEndpoint: didObj.URI }],
        };
      } else {
        error = "DID document could not be resolved or does not exist.";
      }
    } finally {
      await client.disconnect();
    }

    if (error) {
      return NextResponse.json({ did, resolved: false, error }, { status: 404 });
    }

    return NextResponse.json({ did, resolved: true, document: didDocument });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[DID Resolve]", msg);
    return NextResponse.json({ did, resolved: false, error: msg }, { status: 500 });
  }
}
