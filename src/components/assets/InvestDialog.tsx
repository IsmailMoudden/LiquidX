"use client";

import { useState, useEffect } from "react";
import { Asset } from "@/lib/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency } from "@/lib/utils";
import { createXRPLEscrow, XRPLPaymentResult } from "@/lib/xrpl-client";
import { useIdentityStore, selectXrplAddress } from "@/store/identity-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Lock, Wallet, Zap, ExternalLink, Copy, Check, Loader2,
  CheckCircle2, AlertCircle, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "input" | "wallet-gate" | "processing" | "success" | "error";

interface ProcessStepProps {
  done?: boolean;
  active?: boolean;
  label: string;
  sub?: string;
  icon: React.ReactNode;
}

function ProcessStep({ done, active, label, sub, icon }: ProcessStepProps) {
  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 border transition-all",
      done && "border-emerald-500/20 bg-emerald-500/5",
      active && "border-primary/20 bg-primary/5",
      !done && !active && "border-white/6 opacity-40"
    )}>
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
        done && "bg-emerald-500/20 text-emerald-400",
        active && "bg-primary/20 text-primary",
        !done && !active && "bg-white/8 text-white/30"
      )}>
        {active ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <Check className="h-4 w-4" /> : icon}
      </div>
      <div>
        <p className={cn("text-sm font-medium", done && "text-white", active && "text-white", !done && !active && "text-white/40")}>{label}</p>
        {sub && <p className="text-xs text-white/40">{sub}</p>}
      </div>
    </div>
  );
}

export function InvestDialog({ asset, open, onClose }: { asset: Asset; open: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState("500");
  const [step, setStep] = useState<Step>("input");
  const [xrplResult, setXrplResult] = useState<XRPLPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const { invest, usdcBalance, loanBrokers } = usePortfolioStore();
  const xrplAddress = useIdentityStore(selectXrplAddress);

  // Find this asset's vault to get the XRPL DestinationTag
  const vault = loanBrokers.find((v) => v.assetId === asset.id);

  const [xrpPrice, setXrpPrice] = useState<number>(0.5);
  useEffect(() => {
    fetch("/api/xrpl/price").then(r => r.json()).then(d => setXrpPrice(d.usd ?? 0.5)).catch(() => {});
  }, []);

  const amountNum = Math.max(0, parseFloat(amount) || 0);
  const xrpEquivalent = xrpPrice > 0 ? Math.ceil(amountNum / xrpPrice) : 0;
  const tokens = Math.floor(amountNum / asset.tokenPrice);
  const remaining = asset.fundingTarget - asset.amountRaised;
  const cappedAmount = Math.min(amountNum, remaining, usdcBalance);

  const handleClose = () => {
    if (step === "processing") return;
    setStep("input");
    setAmount("500");
    setXrplResult(null);
    setErrorMsg("");
    setCopied(false);
    onClose();
  };

  const handleInvest = async () => {
    if (!xrplAddress) { setStep("wallet-gate"); return; }
    if (amountNum < asset.minInvestment) return;

    setStep("processing");

    // 1 — Create XRPL escrow
    let xrpl: XRPLPaymentResult;
    try {
      xrpl = await createXRPLEscrow(amountNum, undefined, vault?.destinationTag, asset.id);
      console.log("[InvestDialog] EscrowCreate result:", { hash: xrpl.hash, status: xrpl.status, escrowSequence: xrpl.escrowSequence });
      setXrplResult(xrpl);
    } catch (err) {
      console.error("[InvestDialog] EscrowCreate failed:", err);
      setStep("error");
      setErrorMsg("XRPL escrow creation failed. Please try again.");
      return;
    }

    // 2 — Persist to store (escrowSequence is required for EscrowFinish later)
    const result = invest(
      asset.id,
      amountNum,
      { hash: xrpl.hash, status: xrpl.status, explorerUrl: xrpl.explorerUrl, ledger: xrpl.ledger, txType: "EscrowCreate", escrowSequence: xrpl.escrowSequence },
      xrplAddress!
    );
    console.log("[InvestDialog] invest() store result:", result);

    if (!result.success) {
      setStep("error");
      setErrorMsg(result.error ?? "Investment failed");
      return;
    }

    setStep("success");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Invest — {asset.name}
          </DialogTitle>
          <DialogDescription>
            Funds are locked in XRPL escrow until validator approval
          </DialogDescription>
        </DialogHeader>

        {/* ── INPUT ── */}
        {step === "input" && (
          <div className="space-y-4">
            {/* Wallet bar */}
            {xrplAddress ? (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-medium">Wallet Connected</span>
                <code className="ml-auto text-xs text-white/40">{xrplAddress.slice(0, 8)}…</code>
              </div>
            ) : (
              <a href="/account"
                className="flex items-center gap-2 w-full rounded-xl border border-orange-500/30 bg-orange-500/5 px-3 py-2 text-sm hover:bg-orange-500/10 transition-colors">
                <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-orange-400 font-medium">Link XRPL wallet on Account page to invest</span>
              </a>
            )}

            {/* Info row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/4 border border-white/8 p-3">
                <p className="text-xs text-white/40 mb-1">Available Balance</p>
                <p className="font-semibold text-white font-mono">{formatCurrency(usdcBalance)}</p>
              </div>
              <div className="rounded-xl bg-white/4 border border-white/8 p-3">
                <p className="text-xs text-white/40 mb-1">Remaining Target</p>
                <p className="font-semibold text-white font-mono">{formatCurrency(remaining, true)}</p>
              </div>
            </div>

            {/* Amount input */}
            <div>
              <label className="text-sm font-medium text-white mb-1.5 block">Investment Amount (USDC)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                <Input
                  type="number"
                  placeholder="500"
                  className="pl-7 font-mono"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={asset.minInvestment}
                />
              </div>
              <p className="text-xs text-white/30 mt-1">
                Min. ${asset.minInvestment} · You receive {tokens} tokens
              </p>
            </div>

            {/* Summary */}
            <div className="rounded-xl border border-white/8 bg-white/3 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/40">Tokens to receive</span>
                <span className="font-mono font-semibold text-white">{tokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Token price</span>
                <span className="font-mono text-white">${asset.tokenPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Proj. yield</span>
                <span className="font-mono text-primary">{asset.projectedYield}%</span>
              </div>
              <div className="border-t border-white/8 pt-2 flex justify-between">
                <span className="text-white/40">XRPL escrow lock</span>
                <div className="text-right">
                  <span className="text-yellow-400 font-semibold font-mono">~{xrpEquivalent.toLocaleString()} XRP</span>
                  <span className="text-white/30 font-mono text-xs ml-1">(≈{formatCurrency(amountNum)})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-blue-500/8 border border-blue-500/20 px-3 py-2 text-xs text-blue-400">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              <span>
                Funds enter XRPL escrow and are released only after validator approval
                {vault?.destinationTag !== undefined && (
                  <span className="ml-1 opacity-70">· Vault tag <code className="font-mono">#{vault.destinationTag}</code></span>
                )}
              </span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
              <Button
                className="flex-1"
                disabled={amountNum < asset.minInvestment || amountNum > usdcBalance}
                onClick={handleInvest}
              >
                <Lock className="h-4 w-4" />
                Lock in Escrow
              </Button>
            </div>
          </div>
        )}

        {/* ── WALLET GATE ── */}
        {step === "wallet-gate" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 border border-orange-500/20">
              <Wallet className="h-8 w-8 text-orange-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Link your XRPL wallet first</h3>
              <p className="text-sm text-white/40">Go to your Account page, paste your XRPL address, and verify your DID to invest.</p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button asChild className="w-full">
                <a href="/account"><Wallet className="h-4 w-4" />Go to Account</a>
              </Button>
              <Button variant="ghost" className="w-full text-sm" onClick={() => setStep("input")}>Back</Button>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {step === "processing" && (
          <div className="py-4 space-y-3">
            <div className="flex flex-col items-center gap-2 text-center mb-4">
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <Loader2 className="absolute -inset-1 h-16 w-16 animate-spin text-primary/20" />
              </div>
              <p className="font-semibold text-white">Creating XRPL Escrow</p>
              <p className="text-sm text-white/40">Locking {formatCurrency(amountNum)} USDC on XRPL Testnet…</p>
            </div>
            <ProcessStep done icon={<Wallet className="h-4 w-4" />} label="XRPL Wallet Verified" />
            <ProcessStep active icon={<Zap className="h-4 w-4" />} label="XRPL EscrowCreate Submitting…" sub="Awaiting testnet confirmation" />
            <ProcessStep icon={<Lock className="h-4 w-4" />} label="Funds Locked in Escrow" />
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && xrplResult && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <p className="text-lg font-bold text-white">Escrow Created!</p>
              <p className="text-sm text-white/40">
                {formatCurrency(amountNum)} USDC locked · {tokens} tokens reserved
              </p>
            </div>
            <div className="space-y-2">
              <ProcessStep done icon={<Wallet className="h-4 w-4" />} label="XRPL Wallet Verified" />
              <ProcessStep done icon={<Zap className="h-4 w-4" />} label="XRPL EscrowCreate Confirmed" sub={`Ledger #${xrplResult.ledger?.toLocaleString()}`} />
              <ProcessStep done icon={<Lock className="h-4 w-4" />} label="Funds Locked in Escrow" />
            </div>
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Zap className="h-3.5 w-3.5 text-primary" />XRPL Escrow
                </div>
                <span className="text-[10px] rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-2 py-0.5">
                  {xrplResult.status === "confirmed" ? "✓ On-chain" : "✓ Simulated"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2">
                <code className="text-xs font-mono text-primary/80 truncate flex-1 min-w-0">{xrplResult.hash}</code>
                <button onClick={() => { navigator.clipboard.writeText(xrplResult!.hash); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="shrink-0 text-white/30 hover:text-white transition-colors">
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <a href={xrplResult.explorerUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline">
                <ExternalLink className="h-3 w-3" />View on XRPL Explorer
              </a>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-white/40 text-center">
              ⏳ Funds release when validator approves. You can track status in your portfolio.
            </div>
            <Button className="w-full" onClick={handleClose}>
              View Portfolio <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div>
              <p className="font-semibold text-white">Investment Failed</p>
              <p className="text-sm text-white/40 mt-1">{errorMsg}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>Try Again</Button>
              <Button variant="ghost" className="flex-1" onClick={handleClose}>Cancel</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
