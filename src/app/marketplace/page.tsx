"use client";

import { useState, useMemo } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { AssetCard } from "@/components/assets/AssetCard";
import { AssetCategory } from "@/lib/types";
import { Input } from "@/components/ui/input";
import {
  Search,
  SlidersHorizontal,
  Building2,
  Zap,
  Palette,
  Wine,
  Watch,
  TrendingUp,
  Gem,
  LayoutGrid,
  List,
  ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES: {
  value: AssetCategory | "all";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { value: "all", label: "All Assets", icon: LayoutGrid, color: "text-white" },
  { value: "real-estate", label: "Real Estate", icon: Building2, color: "text-blue-400" },
  { value: "infrastructure", label: "Infrastructure", icon: Zap, color: "text-yellow-400" },
  { value: "collectibles", label: "Collectibles", icon: Watch, color: "text-orange-400" },
  { value: "art", label: "Art", icon: Palette, color: "text-purple-400" },
  { value: "wine", label: "Wine & Spirits", icon: Wine, color: "text-rose-400" },
  { value: "private-equity", label: "Private Equity", icon: TrendingUp, color: "text-emerald-400" },
  { value: "commodities", label: "Commodities", icon: Gem, color: "text-amber-400" },
];

const SORT_OPTIONS = [
  { value: "yield-desc", label: "Highest Yield" },
  { value: "value-desc", label: "Highest Valuation" },
  { value: "value-asc", label: "Lowest Valuation" },
  { value: "liquidity-desc", label: "Most Liquid" },
  { value: "funded-desc", label: "Most Funded" },
];

export default function MarketplacePage() {
  const { assets } = usePortfolioStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [sort, setSort] = useState("yield-desc");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(
    () =>
      assets
        .filter((a) => {
          const q = search.toLowerCase();
          const matchesSearch =
            a.name.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q) ||
            a.location.toLowerCase().includes(q) ||
            a.tags.some((t) => t.toLowerCase().includes(q));
          const matchesCategory =
            category === "all" || a.category === category;
          return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
          switch (sort) {
            case "yield-desc": return b.projectedYield - a.projectedYield;
            case "value-desc": return b.totalValue - a.totalValue;
            case "value-asc": return a.totalValue - b.totalValue;
            case "liquidity-desc": return b.liquidityScore - a.liquidityScore;
            case "funded-desc": return b.funded - a.funded;
            default: return 0;
          }
        }),
    [assets, search, category, sort]
  );

  // Summary stats
  const totalTVL = assets.reduce((s, a) => s + a.totalValue, 0);
  const avgYield =
    assets.reduce((s, a) => s + a.projectedYield, 0) / assets.length;
  const categoryCounts = CATEGORIES.slice(1).reduce(
    (acc, c) => ({
      ...acc,
      [c.value]: assets.filter((a) => a.category === c.value).length,
    }),
    {} as Record<string, number>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#060606]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary uppercase tracking-widest mb-4">
                Live Marketplace
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Tokenized Assets
              </h1>
              <p className="text-white/40 text-sm">
                {assets.length} assets across {CATEGORIES.length - 1} categories
              </p>
            </div>

            {/* Summary stats */}
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">
                  Total TVL
                </p>
                <p className="text-xl font-bold text-white">
                  {formatCurrency(totalTVL, true)}
                </p>
              </div>
              <div className="w-px bg-white/8" />
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">
                  Avg. Yield
                </p>
                <p className="text-xl font-bold text-primary">
                  {avgYield.toFixed(1)}%
                </p>
              </div>
              <div className="w-px bg-white/8" />
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">
                  Min. Invest
                </p>
                <p className="text-xl font-bold text-white">$100</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Category tabs — scrollable pill row */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.value;
            const count =
              cat.value === "all"
                ? assets.length
                : categoryCounts[cat.value] ?? 0;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 border shrink-0 ${
                  isActive
                    ? "bg-white text-black border-white"
                    : "border-white/10 bg-white/4 text-white/60 hover:text-white hover:bg-white/8 hover:border-white/20"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${isActive ? "text-black" : cat.color}`}
                />
                {cat.label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                    isActive
                      ? "bg-black/15 text-black"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Sort + View toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search by name, location, tag..."
              className="pl-10 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-primary/40 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex items-center">
              <SlidersHorizontal className="absolute left-3 h-4 w-4 text-white/30 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-11 appearance-none rounded-xl border border-white/10 bg-white/5 pl-9 pr-8 text-sm text-white focus:outline-none focus:border-primary/40 cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-[#0d0d0d]">
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-white/30 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`flex items-center justify-center h-11 w-11 transition-colors ${
                  view === "grid"
                    ? "bg-white/15 text-white"
                    : "bg-white/4 text-white/40 hover:text-white/70"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`flex items-center justify-center h-11 w-11 border-l border-white/10 transition-colors ${
                  view === "list"
                    ? "bg-white/15 text-white"
                    : "bg-white/4 text-white/40 hover:text-white/70"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-white/30 mb-5 uppercase tracking-wide">
          {filtered.length} asset{filtered.length !== 1 ? "s" : ""} found
          {search && ` for "${search}"`}
        </p>

        {/* Grid / List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="h-16 w-16 rounded-2xl bg-white/4 flex items-center justify-center mb-4">
              <Search className="h-7 w-7 text-white/20" />
            </div>
            <p className="text-white/50 font-medium mb-1">No assets found</p>
            <p className="text-white/30 text-sm mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="h-9 px-5 rounded-full border border-white/15 bg-white/5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((asset) => (
              <AssetListRow key={asset.id} asset={asset} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── List view row ────────────────────────────────────────────────────────────
import Link from "next/link";
import { Asset } from "@/lib/types";
import { CategoryBadge } from "@/components/assets/CategoryBadge";
import { Droplets, TrendingUp as TrendIcon, MapPin, ArrowRight } from "lucide-react";
import { formatPercent } from "@/lib/utils";

function AssetListRow({ asset }: { asset: Asset }) {
  return (
    <Link href={`/assets/${asset.id}`}>
      <div className="flex items-center gap-5 rounded-2xl border border-white/7 bg-[#0d0d0d] px-5 py-4 hover:border-primary/25 hover:bg-white/3 transition-all duration-200 group">
        {/* Category color bar */}
        <div className="shrink-0">
          <CategoryBadge category={asset.category} />
        </div>

        {/* Name + location */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm group-hover:text-primary transition-colors truncate">
            {asset.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-white/30 shrink-0" />
            <p className="text-xs text-white/40 truncate">{asset.location}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="hidden lg:flex items-center gap-1.5">
          {asset.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/6 border border-white/8 px-2.5 py-0.5 text-xs text-white/50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-white/30">Valuation</p>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(asset.totalValue, true)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/30">Yield</p>
            <p className="text-sm font-semibold text-primary flex items-center gap-1">
              <TrendIcon className="h-3 w-3" />
              {formatPercent(asset.projectedYield)}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-white/30">Liquidity</p>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-primary" />
              <p className="text-sm font-semibold text-white">
                {asset.liquidityScore}/10
              </p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-white/30">Funded</p>
            <p className="text-sm font-semibold text-white">{asset.funded}%</p>
          </div>
          <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}
