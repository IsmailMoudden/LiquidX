"use client";

import {
  ShieldCheck,
  Fingerprint,
  FileText,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Users,
  Scale,
  Layers,
  Zap,
  Eye,
  RefreshCw,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

// ─── Reusable section heading ─────────────────────────────────────────────────

function SectionHeading({
  icon,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-bold text-white">{label}</h2>
        {sublabel && <p className="text-sm text-white/40 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-white/6 last:border-0">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white mb-1">{title}</p>
        <p className="text-sm text-white/50 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TrustPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Trust & Compliance</h1>
            <p className="text-sm text-white/40 mt-0.5">
              How LiquidX protects lenders and holds issuers accountable
            </p>
          </div>
        </div>
        <p className="text-white/50 leading-relaxed text-sm mt-4">
          LiquidX is built on the principle that every asset must be traceable to a
          real, verified, legally accountable person or entity. This page explains the
          identity, verification, legal, and technical frameworks that make this
          possible.
        </p>

        {/* Trust badges row */}
        <div className="flex flex-wrap gap-2 mt-5">
          {[
            { icon: <Fingerprint className="h-3.5 w-3.5" />, label: "XRP DID Identity Layer" },
            { icon: <BadgeCheck className="h-3.5 w-3.5" />, label: "Validator-Approved Assets" },
            { icon: <Scale className="h-3.5 w-3.5" />, label: "Legal Accountability" },
            { icon: <Zap className="h-3.5 w-3.5" />, label: "XRPL Settlement" },
          ].map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary"
            >
              {icon}
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── 1. Identity Layer ──────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-6">
        <SectionHeading
          icon={<Fingerprint className="h-5 w-5" />}
          label="Decentralized Identity (XRP DID)"
          sublabel="Every issuer is a verified, named entity"
        />

        <p className="text-sm text-white/50 mb-5 leading-relaxed">
          LiquidX uses the{" "}
          <a
            href="https://xrpl.org/docs/concepts/did"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            XRP Ledger DID standard <ExternalLink className="h-3 w-3" />
          </a>{" "}
          to anchor every asset issuer's identity on-chain. A Decentralized
          Identifier (DID) is a globally unique, self-sovereign identifier that
          binds together a person's legal identity, their wallet address, and their
          on-chain activity — without requiring any central authority.
        </p>

        <div className="space-y-0 rounded-xl border border-white/8 bg-white/2 px-5 divide-y divide-white/6">
          <FeatureRow
            icon={<Fingerprint className="h-4 w-4" />}
            title="One DID per issuer"
            description="Before any asset can be registered, the issuer must create or connect an XRP DID. This DID is permanently associated with their identity and cannot be transferred or reused by another person."
          />
          <FeatureRow
            icon={<Lock className="h-4 w-4" />}
            title="KYC bound to DID"
            description="Identity verification (KYC) is performed by a licensed verification provider. The result is cryptographically anchored to the DID — meaning every on-chain action can be traced back to a real person or legal entity."
          />
          <FeatureRow
            icon={<Eye className="h-4 w-4" />}
            title="Traceability and auditability"
            description="Every asset issuance, every loan request, and every repayment is recorded on the XRPL and permanently linked to the issuer's DID. Lenders can always verify who is behind an asset before committing funds."
          />
          <FeatureRow
            icon={<Users className="h-4 w-4" />}
            title="No anonymous participation"
            description="Anonymous actors cannot register assets or request loans on LiquidX. Identity verification is mandatory for all issuers. This is not optional and cannot be bypassed."
          />
        </div>

        {/* How it works flow */}
        <div className="mt-5 rounded-xl border border-white/8 bg-white/2 p-4">
          <p className="text-xs text-white/30 uppercase tracking-wide mb-3">How the DID flow works</p>
          <div className="space-y-2">
            {[
              { n: "1", text: "Issuer connects their XRPL wallet to LiquidX." },
              { n: "2", text: "Issuer completes KYC through a licensed identity provider." },
              { n: "3", text: "KYC result is anchored to their DID on the XRPL." },
              { n: "4", text: 'DID is verified by LiquidX and a "Verified Identity" badge is assigned.' },
              { n: "5", text: "All subsequent asset registrations and loan requests are linked to this DID." },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-3 text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                  {n}
                </span>
                <span className="text-white/50">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Asset Verification ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-6">
        <SectionHeading
          icon={<BadgeCheck className="h-5 w-5" />}
          label="Asset Verification"
          sublabel="Every asset is reviewed before lenders can fund it"
        />

        <div className="space-y-0 rounded-xl border border-white/8 bg-white/2 px-5 divide-y divide-white/6">
          <FeatureRow
            icon={<FileText className="h-4 w-4" />}
            title="Proof of ownership required"
            description="Issuers must upload a legal ownership document (title deed, notarized contract, or official registry extract) before an asset can be listed. This document is hashed and anchored to the issuer's DID on the XRPL."
          />
          <FeatureRow
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Independent validator review"
            description="Every asset is reviewed by an independent Settlement Validator — a licensed professional or compliance firm — before lender funds can be accepted or released. Validators check legal standing, valuation, and compliance status."
          />
          <FeatureRow
            icon={<CheckCircle2 className="h-4 w-4" />}
            title="Three-state verification"
            description="Each asset moves through a clear lifecycle: Pending Review → Verified (compliance approved) → Listed. Assets that fail review are rejected with a stated reason. Lenders only ever see verified assets."
          />
          <FeatureRow
            icon={<Layers className="h-4 w-4" />}
            title="MPT issuance on XRPL"
            description="Upon approval, an MPT (Multi-Purpose Token) issuance is created on the XRP Ledger. This token represents fractional ownership and is subject to the compliance controls described below."
          />
        </div>
      </section>

      {/* ── 3. Legal Responsibility ───────────────────────────────────────── */}
      <section className="rounded-2xl border border-orange-500/15 bg-[#0d0d0d] p-6 mb-6">
        <SectionHeading
          icon={<Scale className="h-5 w-5" />}
          label="Legal Responsibility"
          sublabel="Issuers bear full accountability for the assets they register"
        />

        <div className="rounded-xl border border-orange-500/15 bg-orange-500/5 p-4 mb-5">
          <p className="text-sm text-white/70 leading-relaxed">
            Before any asset is submitted, the issuer must sign a legally binding
            declaration confirming that they own the asset, that all information is
            accurate, and that they accept full liability for any losses suffered by
            lenders as a result of fraud or misrepresentation. This declaration is
            cryptographically signed with their XRP DID and cannot be retracted.
          </p>
        </div>

        <div className="space-y-0 rounded-xl border border-white/8 bg-white/2 px-5 divide-y divide-white/6">
          <FeatureRow
            icon={<AlertTriangle className="h-4 w-4" />}
            title="Issuer liability"
            description="Issuers are legally responsible for the accuracy of all information provided. If a lender suffers loss due to inaccurate data, misrepresentation, or fraud, the issuer is contractually obligated to compensate them."
          />
          <FeatureRow
            icon={<Eye className="h-4 w-4" />}
            title="Fraud consequences"
            description="In the event of confirmed fraud, LiquidX may enforce XRPL freeze mechanisms on all associated tokens and report the issuer to relevant regulatory authorities. The issuer's DID is permanently flagged."
          />
          <FeatureRow
            icon={<FileText className="h-4 w-4" />}
            title="Permanent on-chain record"
            description="All legal commitments, ownership proofs, and declarations are permanently anchored on the XRPL. They cannot be deleted, altered, or disputed retroactively."
          />
        </div>
      </section>

      {/* ── 4. XRPL Compliance Features ──────────────────────────────────── */}
      <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-6">
        <SectionHeading
          icon={<Zap className="h-5 w-5" />}
          label="XRPL Compliance Controls"
          sublabel="Technical enforcement mechanisms built into the ledger"
        />

        <p className="text-sm text-white/50 mb-5 leading-relaxed">
          The XRP Ledger provides native compliance controls that LiquidX uses to
          enforce the rules described above. These are not optional features — they
          are built into the token issuance itself and enforced at the protocol level.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              icon: <Lock className="h-4 w-4" />,
              title: "Freeze",
              description:
                "LiquidX can freeze all token transfers for a specific issuer or asset in the event of regulatory action, legal dispute, or fraud investigation. Frozen tokens cannot be traded or transferred.",
              color: "border-yellow-500/20 bg-yellow-500/5",
              label: "Regulatory enforcement",
              labelColor: "text-yellow-400",
            },
            {
              icon: <RefreshCw className="h-4 w-4" />,
              title: "Clawback",
              description:
                "In cases of confirmed fraud, tokens can be clawed back from holders and returned to the issuer or a recovery escrow. This protects lenders in extreme circumstances.",
              color: "border-red-500/20 bg-red-500/5",
              label: "Fraud recovery",
              labelColor: "text-red-400",
            },
            {
              icon: <ShieldCheck className="h-4 w-4" />,
              title: "Authorized Holders Only",
              description:
                "MPT tokens issued on LiquidX require explicit authorization. Only KYC-verified wallet addresses can hold or trade these tokens. This ensures the investor base remains compliant.",
              color: "border-emerald-500/20 bg-emerald-500/5",
              label: "KYC-gated access",
              labelColor: "text-emerald-400",
            },
            {
              icon: <Layers className="h-4 w-4" />,
              title: "Escrow Settlement",
              description:
                "Lender funds are held in XRPL Escrow and released only after a validator confirms that all release conditions are met. Funds cannot be accessed by the issuer before settlement.",
              color: "border-primary/20 bg-primary/5",
              label: "Non-custodial",
              labelColor: "text-primary",
            },
          ].map(({ icon, title, description, color, label, labelColor }) => (
            <div key={title} className={`rounded-xl border p-4 ${color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-white/60">{icon}</div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                </div>
                <span className={`text-[10px] font-medium ${labelColor}`}>{label}</span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-white/8 bg-white/2 px-4 py-3 flex items-start gap-3">
          <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-white/40">
            All compliance controls are enforced at the protocol level by the XRP
            Ledger. LiquidX does not hold custody of funds at any point. All
            transactions are publicly verifiable on the XRPL.{" "}
            <a
              href="https://xrpl.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              xrpl.org <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </p>
        </div>
      </section>

      {/* ── 5. Trust Indicators Explained ────────────────────────────────── */}
      <section className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 mb-6">
        <SectionHeading
          icon={<BadgeCheck className="h-5 w-5" />}
          label="Trust Indicators"
          sublabel="What the badges on each asset mean"
        />

        <div className="space-y-3">
          {[
            {
              badge: (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified Identity
                </span>
              ),
              meaning:
                "The issuer has completed KYC and holds an active XRP DID. Their legal identity is bound to this asset and cannot be disputed.",
            },
            {
              badge: (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified Asset
                </span>
              ),
              meaning:
                "The asset has been reviewed by an independent Settlement Validator. Ownership proof has been checked and compliance has been approved.",
            },
            {
              badge: (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                  <Layers className="h-3.5 w-3.5" />
                  Pending Review
                </span>
              ),
              meaning:
                "The asset has been submitted and is awaiting validator review. Lender funds cannot be accepted until review is complete.",
            },
            {
              badge: (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
                  <Fingerprint className="h-3.5 w-3.5" />
                  DID Anchored
                </span>
              ),
              meaning:
                "The asset's ownership proof and legal declaration have been hashed and recorded on the XRP Ledger, permanently linked to the issuer's DID.",
            },
          ].map(({ badge, meaning }, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl border border-white/6 bg-white/2 px-4 py-4">
              <div className="shrink-0">{badge}</div>
              <p className="text-sm text-white/50 leading-relaxed">{meaning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3" />
        <h3 className="font-bold text-white mb-2">Ready to participate?</h3>
        <p className="text-sm text-white/50 mb-5">
          All participants on LiquidX — lenders and issuers — benefit from the
          identity, verification, and legal frameworks described above.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/lend"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-black hover:bg-primary/90 transition-colors"
          >
            <ShieldCheck className="h-4 w-4" />
            Browse Verified Assets
          </Link>
          <Link
            href="/tokenize"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            <Layers className="h-4 w-4" />
            Register an Asset
          </Link>
        </div>
      </div>
    </div>
  );
}
