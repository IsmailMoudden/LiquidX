/**
 * LiquidX Demo Seed Script #2
 *
 * Creates a second demo asset where USER is the borrower, with one
 * LoanPay already confirmed on devnet — so during the demo we can
 * show the repay feature working end-to-end.
 *
 * USER    = rGguTpZQUhDyRCC2yCa7mDHSjuZpVCTKdd (borrows for asset2)
 * PLATFORM = rQDN8QJXcJUVkk3wtRtLwaiqiwxrLPnWik (counterparty / lender)
 */

import * as xrpl from "xrpl";
import fs from "fs";

const DEVNET_WSS = "wss://s.devnet.rippletest.net:51233";

const USER_SECRET    = "sEdVqfegyLg1vrvfSjdBgKmEjraxQo9";
const USER_ADDRESS   = "rGguTpZQUhDyRCC2yCa7mDHSjuZpVCTKdd";
const PLATFORM_SECRET  = "sEd7rhfvaNyp9swzezaAkubkS5V9CWq";
const PLATFORM_ADDRESS = "rQDN8QJXcJUVkk3wtRtLwaiqiwxrLPnWik";

const VAULT_ID   = "EDE9DD1820B37DCF1A68412938CEB1A26E74019B1475D1620DA52E99577061D2";
const BROKER_ID  = "A4ECF8EF3C9239094978CCC3604D209883E6CA0AC7D56D44A2F467116490D8A2";

// $200 loan @ $100/XRP = 2 XRP = 2_000_000 drops, 8% APR, 3 monthly payments
const PRINCIPAL_DROPS    = "2000000";
const INTEREST_RATE_BPS  = 8000;
const PAYMENT_TOTAL      = 3;
const PAYMENT_INTERVAL   = 30 * 24 * 60 * 60;
const GRACE_PERIOD       = 3 * 24 * 60 * 60;

const EXPLORER = "https://devnet.xrpl.org/transactions";

async function main() {
  console.log("=== LiquidX Demo Seed #2 — USER as borrower ===\n");

  const client = new xrpl.Client(DEVNET_WSS, { connectionTimeout: 15000 });
  await client.connect();
  console.log("Connected\n");

  const userWallet     = xrpl.Wallet.fromSeed(USER_SECRET);
  const platformWallet = xrpl.Wallet.fromSeed(PLATFORM_SECRET);
  console.log(`USER:     ${userWallet.address}`);
  console.log(`PLATFORM: ${platformWallet.address}\n`);

  // ── 1. MPTokenIssuanceCreate from USER ───────────────────────────────────
  console.log("Step 1: MPTokenIssuanceCreate (USER issues asset2 token)");
  const metadata = { name: "Dakar Commercial Unit", platform: "LiquidX" };
  const mptTx = await client.submitAndWait(
    {
      TransactionType: "MPTokenIssuanceCreate",
      Account: userWallet.address,
      Flags: 32 + 16 + 8,
      TransferFee: 500,
      MaximumAmount: "5",
      AssetScale: 0,
      Metadata: Buffer.from(JSON.stringify(metadata)).toString("hex").toUpperCase(),
    },
    { wallet: userWallet }
  );

  const mptMeta = mptTx.result.meta ?? mptTx.result.metaData;
  if (mptMeta?.TransactionResult !== "tesSUCCESS")
    throw new Error(`MPTokenIssuanceCreate failed: ${mptMeta?.TransactionResult}`);

  const mptNode = mptMeta.AffectedNodes.find(n => n.CreatedNode?.LedgerEntryType === "MPTokenIssuance");
  const mptIssuanceId = mptNode?.CreatedNode?.LedgerIndex;
  const mptHash = mptTx.result.hash;
  console.log(`  ✅ MPT: ${mptHash}`);
  console.log(`     ID:  ${mptIssuanceId}\n`);

  // ── 2. LoanSet — USER borrows $200 ───────────────────────────────────────
  console.log("Step 2: LoanSet (USER borrows $200 = 2 XRP)");

  // Check vault balance
  let vaultBal = 0;
  try {
    const vi = await client.request({ command: "ledger_entry", index: VAULT_ID, ledger_index: "validated" });
    vaultBal = parseInt(vi?.result?.node?.AssetsAvailable ?? "0");
    console.log(`  Vault balance: ${vaultBal / 1_000_000} XRP`);
  } catch {}

  const needed = Math.ceil(parseInt(PRINCIPAL_DROPS) / 0.9) + 5_000_000;
  if (needed > vaultBal) {
    console.log(`  Topping up vault: ${(needed - vaultBal) / 1_000_000} XRP`);
    const tu = await client.submitAndWait(
      { TransactionType: "VaultDeposit", Account: platformWallet.address, VaultID: VAULT_ID, Amount: String(needed - vaultBal) },
      { wallet: platformWallet }
    );
    console.log(`  VaultDeposit: ${(tu.result.meta ?? tu.result.metaData)?.TransactionResult}\n`);
  }

  const baseTx = {
    TransactionType: "LoanSet",
    Account: userWallet.address,
    LoanBrokerID: BROKER_ID,
    Counterparty: platformWallet.address,
    PrincipalRequested: PRINCIPAL_DROPS,
    InterestRate: INTEREST_RATE_BPS,
    PaymentTotal: PAYMENT_TOTAL,
    PaymentInterval: PAYMENT_INTERVAL,
    GracePeriod: GRACE_PERIOD,
    LoanOriginationFee: "0",
  };

  const filled = await client.autofill(baseTx);
  const borrowerSigned = userWallet.sign(filled);
  const { tx_blob } = xrpl.signLoanSetByCounterparty(platformWallet, borrowerSigned.tx_blob);
  const loanResult = await client.submitAndWait(tx_blob);

  const loanMeta = loanResult.result.meta ?? loanResult.result.metaData;
  if (loanMeta?.TransactionResult !== "tesSUCCESS") {
    console.error("LoanSet meta:", JSON.stringify(loanMeta, null, 2));
    throw new Error(`LoanSet failed: ${loanMeta?.TransactionResult}`);
  }

  const loanNode = loanMeta.AffectedNodes.find(n => n.CreatedNode?.LedgerEntryType === "Loan");
  const loanId   = loanNode?.CreatedNode?.LedgerIndex ?? loanResult.result.hash;
  const loanHash = loanResult.result.hash;
  console.log(`  ✅ LoanSet: ${loanHash}`);
  console.log(`     LoanID:  ${loanId}`);

  // Read PeriodicPayment
  let periodicPayment = null;
  try {
    const le = await client.request({ command: "ledger_entry", index: loanId, ledger_index: "validated" });
    periodicPayment = le?.result?.node?.PeriodicPayment;
    console.log(`     PeriodicPayment: ${periodicPayment} drops\n`);
  } catch {}

  // ── 3. LoanPay — USER repays instalment 1 ────────────────────────────────
  console.log("Step 3: LoanPay — USER repays first instalment");

  let payDrops = periodicPayment
    ? String(Math.ceil(parseFloat(periodicPayment)))
    : "675453";   // fallback

  const loanPayTx = await client.submitAndWait(
    {
      TransactionType: "LoanPay",
      Account: userWallet.address,
      LoanID: loanId,
      Amount: payDrops,
    },
    { wallet: userWallet }
  );

  const payMeta = loanPayTx.result.meta ?? loanPayTx.result.metaData;
  if (payMeta?.TransactionResult !== "tesSUCCESS") {
    console.error("LoanPay meta:", JSON.stringify(payMeta, null, 2));
    throw new Error(`LoanPay failed: ${payMeta?.TransactionResult}`);
  }
  const payHash = loanPayTx.result.hash;
  console.log(`  ✅ LoanPay: ${payHash}`);
  console.log(`     Amount:  ${parseInt(payDrops) / 1_000_000} XRP = $${(parseInt(payDrops) / 1_000_000 * 100).toFixed(2)}`);
  console.log(`     Explorer: ${EXPLORER}/${payHash}\n`);

  await client.disconnect();

  // ── 4. Print results ─────────────────────────────────────────────────────
  const ppUsd = periodicPayment
    ? (parseFloat(periodicPayment) / 1_000_000 * 100).toFixed(2)
    : "67.55";

  console.log("=== UPDATE assets.ts (add demo-dakar-property) ===");
  console.log(`  mptIssuanceId: "${mptIssuanceId}"`);
  console.log(`  mptIssuerAddress: "${USER_ADDRESS}"`);
  console.log(`  contractTxHash: "${loanHash}"`);
  console.log(`  sources: ["${EXPLORER}/${mptHash}"]`);

  console.log("\n=== UPDATE portfolio-store.ts ===");
  console.log(`  loan.borrowerAddress: "${USER_ADDRESS}"`);
  console.log(`  loan.xrplLoanHash: "${loanHash}"`);
  console.log(`  loan.xrplLoanId: "${loanId}"`);
  console.log(`  repayment[0].status: "paid"  (xrplHash: "${payHash}")`);
  console.log(`  repayment[0].amount: ${ppUsd}`);
  console.log(`  tx[mpt].xrplHash: "${mptHash}"`);
  console.log(`  tx[loanset].xrplHash: "${loanHash}"`);
  console.log(`  tx[loanpay].xrplHash: "${payHash}"`);

  const results = { mptHash, mptIssuanceId, loanHash, loanId, payHash, payDrops, periodicPayment, userAddress: USER_ADDRESS };
  fs.writeFileSync("/tmp/liquidx-seed2-results.json", JSON.stringify(results, null, 2));
  console.log("\n✅ Results saved to /tmp/liquidx-seed2-results.json");
}

main().catch(err => { console.error("FATAL:", err); process.exit(1); });
