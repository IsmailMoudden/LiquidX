"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePortfolioStore } from "@/store/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { CategoryBadge } from "@/components/assets/CategoryBadge";
import { FundingStatusBadge, InvestmentStatusBadge } from "@/components/assets/EscrowStatusBadge";
import { InvestDialog } from "@/components/assets/InvestDialog";
import { ValidatorPanel } from "@/components/assets/ValidatorPanel";
import { Button } from "@/components/ui/button";
import { VALIDATORS } from "@/data/validators";
import {
  TrendingUp,
  MapPin,
  ChevronLeft,
  CheckCircle2,
  Lock,
  Users,
  Calendar,
  Shield,
  Coins,
  ExternalLink,
  FileText,
  Link2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { use } from "react";

function daysLeft(deadline: string): number {
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [investOpen, setInvestOpen] = useState(false);

  const { assets, investments } = usePortfolioStore();
  const asset = assets.find((a) => a.id === id);

  if (!asset) return notFound();

  const validator = VALIDATORS.find((v) => v.id === asset.validatorId);
  const myInvestments = investments.filter((i) => i.assetId === id);
  const myLocked = myInvestments.filter((i) => i.status === "locked" || i.status === "pending" || i.status === "locked-in-escrow");
  const myReleased = myInvestments.filter((i) => i.status === "released" || i.status === "earning");

  const myTotalAmount = myInvestments.reduce((s, i) => s + ((i as any).amount ?? 0), 0);
  const myActiveInvestments = myInvestments.filter((i) => i.status !== "refunded");

  const pct = Math.min(100, (asset.amountRaised / asset.fundingTarget) * 100);
  const days = daysLeft(asset.fundingDeadline);
  const pctColor = pct >= 100 ? "bg-yellow-400" : pct >= 70 ? "bg-emerald-400" : "bg-primary";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/lend"
        className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Loan Pools
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hero */}
          <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden">
            <Image src={asset.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"} alt={asset.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 flex items-center gap-2">
              <CategoryBadge category={asset.category} />
              <FundingStatusBadge status={asset.fundingStatus} />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{asset.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-white/40">
              <MapPin className="h-4 w-4" />
              {asset.location}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4">
              <p className="text-xs text-white/40 mb-1">Interest Rate</p>
              <p className="text-lg font-bold text-primary flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />{formatPercent(asset.projectedYield)}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4">
              <p className="text-xs text-white/40 mb-1">Token Price</p>
              <p className="text-lg font-bold text-white font-mono">${asset.tokenPrice}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4">
              <p className="text-xs text-white/40 mb-1">Lenders</p>
              <p className="text-lg font-bold text-white flex items-center gap-1">
                <Users className="h-4 w-4 text-white/30" />{asset.investorCount}
              </p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4">
              <p className="text-xs text-white/40 mb-1">
                {asset.fundingStatus === "released" ? "Settled" : "Deadline"}
              </p>
              <p className={`text-lg font-bold flex items-center gap-1 ${days <= 7 && days > 0 ? "text-orange-400" : "text-white"}`}>
                <Calendar className="h-4 w-4 text-white/30" />
                {asset.fundingStatus === "released" ? "Done" : days === 0 ? "Today" : `${days}d`}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-6">
            <h2 className="font-semibold text-white mb-3">About this asset</h2>
            <p className="text-sm text-white/50 leading-relaxed">{asset.longDescription}</p>
          </div>

          {/* Highlights */}
          <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-6">
            <h2 className="font-semibold text-white mb-4">Investment Highlights</h2>
            <ul className="space-y-2.5">
              {asset.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-white/70">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs text-white/50"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Proof of Ownership */}
          {asset.proofOfOwnership && (
            <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-white/40" />
                Proof of Ownership
              </h2>
              <div className="space-y-3">
                {/* DID verification badge */}
                <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  asset.proofOfOwnership.didVerified
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-yellow-500/20 bg-yellow-500/5"
                }`}>
                  <div className="flex items-center gap-2.5">
                    {asset.proofOfOwnership.didVerified
                      ? <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                      : <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0" />
                    }
                    <div>
                      <p className={`text-sm font-medium ${asset.proofOfOwnership.didVerified ? "text-emerald-400" : "text-yellow-400"}`}>
                        {asset.proofOfOwnership.didVerified ? "DID Verified" : "DID Pending Verification"}
                      </p>
                      <p className="text-xs text-white/40 font-mono mt-0.5 break-all">
                        {asset.proofOfOwnership.borrowerDid}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/trust"
                    className="shrink-0 flex items-center gap-1 text-xs text-primary hover:underline ml-4"
                  >
                    Trust page <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                {/* Document details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-white/6 bg-white/3 px-4 py-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Document Type</p>
                    <p className="text-sm text-white font-medium">{asset.proofOfOwnership.documentType}</p>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/3 px-4 py-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Issued By</p>
                    <p className="text-sm text-white font-medium">{asset.proofOfOwnership.issuedBy}</p>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/3 px-4 py-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Issue Date</p>
                    <p className="text-sm text-white font-mono">
                      {new Date(asset.proofOfOwnership.issuedDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-white/6 bg-white/3 px-4 py-3">
                    <p className="text-[10px] text-white/30 uppercase tracking-wide mb-0.5">Document Hash</p>
                    <p className="text-xs text-white/60 font-mono truncate">{asset.proofOfOwnership.hash.slice(0, 20)}…</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sources */}
          {asset.sources && asset.sources.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Link2 className="h-4 w-4 text-white/40" />
                Sources & References
              </h2>
              <ul className="space-y-2">
                {asset.sources.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{url}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* My escrow positions */}
          {myInvestments.length > 0 && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-6">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />My Positions
              </h2>
              <div className="space-y-3">
                {myInvestments.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-white/8 bg-white/3 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-white">{formatCurrency((inv as any).amount ?? inv.amountDeposited ?? 0)}</p>
                      <p className="text-xs text-white/40">{(inv as any).tokens ?? inv.shares ?? 0} tokens · {new Date((inv as any).timestamp ?? inv.depositedAt ?? "").toLocaleDateString()}</p>
                      {inv.xrplEscrowHash && (
                        <a
                          href={`https://devnet.xrpl.org/transactions/${inv.xrplEscrowHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline mt-0.5"
                        >
                          <ExternalLink className="h-2.5 w-2.5" />
                          {inv.xrplEscrowHash.slice(0, 16)}…
                        </a>
                      )}
                    </div>
                    <InvestmentStatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — funding + validator panel */}
        <div className="space-y-5">
          {/* My Position — only shown when user has invested */}
          {myActiveInvestments.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />My Position
              </h2>
              <div className="mb-3">
                <p className="text-2xl font-bold text-white font-mono">{formatCurrency(myTotalAmount)}</p>
                <p className="text-xs text-white/40 mt-0.5">{myActiveInvestments.length} position{myActiveInvestments.length > 1 ? "s" : ""}</p>
              </div>
              <div className="space-y-2">
                {myActiveInvestments.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/50 font-mono">{formatCurrency((inv as any).amount ?? 0)}</span>
                    <InvestmentStatusBadge status={inv.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Funding progress */}
          <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white text-sm">Funding Progress</h2>
              <FundingStatusBadge status={asset.fundingStatus} />
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white/40">{formatCurrency(asset.amountRaised, true)} raised</span>
                <span className="font-semibold text-white">{pct.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${pctColor}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between text-xs mt-2">
                <span className="text-white/30">Target: {formatCurrency(asset.fundingTarget, true)}</span>
                <span className="text-white/30">
                  {asset.amountRaised >= asset.fundingTarget ? "✓ Funded" : `${formatCurrency(asset.fundingTarget - asset.amountRaised, true)} left`}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t border-white/8 pt-4">
              <div className="flex justify-between">
                <span className="text-white/40">Min. Investment</span>
                <span className="font-mono text-white">${asset.minInvestment} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Token Price</span>
                <span className="font-mono text-white">${asset.tokenPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Token Supply</span>
                <span className="font-mono text-white">{asset.tokenSupply.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40 flex items-center gap-1">
                  <Shield className="h-3 w-3" />Compliance
                </span>
                <span className={asset.complianceApproved ? "text-emerald-400 text-xs font-medium" : "text-yellow-400 text-xs"}>
                  {asset.complianceApproved ? "✓ Approved" : "Pending"}
                </span>
              </div>
            </div>

            {/* Invest button */}
            {asset.fundingStatus === "open" && (
              <Button className="w-full mt-5" onClick={() => setInvestOpen(true)}>
                <Lock className="h-4 w-4" />
                {myActiveInvestments.length > 0 ? "Add More" : "Invest — Lock in Escrow"}
              </Button>
            )}
            {asset.fundingStatus === "funded" && (
              <div className="mt-5 rounded-xl bg-yellow-500/5 border border-yellow-500/20 px-4 py-3 text-xs text-yellow-400 text-center">
                ✓ Funding target reached — awaiting validator settlement
              </div>
            )}
            {asset.fundingStatus === "released" && (
              <div className="mt-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-3 text-xs text-emerald-400 text-center">
                ✓ Funds released — settlement complete
              </div>
            )}
            {asset.fundingStatus === "refunded" && (
              <div className="mt-5 rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3 text-xs text-red-400 text-center">
                All positions refunded
              </div>
            )}
          </div>

          {/* Validator panel */}
          {validator && (
            <ValidatorPanel asset={asset} validator={validator} />
          )}

          {/* Info note */}
          <p className="text-xs text-white/30 text-center">
            Funds are locked in XRPL Escrow and released only after validator approval
          </p>
        </div>
      </div>

      <InvestDialog asset={asset} open={investOpen} onClose={() => setInvestOpen(false)} />
    </div>
  );
}
