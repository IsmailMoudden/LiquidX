/**
 * LiquidX — XRPL DID Setup Script
 *
 * Creates a DID ledger entry for a test user account on XRPL devnet.
 * Run this once per test wallet to make DID resolution work in the app.
 *
 * Usage:
 *   node scripts/setup-did.mjs <user-r-address> <user-seed>
 *
 * Example:
 *   node scripts/setup-did.mjs rNsD97gAPq9V3DRBfWkV32N6ihbF5oWBrD sEdTM1uX8pu2do5XvTnutH6HsouMaM2
 *
 * After running, paste the user's r-address into the Account page of the app.
 * The DID will resolve and verify automatically.
 *
 * Requirements:
 *   npm install xrpl  (already in package.json)
 */

import { Client, Wallet, convertStringToHex } from "xrpl";

const DEVNET_WSS = "wss://s.devnet.rippletest.net:51233";

const [, , userAddress, userSeed] = process.argv;

if (!userAddress || !userSeed) {
  console.error("Usage: node scripts/setup-did.mjs <r-address> <seed>");
  console.error("Example: node scripts/setup-did.mjs rXXX... sEdXXX...");
  process.exit(1);
}

if (!userAddress.startsWith("r") || userAddress.length < 25) {
  console.error("Invalid XRPL address. Must start with 'r' and be at least 25 characters.");
  process.exit(1);
}

// Format: did:xrpl:<r-address> — no network-id, required by xrpl-did-resolver
// (the library uses parsed.id as the raw XRPL address; network-id prefix breaks it)
const did = `did:xrpl:${userAddress}`;

// Minimal W3C DID document — stored inline on-chain (must be ≤ 256 bytes hex)
// The public key hex will be filled from the wallet's public key
const wallet = Wallet.fromSeed(userSeed);

if (wallet.classicAddress !== userAddress) {
  console.error(`Seed does not match address. Seed derives: ${wallet.classicAddress}`);
  process.exit(1);
}

// Minimal DID document — must stay ≤ 256 bytes (512 hex chars) for on-chain storage.
// Omits @context and controller to save space. Uses short fragment "#k".
// Our verifyDIDDocument accepts this: checks id, type includes "secp256k1",
// publicKeyHex length 66, authentication array, assertionMethod array.
const didDocument = {
  id: did,
  verificationMethod: [
    {
      id: "#k",
      type: "Secp256k1VerificationKey",
      publicKeyHex: wallet.publicKey,
    },
  ],
  authentication: ["#k"],
  assertionMethod: ["#k"],
};

const docJson = JSON.stringify(didDocument);
const docHex = convertStringToHex(docJson).toUpperCase();

if (docHex.length > 512) {
  // 256 bytes = 512 hex chars
  console.error(`DID document too large: ${docHex.length / 2} bytes (max 256).`);
  console.error("Use URI field pointing to IPFS/HTTPS instead.");
  process.exit(1);
}

console.log("\n=== LiquidX DID Setup ===");
console.log(`Network:  XRPL Devnet`);
console.log(`Address:  ${userAddress}`);
console.log(`DID:      ${did}`);
console.log(`Doc size: ${docHex.length / 2} bytes`);
console.log("\nConnecting to devnet...");

const client = new Client(DEVNET_WSS);
await client.connect();

try {
  // Check account exists and has enough XRP (needs 2 XRP reserve for DID object)
  let accountInfo;
  try {
    accountInfo = await client.request({
      command: "account_info",
      account: userAddress,
      ledger_index: "validated",
    });
  } catch {
    console.error(`Account ${userAddress} not found on devnet. Fund it first:`);
    console.error("  https://faucet.devnet.rippletest.net/accounts");
    process.exit(1);
  }

  const balanceXrp = parseInt(accountInfo.result.account_data.Balance) / 1_000_000;
  console.log(`Balance:  ${balanceXrp} XRP`);

  if (balanceXrp < 12) {
    console.error("Insufficient balance. Need at least 12 XRP (10 reserve + 2 for DID object + fees).");
    process.exit(1);
  }

  // Check if DID already exists
  try {
    const existing = await client.request({
      command: "ledger_entry",
      did: userAddress,
      ledger_index: "validated",
    });
    if (existing.result.node) {
      console.log("\nDID already exists on ledger. Updating...");
    }
  } catch {
    console.log("\nNo existing DID found. Creating...");
  }

  // Submit DIDSet transaction
  const prepared = await client.autofill({
    TransactionType: "DIDSet",
    Account: userAddress,
    DIDDocument: docHex,
  });

  const signed = wallet.sign(prepared);
  console.log(`\nSubmitting DIDSet transaction...`);

  const result = await client.submitAndWait(signed.tx_blob);

  if (result.result.meta?.TransactionResult === "tesSUCCESS") {
    console.log("\n✓ DID created successfully!");
    console.log(`  TX hash:  ${result.result.hash}`);
    console.log(`  Ledger:   ${result.result.ledger_index}`);
    console.log(`  Explorer: https://devnet.xrpl.org/transactions/${result.result.hash}`);
    console.log("\nNext steps:");
    console.log("  1. Start the app: npm run dev");
    console.log("  2. Go to /account");
    console.log(`  3. Paste your address: ${userAddress}`);
    console.log("  4. Click 'Link Wallet' — DID will resolve as verified ✓");
  } else {
    console.error("\n✗ Transaction failed:", result.result.meta?.TransactionResult);
    console.error("Full result:", JSON.stringify(result.result, null, 2));
  }
} finally {
  await client.disconnect();
}
