import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Asset, Holding, Investment, Loan, MPTIssuance,
  PortfolioState, Transaction, LoanRepayment,
} from "@/lib/types";
import { MOCK_ASSETS } from "@/data/assets";
import { VALIDATORS } from "@/data/validators";
import { LOAN_BROKERS, VAULT_TAGS } from "@/data/loanBrokers";
import { generateId } from "@/lib/utils";
import { saveLendingPosition, updateLendingPosition, saveLoan, updateLoan, saveTransaction, loadUserPortfolio, loadAssets, seedAssets } from "@/lib/supabase-sync";

// ─── XRPL settlement shape ────────────────────────────────────────────────────

export interface XRPLSettlement {
  hash: string;
  status: "confirmed" | "simulated";
  explorerUrl: string;
  ledger?: number;
  escrowSequence?: number;
  txType:
    | "EscrowCreate" | "EscrowFinish" | "EscrowCancel" | "Payment"
    | "MPTokenIssuanceCreate" | "MPTokenAuthorize"
    | "LoanBrokerSet" | "LoanSet" | "LoanPay";
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface PortfolioActions {
  // Escrow funding flow
  invest: (assetId: string, amount: number, xrpl: XRPLSettlement, tonAddress?: string) => { success: boolean; investmentId?: string; error?: string };
  approveAndRelease: (assetId: string, xrpl: XRPLSettlement) => { success: boolean; error?: string };
  refundAll: (assetId: string, xrpl: XRPLSettlement) => { success: boolean; error?: string };
  // Expire open rounds whose deadline has passed and refund all locked escrows
  expireDeadlines: () => { expiredCount: number; refundedAmount: number };

  // MPT tokenisation
  mintMPT: (assetId: string, xrpl: XRPLSettlement & { mptIssuanceId: string }) => { success: boolean; error?: string };

  // Lending protocol (XLS-66)
  originateLoan: (
    assetId: string,
    params: { borrowerAddress: string; borrowerTonAddress?: string; principalUsdc: number; interestRatePercent: number; termDays: number },
    xrpl: XRPLSettlement & { loanId: string }
  ) => { success: boolean; loanId?: string; error?: string };
  repayLoan: (loanId: string, repaymentId: string, xrpl: XRPLSettlement) => { success: boolean; error?: string };

  // Legacy
  buyAsset: (assetId: string, tokenAmount: number, xrpl?: XRPLSettlement, tonAddress?: string) => { success: boolean; error?: string };
  sellAsset: (assetId: string, tokenAmount: number, tonAddress?: string) => { success: boolean; error?: string };
  tokenizeAsset: (asset: Omit<Asset, "id" | "fundingStatus" | "amountRaised" | "investorCount" | "complianceApproved">) => Asset;
  resetPortfolio: () => void;
  // Compliance
  approveCompliance: (assetId: string) => { success: boolean; error?: string };
  // Supabase
  loadFromSupabase: (userId: string) => Promise<void>;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_INVESTMENTS: Investment[] = [
  {
    id: "inv-seed-001",
    assetId: "asset-005",
    assetName: "Munich Logistics Hub",
    amount: 2_100,
    tokens: 21,
    tokenPrice: 100,
    status: "released",
    xrplEscrowHash: "A3F9E1B2C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1",
    xrplReleaseHash: "D7E2F5A8B1C4D7E0F3A6B9C2D5E8F1A4B7C0D3E6F9A2B5C8D1E4F7A0B3C6D9E2",
    timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    releasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    validatorFee: 21,
  },
];

const SEED_HOLDINGS: Holding[] = [
  {
    assetId: "asset-005",
    tokens: 21,
    avgBuyPrice: 100,
    purchasedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    investmentId: "inv-seed-001",
  },
];

// Seed: one active loan on Solar Farm Alpha (asset-002) to demonstrate the lending flow
const SEED_LOAN_REPAYMENTS: LoanRepayment[] = [
  {
    id: "rep-s1-1",
    amount: 44_583,
    principal: 41_667,
    interest: 2_917,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: "due",
  },
  {
    id: "rep-s1-2",
    amount: 44_583,
    principal: 41_667,
    interest: 2_917,
    dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: "due",
  },
  {
    id: "rep-s1-3",
    amount: 44_583,
    principal: 41_666,
    interest: 2_917,
    dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    status: "due",
  },
];

const SEED_LOANS: Loan[] = [
  {
    id: "loan-seed-001",
    brokerId: "broker-002",
    assetId: "asset-002",
    assetName: "Solar Farm Alpha",
    borrowerAddress: "rN7n3473SaZBCG4dFL75SJQnvoFMoFGC9",
    principal: 125_000,
    interestRatePercent: 8.0,
    termDays: 90,
    originationFee: 937.5,
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    maturityDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000).toISOString(),
    repaymentSchedule: SEED_LOAN_REPAYMENTS,
    totalRepaid: 0,
    status: "active",
    xrplLoanHash: "E8F1A4B7C0D3E6F9A2B5C8D1E4F7A0B3C6D9E2F5A8B1C4D7E0F3A6B9C2D5E8F1",
    xrplLoanId: "F1A4B7C0D3E6F9A2B5C8D1E4F7A0B3C6D9E2F5A8B1C4D7E0F3A6B9C2D5E8F1A4",
    underwritingScore: 82,
    underwritingNotes: "Strong infrastructure cashflows; government-backed feed-in tariff contract",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_MPT_ISSUANCES: MPTIssuance[] = [
  {
    id: "mpt-seed-001",
    assetId: "asset-005",
    issuerAddress: "rLDYrujdKUfVTco32gg4nFPFibwCZXzgDt",
    maxAmount: "24000",
    transferFee: 50,
    flags: { canLock: true, requireAuth: true, canEscrow: true, canTrade: true },
    xrplHash: "G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0",
    xrplLedger: 92_188_443,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-seed-001",
    type: "invest",
    assetId: "asset-005",
    assetName: "Munich Logistics Hub",
    tokens: 21,
    price: 100,
    total: 2_100,
    timestamp: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    xrplHash: "A3F9E1B2C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1",
    xrplStatus: "simulated",
    xrplExplorerUrl: "https://testnet.xrpl.org/transactions/A3F9E1B2C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9E0F1",
    xrplLedger: 92_341_187,
    xrplTxType: "EscrowCreate",
    validatorId: "validator-002",
    investmentId: "inv-seed-001",
  },
  {
    id: "tx-seed-002",
    type: "release",
    assetId: "asset-005",
    assetName: "Munich Logistics Hub",
    tokens: 21,
    price: 100,
    total: 2_100,
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    xrplHash: "D7E2F5A8B1C4D7E0F3A6B9C2D5E8F1A4B7C0D3E6F9A2B5C8D1E4F7A0B3C6D9E2",
    xrplStatus: "simulated",
    xrplExplorerUrl: "https://testnet.xrpl.org/transactions/D7E2F5A8B1C4D7E0F3A6B9C2D5E8F1A4B7C0D3E6F9A2B5C8D1E4F7A0B3C6D9E2",
    xrplLedger: 92_512_904,
    xrplTxType: "EscrowFinish",
    validatorId: "validator-002",
    validatorFee: 21,
    investmentId: "inv-seed-001",
  },
  {
    id: "tx-seed-003",
    type: "mpt-issuance",
    assetId: "asset-005",
    assetName: "Munich Logistics Hub",
    tokens: 24000,
    price: 100,
    total: 2_400_000,
    timestamp: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    xrplHash: "G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0",
    xrplStatus: "simulated",
    xrplExplorerUrl: "https://testnet.xrpl.org/transactions/G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0",
    xrplLedger: 92_188_443,
    xrplTxType: "MPTokenIssuanceCreate",
  },
  {
    id: "tx-seed-004",
    type: "loan-originate",
    assetId: "asset-002",
    assetName: "Solar Farm Alpha",
    tokens: 0,
    price: 0,
    total: 125_000,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    xrplHash: "E8F1A4B7C0D3E6F9A2B5C8D1E4F7A0B3C6D9E2F5A8B1C4D7E0F3A6B9C2D5E8F1",
    xrplStatus: "simulated",
    xrplExplorerUrl: "https://testnet.xrpl.org/transactions/E8F1A4B7C0D3E6F9A2B5C8D1E4F7A0B3C6D9E2F5A8B1C4D7E0F3A6B9C2D5E8F1",
    xrplLedger: 93_012_561,
    xrplTxType: "LoanSet",
    brokerId: "broker-002",
    loanId: "loan-seed-001",
  },
];

const INITIAL_STATE: PortfolioState = {
  usdcBalance: 50_000,
  holdings: SEED_HOLDINGS,
  investments: SEED_INVESTMENTS,
  loans: SEED_LOANS,
  loanBrokers: LOAN_BROKERS,
  mptIssuances: SEED_MPT_ISSUANCES,
  transactions: SEED_TRANSACTIONS,
  assets: MOCK_ASSETS,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      // ── INVEST (EscrowCreate) ───────────────────────────────────────────────

      invest: (assetId, amount, xrpl, tonAddress?) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };
        if (asset.fundingStatus !== "open") return { success: false, error: "Not accepting investments" };
        if (new Date(asset.fundingDeadline) < new Date()) return { success: false, error: "Funding deadline has passed" };
        if (amount > state.usdcBalance) return { success: false, error: "Insufficient USDC balance" };
        if (amount < asset.minInvestment) return { success: false, error: `Minimum investment is $${asset.minInvestment}` };

        const tokens = Math.floor(amount / asset.tokenPrice);
        const investmentId = `inv-${generateId()}`;

        const investment: Investment = {
          id: investmentId,
          assetId,
          assetName: asset.name,
          amount,
          tokens,
          tokenPrice: asset.tokenPrice,
          status: "locked",
          xrplEscrowHash: xrpl.hash,
          xrplEscrowSequence: xrpl.escrowSequence,
          timestamp: new Date().toISOString(),
        };

        const newAmountRaised = asset.amountRaised + amount;
        const isFunded = newAmountRaised >= asset.fundingTarget;
        const updatedAssets = state.assets.map((a) =>
          a.id === assetId
            ? { ...a, amountRaised: newAmountRaised, fundingStatus: isFunded ? ("funded" as const) : a.fundingStatus, investorCount: a.investorCount + 1 }
            : a
        );

        const tx: Transaction = {
          id: `tx-${generateId()}`,
          type: "invest",
          assetId,
          assetName: asset.name,
          tokens,
          price: asset.tokenPrice,
          total: amount,
          timestamp: new Date().toISOString(),
          xrplHash: xrpl.hash,
          xrplStatus: xrpl.status,
          xrplExplorerUrl: xrpl.explorerUrl,
          xrplLedger: xrpl.ledger,
          xrplTxType: "EscrowCreate",
          investmentId,
          ...(tonAddress && { tonAddress }),
        };

        set({ usdcBalance: state.usdcBalance - amount, investments: [investment, ...state.investments], transactions: [tx, ...state.transactions], assets: updatedAssets });

        // Fire-and-forget Supabase sync
        import("@/lib/supabase/client").then(({ createClient }) =>
          createClient().auth.getUser().then(({ data }) => {
            if (!data.user) return;
            const uid = data.user.id;
            const vaultTag = VAULT_TAGS[assetId];
            saveLendingPosition(uid, investment, vaultTag).catch(console.warn);
            saveTransaction(uid, tx).catch(console.warn);
          })
        );

        return { success: true, investmentId };
      },

      // ── APPROVE & RELEASE (EscrowFinish) ───────────────────────────────────

      approveAndRelease: (assetId, xrpl) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };
        if (asset.fundingStatus === "released" || asset.fundingStatus === "refunded") return { success: false, error: "Already settled" };

        const validator = VALIDATORS.find((v) => v.id === asset.validatorId);
        const feeRate = validator?.feePercentage ?? 1;
        const releasedAt = new Date().toISOString();
        const newTransactions: Transaction[] = [];

        // Lending flow: lenders put up capital, they don't receive tokens.
        // On release, funds go to the asset owner. Lender positions are marked
        // "released" — they will be repaid (principal + interest) when the loan matures.
        const updatedInvestments = state.investments.map((inv) => {
          if (inv.assetId !== assetId || inv.status !== "locked") return inv;
          const fee = Math.round(inv.amount! * (feeRate / 100) * 100) / 100;
          newTransactions.push({
            id: `tx-${generateId()}`, type: "release", assetId, assetName: asset.name,
            tokens: inv.tokens!, price: inv.tokenPrice!, total: inv.amount!, timestamp: releasedAt,
            xrplHash: xrpl.hash, xrplStatus: xrpl.status, xrplExplorerUrl: xrpl.explorerUrl, xrplLedger: xrpl.ledger,
            xrplTxType: "EscrowFinish", validatorId: asset.validatorId, validatorFee: fee, investmentId: inv.id,
          });
          return { ...inv, status: "released" as const, xrplReleaseHash: xrpl.hash, releasedAt, validatorFee: fee };
        });

        set({
          investments: updatedInvestments,
          transactions: [...newTransactions, ...state.transactions],
          assets: state.assets.map((a) => a.id === assetId ? { ...a, fundingStatus: "released" as const, complianceApproved: true } : a),
        });

        // Fire-and-forget Supabase sync
        import("@/lib/supabase/client").then(({ createClient }) =>
          createClient().auth.getUser().then(({ data }) => {
            if (!data.user) return;
            const uid = data.user.id;
            const releasedInvs = updatedInvestments.filter((i) => i.assetId === assetId && i.status === "released");
            releasedInvs.forEach((inv) =>
              updateLendingPosition(uid, inv.id, { status: "released", released_at: releasedAt }).catch(console.warn)
            );
            newTransactions.forEach((tx) => saveTransaction(uid, tx).catch(console.warn));
          })
        );

        return { success: true };
      },

      // ── APPROVE COMPLIANCE ─────────────────────────────────────────────────

      approveCompliance: (assetId) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };
        if (asset.complianceApproved) return { success: true };

        set({
          assets: state.assets.map((a) =>
            a.id === assetId
              ? { ...a, complianceApproved: true, verificationStatus: "verified" as const }
              : a
          ),
        });

        // Fire-and-forget Supabase sync
        import("@/lib/supabase/client").then(({ createClient }) => {
          createClient()
            .from("assets")
            .update({ compliance_approved: true, verification_status: "verified" })
            .eq("id", assetId)
            .then(undefined, console.warn);
        });

        return { success: true };
      },

      // ── REFUND ALL (EscrowCancel) ───────────────────────────────────────────

      refundAll: (assetId, xrpl) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };

        const refundedAt = new Date().toISOString();
        let totalRefunded = 0;
        const newTransactions: Transaction[] = [];

        const updatedInvestments = state.investments.map((inv) => {
          if (inv.assetId !== assetId || (inv.status !== "locked" && inv.status !== "pending")) return inv;
          totalRefunded += inv.amount!;
          newTransactions.push({
            id: `tx-${generateId()}`, type: "refund", assetId, assetName: asset.name,
            tokens: inv.tokens!, price: inv.tokenPrice!, total: inv.amount!, timestamp: refundedAt,
            xrplHash: xrpl.hash, xrplStatus: xrpl.status, xrplExplorerUrl: xrpl.explorerUrl, xrplLedger: xrpl.ledger,
            xrplTxType: "EscrowCancel", validatorId: asset.validatorId, investmentId: inv.id,
          });
          return { ...inv, status: "refunded" as const, xrplCancelHash: xrpl.hash, refundedAt };
        });

        set({
          usdcBalance: state.usdcBalance + totalRefunded,
          investments: updatedInvestments,
          transactions: [...newTransactions, ...state.transactions],
          // Reset asset back to open so new investments are accepted.
          // Individual positions retain status "refunded" in history.
          assets: state.assets.map((a) =>
            a.id === assetId
              ? { ...a, fundingStatus: "open" as const, amountRaised: 0, investorCount: 0 }
              : a
          ),
        });

        // Fire-and-forget Supabase sync
        import("@/lib/supabase/client").then(({ createClient }) =>
          createClient().auth.getUser().then(({ data }) => {
            if (!data.user) return;
            const uid = data.user.id;
            const refundedInvs = updatedInvestments.filter((i) => i.assetId === assetId && i.status === "refunded");
            refundedInvs.forEach((inv) =>
              updateLendingPosition(uid, inv.id, { status: "refunded", released_at: refundedAt }).catch(console.warn)
            );
            newTransactions.forEach((tx) => saveTransaction(uid, tx).catch(console.warn));
          })
        );

        return { success: true };
      },

      // ── MINT MPT (MPTokenIssuanceCreate) ───────────────────────────────────

      mintMPT: (assetId, xrpl) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };
        if (state.mptIssuances.find((m) => m.assetId === assetId))
          return { success: false, error: "MPT already issued for this asset" };

        const issuance: MPTIssuance = {
          id: xrpl.mptIssuanceId,
          assetId,
          issuerAddress: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
          maxAmount: String(asset.tokenSupply),
          transferFee: 50,
          flags: { canLock: true, requireAuth: true, canEscrow: true, canTrade: true },
          xrplHash: xrpl.hash,
          xrplLedger: xrpl.ledger ?? 0,
          createdAt: new Date().toISOString(),
        };

        const tx: Transaction = {
          id: `tx-${generateId()}`, type: "mpt-issuance", assetId, assetName: asset.name,
          tokens: asset.tokenSupply, price: asset.tokenPrice, total: asset.totalValue,
          timestamp: new Date().toISOString(),
          xrplHash: xrpl.hash, xrplStatus: xrpl.status, xrplExplorerUrl: xrpl.explorerUrl,
          xrplLedger: xrpl.ledger, xrplTxType: "MPTokenIssuanceCreate",
        };

        set({
          mptIssuances: [issuance, ...state.mptIssuances],
          transactions: [tx, ...state.transactions],
          assets: state.assets.map((a) => a.id === assetId ? { ...a, mptIssuanceId: xrpl.mptIssuanceId } : a),
        });
        return { success: true };
      },

      // ── ORIGINATE LOAN (LoanSet) ────────────────────────────────────────────

      originateLoan: (assetId, params, xrpl) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };
        const broker = state.loanBrokers.find((b) => b.assetId === assetId);
        if (!broker) return { success: false, error: "No LoanBroker for this asset" };
        if (broker.status !== "active") return { success: false, error: "LoanBroker is not active" };

        const originationFee = (params.principalUsdc * broker.originationFeePercent) / 100;
        const startDate = new Date().toISOString();
        const maturityDate = new Date(Date.now() + params.termDays * 24 * 60 * 60 * 1000).toISOString();

        // Build repayment schedule (3 equal instalments for demo)
        const instalments = 3;
        const annualRate = params.interestRatePercent / 100;
        const periodRate = annualRate * (params.termDays / 365) / instalments;
        const instalment = Math.round(params.principalUsdc * (periodRate / (1 - Math.pow(1 + periodRate, -instalments))) * 100) / 100;
        const principalPerPeriod = Math.round((params.principalUsdc / instalments) * 100) / 100;

        const repaymentSchedule: LoanRepayment[] = Array.from({ length: instalments }, (_, i) => ({
          id: `rep-${generateId()}`,
          amount: instalment,
          principal: principalPerPeriod,
          interest: Math.round((instalment - principalPerPeriod) * 100) / 100,
          dueDate: new Date(Date.now() + ((i + 1) * (params.termDays / instalments)) * 24 * 60 * 60 * 1000).toISOString(),
          status: "due" as const,
        }));

        const loanId = `loan-${generateId()}`;
        const loan: Loan = {
          id: loanId,
          brokerId: broker.id,
          assetId,
          assetName: asset.name,
          borrowerAddress: params.borrowerAddress,
          borrowerTonAddress: params.borrowerTonAddress,
          principal: params.principalUsdc,
          interestRatePercent: params.interestRatePercent,
          termDays: params.termDays,
          originationFee,
          startDate,
          maturityDate,
          repaymentSchedule,
          totalRepaid: 0,
          status: "active",
          xrplLoanHash: xrpl.hash,
          xrplLoanId: xrpl.loanId,
          underwritingScore: 75,
          createdAt: startDate,
          updatedAt: startDate,
        };

        const tx: Transaction = {
          id: `tx-${generateId()}`, type: "loan-originate", assetId, assetName: asset.name,
          tokens: 0, price: 0, total: params.principalUsdc, timestamp: startDate,
          xrplHash: xrpl.hash, xrplStatus: xrpl.status, xrplExplorerUrl: xrpl.explorerUrl,
          xrplLedger: xrpl.ledger, xrplTxType: "LoanSet",
          brokerId: broker.id, loanId,
        };

        const updatedBrokers = state.loanBrokers.map((b) =>
          b.id === broker.id
            ? { ...b, activeLoansCount: b.activeLoansCount + 1, totalOriginated: b.totalOriginated + params.principalUsdc }
            : b
        );

        set({ loans: [loan, ...state.loans], loanBrokers: updatedBrokers, transactions: [tx, ...state.transactions] });

        import("@/lib/supabase/client").then(({ createClient }) =>
          createClient().auth.getUser().then(({ data }) => {
            if (!data.user) return;
            const uid = data.user.id;
            saveLoan(uid, loan).catch(console.warn);
            saveTransaction(uid, tx).catch(console.warn);
          })
        );

        return { success: true, loanId };
      },

      // ── REPAY LOAN (LoanPay) ────────────────────────────────────────────────

      repayLoan: (loanId, repaymentId, xrpl) => {
        const state = get();
        const loan = state.loans.find((l) => l.id === loanId);
        if (!loan) return { success: false, error: "Loan not found" };
        if (loan.status !== "active") return { success: false, error: "Loan is not active" };

        const paidAt = new Date().toISOString();
        let paymentAmount = 0;

        const updatedRepayments = loan.repaymentSchedule.map((r) => {
          if (r.id !== repaymentId || r.status === "paid") return r;
          paymentAmount = r.amount;
          return { ...r, status: "paid" as const, paidAt, xrplHash: xrpl.hash };
        });

        const newTotalRepaid = loan.totalRepaid + paymentAmount;
        const allPaid = updatedRepayments.every((r) => r.status === "paid");

        const updatedLoans = state.loans.map((l) =>
          l.id === loanId
            ? { ...l, repaymentSchedule: updatedRepayments, totalRepaid: newTotalRepaid, status: allPaid ? ("repaid" as const) : l.status, updatedAt: paidAt }
            : l
        );

        const tx: Transaction = {
          id: `tx-${generateId()}`, type: "loan-repay", assetId: loan.assetId, assetName: loan.assetName,
          tokens: 0, price: 0, total: paymentAmount, timestamp: paidAt,
          xrplHash: xrpl.hash, xrplStatus: xrpl.status, xrplExplorerUrl: xrpl.explorerUrl,
          xrplLedger: xrpl.ledger, xrplTxType: "LoanPay",
          brokerId: loan.brokerId, loanId,
        };

        const updatedLoan = updatedLoans.find((l) => l.id === loanId)!;
        if (allPaid) {
          const updatedBrokers = state.loanBrokers.map((b) =>
            b.id === loan.brokerId ? { ...b, activeLoansCount: Math.max(0, b.activeLoansCount - 1) } : b
          );
          set({ loans: updatedLoans, loanBrokers: updatedBrokers, transactions: [tx, ...state.transactions], usdcBalance: state.usdcBalance - paymentAmount });
        } else {
          set({ loans: updatedLoans, transactions: [tx, ...state.transactions], usdcBalance: state.usdcBalance - paymentAmount });
        }

        import("@/lib/supabase/client").then(({ createClient }) =>
          createClient().auth.getUser().then(({ data }) => {
            if (!data.user) return;
            const uid = data.user.id;
            updateLoan(uid, loanId, {
              status: updatedLoan.status,
              total_repaid: updatedLoan.totalRepaid,
              repayment_schedule: updatedLoan.repaymentSchedule,
              updated_at: paidAt,
            }).catch(console.warn);
            saveTransaction(uid, tx).catch(console.warn);
          })
        );

        return { success: true };
      },

      // ── EXPIRE DEADLINES ───────────────────────────────────────────────────
      // Call on app load or periodically. Finds all "open" assets past their
      // fundingDeadline, marks them "expired", and auto-refunds locked escrows.

      expireDeadlines: () => {
        const state = get();
        const now = new Date();
        let expiredCount = 0;
        let totalRefunded = 0;
        const newTransactions: Transaction[] = [];

        const expiredAt = now.toISOString();
        const expiredAssetIds = state.assets
          .filter((a) => a.fundingStatus === "open" && new Date(a.fundingDeadline) < now)
          .map((a) => a.id);

        if (expiredAssetIds.length === 0) return { expiredCount: 0, refundedAmount: 0 };

        const updatedInvestments = state.investments.map((inv) => {
          if (!expiredAssetIds.includes(inv.assetId)) return inv;
          if (inv.status !== "locked" && inv.status !== "pending") return inv;
          totalRefunded += inv.amount!;
          const asset = state.assets.find((a) => a.id === inv.assetId)!;
          newTransactions.push({
            id: `tx-${generateId()}`,
            type: "refund",
            assetId: inv.assetId,
            assetName: inv.assetName,
            tokens: inv.tokens!,
            price: inv.tokenPrice!,
            total: inv.amount!,
            timestamp: expiredAt,
            xrplTxType: "EscrowCancel",
            xrplStatus: "simulated",
            xrplHash: undefined,
            xrplExplorerUrl: undefined,
            validatorId: asset.validatorId,
            investmentId: inv.id,
          });
          return { ...inv, status: "refunded" as const, refundedAt: expiredAt };
        });

        const updatedAssets = state.assets.map((a) => {
          if (!expiredAssetIds.includes(a.id)) return a;
          expiredCount++;
          return { ...a, fundingStatus: "expired" as const };
        });

        set({
          assets: updatedAssets,
          investments: updatedInvestments,
          usdcBalance: state.usdcBalance + totalRefunded,
          transactions: newTransactions.length > 0
            ? [...newTransactions, ...state.transactions]
            : state.transactions,
        });

        return { expiredCount, refundedAmount: totalRefunded };
      },

      // ── LEGACY BUY/SELL ────────────────────────────────────────────────────

      buyAsset: (assetId, tokenAmount, xrpl?, tonAddress?) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };
        const totalCost = tokenAmount * asset.tokenPrice;
        if (totalCost > state.usdcBalance) return { success: false, error: "Insufficient USDC balance" };
        if (tokenAmount <= 0) return { success: false, error: "Invalid token amount" };

        const existingHolding = state.holdings.find((h) => h.assetId === assetId);
        let updatedHoldings: Holding[];
        if (existingHolding) {
          const totalTokens = existingHolding.tokens + tokenAmount;
          const newAvg = (existingHolding.tokens * existingHolding.avgBuyPrice + tokenAmount * asset.tokenPrice) / totalTokens;
          updatedHoldings = state.holdings.map((h) => h.assetId === assetId ? { ...h, tokens: totalTokens, avgBuyPrice: newAvg } : h);
        } else {
          updatedHoldings = [...state.holdings, { assetId, tokens: tokenAmount, avgBuyPrice: asset.tokenPrice, purchasedAt: new Date().toISOString() }];
        }

        const tx: Transaction = {
          id: `tx-${generateId()}`, type: "buy", assetId, assetName: asset.name,
          tokens: tokenAmount, price: asset.tokenPrice, total: totalCost, timestamp: new Date().toISOString(),
          ...(xrpl && { xrplHash: xrpl.hash, xrplStatus: xrpl.status, xrplExplorerUrl: xrpl.explorerUrl, xrplLedger: xrpl.ledger, xrplTxType: "Payment" }),
          ...(tonAddress && { tonAddress }),
        };

        set({ usdcBalance: state.usdcBalance - totalCost, holdings: updatedHoldings, transactions: [tx, ...state.transactions] });
        return { success: true };
      },

      sellAsset: (assetId, tokenAmount, tonAddress?) => {
        const state = get();
        const asset = state.assets.find((a) => a.id === assetId);
        if (!asset) return { success: false, error: "Asset not found" };
        const holding = state.holdings.find((h) => h.assetId === assetId);
        if (!holding || holding.tokens < tokenAmount) return { success: false, error: "Insufficient tokens" };
        const saleProceeds = tokenAmount * asset.tokenPrice;
        const updatedHoldings = holding.tokens === tokenAmount
          ? state.holdings.filter((h) => h.assetId !== assetId)
          : state.holdings.map((h) => h.assetId === assetId ? { ...h, tokens: h.tokens - tokenAmount } : h);

        const tx: Transaction = {
          id: `tx-${generateId()}`, type: "sell", assetId, assetName: asset.name,
          tokens: tokenAmount, price: asset.tokenPrice, total: saleProceeds, timestamp: new Date().toISOString(),
          ...(tonAddress && { tonAddress }),
        };

        set({ usdcBalance: state.usdcBalance + saleProceeds, holdings: updatedHoldings, transactions: [tx, ...state.transactions] });
        return { success: true };
      },

      tokenizeAsset: (assetData) => {
        const state = get();
        const newAsset: Asset = { ...assetData, id: `asset-${generateId()}`, fundingStatus: "open", amountRaised: 0, investorCount: 0, complianceApproved: false };
        set({ assets: [...state.assets, newAsset] });
        return newAsset;
      },

      resetPortfolio: () => set(INITIAL_STATE),

      // ── LOAD FROM SUPABASE ─────────────────────────────────────────────────
      // Called by AuthProvider on login. Merges DB data with local seed state.
      // Only adds records not already in the store (avoids overwriting local activity).

      loadFromSupabase: async (userId: string) => {
        try {
          // ── Assets: load from DB, seed on first run ─────────────────────────
          const dbAssets = await loadAssets();
          if (dbAssets.length > 0) {
            set({ assets: dbAssets });
          } else {
            // First ever login — seed all platform assets to DB
            await seedAssets(MOCK_ASSETS);
            set({ assets: MOCK_ASSETS });
          }

          // ── User portfolio ──────────────────────────────────────────────────
          const { investments, loans, transactions } = await loadUserPortfolio(userId);
          if (investments.length === 0 && loans.length === 0 && transactions.length === 0) return;

          set((state) => {
            const existingInvIds = new Set(state.investments.map((i) => i.id));
            const existingLoanIds = new Set(state.loans.map((l) => l.id));
            const existingTxIds = new Set(state.transactions.map((t) => t.id));

            return {
              investments: [...investments.filter((i) => !existingInvIds.has(i.id)), ...state.investments],
              loans: [...loans.filter((l) => !existingLoanIds.has(l.id)), ...state.loans],
              transactions: [...transactions.filter((t) => !existingTxIds.has(t.id)), ...state.transactions],
            };
          });
        } catch (err) {
          console.warn("[Portfolio] loadFromSupabase error:", err);
        }
      },
    }),
    { name: "liquidx-portfolio-v4" }
  )
);

// ─── Selector helpers ─────────────────────────────────────────────────────────

export const selectPendingAssets = (state: PortfolioState) =>
  state.assets.filter((a) => a.fundingStatus === "funded");

export const selectMyInvestments = (state: PortfolioState) =>
  state.investments.filter((i) => i.status === "locked" || i.status === "pending");

export const selectReleasedHoldings = (state: PortfolioState) => state.holdings;

export const selectActiveLoans = (state: PortfolioState) =>
  state.loans.filter((l) => l.status === "active");

export const selectBrokerForAsset = (state: PortfolioState, assetId: string) =>
  state.loanBrokers.find((b) => b.assetId === assetId);
