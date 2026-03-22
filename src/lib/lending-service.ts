// ─── LiquidX Lending Service ──────────────────────────────────────────────────
// This is the abstraction layer between the UI and XRPL primitives.
// The UI never calls XRPL functions directly — it calls these instead.
//
// XRPL primitive → Service function → UI action
// ─────────────────────────────────────────────
// LoanBrokerSet   → createVault()
// EscrowCreate    → depositToVault()
// EscrowFinish    → releaseVaultPosition()
// EscrowCancel    → refundVaultPosition()
// LoanSet         → requestLoan()
// LoanPay         → repayLoan()
// MPTokenIssuanceCreate → tokenizeAsset()

import {
  createXRPLEscrow,
  finishXRPLEscrow,
  cancelXRPLEscrow,
  createLoanBroker,
  originateLoan as xrplOriginateLoan,
  submitLoanPay,
  createMPTIssuance,
  createCollateralEscrow,
  verifyCollateralEscrow,
  type LoanBrokerParams,
  type LoanSetParams,
  type LoanPayParams,
  type MPTIssuanceParams,
  type XRPLPaymentResult,
  type CollateralEscrowResult,
} from "./xrpl-client";
import {
  attachDIDToUser,
  requireVerifiedDID,
  DIDNotVerifiedError,
} from "./did";

// ─── Result wrapper ───────────────────────────────────────────────────────────

export interface ServiceResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
  xrpl?: XRPLPaymentResult & { mptIssuanceId?: string; loanId?: string };
}

// ─── Vault operations ─────────────────────────────────────────────────────────

/**
 * createVault — sets up a new lending pool for an asset.
 * Wraps: LoanBrokerSet
 * Called by: platform admin / asset tokenizer
 */
export async function createVault(params: {
  assetName: string;
  originationFeePercent: number;
  servicingFeePercent: number;
  firstLossCoverPercent: number;
}): Promise<ServiceResult<{ xrplHash: string }>> {
  try {
    const result = await createLoanBroker({
      assetLabel: params.assetName,
      originationFeePercent: params.originationFeePercent,
      servicingFeePercent: params.servicingFeePercent,
      firstLossCoverPercent: params.firstLossCoverPercent,
    });
    return { ok: true, data: { xrplHash: result.hash }, xrpl: result };
  } catch (err) {
    return { ok: false, error: "Failed to create vault. Please try again." };
  }
}

/**
 * depositToVault — lender commits USDC into a vault's escrow.
 * Wraps: EscrowCreate
 * Called by: lender on /lend page
 * The lender never sees "EscrowCreate" — they see "Fund this loan pool".
 */
export async function depositToVault(params: {
  amountUsdc: number;
  vaultDestinationAddress?: string;
}): Promise<ServiceResult<{ xrplHash: string; ledger?: number; status: string }>> {
  try {
    const result = await createXRPLEscrow(
      params.amountUsdc,
      params.vaultDestinationAddress
    );
    return {
      ok: true,
      data: { xrplHash: result.hash, ledger: result.ledger, status: result.status },
      xrpl: result,
    };
  } catch (err) {
    return { ok: false, error: "Failed to deposit. Please try again." };
  }
}

/**
 * releaseVaultPosition — validator approves → lender's capital released.
 * Wraps: EscrowFinish
 * Called by: validator on /validator page
 */
export async function releaseVaultPosition(escrowSequence?: number): Promise<ServiceResult<{ xrplHash: string }>> {
  try {
    const result = await finishXRPLEscrow(escrowSequence);
    return { ok: true, data: { xrplHash: result.hash }, xrpl: result };
  } catch (err) {
    return { ok: false, error: "Failed to release position." };
  }
}

/**
 * refundVaultPosition — validator rejects → lender's capital returned.
 * Wraps: EscrowCancel
 */
export async function refundVaultPosition(): Promise<ServiceResult<{ xrplHash: string }>> {
  try {
    const result = await cancelXRPLEscrow();
    return { ok: true, data: { xrplHash: result.hash }, xrpl: result };
  } catch (err) {
    return { ok: false, error: "Failed to refund position." };
  }
}

// ─── Loan operations ──────────────────────────────────────────────────────────

/**
 * requestLoan — borrower submits a loan request against their asset.
 * Wraps: LoanSet (+ off-chain underwriting)
 * Called by: borrower on /borrow page
 *
 * DID enforcement: resolves and verifies the borrower's DID on XRPL before
 * allowing loan origination. Pass isDidVerified=true if already verified
 * in the current session to skip the network call.
 */
export async function requestLoan(params: {
  borrowerAddress: string;
  principalUsdc: number;
  interestRatePercent: number;
  termDays: number;
  /** Pass true if DID already resolved this session */
  isDidVerified?: boolean;
}): Promise<ServiceResult<{ loanId: string; xrplHash: string }>> {
  // ── DID gate ──────────────────────────────────────────────────────────────
  try {
    let didVerified = params.isDidVerified ?? false;
    if (!didVerified) {
      const identity = await attachDIDToUser(params.borrowerAddress);
      didVerified = identity.didVerified;
    }
    requireVerifiedDID(
      didVerified ? { xrplAddress: params.borrowerAddress, did: `did:xrpl:${params.borrowerAddress}`, didVerified: true, verificationStatus: "verified" } : null,
      "borrow"
    );
  } catch (err) {
    if (err instanceof DIDNotVerifiedError) {
      return { ok: false, error: err.message };
    }
    // DID resolution failure → block loan (fail-safe)
    return { ok: false, error: "Could not verify your identity. Please check your DID in Account." };
  }

  try {
    const result = await xrplOriginateLoan({
      borrowerAddress: params.borrowerAddress,
      principalUsdc: params.principalUsdc,
      interestRatePercent: params.interestRatePercent,
      termDays: params.termDays,
      originationFee: (params.principalUsdc * 0.01),
    });
    return {
      ok: true,
      data: { loanId: result.loanId!, xrplHash: result.hash },
      xrpl: result,
    };
  } catch (err) {
    return { ok: false, error: "Failed to submit loan request. Please try again." };
  }
}

/**
 * repayInstalment — borrower pays a scheduled instalment.
 * Wraps: LoanPay
 * Called by: borrower on /borrow page (their loan detail)
 */
export async function repayInstalment(params: {
  loanId: string;
  borrowerAddress: string;
  amountUsdc: number;
  principal: number;
  interest: number;
}): Promise<ServiceResult<{ xrplHash: string }>> {
  try {
    const result = await submitLoanPay({
      loanId: params.loanId,
      borrowerAddress: params.borrowerAddress,
      amountUsdc: params.amountUsdc,
      principal: params.principal,
      interest: params.interest,
    });
    return { ok: true, data: { xrplHash: result.hash }, xrpl: result };
  } catch (err) {
    return { ok: false, error: "Payment failed. Please try again." };
  }
}

// ─── Eligibility & Collateral ─────────────────────────────────────────────────

/** Minimum collateral required as fraction of asset value (10%) */
export const COLLATERAL_RATIO = 0.1;

export type EligibilityStatus =
  | "ready"                    // DID verified + sufficient collateral → can tokenize
  | "identity-not-verified"    // DID missing or unverified
  | "insufficient-collateral"  // DID ok but collateral escrow too small / missing
  | "checking";                // async check in progress (used by UI)

export interface EligibilityResult {
  eligible: boolean;
  status: EligibilityStatus;
  message: string;
  collateralRequired: number;   // USD amount required
  collateralLocked: number;     // USD amount currently locked on-chain
  collateralSufficient: boolean;
  didVerified: boolean;
}

/**
 * checkUserEligibility — real on-chain pre-flight before MPT issuance.
 *
 * Rules:
 *  1. Resolve DID from XRPL and verify the document (real resolution via xrpl-did-resolver)
 *  2. XRPL collateral escrow ≥ COLLATERAL_RATIO × assetValue must exist on-chain
 *
 * Called by: tokenize/page.tsx before showing the submit button, and enforced
 * again inside tokenizeAsset() to prevent bypassing the UI gate.
 */
export async function checkUserEligibility(params: {
  userAddress: string;
  /** Pass true to skip live DID resolution (e.g. already resolved in session) */
  isDidVerified?: boolean;
  assetValueUsd: number;
}): Promise<EligibilityResult> {
  const required = params.assetValueUsd * COLLATERAL_RATIO;

  // ── 1. Identity gate — real DID resolution ────────────────────────────────
  // If caller already resolved DID this session, skip the network call.
  let didVerified = params.isDidVerified ?? false;
  if (!didVerified) {
    try {
      const identity = await attachDIDToUser(params.userAddress);
      didVerified = identity.didVerified;
    } catch {
      didVerified = false;
    }
  }

  if (!didVerified) {
    return {
      eligible: false,
      status: "identity-not-verified",
      message: "Your XRP DID has not been verified. Complete identity verification in Account before registering assets.",
      collateralRequired: required,
      collateralLocked: 0,
      collateralSufficient: false,
      didVerified: false,
    };
  }

  // ── 2. Collateral gate ────────────────────────────────────────────────────
  const escrow = await verifyCollateralEscrow(params.userAddress, required);
  if (!escrow.sufficient) {
    return {
      eligible: false,
      status: "insufficient-collateral",
      message: `You must lock at least $${required.toLocaleString()} USDC (10% of asset value) in a collateral escrow before tokenizing.`,
      collateralRequired: required,
      collateralLocked: escrow.amount,
      collateralSufficient: false,
      didVerified: true,
    };
  }

  // ── 3. All checks passed ──────────────────────────────────────────────────
  return {
    eligible: true,
    status: "ready",
    message: "Identity verified and sufficient collateral locked. Ready to tokenize.",
    collateralRequired: required,
    collateralLocked: escrow.amount,
    collateralSufficient: true,
    didVerified: true,
  };
}

/**
 * lockCollateral — issuer locks the required collateral before tokenizing.
 * Wraps: createCollateralEscrow (EscrowCreate with collateral memo)
 * Called by: tokenize/page.tsx "Lock Collateral" button
 */
export async function lockCollateral(params: {
  userAddress: string;
  amountUsdc: number;
}): Promise<ServiceResult<{ xrplHash: string; escrowSequence?: number; collateralAmount: number }>> {
  try {
    const result: CollateralEscrowResult = await createCollateralEscrow(
      params.userAddress,
      params.amountUsdc
    );
    return {
      ok: true,
      data: {
        xrplHash: result.hash,
        escrowSequence: result.escrowSequence,
        collateralAmount: result.collateralAmount,
      },
      xrpl: result,
    };
  } catch (err) {
    return { ok: false, error: "Failed to lock collateral. Please try again." };
  }
}

// ─── Asset tokenization ───────────────────────────────────────────────────────

/**
 * tokenizeAsset — creates an MPT issuance for an RWA on XRPL.
 * Wraps: MPTokenIssuanceCreate
 *
 * Enforces eligibility gate: DID verified + collateral ≥ 10% of asset value.
 * Even if the UI bypassed the pre-flight, this function re-checks on-chain.
 */
export async function tokenizeAsset(
  params: MPTIssuanceParams & {
    userAddress: string;
    /** Pass true if DID was already verified in this session (avoids duplicate resolution) */
    isDidVerified?: boolean;
    assetValueUsd: number;
  }
): Promise<ServiceResult<{ mptIssuanceId: string; xrplHash: string; eligibility: EligibilityResult }>> {
  // ── Enforcement gate — real DID check + collateral verification ───────────
  const eligibility = await checkUserEligibility({
    userAddress: params.userAddress,
    isDidVerified: params.isDidVerified,
    assetValueUsd: params.assetValueUsd,
  });

  if (!eligibility.eligible) {
    return {
      ok: false,
      error: eligibility.message,
      data: undefined,
    };
  }

  // ── Eligible: proceed with MPT issuance ───────────────────────────────────
  try {
    const result = await createMPTIssuance(params);
    return {
      ok: true,
      data: { mptIssuanceId: result.mptIssuanceId, xrplHash: result.hash, eligibility },
      xrpl: result,
    };
  } catch (err) {
    return { ok: false, error: "Tokenization failed. Please try again." };
  }
}
