"use client";

import { useState } from "react";
import { Asset, Validator } from "@/lib/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { finishXRPLEscrow, cancelXRPLEscrow } from "@/lib/xrpl";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, XCircle, Shield, Loader2, AlertCircle,
  Zap, ExternalLink, Users, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidatorPanelProps {
  asset: Asset;
  validator: Validator;
}

type ActionState = "idle" | "approving" | "refunding" | "done-approve" | "done-refund" | "error";

export function ValidatorPanel({ asset, validator }: ValidatorPanelProps) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [lastHash, setLastHash] = useState("");
  const [lastExplorerUrl, setLastExplorerUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { approveAndRelease, refundAll, investments } = usePortfolioStore();

  const lockedInvestments = investments.filter(
    (i) => i.assetId === asset.id && (i.status === "locked" || i.status === "pending")
  );
  const totalLocked = lockedInvestments.reduce((s, i) => s + ((i as any).amount ?? i.amountDeposited ?? 0), 0);
  const validatorFeeAmount = (totalLocked * validator.feePercentage) / 100;
  const issuerProceeds = totalLocked - validatorFeeAmount;

  const canApprove =
    asset.fundingStatus === "funded" &&
    asset.complianceApproved &&
    lockedInvestments.length > 0;

  const handleApprove = async () => {
    setActionState("approving");
    try {
      const xrpl = await finishXRPLEscrow();
      setLastHash(xrpl.hash);
      setLastExplorerUrl(xrpl.explorerUrl);
      const result = approveAndRelease(asset.id, {
        hash: xrpl.hash,
        status: xrpl.status,
        explorerUrl: xrpl.explorerUrl,
        ledger: xrpl.ledger,
        txType: "EscrowFinish",
      });
      if (!result.success) {
        setActionState("error");
        setErrorMsg(result.error ?? "Release failed");
        return;
      }
      setActionState("done-approve");
    } catch {
      setActionState("error");
      setErrorMsg("XRPL EscrowFinish failed");
    }
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
              met={asset.fundingStatus === "funded" || asset.fundingStatus === "released"}
              label="Funding target reached"
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
              : asset.fundingStatus !== "funded"
              ? "⏳ Funding target not yet reached"
              : "⏳ Waiting for escrow positions"}
          </p>
        )}
      </div>
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
