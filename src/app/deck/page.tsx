"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowDown,
  Zap,
  Shield,
  TrendingUp,
  Lock,
  AlertTriangle,
  Globe,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Layers,
  DollarSign,
  FileCheck,
  RefreshCw,
  ExternalLink,
  Code2,
  GitBranch,
  Wallet,
  Database,
  Terminal,
  Cpu,
  Users,
  Activity,
  Fingerprint,
  Clock,
} from "lucide-react";

// ─── Slide registry ───────────────────────────────────────────────────────────

const SLIDES = [
  "cover",
  "problem",
  "solution",
  "features",
  "xrpl-txs",
  "user-flows",
  "xrpl-impl",
  "vault",
  "identity",
  "appendix",
  "real-vs-sim",
] as const;

type SlideId = (typeof SLIDES)[number];

const SLIDE_LABELS: Record<SlideId, string> = {
  cover: "Cover",
  problem: "Problem",
  solution: "Solution",
  features: "Track Fit",
  "xrpl-txs": "What's Live",
  "user-flows": "User Flows",
  "xrpl-impl": "On-chain Flow",
  vault: "Adoption",
  identity: "Identity",
  appendix: "Appendix",
  "real-vs-sim": "Real vs Sim",
};

// ─── Primitives ───────────────────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#00e5cc]/30 bg-[#00e5cc]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-[#00e5cc]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#00e5cc] animate-pulse" />
      {children}
    </span>
  );
}

// Thick visible connector used in flow diagrams
function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="flex flex-col items-center">
        <div className="w-0.5 h-5 bg-[#00e5cc]/50" />
        <div
          className="w-0 h-0"
          style={{
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid rgba(0,229,204,0.5)",
          }}
        />
      </div>
      {label && (
        <span className="text-[9px] font-mono text-[#00e5cc]/60 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}

function HArrow() {
  return (
    <div className="flex items-center shrink-0 mx-1">
      <div className="h-0.5 w-8 bg-[#00e5cc]/40" />
      <div
        className="w-0 h-0"
        style={{
          borderTop: "5px solid transparent",
          borderBottom: "5px solid transparent",
          borderLeft: "7px solid rgba(0,229,204,0.4)",
        }}
      />
    </div>
  );
}

// ─── Slides ───────────────────────────────────────────────────────────────────

function SlideCover() {
  const tracks = [
    { label: "Lending & Borrowing", color: "#00e5cc" },
    { label: "Programmability", color: "#0099ff" },
    { label: "Social Impact", color: "#a855f7" },
  ];
  return (
    <div className="relative h-full flex flex-col items-center justify-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,204,0.15)_0%,transparent_65%)]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,153,255,0.1)_0%,transparent_65%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <div className="relative flex flex-col items-center text-center gap-6 max-w-4xl px-8">
        <Tag>XRPL Commons Hackathon · March 2026</Tag>

        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#00e5cc] to-[#0099ff] flex items-center justify-center shadow-[0_0_60px_rgba(0,229,204,0.4)]">
            <Zap className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-8xl font-black tracking-tight text-white">
            Liquid<span className="text-[#00e5cc]">X</span>
          </h1>
        </div>

        <p className="text-3xl font-light text-white/70 leading-snug">
          Borrow against real-world assets.{" "}
          <span className="text-white font-semibold">No bank. Settled on XRPL.</span>
        </p>

        {/* 3 prize tracks */}
        <div className="flex gap-3 flex-wrap justify-center">
          {tracks.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold"
              style={{ background: `${t.color}15`, border: `1px solid ${t.color}40`, color: t.color }}
            >
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: t.color }} />
              {t.label}
            </div>
          ))}
        </div>

        {/* Key numbers */}
        <div className="grid grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden w-full max-w-2xl">
          {[
            { v: "8", l: "Real XRPL txs" },
            { v: "$100", l: "Min investment" },
            { v: "3–5s", l: "Finality" },
            { v: "3B+", l: "People to reach" },
          ].map((s) => (
            <div key={s.l} className="bg-[#0a0a0a] px-6 py-5 text-center">
              <p className="text-3xl font-black text-[#00e5cc]">{s.v}</p>
              <p className="text-[11px] text-white/35 mt-1 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap justify-center">
          {[
            { label: "EscrowCreate", live: true },
            { label: "EscrowFinish", live: true },
            { label: "MPT (XLS-33)", live: true },
            { label: "XRP DID", live: true },
            { label: "Payment", live: true },
            { label: "xrpl.js v4.6", live: false },
          ].map((t) => (
            <span key={t.label} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-mono text-white/50">
              {t.live && <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />}
              {t.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideProblem() {
  const problems = [
    {
      icon: Lock,
      emoji: "🔒",
      title: "Assets worth trillions. Zero liquidity.",
      stat: "$16T",
      statLabel: "locked in illiquid RWAs",
      body: "Real estate, art, infrastructure — owners can't borrow against them without selling or going through a bank that takes weeks and charges 15% fees.",
      color: "#ff4d4d",
    },
    {
      icon: AlertTriangle,
      emoji: "⚡",
      title: "DeFi loans collapse when markets do.",
      stat: "$10B+",
      statLabel: "liquidated in a single crash",
      body: "Crypto-collateral lending has one fatal flaw: the collateral crashes with the market. There's no real-world floor. Mass liquidations are a feature, not a bug.",
      color: "#ffaa00",
    },
    {
      icon: Globe,
      emoji: "🌍",
      title: "Billions locked out. Not by risk — by origin.",
      stat: "3B+",
      statLabel: "adults denied credit by geography",
      body: "A developer in Lagos, a landlord in Cairo, a farm owner in São Paulo — they hold real assets but banks reject them by nationality, documentation, or jurisdiction. The asset qualifies. The person doesn't. That's not risk management. That's bias.",
      color: "#a855f7",
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>The Problem</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            Three gaps. One missing layer.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">02 / 11</span>
      </div>

      <div className="grid grid-cols-3 gap-5 flex-1">
        {problems.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="relative rounded-3xl overflow-hidden flex flex-col p-7 gap-4"
              style={{
                background: `linear-gradient(135deg, ${p.color}12 0%, #0a0a0a 60%)`,
                border: `1px solid ${p.color}30`,
              }}
            >
              {/* Glow corner */}
              <div
                className="absolute top-0 right-0 h-32 w-32 rounded-full opacity-20 blur-2xl"
                style={{ background: p.color, transform: "translate(40%, -40%)" }}
              />

              {/* Icon */}
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${p.color}20`, border: `1px solid ${p.color}40` }}
              >
                <Icon className="h-8 w-8" style={{ color: p.color }} />
              </div>

              {/* Stat */}
              <div>
                <p className="text-4xl font-black" style={{ color: p.color }}>
                  {p.stat}
                </p>
                <p className="text-xs text-white/40 mt-0.5">{p.statLabel}</p>
              </div>

              {/* Title */}
              <p className="text-lg font-bold text-white leading-snug">{p.title}</p>

              {/* Body */}
              <p className="text-sm text-white/50 leading-relaxed flex-1">{p.body}</p>
            </div>
          );
        })}
      </div>

      {/* Root cause */}
      <div
        className="rounded-2xl px-6 py-4 flex items-center gap-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="h-2 w-2 rounded-full bg-[#00e5cc] shrink-0 animate-pulse" />
        <p className="text-sm text-white/60">
          <span className="text-white font-semibold">Missing layer:</span> a trustless, borderless
          bridge between real-world asset value and on-chain capital — open to anyone with an asset,
          regardless of nationality, bank, or bureaucracy. LiquidX is that bridge.
        </p>
      </div>
    </div>
  );
}

function SlideSolution() {
  const steps = [
    {
      n: "01",
      icon: Layers,
      label: "Tokenize",
      sub: "MPTokenIssuanceCreate",
      desc: "Asset owner creates an MPT on XRPL with requireAuth + canEscrow flags",
      color: "#00e5cc",
    },
    {
      n: "02",
      icon: Shield,
      label: "Validate",
      sub: "Validator checks",
      desc: "Independent validator verifies KYC, collateral proof, and legal declaration",
      color: "#0099ff",
    },
    {
      n: "03",
      icon: Lock,
      label: "Escrow",
      sub: "EscrowCreate",
      desc: "Lender capital locked in XRPL escrow — auto-refunded if validator rejects",
      color: "#a855f7",
    },
    {
      n: "04",
      icon: DollarSign,
      label: "Borrow",
      sub: "LoanSet (XLS-66)",
      desc: "Borrower receives USDC. Loan terms written to XRPL as a LoanBroker entry",
      color: "#ffaa00",
    },
    {
      n: "05",
      icon: RefreshCw,
      label: "Repay",
      sub: "LoanPay",
      desc: "3 on-chain installments. Each LoanPay tx gets a unique hash and explorer link",
      color: "#00e5cc",
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>The Solution</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            End-to-end. On XRPL.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">03 / 11</span>
      </div>

      {/* Flow */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-start gap-0 w-full">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="flex items-start flex-1">
                {/* Card */}
                <div
                  className="flex-1 rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(160deg, ${s.color}14 0%, #0d0d0d 70%)`,
                    border: `1px solid ${s.color}35`,
                  }}
                >
                  {/* Step number watermark */}
                  <span
                    className="absolute top-3 right-4 text-5xl font-black opacity-10"
                    style={{ color: s.color }}
                  >
                    {s.n}
                  </span>

                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${s.color}20`, border: `1px solid ${s.color}40` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>

                  <div>
                    <p className="text-base font-bold text-white">{s.label}</p>
                    <p
                      className="text-[10px] font-mono mt-0.5 px-1.5 py-0.5 rounded inline-block"
                      style={{
                        color: s.color,
                        background: `${s.color}15`,
                        border: `1px solid ${s.color}25`,
                      }}
                    >
                      {s.sub}
                    </p>
                  </div>

                  <p className="text-xs text-white/50 leading-relaxed">{s.desc}</p>
                </div>

                {/* Connector between cards */}
                {i < steps.length - 1 && (
                  <div className="flex items-center self-center mx-0 shrink-0">
                    <div className="h-px w-6 bg-white/20" />
                    <div
                      className="w-0 h-0"
                      style={{
                        borderTop: "5px solid transparent",
                        borderBottom: "5px solid transparent",
                        borderLeft: "7px solid rgba(255,255,255,0.2)",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Three value props */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="rounded-2xl px-5 py-4 flex gap-4 items-start"
          style={{ background: "rgba(0,229,204,0.06)", border: "1px solid rgba(0,229,204,0.2)" }}
        >
          <div className="h-10 w-10 rounded-xl bg-[#00e5cc]/15 border border-[#00e5cc]/30 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-[#00e5cc]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Lenders earn 5–12% APY</p>
            <p className="text-xs text-white/45 leading-relaxed">
              Fixed-term pools backed by verified RWA collateral. Capital in XRPL escrow — auto-refunded if deal falls through.
            </p>
          </div>
        </div>
        <div
          className="rounded-2xl px-5 py-4 flex gap-4 items-start"
          style={{ background: "rgba(0,153,255,0.06)", border: "1px solid rgba(0,153,255,0.2)" }}
        >
          <div className="h-10 w-10 rounded-xl bg-[#0099ff]/15 border border-[#0099ff]/30 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5 text-[#0099ff]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Borrowers unlock liquidity</p>
            <p className="text-xs text-white/45 leading-relaxed">
              Tokenize your asset, lock 10% collateral, borrow USDC at rates calculated transparently from asset type and term.
            </p>
          </div>
        </div>
        <div
          className="rounded-2xl px-5 py-4 flex gap-4 items-start"
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <div className="h-10 w-10 rounded-xl bg-[#a855f7]/15 border border-[#a855f7]/30 flex items-center justify-center shrink-0">
            <Globe className="h-5 w-5 text-[#a855f7]" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">No bank. No borders. No bias.</p>
            <p className="text-xs text-white/45 leading-relaxed">
              Your asset is your credential. DID-verified identity, not nationality. Open from $100.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideFeatures() {
  const tracks = [
    {
      label: "Lending & Borrowing",
      icon: TrendingUp,
      color: "#00e5cc",
      subtitle: "Full lending lifecycle, on-chain, auditable",
      criteria: "Unlock real financial utility through decentralized lending primitives",
      points: [
        { tx: "EscrowCreate", live: true, desc: "Lender capital locked with FinishAfter — auto-refund if rejected" },
        { tx: "EscrowFinish", live: true, desc: "Validator releases funds directly to asset owner's wallet" },
        { tx: "LoanSet", live: true, desc: "Loan terms recorded on-chain, 256-bit loanId generated" },
        { tx: "LoanPay", live: true, desc: "3 on-chain installments, each with explorer hash" },
      ],
      extra: "Rate = 5% base + risk + duration − collateral bonus ± XRP adj",
    },
    {
      label: "Programmability",
      icon: Code2,
      color: "#0099ff",
      subtitle: "Smart escrow, trustless multi-party settlement",
      criteria: "Smart escrow + conditional payments + trustless workflows",
      points: [
        { tx: "FinishAfter condition", live: true, desc: "Escrow enforced by ledger — no smart contract, no gas risk" },
        { tx: "3-wallet separation", live: true, desc: "Lender / Platform / Asset Owner — platform never holds funds" },
        { tx: "escrowSequence pre-capture", live: true, desc: "account_info before submit — xrpl.js v4 workaround" },
        { tx: "DestinationTag routing", live: true, desc: "One platform wallet, per-asset capital separation on-chain" },
      ],
      extra: "USD→XRP live via CoinGecko · DID server-side via account_objects",
    },
    {
      label: "Social Impact",
      icon: Globe,
      color: "#a855f7",
      subtitle: "Real-world inclusion through on-chain identity",
      criteria: "XRPL to create meaningful change for the underserved",
      points: [
        { tx: "3B+ adults", live: null, desc: "Denied credit by geography — asset qualifies, person doesn't" },
        { tx: "From $100", live: null, desc: "Same deals as institutions, no accreditation needed" },
        { tx: "DIDSet", live: true, desc: "Identity on merit — not nationality, bank, or credit bureau" },
        { tx: "Green infra", live: null, desc: "Fund wind, solar, infrastructure from $100, 5–12% APY" },
      ],
      extra: "Your asset is your credential — not your passport",
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>Track Alignment</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            We fit all three tracks.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">04 / 11</span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {tracks.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: `${t.color}07`, border: `1px solid ${t.color}25` }}>
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${t.color}20`, border: `1px solid ${t.color}40` }}>
                  <Icon className="h-5 w-5" style={{ color: t.color }} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide" style={{ color: t.color }}>{t.label}</p>
                  <p className="text-xs text-white/40 leading-tight">{t.subtitle}</p>
                </div>
              </div>

              {/* Criteria quote */}
              <div className="rounded-lg px-3 py-2.5" style={{ background: `${t.color}10`, border: `1px solid ${t.color}20` }}>
                <p className="text-xs text-white/55 leading-relaxed italic">&quot;{t.criteria}&quot;</p>
              </div>

              {/* Points */}
              <div className="flex flex-col gap-3 flex-1">
                {t.points.map((p) => (
                  <div key={p.tx} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {p.live === true && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                      {p.live === false && <Clock className="h-4 w-4 text-yellow-400" />}
                      {p.live === null && <ArrowRight className="h-4 w-4" style={{ color: t.color }} />}
                    </div>
                    <div>
                      <code className="text-xs font-mono font-bold" style={{ color: t.color }}>{p.tx}</code>
                      <p className="text-xs text-white/45 leading-snug mt-0.5">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="rounded-lg px-3 py-2 mt-auto" style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${t.color}18` }}>
                <p className="text-[11px] font-mono text-white/40">{t.extra}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideXRPLTxs() {
  const txs = [
    { tx: "EscrowCreate", wallet: "rGguTpZQ… (lender)", when: "Lender funds pool", what: "Real XRP deducted NOW. FinishAfter lock. DestinationTag routes to vault. escrowSequence stored.", color: "#00e5cc", real: true },
    { tx: "EscrowFinish", wallet: "rQDN8QJX… (platform)", when: "Validator approves", what: "OfferSequence = stored escrowSequence. XRP released to asset owner. Holdings minted.", color: "#00e5cc", real: true },
    { tx: "Payment", wallet: "rG1Lt5T1… (owner)", when: "Borrower repays vault", what: "principal + interest in XRP drops. Memo: LiquidX/VaultRepay. Real tx on devnet.", color: "#22c55e", real: true },
    { tx: "DIDSet", wallet: "User wallet", when: "Identity anchored", what: "W3C DID document ≤256 bytes. KYC off-chain. Resolved server-side via account_objects.", color: "#0099ff", real: true },
    { tx: "MPTokenIssuanceCreate", wallet: "rGguTpZQ… (issuer)", when: "Asset tokenized", what: "48-char mptIssuanceId from AffectedNodes. requireAuth + canEscrow + canTrade. XLS-33 ✅", color: "#a855f7", real: true },
    { tx: "LoanBrokerSet", wallet: "Platform", when: "Vault created", what: "XLS-66 now live on devnet. Creates on-chain vault with origination + servicing fee structure.", color: "#ffaa00", real: true },
    { tx: "LoanSet", wallet: "Platform", when: "Loan originated", what: "XLS-66 now live. Generates 256-bit loanId, records rate + term + borrower address on-chain.", color: "#ffaa00", real: true },
    { tx: "LoanPay", wallet: "Platform", when: "Loan repaid (×3)", what: "XLS-66 now live. Each of 3 installments is a real on-chain tx with its own explorer hash.", color: "#ffaa00", real: true },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>What&apos;s Live on XRPL</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            8 real txs on devnet.<br />
            <span className="text-[#00e5cc] text-3xl font-semibold">XLS-66 now live.</span>
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">05 / 11</span>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {txs.map((row) => (
          <div
            key={row.tx}
            className="flex items-center gap-4 rounded-xl px-4 py-3"
            style={{
              background: row.real ? `${row.color}07` : "rgba(255,255,255,0.02)",
              border: row.real ? `1px solid ${row.color}25` : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="w-5 shrink-0 flex items-center justify-center">
              {row.real
                ? <CheckCircle2 className="h-4 w-4 text-green-400" />
                : <Clock className="h-4 w-4 text-yellow-400" />}
            </div>
            <code className="text-sm font-mono shrink-0 w-52" style={{ color: row.real ? row.color : "#ffffff60" }}>{row.tx}</code>
            <span className="text-xs text-white/35 font-mono shrink-0 w-38 truncate">{row.wallet}</span>
            <span className="text-sm text-white/60 shrink-0 w-40">{row.when}</span>
            <span className="text-xs text-white/45 flex-1 leading-relaxed">{row.what}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { v: "8 / 8", l: "All txs real on devnet", color: "#22c55e" },
          { v: "3–5s", l: "Finality per tx", color: "#00e5cc" },
          { v: "wss://s.devnet.rippletest.net:51233", l: "Devnet endpoint", color: "#0099ff" },
        ].map((m) => (
          <div key={m.l} className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-2.5 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
            <div>
              <p className="text-sm font-bold text-white font-mono">{m.v}</p>
              <p className="text-[9px] text-white/35 uppercase tracking-wider">{m.l}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideUserFlows() {
  const [active, setActive] = useState<"lender" | "borrower" | "validator">("lender");

  const flows = {
    lender: {
      color: "#00e5cc",
      icon: TrendingUp,
      role: "Lender",
      summary: "Fund a loan pool, earn fixed yield, withdraw after repayment",
      steps: [
        { n: "1", action: "Browse /lend", detail: "Filter pools by category, yield, utilization. See first-loss cover and min deposit.", tx: null },
        { n: "2", action: "Open InvestDialog", detail: "Enter amount. Preview tokens, yield, and escrow lock before confirming.", tx: null },
        { n: "3", action: "Confirm deposit", detail: "depositToVault() → createXRPLEscrow(). Capital locked. xrplEscrowHash stored on position.", tx: "EscrowCreate" },
        { n: "4", action: "Validator approves", detail: "approveAndRelease() runs. Position: locked → released. Holding minted. Validator fee deducted.", tx: "EscrowFinish" },
        { n: "5", action: "Earn on repayments", detail: "Each borrower LoanPay updates your dashboard. Total repaid tracked per loan.", tx: "LoanPay" },
      ],
    },
    borrower: {
      color: "#ffaa00",
      icon: DollarSign,
      role: "Borrower",
      summary: "Tokenize your asset, lock collateral, borrow USDC at a fixed rate",
      steps: [
        { n: "1", action: "Verify identity (KYC)", detail: "Account page. XRP DID anchored. kycStatus must be verified before tokenize form unlocks.", tx: null },
        { n: "2", action: "Lock collateral", detail: "lockCollateral() → EscrowCreate with LiquidX/CollateralEscrow memo. 180-day lock. On-chain verified.", tx: "EscrowCreate" },
        { n: "3", action: "Tokenize asset", detail: "tokenizeAsset() → MPTokenIssuanceCreate. 48-char mptIssuanceId returned and stored on asset.", tx: "MPTokenIssuanceCreate" },
        { n: "4", action: "Request loan", detail: "requestLoan() → LoanSet. Rate = base 5% + risk + duration − collateral bonus. loanId generated.", tx: "LoanSet" },
        { n: "5", action: "Repay 3 installments", detail: "repayInstalment() per row → LoanPay. Each payment has its own on-chain hash.", tx: "LoanPay" },
      ],
    },
    validator: {
      color: "#a855f7",
      icon: Shield,
      role: "Validator",
      summary: "Vet assets, settle escrows, earn a fee on every approved deal",
      steps: [
        { n: "1", action: "Open /validator", detail: "See all assets with fundingStatus: funded. Shows total locked, investor count, fee estimate.", tx: null },
        { n: "2", action: "Review 3-point checklist", detail: "Documentation uploaded · Collateral escrow on-chain · Legal declaration hash recorded.", tx: null },
        { n: "3a", action: "Approve → Release", detail: "releaseVaultPosition() → EscrowFinish. All locked positions released. Holdings minted.", tx: "EscrowFinish" },
        { n: "3b", action: "Reject → Refund", detail: "refundVaultPosition() → EscrowCancel. 100% returned to lenders. Zero counterparty loss.", tx: "EscrowCancel" },
      ],
    },
  };

  const f = flows[active];
  const Icon = f.icon;

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>User Flows</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            3 actors. 1 protocol.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">06 / 11</span>
      </div>

      {/* Tab strip */}
      <div className="flex gap-2">
        {(["lender", "borrower", "validator"] as const).map((tab) => {
          const fc = flows[tab];
          const TabIcon = fc.icon;
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all"
              style={
                active === tab
                  ? {
                      background: `${fc.color}18`,
                      border: `1px solid ${fc.color}40`,
                      color: fc.color,
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.35)",
                    }
              }
            >
              <TabIcon className="h-4 w-4" />
              {tab}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#00e5cc] animate-pulse" />
          <span className="text-[11px] text-white/25 font-mono">every step = 1 XRPL tx</span>
        </div>
      </div>

      {/* Summary */}
      <div
        className="rounded-xl px-4 py-3 flex items-center gap-3"
        style={{ background: `${f.color}0d`, border: `1px solid ${f.color}20` }}
      >
        <Icon className="h-4 w-4 shrink-0" style={{ color: f.color }} />
        <p className="text-sm text-white/60">{f.summary}</p>
      </div>

      {/* Steps */}
      <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-0 content-start">
        {f.steps.map((step, i) => (
          <div key={step.n} className="flex gap-3 pb-5">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                style={{
                  background: `${f.color}18`,
                  border: `1.5px solid ${f.color}50`,
                  color: f.color,
                }}
              >
                {step.n}
              </div>
              {i < f.steps.length - 1 && i % 2 === 0 && (
                <div className="w-px flex-1 bg-white/8 mt-1" />
              )}
            </div>

            {/* Content */}
            <div className="pt-0.5 flex-1">
              <p className="text-sm font-bold text-white">{step.action}</p>
              <p className="text-xs text-white/45 mt-1 leading-relaxed">{step.detail}</p>
              {step.tx && (
                <span
                  className="mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-mono"
                  style={{
                    color: f.color,
                    background: `${f.color}15`,
                    border: `1px solid ${f.color}25`,
                  }}
                >
                  {step.tx}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideXRPLImpl() {
  const steps = [
    {
      n: "1", label: "LEND", actor: "Lender", wallet: "rGguTpZQ…", color: "#00e5cc",
      tx: "EscrowCreate",
      fields: [
        "Account      = rGguTpZQ… (XRP deducted NOW)",
        "Amount       = ~355 XRP  ($500 at live price)",
        "Destination  = rG1Lt5T1… (asset owner)",
        "FinishAfter  = now + 30s",
        "DestTag      = 1001  (vault routing)",
      ],
      note: "escrowSequence captured via account_info BEFORE submit — stored in Zustand",
      live: true,
    },
    {
      n: "2", label: "APPROVE", actor: "Validator", wallet: "rQDN8QJX…", color: "#0099ff",
      tx: "EscrowFinish",
      fields: [
        "Account       = rQDN8QJX… (platform pays fee)",
        "Owner         = rGguTpZQ… (escrow creator)",
        "OfferSequence = 513962  (stored escrowSequence)",
        "→ XRP released → arrives at rG1Lt5T1… ✓",
      ],
      note: "Validator sees 3-point checklist: document · collateral on-chain · DID",
      live: true,
    },
    {
      n: "3", label: "REPAY", actor: "Asset Owner", wallet: "rG1Lt5T1…", color: "#22c55e",
      tx: "Payment",
      fields: [
        "Account     = rG1Lt5T1… (repays the loan)",
        "Destination = rQDN8QJX… (platform distributes)",
        "Amount      = principal + interest in drops",
        "Memo        = LiquidX/VaultRepay",
      ],
      note: "Interest accrues daily from release date — early repayment costs less",
      live: true,
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>On-chain Flow</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            Every arrow is a real XRPL tx.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">07 / 11</span>
      </div>

      {/* 3-wallet header */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Lender", addr: "rGguTpZQ…", color: "#00e5cc", role: "signs EscrowCreate · funds pool" },
          { label: "Platform", addr: "rQDN8QJX…", color: "#0099ff", role: "signs EscrowFinish · never holds funds" },
          { label: "Asset Owner", addr: "rG1Lt5T1…", color: "#22c55e", role: "receives XRP · repays loan" },
        ].map((w) => (
          <div key={w.label} className="rounded-xl p-3 flex items-center gap-3" style={{ background: `${w.color}08`, border: `1px solid ${w.color}25` }}>
            <Wallet className="h-4 w-4 shrink-0" style={{ color: w.color }} />
            <div>
              <p className="text-xs font-black" style={{ color: w.color }}>{w.label}</p>
              <code className="text-[9px] font-mono text-white/40">{w.addr}</code>
              <p className="text-[9px] text-white/30">{w.role}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3 steps */}
      <div className="flex-1 grid grid-cols-3 gap-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: `${s.color}06`, border: `1px solid ${s.color}20` }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm shrink-0" style={{ background: `${s.color}20`, color: s.color }}>{s.n}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-wide" style={{ color: s.color }}>{s.label}</p>
                <p className="text-[9px] text-white/35">{s.actor} · {s.wallet}</p>
              </div>
              <span className="ml-auto text-[9px] text-green-400 font-mono">● live</span>
            </div>

            <code className="text-[10px] font-mono px-2 py-1 rounded self-start" style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}25` }}>{s.tx}</code>

            <div className="rounded-lg px-3 py-2 font-mono text-[9px] leading-relaxed space-y-0.5 flex-1" style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${s.color}12` }}>
              {s.fields.map((f, i) => (
                <p key={i} className={f.startsWith("→") ? "" : "text-white/50"} style={f.startsWith("→") ? { color: s.color } : {}}>{f}</p>
              ))}
            </div>

            <p className="text-[9px] text-white/25 italic leading-relaxed">{s.note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-white/6 bg-white/[0.02] px-4 py-2.5 flex items-center gap-2">
        <ExternalLink className="h-3.5 w-3.5 text-white/25 shrink-0" />
        <p className="text-[10px] text-white/35">
          Open <code className="text-[#00e5cc] font-mono">devnet.xrpl.org</code> during the demo — lender wallet balance drops on EscrowCreate, asset owner balance increases on EscrowFinish. Live.
        </p>
      </div>
    </div>
  );
}


function SlideVault() {
  const personas = [
    {
      color: "#a855f7",
      role: "Borrowers",
      target: "1.4B unbanked asset owners",
      pain: "Own $200K+ property in Lagos, Dubai, or Manila. Bank says no — no credit score, wrong passport, no formal payslip. Asset sits idle.",
      where: [
        "UAE expat Facebook groups (200K+ members)",
        "African real estate WhatsApp networks",
        "Dubai property owners LinkedIn groups",
        "PropTech conferences — MENA & Sub-Saharan Africa",
      ],
      offer: "8% APR collateral loan — no bank, no credit score. Asset is the passport.",
      action: "10 pilot borrowers from UAE expat groups → $20K average loan → live on devnet in Q2",
    },
    {
      color: "#00e5cc",
      role: "Lenders",
      target: "50M+ DeFi yield seekers",
      pain: "Bank savings: 0.5% APY. Crypto yields: volatile, no backing. Bonds: illiquid. Want 8–12% real-asset return with no counterparty guess-work.",
      where: [
        "r/personalfinance — 20M members asking for better yields",
        "XRPL & DeFi Twitter — already trust on-chain escrow",
        "InterNations expat finance communities",
        "Crypto-native investors burned by unsecured DeFi",
      ],
      offer: "8–12% APY backed by on-chain escrow. Not a promise — FinishAfter in the ledger.",
      action: "XRPL community lenders as first pool → $50K TVL target → escrow verifiable on devnet.xrpl.org",
    },
    {
      color: "#0099ff",
      role: "Validators",
      target: "500K notaries & registries",
      pain: "Spend 3–5 days manually verifying property docs. Issue paper certificates no one can check digitally. Zero on-chain trail. Getting disrupted.",
      where: [
        "Dubai Land Department partner network",
        "UAE Notary Public Association",
        "RICS members — 130K globally",
        "Legal tech & PropTech conferences",
      ],
      offer: "Earn validator fee on every release. Bring your existing clientele. DID anchors your reputation on-chain.",
      action: "1 anchor validator (UAE notary) onboarded in Q2 → brings 5–10 borrowers from existing book",
    },
  ];

  const milestones = [
    { label: "Now", note: "8 real txs on devnet", color: "#00e5cc" },
    { label: "Q2 2026", note: "Mainnet · first validator · 10 pilot loans", color: "#0099ff" },
    { label: "Q3 2026", note: "Live assets · KYC · secondary market", color: "#a855f7" },
    { label: "2027", note: "Africa · MENA · LatAm · Open API", color: "#ffaa00" },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-5 gap-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Tag>Path to Adoption</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            3 doors in.<br />
            <span className="text-[#00e5cc]">Each solves a real problem.</span>
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">08 / 11</span>
      </div>

      {/* Persona cards */}
      <div className="grid grid-cols-3 gap-3 flex-1">
        {personas.map((p) => (
          <div key={p.role} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: `${p.color}07`, border: `1px solid ${p.color}25` }}>
            <div>
              <p className="text-base font-black uppercase tracking-wide" style={{ color: p.color }}>{p.role}</p>
              <p className="text-xs font-mono" style={{ color: `${p.color}99` }}>{p.target}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-white/25">Their problem</p>
              <p className="text-xs text-white/65 leading-relaxed">{p.pain}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-white/25">Where they are</p>
              <div className="flex flex-col gap-1">
                {p.where.map((w, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <div className="h-1 w-1 rounded-full shrink-0 mt-1.5" style={{ background: p.color }} />
                    <p className="text-xs text-white/50">{w}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-2">
              <div className="rounded-lg px-3 py-2" style={{ background: `${p.color}12`, border: `1px solid ${p.color}30` }}>
                <p className="text-[10px] uppercase tracking-widest mb-0.5" style={{ color: `${p.color}99` }}>Our offer</p>
                <p className="text-xs text-white/80 leading-relaxed">{p.offer}</p>
              </div>
              <div className="rounded-lg px-3 py-2 bg-white/4 border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-0.5">First action</p>
                <p className="text-xs text-white/60 leading-relaxed">{p.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap bar */}
      <div className="flex items-center gap-0">
        {milestones.map((m, i) => (
          <div key={m.label} className="flex items-center flex-1">
            <div className="flex-1 rounded-xl px-3 py-2" style={{ background: `${m.color}08`, border: `1px solid ${m.color}22` }}>
              <p className="text-xs font-black" style={{ color: m.color }}>{m.label}</p>
              <p className="text-[10px] text-white/40">{m.note}</p>
            </div>
            {i < milestones.length - 1 && (
              <div className="w-4 flex items-center justify-center shrink-0">
                <div className="w-3 h-px bg-white/15" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
function SlideIdentity() {
  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>Identity & Privacy</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            Verified. Not exposed.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">09 / 11</span>
      </div>

      {/* Core concept */}
      <div
        className="rounded-2xl px-6 py-4 flex items-start gap-4 shrink-0"
        style={{ background: "rgba(0,229,204,0.06)", border: "1px solid rgba(0,229,204,0.2)" }}
      >
        <Fingerprint className="h-5 w-5 text-[#00e5cc] shrink-0 mt-0.5" />
        <p className="text-sm text-white/70 leading-relaxed">
          LiquidX uses{" "}
          <span className="text-[#00e5cc] font-semibold">XRP DID (W3C standard)</span> to verify
          every participant off-chain through a licensed KYC provider. Only a cryptographic proof is
          anchored on-chain.{" "}
          <span className="text-white font-semibold">
            Other participants see a pseudonymous DID address — never your real identity.
          </span>
        </p>
      </div>

      {/* Public vs Private */}
      <div className="flex-1 grid grid-cols-2 gap-4">
        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "rgba(0,229,204,0.05)", border: "1px solid rgba(0,229,204,0.22)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#00e5cc]/15 border border-[#00e5cc]/30 flex items-center justify-center">
              <Globe className="h-4 w-4 text-[#00e5cc]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">On-chain — public</p>
              <p className="text-[10px] text-[#00e5cc]/55 font-mono mt-0.5">XRPL ledger · visible to anyone</p>
            </div>
          </div>
          <ul className="space-y-2.5 flex-1">
            {[
              "DID identifier (pseudonymous XRP address)",
              "Escrow transaction hashes",
              "MPT issuance ID",
              "Loan payment records",
              "Verification status (verified / not)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#00e5cc] shrink-0 mt-1.5" />
                <p className="text-xs text-white/55 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-[#00e5cc]/15 bg-[#00e5cc]/5 px-3 py-2">
            <p className="text-[10px] text-[#00e5cc]/70 font-mono">Anyone with a ledger explorer can see this</p>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 flex flex-col gap-4"
          style={{ background: "rgba(255,77,77,0.04)", border: "1px solid rgba(255,77,77,0.22)" }}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#ff4d4d]/15 border border-[#ff4d4d]/30 flex items-center justify-center">
              <Lock className="h-4 w-4 text-[#ff4d4d]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Off-chain — confidential</p>
              <p className="text-[10px] text-[#ff4d4d]/55 font-mono mt-0.5">KYC provider · never on ledger</p>
            </div>
          </div>
          <ul className="space-y-2.5 flex-1">
            {[
              "Legal name and nationality",
              "ID document (passport, national ID)",
              "Date of birth and address",
              "KYC verification documents",
              "Asset ownership proofs",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d] shrink-0 mt-1.5" />
                <p className="text-xs text-white/55 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
          <div className="rounded-lg border border-[#ff4d4d]/15 bg-[#ff4d4d]/5 px-3 py-2">
            <p className="text-[10px] text-[#ff4d4d]/70 font-mono">Only LiquidX + KYC provider can access this</p>
          </div>
        </div>
      </div>

      {/* DID flow */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-4 shrink-0">
        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-3 font-semibold">
          How the XRP DID model works
        </p>
        <div className="flex items-stretch gap-0">
          {(
            [
              { step: "KYC off-chain", sub: "Identity verified by provider", color: "#ff4d4d" },
              null,
              { step: "DID anchored on XRPL", sub: "Proof hash only — no PII", color: "#ffaa00" },
              null,
              { step: "Platform gate opens", sub: "tokenize / borrow unlocked", color: "#a855f7" },
              null,
              { step: "On-chain actions", sub: "Tx hashes — no identity leak", color: "#00e5cc" },
            ] as const
          ).map((item, i) =>
            item === null ? (
              <div key={i} className="flex items-center shrink-0 mx-2">
                <div className="h-px w-5 bg-white/15" />
                <div
                  className="w-0 h-0"
                  style={{
                    borderTop: "4px solid transparent",
                    borderBottom: "4px solid transparent",
                    borderLeft: "6px solid rgba(255,255,255,0.15)",
                  }}
                />
              </div>
            ) : (
              <div
                key={item.step}
                className="flex-1 rounded-xl px-3 py-2.5"
                style={{ background: `${item.color}09`, border: `1px solid ${item.color}28` }}
              >
                <p className="text-[11px] font-bold leading-snug" style={{ color: item.color }}>
                  {item.step}
                </p>
                <p className="text-[9px] text-white/35 mt-0.5 leading-relaxed">{item.sub}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function SlideAppendix() {
  const stack = [
    {
      layer: "Frontend",
      color: "#ffffff",
      items: [
        { name: "Next.js 15", detail: "App Router · SSR + RSC + client components" },
        { name: "React 19", detail: "Client / Server component model" },
        { name: "TypeScript", detail: "Strict mode throughout" },
        { name: "TailwindCSS", detail: "Utility-first CSS system" },
        { name: "Framer Motion", detail: "Page transitions and animations" },
        { name: "Recharts", detail: "Portfolio allocation charts" },
      ],
    },
    {
      layer: "State",
      color: "#ffaa00",
      items: [
        { name: "Zustand 5", detail: "Global store with localStorage persistence" },
        { name: "liquidx-portfolio-v4", detail: "Persistence key (versioned)" },
        { name: "Selective persist", detail: "Only portfolio slice is persisted" },
      ],
    },
    {
      layer: "Blockchain",
      color: "#00e5cc",
      items: [
        { name: "xrpl.js v4.6", detail: "XRPL client — real-first / simulation fallback" },
        { name: "XRPL testnet", detail: "wss://s.altnet.rippletest.net:51233" },
        { name: "XLS-33 MPT", detail: "Multi-Purpose Token standard (pre-live)" },
        { name: "XLS-66 Lending", detail: "LoanBroker, LoanSet, LoanPay (pre-live)" },
        { name: "XRP DID", detail: "W3C Decentralized Identifier on XRPL" },
      ],
    },
    {
      layer: "Auth & Identity",
      color: "#0099ff",
      items: [
        { name: "Supabase", detail: "Auth, user accounts, session management" },
        { name: "TON Connect", detail: "Wallet authentication for trade actions" },
        { name: "XRP DID (W3C)", detail: "On-chain identity anchor + KYC proof" },
        { name: "kycStatus gate", detail: "Blocks tokenize entirely if not verified" },
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>Appendix</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">Full stack.</h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">10 / 11</span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {stack.map((s) => (
          <div
            key={s.layer}
            className="rounded-2xl p-5 flex flex-col gap-3"
            style={{
              background: `linear-gradient(145deg, ${s.color}08 0%, #0a0a0a 60%)`,
              border: `1px solid ${s.color}20`,
            }}
          >
            <span
              className="text-xs font-black tracking-[0.12em] uppercase"
              style={{ color: s.color }}
            >
              {s.layer}
            </span>
            <div className="space-y-2">
              {s.items.map((item) => (
                <div key={item.name} className="flex items-start gap-3">
                  <span
                    className="inline-block rounded-md px-2 py-0.5 text-[10px] font-mono shrink-0 mt-0.5"
                    style={{
                      color: s.color,
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}25`,
                    }}
                  >
                    {item.name}
                  </span>
                  <span className="text-xs text-white/40 leading-relaxed">{item.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Appendix: Escrow Flow ────────────────────────────────────────────────────

function SlideRealVsSim() {
  const table = [
    { step: "Collateral escrow (lock)", status: "real", detail: "EscrowCreate réel sur devnet" },
    { step: "Vérification collateral", status: "real", detail: "account_objects XRPL réel" },
    { step: "LoanSet (origination)", status: "real", detail: "XLS-66 amendment actif sur devnet" },
    { step: "LoanPay (remboursement)", status: "real", detail: "XLS-66 actif — LoanPay réel sur devnet" },
    { step: "Scoring / taux", status: "sim", detail: "In-app via loan-pricing.ts" },
  ];

  const keyData = [
    { key: "Test wallet (user)", val: "rGguTpZQUhDyRCC2yCa7mDHSjuZpVCTKdd", color: "#00e5cc" },
    { key: "Platform wallet", val: "rQDN8QJX… (hardcodé dans xrpl.ts)", color: "#0099ff" },
    { key: "Collateral requis", val: "10% de la valeur de l'asset (COLLATERAL_RATIO = 0.1)", color: "#ffaa00" },
    { key: "Schedule", val: "3 mensualités égales, calculées dans le store", color: "#a855f7" },
    { key: "Persistence", val: "Zustand (liquidx-portfolio-v4) + sync Supabase", color: "#22c55e" },
    { key: "XRPL network", val: "wss://s.devnet.rippletest.net:51233", color: "#ffffff" },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>Appendix A4</Tag>
          <h2 className="text-4xl font-black text-white leading-tight">
            Réel vs Simulé · Données clés
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">11 / 11</span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {/* Real vs sim table */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(0,229,204,0.04)", border: "1px solid rgba(0,229,204,0.15)" }}
        >
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Ce qui est réel vs simulé</p>
          <div className="flex flex-col gap-2">
            {/* header */}
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-white/6">
              <span className="text-[9px] text-white/25 uppercase tracking-wide">Étape</span>
              <span className="text-[9px] text-white/25 uppercase tracking-wide">Status</span>
              <span className="text-[9px] text-white/25 uppercase tracking-wide">Détail</span>
            </div>
            {table.map((r) => (
              <div key={r.step} className="grid grid-cols-3 gap-2 items-start">
                <span className="text-[10px] text-white/60 leading-tight">{r.step}</span>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded self-start flex items-center gap-1"
                  style={
                    r.status === "real"
                      ? { color: "#22c55e", background: "#22c55e15", border: "1px solid #22c55e25" }
                      : { color: "#ffaa00", background: "#ffaa0015", border: "1px solid #ffaa0025" }
                  }
                >
                  {r.status === "real"
                    ? <><CheckCircle2 className="h-3 w-3" /> Réel</>
                    : <><Clock className="h-3 w-3" /> Simulé</>}
                </span>
                <span className="text-[9px] text-white/35 leading-tight">{r.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Key data */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(0,153,255,0.04)", border: "1px solid rgba(0,153,255,0.15)" }}
        >
          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Données clés</p>
          <div className="flex flex-col gap-3">
            {keyData.map((d) => (
              <div key={d.key} className="flex flex-col gap-0.5">
                <span className="text-[9px] text-white/30 uppercase tracking-wide">{d.key}</span>
                <code className="text-[10px] font-mono" style={{ color: d.color }}>{d.val}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide map ────────────────────────────────────────────────────────────────

const SLIDE_COMPONENTS: Record<SlideId, React.ComponentType> = {
  cover: SlideCover,
  problem: SlideProblem,
  solution: SlideSolution,
  features: SlideFeatures,
  "xrpl-txs": SlideXRPLTxs,
  "user-flows": SlideUserFlows,
  "xrpl-impl": SlideXRPLImpl,
  vault: SlideVault,
  identity: SlideIdentity,
  appendix: SlideAppendix,
  "real-vs-sim": SlideRealVsSim,
};

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function DeckPage() {
  const [current, setCurrent] = useState(0);

  function prev() { setCurrent((c) => Math.max(0, c - 1)); }
  function next() { setCurrent((c) => Math.min(SLIDES.length - 1, c + 1)); }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const slide = SLIDES[current];
  const SlideComponent = SLIDE_COMPONENTS[slide];

  return (
    <div className="fixed inset-0 bg-[#080808] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#00e5cc] to-[#0099ff] flex items-center justify-center">
            <Zap className="h-3 w-3 text-black" />
          </div>
          <span className="text-white text-sm font-bold">
            Liquid<span className="text-[#00e5cc]">X</span>
          </span>
          <span className="text-[10px] text-white/20 font-mono ml-2 uppercase tracking-widest">
            Hackathon Pitch · XRPL
          </span>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s}
              onClick={() => setCurrent(i)}
              title={SLIDE_LABELS[s]}
              className="transition-all rounded-full"
              style={
                i === current
                  ? { height: 8, width: 24, background: "#00e5cc" }
                  : { height: 8, width: 8, background: "rgba(255,255,255,0.15)" }
              }
            />
          ))}
        </div>

        <span className="text-[11px] font-mono text-white/25">
          {SLIDE_LABELS[slide]} · {current + 1}/{SLIDES.length}
        </span>
      </div>

      {/* Slide */}
      <div className="flex-1 overflow-hidden">
        <SlideComponent />
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Slide names */}
        <div className="hidden lg:flex items-center gap-1">
          {SLIDES.map((s, i) => (
            <button
              key={s}
              onClick={() => setCurrent(i)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all"
              style={
                i === current
                  ? { background: "rgba(255,255,255,0.08)", color: "white" }
                  : { color: "rgba(255,255,255,0.2)" }
              }
            >
              {SLIDE_LABELS[s]}
            </button>
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={prev}
            disabled={current === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-20"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)" }}
          >
            <ArrowLeft className="h-3 w-3" /> Prev
          </button>
          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-20"
            style={{ border: "1px solid rgba(0,229,204,0.3)", background: "rgba(0,229,204,0.1)", color: "#00e5cc" }}
          >
            Next <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
