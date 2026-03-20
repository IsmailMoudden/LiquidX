"use client";

import Link from "next/link";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { CategoryBadge } from "@/components/assets/CategoryBadge";
import { TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HoldingsTable() {
  const { holdings, assets } = usePortfolioStore();

  if (holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground mb-4">No holdings yet</p>
        <Button asChild>
          <Link href="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/6">
            <th className="text-left py-3 px-4 text-xs font-medium text-white/30 uppercase tracking-wide">Asset</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-white/30 uppercase tracking-wide">Tokens</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-white/30 uppercase tracking-wide">Avg. Price</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-white/30 uppercase tracking-wide">Value</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-white/30 uppercase tracking-wide">Yield</th>
            <th className="py-3 px-4" />
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const asset = assets.find((a) => a.id === holding.assetId);
            if (!asset) return null;
            const value = holding.tokens * asset.tokenPrice;
            return (
              <tr
                key={holding.assetId}
                className="border-b border-white/5 hover:bg-white/3 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium text-white">{asset.name}</p>
                      <div className="mt-1">
                        <CategoryBadge category={asset.category} />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-right font-mono font-medium text-white">
                  {holding.tokens}
                </td>
                <td className="py-4 px-4 text-right font-mono text-white/40">
                  ${holding.avgBuyPrice.toFixed(2)}
                </td>
                <td className="py-4 px-4 text-right font-mono font-semibold text-white">
                  {formatCurrency(value)}
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="flex items-center justify-end gap-1 text-primary font-medium">
                    <TrendingUp className="h-3 w-3" />
                    {formatPercent(asset.projectedYield)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/assets/${asset.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
