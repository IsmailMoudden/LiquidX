// ─── LiquidX — Supabase Sync ──────────────────────────────────────────────────
// Persists lending positions, loans, and transactions to Supabase so user data
// survives across devices and browser sessions.
// Called from portfolio-store actions after local state is updated.

import { createClient } from "@/lib/supabase/client";
import type { Investment, Loan, Transaction, Asset } from "@/lib/types";

// ─── Assets ───────────────────────────────────────────────────────────────────

function assetToRow(asset: Asset, userId?: string) {
  return {
    id: asset.id,
    ...(userId ? { user_id: userId } : {}),
    name: asset.name,
    category: asset.category,
    description: asset.description,
    long_description: asset.longDescription,
    location: asset.location,
    image_url: asset.image,
    total_value: asset.totalValue,
    token_supply: asset.tokenSupply,
    token_price: asset.tokenPrice,
    projected_yield: asset.projectedYield,
    liquidity_score: asset.liquidityScore,
    min_investment: asset.minInvestment,
    tags: asset.tags ?? [],
    highlights: asset.highlights ?? [],
    sources: asset.sources ?? [],
    funding_target: asset.fundingTarget,
    amount_raised: asset.amountRaised,
    investor_count: asset.investorCount,
    funding_deadline: asset.fundingDeadline,
    funding_status: asset.fundingStatus,
    validator_id: asset.validatorId,
    compliance_approved: asset.complianceApproved,
    verification_status: asset.verificationStatus ?? "pending",
    mpt_issuance_id: asset.mptIssuanceId ?? null,
    issuer_did: asset.issuerDid ?? null,
    issuer_verified: asset.issuerVerified ?? false,
    legal_declaration_hash: asset.legalDeclarationHash ?? null,
    ownership_proof_hash: asset.ownershipProofHash ?? null,
    proof_of_ownership: asset.proofOfOwnership ?? null,
    updated_at: new Date().toISOString(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToAsset(r: Record<string, any>): Asset {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    description: r.description ?? "",
    longDescription: r.long_description ?? "",
    image: r.image_url ?? r.image ?? "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    location: r.location ?? "",
    totalValue: r.total_value ?? 0,
    tokenSupply: r.token_supply ?? 0,
    tokenPrice: r.token_price ?? 0,
    projectedYield: r.projected_yield ?? 0,
    liquidityScore: r.liquidity_score ?? 0,
    minInvestment: r.min_investment ?? 0,
    tags: r.tags ?? [],
    highlights: r.highlights ?? [],
    sources: r.sources ?? [],
    fundingTarget: r.funding_target ?? 0,
    amountRaised: r.amount_raised ?? 0,
    investorCount: r.investor_count ?? 0,
    fundingDeadline: r.funding_deadline ?? new Date().toISOString(),
    fundingStatus: r.funding_status ?? "open",
    validatorId: r.validator_id ?? "",
    complianceApproved: r.compliance_approved ?? false,
    verificationStatus: r.verification_status ?? "pending",
    mptIssuanceId: r.mpt_issuance_id ?? undefined,
    issuerDid: r.issuer_did ?? undefined,
    issuerVerified: r.issuer_verified ?? false,
    legalDeclarationHash: r.legal_declaration_hash ?? undefined,
    ownershipProofHash: r.ownership_proof_hash ?? undefined,
    proofOfOwnership: r.proof_of_ownership ?? undefined,
  };
}

export async function saveAsset(userId: string, asset: Asset): Promise<void> {
  const supabase = createClient();
  await supabase.from("assets").upsert(assetToRow(asset, userId));
}

export async function seedAssets(assets: Asset[]): Promise<void> {
  const supabase = createClient();
  const rows = assets.map((a) => assetToRow(a));
  await supabase.from("assets").upsert(rows, { onConflict: "id" });
}

export async function loadAssets(): Promise<Asset[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return data.map(rowToAsset);
}

// ─── Lending positions ────────────────────────────────────────────────────────

export async function saveLendingPosition(
  userId: string,
  pos: Investment,
  vaultTag?: number
): Promise<void> {
  const supabase = createClient();
  await supabase.from("lending_positions").upsert({
    id: pos.id,
    user_id: userId,
    asset_id: pos.assetId,
    asset_name: pos.assetName,
    vault_tag: vaultTag ?? null,
    amount_usdc: pos.amount ?? 0,
    status: pos.status,
    xrpl_escrow_hash: pos.xrplEscrowHash ?? null,
    xrpl_escrow_sequence: pos.xrplEscrowSequence ?? null,
    deposited_at: pos.timestamp ?? pos.depositedAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

export async function updateLendingPosition(
  userId: string,
  posId: string,
  updates: { status?: string; xrpl_escrow_hash?: string; released_at?: string }
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("lending_positions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", posId)
    .eq("user_id", userId);
}

// ─── Loans ────────────────────────────────────────────────────────────────────

export async function saveLoan(userId: string, loan: Loan): Promise<void> {
  const supabase = createClient();
  await supabase.from("loans").upsert({
    id: loan.id,
    user_id: userId,
    asset_id: loan.assetId,
    asset_name: loan.assetName,
    vault_id: loan.brokerId ?? loan.vaultId ?? null,
    borrower_address: loan.borrowerAddress,
    principal: loan.principal,
    interest_rate_percent: loan.interestRatePercent,
    term_days: loan.termDays,
    origination_fee: loan.originationFee,
    start_date: loan.startDate,
    maturity_date: loan.maturityDate,
    status: loan.status,
    xrpl_loan_hash: loan.xrplLoanHash ?? null,
    xrpl_loan_id: loan.xrplLoanId ?? null,
    repayment_schedule: loan.repaymentSchedule,
    total_repaid: loan.totalRepaid,
    underwriting_score: loan.underwritingScore,
    created_at: loan.createdAt,
    updated_at: loan.updatedAt,
  });
}

export async function updateLoan(
  userId: string,
  loanId: string,
  updates: {
    status?: string;
    total_repaid?: number;
    repayment_schedule?: unknown;
    updated_at?: string;
  }
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("loans")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", loanId)
    .eq("user_id", userId);
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function saveTransaction(userId: string, tx: Transaction): Promise<void> {
  const supabase = createClient();
  await supabase.from("transactions").upsert({
    id: tx.id,
    user_id: userId,
    type: tx.type,
    asset_id: tx.assetId,
    asset_name: tx.assetName,
    amount: tx.total,
    xrpl_hash: tx.xrplHash ?? null,
    xrpl_status: tx.xrplStatus ?? null,
    xrpl_tx_type: tx.xrplTxType ?? null,
    xrpl_explorer_url: tx.xrplExplorerUrl ?? null,
    vault_id: tx.vaultId ?? tx.brokerId ?? null,
    loan_id: tx.loanId ?? null,
    label: tx.label ?? null,
    created_at: tx.timestamp,
  });
}

// ─── Load user portfolio from Supabase ───────────────────────────────────────

export interface SupabasePortfolio {
  investments: Investment[];
  loans: Loan[];
  transactions: Transaction[];
}

export async function loadUserPortfolio(userId: string): Promise<SupabasePortfolio> {
  const supabase = createClient();

  const [posRes, loanRes, txRes] = await Promise.all([
    supabase
      .from("lending_positions")
      .select("*")
      .eq("user_id", userId)
      .order("deposited_at", { ascending: false }),
    supabase
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  const investments: Investment[] = (posRes.data ?? []).map((r) => ({
    id: r.id,
    assetId: r.asset_id,
    assetName: r.asset_name ?? "",
    amount: r.amount_usdc,
    status: r.status,
    xrplEscrowHash: r.xrpl_escrow_hash ?? undefined,
    xrplEscrowSequence: r.xrpl_escrow_sequence ?? undefined,
    timestamp: r.deposited_at,
    depositedAt: r.deposited_at,
  }));

  const loans: Loan[] = (loanRes.data ?? []).map((r) => ({
    id: r.id,
    assetId: r.asset_id,
    assetName: r.asset_name ?? "",
    brokerId: r.vault_id ?? undefined,
    borrowerAddress: r.borrower_address ?? "",
    principal: r.principal,
    interestRatePercent: r.interest_rate_percent,
    termDays: r.term_days,
    originationFee: r.origination_fee ?? 0,
    startDate: r.start_date,
    maturityDate: r.maturity_date,
    status: r.status,
    xrplLoanHash: r.xrpl_loan_hash ?? undefined,
    xrplLoanId: r.xrpl_loan_id ?? undefined,
    repaymentSchedule: r.repayment_schedule ?? [],
    totalRepaid: r.total_repaid ?? 0,
    underwritingScore: r.underwriting_score ?? 75,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const transactions: Transaction[] = (txRes.data ?? []).map((r) => ({
    id: r.id,
    type: r.type,
    assetId: r.asset_id ?? "",
    assetName: r.asset_name ?? "",
    tokens: 0,
    price: 0,
    total: r.amount ?? 0,
    timestamp: r.created_at,
    xrplHash: r.xrpl_hash ?? undefined,
    xrplStatus: r.xrpl_status ?? undefined,
    xrplTxType: r.xrpl_tx_type ?? undefined,
    xrplExplorerUrl: r.xrpl_explorer_url ?? undefined,
    vaultId: r.vault_id ?? undefined,
    loanId: r.loan_id ?? undefined,
    label: r.label ?? undefined,
  }));

  return { investments, loans, transactions };
}
