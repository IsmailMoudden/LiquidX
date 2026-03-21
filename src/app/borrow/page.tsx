"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { repayInstalment } from "@/lib/lending-service";
import { BorrowingPosition, LoanRepayment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Banknote, CheckCircle2, AlertCircle, ExternalLink,
  ChevronDown, ChevronUp, Loader2, Clock, AlertTriangle,
  ArrowRight, CircleDollarSign, Shield, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Repayment row ────────────────────────────────────────────────────────────

function RepaymentRow({
  loan,
  repayment,
  onPay,
  paying,
}: {
  loan: BorrowingPosition;
  repayment: LoanRepayment;
  onPay: (repaymentId: string) => void;
  paying: boolean;
}) {
  const isOverdue = repayment.status === "due" && new Date(repayment.dueDate) < new Date();
  return (
    <div className={cn(
      "flex items-center gap-4 rounded-xl border px-4 py-3 text-sm",
      repayment.status === "paid"
        ? "border-emerald-500/20 bg-emerald-500/5"
        : isOverdue
        ? "border-red-500/20 bg-red-500/5"
        : "border-white/8 bg-white/2"
    )}>
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium",
          repayment.status === "paid" ? "text-emerald-400" : isOverdue ? "text-red-400" : "text-white"
        )}>
          Due {new Date(repayment.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <p className="text-xs text-white/40 mt-0.5">
          Principal {formatCurrency(repayment.principal)} + Interest {formatCurrency(repayment.interest)}
        </p>
        {repayment.xrplHash && (
          <a
            href={`https://devnet.xrpl.org/transactions/${repayment.xrplHash}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5"
          >
            <ExternalLink className="h-2.5 w-2.5" />View payment on XRPL
          </a>
        )}
      </div>
      <span className="font-mono font-semibold text-white">{formatCurrency(repayment.amount)}</span>
      {repayment.status === "paid" ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
      ) : (
        <Button
          size="sm"
          disabled={paying}
          variant={isOverdue ? "destructive" : "outline"}
          className={cn(
            "shrink-0 text-xs h-7 px-3",
            !isOverdue && "border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
          )}
          onClick={() => onPay(repayment.id)}
        >
          {paying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Pay now"}
        </Button>
      )}
    </div>
  );
}

// ─── Loan card ────────────────────────────────────────────────────────────────

function LoanCard({ loan }: { loan: BorrowingPosition }) {
  const [expanded, setExpanded] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const { repayLoan } = usePortfolioStore();

  const paidCount = loan.repaymentSchedule.filter((r) => r.status === "paid").length;
  const progress = loan.repaymentSchedule.length > 0
    ? (paidCount / loan.repaymentSchedule.length) * 100
    : 0;
  const nextDue = loan.repaymentSchedule.find((r) => r.status !== "paid");
  const isLate = nextDue && new Date(nextDue.dueDate) < new Date() && loan.status === "active";

  const handlePay = async (repaymentId: string) => {
    const repayment = loan.repaymentSchedule.find((r) => r.id === repaymentId);
    if (!repayment) return;
    setPaying(true);
    setPayingId(repaymentId);
    setError("");
    setSuccessMsg("");
    const svc = await repayInstalment({
      loanId: loan.xrplLoanId ?? loan.id,
      borrowerAddress: loan.borrowerAddress,
      amountUsdc: repayment.amount,
      principal: repayment.principal,
      interest: repayment.interest,
    });
    if (!svc.ok) { setError(svc.error ?? "Payment failed"); setPaying(false); setPayingId(null); return; }
    const result = repayLoan(loan.id, repaymentId, {
      hash: svc.xrpl!.hash,
      status: svc.xrpl!.status,
      explorerUrl: svc.xrpl!.explorerUrl,
      ledger: svc.xrpl!.ledger,
      txType: "LoanPay",
    });
    if (!result.success) { setError(result.error ?? "Payment failed"); }
    else { setSuccessMsg("Payment confirmed."); setTimeout(() => setSuccessMsg(""), 4000); }
    setPaying(false);
    setPayingId(null);
  };

  const statusConfig = {
    requested: { label: "Pending approval", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    active: { label: isLate ? "Payment overdue" : "Active", color: isLate ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    repaid: { label: "Fully repaid", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    late: { label: "Payment overdue", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    defaulted: { label: "In default", color: "text-red-400 bg-red-500/10 border-red-500/20" },
    cancelled: { label: "Cancelled", color: "text-white/30 bg-white/4 border-white/8" },
  };
  const st = statusConfig[loan.status] ?? statusConfig.active;

  return (
    <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden">
      <div className="p-5 flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
          <Banknote className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm">{loan.assetName}</p>
            <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", st.color)}>
              {st.label}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Started {new Date(loan.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            {" · "}Matures {new Date(loan.maturityDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <button onClick={() => setExpanded((v) => !v)} className="text-white/30 hover:text-white shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-4 divide-x divide-white/6 border-t border-white/6">
        {[
          { label: "Borrowed", value: formatCurrency(loan.principal), color: "text-white" },
          { label: "Rate", value: `${loan.interestRatePercent}% p.a.`, color: "text-primary" },
          { label: "Term", value: `${loan.termDays} days`, color: "text-white" },
          { label: "Remaining", value: formatCurrency(loan.remainingBalance ?? loan.principal - loan.totalRepaid), color: loan.status === "repaid" ? "text-emerald-400" : "text-yellow-400" },
        ].map((s) => (
          <div key={s.label} className="px-4 py-3">
            <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">{s.label}</p>
            <p className={cn("text-sm font-semibold font-mono", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Repayment progress */}
      <div className="px-5 py-3 border-t border-white/6">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-white/40">{paidCount} of {loan.repaymentSchedule.length} payments made</span>
          <span className="text-white/40">{progress.toFixed(0)}% repaid</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Expanded schedule */}
      {expanded && (
        <div className="border-t border-white/8 p-5 space-y-3">
          <p className="text-xs text-white/30 uppercase tracking-wide mb-3">Payment Schedule</p>
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/5 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />{error}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-3 py-2 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />{successMsg}
            </div>
          )}
          {loan.repaymentSchedule.map((r) => (
            <RepaymentRow
              key={r.id}
              loan={loan}
              repayment={r}
              onPay={handlePay}
              paying={paying && payingId === r.id}
            />
          ))}
          {loan.xrplLoanHash && (
            <a
              href={`https://devnet.xrpl.org/transactions/${loan.xrplLoanHash}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary hover:underline pt-2"
            >
              <ExternalLink className="h-3 w-3" />View loan agreement on XRPL
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BorrowPage() {
  const { borrowingPositions, loans, assets } = usePortfolioStore();

  // Use borrowingPositions if available, fall back to loans alias
  const myLoans = (borrowingPositions?.length ? borrowingPositions : loans) ?? [];
  const activeLoans = myLoans.filter((l) => l.status === "active" || l.status === "late");
  const pendingLoans = myLoans.filter((l) => l.status === "requested");
  const closedLoans = myLoans.filter((l) => l.status === "repaid" || l.status === "defaulted" || l.status === "cancelled");

  const totalBorrowed = activeLoans.reduce((s, l) => s + l.principal, 0);
  const totalRemaining = activeLoans.reduce((s, l) => s + (l.remainingBalance ?? l.principal - l.totalRepaid), 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#060606]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary uppercase tracking-widest mb-4">
                Borrow
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Loans</h1>
              <p className="text-white/40 text-sm">
                Borrow against your tokenized assets. Fixed terms. No surprises.
              </p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Total borrowed</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalBorrowed)}</p>
              </div>
              <div className="w-px bg-white/8" />
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Still owed</p>
                <p className="text-xl font-bold text-yellow-400">{formatCurrency(totalRemaining)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* How borrowing works */}
        <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-5">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white mb-1">How borrowing works</p>
              <p className="text-sm text-white/50 leading-relaxed">
                To borrow, you first tokenize a real-world asset on LiquidX. That asset becomes your collateral.
                A validator reviews the deal. Once approved, funds are released from escrow directly to you.
                You repay on a fixed schedule — every payment is recorded on XRPL.
              </p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {[
                  "1. Tokenize your asset",
                  "2. Request a loan",
                  "3. Validator approves",
                  "4. Receive funds",
                  "5. Repay on schedule",
                ].map((step, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs text-white/50 bg-white/4 border border-white/8 rounded-lg px-2.5 py-1">
                    {i < 4 && <ArrowRight className="h-3 w-3 text-primary" />}
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Request new loan CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 shrink-0">
            <Banknote className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">Need to borrow against an asset?</p>
            <p className="text-sm text-white/50 mt-0.5">
              Tokenize your asset first, then submit a loan request. Typical approval takes 24–48 hours.
            </p>
          </div>
          <Link href="/tokenize">
            <Button className="shrink-0">
              Tokenize an asset <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Pending loans */}
        {pendingLoans.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-yellow-400" />
              <p className="text-sm font-medium text-white">Awaiting approval ({pendingLoans.length})</p>
            </div>
            <div className="space-y-4">
              {pendingLoans.map((l) => <LoanCard key={l.id} loan={l} />)}
            </div>
          </section>
        )}

        {/* Active loans */}
        {activeLoans.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Banknote className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-white">Active loans ({activeLoans.length})</p>
            </div>
            <div className="space-y-4">
              {activeLoans.map((l) => <LoanCard key={l.id} loan={l} />)}
            </div>
          </section>
        )}

        {/* Empty state */}
        {myLoans.length === 0 && (
          <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-16 text-center">
            <CircleDollarSign className="h-10 w-10 text-white/20 mx-auto mb-4" />
            <p className="font-semibold text-white mb-1">No active loans</p>
            <p className="text-white/40 text-sm mb-6">
              Tokenize an asset to start borrowing against it.
            </p>
            <Link href="/tokenize">
              <Button variant="outline">Tokenize an asset</Button>
            </Link>
          </div>
        )}

        {/* Closed loans */}
        {closedLoans.length > 0 && (
          <section>
            <p className="text-xs text-white/30 uppercase tracking-wide mb-4">Past loans</p>
            <div className="space-y-4">
              {closedLoans.map((l) => <LoanCard key={l.id} loan={l} />)}
            </div>
          </section>
        )}

        {/* What happens if you don't repay */}
        <div className="rounded-xl border border-orange-500/15 bg-orange-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white mb-1">What happens if you miss a payment?</p>
              <p className="text-sm text-white/50 leading-relaxed">
                A missed payment triggers a grace period. If not resolved, the validator may initiate enforcement against your tokenized collateral.
                Your XRPL account and all on-chain records are permanent — defaults are visible to all future lenders on this platform.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
