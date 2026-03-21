"use client";

import Link from "next/link";
import Image from "next/image";
import { Asset } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Droplets, MapPin } from "lucide-react";

interface AssetCardProps {
  asset: Asset;
}

export function AssetCard({ asset }: AssetCardProps) {
  return (
    <Link href={`/assets/${asset.id}`} className="group block">
      <div className="rounded-2xl border border-white/7 bg-[#0d0d0d] overflow-hidden transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={asset.image}
            alt={asset.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <CategoryBadge category={asset.category} />
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
            <Droplets className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              {asset.liquidityScore}/10
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-semibold text-white leading-snug group-hover:text-primary transition-colors line-clamp-1">
              {asset.name}
            </h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40 mb-3">
            <MapPin className="h-3 w-3 text-primary" />
            <span>{asset.location}</span>
          </div>
          <p className="text-sm text-white/40 line-clamp-2 mb-4 leading-relaxed">
            {asset.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/12 bg-white/6 px-2.5 py-0.5 text-xs font-medium text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-white/5 border border-white/6 p-2.5">
              <p className="text-xs text-white/35 mb-0.5">Valuation</p>
              <p className="text-sm font-semibold text-primary">
                {formatCurrency(asset.totalValue, true)}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/6 p-2.5">
              <p className="text-xs text-white/35 mb-0.5">Token</p>
              <p className="text-sm font-semibold text-white">
                ${asset.tokenPrice}
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/6 p-2.5">
              <p className="text-xs text-white/35 mb-0.5">Yield</p>
              <p className="text-sm font-semibold text-primary flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {formatPercent(asset.projectedYield)}
              </p>
            </div>
          </div>

          {/* Funding progress */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/40">Funded</span>
              <span className="font-semibold text-primary">{Math.min(100, Math.round((asset.amountRaised / asset.fundingTarget) * 100))}%</span>
            </div>
            <Progress value={Math.min(100, (asset.amountRaised / asset.fundingTarget) * 100)} className="h-1.5 bg-white/8" />
          </div>
        </div>
      </div>
    </Link>
  );
}
