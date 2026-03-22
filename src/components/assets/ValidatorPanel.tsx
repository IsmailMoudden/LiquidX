"use client";

import { useState } from "react";
import { Asset, Validator } from "@/lib/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { finishXRPLEscrow, cancelXRPLEscrow, repayVaultLoan } from "@/lib/xrpl-client";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, Shield, Loader2, AlertCircle,
  Zap, ExternalLink, Users, Lock, FileCheck, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidatorPanelProps {
  asset: Asset;
  validator: Validator;
}

type ActionState = "idle" | "approving" | "refunding" | "repaying" | "done-approve" | "done-refund" | "done-repay" | "error";

export function ValidatorPanel({ asset, validator }: ValidatorPanelProps) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [lastHash, setLastHash] = useState("");
  const [lastExplorerUrl, setLastExplorerUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [complianceLoading, setComplianceLoading] = useState(false);

  const { approveAndRelease, refundAll, approveCompliance, repayVaultPositions, investments } = usePortfolioStore();

  const lockedInvestments = investments.filter(
    (i) => i.assetId === asset.id && (i.status === "locked" || i.status === "pending")
  );
  const totalLocked = lockedInvestments.reduce((s, i) => s + ((i as any).amount ?? i.amountDeposited ?? 0), 0);
  const validatorFeeAmount = (totalLocked * validator.feePercentage) / 100;
  const issuerProceeds = totalLocked - validatorFeeAmount;

  const canApprove =
    asset.fundingStatus !== "released" &&
    asset.fundingStatus !== "refunded" &&
    asset.complianceApproved &&
    lockedInvestments.length > 0;

  const handleApprove = async () => {
    setActionState("approving");
    console.group(`[ValidatorPanel] Approve & Release — asset: ${asset.id}`);
    console.log("Locked investments to release:", lockedInvestments.map(i => ({
      id: i.id,
      amount: (i as any).amount,
      xrplEscrowSequence: i.xrplEscrowSequence,
      status: i.status,
    })));
    try {
      // Finish every locked escrow on-chain (one EscrowFinish per investment).
      let lastXrpl = null;
      for (const inv of lockedInvestments) {
        const seq = inv.xrplEscrowSequence;
        console.log(`[ValidatorPanel] Finishing escrow for investment ${inv.id} — sequence: ${seq ?? "undefined (will simulate)"}`);
        const xrpl = await finishXRPLEscrow(seq);
        console.log(`[ValidatorPanel] EscrowFinish result:`, { hash: xrpl.hash, status: xrpl.status, explorerUrl: xrpl.explorerUrl });
        lastXrpl = xrpl;
      }

      if (!lastXrpl) {
        setActionState("error");
        setErrorMsg("No locked investments found");
        console.warn("[ValidatorPanel] No locked investments — nothing to release");
        console.groupEnd();
        return;
      }

      setLastHash(lastXrpl.hash);
      setLastExplorerUrl(lastXrpl.explorerUrl);

      console.log(`[ValidatorPanel] Calling approveAndRelease in store for asset: ${asset.id}`);
      const result = approveAndRelease(asset.id, {
        hash: lastXrpl.hash,
        status: lastXrpl.status,
        explorerUrl: lastXrpl.explorerUrl,
        ledger: lastXrpl.ledger,
        txType: "EscrowFinish",
      });
      console.log("[ValidatorPanel] approveAndRelease result:", result);

      if (!result.success) {
        setActionState("error");
        setErrorMsg(result.error ?? "Release failed");
        console.groupEnd();
        return;
      }
      setActionState("done-approve");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ValidatorPanel] handleApprove error:", msg);
      setActionState("error");
      setErrorMsg(msg || "XRPL EscrowFinish failed");
    }
    console.groupEnd();
  };

  const handleRefund = async () => {
    setActionState("refunding");
    try {
      const xrpl = await cancelXRPLEscrow();
      setLastHash(xrpl.hash);
      setLastExplorerUrl(xrpl.explorerUrl);
      const result = refundAll(asset.id, {
        hash: xrpl.hash,
        status: xrpl.status,
        explorerUrl: xrpl.explorerUrl,
        ledger: xrpl.ledger,
        txType: "EscrowCancel",
      });
      if (!result.success) {
        setActionState("error");
        setErrorMsg(result.error ?? "Refund failed");
        return;
      }
      setActionState("done-refund");
    } catch {
      setActionState("error");
      setErrorMsg("XRPL EscrowCancel failed");
    }
  };

  const handleApproveCompliance = async () => {
    setComplianceLoading(true);
    approveCompliance(asset.id);
    setComplianceLoading(false);
  };

  // ── Repayment helpers ─────────────────────────────────────────────────────

  const LOAN_TERM_DAYS = 90;

  const releasedInvestments = investments.filter(
    (i) => i.assetId === asset.id && i.status === "released"
  );

  const repaymentSummary = releasedInvestments.map((inv) => {
    const principal = (inv as any).amount ?? 0;
    const refTs = inv.releasedAt ?? (inv as any).timestamp ?? new Date().toISOString();
    const daysElapsed = Math.max(1, (Date.now() - new Date(refTs).getTime()) / 86_400_000);
    const interest = Math.round(principal * (asset.projectedYield / 100) * (daysElapsed / 365) * 100) / 100;
    return { inv, principal, interest, total: principal + interest };
  });

  const totalPrincipal = repaymentSummary.reduce((s, r) => s + r.principal, 0);
  const totalInterest = repaymentSummary.reduce((s, r) => s + r.interest, 0);
  const totalToRepay = totalPrincipal + totalInterest;

  // Due date = earliest releasedAt + LOAN_TERM_DAYS
  const earliestReleasedAt = releasedInvestments.reduce<string | undefined>((earliest, inv) => {
    const ts = inv.releasedAt ?? (inv as any).timestamp;
    if (!ts) return earliest;
    return !earliest || ts < earliest ? ts : earliest;
  }, undefined);

  const dueDate = earliestReleasedAt
    ? new Date(new Date(earliestReleasedAt).getTime() + LOAN_TERM_DAYS * 86_400_000)
    : null;

  const isOverdue = dueDate ? Date.now() > dueDate.getTime() : false;
  const overdueDays = dueDate
    ? Math.floor((Date.now() - dueDate.getTime()) / 86_400_000)
    : 0;

  const handleRepay = async () => {
    setActionState("repaying");
    console.log(`[ValidatorPanel] Repaying vault assetId ${asset.id}, total: ${totalToRepay}`);
    try {
      const xrpl = await repayVaultLoan(totalToRepay);
      setLastHash(xrpl.hash);
      setLastExplorerUrl(xrpl.explorerUrl);
      const result = repayVaultPositions(asset.id, {
        hash: xrpl.hash,
        status: xrpl.status,
        explorerUrl: xrpl.explorerUrl,
        ledger: xrpl.ledger,
        txType: "Payment",
      });
      if (!result.success) {
        setActionState("error");
        setErrorMsg(result.error ?? "Repayment failed");
        return;
      }
      setActionState("done-repay");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[ValidatorPanel] handleRepay error:", msg);
      setActionState("error");
      setErrorMsg(msg || "XRPL VaultRepay Payment failed");
    }
  };

  // ── Settled views ──────────────────────────────────────────────────────────

  if (actionState === "done-approve") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Funds Released</h3>
        </div>
        <p className="text-sm text-white/50">
          All investor positions have been converted to holdings. Validator fee of{" "}
          {formatCurrency(validatorFeeAmount)} collected.
        </p>
        <a href={lastExplorerUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <ExternalLink className="h-3.5 w-3.5" />
          View EscrowFinish on XRPL Explorer
        </a>
      </div>
    );
  }

  if (actionState === "done-refund") {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-red-400" />
          <h3 className="font-semibold text-white">Funds Refunded</h3>
        </div>
        <p className="text-sm text-white/50">
          All {lockedInvestments.length} investor positions have been refunded.
        </p>
        <a href={lastExplorerUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <ExternalLink className="h-3.5 w-3.5" />
          View EscrowCancel on XRPL Explorer
        </a>
      </div>
    );
  }

  if (actionState === "done-repay") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Loan Repaid</h3>
        </div>
        <p className="text-sm text-white/50">
          {formatCurrency(totalToRepay)} ({formatCurrency(totalPrincipal)} principal +{" "}
          {formatCurrency(totalInterest)} interest) sent to all lenders.
        </p>
        <a href={lastExplorerUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline">
          <ExternalLink className="h-3.5 w-3.5" />
          View Payment on XRPL Explorer
        </a>
      </div>
    );
  }

  // ── Active panel ───────────────────────────────────────────────────────────

  return (
    <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">Settlement Validator</h3>
          <p className="text-xs text-white/40">{validator.name} · {validator.organization}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Active</span>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Conditions checklist */}
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wide mb-3">Release Conditions</p>
          <div className="space-y-2">
            <ConditionRow
              met={asset.amountRaised > 0}
              label="Capital raised"
              value={`${formatCurrency(asset.amountRaised, true)} / ${formatCurrency(asset.fundingTarget, true)}`}
            />
            <ConditionRow
              met={asset.complianceApproved}
              label="Compliance approved"
              value={asset.complianceApproved ? "Verified" : "Pending review"}
            />
            <ConditionRow
              met={lockedInvestments.length > 0}
              label="Escrow positions exist"
              value={`${lockedInvestments.length} investor${lockedInvestments.length !== 1 ? "s" : ""}`}
            />
          </div>
        </div>

        {/* Compliance review */}
        {!asset.complianceApproved && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3">
            <p className="text-xs text-white/30 uppercase tracking-wide">Compliance Review</p>
            <div className="space-y-1.5 text-sm">
              <ComplianceRow
                ok={!!asset.proofOfOwnership?.documentType}
                label="Ownership document"
                value={asset.proofOfOwnership?.documentType ?? "Missing"}
              />
              <ComplianceRow
                ok={!!asset.proofOfOwnership?.issuedBy}
                label="Issuing authority"
                value={asset.proofOfOwnership?.issuedBy ?? "Missing"}
              />
              <ComplianceRow
                ok={!!asset.proofOfOwnership?.hash}
                label="Document hash"
                value={asset.proofOfOwnership?.hash ? asset.proofOfOwnership.hash.slice(0, 16) + "…" : "Missing"}
              />
              <ComplianceRow
                ok={asset.proofOfOwnership?.didVerified ?? false}
                label="Borrower DID verified"
                value={asset.proofOfOwnership?.borrowerDid ? asset.proofOfOwnership.borrowerDid.slice(0, 24) + "…" : "Missing"}
              />
            </div>
            <Button
              size="sm"
              className="w-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25"
              disabled={complianceLoading || !asset.proofOfOwnership?.didVerified}
              onClick={handleApproveCompliance}
            >
              {complianceLoading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />Validating…</>
              ) : (
                <><FileCheck className="h-3.5 w-3.5" />Approve Compliance</>
              )}
            </Button>
            {!asset.proofOfOwnership?.didVerified && (
              <p className="text-xs text-white/30 text-center">DID must be verified before approving compliance</p>
            )}
          </div>
        )}

        {/* Fee breakdown */}
        {lockedInvestments.length > 0 && (
          <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2 text-sm">
            <p className="text-xs text-white/30 uppercase tracking-wide mb-3">Release Breakdown</p>
            <div className="flex justify-between">
              <span className="text-white/50 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />{lockedInvestments.length} investors
              </span>
              <span className="font-mono text-white">{formatCurrency(totalLocked)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" />Validator fee ({formatPercent(validator.feePercentage)})
              </span>
              <span className="font-mono text-white/60">− {formatCurrency(validatorFeeAmount)}</span>
            </div>
            <div className="border-t border-white/8 pt-2 flex justify-between">
              <span className="text-white font-medium">Net to issuer</span>
              <span className="font-mono font-bold text-primary">{formatCurrency(issuerProceeds)}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {actionState === "error" && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />{errorMsg}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            className="flex-1"
            disabled={!canApprove || actionState === "approving" || actionState === "refunding"}
            onClick={handleApprove}
          >
            {actionState === "approving" ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Releasing…</>
            ) : (
              <><Zap className="h-4 w-4" />Approve & Release</>
            )}
          </Button>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            disabled={lockedInvestments.length === 0 || actionState === "approving" || actionState === "refunding"}
            onClick={handleRefund}
          >
            {actionState === "refunding" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Refund
          </Button>
        </div>

        {!canApprove && asset.fundingStatus !== "released" && asset.fundingStatus !== "refunded" && (
          <p className="text-xs text-white/30 text-center">
            {!asset.complianceApproved
              ? "⏳ Waiting for compliance approval"
              : "⏳ Waiting for escrow positions"}
          </p>
        )}

        {/* ── Loan Repayment (only when fundingStatus === "released") ── */}
        {asset.fundingStatus === "released" && releasedInvestments.length > 0 && (
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <h4 className="font-semibold text-white text-sm">Loan Repayment</h4>
              {isOverdue && (
                <span className="ml-auto text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-0.5">
                  {overdueDays}d overdue
                </span>
              )}
            </div>

            {/* Summary rows */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Total Principal</span>
                <span className="font-mono text-white">{formatCurrency(totalPrincipal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Total Interest ({formatPercent(asset.projectedYield)} p.a.)</span>
                <span className="font-mono text-emerald-400">+ {formatCurrency(totalInterest)}</span>
              </div>
              <div className="border-t border-white/8 pt-2 flex justify-between">
                <span className="text-white font-medium">Total to Repay</span>
                <span className="font-mono font-bold text-white">{formatCurrency(totalToRepay)}</span>
              </div>
            </div>

            {/* Due date */}
            {dueDate && (
              <div className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-xs",
                isOverdue
                  ? "border-red-500/25 bg-red-500/5 text-red-400"
                  : "border-orange-500/20 bg-orange-500/5 text-orange-400"
              )}>
                <span>Due date</span>
                <span className="font-mono font-medium">
                  {dueDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  {isOverdue ? " — OVERDUE" : ""}
                </span>
              </div>
            )}

            {/* Repay button */}
            <Button
              className="w-full bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25"
              disabled={actionState === "repaying"}
              onClick={handleRepay}
            >
              {actionState === "repaying" ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Processing Repayment…</>
              ) : (
                <><Clock className="h-4 w-4" />Repay All Lenders</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ComplianceRow({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-white/50">
        {ok
          ? <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          : <AlertCircle className="h-3 w-3 text-yellow-400" />}
        {label}
      </span>
      <span className={cn("font-mono truncate max-w-[160px]", ok ? "text-white/60" : "text-yellow-400/70")}>{value}</span>
    </div>
  );
}

function ConditionRow({ met, label, value }: { met: boolean; label: string; value: string }) {
  return (
    <div className={cn(
      "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
      met ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/6 bg-white/2"
    )}>
      <div className="flex items-center gap-2">
        <div className={cn("h-4 w-4 rounded-full flex items-center justify-center shrink-0",
          met ? "bg-emerald-500/20" : "bg-white/8")}>
          {met
            ? <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            : <Lock className="h-3 w-3 text-white/30" />}
        </div>
        <span className={met ? "text-white" : "text-white/40"}>{label}</span>
      </div>
      <span className={cn("text-xs font-medium", met ? "text-emerald-400" : "text-white/30")}>{value}</span>
    </div>
  );
}
