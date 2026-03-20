"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils";
import { CategoryBadge } from "@/components/assets/CategoryBadge";
import { TradeDialog } from "@/components/assets/TradeDialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Droplets,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  Coins,
} from "lucide-react";
import { use } from "react";

export default function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tradeMode, setTradeMode] = useState<"buy" | "sell" | null>(null);

  const { assets, holdings } = usePortfolioStore();
  const asset = assets.find((a) => a.id === id);

  if (!asset) return notFound();

  const holding = holdings.find((h) => h.assetId === id);
  const ownedTokens = holding?.tokens ?? 0;
  const ownedValue = ownedTokens * asset.tokenPrice;
  const ownershipPct = (ownedTokens / asset.tokenSupply) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left — image + details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero image */}
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden">
            <Image
              src={asset.image}
              alt={asset.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5">
              <CategoryBadge category={asset.category} />
            </div>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-start gap-2 flex-wrap mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold">{asset.name}</h1>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {asset.location}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Valuation</p>
              <p className="text-lg font-bold">
                {formatCurrency(asset.totalValue, true)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Token Price</p>
              <p className="text-lg font-bold font-mono">${asset.tokenPrice}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Proj. Yield</p>
              <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {formatPercent(asset.projectedYield)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Liquidity</p>
              <p className="text-lg font-bold flex items-center gap-1 text-blue-400">
                <Droplets className="h-4 w-4" />
                {asset.liquidityScore}/10
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-3">About this asset</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {asset.longDescription}
            </p>
          </div>

          {/* Highlights */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Investment Highlights</h2>
            <ul className="space-y-2.5">
              {asset.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right — trade panel */}
        <div className="space-y-4">
          {/* Token info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Token Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Supply</span>
                <span className="font-mono font-medium">
                  {formatNumber(asset.tokenSupply)} tokens
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price per Token</span>
                <span className="font-mono font-medium">
                  ${asset.tokenPrice} USDC
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Min. Investment</span>
                <span className="font-mono font-medium">
                  ${asset.minInvestment} USDC
                </span>
              </div>
            </div>

            {/* Funding bar */}
            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Funded</span>
                <span className="font-semibold">{asset.funded}%</span>
              </div>
              <Progress value={asset.funded} />
            </div>
          </div>

          {/* Your position */}
          {ownedTokens > 0 && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2 text-primary">
                <Coins className="h-4 w-4" />
                Your Position
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Owned</span>
                  <span className="font-mono font-semibold">{ownedTokens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Value</span>
                  <span className="font-mono font-semibold">
                    {formatCurrency(ownedValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ownership</span>
                  <span className="font-mono font-semibold">
                    {ownershipPct.toFixed(3)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Trade buttons */}
          <div className="space-y-2">
            <Button
              className="w-full"
              size="lg"
              onClick={() => setTradeMode("buy")}
            >
              <TrendingUp className="h-4 w-4" />
              Buy Tokens
            </Button>
            {ownedTokens > 0 && (
              <Button
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
                size="lg"
                onClick={() => setTradeMode("sell")}
              >
                Sell Tokens
              </Button>
            )}
          </div>

          {/* Info note */}
          <p className="text-xs text-muted-foreground text-center">
            All transactions settled instantly in USDC. Yields paid quarterly.
          </p>
        </div>
      </div>

      {/* Trade Dialog */}
      {tradeMode && (
        <TradeDialog
          asset={asset}
          mode={tradeMode}
          open={true}
          onClose={() => setTradeMode(null)}
        />
      )}
    </div>
  );
}
