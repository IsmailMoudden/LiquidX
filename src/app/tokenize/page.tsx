"use client";

import { useState, useEffect, useCallback } from "react";
import { usePortfolioStore } from "@/store/portfolio-store";
import { AssetCategory } from "@/lib/types";
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
  Lock,
  AlertTriangle,
  Loader2,
  ChevronRight,
  User,
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

// Simulated DID — in production this comes from the user's Account/identity state
const MOCK_DID = "did:xrpl:1:rN7n3473SaZBCG4dFL75SJQnvoFMoFGC9";
// Simulate: true = identity already verified in Account page
const MOCK_IDENTITY_VERIFIED = true;

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
          <User className="h-3.5 w-3.5" />
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
          <Lock className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
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
              <Lock className="h-4 w-4" />
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

      {/* Proof of ownership */}
      <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-5 space-y-3">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <Upload className="h-4 w-4 text-white/40" />
          Proof of Ownership
        </h3>
        <p className="text-xs text-white/40">
          Upload a legal document confirming your ownership (title deed, notarized
          contract, or official registry extract). This document is hashed and
          anchored to your DID — it is not stored by LiquidX.
        </p>
        <div className="rounded-lg border border-dashed border-white/15 bg-white/2 px-4 py-6 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/3 transition-all group">
          <Upload className="h-6 w-6 text-white/20 group-hover:text-primary/50 mx-auto mb-2 transition-colors" />
          <p className="text-xs text-white/30 group-hover:text-white/50">
            Click to upload or drag and drop
          </p>
          <p className="text-[10px] text-white/20 mt-1">PDF, JPG, PNG — max 10 MB</p>
        </div>
        <p className="text-[10px] text-white/25 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Document hash will be stored on XRPL linked to your DID. The file itself is encrypted and never exposed.
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
  onBack,
  onSubmit,
  isSubmitting,
  eligibility,
  isCheckingEligibility,
  onLockCollateral,
  isLockingCollateral,
}: {
  form: FormState;
  did: string;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  eligibility: EligibilityResult | null;
  isCheckingEligibility: boolean;
  onLockCollateral: () => void;
  isLockingCollateral: boolean;
}) {
  const [accepted, setAccepted] = useState(false);
  const tokenPrice =
    form.totalValue && form.tokenSupply
      ? parseFloat(form.totalValue) / parseFloat(form.tokenSupply)
      : null;

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

      {/* Legal commitment — mandatory */}
      <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 p-5 space-y-4">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-xs font-semibold text-orange-300 uppercase tracking-wide">
            Legal Declaration — Required
          </p>
        </div>

        <div className="rounded-lg border border-white/8 bg-black/20 p-4">
          <p className="text-sm text-white/80 leading-relaxed">
            I,{" "}
            <span className="text-white font-semibold">the holder of DID</span>{" "}
            <span className="font-mono text-primary text-xs break-all">{did}</span>,
            hereby declare that:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">→</span>
              I am the lawful owner of the asset described above and have full
              authority to tokenize it.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">→</span>
              All information provided is accurate, complete, and not misleading.
              I understand that lenders will rely on this information to make
              financial decisions.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">→</span>
              This asset registration is permanently linked to my verified
              decentralized identity. I cannot dispute or disown this record.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">→</span>
              I accept full legal responsibility for any loss suffered by lenders
              as a result of fraud, misrepresentation, or willful omission, and
              agree to compensate them accordingly.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5 shrink-0">→</span>
              I acknowledge that LiquidX may enforce XRPL freeze and clawback
              mechanisms on issued tokens in the event of regulatory action or
              confirmed fraud.
            </li>
          </ul>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            onClick={() => setAccepted((v) => !v)}
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
              accepted
                ? "bg-primary border-primary"
                : "border-white/20 group-hover:border-primary/50"
            }`}
          >
            {accepted && <CheckCircle2 className="h-3 w-3 text-black" />}
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            I have read and understood the declaration above. I confirm that I
            own this asset and accept full legal responsibility for the accuracy
            of the information provided and for any harm caused to lenders by
            fraud or misrepresentation.{" "}
            <span className="text-white font-medium">
              This confirmation is cryptographically signed with my XRP DID.
            </span>
          </p>
        </label>
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
          disabled={!accepted || isSubmitting || !eligibility?.eligible || isCheckingEligibility}
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

// Mock user address — in production: read from wallet / auth context
const MOCK_USER_ADDRESS = "rN7n3473SaZBCG4dFL75SJQnvoFMoFGC9";

export default function TokenizePage() {
  const tokenizeAsset = usePortfolioStore((s) => s.tokenizeAsset);

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [success, setSuccess] = useState(false);
  const [newAssetId, setNewAssetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Eligibility state ─────────────────────────────────────────────────────
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [isLockingCollateral, setIsLockingCollateral] = useState(false);

  // Re-run eligibility check whenever totalValue or identity changes
  const runEligibilityCheck = useCallback(async () => {
    const assetValue = parseFloat(form.totalValue);
    if (!MOCK_IDENTITY_VERIFIED || isNaN(assetValue) || assetValue <= 0) {
      // If identity not verified, surface that immediately without on-chain call
      if (!MOCK_IDENTITY_VERIFIED) {
        setEligibility({
          eligible: false,
          status: "identity-not-verified",
          message: "Identity not verified.",
          collateralRequired: 0,
          collateralLocked: 0,
          collateralSufficient: false,
          didVerified: false,
        });
      } else {
        setEligibility(null);
      }
      return;
    }
    setIsCheckingEligibility(true);
    try {
      const result = await checkUserEligibility({
        userAddress: MOCK_USER_ADDRESS,
        isDidVerified: MOCK_IDENTITY_VERIFIED,
        assetValueUsd: assetValue,
      });
      setEligibility(result);
    } finally {
      setIsCheckingEligibility(false);
    }
  }, [form.totalValue]);

  // Check eligibility when moving to confirm step
  useEffect(() => {
    if (step === 2) {
      runEligibilityCheck();
    }
  }, [step, runEligibilityCheck]);

  const handleLockCollateral = async () => {
    if (!eligibility) return;
    setIsLockingCollateral(true);
    try {
      const result = await lockCollateral({
        userAddress: MOCK_USER_ADDRESS,
        amountUsdc: eligibility.collateralRequired,
      });
      if (result.ok) {
        // Re-verify on-chain after locking
        await runEligibilityCheck();
      }
    } finally {
      setIsLockingCollateral(false);
    }
  };

  const update = (field: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    if (!form.category) return;
    // Final eligibility guard — must be ready
    if (!eligibility?.eligible) return;
    setIsSubmitting(true);

    // Simulate async submission
    setTimeout(() => {
      const tokenPrice =
        parseFloat(form.totalValue) / parseFloat(form.tokenSupply);
      const newAsset = tokenizeAsset({
        name: form.name,
        category: form.category as AssetCategory,
        description: form.description,
        longDescription: form.description,
        image: PLACEHOLDER_IMAGES[form.category as AssetCategory],
        location: form.location,
        totalValue: parseFloat(form.totalValue),
        tokenSupply: parseFloat(form.tokenSupply),
        tokenPrice,
        projectedYield: parseFloat(form.projectedYield),
        liquidityScore: parseInt(form.liquidityScore),
        minInvestment: 100,
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
      });
      setNewAssetId(newAsset.id);
      setSuccess(true);
      setIsSubmitting(false);
    }, 1500);
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

      {/* ── DID gate — shown if identity not yet verified ────────────────── */}
      {!MOCK_IDENTITY_VERIFIED && (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/15 shrink-0">
              <Lock className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white mb-1">Identity verification required</p>
              <p className="text-sm text-white/50 leading-relaxed mb-4">
                You must verify your identity with an XRP DID before registering assets
                or requesting loans. This is a one-time step done in your Account.
              </p>
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black hover:bg-primary/90 transition-colors"
              >
                <User className="h-4 w-4" />
                Verify identity in Account
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Verified identity pill ───────────────────────────────────────── */}
      {MOCK_IDENTITY_VERIFIED && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 mb-6">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-400">Identity verified</p>
            <p className="font-mono text-[10px] text-white/30 truncate mt-0.5">{MOCK_DID}</p>
          </div>
          <Link href="/account" className="text-[10px] text-white/30 hover:text-white/60 shrink-0">
            Manage →
          </Link>
        </div>
      )}

      {/* Step indicator + steps — only shown when identity is verified */}
      {MOCK_IDENTITY_VERIFIED && (
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
              did={MOCK_DID}
              onBack={() => setStep(1)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              eligibility={eligibility}
              isCheckingEligibility={isCheckingEligibility}
              onLockCollateral={handleLockCollateral}
              isLockingCollateral={isLockingCollateral}
            />
          )}
        </>
      )}
    </div>
  );
}
