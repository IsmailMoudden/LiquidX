"use client";

import { usePortfolioStore } from "@/store/portfolio-store";
import { ValidatorPanel } from "@/components/assets/ValidatorPanel";
import { FundingStatusBadge } from "@/components/assets/EscrowStatusBadge";
import { VALIDATORS } from "@/data/validators";
import { formatCurrency, formatPercent } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
  Shield,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Lock,
  Users,
} from "lucide-react";

export default function ValidatorPage() {
  const { assets, investments } = usePortfolioStore();

  // Show assets that have validator activity (funded, open with escrow, or released)
  const actionableAssets = assets.filter(
    (a) =>
      a.fundingStatus === "funded" ||
      (a.fundingStatus === "open" &&
        investments.some((i) => i.assetId === a.id && (i.status === "locked" || i.status === "pending")))
  );
  const settledAssets = assets.filter((a) => a.fundingStatus === "released" || a.fundingStatus === "refunded");

  const totalSettled = VALIDATORS.reduce((s, v) => s + v.totalVolumeSettled, 0);
  const totalApproved = VALIDATORS.reduce((s, v) => s + v.approvedCount, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#060606]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary uppercase tracking-widest mb-4">
                Settlement Dashboard
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Validator Panel</h1>
              <p className="text-white/40 text-sm">
                Review funded assets and approve or refund escrow positions
              </p>
            </div>

            <div className="flex gap-6">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Total Settled</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalSettled, true)}</p>
              </div>
              <div className="w-px bg-white/8" />
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wide mb-1">Deals Closed</p>
                <p className="text-xl font-bold text-primary">{totalApproved}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Validator profiles */}
        <div>
          <p className="text-xs text-white/30 uppercase tracking-wide mb-4">Active Validators</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {VALIDATORS.map((v) => (
              <div key={v.id} className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm">{v.name}</p>
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-white/40 truncate">{v.organization}</p>
                  <p className="text-xs text-white/30 mt-1">
                    XRPL: <span className="font-mono text-white/40">{v.xrplAddress.slice(0, 12)}…</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-white/30 mb-0.5">Fee</p>
                  <p className="text-sm font-bold text-primary">{formatPercent(v.feePercentage)}</p>
                  <p className="text-[10px] text-white/30 mt-1">{v.approvedCount} deals</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending action */}
        {actionableAssets.length > 0 ? (
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wide mb-4">Pending Action</p>
            <div className="space-y-6">
              {actionableAssets.map((asset) => {
                const validator = VALIDATORS.find((v) => v.id === asset.validatorId);
                if (!validator) return null;
                return (
                  <div key={asset.id} className="rounded-2xl border border-white/8 bg-[#0a0a0a] overflow-hidden">
                    {/* Asset summary */}
                    <div className="flex items-center gap-4 p-5 border-b border-white/6">
                      <div className="relative h-14 w-20 rounded-lg overflow-hidden shrink-0">
                        <Image src={asset.image} alt={asset.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/assets/${asset.id}`} className="font-semibold text-white hover:text-primary transition-colors">
                            {asset.name}
                          </Link>
                          <FundingStatusBadge status={asset.fundingStatus} />
                        </div>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-white/40">
                          <MapPin className="h-3 w-3" />{asset.location}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 shrink-0 text-right">
                        <div>
                          <p className="text-xs text-white/30">Raised</p>
                          <p className="text-sm font-semibold text-white font-mono">
                            {formatCurrency(asset.amountRaised, true)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/30">Investors</p>
                          <p className="text-sm font-semibold text-white flex items-center gap-1 justify-end">
                            <Users className="h-3.5 w-3.5 text-white/30" />
                            {asset.investorCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-white/30">Yield</p>
                          <p className="text-sm font-semibold text-primary flex items-center gap-1 justify-end">
                            <TrendingUp className="h-3.5 w-3.5" />
                            {formatPercent(asset.projectedYield)}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Validator panel */}
                    <div className="p-5">
                      <ValidatorPanel asset={asset} validator={validator} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-12 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-semibold text-white mb-1">No pending actions</p>
            <p className="text-sm text-white/40">All assets are awaiting funding or have been settled</p>
          </div>
        )}

        {/* Recently settled */}
        {settledAssets.length > 0 && (
          <div>
            <p className="text-xs text-white/30 uppercase tracking-wide mb-4">Recently Settled</p>
            <div className="space-y-3">
              {settledAssets.map((asset) => (
                <Link key={asset.id} href={`/assets/${asset.id}`}>
                  <div className="flex items-center gap-4 rounded-2xl border border-white/6 bg-[#0d0d0d] px-5 py-4 hover:border-white/15 transition-all group">
                    <div className="relative h-10 w-14 rounded-lg overflow-hidden shrink-0">
                      <Image src={asset.image} alt={asset.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">{asset.name}</p>
                      <p className="text-xs text-white/30">{asset.location}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-white/30">Total Raised</p>
                        <p className="text-sm font-mono font-semibold text-white">{formatCurrency(asset.amountRaised, true)}</p>
                      </div>
                      <FundingStatusBadge status={asset.fundingStatus} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
