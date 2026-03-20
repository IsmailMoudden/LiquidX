"use client";

// XRPL Testnet integration
// Attempts a real connection to XRPL Testnet.
// Falls back to a simulated tx if network/wallet is unavailable.

const TESTNET_WSS = "wss://s.altnet.rippletest.net:51233";
const XRPL_EXPLORER = "https://testnet.xrpl.org/transactions";

// Demo funded testnet wallet.
// To reload: https://faucet.altnet.rippletest.net/
// Address: rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe
const DEMO_SEED = "sEdTM1uX8pu2do5XvTnutH6HsouMaM2";
const DEMO_DESTINATION = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";

export interface XRPLPaymentResult {
  hash: string;
  ledger?: number;
  status: "confirmed" | "simulated";
  explorerUrl: string;
  network: "testnet";
}

/** Generate a realistic-looking XRPL tx hash (64 hex chars) */
function generateMockHash(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

/** Small artificial delay to simulate network round-trip */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Send a payment on XRPL Testnet.
 * Tries a real transaction first; gracefully falls back to simulation.
 *
 * @param amountUSD   Amount in USD (converted to XRP drops at demo rate)
 * @param destination Optional destination address (defaults to demo address)
 */
export async function sendXRPLPayment(
  amountUSD: number,
  destination: string = DEMO_DESTINATION
): Promise<XRPLPaymentResult> {
  try {
    return await sendRealPayment(amountUSD, destination);
  } catch (err) {
    console.warn("[XRPL] Real tx failed, falling back to simulation:", err);
    return simulatePayment();
  }
}

async function sendRealPayment(
  amountUSD: number,
  destination: string
): Promise<XRPLPaymentResult> {
  // Lazy-import xrpl to avoid SSR issues
  const { Client, Wallet } = await import("xrpl");

  const client = new Client(TESTNET_WSS);
  await client.connect();

  try {
    const wallet = Wallet.fromSeed(DEMO_SEED);

    // Convert USD → XRP drops (demo rate: 1 XRP = $0.50, 1 XRP = 1_000_000 drops)
    const xrpAmount = Math.max(1, Math.ceil(amountUSD / 50));
    const drops = String(xrpAmount * 1_000_000);

    const tx = await client.submitAndWait(
      {
        TransactionType: "Payment",
        Account: wallet.address,
        Amount: drops,
        Destination: destination,
      },
      { wallet }
    );

    const hash = tx.result.hash as string;
    const ledger = tx.result.ledger_index as number | undefined;

    return {
      hash,
      ledger,
      status: "confirmed",
      explorerUrl: `${XRPL_EXPLORER}/${hash}`,
      network: "testnet",
    };
  } finally {
    await client.disconnect();
  }
}

async function simulatePayment(): Promise<XRPLPaymentResult> {
  // Simulate network latency realistically
  await delay(1200 + Math.random() * 800);
  const hash = generateMockHash();
  return {
    hash,
    ledger: Math.floor(92_000_000 + Math.random() * 1_000_000),
    status: "simulated",
    explorerUrl: `${XRPL_EXPLORER}/${hash}`,
    network: "testnet",
  };
}
