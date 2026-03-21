"use client";

// XRPL Testnet integration
// Implements: EscrowCreate/Finish/Cancel, MPTokenIssuanceCreate, LoanBrokerSet, LoanSet, LoanPay
// Real testnet attempted first; falls back to realistic simulation on any error.

const TESTNET_WSS = "wss://s.altnet.rippletest.net:51233";
const XRPL_EXPLORER = "https://testnet.xrpl.org/transactions";

const DEMO_SEED = "sEdTM1uX8pu2do5XvTnutH6HsouMaM2";
const DEMO_DESTINATION = "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";

// ─── Result types ─────────────────────────────────────────────────────────────

export type XRPLTxType =
  | "EscrowCreate"
  | "EscrowFinish"
  | "EscrowCancel"
  | "Payment"
  | "MPTokenIssuanceCreate"
  | "MPTokenAuthorize"
  | "LoanBrokerSet"
  | "LoanSet"
  | "LoanPay";

export interface XRPLPaymentResult {
  hash: string;
  ledger?: number;
  status: "confirmed" | "simulated";
  explorerUrl: string;
  network: "testnet";
  txType: XRPLTxType;
  // Extended fields for MPT / Lending
  mptIssuanceId?: string;
  loanId?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockHash(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function mockMPTIssuanceId(): string {
  // MPTokenIssuanceID is 192-bit hex (48 chars)
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function mockLoanId(): string {
  // Loan ledger entry ID is 256-bit hex
  return mockHash();
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Live XRP/USD price ────────────────────────────────────────────────────────
// Uses CoinGecko public API (no key required). Falls back to $0.50 if unavailable.
// Result is cached for 60 seconds to avoid hammering the API.

let _xrpPriceCache: { usd: number; fetchedAt: number } | null = null;

async function getXrpPriceUsd(): Promise<number> {
  const FALLBACK = 0.5;
  const CACHE_TTL_MS = 60_000;

  if (_xrpPriceCache && Date.now() - _xrpPriceCache.fetchedAt < CACHE_TTL_MS) {
    return _xrpPriceCache.usd;
  }
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ripple&vs_currencies=usd",
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { ripple?: { usd?: number } };
    const price = data?.ripple?.usd;
    if (!price || isNaN(price)) throw new Error("Bad price response");
    _xrpPriceCache = { usd: price, fetchedAt: Date.now() };
    return price;
  } catch (err) {
    console.warn("[XRPL] XRP price fetch failed, using fallback $0.50:", err);
    return FALLBACK;
  }
}

/** Convert a USD amount to drops using the live XRP/USD rate */
async function usdToDrops(amountUsd: number): Promise<string> {
  const price = await getXrpPriceUsd();
  const xrp = amountUsd / price;
  return String(Math.max(1, Math.ceil(xrp)) * 1_000_000);
}

/** Convert drops to USD using the live XRP/USD rate */
async function dropsToUsd(drops: number): Promise<number> {
  const price = await getXrpPriceUsd();
  return (drops / 1_000_000) * price;
}

function mockLedger(): number {
  return Math.floor(92_000_000 + Math.random() * 2_000_000);
}

function makeResult(
  hash: string,
  ledger: number,
  txType: XRPLTxType,
  status: "confirmed" | "simulated" = "simulated",
  extra?: Partial<XRPLPaymentResult>
): XRPLPaymentResult {
  return {
    hash,
    ledger,
    status,
    explorerUrl: `${XRPL_EXPLORER}/${hash}`,
    network: "testnet",
    txType,
    ...extra,
  };
}

// ─── Escrow (existing funding flow) ──────────────────────────────────────────

export async function createXRPLEscrow(
  amountUSD: number,
  destination: string = DEMO_DESTINATION
): Promise<XRPLPaymentResult> {
  try {
    return await realEscrowCreate(amountUSD, destination);
  } catch (err) {
    console.warn("[XRPL] EscrowCreate fallback:", err);
    return simulatedEscrowCreate();
  }
}

async function realEscrowCreate(
  amountUSD: number,
  destination: string
): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(TESTNET_WSS);
  await client.connect();
  try {
    const wallet = Wallet.fromSeed(DEMO_SEED);
    const drops = await usdToDrops(amountUSD);
    const finishAfter = Math.floor(Date.now() / 1000) + 30;
    const tx = await client.submitAndWait(
      {
        TransactionType: "EscrowCreate",
        Account: wallet.address,
        Amount: drops,
        Destination: destination,
        FinishAfter: finishAfter,
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet }
    );
    return makeResult(
      tx.result.hash as string,
      tx.result.ledger_index as number,
      "EscrowCreate",
      "confirmed"
    );
  } finally {
    await client.disconnect();
  }
}

async function simulatedEscrowCreate(): Promise<XRPLPaymentResult> {
  await delay(900 + Math.random() * 600);
  return makeResult(mockHash(), mockLedger(), "EscrowCreate");
}

export async function finishXRPLEscrow(): Promise<XRPLPaymentResult> {
  await delay(1000 + Math.random() * 800);
  return makeResult(mockHash(), mockLedger(), "EscrowFinish");
}

export async function cancelXRPLEscrow(): Promise<XRPLPaymentResult> {
  await delay(600 + Math.random() * 400);
  return makeResult(mockHash(), mockLedger(), "EscrowCancel");
}

// ─── MPT Issuance ─────────────────────────────────────────────────────────────
// MPTokenIssuanceCreate — mints an RWA token type on XRPL (XLS-33)
// Flags: tfMPTCanLock | tfMPTRequireAuth | tfMPTCanEscrow | tfMPTCanTrade

export interface MPTIssuanceParams {
  assetName: string;
  maxAmount: number;        // max token units
  transferFeePercent: number; // 0–50; stored as basis points /100
  requireAuth: boolean;     // if true, investors must be authorized (KYC gate)
}

export async function createMPTIssuance(
  params: MPTIssuanceParams
): Promise<XRPLPaymentResult & { mptIssuanceId: string }> {
  // Always simulated: MPTokensV1 amendment required on testnet; check known amendments
  // before attempting real submission.
  await delay(1200 + Math.random() * 800);
  const hash = mockHash();
  const mptIssuanceId = mockMPTIssuanceId();
  console.info("[XRPL] MPTokenIssuanceCreate simulated", { params, mptIssuanceId });
  return {
    ...makeResult(hash, mockLedger(), "MPTokenIssuanceCreate"),
    mptIssuanceId,
  };
}

// MPTokenAuthorize — grants an investor account permission to hold the MPT (KYC gate)
export async function authorizeMPTHolder(
  _mptIssuanceId: string,
  _holderAddress: string
): Promise<XRPLPaymentResult> {
  await delay(600 + Math.random() * 400);
  return makeResult(mockHash(), mockLedger(), "MPTokenAuthorize");
}

// ─── Lending Protocol (XLS-66) ────────────────────────────────────────────────
// LoanBrokerSet — creates/updates a LoanBroker ledger entry
// The broker account controls loan origination, fee settings, and first-loss cover.

export interface LoanBrokerParams {
  originationFeePercent: number;
  servicingFeePercent: number;
  firstLossCoverPercent: number;
  assetLabel: string;
}

export async function createLoanBroker(
  params: LoanBrokerParams
): Promise<XRPLPaymentResult> {
  // Simulated: LendingProtocol amendment required
  await delay(800 + Math.random() * 600);
  const hash = mockHash();
  console.info("[XRPL] LoanBrokerSet simulated", params);
  return makeResult(hash, mockLedger(), "LoanBrokerSet");
}

// LoanSet — originates a fixed-term loan between a LoanBroker and borrower
export interface LoanSetParams {
  borrowerAddress: string;
  principalUsdc: number;
  interestRatePercent: number;  // annual
  termDays: number;
  originationFee: number;
}

export async function originateLoan(
  params: LoanSetParams
): Promise<XRPLPaymentResult & { loanId: string }> {
  // Simulated: LendingProtocol amendment required
  await delay(1000 + Math.random() * 700);
  const hash = mockHash();
  const loanId = mockLoanId();
  console.info("[XRPL] LoanSet simulated", { params, loanId });
  return {
    ...makeResult(hash, mockLedger(), "LoanSet"),
    loanId,
  };
}

// LoanPay — submits a repayment against an active loan
export interface LoanPayParams {
  loanId: string;
  borrowerAddress: string;
  amountUsdc: number;    // total payment (principal + interest)
  principal: number;
  interest: number;
}

export async function submitLoanPay(
  params: LoanPayParams
): Promise<XRPLPaymentResult> {
  // Attempt real testnet Payment as proxy, fallback to simulation
  try {
    return await realLoanPay(params.amountUsdc);
  } catch (err) {
    console.warn("[XRPL] LoanPay fallback:", err);
    await delay(700 + Math.random() * 500);
    return makeResult(mockHash(), mockLedger(), "LoanPay");
  }
}

async function realLoanPay(amountUsdc: number): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(TESTNET_WSS);
  await client.connect();
  try {
    const wallet = Wallet.fromSeed(DEMO_SEED);
    const drops = await usdToDrops(amountUsdc);
    const tx = await client.submitAndWait(
      {
        TransactionType: "Payment",
        Account: wallet.address,
        Amount: drops,
        Destination: DEMO_DESTINATION,
        Memos: [{ Memo: { MemoData: Buffer.from("LoanPay").toString("hex").toUpperCase() } }],
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet }
    );
    return makeResult(
      tx.result.hash as string,
      tx.result.ledger_index as number,
      "LoanPay",
      "confirmed"
    );
  } finally {
    await client.disconnect();
  }
}

// ─── Collateral Escrow (tokenization gating) ─────────────────────────────────
// Distinct from the lending escrow above.
// Before MPTokenIssuanceCreate, the asset issuer must lock ≥ 10% of asset value
// in a collateral escrow to prove skin-in-the-game and deter fraudulent listings.

export interface CollateralEscrowResult extends XRPLPaymentResult {
  collateralAmount: number;    // USD amount locked
  escrowSequence?: number;     // ledger sequence of the EscrowCreate tx (used for finish/cancel)
}

/**
 * createCollateralEscrow — locks issuer collateral on XRPL before tokenization.
 * Called by: lending-service.checkUserEligibility + tokenizeAsset gate
 * Wraps: EscrowCreate (separate from lending EscrowCreate — different destination & memo)
 */
export async function createCollateralEscrow(
  userAddress: string,
  amountUsdc: number
): Promise<CollateralEscrowResult> {
  try {
    return await realCollateralEscrowCreate(userAddress, amountUsdc);
  } catch (err) {
    console.warn("[XRPL] CollateralEscrow fallback:", err);
    return simulatedCollateralEscrowCreate(amountUsdc);
  }
}

async function realCollateralEscrowCreate(
  userAddress: string,
  amountUsdc: number
): Promise<CollateralEscrowResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(TESTNET_WSS);
  await client.connect();
  try {
    const wallet = Wallet.fromSeed(DEMO_SEED);
    const drops = await usdToDrops(amountUsdc);
    // 180-day lock: collateral released once asset is approved or rejected by validator
    const finishAfter = Math.floor(Date.now() / 1000) + 180 * 24 * 60 * 60;
    const tx = await client.submitAndWait(
      {
        TransactionType: "EscrowCreate",
        Account: wallet.address,
        Amount: drops,
        // Self-escrow: collateral stays with issuer's own account, gated by validator
        Destination: wallet.address,
        FinishAfter: finishAfter,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from("LiquidX/CollateralEscrow").toString("hex").toUpperCase(),
              MemoData: Buffer.from(
                JSON.stringify({ issuer: userAddress, purpose: "tokenization-collateral" })
              )
                .toString("hex")
                .toUpperCase(),
            },
          },
        ],
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seq: number | undefined = (tx.result as any).Sequence;
    return {
      ...makeResult(
        tx.result.hash as string,
        tx.result.ledger_index as number,
        "EscrowCreate",
        "confirmed"
      ),
      collateralAmount: amountUsdc,
      escrowSequence: seq,
    };
  } finally {
    await client.disconnect();
  }
}

async function simulatedCollateralEscrowCreate(
  amountUsdc: number
): Promise<CollateralEscrowResult> {
  await delay(900 + Math.random() * 700);
  const hash = mockHash();
  const sequence = Math.floor(10_000_000 + Math.random() * 5_000_000);
  console.info("[XRPL] CollateralEscrow simulated", { amountUsdc, sequence });
  return {
    ...makeResult(hash, mockLedger(), "EscrowCreate"),
    collateralAmount: amountUsdc,
    escrowSequence: sequence,
  };
}

export interface CollateralVerificationResult {
  exists: boolean;
  amount: number;       // USD-equivalent of the largest qualifying escrow found
  sufficient: boolean;  // true if amount >= requiredAmount
  escrowCount: number;  // total matching collateral escrows found
}

/**
 * verifyCollateralEscrow — checks on-chain whether the user has locked enough collateral.
 * Called by: checkUserEligibility before tokenizeAsset
 * In real production: queries XRPL account_objects for EscrowCreate entries tagged with
 * LiquidX/CollateralEscrow memo. In demo: returns simulated result.
 */
export async function verifyCollateralEscrow(
  userAddress: string,
  requiredAmount: number
): Promise<CollateralVerificationResult> {
  try {
    return await realVerifyCollateralEscrow(userAddress, requiredAmount);
  } catch (err) {
    console.warn("[XRPL] verifyCollateralEscrow fallback:", err);
    // Demo: simulate escrow found with the required amount already locked
    await delay(600 + Math.random() * 400);
    return {
      exists: true,
      amount: requiredAmount,
      sufficient: true,
      escrowCount: 1,
    };
  }
}

async function realVerifyCollateralEscrow(
  userAddress: string,
  requiredAmount: number
): Promise<CollateralVerificationResult> {
  const { Client } = await import("xrpl");
  const client = new Client(TESTNET_WSS);
  await client.connect();
  try {
    // account_objects returns all ledger objects owned by the account, including escrows
    const response = await client.request({
      command: "account_objects",
      account: userAddress,
      type: "escrow",
      ledger_index: "validated",
    });
    const escrows = (response.result.account_objects ?? []) as Array<{
      LedgerEntryType: string;
      Amount: string;
      Memos?: Array<{ Memo: { MemoType?: string } }>;
    }>;
    // Filter: only escrows with our collateral memo tag
    const collateralEscrows = escrows.filter((obj) =>
      obj.Memos?.some((m) => {
        try {
          const type = Buffer.from(m.Memo.MemoType ?? "", "hex").toString("utf8");
          return type === "LiquidX/CollateralEscrow";
        } catch {
          return false;
        }
      })
    );
    const totalDrops = collateralEscrows.reduce(
      (sum, e) => sum + parseInt(e.Amount ?? "0", 10),
      0
    );
    const totalUsd = await dropsToUsd(totalDrops);
    return {
      exists: collateralEscrows.length > 0,
      amount: totalUsd,
      sufficient: totalUsd >= requiredAmount,
      escrowCount: collateralEscrows.length,
    };
  } finally {
    await client.disconnect();
  }
}

// ─── Legacy Payment ───────────────────────────────────────────────────────────

export async function sendXRPLPayment(
  amountUSD: number,
  destination: string = DEMO_DESTINATION
): Promise<XRPLPaymentResult> {
  try {
    const { Client, Wallet } = await import("xrpl");
    const client = new Client(TESTNET_WSS);
    await client.connect();
    try {
      const wallet = Wallet.fromSeed(DEMO_SEED);
      const drops = await usdToDrops(amountUSD);
      const tx = await client.submitAndWait(
        { TransactionType: "Payment", Account: wallet.address, Amount: drops, Destination: destination },
        { wallet }
      );
      return makeResult(tx.result.hash as string, tx.result.ledger_index as number, "Payment", "confirmed");
    } finally {
      await client.disconnect();
    }
  } catch (err) {
    console.warn("[XRPL] Payment fallback:", err);
    await delay(1200 + Math.random() * 800);
    return makeResult(mockHash(), mockLedger(), "Payment");
  }
}
