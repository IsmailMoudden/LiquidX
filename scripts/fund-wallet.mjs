#!/usr/bin/env node
// Fund an XRPL devnet wallet via the public faucet.
// Usage: node scripts/fund-wallet.mjs [address] [times]
// Example: node scripts/fund-wallet.mjs rpgJrdjZkGjdhB4vwkMW4sJA97jMpUk1hr 10

const FAUCET = "https://faucet.devnet.rippletest.net/accounts";
const address = process.argv[2] ?? "rpgJrdjZkGjdhB4vwkMW4sJA97jMpUk1hr";
const times = Math.min(parseInt(process.argv[3] ?? "10", 10), 20); // cap at 20

async function fundOnce(i) {
  const res = await fetch(FAUCET, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ destination: address }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  const xrp = data.amount ?? data.balance ?? "1000";
  const hash = data.transaction?.hash ?? data.hash ?? "(no hash)";
  console.log(`  [${i}/${times}] +${xrp} XRP → hash: ${hash}`);
  return xrp;
}

async function main() {
  console.log(`\nFunding ${address} on XRPL devnet × ${times}\n`);
  let total = 0;
  for (let i = 1; i <= times; i++) {
    try {
      const xrp = await fundOnce(i);
      total += Number(xrp);
    } catch (err) {
      console.warn(`  [${i}/${times}] faucet error: ${err.message}`);
    }
    // Small delay to avoid rate-limiting
    if (i < times) await new Promise((r) => setTimeout(r, 800));
  }
  console.log(`\nDone. Requested ~${total} XRP total.`);
  console.log(`Explorer: https://devnet.xrpl.org/accounts/${address}\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
