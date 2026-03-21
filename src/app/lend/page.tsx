"use client";

import { useState, useMemo } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { FundingCard } from "@/components/assets/FundingCard";
import { FundingStatusBadge } from "@/components/assets/EscrowStatusBadge";
import { CategoryBadge } from "@/components/assets/CategoryBadge";
import { AssetCategory, Vault, Asset } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, SlidersHorizontal, Building2, Zap, Palette, Wine,
  Watch, TrendingUp, Gem, LayoutGrid, List, ChevronDown,
  Shield, ArrowRight, MapPin, Info, CheckCircle2, Clock, Lock,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";
import Link from "next/link";

// ─── Vault card ───────────────────────────────────────────────────────────────

function VaultCard({ vault, asset }: { vault: Vault; asset?: Asset }) {
  const riskLevel = vault.riskLevel ?? "medium";
  const utilization = vault.utilization ?? vault.vaultUtilization ?? 0;
  const vaultName = vault.name ?? vault.brokerName ?? vault.assetName ?? "Vault";
  const totalDeposited = vault.totalDeposited ?? vault.vaultTotalDeposited ?? 0;
  const riskColor = {
    low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    high: "text-red-400 bg-red-500/10 border-red-500/20",
  };
  const riskLabel = { low: "Low risk", medium: "Medium risk", high: "Higher risk" };
  const utilizationColor = utilization >= 90 ? "bg-red-400" : utilization >= 60 ? "bg-yellow-400" : "bg-emerald-400";

  return (
    <Link href={`/assets/${vault.assetId}`} className="group block">
      <div className={cn(
        "rounded-2xl border bg-[#0d0d0d] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        vault.status === "active" ? "border-white/8 hover:border-primary/30" : "border-white/5 opacity-60"
      )}>
        {/* Top row */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm group-hover:text-primary transition-colors truncate">
                {vaultName}
              </p>
              {asset && (
                <div className="flex items-center gap-1 mt-0.5 text-xs text-white/40">
                  <MapPin className="h-3 w-3" />{asset.location}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", riskColor[riskLevel])}>
                {riskLabel[riskLevel]}
              </span>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Interest rate</p>
              <p className="text-lg font-bold text-primary">{vault.expectedReturnPercent ?? "—"}%</p>
              <p className="text-[10px] text-white/30">per year</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Funded</p>
              <p className="text-lg font-bold text-white">{formatCurrency(totalDeposited, true)}</p>
              <p className="text-[10px] text-white/30">{vault.lenderCount ?? 0} lenders</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Min. to lend</p>
              <p className="text-lg font-bold text-white">{formatCurrency(vault.minDeposit ?? 0)}</p>
              <p className="text-[10px] text-white/30">{(vault.lockupDays ?? 0) > 0 ? `${vault.lockupDays}d lockup` : "No lockup"}</p>
            </div>
          </div>

          {/* Utilization */}
          <div className="mb-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/40">Capital deployed</span>
              <span className="text-white/50">{utilization}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
              <div className={cn("h-full rounded-full", utilizationColor)} style={{ width: `${utilization}%` }} />
            </div>
          </div>
        </div>

        {/* First-loss protection row */}
        <div className="border-t border-white/6 px-5 py-3 flex items-center gap-2 bg-white/2">
          <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
          <p className="text-xs text-white/50">
            <span className="text-white font-medium">{vault.firstLossCoverPercent}% first-loss protection</span>
            {" "}— platform absorbs the first {vault.firstLossCoverPercent}% of any losses before lenders are affected
          </p>
        </div>

        {/* CTA */}
        <div className="border-t border-white/6 px-5 py-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">{vault.activeLoansCount} active loan{vault.activeLoansCount !== 1 ? "s" : ""} · {vault.defaultRate}% historical default</p>
            <span className="flex items-center gap-1 text-xs text-primary font-medium group-hover:underline">
              Fund this pool <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── List row for loan pools (assets) ─────────────────────────────────────────

function LoanPoolListRow({ asset }: { asset: Asset }) {
  const pct = Math.min(100, (asset.amountRaised / asset.fundingTarget) * 100);
  return (
    <Link href={`/assets/${asset.id}`}>
      <div className="flex items-center gap-5 rounded-2xl border border-white/7 bg-[#0d0d0d] px-5 py-4 hover:border-primary/25 hover:bg-white/3 transition-all duration-200 group">
        <CategoryBadge category={asset.category} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm group-hover:text-primary transition-colors truncate">{asset.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-white/30 shrink-0" />
            <p className="text-xs text-white/40 truncate">{asset.location}</p>
          </div>
        </div>
        <div className="hidden md:block w-32">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/30">{pct.toFixed(0)}%</span>
            <span className="text-white/50">{formatCurrency(asset.fundingTarget, true)}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/30">Interest</p>
            <p className="text-sm font-semibold text-primary">{formatPercent(asset.projectedYield)}</p>
          </div>
          <FundingStatusBadge status={asset.fundingStatus} />
          <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ─── Category filter helpers ──────────────────────────────────────────────────

const CATEGORIES: { value: AssetCategory | "all"; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { value: "all", label: "All", icon: LayoutGrid, color: "text-white" },
  { value: "real-estate", label: "Real Estate", icon: Building2, color: "text-blue-400" },
  { value: "infrastructure", label: "Infrastructure", icon: Zap, color: "text-yellow-400" },
  { value: "collectibles", label: "Collectibles", icon: Watch, color: "text-orange-400" },
  { value: "art", label: "Art", icon: Palette, color: "text-purple-400" },
  { value: "wine", label: "Wine", icon: Wine, color: "text-rose-400" },
  { value: "private-equity", label: "Private Equity", icon: TrendingUp, color: "text-emerald-400" },
  { value: "commodities", label: "Commodities", icon: Gem, color: "text-amber-400" },
];

const SORT_OPTIONS = [
  { value: "return-desc", label: "Highest Return" },
  { value: "funded-desc", label: "Most Funded" },
  { value: "deadline-asc", label: "Closing Soon" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All", icon: LayoutGrid },
  { value: "open", label: "Open", icon: Clock },
  { value: "funded", label: "Funded", icon: Lock },
  { value: "released", label: "Settled", icon: CheckCircle2 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LendPage() {
  const { assets, vaults, loanBrokers } = usePortfolioStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("return-desc");
  const [view, setView] = useState<"grid" | "list">("grid");

  // Use vaults if available, fall back to loanBrokers alias
  const allVaults = (vaults?.length ? vaults : loanBrokers) ?? [];
  const activeVaults = allVaults.filter((v) => v.status === "active");

  const filtered = useMemo(() =>
    assets
      .filter((a) => {
        const q = search.toLowerCase();
        const matchesSearch = a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.tags.some((t) => t.toLowerCase().includes(q));
        const matchesCategory = category === "all" || a.category === category;
        const matchesStatus = statusFilter === "all" || a.fundingStatus === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "return-desc") return b.projectedYield - a.projectedYield;
        if (sort === "funded-desc") return (b.amountRaised / b.fundingTarget) - (a.amountRaised / a.fundingTarget);
        if (sort === "deadline-asc") return new Date(a.fundingDeadline).getTime() - new Date(b.fundingDeadline).getTime();
        return 0;
      }),
    [assets, search, category, statusFilter, sort]
  );

  const totalRaised = assets.reduce((s, a) => s + a.amountRaised, 0);
  const avgReturn = assets.length > 0 ? assets.reduce((s, a) => s + a.projectedYield, 0) / assets.length : 0;
  const openCount = assets.filter((a) => a.fundingStatus === "open").length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#060606]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary uppercase tracking-widest mb-4">
                Lend
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Fund a Loan</h1>
              <p className="text-white/40 text-sm">
                {openCount} open loan pools · Your capital secured in XRPL escrow until approved
              </p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Total funded</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalRaised, true)}</p>
              </div>
              <div className="w-px bg-white/8" />
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Avg. return</p>
                <p className="text-xl font-bold text-primary">{avgReturn.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* How lending works */}
        <div className="rounded-xl border border-white/8 bg-[#0d0d0d] px-5 py-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white mb-1">How lending works</p>
              <p className="text-sm text-white/50 leading-relaxed">
                You fund a specific loan pool backed by a real-world asset. Your capital is held in XRPL escrow — it never moves until a validator approves the deal.
                Once approved, you earn a fixed return. If the deal falls through, your full deposit is automatically returned.
              </p>
            </div>
          </div>
        </div>

        {/* Active vaults */}
        {activeVaults.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-white/30 uppercase tracking-wide">Lending pools</p>
              <p className="text-xs text-white/30">{activeVaults.length} active</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeVaults.map((vault) => {
                const asset = assets.find((a) => a.id === vault.assetId);
                return <VaultCard key={vault.id} vault={vault} asset={asset} />;
              })}
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="border-t border-white/6" />

        {/* Loan pools (asset funding rounds) */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs text-white/30 uppercase tracking-wide">All loan pools</p>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = cat.value === "all" ? assets.length : assets.filter((a) => a.category === cat.value).length;
              const isActive = category === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all border shrink-0",
                    isActive ? "bg-white text-black border-white" : "border-white/10 bg-white/4 text-white/60 hover:text-white hover:bg-white/8"
                  )}
                >
                  <Icon className={cn("h-3.5 w-3.5", isActive ? "text-black" : cat.color)} />
                  {cat.label}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-bold", isActive ? "bg-black/15 text-black" : "bg-white/10 text-white/50")}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Status + search + sort */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex gap-2">
              {STATUS_FILTERS.map((s) => {
                const Icon = s.icon;
                const isActive = statusFilter === s.value;
                return (
                  <button
                    key={s.value}
                    onClick={() => setStatusFilter(s.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all",
                      isActive ? "border-primary/40 bg-primary/10 text-primary" : "border-white/8 bg-white/3 text-white/40 hover:text-white/70"
                    )}
                  >
                    <Icon className="h-3 w-3" />{s.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <Input
                  placeholder="Search loan pools..."
                  className="pl-10 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="relative">
                <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-9 appearance-none rounded-xl border border-white/10 bg-white/5 pl-9 pr-7 text-sm text-white focus:outline-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#0d0d0d]">{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
              </div>
              <div className="flex rounded-xl border border-white/10 overflow-hidden">
                <button onClick={() => setView("grid")} className={cn("flex items-center justify-center h-9 w-9", view === "grid" ? "bg-white/15 text-white" : "bg-white/4 text-white/40")}>
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button onClick={() => setView("list")} className={cn("flex items-center justify-center h-9 w-9 border-l border-white/10", view === "list" ? "bg-white/15 text-white" : "bg-white/4 text-white/40")}>
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/30 mb-5">
            {filtered.length} loan pool{filtered.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : ""}
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-16 text-center">
              <Search className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-medium mb-4">No loan pools found</p>
              <button onClick={() => { setSearch(""); setCategory("all"); setStatusFilter("all"); }} className="text-sm text-primary hover:underline">
                Clear filters
              </button>
            </div>
          ) : view === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((asset) => <FundingCard key={asset.id} asset={asset} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((asset) => <LoanPoolListRow key={asset.id} asset={asset} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
