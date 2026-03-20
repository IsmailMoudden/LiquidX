"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { StatCard } from "@/components/shared/StatCard";
import { HoldingsTable } from "@/components/portfolio/HoldingsTable";
import { AllocationChart } from "@/components/portfolio/AllocationChart";
import { TransactionList } from "@/components/portfolio/TransactionList";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wallet, TrendingUp, BarChart3, ArrowUpDown } from "lucide-react";

export default function PortfolioPage() {
  const { holdings, assets, usdcBalance, transactions } = usePortfolioStore();

  const totalInvested = holdings.reduce((sum, h) => {
    const asset = assets.find((a) => a.id === h.assetId);
    return sum + h.tokens * (asset?.tokenPrice ?? 0);
  }, 0);

  const weightedYield =
    holdings.length > 0
      ? holdings.reduce((sum, h) => {
          const asset = assets.find((a) => a.id === h.assetId);
          const value = h.tokens * (asset?.tokenPrice ?? 0);
          return sum + (asset?.projectedYield ?? 0) * value;
        }, 0) / (totalInvested || 1)
      : 0;

  const totalPortfolio = usdcBalance + totalInvested;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Portfolio</h1>
        <p className="text-white/40">
          Your stablecoin-denominated real-world asset portfolio
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total Portfolio Value"
          value={formatCurrency(totalPortfolio)}
          subValue="USDC denominated"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="USDC Balance"
          value={formatCurrency(usdcBalance)}
          subValue="Available to invest"
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Invested Value"
          value={formatCurrency(totalInvested)}
          subValue={`${holdings.length} positions`}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Avg. Projected Yield"
          value={formatPercent(weightedYield)}
          subValue="Weighted by position"
          trend="up"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        {/* Allocation Chart */}
        <div className="lg:col-span-1 rounded-2xl border border-white/7 bg-[#0d0d0d] p-6">
          <h2 className="font-semibold text-white mb-4">Asset Allocation</h2>
          <AllocationChart />
        </div>

        {/* Holdings */}
        <div className="lg:col-span-2 rounded-2xl border border-white/7 bg-[#0d0d0d]">
          <div className="p-6 border-b border-white/6">
            <h2 className="font-semibold text-white">Holdings</h2>
          </div>
          <HoldingsTable />
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-2xl border border-white/7 bg-[#0d0d0d]">
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
