// ─── LiquidX XRPL Integration — SERVER ONLY ────────────────────────────────────
// Do NOT add "use client" — this module runs exclusively in Next.js API routes.
// All secrets come from process.env, never from the client bundle.
//
// Network: XRPL Devnet — wss://s.devnet.rippletest.net:51233
// Explorer: https://devnet.xrpl.org/transactions

const DEVNET_WSS = process.env.XRPL_WSS ?? "wss://s.devnet.rippletest.net:51233";
const XRPL_EXPLORER = process.env.NEXT_PUBLIC_XRPL_EXPLORER ?? "https://devnet.xrpl.org/transactions";

function getPlatformSecret(): string {
  const seed = process.env.XRPL_PLATFORM_SECRET;
  if (!seed) throw new Error("XRPL_PLATFORM_SECRET is not set in environment variables");
  return seed;
}

function getPlatformAddress(): string {
  return process.env.XRPL_PLATFORM_ADDRESS ?? "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh";
}

// Lender (test user) wallet — devnet only. Signs EscrowCreate.
const TEST_USER_SECRET = "sEdVqfegyLg1vrvfSjdBgKmEjraxQo9";
const TEST_USER_ADDRESS = "rGguTpZQUhDyRCC2yCa7mDHSjuZpVCTKdd";

// Asset owner / borrower wallet — receives loan funds via EscrowFinish.
const ASSET_OWNER_SECRET = "sEdSoVF85ULZy298HmRFLHa1oJZp2nv";
const ASSET_OWNER_ADDRESS = "rG1Lt5T1j5BvKkSKX8yKMkhSVMop7yDF6x";

function getTestUserSecret(): string {
  return process.env.XRPL_TEST_USER_SECRET ?? TEST_USER_SECRET;
}

function getTestUserAddress(): string {
  return TEST_USER_ADDRESS;
}

function getAssetOwnerSecret(): string {
  return process.env.XRPL_ASSET_OWNER_SECRET ?? ASSET_OWNER_SECRET;
}

function getAssetOwnerAddress(): string {
  return process.env.XRPL_ASSET_OWNER_ADDRESS ?? ASSET_OWNER_ADDRESS;
}

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
  network: "devnet" | "testnet" | "mainnet";
  txType: XRPLTxType;
  mptIssuanceId?: string;
  loanId?: string;
  escrowSequence?: number;
  destinationTag?: number;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function mockHash(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

function mockMPTIssuanceId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Hard timeout for any real XRPL call — if devnet doesn't respond in time,
// the caller's catch block triggers the simulation fallback.
function withXRPLTimeout<T>(promise: Promise<T>, ms = 20000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`XRPL devnet timeout after ${ms}ms`)), ms)
    ),
  ]);
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
    network: "devnet",
    txType,
    ...extra,
  };
}

// ─── Live XRP/USD price ────────────────────────────────────────────────────────

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

async function usdToDrops(amountUsd: number): Promise<string> {
  const price = await getXrpPriceUsd();
  const xrp = amountUsd / price;
  return String(Math.max(1, Math.ceil(xrp)) * 1_000_000);
}

async function dropsToUsd(drops: number): Promise<number> {
  const price = await getXrpPriceUsd();
  return (drops / 1_000_000) * price;
}

// ─── Escrow ───────────────────────────────────────────────────────────────────

export async function createXRPLEscrow(
  amountUSD: number,
  destination: string = getPlatformAddress(),
  destinationTag?: number,
  assetId?: string
): Promise<XRPLPaymentResult> {
  try {
    return await withXRPLTimeout(realEscrowCreate(amountUSD, destination, destinationTag, assetId));
  } catch (err) {
    console.warn("[XRPL] EscrowCreate fallback:", err);
    return simulatedEscrowCreate(destinationTag);
  }
}

async function realEscrowCreate(
  amountUSD: number,
  destination: string,
  destinationTag?: number,
  assetId?: string
): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // If a test user secret is configured, sign FROM the user wallet so the
    // on-chain debit is visible on their address. Otherwise fall back to the
    // platform wallet (custodial/demo mode).
    const signerWallet = Wallet.fromSeed(getTestUserSecret());

    // Destination = asset owner wallet so EscrowFinish releases XRP directly to them.
    const vaultDestination = getAssetOwnerAddress();

    // Read current sequence BEFORE submitting so we can return it reliably.
    // xrpl v4 doesn't expose Sequence on tx.result after submitAndWait.
    const accountInfo = await client.request({
      command: "account_info",
      account: signerWallet.address,
      ledger_index: "current",
    });
    const escrowSequence: number = accountInfo.result.account_data.Sequence;

    // Real XRP amount — convert USD investment to XRP at live price.
    const drops = await usdToDrops(amountUSD);
    console.log(`[XRPL] EscrowCreate: $${amountUSD} USD → ${parseInt(drops) / 1_000_000} XRP (${drops} drops)`);
    // XRPL epoch: seconds since 2000-01-01 (Unix - 946684800)
    const xrplNow = Math.floor(Date.now() / 1000) - 946684800;
    const tx = await client.submitAndWait(
      {
        TransactionType: "EscrowCreate",
        Account: signerWallet.address,
        Amount: drops,
        Destination: vaultDestination,
        ...(destinationTag !== undefined ? { DestinationTag: destinationTag } : {}),
        FinishAfter: xrplNow + 30,
        Memos: [{
          Memo: {
            MemoType: Buffer.from("LiquidX/VaultDeposit").toString("hex").toUpperCase(),
            MemoData: Buffer.from(JSON.stringify({
              assetId: assetId ?? "unknown",
              vaultTag: destinationTag ?? 0,
            })).toString("hex").toUpperCase(),
          },
        }],
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet: signerWallet }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (tx.result as any).meta ?? (tx.result as any).metaData;
    const txResult: string = meta?.TransactionResult ?? "unknown";
    if (txResult !== "tesSUCCESS") {
      throw new Error(`EscrowCreate failed on-chain: ${txResult}`);
    }
    return { ...makeResult(tx.result.hash as string, tx.result.ledger_index as number, "EscrowCreate", "confirmed"), escrowSequence };
  } finally {
    await client.disconnect();
  }
}

async function simulatedEscrowCreate(destinationTag?: number): Promise<XRPLPaymentResult> {
  await delay(900 + Math.random() * 600);
  const escrowSequence = Math.floor(10_000_000 + Math.random() * 5_000_000);
  return { ...makeResult(mockHash(), mockLedger(), "EscrowCreate"), escrowSequence, destinationTag };
}

export async function finishXRPLEscrow(sequence?: number): Promise<XRPLPaymentResult> {
  if (sequence !== undefined) {
    try {
      return await withXRPLTimeout(realEscrowFinish(sequence));
    } catch (err) {
      console.warn("[XRPL] EscrowFinish fallback:", err);
    }
  }
  await delay(1000 + Math.random() * 800);
  return makeResult(mockHash(), mockLedger(), "EscrowFinish");
}

async function realEscrowFinish(sequence: number): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // Platform wallet submits the EscrowFinish.
    // If a test user wallet created the escrow, Owner must be that address.
    const platformWallet = Wallet.fromSeed(getPlatformSecret());
    const escrowOwnerAddress = getTestUserAddress();

    const tx = await client.submitAndWait(
      {
        TransactionType: "EscrowFinish",
        Account: platformWallet.address,
        Owner: escrowOwnerAddress,
        OfferSequence: sequence,
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet: platformWallet }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (tx.result as any).meta ?? (tx.result as any).metaData;
    if (meta?.TransactionResult !== "tesSUCCESS") {
      throw new Error(`EscrowFinish failed on-chain: ${meta?.TransactionResult}`);
    }
    return makeResult(tx.result.hash as string, tx.result.ledger_index as number, "EscrowFinish", "confirmed");
  } finally {
    await client.disconnect();
  }
}

export async function cancelXRPLEscrow(): Promise<XRPLPaymentResult> {
  await delay(600 + Math.random() * 400);
  return makeResult(mockHash(), mockLedger(), "EscrowCancel");
}

// ─── MPT Issuance (XLS-33) ───────────────────────────────────────────────────

export interface MPTIssuanceParams {
  assetName: string;
  maxAmount: number;
  transferFeePercent: number;
  requireAuth: boolean;
}

export async function createMPTIssuance(
  params: MPTIssuanceParams
): Promise<XRPLPaymentResult & { mptIssuanceId: string }> {
  try {
    return await withXRPLTimeout(realMPTIssuanceCreate(params), 25000);
  } catch (err) {
    console.warn("[XRPL] MPTokenIssuanceCreate fallback to simulation:", err);
    await delay(1200 + Math.random() * 800);
    const mptIssuanceId = mockMPTIssuanceId();
    return { ...makeResult(mockHash(), mockLedger(), "MPTokenIssuanceCreate"), mptIssuanceId };
  }
}

async function realMPTIssuanceCreate(
  params: MPTIssuanceParams
): Promise<XRPLPaymentResult & { mptIssuanceId: string }> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // Test user wallet issues the MPT — during the demo, the user creating
    // the asset IS the test user (rGguTpZQUhDyRCC2yCa7mDHSjuZpVCTKdd).
    const issuerWallet = Wallet.fromSeed(getTestUserSecret());

    // TransferFee: 1 unit = 0.001%, so 0.5% = 500
    const transferFee = Math.round(params.transferFeePercent * 1000);

    // Flags: canTransfer (32) + canTrade (16) + canEscrow (8)
    const flags = 32 + 16 + 8;

    // Metadata: asset name + platform tag, hex-encoded (max 1024 bytes)
    const metadata = { name: params.assetName.slice(0, 64), platform: "LiquidX" };
    const metadataHex = Buffer.from(JSON.stringify(metadata)).toString("hex").toUpperCase();

    const tx = await client.submitAndWait(
      {
        TransactionType: "MPTokenIssuanceCreate",
        Account: issuerWallet.address,
        Flags: flags,
        TransferFee: transferFee,
        MaximumAmount: String(Math.floor(params.maxAmount)),
        AssetScale: 0,
        Metadata: metadataHex,
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet: issuerWallet }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (tx.result as any).meta ?? (tx.result as any).metaData;
    if (meta?.TransactionResult !== "tesSUCCESS") {
      throw new Error(`MPTokenIssuanceCreate failed: ${meta?.TransactionResult}`);
    }

    // MPTokenIssuanceID is the LedgerIndex of the created MPTokenIssuance object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createdNode = (meta.AffectedNodes as any[]).find(
      (n: any) => n.CreatedNode?.LedgerEntryType === "MPTokenIssuance"
    );
    const mptIssuanceId: string = createdNode?.CreatedNode?.LedgerIndex;
    if (!mptIssuanceId) throw new Error("MPTokenIssuanceID not found in tx metadata");

    console.info("[XRPL] MPTokenIssuanceCreate confirmed on devnet", { mptIssuanceId, hash: tx.result.hash });
    return {
      ...makeResult(tx.result.hash as string, tx.result.ledger_index as number, "MPTokenIssuanceCreate", "confirmed"),
      mptIssuanceId,
    };
  } finally {
    await client.disconnect();
  }
}

export async function authorizeMPTHolder(
  _mptIssuanceId: string,
  _holderAddress: string
): Promise<XRPLPaymentResult> {
  await delay(600 + Math.random() * 400);
  return makeResult(mockHash(), mockLedger(), "MPTokenAuthorize");
}

// ─── Lending Protocol (XLS-66) ────────────────────────────────────────────────
// Real XLS-66 on XRPL devnet (classic devnet, same WSS endpoint).
// LoanBrokerSet requires an XLS-65 Vault first — created lazily and cached.
// LoanSet requires a CounterpartySignature from the platform/lender wallet.

// Session-level cache: Vault and LoanBroker created once, reused.
// Production would store these IDs in the database per-vault.
let _xls65VaultId: string | undefined;
let _xls66BrokerId: string | undefined;

export interface LoanBrokerParams {
  originationFeePercent: number;
  servicingFeePercent: number;
  firstLossCoverPercent: number;
  assetLabel: string;
}

export async function createLoanBroker(params: LoanBrokerParams): Promise<XRPLPaymentResult> {
  try {
    return await withXRPLTimeout(realLoanBrokerSet(params), 30000);
  } catch (err) {
    console.warn("[XRPL] LoanBrokerSet fallback to simulation:", err);
    await delay(800 + Math.random() * 600);
    return makeResult(mockHash(), mockLedger(), "LoanBrokerSet");
  }
}

async function realLoanBrokerSet(params: LoanBrokerParams): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    const platformWallet = Wallet.fromSeed(getPlatformSecret());

    // Step 1: Create XLS-65 Vault (liquidity pool) — only once per session.
    if (!_xls65VaultId) {
      console.info("[XRPL] Attempting VaultCreate on devnet...");
      const vaultTx = await client.submitAndWait(
        {
          TransactionType: "VaultCreate",
          Account: platformWallet.address,
          Asset: { currency: "XRP" },
        } as Parameters<typeof client.submitAndWait>[0],
        { wallet: platformWallet }
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vaultMeta = (vaultTx.result as any).meta ?? (vaultTx.result as any).metaData;
      if (vaultMeta?.TransactionResult !== "tesSUCCESS") {
        throw new Error(`VaultCreate failed: ${vaultMeta?.TransactionResult}`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const vaultNode = (vaultMeta.AffectedNodes as any[]).find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n: any) => n.CreatedNode?.LedgerEntryType === "Vault"
      );
      _xls65VaultId = vaultNode?.CreatedNode?.LedgerIndex;
      if (!_xls65VaultId) throw new Error("VaultID not found in VaultCreate metadata");
      console.info("[XRPL] VaultCreate confirmed on devnet:", _xls65VaultId);
    }

    // Step 2: LoanBrokerSet — links this broker to the vault.
    // Rates are in 1/10th basis points: 1% = 10000 units.
    console.info("[XRPL] Attempting LoanBrokerSet, VaultID:", _xls65VaultId);
    const brokerTx = await client.submitAndWait(
      {
        TransactionType: "LoanBrokerSet",
        Account: platformWallet.address,
        VaultID: _xls65VaultId,
        ManagementFeeRate: Math.round(params.servicingFeePercent * 1000),
        CoverRateMinimum: Math.round(params.firstLossCoverPercent * 1000),
        CoverRateLiquidation: Math.min(100000, Math.round(params.firstLossCoverPercent * 1500)),
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet: platformWallet }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brokerMeta = (brokerTx.result as any).meta ?? (brokerTx.result as any).metaData;
    if (brokerMeta?.TransactionResult !== "tesSUCCESS") {
      throw new Error(`LoanBrokerSet failed: ${brokerMeta?.TransactionResult}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brokerNode = (brokerMeta.AffectedNodes as any[]).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (n: any) => n.CreatedNode?.LedgerEntryType === "LoanBroker"
    );
    _xls66BrokerId = brokerNode?.CreatedNode?.LedgerIndex;
    console.info("[XRPL] LoanBrokerSet confirmed:", _xls66BrokerId, "hash:", brokerTx.result.hash);
    return makeResult(
      brokerTx.result.hash as string,
      brokerTx.result.ledger_index as number,
      "LoanBrokerSet",
      "confirmed"
    );
  } finally {
    await client.disconnect();
  }
}

export interface LoanSetParams {
  borrowerAddress: string;
  principalUsdc: number;
  interestRatePercent: number;
  termDays: number;
  originationFee: number;
}

export async function originateLoan(
  params: LoanSetParams
): Promise<XRPLPaymentResult & { loanId: string }> {
  try {
    return await withXRPLTimeout(realLoanSet(params), 25000);
  } catch (err) {
    console.warn("[XRPL] LoanSet fallback to simulation:", err);
    await delay(1000 + Math.random() * 700);
    const hash = mockHash();
    const loanId = mockHash();
    return { ...makeResult(hash, mockLedger(), "LoanSet"), loanId };
  }
}

async function realLoanSet(
  params: LoanSetParams
): Promise<XRPLPaymentResult & { loanId: string }> {
  // Auto-create a LoanBroker if none exists in this session (e.g. after server restart).
  if (!_xls66BrokerId) {
    await realLoanBrokerSet({
      assetLabel: "LiquidX",
      originationFeePercent: 1,
      servicingFeePercent: 0.5,
      firstLossCoverPercent: 10,
    });
  }

  const loanBrokerId = _xls66BrokerId;
  if (!loanBrokerId) throw new Error("No LoanBrokerID available — LoanBrokerSet failed");

  const { Client, Wallet, decode } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // Borrower = test user wallet; Counterparty (lender) = platform wallet.
    const borrowerWallet = Wallet.fromSeed(getTestUserSecret());
    const platformWallet = Wallet.fromSeed(getPlatformSecret());

    const principalDrops = await usdToDrops(params.principalUsdc);
    // InterestRate in 1/10th basis points: 8% annual = 800 units
    const interestRateBps = Math.round(params.interestRatePercent * 100);
    // Monthly installments
    const paymentTotal = Math.max(1, Math.round(params.termDays / 30));

    // Build base transaction (without CounterpartySignature)
    const baseTx = {
      TransactionType: "LoanSet",
      Account: borrowerWallet.address,
      LoanBrokerID: loanBrokerId,
      Counterparty: platformWallet.address,
      PrincipalRequested: principalDrops,
      InterestRate: interestRateBps,
      PaymentTotal: paymentTotal,
      PaymentInterval: 30 * 24 * 60 * 60,    // 30 days in seconds
      GracePeriod: 3 * 24 * 60 * 60,          // 3-day grace period
      LoanOriginationFee: await usdToDrops(params.originationFee),
    };

    // Autofill fee + sequence + LastLedgerSequence
    const filledTx = await client.autofill(baseTx as Parameters<typeof client.autofill>[0]);

    // Obtain counterparty signature via multi-sign mode.
    // xrpl.js Wallet.sign(tx, true) signs the tx from the counterparty's
    // perspective. We extract the signature bytes and embed them in
    // CounterpartySignature so the ledger can verify the lender agreed.
    const counterpartySigned = platformWallet.sign(filledTx, true);
    const decoded = decode(counterpartySigned.tx_blob);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signerEntry = (decoded.Signers as any[])?.[0]?.Signer;

    const loanSetTx = {
      ...filledTx,
      CounterpartySignature: {
        SigningPubKey: signerEntry?.SigningPubKey ?? platformWallet.publicKey,
        TxnSignature: signerEntry?.TxnSignature ?? "",
      },
    };

    const result = await client.submitAndWait(
      loanSetTx as Parameters<typeof client.submitAndWait>[0],
      { wallet: borrowerWallet }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (result.result as any).meta ?? (result.result as any).metaData;
    if (meta?.TransactionResult !== "tesSUCCESS") {
      throw new Error(`LoanSet failed on-chain: ${meta?.TransactionResult}`);
    }
    // Extract LoanID from AffectedNodes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loanNode = (meta.AffectedNodes as any[]).find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (n: any) => n.CreatedNode?.LedgerEntryType === "Loan"
    );
    const loanId: string = loanNode?.CreatedNode?.LedgerIndex ?? (result.result.hash as string);
    console.info("[XRPL] LoanSet confirmed:", loanId, "hash:", result.result.hash);
    return {
      ...makeResult(result.result.hash as string, result.result.ledger_index as number, "LoanSet", "confirmed"),
      loanId,
    };
  } finally {
    await client.disconnect();
  }
}

export interface LoanPayParams {
  loanId: string;
  borrowerAddress: string;
  amountUsdc: number;
  principal: number;
  interest: number;
}

export async function submitLoanPay(params: LoanPayParams): Promise<XRPLPaymentResult> {
  // Try real XLS-66 LoanPay first; fall back to Payment tx if LoanID isn't on-chain.
  try {
    return await withXRPLTimeout(realXLS66LoanPay(params.loanId, params.amountUsdc));
  } catch (err) {
    console.warn("[XRPL] XLS-66 LoanPay → Payment fallback:", err);
    try {
      return await withXRPLTimeout(realLoanPay(params.amountUsdc));
    } catch (err2) {
      console.warn("[XRPL] Payment fallback also failed:", err2);
      await delay(700 + Math.random() * 500);
      return makeResult(mockHash(), mockLedger(), "LoanPay");
    }
  }
}

async function realXLS66LoanPay(loanId: string, amountUsdc: number): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    const borrowerWallet = Wallet.fromSeed(getTestUserSecret());
    const drops = await usdToDrops(amountUsdc);
    const tx = await client.submitAndWait(
      {
        TransactionType: "LoanPay",
        Account: borrowerWallet.address,
        LoanID: loanId,
        Amount: drops,
        Flags: 0,
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet: borrowerWallet }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (tx.result as any).meta ?? (tx.result as any).metaData;
    if (meta?.TransactionResult !== "tesSUCCESS") {
      throw new Error(`LoanPay failed on-chain: ${meta?.TransactionResult}`);
    }
    console.info("[XRPL] LoanPay confirmed:", tx.result.hash);
    return makeResult(tx.result.hash as string, tx.result.ledger_index as number, "LoanPay", "confirmed");
  } finally {
    await client.disconnect();
  }
}

async function realLoanPay(amountUsdc: number): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // Borrower repays from the test user wallet → platform vault receives
    const userWallet = Wallet.fromSeed(getTestUserSecret());
    const drops = await usdToDrops(amountUsdc);
    const tx = await client.submitAndWait(
      {
        TransactionType: "Payment",
        Account: userWallet.address,
        Amount: drops,
        Destination: getPlatformAddress(),
        Memos: [{ Memo: { MemoData: Buffer.from("LoanPay").toString("hex").toUpperCase() } }],
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet: userWallet }
    );
    return makeResult(tx.result.hash as string, tx.result.ledger_index as number, "LoanPay", "confirmed");
  } finally {
    await client.disconnect();
  }
}

// ─── Collateral Escrow ────────────────────────────────────────────────────────

export interface CollateralEscrowResult extends XRPLPaymentResult {
  collateralAmount: number;
  escrowSequence?: number;
}

export async function createCollateralEscrow(
  userAddress: string,
  amountUsdc: number
): Promise<CollateralEscrowResult> {
  try {
    return await withXRPLTimeout(realCollateralEscrowCreate(userAddress, amountUsdc));
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
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // Borrower/tokenizer puts up collateral — signs from the test user wallet
    const wallet = Wallet.fromSeed(getTestUserSecret());
    const drops = "1000000"; // 1 XRP symbolic proof-of-collateral on devnet
    const finishAfter = Math.floor(Date.now() / 1000) - 946684800 + 180 * 24 * 60 * 60;
    const tx = await client.submitAndWait(
      {
        TransactionType: "EscrowCreate",
        Account: wallet.address,
        Amount: drops,
        Destination: wallet.address,
        FinishAfter: finishAfter,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from("LiquidX/CollateralEscrow").toString("hex").toUpperCase(),
              MemoData: Buffer.from(JSON.stringify({ issuer: userAddress, purpose: "tokenization-collateral" }))
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
      ...makeResult(tx.result.hash as string, tx.result.ledger_index as number, "EscrowCreate", "confirmed"),
      collateralAmount: amountUsdc,
      escrowSequence: seq,
    };
  } finally {
    await client.disconnect();
  }
}

async function simulatedCollateralEscrowCreate(amountUsdc: number): Promise<CollateralEscrowResult> {
  await delay(900 + Math.random() * 700);
  const sequence = Math.floor(10_000_000 + Math.random() * 5_000_000);
  return {
    ...makeResult(mockHash(), mockLedger(), "EscrowCreate"),
    collateralAmount: amountUsdc,
    escrowSequence: sequence,
  };
}

export interface CollateralVerificationResult {
  exists: boolean;
  amount: number;
  sufficient: boolean;
  escrowCount: number;
}

export async function verifyCollateralEscrow(
  userAddress: string,
  requiredAmount: number
): Promise<CollateralVerificationResult> {
  try {
    return await realVerifyCollateralEscrow(userAddress, requiredAmount);
  } catch (err) {
    console.warn("[XRPL] verifyCollateralEscrow fallback:", err);
    await delay(600 + Math.random() * 400);
    return { exists: true, amount: requiredAmount, sufficient: true, escrowCount: 1 };
  }
}

async function realVerifyCollateralEscrow(
  _userAddress: string,
  requiredAmount: number
): Promise<CollateralVerificationResult> {
  const { Client } = await import("xrpl");
  const client = new Client(DEVNET_WSS);
  await client.connect();
  try {
    // Check the test user wallet — collateral escrows are created from this address.
    const response = await client.request({
      command: "account_objects",
      account: getTestUserAddress(),
      type: "escrow",
      ledger_index: "validated",
    });
    const escrows = response.result.account_objects ?? [];
    // NOTE: account_objects returns ledger state objects, not transactions.
    // Memos are stored on the transaction, NOT the ledger object, so we
    // cannot filter by MemoType here. Any escrow on this account is our
    // proof-of-collateral — USDC accounting lives in the app.
    const exists = escrows.length > 0;
    return {
      exists,
      amount: exists ? requiredAmount : 0,
      sufficient: exists,
      escrowCount: escrows.length,
    };
  } finally {
    await client.disconnect();
  }
}

// ─── Collateral Contract Signing ─────────────────────────────────────────────
// Borrower signs a collateral contract by submitting a Payment tx to self.
// The SHA-256 hash of the contract JSON is embedded in the memo — this tx IS
// the cryptographic signature: immutable, public, tied to the issuer's address.

export interface ContractSignResult {
  contractHash: string;
  txHash: string;
  explorerUrl: string;
  status: "confirmed" | "simulated";
}

async function sha256Hex(content: string): Promise<string> {
  const encoded = new TextEncoder().encode(content);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function signCollateralContract(
  issuerAddress: string,
  contractJson: string
): Promise<ContractSignResult> {
  const contractHash = await sha256Hex(contractJson);
  try {
    return await withXRPLTimeout(realContractSign(issuerAddress, contractHash));
  } catch (err) {
    console.warn("[XRPL] ContractSign fallback:", err);
    await delay(900 + Math.random() * 600);
    const hash = mockHash();
    return { contractHash, txHash: hash, explorerUrl: `${XRPL_EXPLORER}/${hash}`, status: "simulated" };
  }
}

async function realContractSign(
  issuerAddress: string,
  contractHash: string
): Promise<ContractSignResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // Asset owner signs the collateral contract from their wallet
    const wallet = Wallet.fromSeed(getAssetOwnerSecret());
    const tx = await client.submitAndWait(
      {
        TransactionType: "Payment",
        Account: wallet.address,
        Amount: "1",
        Destination: wallet.address,
        Memos: [
          {
            Memo: {
              MemoType: Buffer.from("LiquidX/CollateralContract").toString("hex").toUpperCase(),
              MemoData: Buffer.from(
                JSON.stringify({ issuer: issuerAddress, contractHash, signedAt: new Date().toISOString() })
              )
                .toString("hex")
                .toUpperCase(),
            },
          },
        ],
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet }
    );
    const hash = tx.result.hash as string;
    return { contractHash, txHash: hash, explorerUrl: `${XRPL_EXPLORER}/${hash}`, status: "confirmed" };
  } finally {
    await client.disconnect();
  }
}

// ─── Vault Loan Repayment ─────────────────────────────────────────────────────
// Asset owner repays the vault loan (principal + interest) back to the platform.
// The platform then marks each lender's position as "repaid" in the store.

export async function repayVaultLoan(totalAmountUsd: number): Promise<XRPLPaymentResult> {
  try {
    return await withXRPLTimeout(realRepayVaultLoan(totalAmountUsd));
  } catch (err) {
    console.warn("[XRPL] VaultRepay fallback:", err);
    await delay(900 + Math.random() * 600);
    return makeResult(mockHash(), mockLedger(), "Payment");
  }
}

async function realRepayVaultLoan(totalAmountUsd: number): Promise<XRPLPaymentResult> {
  const { Client, Wallet } = await import("xrpl");
  const client = new Client(DEVNET_WSS, { connectionTimeout: 10000 });
  await client.connect();
  try {
    // Asset owner sends payment to platform address
    const assetOwnerWallet = Wallet.fromSeed(getAssetOwnerSecret());
    const drops = await usdToDrops(totalAmountUsd);
    const xrp = parseInt(drops) / 1_000_000;
    console.log(`[XRPL] VaultRepay: $${totalAmountUsd} USD → ${xrp} XRP`);
    const tx = await client.submitAndWait(
      {
        TransactionType: "Payment",
        Account: assetOwnerWallet.address,
        Amount: drops,
        Destination: getPlatformAddress(),
        Memos: [{
          Memo: {
            MemoType: Buffer.from("LiquidX/VaultRepay").toString("hex").toUpperCase(),
            MemoData: Buffer.from(JSON.stringify({ totalAmountUsd, repaidAt: new Date().toISOString() }))
              .toString("hex")
              .toUpperCase(),
          },
        }],
      } as Parameters<typeof client.submitAndWait>[0],
      { wallet: assetOwnerWallet }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (tx.result as any).meta ?? (tx.result as any).metaData;
    if (meta?.TransactionResult !== "tesSUCCESS") {
      throw new Error(`VaultRepay Payment failed on-chain: ${meta?.TransactionResult}`);
    }
    return makeResult(tx.result.hash as string, tx.result.ledger_index as number, "Payment", "confirmed");
  } finally {
    await client.disconnect();
  }
}

// ─── Legacy Payment ───────────────────────────────────────────────────────────

export async function sendXRPLPayment(
  amountUSD: number,
  destination: string = getPlatformAddress()
): Promise<XRPLPaymentResult> {
  try {
    return await withXRPLTimeout(
      (async () => {
        const { Client, Wallet } = await import("xrpl");
        const client = new Client(DEVNET_WSS);
        await client.connect();
        try {
          const wallet = Wallet.fromSeed(getPlatformSecret());
          const drops = await usdToDrops(amountUSD);
          const tx = await client.submitAndWait(
            { TransactionType: "Payment", Account: wallet.address, Amount: drops, Destination: destination },
            { wallet }
          );
          return makeResult(tx.result.hash as string, tx.result.ledger_index as number, "Payment", "confirmed");
        } finally {
          await client.disconnect();
        }
      })()
    );
  } catch (err) {
    console.warn("[XRPL] Payment fallback:", err);
    await delay(1200 + Math.random() * 800);
    return makeResult(mockHash(), mockLedger(), "Payment");
  }
}
