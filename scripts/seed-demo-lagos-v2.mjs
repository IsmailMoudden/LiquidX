/**
 * Demo Lagos v2 — fresh asset for live hackathon demo
 * ASSET_OWNER borrows, USER lends live in front of judges
 */
import * as xrpl from "xrpl";
import fs from "fs";

const DEVNET_WSS       = "wss://s.devnet.rippletest.net:51233";
const ASSET_OWNER_SECRET  = "sEdSoVF85ULZy298HmRFLHa1oJZp2nv";
const ASSET_OWNER_ADDRESS = "rG1Lt5T1j5BvKkSKX8yKMkhSVMop7yDF6x";
const PLATFORM_SECRET     = "sEd7rhfvaNyp9swzezaAkubkS5V9CWq";
const PLATFORM_ADDRESS    = "rQDN8QJXcJUVkk3wtRtLwaiqiwxrLPnWik";
const VAULT_ID   = "EDE9DD1820B37DCF1A68412938CEB1A26E74019B1475D1620DA52E99577061D2";
const BROKER_ID  = "A4ECF8EF3C9239094978CCC3604D209883E6CA0AC7D56D44A2F467116490D8A2";
const EXPLORER   = "https://devnet.xrpl.org/transactions";

async function main() {
  console.log("=== Lagos v2 — fresh demo asset ===\n");
  const client = new xrpl.Client(DEVNET_WSS, { connectionTimeout: 15000 });
  await client.connect();

  const owner    = xrpl.Wallet.fromSeed(ASSET_OWNER_SECRET);
  const platform = xrpl.Wallet.fromSeed(PLATFORM_SECRET);
  console.log(`ASSET_OWNER: ${owner.address}`);
  console.log(`PLATFORM:    ${platform.address}\n`);

  // 1. MPTokenIssuanceCreate
  console.log("Step 1: MPTokenIssuanceCreate");
  const mptTx = await client.submitAndWait({
    TransactionType: "MPTokenIssuanceCreate",
    Account: owner.address,
    Flags: 32 + 16 + 8,
    TransferFee: 500,
    MaximumAmount: "10",
    AssetScale: 0,
    Metadata: Buffer.from(JSON.stringify({ name: "Lekki Phase 1 Residence v2", platform: "LiquidX" })).toString("hex").toUpperCase(),
  }, { wallet: owner });

  const mptMeta = mptTx.result.meta ?? mptTx.result.metaData;
  if (mptMeta?.TransactionResult !== "tesSUCCESS") throw new Error(`MPT failed: ${mptMeta?.TransactionResult}`);
  const mptNode = mptMeta.AffectedNodes.find(n => n.CreatedNode?.LedgerEntryType === "MPTokenIssuance");
  const mptIssuanceId = mptNode?.CreatedNode?.LedgerIndex;
  const mptHash = mptTx.result.hash;
  console.log(`  ✅ ${mptHash}\n     ID: ${mptIssuanceId}\n`);

  // 2. LoanSet
  console.log("Step 2: LoanSet ($100 = 1 XRP)");
  const filled = await client.autofill({
    TransactionType: "LoanSet",
    Account: owner.address,
    LoanBrokerID: BROKER_ID,
    Counterparty: platform.address,
    PrincipalRequested: "1000000",
    InterestRate: 8000,
    PaymentTotal: 3,
    PaymentInterval: 30 * 24 * 60 * 60,
    GracePeriod: 3 * 24 * 60 * 60,
    LoanOriginationFee: "0",
  });
  const { tx_blob } = xrpl.signLoanSetByCounterparty(platform, owner.sign(filled).tx_blob);
  const loanResult = await client.submitAndWait(tx_blob);
  const loanMeta = loanResult.result.meta ?? loanResult.result.metaData;
  if (loanMeta?.TransactionResult !== "tesSUCCESS") {
    console.error(JSON.stringify(loanMeta, null, 2));
    throw new Error(`LoanSet failed: ${loanMeta?.TransactionResult}`);
  }
  const loanNode = loanMeta.AffectedNodes.find(n => n.CreatedNode?.LedgerEntryType === "Loan");
  const loanId   = loanNode?.CreatedNode?.LedgerIndex ?? loanResult.result.hash;
  const loanHash = loanResult.result.hash;
  console.log(`  ✅ ${loanHash}\n     LoanID: ${loanId}`);

  let periodicPayment = null;
  try {
    const le = await client.request({ command: "ledger_entry", index: loanId, ledger_index: "validated" });
    periodicPayment = le?.result?.node?.PeriodicPayment;
    console.log(`     PeriodicPayment: ${periodicPayment} drops\n`);
  } catch {}

  await client.disconnect();

  const ppUsd = periodicPayment ? (parseFloat(periodicPayment) / 1_000_000 * 100).toFixed(2) : "33.77";
  console.log("=== RESULTS ===");
  console.log(JSON.stringify({ mptHash, mptIssuanceId, loanHash, loanId, periodicPayment, ppUsd }, null, 2));
  fs.writeFileSync("/tmp/liquidx-lagos-v2.json", JSON.stringify({ mptHash, mptIssuanceId, loanHash, loanId, periodicPayment, ppUsd }));
  console.log("\n✅ /tmp/liquidx-lagos-v2.json");
}

main().catch(e => { console.error(e); process.exit(1); });
