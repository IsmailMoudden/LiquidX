"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, Layers } from "lucide-react";
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
        <div
          key={tx.id}
          className="flex items-center gap-4 rounded-xl border border-white/6 bg-white/3 px-4 py-3"
        >
          {/* Icon */}
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
            <p className="text-sm font-medium text-white truncate">{tx.assetName}</p>
            <p className="text-xs text-white/40">
              {tx.tokens} tokens @ ${tx.price} · {formatDate(tx.timestamp)}
            </p>
          </div>

          {/* Amount */}
          <div className="text-right shrink-0">
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
        </div>
      ))}
    </div>
  );
}
