// ─── LiquidX XRPL Client ──────────────────────────────────────────────────────
// Client-safe wrappers for XRPL operations.
// All calls go through /api/xrpl/* routes — no secrets, no signing here.
// Safe to import in "use client" components.

// Re-export types only (erased at runtime — no server code bundled client-side)
export type {
  XRPLPaymentResult,
  XRPLTxType,
  MPTIssuanceParams,
  LoanBrokerParams,
  LoanSetParams,
  LoanPayParams,
  CollateralEscrowResult,
  CollateralVerificationResult,
  ContractSignResult,
} from "./xrpl";

import type {
  XRPLPaymentResult,
  MPTIssuanceParams,
  LoanBrokerParams,
  LoanSetParams,
  LoanPayParams,
  CollateralEscrowResult,
  CollateralVerificationResult,
  ContractSignResult,
} from "./xrpl";

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function post<T>(path: string, body: unknown): Promise<T> {
  console.log(`[xrpl-client] POST ${path}`, body);
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
  console.log(`[xrpl-client] ${path} response (${res.status}):`, json);
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`);
  return json as T;
}

// ─── Escrow ───────────────────────────────────────────────────────────────────

export async function createXRPLEscrow(
  amountUsdc: number,
  destination?: string,
  destinationTag?: number,
  assetId?: string
): Promise<XRPLPaymentResult> {
  return post("/api/xrpl/escrow/create", { amountUsdc, destination, destinationTag, assetId });
}

export async function finishXRPLEscrow(sequence?: number): Promise<XRPLPaymentResult> {
  return post("/api/xrpl/escrow/finish", { sequence });
}

export async function cancelXRPLEscrow(): Promise<XRPLPaymentResult> {
  return post("/api/xrpl/escrow/cancel", {});
}

// ─── Collateral ───────────────────────────────────────────────────────────────

export async function createCollateralEscrow(
  userAddress: string,
  amountUsdc: number
): Promise<CollateralEscrowResult> {
  return post("/api/xrpl/collateral/create", { userAddress, amountUsdc });
}

export async function verifyCollateralEscrow(
  userAddress: string,
  requiredAmount: number
): Promise<CollateralVerificationResult> {
  return post("/api/xrpl/collateral/verify", { userAddress, requiredAmount });
}

// ─── MPT Issuance ─────────────────────────────────────────────────────────────

export async function createMPTIssuance(
  params: MPTIssuanceParams
): Promise<XRPLPaymentResult & { mptIssuanceId: string }> {
  return post("/api/xrpl/mpt/issue", params);
}

// ─── Lending ──────────────────────────────────────────────────────────────────

export async function createLoanBroker(params: LoanBrokerParams): Promise<XRPLPaymentResult> {
  return post("/api/xrpl/loan/broker", params);
}

export async function originateLoan(
  params: LoanSetParams
): Promise<XRPLPaymentResult & { loanId: string }> {
  return post("/api/xrpl/loan/originate", params);
}

export async function submitLoanPay(params: LoanPayParams): Promise<XRPLPaymentResult> {
  return post("/api/xrpl/loan/repay", params);
}

// ─── Collateral Contract Signing ─────────────────────────────────────────────

export async function signCollateralContract(
  issuerAddress: string,
  contractJson: string
): Promise<ContractSignResult> {
  return post("/api/xrpl/contract/sign", { issuerAddress, contractJson });
}

// ─── Legacy Payment ───────────────────────────────────────────────────────────

export async function sendXRPLPayment(
  amountUsdc: number,
  destination?: string
): Promise<XRPLPaymentResult> {
  return post("/api/xrpl/payment", { amountUsdc, destination });
}
