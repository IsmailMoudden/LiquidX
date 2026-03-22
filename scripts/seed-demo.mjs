/**
 * LiquidX Demo Seed Script
 *
 * Creates on-chain demo transactions on XRPL devnet:
 *   1. MPTokenIssuanceCreate — issued by ASSET_OWNER (borrower)
 *   2. LoanSet — ASSET_OWNER borrows $100 at 8% APR from existing vault/broker
 *
 * ASSET_OWNER = rG1Lt5T1j5BvKkSKX8yKMkhSVMop7yDF6x (creates asset, takes loan)
 * PLATFORM    = rQDN8QJXcJUVkk3wtRtLwaiqiwxrLPnWik (counterparty / lender side)
 */

import * as xrpl from "xrpl";
import fs from "fs";

const DEVNET_WSS = "wss://s.devnet.rippletest.net:51233";

// Wallets
const ASSET_OWNER_SECRET = "sEdSoVF85ULZy298HmRFLHa1oJZp2nv";
const ASSET_OWNER_ADDRESS = "rG1Lt5T1j5BvKkSKX8yKMkhSVMop7yDF6x";
const PLATFORM_SECRET = "sEd7rhfvaNyp9swzezaAkubkS5V9CWq";
const PLATFORM_ADDRESS = "rQDN8QJXcJUVkk3wtRtLwaiqiwxrLPnWik";

// Existing vault + broker from cache (confirmed on devnet)
const VAULT_ID = "EDE9DD1820B37DCF1A68412938CEB1A26E74019B1475D1620DA52E99577061D2";
const BROKER_ID = "A4ECF8EF3C9239094978CCC3604D209883E6CA0AC7D56D44A2F467116490D8A2";

// Loan params — $100 at $100/XRP = 1 XRP = 1_000_000 drops
const PRINCIPAL_DROPS = "1000000"; // 1 XRP = $100
const INTEREST_RATE_BPS = 8000;    // 8% * 1000
const PAYMENT_TOTAL = 3;           // 3 monthly payments
const PAYMENT_INTERVAL = 30 * 24 * 60 * 60; // 30 days in seconds
const GRACE_PERIOD = 3 * 24 * 60 * 60;      // 3 days

const EXPLORER = "https://devnet.xrpl.org/transactions";

async function main() {
  console.log("=== LiquidX Demo Seed Script ===\n");

  const client = new xrpl.Client(DEVNET_WSS, { connectionTimeout: 15000 });
  await client.connect();
  console.log("Connected to XRPL devnet\n");

  const assetOwner = xrpl.Wallet.fromSeed(ASSET_OWNER_SECRET);
  const platform = xrpl.Wallet.fromSeed(PLATFORM_SECRET);
  console.log(`ASSET_OWNER: ${assetOwner.address}`);
  console.log(`PLATFORM:    ${platform.address}\n`);

  // ── 1. Check asset owner balance ──────────────────────────────────────────
  const acctInfo = await client.request({
    command: "account_info",
    account: ASSET_OWNER_ADDRESS,
    ledger_index: "validated",
  });
  const balanceXrp = parseInt(acctInfo.result.account_data.Balance) / 1_000_000;
  console.log(`ASSET_OWNER balance: ${balanceXrp} XRP\n`);

  // ── 2. MPTokenIssuanceCreate (from ASSET_OWNER) ───────────────────────────
  console.log("Step 1: MPTokenIssuanceCreate (ASSET_OWNER issues the property token)");
  const metadata = { name: "Lekki Phase 1 Residence", platform: "LiquidX" };
  const metadataHex = Buffer.from(JSON.stringify(metadata)).toString("hex").toUpperCase();

  const mptTx = await client.submitAndWait(
    {
      TransactionType: "MPTokenIssuanceCreate",
      Account: assetOwner.address,
      Flags: 32 + 16 + 8, // canTransfer + canTrade + canEscrow
      TransferFee: 500,   // 0.5%
      MaximumAmount: "10",
      AssetScale: 0,
      Metadata: metadataHex,
    },
    { wallet: assetOwner }
  );

  const mptMeta = mptTx.result.meta ?? mptTx.result.metaData;
  if (mptMeta?.TransactionResult !== "tesSUCCESS") {
    throw new Error(`MPTokenIssuanceCreate failed: ${mptMeta?.TransactionResult}`);
  }
  const mptNode = mptMeta.AffectedNodes.find(
    (n) => n.CreatedNode?.LedgerEntryType === "MPTokenIssuance"
  );
  const mptIssuanceId = mptNode?.CreatedNode?.LedgerIndex;
  const mptHash = mptTx.result.hash;
  console.log(`  ✅ MPTokenIssuanceCreate: ${mptHash}`);
  console.log(`     MPTIssuanceID: ${mptIssuanceId}`);
  console.log(`     Explorer: ${EXPLORER}/${mptHash}\n`);

  // ── 3. Check vault balance and top up if needed ───────────────────────────
  console.log("Step 2: Check vault balance");
  let currentVaultBalance = 0;
  try {
    const vaultInfo = await client.request({
      command: "ledger_entry",
      index: VAULT_ID,
      ledger_index: "validated",
    });
    currentVaultBalance = parseInt(vaultInfo?.result?.node?.AssetsAvailable ?? "0");
    console.log(`  Vault balance: ${currentVaultBalance / 1_000_000} XRP`);
  } catch (err) {
    console.warn("  Vault query failed:", err.message);
  }

  const COVER_RATE = 0.10;
  const principalNum = parseInt(PRINCIPAL_DROPS);
  const vaultRequired = Math.ceil(principalNum / (1 - COVER_RATE));
  const deficit = vaultRequired - currentVaultBalance + 5_000_000; // +5 XRP buffer

  if (deficit > 5_000_000) {
    console.log(`  Topping up vault: depositing ${deficit / 1_000_000} XRP`);
    const topupTx = await client.submitAndWait(
      {
        TransactionType: "VaultDeposit",
        Account: platform.address,
        VaultID: VAULT_ID,
        Amount: String(deficit),
      },
      { wallet: platform }
    );
    const topupMeta = topupTx.result.meta ?? topupTx.result.metaData;
    console.log(`  VaultDeposit: ${topupMeta?.TransactionResult} hash=${topupTx.result.hash}\n`);
  } else {
    console.log(`  Vault already funded (${currentVaultBalance / 1_000_000} XRP ≥ ${vaultRequired / 1_000_000} XRP needed)\n`);
  }

  // ── 4. LoanSet (ASSET_OWNER borrows, PLATFORM is counterparty) ───────────
  console.log("Step 3: LoanSet (ASSET_OWNER borrows $100 = 1 XRP)");
  const baseTx = {
    TransactionType: "LoanSet",
    Account: assetOwner.address,
    LoanBrokerID: BROKER_ID,
    Counterparty: platform.address,
    PrincipalRequested: PRINCIPAL_DROPS,
    InterestRate: INTEREST_RATE_BPS,
    PaymentTotal: PAYMENT_TOTAL,
    PaymentInterval: PAYMENT_INTERVAL,
    GracePeriod: GRACE_PERIOD,
    LoanOriginationFee: "0",
  };

  const filledTx = await client.autofill(baseTx);
  console.log(`  Autofill done, Fee=${filledTx.Fee}`);

  // XLS-66 signing flow: borrower signs first, then counterparty adds CounterpartySignature
  const borrowerSigned = assetOwner.sign(filledTx);
  const { tx_blob: finalTxBlob } = xrpl.signLoanSetByCounterparty(
    platform,
    borrowerSigned.tx_blob
  );

  const loanResult = await client.submitAndWait(finalTxBlob);
  const loanMeta = loanResult.result.meta ?? loanResult.result.metaData;
  if (loanMeta?.TransactionResult !== "tesSUCCESS") {
    console.error("LoanSet full meta:", JSON.stringify(loanMeta, null, 2));
    console.error("LoanSet tx_json:", JSON.stringify(loanResult.result.tx_json ?? {}, null, 2));
    throw new Error(`LoanSet failed: ${loanMeta?.TransactionResult}`);
  }

  const loanNode = loanMeta.AffectedNodes.find(
    (n) => n.CreatedNode?.LedgerEntryType === "Loan"
  );
  const loanId = loanNode?.CreatedNode?.LedgerIndex ?? loanResult.result.hash;
  const loanHash = loanResult.result.hash;
  console.log(`  ✅ LoanSet: ${loanHash}`);
  console.log(`     LoanID: ${loanId}`);
  console.log(`     Explorer: ${EXPLORER}/${loanHash}`);

  // Get PeriodicPayment from loan entry
  let periodicPayment = null;
  try {
    const loanEntry = await client.request({
      command: "ledger_entry",
      index: loanId,
      ledger_index: "validated",
    });
    periodicPayment = loanEntry?.result?.node?.PeriodicPayment;
    console.log(`     PeriodicPayment: ${periodicPayment} drops = $${(parseInt(periodicPayment ?? "0") / 1_000_000 * 100).toFixed(2)}`);
  } catch (err) {
    console.warn("  Loan entry query failed:", err.message);
  }

  await client.disconnect();

  // ── 5. Print update instructions ─────────────────────────────────────────
  console.log("\n=== UPDATE assets.ts ===");
  console.log(`  mptIssuanceId: "${mptIssuanceId}"`);
  console.log(`  mptIssuerAddress: "${ASSET_OWNER_ADDRESS}"`);
  console.log(`  contractTxHash: "${loanHash}"`);
  console.log(`  sources: ["${EXPLORER}/${mptHash}"]`);
  console.log(`  issuerDid: "did:xrpl:1:${ASSET_OWNER_ADDRESS}"`);
  console.log(`  proofOfOwnership.borrowerDid: "did:xrpl:1:${ASSET_OWNER_ADDRESS}"`);

  console.log("\n=== UPDATE portfolio-store.ts ===");
  console.log(`  loan.borrowerAddress: "${ASSET_OWNER_ADDRESS}"`);
  console.log(`  loan.xrplLoanHash: "${loanHash}"`);
  console.log(`  loan.xrplLoanId: "${loanId}"`);
  if (periodicPayment) {
    const pp = parseInt(periodicPayment);
    const ppUsd = (pp / 1_000_000) * 100;
    console.log(`  repayment.amount: ${ppUsd.toFixed(2)} (PeriodicPayment=${periodicPayment} drops)`);
  }
  console.log(`  tx[mpt].xrplHash: "${mptHash}"`);
  console.log(`  tx[loanset].xrplHash: "${loanHash}"`);

  // Write results to a temp file
  const results = {
    mptHash,
    mptIssuanceId,
    loanHash,
    loanId,
    periodicPayment,
    assetOwnerAddress: ASSET_OWNER_ADDRESS,
  };
  fs.writeFileSync("/tmp/liquidx-seed-results.json", JSON.stringify(results, null, 2));
  console.log("\n✅ Results saved to /tmp/liquidx-seed-results.json");
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
