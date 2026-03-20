"use client";

import { useState } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { AssetCard } from "@/components/assets/AssetCard";
import { AssetCategory } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

const CATEGORIES: { value: AssetCategory | "all"; label: string }[] = [
  { value: "all", label: "All Assets" },
  { value: "real-estate", label: "Real Estate" },
  { value: "infrastructure", label: "Infrastructure" },
  { value: "art", label: "Art" },
  { value: "wine", label: "Fine Wine" },
];

const SORT_OPTIONS = [
  { value: "yield-desc", label: "Highest Yield" },
  { value: "value-desc", label: "Highest Valuation" },
  { value: "value-asc", label: "Lowest Valuation" },
  { value: "liquidity-desc", label: "Most Liquid" },
];

export default function MarketplacePage() {
  const { assets } = usePortfolioStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const [sort, setSort] = useState("yield-desc");

  const filtered = assets
    .filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || a.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sort) {
        case "yield-desc":
          return b.projectedYield - a.projectedYield;
        case "value-desc":
          return b.totalValue - a.totalValue;
        case "value-asc":
          return a.totalValue - b.totalValue;
        case "liquidity-desc":
          return b.liquidityScore - a.liquidityScore;
        default:
          return 0;
      }
    });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Marketplace</h1>
        <p className="text-white/40">
          {assets.length} tokenized assets available for fractional investment
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input
            placeholder="Search assets, locations..."
            className="pl-10 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-primary/40 focus:bg-white/7"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-white/30 shrink-0" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-[#0d0d0d]">
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`h-8 px-4 rounded-full text-xs font-medium transition-all duration-200 ${
              category === cat.value
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white/40 mb-4">No assets found</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategory("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
    </div>
  );
}
