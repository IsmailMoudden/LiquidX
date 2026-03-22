"use client";

import { useState, useEffect, useCallback } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { AssetCategory } from "@/lib/types";
import { createMPTIssuance, signCollateralContract } from "@/lib/xrpl-client";
import { saveAsset } from "@/lib/supabase-sync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  checkUserEligibility,
  lockCollateral,
  type EligibilityResult,
  COLLATERAL_RATIO,
} from "@/lib/lending-service";
import {
  useIdentityStore,
  useIdentityGate,
  selectXrplAddress,
  selectDisplayDid,
  selectDidVerified,
} from "@/store/identity-store";
import {
  IdentityGateBanner,
  VerifiedIdentityPill,
} from "@/components/identity/IdentityGateBanner";
import {
  CheckCircle2,
  Layers,
  Building2,
  Zap,
  Palette,
  Wine,
  ArrowRight,
  ShieldCheck,
  Fingerprint,
  FileText,
  Upload,
  AlertTriangle,
  Loader2,
  ChevronRight,
  Lock as LockIcon,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS: { value: AssetCategory; label: string; icon: React.ReactNode }[] = [
  { value: "real-estate", label: "Real Estate", icon: <Building2 className="h-4 w-4" /> },
  { value: "infrastructure", label: "Infrastructure", icon: <Zap className="h-4 w-4" /> },
  { value: "art", label: "Art & Collectibles", icon: <Palette className="h-4 w-4" /> },
  { value: "wine", label: "Wine & Spirits", icon: <Wine className="h-4 w-4" /> },
  { value: "collectibles", label: "Collectibles", icon: <Layers className="h-4 w-4" /> },
  { value: "private-equity", label: "Private Equity", icon: <FileText className="h-4 w-4" /> },
  { value: "commodities", label: "Commodities", icon: <ArrowRight className="h-4 w-4" /> },
];

const PLACEHOLDER_IMAGES: Record<AssetCategory, string> = {
  "real-estate": "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
  infrastructure: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80",
  art: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
  wine: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80",
  collectibles: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80",
  "private-equity": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80",
  commodities: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80",
};

// No mock constants — all identity state comes from useIdentityStore (global)

type Step = 1 | 2;

interface FormState {
  name: string;
  category: AssetCategory | "";
  description: string;
  location: string;
  totalValue: string;
  tokenSupply: string;
  projectedYield: string;
  liquidityScore: string;
  // New fields
  imageUrl: string;
  sources: string;         // comma-separated reference URLs
  minInvestment: string;
  docType: string;         // e.g. "Title Deed"
  docIssuedBy: string;     // e.g. "Dubai Land Department"
  docDate: string;         // YYYY-MM-DD
}

const INITIAL_FORM: FormState = {
  name: "",
  category: "",
  description: "",
  location: "",
  totalValue: "",
  tokenSupply: "",
  projectedYield: "",
  liquidityScore: "7",
  imageUrl: "",
  sources: "",
  minInvestment: "100",
  docType: "",
  docIssuedBy: "",
  docDate: "",
};

// ─── Eligibility Gate Component ───────────────────────────────────────────────

function EligibilityGate({
  eligibility,
  isChecking,
  onLockCollateral,
  isLocking,
}: {
  eligibility: EligibilityResult | null;
  isChecking: boolean;
  onLockCollateral: () => void;
  isLocking: boolean;
}) {
  if (isChecking || !eligibility) {
    return (
      <div className="rounded-xl border border-white/8 bg-white/2 px-5 py-4 flex items-center gap-3">
        <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
        <p className="text-sm text-white/50">Checking on-chain eligibility…</p>
      </div>
    );
  }

  if (eligibility.status === "identity-not-verified") {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-500/5 px-5 py-4 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-300">Identity not verified</p>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              You must complete XRP DID verification before registering assets.
              This is a one-time step in your Account.
            </p>
          </div>
        </div>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 border border-red-500/25 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/25 transition-colors"
        >
          <UserIcon className="h-3.5 w-3.5" />
          Verify identity in Account
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  if (eligibility.status === "insufficient-collateral") {
    const needed = eligibility.collateralRequired - eligibility.collateralLocked;
    return (
      <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-5 py-4 space-y-4">
        <div className="flex items-start gap-3">
          <LockIcon className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-300">Insufficient collateral locked</p>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              You must lock {(COLLATERAL_RATIO * 100).toFixed(0)}% of the asset value as
              collateral before tokenizing. This protects lenders against fraudulent listings.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-white/8 bg-black/20 p-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-white/40">Required collateral</span>
            <span className="font-mono text-white">${eligibility.collateralRequired.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Currently locked</span>
            <span className="font-mono text-yellow-400">${eligibility.collateralLocked.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-white/8 pt-1.5 mt-1">
            <span className="text-white/60 font-medium">Still needed</span>
            <span className="font-mono font-bold text-red-400">${needed.toLocaleString()}</span>
          </div>
        </div>

        <Button
          onClick={onLockCollateral}
          disabled={isLocking}
          className="w-full gap-2 bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/25 hover:text-yellow-200"
          variant="outline"
        >
          {isLocking ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Locking collateral on XRPL…
            </>
          ) : (
            <>
              <LockIcon className="h-4 w-4" />
              Lock ${eligibility.collateralRequired.toLocaleString()} collateral on XRPL
            </>
          )}
        </Button>

        <p className="text-[10px] text-white/25 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Collateral is locked in an EscrowCreate transaction on XRPL and returned
          after validator review.
        </p>
      </div>
    );
  }

  // status === "ready"
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-5 py-4 flex items-center gap-3">
      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-emerald-400">Ready to tokenize</p>
        <p className="text-[10px] text-white/35 mt-0.5">
          Identity verified · ${eligibility.collateralLocked.toLocaleString()} collateral locked on XRPL
        </p>
      </div>
    </div>
  );
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1 as Step, label: "Asset" },
    { n: 2 as Step, label: "Confirm" },
  ];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                s.n < current
                  ? "bg-primary border-primary text-black"
                  : s.n === current
                  ? "border-primary text-primary bg-primary/10"
                  : "border-white/15 text-white/30 bg-transparent"
              }`}
            >
              {s.n < current ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </div>
            <span
              className={`text-xs font-medium ${
                s.n === current ? "text-white" : "text-white/30"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-16 sm:w-24 mx-2 mb-5 transition-all ${
                s.n < current ? "bg-primary" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1 — Asset details ───────────────────────────────────────────────────

function AssetStep({
  form,
  update,
  onBack,
  onNext,
}: {
  form: FormState;
  update: (f: keyof FormState, v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const tokenPrice =
    form.totalValue && form.tokenSupply
      ? parseFloat(form.totalValue) / parseFloat(form.tokenSupply)
      : null;

  const isValid =
    form.name.trim() &&
    form.category &&
    form.description.trim() &&
    form.location.trim() &&
    parseFloat(form.totalValue) > 0 &&
    parseFloat(form.tokenSupply) > 0 &&
    parseFloat(form.projectedYield) > 0;

  return (
    <div className="space-y-5">
      {/* What "tokenize" means */}
      <div className="rounded-xl border border-white/8 bg-white/2 px-5 py-4">
        <div className="flex items-start gap-3">
          <Layers className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-white/50 leading-relaxed">
            <span className="text-white font-medium">Registering an asset</span> creates
            a verified on-chain record of ownership. It does not move money.
            Once registered and approved, your asset can be used as collateral to
            request a loan through the Borrow section.
          </p>
        </div>
      </div>

      {/* Asset info */}
      <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm">Asset Information</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Asset Name <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. Paris Haussmann Apartment Block"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Category <span className="text-red-400">*</span>
            </label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Location <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="e.g. Paris, France"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              className="flex min-h-[90px] w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none transition-colors"
              placeholder="Describe the asset, its characteristics, and investment case..."
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Asset media */}
      <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm">Media & References</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Image URL
            </label>
            <Input
              placeholder="https://… (leave blank to use category default)"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              type="url"
            />
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imageUrl}
                alt="preview"
                className="mt-2 h-24 w-full object-cover rounded-lg opacity-70"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Reference URLs <span className="text-white/25">(comma-separated)</span>
            </label>
            <Input
              placeholder="https://land-registry.gov/…, https://…"
              value={form.sources}
              onChange={(e) => update("sources", e.target.value)}
            />
            <p className="text-[10px] text-white/25 mt-1">
              Public links to registries, valuations, or legal documents that verify this asset.
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Minimum Investment (USDC)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <Input
                type="number"
                placeholder="100"
                className="pl-7 font-mono"
                value={form.minInvestment}
                onChange={(e) => update("minInvestment", e.target.value)}
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Proof of ownership */}
      <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <Upload className="h-4 w-4 text-white/40" />
          Proof of Ownership Document
        </h3>
        <p className="text-xs text-white/40">
          Provide details of the legal document that confirms your ownership.
          The document hash will be anchored to your DID — the file itself is never stored by LiquidX.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Document Type</label>
            <Input
              placeholder="e.g. Title Deed"
              value={form.docType}
              onChange={(e) => update("docType", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Issued By</label>
            <Input
              placeholder="e.g. Dubai Land Department"
              value={form.docIssuedBy}
              onChange={(e) => update("docIssuedBy", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Issue Date</label>
            <Input
              type="date"
              value={form.docDate}
              onChange={(e) => update("docDate", e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <p className="text-[10px] text-white/25 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Document metadata is hashed and linked to your XRP DID on-chain.
        </p>
      </div>

      {/* Tokenization params */}
      <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-5 space-y-4">
        <h3 className="font-semibold text-white text-sm">Tokenization Parameters</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Total Valuation (USD) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <Input
                type="number"
                placeholder="1000000"
                className="pl-7 font-mono"
                value={form.totalValue}
                onChange={(e) => update("totalValue", e.target.value)}
                min="1000"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Token Supply <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              placeholder="10000"
              className="font-mono"
              value={form.tokenSupply}
              onChange={(e) => update("tokenSupply", e.target.value)}
              min="1"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Projected Annual Yield (%) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="7.5"
                step="0.1"
                className="pr-8 font-mono"
                value={form.projectedYield}
                onChange={(e) => update("projectedYield", e.target.value)}
                min="0"
                max="50"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">%</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Liquidity Score (1–10)
            </label>
            <Input
              type="number"
              min="1"
              max="10"
              className="font-mono"
              value={form.liquidityScore}
              onChange={(e) => update("liquidityScore", e.target.value)}
            />
          </div>
        </div>

        {tokenPrice !== null && tokenPrice > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 text-sm">
            <span className="text-white/50">Computed Token Price</span>
            <span className="font-mono font-bold text-primary">
              ${tokenPrice.toFixed(2)} USDC
            </span>
          </div>
        )}
      </div>

      <Button onClick={onNext} disabled={!isValid} className="w-full gap-2">
        Review & Confirm
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Step 2 — Legal confirmation ─────────────────────────────────────────────

function ConfirmStep({
  form,
  did,
  xrplAddress,
  onBack,
  onSubmit,
  isSubmitting,
  eligibility,
  isCheckingEligibility,
  onLockCollateral,
  isLockingCollateral,
  onContractSigned,
  contractTxHash,
}: {
  form: FormState;
  did: string;
  xrplAddress: string;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  eligibility: EligibilityResult | null;
  isCheckingEligibility: boolean;
  onLockCollateral: () => void;
  isLockingCollateral: boolean;
  onContractSigned: (contractHash: string, txHash: string) => void;
  contractTxHash: string;
}) {
  const [isSigning, setIsSigning] = useState(false);
  const [signError, setSignError] = useState("");
  const tokenPrice =
    form.totalValue && form.tokenSupply
      ? parseFloat(form.totalValue) / parseFloat(form.tokenSupply)
      : null;

  const handleSign = async () => {
    setIsSigning(true);
    setSignError("");
    try {
      const contractJson = JSON.stringify({
        type: "LiquidX/CollateralContract",
        version: "1.0",
        issuerDid: did,
        issuerAddress: xrplAddress,
        asset: {
          name: form.name,
          category: form.category,
          location: form.location,
          totalValue: parseFloat(form.totalValue),
          tokenSupply: parseFloat(form.tokenSupply),
        },
        terms: {
          collateralRatio: "10% of asset value locked as XRPL escrow",
          repaymentObligation: "3 equal instalments via XRPL LoanPay transactions",
          defaultConsequences: [
            "Outstanding principal + accrued interest reversed to lenders in full",
            "Late penalty: 2% per month overdue, compounded monthly",
            "Collateral escrow released to lenders pro-rata",
            "Asset ownership rights ceded to LiquidX enforcement vault",
            "XRPL token freeze invoked on mptIssuanceId — no transfer possible",
          ],
          enforcementMechanism: "XRP DID-anchored identity — immutable public on-chain record",
        },
        signedAt: new Date().toISOString(),
      });
      const result = await signCollateralContract(xrplAddress, contractJson);
      onContractSigned(result.contractHash, result.txHash);
    } catch (err) {
      setSignError(err instanceof Error ? err.message : "Signing failed");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-xl border border-white/8 bg-[#0d0d0d] divide-y divide-white/6">
        <div className="px-5 py-4">
          <p className="text-xs text-white/30 uppercase tracking-wide mb-3">Asset Summary</p>
          <div className="space-y-2 text-sm">
            {[
              { label: "Name", value: form.name },
              { label: "Category", value: CATEGORY_OPTIONS.find(o => o.value === form.category)?.label ?? form.category },
              { label: "Location", value: form.location },
              { label: "Valuation", value: `$${parseFloat(form.totalValue || "0").toLocaleString()}` },
              { label: "Token Supply", value: parseFloat(form.tokenSupply || "0").toLocaleString() },
              { label: "Token Price", value: tokenPrice ? `$${tokenPrice.toFixed(2)} USDC` : "—" },
              { label: "Projected Yield", value: `${form.projectedYield}% per year` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-white/40">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-4">
          <p className="text-xs text-white/30 uppercase tracking-wide mb-2">Identity</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <p className="font-mono text-xs text-white/60 break-all">{did}</p>
          </div>
          <p className="text-xs text-emerald-400 mt-1">✓ Verified identity</p>
        </div>
      </div>

      {/* On-chain eligibility check */}
      <EligibilityGate
        eligibility={eligibility}
        isChecking={isCheckingEligibility}
        onLockCollateral={onLockCollateral}
        isLocking={isLockingCollateral}
      />

      {/* Collateral Contract — Digital Signature */}
      <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-5 space-y-4">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-orange-300 uppercase tracking-wide">
            Collateral Contract — Digital Signature Required
          </p>
        </div>

        {/* Contract terms */}
        <div className="rounded-lg border border-white/8 bg-black/20 p-4 space-y-3">
          <p className="text-xs text-white/50 uppercase tracking-wide">By signing, you commit to:</p>
          <ul className="space-y-2 text-sm text-white/70">
            {[
              "You are the lawful owner and have full authority to tokenize this asset.",
              "10% of the asset value is locked as XRPL collateral escrow before tokenization.",
              "Loan repayment is mandatory — 3 equal instalments via XRPL LoanPay transactions.",
              "In case of payment default: outstanding principal + interest reversed to lenders in full, late penalty of 2% per month compounded, collateral escrow released to lenders pro-rata.",
              "If default is unresolved: asset ownership rights are ceded to the LiquidX enforcement vault and XRPL token freeze is invoked — no transfer possible.",
              "This record is permanently anchored to your XRP DID. It cannot be disputed or disowned.",
            ].map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5 shrink-0 text-xs font-bold">{i + 1}.</span>
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sign button or signed state */}
        {contractTxHash ? (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-xs font-semibold text-emerald-300">Contract signed on XRPL</p>
            </div>
            <p className="text-[10px] font-mono text-white/35 break-all pl-6">
              tx: {contractTxHash}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              onClick={handleSign}
              disabled={isSigning || !eligibility?.eligible}
              className="w-full gap-2 bg-orange-500/15 border border-orange-500/30 text-orange-300 hover:bg-orange-500/25"
              variant="outline"
            >
              {isSigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Anchoring contract on XRPL…
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4" />
                  Sign Contract with XRP DID
                </>
              )}
            </Button>
            {signError && (
              <p className="text-xs text-red-400 text-center">{signError}</p>
            )}
            <p className="text-[10px] text-white/25 text-center">
              Submits a Payment tx with your contract hash as a memo — immutable, public, on-chain.
            </p>
          </div>
        )}
      </div>

      {/* What happens next */}
      <div className="rounded-xl border border-white/8 bg-white/2 px-5 py-4 space-y-2">
        <p className="text-xs text-white/40 uppercase tracking-wide">What happens next</p>
        <div className="space-y-2 text-xs text-white/50">
          <div className="flex items-start gap-2">
            <span className="text-primary font-mono shrink-0">1.</span>
            Your asset is submitted for validator review (compliance + ownership check).
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-mono shrink-0">2.</span>
            Once approved, an MPT (Multi-Purpose Token) issuance is created on XRPL.
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-mono shrink-0">3.</span>
            You can then open a lending pool and accept capital from lenders.
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-mono shrink-0">4.</span>
            To borrow against the asset, go to the{" "}
            <Link href="/borrow" className="text-primary hover:underline">
              Borrow
            </Link>{" "}
            section after approval.
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!contractTxHash || isSubmitting || !eligibility?.eligible || isCheckingEligibility}
          className="flex-1 gap-2"
        >
          {isSubmitting ? (
            <>Processing…</>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Submit for Review
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

// User address read from global identity store (set in Account page)

export default function TokenizePage() {
  const tokenizeAsset = usePortfolioStore((s) => s.tokenizeAsset);
  const mintMPT = usePortfolioStore((s) => s.mintMPT);

  // ── Identity — global store (single source of truth) ─────────────────────
  const { status: gateStatus } = useIdentityGate();
  const xrplAddress = useIdentityStore(selectXrplAddress);
  const isDidVerified = useIdentityStore(selectDidVerified);
  const displayDid = useIdentityStore(selectDisplayDid);

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [success, setSuccess] = useState(false);
  const [newAssetId, setNewAssetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contractHash, setContractHash] = useState("");
  const [contractTxHash, setContractTxHash] = useState("");

  // ── Eligibility state ─────────────────────────────────────────────────────
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isLockingCollateral, setIsLockingCollateral] = useState(false);

  const runEligibilityCheck = useCallback(async () => {
    const assetValue = parseFloat(form.totalValue);
    if (!isDidVerified || !xrplAddress || isNaN(assetValue) || assetValue <= 0) {
      setEligibility(null);
      return;
    }
    setIsCheckingEligibility(true);
    try {
      const result = await checkUserEligibility({
        userAddress: xrplAddress,
        isDidVerified,
        assetValueUsd: assetValue,
      });
      setEligibility(result);
    } finally {
      setIsCheckingEligibility(false);
    }
  }, [form.totalValue, xrplAddress, isDidVerified]);

  useEffect(() => {
    if (step === 2) runEligibilityCheck();
  }, [step, runEligibilityCheck]);

  const handleLockCollateral = async () => {
    if (!eligibility || !xrplAddress) return;
    setIsLockingCollateral(true);
    try {
      const result = await lockCollateral({
        userAddress: xrplAddress,
        amountUsdc: eligibility.collateralRequired,
      });
      if (result.ok) await runEligibilityCheck();
    } finally {
      setIsLockingCollateral(false);
    }
  };

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    if (!form.category) return;
    if (!eligibility?.eligible) return;
    if (!contractTxHash) return;
    setIsSubmitting(true);
    try {
      const tokenPrice =
        parseFloat(form.totalValue) / parseFloat(form.tokenSupply);
      const sourcesArr = form.sources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const newAsset = tokenizeAsset({
        name: form.name,
        category: form.category as AssetCategory,
        description: form.description,
        longDescription: form.description,
        image: form.imageUrl.trim() || PLACEHOLDER_IMAGES[form.category as AssetCategory],
        location: form.location,
        totalValue: parseFloat(form.totalValue),
        tokenSupply: parseFloat(form.tokenSupply),
        tokenPrice,
        projectedYield: parseFloat(form.projectedYield),
        liquidityScore: parseInt(form.liquidityScore),
        minInvestment: parseFloat(form.minInvestment) || 100,
        tags: [form.category],
        highlights: [
          `${form.projectedYield}% projected annual yield`,
          `Total valuation: $${parseFloat(form.totalValue).toLocaleString()}`,
          `${form.tokenSupply} tokens at $${tokenPrice.toFixed(2)} each`,
          `Issued by verified identity — DID anchored on XRPL`,
        ],
        fundingTarget: parseFloat(form.totalValue),
        fundingDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        validatorId: "validator-001",
        sources: sourcesArr,
        issuerDid: displayDid || undefined,
        issuerVerified: isDidVerified,
        legalDeclarationHash: contractHash || undefined,
        contractTxHash: contractTxHash || undefined,
        ...(form.docType && {
          proofOfOwnership: {
            documentType: form.docType,
            issuedBy: form.docIssuedBy,
            issuedDate: form.docDate,
            hash: "",
            borrowerDid: displayDid || "",
            didVerified: isDidVerified,
          },
        }),
      });
      const xrpl = await createMPTIssuance({
        assetName: form.name,
        maxAmount: parseFloat(form.tokenSupply),
        transferFeePercent: 0.5,
        requireAuth: true,
      });
      mintMPT(newAsset.id, xrpl);
      // Persist to Supabase (fire-and-forget — store already updated)
      if (xrplAddress) {
        saveAsset(xrplAddress, { ...newAsset, mptIssuanceId: xrpl.mptIssuanceId }).catch(
          (e) => console.warn("[Tokenize] Supabase saveAsset failed:", e)
        );
      }
      setNewAssetId(newAsset.id);
      setSuccess(true);
    } catch (err) {
      console.error("[Tokenize] Failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="flex justify-center mb-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <ShieldCheck className="h-3.5 w-3.5 text-black" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          Asset Submitted for Review
        </h1>
        <p className="text-white/50 mb-2 leading-relaxed">
          <span className="text-white font-medium">{form.name}</span> has been
          registered and linked to your verified identity.
        </p>
        <p className="text-xs text-white/30 mb-8">
          A validator will review your asset and proof of ownership within 24–48 hours.
          You will be notified once approved. To request a loan against this asset,
          visit the Borrow section after approval.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            Identity Verified
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
            <Layers className="h-3 w-3" />
            Pending Validator Review
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Fingerprint className="h-3 w-3" />
            DID Anchored
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <a href={`/assets/${newAssetId}`}>
              View Asset
              <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/borrow">Go to Borrow</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Register an Asset</h1>
            <p className="text-xs text-white/30 mt-0.5">
              Ownership-verified · Validator-approved · XRPL-settled
            </p>
          </div>
        </div>
        <p className="text-white/40 text-sm leading-relaxed mt-3">
          Registering an asset creates an identity-linked ownership record on the XRP
          Ledger. This is the first step before opening a lending pool or requesting
          a loan. No money is moved at this stage.
        </p>

        {/* Tokenize vs Borrow clarity */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Register Asset (this page)
            </p>
            <p className="text-xs text-white/50">
              Create an on-chain ownership record. No money involved.
            </p>
          </div>
          <div className="rounded-lg border border-white/8 bg-white/2 px-4 py-3">
            <p className="text-xs font-semibold text-white/50 mb-1 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Borrow Against It
            </p>
            <p className="text-xs text-white/30">
              After approval, request a loan in the{" "}
              <Link href="/borrow" className="text-primary hover:underline">
                Borrow
              </Link>{" "}
              section.
            </p>
          </div>
        </div>
      </div>

      {/* ── Identity gate (wallet + DID) ─────────────────────────────────── */}
      <IdentityGateBanner status={gateStatus} action="register assets" />

      {/* ── Verified identity pill ───────────────────────────────────────── */}
      {gateStatus === "ready" && displayDid && (
        <VerifiedIdentityPill displayDid={displayDid} />
      )}

      {/* Step indicator + steps — only shown when identity is ready */}
      {gateStatus === "ready" && (
        <>
          <StepIndicator current={step} />

          {step === 1 && (
            <AssetStep
              form={form}
              update={update}
              onBack={() => {}}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <ConfirmStep
              form={form}
              did={displayDid ?? ""}
              xrplAddress={xrplAddress ?? ""}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              eligibility={eligibility}
              isCheckingEligibility={isCheckingEligibility}
              onLockCollateral={handleLockCollateral}
              isLockingCollateral={isLockingCollateral}
              onContractSigned={(h, t) => { setContractHash(h); setContractTxHash(t); }}
              contractTxHash={contractTxHash}
            />
          )}
        </>
      )}
    </div>
  );
}
