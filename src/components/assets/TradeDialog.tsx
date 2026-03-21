"use client";

import { useState } from "react";
import { Asset } from "@/lib/types";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency } from "@/lib/utils";
import { sendXRPLPayment, XRPLPaymentResult } from "@/lib/xrpl";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Wallet,
  Zap,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TradeStep =
  | "input"        // user enters amount
  | "wallet-gate"  // wallet not connected prompt
  | "processing"   // XRPL tx in flight
  | "success"      // tx confirmed
  | "error";       // something went wrong

interface TradeDialogProps {
  asset: Asset;
  mode: "buy" | "sell";
  open: boolean;
  onClose: () => void;
}

export function TradeDialog({ asset, mode, open, onClose }: TradeDialogProps) {
  const [amount, setAmount] = useState("1");
  const [step, setStep] = useState<TradeStep>("input");
  const [txResult, setTxResult] = useState<XRPLPaymentResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const { buyAsset, sellAsset, usdcBalance, holdings } = usePortfolioStore();
  const tonAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();

  const holding = holdings.find((h) => h.assetId === asset.id);
  const ownedTokens = holding?.tokens ?? 0;
  const tokenAmount = Math.max(0, parseInt(amount) || 0);
  const total = tokenAmount * asset.tokenPrice;
  const isBuy = mode === "buy";

  const handleClose = () => {
    setStep("input");
    setAmount("1");
    setTxResult(null);
    setErrorMsg("");
    setCopied(false);
    onClose();
  };

  const handleCopyHash = () => {
    if (txResult) {
      navigator.clipboard.writeText(txResult.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrade = async () => {
    // 1 — Gate: require TON wallet
    if (!tonAddress) {
      setStep("wallet-gate");
      return;
    }

    if (tokenAmount <= 0) return;

    // 2 — Only XRPL payment for buys
    let xrplResult = null;
    if (isBuy) {
      setStep("processing");
      try {
        xrplResult = await sendXRPLPayment(total);
        setTxResult(xrplResult);
      } catch {
        setStep("error");
        setErrorMsg("XRPL payment failed. Please try again.");
        return;
      }
    }

    // 3 — Update portfolio state — pass XRPL hash + TON address so they're persisted
    const portfolioResult = isBuy
      ? buyAsset(
          asset.id,
          tokenAmount,
          xrplResult
            ? {
                hash: xrplResult.hash,
                status: xrplResult.status,
                explorerUrl: xrplResult.explorerUrl,
                ledger: xrplResult.ledger,
                txType: "Payment" as const,
              }
            : undefined,
          tonAddress || undefined
        )
      : sellAsset(asset.id, tokenAmount, tonAddress || undefined);

    if (!portfolioResult.success) {
      setStep("error");
      setErrorMsg(portfolioResult.error ?? "Transaction failed");
      return;
    }

    setStep("success");
  };

  const handleConnectWallet = () => {
    tonConnectUI.openModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBuy ? (
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-400" />
            )}
            {isBuy ? "Buy" : "Sell"} — {asset.name}
          </DialogTitle>
          <DialogDescription>
            {isBuy
              ? "Payment settled on XRPL Testnet"
              : "Sell tokens for instant USDC liquidity"}
          </DialogDescription>
        </DialogHeader>

        {/* ── INPUT STEP ── */}
        {step === "input" && (
          <div className="space-y-4">
            {/* Wallet status bar */}
            <WalletStatusBar
              tonAddress={tonAddress}
              onConnect={handleConnectWallet}
            />

            {/* Token info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground mb-1">Token Price</p>
                <p className="font-semibold font-mono">${asset.tokenPrice} USDC</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  {isBuy ? "USDC Balance" : "Tokens Owned"}
                </p>
                <p className="font-semibold font-mono">
                  {isBuy ? formatCurrency(usdcBalance) : `${ownedTokens} tokens`}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Number of Tokens
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="1"
                  max={!isBuy ? ownedTokens : undefined}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-mono"
                />
                {!isBuy && ownedTokens > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(String(ownedTokens))}
                    className="shrink-0 text-xs"
                  >
                    Max
                  </Button>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="rounded-lg border border-border p-3 flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {isBuy ? "Total Cost" : "You Receive"}
              </span>
              <span className="text-lg font-bold font-mono">
                {formatCurrency(total)} USDC
              </span>
            </div>

            {/* XRPL note for buys */}
            {isBuy && (
              <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-400">
                <Zap className="h-3.5 w-3.5 shrink-0" />
                Payment will be settled on XRPL Testnet
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className={cn(
                  "flex-1",
                  !isBuy &&
                    "bg-red-500/90 hover:bg-red-500 text-white shadow-red-500/20"
                )}
                onClick={handleTrade}
                disabled={tokenAmount <= 0}
              >
                {isBuy ? "Buy" : "Sell"}{" "}
                {tokenAmount > 0 ? `${tokenAmount} Tokens` : ""}
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
              <h3 className="font-semibold mb-1">Connect your wallet first</h3>
              <p className="text-sm text-muted-foreground">
                A TON wallet is required to authenticate and authorize
                purchases on LiquidX.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <Button onClick={handleConnectWallet} className="w-full">
                <Wallet className="h-4 w-4" />
                Connect TON Wallet
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => setStep("input")}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {step === "processing" && (
          <div className="py-6 space-y-5">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <Loader2 className="absolute -inset-1 h-[4.5rem] w-[4.5rem] animate-spin text-primary/30" />
              </div>
              <div>
                <p className="font-semibold">Processing on XRPL Testnet</p>
                <p className="text-sm text-muted-foreground">
                  Submitting payment transaction...
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              <ProcessingStep done icon="wallet" label="TON Wallet Authenticated" />
              <ProcessingStep loading icon="xrpl" label="XRPL Payment Submitting..." />
              <ProcessingStep pending icon="portfolio" label="Portfolio Update Pending" />
            </div>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && txResult && (
          <div className="py-2 space-y-4">
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <div>
                <p className="text-lg font-bold">
                  {isBuy ? "Purchase" : "Sale"} Complete!
                </p>
                <p className="text-sm text-muted-foreground">
                  {tokenAmount} tokens {isBuy ? "acquired" : "sold"} ·{" "}
                  {formatCurrency(total)} USDC
                </p>
              </div>
            </div>

            {/* Steps summary */}
            <div className="space-y-2">
              <ProcessingStep done icon="wallet" label="TON Wallet Verified" />
              <ProcessingStep done icon="xrpl" label="XRPL Payment Confirmed" />
              <ProcessingStep done icon="portfolio" label="Portfolio Updated" />
            </div>

            {/* TX Hash card */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">XRPL Testnet</span>
                </div>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full border",
                    txResult.status === "confirmed"
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : "bg-blue-500/20 border-blue-500/30 text-blue-400"
                  )}
                >
                  {txResult.status === "confirmed" ? "✓ On-chain" : "✓ Simulated"}
                </span>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Transaction Hash
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-emerald-300 truncate flex-1">
                    {txResult.hash}
                  </code>
                  <button
                    onClick={handleCopyHash}
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {txResult.ledger && (
                <p className="text-xs text-muted-foreground">
                  Ledger #{txResult.ledger.toLocaleString()}
                </p>
              )}

              <a
                href={txResult.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View on XRPL Explorer
              </a>
            </div>

            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}

        {/* ── SUCCESS (sell — no XRPL) ── */}
        {step === "success" && !txResult && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
            <div>
              <p className="text-lg font-bold">Sale Complete!</p>
              <p className="text-sm text-muted-foreground">
                {tokenAmount} tokens sold · +{formatCurrency(total)} USDC
              </p>
            </div>
            <Button className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        )}

        {/* ── ERROR ── */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-400" />
            <div>
              <p className="font-semibold">Transaction Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
            </div>
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("input")}
              >
                Try Again
              </Button>
              <Button variant="ghost" className="flex-1" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function WalletStatusBar({
  tonAddress,
  onConnect,
}: {
  tonAddress: string;
  onConnect: () => void;
}) {
  if (tonAddress) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-emerald-400 font-medium">Wallet Connected</span>
        <span className="font-mono text-xs text-muted-foreground ml-auto">
          {tonAddress.slice(0, 8)}…{tonAddress.slice(-4)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-2 w-full rounded-lg border border-orange-500/30 bg-orange-500/5 px-3 py-2 text-sm hover:bg-orange-500/10 transition-colors"
    >
      <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
      <span className="text-orange-400 font-medium">
        Wallet not connected — click to connect
      </span>
    </button>
  );
}

type StepIcon = "wallet" | "xrpl" | "portfolio";

function ProcessingStep({
  done,
  loading,
  pending,
  icon,
  label,
}: {
  done?: boolean;
  loading?: boolean;
  pending?: boolean;
  icon: StepIcon;
  label: string;
}) {
  const iconMap: Record<StepIcon, React.ReactNode> = {
    wallet: <Wallet className="h-3.5 w-3.5" />,
    xrpl: <Zap className="h-3.5 w-3.5" />,
    portfolio: <TrendingUp className="h-3.5 w-3.5" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
        done && "bg-emerald-500/5 border border-emerald-500/20",
        loading && "bg-primary/5 border border-primary/20",
        pending && "opacity-40"
      )}
    >
      <div
        className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
          done && "bg-emerald-500/20 text-emerald-400",
          loading && "bg-primary/20 text-primary",
          pending && "bg-secondary text-muted-foreground"
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : done ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          iconMap[icon]
        )}
      </div>
      <span className={cn(done && "text-foreground", pending && "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}
