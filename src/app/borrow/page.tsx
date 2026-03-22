"use client";

import { useState, useMemo } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { useIdentityGate, useIdentityStore, selectDisplayDid, selectXrplAddress, selectDidVerified } from "@/store/identity-store";
import { IdentityGateBanner, VerifiedIdentityPill } from "@/components/identity/IdentityGateBanner";
import { formatCurrency } from "@/lib/utils";
import { repayInstalment, requestLoan } from "@/lib/lending-service";
import { calculateLoanPricing } from "@/lib/loan-pricing";
import { BorrowingPosition, LoanRepayment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Banknote, CheckCircle2, AlertCircle, ExternalLink,
  ChevronDown, ChevronUp, Loader2, Clock, AlertTriangle,
  ArrowRight, CircleDollarSign, Info, Plus, Zap, Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Request Loan Dialog ──────────────────────────────────────────────────────

const TERM_OPTIONS = [
  { days: 30, label: "30 days" },
  { days: 60, label: "60 days" },
  { days: 90, label: "90 days" },
];

function RequestLoanDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { assets, loanBrokers, originateLoan, usdcBalance } = usePortfolioStore();
  const xrplAddress = useIdentityStore(selectXrplAddress);
  const isDidVerified = useIdentityStore(selectDidVerified);

  const eligibleAssets = useMemo(
    () => assets.filter((a) => loanBrokers.some((b) => b.assetId === a.id && b.status === "active")),
    [assets, loanBrokers]
  );

  const [assetId, setAssetId] = useState(eligibleAssets[0]?.id ?? "");
  const [principal, setPrincipal] = useState("10000");
  const [termDays, setTermDays] = useState(60);
  const [step, setStep] = useState<"form" | "processing" | "success" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [txHash, setTxHash] = useState("");

  const selectedAsset = assets.find((a) => a.id === assetId);
  const principalNum = Math.max(0, parseFloat(principal) || 0);
  const pricing = useMemo(
    () => selectedAsset ? calculateLoanPricing(selectedAsset.category, termDays, 10) : null,
    [selectedAsset, termDays]
  );

  const handleClose = () => {
    if (step === "processing") return;
    setStep("form");
    setErrorMsg("");
    setTxHash("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!xrplAddress || !selectedAsset || principalNum <= 0) return;
    setStep("processing");
    setErrorMsg("");

    const svc = await requestLoan({
      borrowerAddress: xrplAddress,
      principalUsdc: principalNum,
      interestRatePercent: pricing?.interestRate ?? 8,
      termDays,
      isDidVerified: isDidVerified ?? false,
    });

    if (!svc.ok) {
      setErrorMsg(svc.error ?? "Loan request failed");
      setStep("error");
      return;
    }

    const result = originateLoan(
      assetId,
      {
        borrowerAddress: xrplAddress,
        principalUsdc: principalNum,
        interestRatePercent: pricing?.interestRate ?? 8,
        termDays,
      },
      {
        hash: svc.xrpl!.hash,
        status: svc.xrpl!.status,
        explorerUrl: svc.xrpl!.explorerUrl,
        ledger: svc.xrpl!.ledger,
        txType: "LoanSet",
        loanId: svc.data!.loanId,
      }
    );

    if (!result.success) {
      setErrorMsg(result.error ?? "Failed to save loan");
      setStep("error");
      return;
    }

    setTxHash(svc.data!.xrplHash);
    setStep("success");
  };

  const riskColor = { Low: "text-emerald-400", Medium: "text-yellow-400", High: "text-red-400" };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Request a Loan
          </DialogTitle>
          <DialogDescription>
            Borrow USDC against a tokenized asset. Fixed rate, on-chain settlement.
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-4">
            {eligibleAssets.length === 0 ? (
              <div className="rounded-xl border border-white/8 bg-white/3 p-4 text-center text-sm text-white/50">
                No eligible assets. <Link href="/tokenize" className="text-primary hover:underline">Tokenize an asset first.</Link>
              </div>
            ) : (
              <>
                {/* Asset selector */}
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Collateral Asset</label>
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full h-9 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none cursor-pointer"
                  >
                    {eligibleAssets.map((a) => (
                      <option key={a.id} value={a.id} className="bg-[#0d0d0d]">{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Principal */}
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Loan Amount (USDC)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="10000"
                      className="pl-7 font-mono"
                      value={principal}
                      onChange={(e) => setPrincipal(e.target.value)}
                      min={100}
                    />
                  </div>
                </div>

                {/* Term */}
                <div>
                  <label className="text-sm font-medium text-white mb-1.5 block">Loan Term</label>
                  <div className="flex gap-2">
                    {TERM_OPTIONS.map((t) => (
                      <button
                        key={t.days}
                        onClick={() => setTermDays(t.days)}
                        className={cn(
                          "flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition-all",
                          termDays === t.days
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-white/10 bg-white/4 text-white/50 hover:text-white"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing summary */}
                {pricing && (
                  <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Interest rate</span>
                      <span className="font-mono font-semibold text-primary">{pricing.interestRate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Risk level</span>
                      <span className={cn("font-semibold text-xs", riskColor[pricing.riskLevel])}>{pricing.riskLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Loan amount</span>
                      <span className="font-mono text-white">{formatCurrency(principalNum)}</span>
                    </div>
                    <div className="border-t border-white/8 pt-2 flex justify-between">
                      <span className="text-white/40">Est. total interest</span>
                      <span className="font-mono text-yellow-400">
                        {formatCurrency(principalNum * (pricing.interestRate / 100) * (termDays / 365))}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 rounded-xl bg-blue-500/8 border border-blue-500/20 px-3 py-2 text-xs text-blue-400">
                  <Zap className="h-3.5 w-3.5 shrink-0" />
                  Loan terms are recorded on XRPL. Approval takes 24–48 hours.
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
                  <Button
                    className="flex-1"
                    disabled={!xrplAddress || principalNum <= 0 || !assetId}
                    onClick={handleSubmit}
                  >
                    Submit Request <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              <Loader2 className="absolute -inset-1 h-16 w-16 animate-spin text-primary/20" />
            </div>
            <div>
              <p className="font-semibold text-white">Submitting to XRPL…</p>
              <p className="text-sm text-white/40 mt-1">Verifying DID and recording LoanSet transaction</p>
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <p className="text-lg font-bold text-white">Loan Request Submitted!</p>
              <p className="text-sm text-white/40">Your request is pending validator approval (24–48 hours).</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Amount</span>
                <span className="font-mono text-white">{formatCurrency(principalNum)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Rate</span>
                <span className="font-mono text-primary">{pricing?.interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Term</span>
                <span className="font-mono text-white">{termDays} days</span>
              </div>
            </div>
            {txHash && (
              <a
                href={`https://devnet.xrpl.org/transactions/${txHash}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />View LoanSet on XRPL
              </a>
            )}
            <Button className="w-full" onClick={handleClose}>
              <Check className="h-4 w-4" /> Done
            </Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div>
              <p className="font-semibold text-white">Request Failed</p>
              <p className="text-sm text-white/40 mt-1">{errorMsg}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setStep("form")}>Try Again</Button>
              <Button variant="ghost" className="flex-1" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
  const { status: gateStatus } = useIdentityGate();
  const displayDid = useIdentityStore(selectDisplayDid);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);

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

        {/* Identity gate */}
        <IdentityGateBanner status={gateStatus} action="request a loan" />
        {gateStatus === "ready" && displayDid && (
          <VerifiedIdentityPill displayDid={displayDid} />
        )}

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
              Select a tokenized asset as collateral and submit a loan request. Approval takes 24–48 hours.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              disabled={gateStatus !== "ready"}
              onClick={() => setLoanDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Request a Loan
            </Button>
            <Link href="/tokenize">
              <Button variant="outline">
                Tokenize asset <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
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

      <RequestLoanDialog open={loanDialogOpen} onClose={() => setLoanDialogOpen(false)} />
    </div>
  );
}
