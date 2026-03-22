"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { TransactionList } from "@/components/portfolio/TransactionList";
import { InvestmentStatusBadge } from "@/components/assets/EscrowStatusBadge";
import { repayInstalment } from "@/lib/lending-service";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  Banknote,
  BarChart3,
  ArrowUpDown,
  Lock,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Coins,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// ─── Tab type ─────────────────────────────────────────────────────────────────

type Tab = "lending" | "loans" | "assets";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status: string) {
  if (status === "active") return "text-emerald-400";
  if (status === "repaid") return "text-white/40";
  if (status === "late") return "text-orange-400";
  if (status === "defaulted") return "text-red-400";
  if (status === "requested") return "text-blue-400";
  return "text-white/40";
}

function statusLabel(status: string) {
  if (status === "active") return "Active";
  if (status === "repaid") return "Fully Repaid";
  if (status === "late") return "Late";
  if (status === "defaulted") return "Defaulted";
  if (status === "requested") return "Pending approval";
  if (status === "cancelled") return "Cancelled";
  return status;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { holdings, assets, transactions, investments, loans, repayLoan } =
    usePortfolioStore();

  const [tab, setTab] = useState<Tab>("lending");
  const [expandedLoan, setExpandedLoan] = useState<string | null>(null);
  // Loan payment state: tracks which repayment is in-flight and which loan is being settled
  const [payingRepaymentId, setPayingRepaymentId] = useState<string | null>(null);
  const [loanPayError, setLoanPayError] = useState<Record<string, string>>({});
  const [loanPaySuccess, setLoanPaySuccess] = useState<Record<string, string>>({});

  // ── Summary stats ──────────────────────────────────────────────────────────

  const lendingPositions = investments;
  const borrowingPositions = loans;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posAmount = (p: any) => p.amount ?? p.amountDeposited ?? 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posDate = (p: any) => p.timestamp ?? p.depositedAt ?? "";

  const totalLent = lendingPositions.reduce((s, i) => s + posAmount(i), 0);
  const totalEarnedYield = lendingPositions.reduce(
    (s, i) => s + ((i as any).earnedYield ?? 0),
    0
  );
  const lockedCount = lendingPositions.filter(
    (i) => i.status === "locked" || i.status === "pending"
  ).length;

  const totalBorrowed = borrowingPositions.reduce(
    (s, l) => s + l.principal,
    0
  );
  const totalRemaining = borrowingPositions
    .filter((l) => l.status === "active" || l.status === "late")
    .reduce((s, l) => s + Math.max(0, l.remainingBalance ?? (l.principal - l.totalRepaid)), 0);

  const totalHoldingsValue = holdings.reduce((sum, h) => {
    const asset = assets.find((a) => a.id === h.assetId);
    return sum + h.tokens * (asset?.tokenPrice ?? 0);
  }, 0);


  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "lending", label: "My Lending", count: lendingPositions.length },
    { id: "loans", label: "My Loans", count: borrowingPositions.length },
    { id: "assets", label: "My Assets", count: holdings.length },
  ];

  const handlePayInstalment = async (loan: (typeof borrowingPositions)[number], repaymentId: string) => {
    const repayment = loan.repaymentSchedule.find((r) => r.id === repaymentId);
    if (!repayment) return;
    setPayingRepaymentId(repaymentId);
    setLoanPayError((e) => ({ ...e, [loan.id]: "" }));
    const svc = await repayInstalment({
      loanId: loan.xrplLoanId ?? loan.id,
      borrowerAddress: loan.borrowerAddress,
      amountUsdc: repayment.amount,
      principal: repayment.principal,
      interest: repayment.interest,
    });
    if (!svc.ok) {
      setLoanPayError((e) => ({ ...e, [loan.id]: svc.error ?? "Payment failed" }));
    } else {
      repayLoan(loan.id, repaymentId, {
        hash: svc.xrpl!.hash, status: svc.xrpl!.status,
        explorerUrl: svc.xrpl!.explorerUrl, ledger: svc.xrpl!.ledger, txType: "LoanPay",
      });
      setLoanPaySuccess((s) => ({ ...s, [loan.id]: "Payment confirmed." }));
      setTimeout(() => setLoanPaySuccess((s) => ({ ...s, [loan.id]: "" })), 4000);
    }
    setPayingRepaymentId(null);
  };


  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-white/40">
          Your lending positions, active loans, and tokenized asset holdings
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Active loans
          </p>
          <p className="text-xl font-bold font-mono text-white">
            {formatCurrency(totalLent)}
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            {lockedCount} locked in escrow
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
            <Banknote className="h-3.5 w-3.5" /> Borrowed
          </p>
          <p className="text-xl font-bold font-mono text-white">
            {formatCurrency(totalRemaining)}
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            {borrowingPositions.filter((l) => l.status === "active").length}{" "}
            active loan{borrowingPositions.filter((l) => l.status === "active").length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4">
          <p className="text-xs text-white/40 mb-1 flex items-center gap-1">
            <Coins className="h-3.5 w-3.5" /> Token Holdings
          </p>
          <p className="text-xl font-bold font-mono text-white">
            {formatCurrency(totalHoldingsValue)}
          </p>
          <p className="text-xs text-white/30 mt-0.5">
            {holdings.length} asset{holdings.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-xl border border-white/8 bg-[#0d0d0d] p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-primary text-black"
                : "text-white/50 hover:text-white"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-xs rounded-full px-1.5 py-0 ${
                  tab === t.id
                    ? "bg-black/20 text-black"
                    : "bg-white/10 text-white/50"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── MY LENDING ──────────────────────────────────────────────────────── */}
      {tab === "lending" && (
        <div className="space-y-4">
          {lendingPositions.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-12 text-center">
              <TrendingUp className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 mb-4">No lending positions yet</p>
              <Link
                href="/lend"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90 transition-colors"
              >
                Browse Loan Pools
              </Link>
            </div>
          ) : (
            <>
              {/* Summary row */}
              {totalEarnedYield > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-3 flex items-center justify-between">
                  <span className="text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Total yield earned across all positions
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    +{formatCurrency(totalEarnedYield)}
                  </span>
                </div>
              )}

              {lendingPositions.map((pos) => {
                const asset = assets.find((a) => a.id === pos.assetId);
                const isLocked =
                  pos.status === "locked" || pos.status === "pending";
                const isReleased = pos.status === "released";
                return (
                  <div
                    key={pos.id}
                    className={`rounded-2xl border bg-[#0d0d0d] p-5 ${
                      isLocked
                        ? "border-yellow-500/20"
                        : isReleased
                        ? "border-emerald-500/20"
                        : "border-white/8"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white">
                            {pos.assetName}
                          </p>
                          <InvestmentStatusBadge status={pos.status} />
                        </div>
                        <p className="text-xs text-white/40">
                          Deposited{" "}
                          {new Date(posDate(pos)).toLocaleDateString()} ·{" "}
                          {(pos as any).tokens ?? (pos as any).shares ?? 0} tokens @ ${(pos as any).tokenPrice ?? (pos as any).sharePrice ?? "—"} each
                        </p>
                        {asset && (
                          <p className="text-xs text-white/30 mt-0.5">
                            {formatPercent(asset.projectedYield)} projected
                            yield
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-white text-lg">
                          {formatCurrency(posAmount(pos))}
                        </p>
                        {((pos as any).earnedYield ?? 0) > 0 && (
                          <p className="text-xs text-emerald-400 mt-0.5">
                            +{formatCurrency((pos as any).earnedYield)} earned
                          </p>
                        )}
                      </div>
                    </div>

                    {/* XRPL hashes */}
                    <div className="mt-3 flex flex-wrap gap-3">
                      {pos.xrplEscrowHash && (
                        <a
                          href={`https://devnet.xrpl.org/transactions/${pos.xrplEscrowHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          EscrowCreate: {pos.xrplEscrowHash.slice(0, 14)}…
                        </a>
                      )}
                      {pos.xrplReleaseHash && (
                        <a
                          href={`https://devnet.xrpl.org/transactions/${pos.xrplReleaseHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          EscrowFinish: {pos.xrplReleaseHash.slice(0, 14)}…
                        </a>
                      )}
                      {pos.xrplCancelHash && (
                        <a
                          href={`https://devnet.xrpl.org/transactions/${pos.xrplCancelHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-red-400 hover:underline"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          EscrowCancel: {pos.xrplCancelHash.slice(0, 14)}…
                        </a>
                      )}
                    </div>

                    {isLocked && (
                      <div className="mt-3 rounded-lg bg-yellow-500/5 border border-yellow-500/15 px-3 py-2 text-xs text-yellow-400 flex items-center gap-2">
                        <Lock className="h-3 w-3 shrink-0" />
                        Funds locked in XRPL Escrow — awaiting validator
                        approval to release
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── MY LOANS ────────────────────────────────────────────────────────── */}
      {tab === "loans" && (
        <div className="space-y-4">
          {borrowingPositions.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-12 text-center">
              <Banknote className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 mb-4">No active loans</p>
              <Link
                href="/borrow"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90 transition-colors"
              >
                Request a Loan
              </Link>
            </div>
          ) : (
            borrowingPositions.map((loan) => {
              const isExpanded = expandedLoan === loan.id;
              const remaining = Math.max(
                0,
                loan.remainingBalance ?? (loan.principal - loan.totalRepaid)
              );
              const nextDue = loan.repaymentSchedule?.find(
                (r) => r.status === "due" || r.status === "overdue"
              );
              const paidCount = loan.repaymentSchedule?.filter(
                (r) => r.status === "paid"
              ).length ?? 0;
              const totalCount = loan.repaymentSchedule?.length ?? 0;

              return (
                <div
                  key={loan.id}
                  className="rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden"
                >
                  {/* Header */}
                  <button
                    onClick={() =>
                      setExpandedLoan(isExpanded ? null : loan.id)
                    }
                    className="w-full text-left p-5 flex items-start justify-between gap-4 hover:bg-white/2 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-white">
                          {loan.assetName}
                        </p>
                        <span
                          className={`text-xs font-medium ${statusColor(
                            loan.status
                          )}`}
                        >
                          {statusLabel(loan.status)}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">
                        {formatPercent(loan.interestRatePercent)} interest ·{" "}
                        {loan.termDays}d term · originated{" "}
                        {new Date(loan.startDate).toLocaleDateString()}
                      </p>
                      {nextDue && (
                        <p className="text-xs text-orange-400 mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Next payment {formatCurrency(nextDue.amount)} due{" "}
                          {new Date(nextDue.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-white text-lg">
                        {formatCurrency(remaining)}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        remaining of {formatCurrency(loan.principal)}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5">
                        {paidCount}/{totalCount} payments
                      </p>
                    </div>
                    <div className="shrink-0 mt-1">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-white/30" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-white/30" />
                      )}
                    </div>
                  </button>

                  {/* Expanded repayment schedule */}
                  {isExpanded && (
                    <div className="border-t border-white/8">
                      {/* Loan detail */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5">
                        {[
                          { label: "Principal", value: formatCurrency(loan.principal) },
                          { label: "Rate", value: formatPercent(loan.interestRatePercent) },
                          { label: "Origination Fee", value: formatCurrency(loan.originationFee) },
                          { label: "Matures", value: new Date(loan.maturityDate).toLocaleDateString() },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-[#0d0d0d] px-5 py-3">
                            <p className="text-xs text-white/40">{label}</p>
                            <p className="text-sm font-mono font-medium text-white mt-0.5">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Repayment schedule */}
                      <div className="p-5">
                        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">
                          Repayment Schedule
                        </h3>
                        <div className="space-y-2">
                          {(loan.repaymentSchedule ?? []).map((r, idx) => {
                            const isPayingThis = payingRepaymentId === r.id;
                            const isFuture = r.status !== "paid" && new Date(r.dueDate) > new Date();
                            return (
                              <div
                                key={r.id}
                                className={`flex items-center gap-4 rounded-lg px-4 py-3 ${
                                  r.status === "paid"
                                    ? "bg-white/2 opacity-50"
                                    : r.status === "overdue"
                                    ? "bg-red-500/5 border border-red-500/15"
                                    : "bg-white/3 border border-white/8"
                                }`}
                              >
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                                    r.status === "paid"
                                      ? "bg-emerald-500/20"
                                      : r.status === "overdue"
                                      ? "bg-red-500/20"
                                      : "bg-white/10"
                                  }`}
                                >
                                  {r.status === "paid" ? (
                                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                  ) : r.status === "overdue" ? (
                                    <AlertCircle className="h-3 w-3 text-red-400" />
                                  ) : (
                                    <span className="text-[10px] text-white/30">{idx + 1}</span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white/50">
                                    Due {new Date(r.dueDate).toLocaleDateString()}
                                    {r.paidAt && (
                                      <span className="text-emerald-400 ml-2">
                                        · Paid {new Date(r.paidAt).toLocaleDateString()}
                                      </span>
                                    )}
                                    {isFuture && r.status !== "paid" && (
                                      <span className="text-primary/60 ml-2 text-[10px]">· upcoming</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-white/30">
                                    {formatCurrency(r.principal)} principal + {formatCurrency(r.interest)} interest
                                  </p>
                                </div>
                                <p className="font-mono font-medium text-white text-sm shrink-0">
                                  {formatCurrency(r.amount)}
                                </p>
                                {r.status !== "paid" && loan.status === "active" && (
                                  <Button
                                    size="sm"
                                    variant={r.status === "overdue" ? "destructive" : "outline"}
                                    className="shrink-0 h-7 px-3 text-xs"
                                    disabled={!!payingRepaymentId}
                                    onClick={() => handlePayInstalment(loan, r.id)}
                                  >
                                    {isPayingThis
                                      ? <Loader2 className="h-3 w-3 animate-spin" />
                                      : isFuture ? "Pay early" : "Pay now"
                                    }
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Feedback messages */}
                        {loanPayError[loan.id] && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/5 border border-red-500/20 px-3 py-2 text-xs text-red-400">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />{loanPayError[loan.id]}
                          </div>
                        )}
                        {loanPaySuccess[loan.id] && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />{loanPaySuccess[loan.id]}
                          </div>
                        )}

                        {/* XRPL loan hash */}
                        {loan.xrplLoanHash && (
                          <a
                            href={`https://devnet.xrpl.org/transactions/${loan.xrplLoanHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-4"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            LoanSet: {loan.xrplLoanHash.slice(0, 16)}…
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── MY ASSETS ───────────────────────────────────────────────────────── */}
      {tab === "assets" && (
        <div className="space-y-5">
          {holdings.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-12 text-center">
              <Coins className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/40 mb-2">No token holdings yet</p>
              <p className="text-xs text-white/25 mb-4">
                Holdings appear here after a validator releases your escrow
                position
              </p>
              <Link
                href="/tokenize"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:bg-primary/90 transition-colors"
              >
                Tokenize an Asset
              </Link>
            </div>
          ) : (
            <>
              <div className="grid lg:grid-cols-3 gap-5">
                {/* Allocation chart */}
                <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
                  <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-white/40" />
                    Allocation
                  </h2>
                  <AllocationChart />
                </div>

                {/* Holdings list */}
                <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-[#0d0d0d] divide-y divide-white/5">
                  <div className="px-5 py-4 border-b border-white/8">
                    <h2 className="font-semibold text-white">
                      Token Holdings
                    </h2>
                  </div>
                  {holdings.map((h) => {
                    const asset = assets.find((a) => a.id === h.assetId);
                    if (!asset) return null;
                    const currentValue = h.tokens * asset.tokenPrice;
                    const pnl =
                      (asset.tokenPrice - h.avgBuyPrice) * h.tokens;
                    const pnlPct =
                      ((asset.tokenPrice - h.avgBuyPrice) /
                        h.avgBuyPrice) *
                      100;
                    return (
                      <div
                        key={h.assetId}
                        className="flex items-center gap-4 px-5 py-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">
                            {asset.name}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">
                            {h.tokens.toLocaleString()} tokens · avg{" "}
                            ${h.avgBuyPrice} · acquired{" "}
                            {new Date(
                              h.purchasedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-mono font-semibold text-white">
                            {formatCurrency(currentValue)}
                          </p>
                          <p
                            className={`text-xs font-mono mt-0.5 ${
                              pnl >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}
                            {formatCurrency(pnl)} (
                            {pnlPct >= 0 ? "+" : ""}
                            {pnlPct.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div className="px-5 py-3 flex justify-between text-sm bg-white/2">
                    <span className="text-white/40">Total value</span>
                    <span className="font-mono font-bold text-white">
                      {formatCurrency(totalHoldingsValue)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Transaction history — always visible */}
      <div className="rounded-2xl border border-white/7 bg-[#0d0d0d] mt-8">
        <div className="p-6 border-b border-white/6 flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-white/40" />
          <h2 className="font-semibold text-white">Transaction History</h2>
          <span className="ml-auto text-xs text-white/30">
            {transactions.length} transactions
          </span>
        </div>
        <div className="p-6">
          <TransactionList />
        </div>
      </div>
    </div>
  );
}
