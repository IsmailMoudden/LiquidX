"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { Transaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TransactionList() {
  const { transactions } = usePortfolioStore();

  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-white/40 text-sm">
        No transactions yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transactions.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tx.xrplHash) {
      navigator.clipboard.writeText(tx.xrplHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasXrpl = !!tx.xrplHash;

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        expanded
          ? "border-white/12 bg-white/4"
          : "border-white/6 bg-white/3 hover:bg-white/4 hover:border-white/10"
      )}
    >
      {/* Main row */}
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-3",
          hasXrpl && "cursor-pointer"
        )}
        onClick={() => hasXrpl && setExpanded((v) => !v)}
      >
        {/* Type icon */}
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            tx.type === "buy"
              ? "bg-emerald-500/15 text-emerald-400"
              : tx.type === "sell"
              ? "bg-red-500/15 text-red-400"
              : "bg-blue-500/15 text-blue-400"
          )}
        >
          {tx.type === "buy" ? (
            <TrendingUp className="h-4 w-4" />
          ) : tx.type === "sell" ? (
            <TrendingDown className="h-4 w-4" />
          ) : (
            <Layers className="h-4 w-4" />
          )}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">
              {tx.assetName}
            </p>
            {hasXrpl && (
              <span
                className={cn(
                  "shrink-0 inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                  tx.xrplStatus === "confirmed"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                )}
              >
                <Zap className="h-2.5 w-2.5" />
                XRPL
              </span>
            )}
          </div>
          <p className="text-xs text-white/40">
            {tx.tokens} tokens @ ${tx.price} · {formatDate(tx.timestamp)}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0 flex items-center gap-2">
          <div>
            <p
              className={cn(
                "text-sm font-semibold font-mono",
                tx.type === "buy"
                  ? "text-red-400"
                  : tx.type === "sell"
                  ? "text-emerald-400"
                  : "text-blue-400"
              )}
            >
              {tx.type === "buy" ? "-" : "+"}
              {formatCurrency(tx.total)}
            </p>
            <p className="text-xs text-white/30 uppercase">{tx.type}</p>
          </div>
          {hasXrpl && (
            <div className="text-white/20">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* XRPL settlement details — expandable */}
      {expanded && hasXrpl && (
        <div className="mx-4 mb-4 rounded-xl border border-white/8 bg-[#080808] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-white">
                XRPL Testnet Settlement
              </span>
            </div>
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                tx.xrplStatus === "confirmed"
                  ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400"
                  : "bg-blue-500/15 border-blue-500/25 text-blue-400"
              )}
            >
              {tx.xrplStatus === "confirmed" ? "✓ On-chain" : "✓ Simulated"}
            </span>
          </div>

          {/* Hash */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1.5">
              Transaction Hash
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-white/4 border border-white/8 px-3 py-2">
              <code className="text-xs font-mono text-primary/90 truncate flex-1">
                {tx.xrplHash}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 text-white/30 hover:text-white transition-colors"
                title="Copy hash"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-white/40">
            {tx.xrplLedger && (
              <span>
                Ledger{" "}
                <span className="text-white/60 font-mono">
                  #{tx.xrplLedger.toLocaleString()}
                </span>
              </span>
            )}
            {tx.tonAddress && (
              <span>
                Auth{" "}
                <span className="font-mono text-white/60">
                  {tx.tonAddress.slice(0, 8)}…{tx.tonAddress.slice(-4)}
                </span>
              </span>
            )}
            <a
              href={tx.xrplExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              View on Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
