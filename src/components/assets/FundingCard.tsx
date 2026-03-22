"use client";

import Link from "next/link";
import Image from "next/image";
import { Asset } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { CategoryBadge } from "./CategoryBadge";
import { FundingStatusBadge } from "./EscrowStatusBadge";
import { Users, Percent, Calendar, MapPin } from "lucide-react";

function FundingBar({ raised, target }: { raised: number; target: number }) {
  const pct = Math.min(100, (raised / target) * 100);
  const color =
    pct >= 100
      ? "bg-yellow-400"
      : pct >= 70
      ? "bg-emerald-400"
      : "bg-primary";

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-white/40">
          {formatCurrency(raised, true)} raised
        </span>
        <span className="font-semibold text-white">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/8 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1.5">
        <span className="text-white/30">Target: {formatCurrency(target, true)}</span>
        <span className="text-white/30">{raised >= target ? "✓ Funded" : `${formatCurrency(target - raised, true)} left`}</span>
      </div>
    </div>
  );
}

function daysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export function FundingCard({ asset }: { asset: Asset }) {
  const days = daysLeft(asset.fundingDeadline);
  const isSettled = asset.fundingStatus === "released";

  return (
    <Link href={`/assets/${asset.id}`} className="group block">
      <div
        className={`rounded-2xl border bg-[#0d0d0d] overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl ${
          isSettled
            ? "border-emerald-500/20 hover:border-emerald-500/40"
            : asset.fundingStatus === "funded"
            ? "border-yellow-500/20 hover:border-yellow-500/40"
            : "border-white/7 hover:border-primary/30"
        }`}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          <Image
            src={asset.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"}
            alt={asset.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-black/30 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <CategoryBadge category={asset.category} />
          </div>
          <div className="absolute top-3 right-3">
            <FundingStatusBadge status={asset.fundingStatus} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-white leading-snug group-hover:text-primary transition-colors line-clamp-1">
              {asset.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-white/40">
              <MapPin className="h-3 w-3" />
              {asset.location}
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Interest rate</p>
              <p className="text-sm font-bold text-primary flex items-center gap-0.5">
                <Percent className="h-3 w-3" />
                {formatPercent(asset.projectedYield)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Lenders</p>
              <p className="text-sm font-bold text-white flex items-center gap-0.5">
                <Users className="h-3 w-3 text-white/40" />
                {asset.investorCount}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Deadline</p>
              <p className={`text-sm font-bold flex items-center gap-0.5 ${days <= 7 && days > 0 ? "text-orange-400" : "text-white"}`}>
                <Calendar className="h-3 w-3 text-white/40" />
                {isSettled ? "Done" : days === 0 ? "Today" : `${days}d`}
              </p>
            </div>
          </div>

          {/* Funding bar */}
          <FundingBar raised={asset.amountRaised} target={asset.fundingTarget} />
        </div>
      </div>
    </Link>
  );
}
