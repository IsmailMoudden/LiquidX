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
} from "lucide-react";

// ─── Slide registry ───────────────────────────────────────────────────────────

const SLIDES = [
  "cover",
  "problem",
  "solution",
  "features",
  "architecture",
  "xrpl-txs",
  "user-flows",
  "demo",
  "xrpl-impl",
  "vault",
  "identity",
  "xrpl-diagram",
  "appendix",
] as const;

type SlideId = (typeof SLIDES)[number];

const SLIDE_LABELS: Record<SlideId, string> = {
  cover: "Cover",
  problem: "Problem",
  solution: "Solution",
  features: "Features",
  architecture: "Architecture",
  "xrpl-txs": "XRPL",
  "user-flows": "User Flows",
  demo: "Demo",
  "xrpl-impl": "XRPL Deep Dive",
  vault: "Vault Protocol",
  identity: "Identity",
  "xrpl-diagram": "XRPL Diagram",
  appendix: "Appendix",
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
  return (
    <div className="relative h-full flex flex-col items-center justify-center overflow-hidden">
      {/* bg */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,204,0.15)_0%,transparent_65%)]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,153,255,0.1)_0%,transparent_65%)]" />
        {/* grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative flex flex-col items-center text-center gap-8 max-w-4xl px-8">
        {/* Badge */}
        <Tag>Hackathon Demo · XRPL · Lending + Social Impact · March 2026</Tag>

        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#00e5cc] to-[#0099ff] flex items-center justify-center shadow-[0_0_60px_rgba(0,229,204,0.4)]">
            <Zap className="h-10 w-10 text-black" />
          </div>
          <h1 className="text-8xl font-black tracking-tight text-white">
            Liquid<span className="text-[#00e5cc]">X</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-3xl font-light text-white/70 leading-snug">
          Tokenize real-world assets.{" "}
          <span className="text-white font-semibold">Borrow against them on XRPL.</span>
        </p>

        {/* Sub */}
        <p className="text-base text-white/40 max-w-xl leading-relaxed">
          Full end-to-end lending protocol — asset tokenization, escrow settlement,
          validator approval, loan origination, and repayment — every step anchored
          to a public XRPL transaction hash.
        </p>

        {/* Key numbers */}
        <div className="grid grid-cols-4 gap-px bg-white/8 rounded-2xl overflow-hidden w-full max-w-2xl">
          {[
            { v: "7", l: "XRPL tx types" },
            { v: "4", l: "Protocol layers" },
            { v: "3", l: "User roles" },
            { v: "100%", l: "On-chain" },
          ].map((s) => (
            <div key={s.l} className="bg-[#0a0a0a] px-6 py-5 text-center">
              <p className="text-3xl font-black text-[#00e5cc]">{s.v}</p>
              <p className="text-[11px] text-white/35 mt-1 uppercase tracking-wider">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Stack */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {["Next.js 15", "XRPL v4.6", "XLS-33 MPT", "XLS-66 Lending", "TON Wallet", "Supabase"].map(
            (t) => (
              <span
                key={t}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-mono text-white/50"
              >
                {t}
              </span>
            )
          )}
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
        <span className="text-[11px] font-mono text-white/20">02 / 13</span>
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
        <span className="text-[11px] font-mono text-white/20">03 / 13</span>
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
  const features = [
    {
      icon: Layers,
      title: "RWA Tokenization",
      color: "#00e5cc",
      items: [
        "DID identity gate — KYC must be verified",
        "10% collateral escrow required on-chain",
        "MPTokenIssuanceCreate with requireAuth + canEscrow",
        "48-char mptIssuanceId stored on asset",
      ],
    },
    {
      icon: Shield,
      title: "Validator Settlement",
      color: "#0099ff",
      items: [
        "Independent validator per asset",
        "3-condition checklist: docs, collateral, legal",
        "Approve → EscrowFinish (funds released)",
        "Reject → EscrowCancel (100% refunded)",
      ],
    },
    {
      icon: Lock,
      title: "Escrow Lending",
      color: "#a855f7",
      items: [
        "Lender capital locked via EscrowCreate",
        "Auto-refund on deadline expiry",
        "Validator fee deducted at release",
        "Every position has XRPL hash + explorer link",
      ],
    },
    {
      icon: BarChart3,
      title: "Loan Protocol (XLS-66)",
      color: "#ffaa00",
      items: [
        "LoanBrokerSet creates on-chain vault",
        "LoanSet records terms + 256-bit loanId",
        "3 installments, each a LoanPay tx",
        "Rate = base + risk + duration − collateral bonus",
      ],
    },
    {
      icon: Wallet,
      title: "Wallet & Identity",
      color: "#ff4d4d",
      items: [
        "TON Connect wallet for authentication",
        "XRP DID — W3C standard, anchored on-chain",
        "Supabase auth for account management",
        "kycStatus gates tokenization entirely",
      ],
    },
    {
      icon: Activity,
      title: "Full Audit Trail",
      color: "#00e5cc",
      items: [
        "Every action produces a Transaction record",
        "xrplHash + xrplTxType on every event",
        "testnet.xrpl.org explorer links live",
        "Dashboard shows P&L, holdings, repayments",
      ],
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>What We Built</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            6 modules. All wired.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">04 / 13</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="rounded-2xl p-5 flex flex-col gap-3"
              style={{
                background: `linear-gradient(145deg, ${f.color}0d 0%, #0a0a0a 60%)`,
                border: `1px solid ${f.color}25`,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${f.color}18`, border: `1px solid ${f.color}35` }}
                >
                  <Icon className="h-5 w-5" style={{ color: f.color }} />
                </div>
                <p className="text-sm font-bold text-white">{f.title}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {f.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div
                      className="h-1.5 w-1.5 rounded-full shrink-0 mt-1.5"
                      style={{ background: f.color }}
                    />
                    <p className="text-xs text-white/55 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlideArchitecture() {
  const layers = [
    {
      label: "PAGES",
      sublabel: "Next.js 15 App Router · React 19",
      color: "#ffffff",
      bgColor: "rgba(255,255,255,0.04)",
      borderColor: "rgba(255,255,255,0.1)",
      items: ["/lend", "/borrow", "/tokenize", "/validator", "/dashboard", "/trust"],
      arrowLabel: "read / dispatch actions",
    },
    {
      label: "STORE",
      sublabel: "Zustand 5 · localStorage persist",
      color: "#ffaa00",
      bgColor: "rgba(255,170,0,0.06)",
      borderColor: "rgba(255,170,0,0.25)",
      items: ["invest()", "approveAndRelease()", "originateLoan()", "repayLoan()", "mintMPT()", "expireDeadlines()"],
      arrowLabel: "calls service with params",
    },
    {
      label: "SERVICE",
      sublabel: "src/lib/lending-service.ts · eligibility gates",
      color: "#a855f7",
      bgColor: "rgba(168,85,247,0.06)",
      borderColor: "rgba(168,85,247,0.25)",
      items: ["depositToVault()", "releaseVaultPosition()", "requestLoan()", "tokenizeAsset()", "lockCollateral()", "checkUserEligibility()"],
      arrowLabel: "calls XRPL primitives",
    },
    {
      label: "XRPL",
      sublabel: "src/lib/xrpl.ts · testnet first → simulation fallback",
      color: "#00e5cc",
      bgColor: "rgba(0,229,204,0.06)",
      borderColor: "rgba(0,229,204,0.3)",
      items: ["EscrowCreate", "EscrowFinish", "EscrowCancel", "MPTokenIssuanceCreate", "LoanSet", "LoanPay"],
      arrowLabel: null,
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>Technical Architecture</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            4 layers. UI never touches the chain.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">05 / 13</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-0">
        {layers.map((layer, i) => (
          <div key={layer.label}>
            {/* Layer box */}
            <div
              className="rounded-2xl px-5 py-4"
              style={{ background: layer.bgColor, border: `1px solid ${layer.borderColor}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-xs font-black tracking-[0.15em]"
                  style={{ color: layer.color }}
                >
                  {layer.label}
                </span>
                <span className="text-[11px] text-white/30 font-mono">{layer.sublabel}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {layer.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg px-3 py-1.5 text-[11px] font-mono"
                    style={{
                      color: `${layer.color}cc`,
                      background: `${layer.color}10`,
                      border: `1px solid ${layer.color}25`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow between layers */}
            {i < layers.length - 1 && (
              <div className="flex items-center gap-3 pl-6 py-1">
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-4 bg-white/20" />
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderTop: "6px solid rgba(255,255,255,0.2)",
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider">
                  {layer.arrowLabel}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom rule */}
      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-white/6" />
        <span className="text-[10px] text-white/20 font-mono">
          UI calls store → store calls service → service calls XRPL. No shortcuts.
        </span>
        <div className="h-px flex-1 bg-white/6" />
      </div>
    </div>
  );
}

function SlideXRPLTxs() {
  const txs = [
    {
      tx: "EscrowCreate",
      when: "Lender funds pool",
      what: "Capital locked on XRPL with FinishAfter condition. Auto-refunded if validator rejects or deadline passes.",
      color: "#00e5cc",
      realPath: true,
    },
    {
      tx: "EscrowFinish",
      when: "Validator approves",
      what: "Releases all locked lender positions. Holdings minted. Validator fee deducted per position.",
      color: "#00e5cc",
      realPath: false,
    },
    {
      tx: "EscrowCancel",
      when: "Validator rejects / expired",
      what: "100% capital returned to lenders. No loss. Asset marked refunded.",
      color: "#ff4d4d",
      realPath: false,
    },
    {
      tx: "MPTokenIssuanceCreate",
      when: "Issuer tokenizes asset",
      what: "192-bit mptIssuanceId minted. Flags: requireAuth + canLock + canEscrow + canTrade. (XLS-33)",
      color: "#a855f7",
      realPath: false,
    },
    {
      tx: "LoanBrokerSet",
      when: "Vault created for asset",
      what: "Creates LoanBroker ledger entry with fee structure and first-loss cover. (XLS-66)",
      color: "#ffaa00",
      realPath: false,
    },
    {
      tx: "LoanSet",
      when: "Borrower requests loan",
      what: "Records loan terms on-chain. Generates 256-bit loanId. Referenced in every LoanPay.",
      color: "#ffaa00",
      realPath: false,
    },
    {
      tx: "LoanPay",
      when: "Borrower repays installment",
      what: "Payment tx with LoanPay memo. Real testnet attempted. Each installment has its own hash.",
      color: "#0099ff",
      realPath: true,
    },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>XRPL Transaction Types</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            7 tx types. Every action auditable.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">06 / 13</span>
      </div>

      {/* XRPL props */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: "3–5s", l: "Finality", color: "#00e5cc" },
          { v: "$0.001", l: "Per transaction", color: "#00e5cc" },
          { v: "wss://s.altnet.rippletest.net:51233", l: "Testnet endpoint", color: "#0099ff" },
        ].map((m) => (
          <div
            key={m.l}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 flex items-center gap-3"
          >
            <div className="h-2 w-2 rounded-full shrink-0" style={{ background: m.color }} />
            <div>
              <p className="text-sm font-bold text-white font-mono">{m.v}</p>
              <p className="text-[10px] text-white/35 uppercase tracking-wider">{m.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tx grid */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {txs.map((row) => (
          <div
            key={row.tx}
            className="rounded-2xl p-4 flex gap-4"
            style={{
              background: `linear-gradient(135deg, ${row.color}0d 0%, #0a0a0a 70%)`,
              border: `1px solid ${row.color}25`,
            }}
          >
            <div className="shrink-0">
              <span
                className="inline-block rounded-lg px-2 py-1 text-[10px] font-mono font-bold"
                style={{
                  color: row.color,
                  background: `${row.color}18`,
                  border: `1px solid ${row.color}30`,
                }}
              >
                {row.tx}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-semibold text-white/80">{row.when}</p>
                {row.realPath && (
                  <span className="rounded-full border border-green-500/30 bg-green-500/10 px-1.5 py-0.5 text-[9px] font-mono text-green-400">
                    real testnet
                  </span>
                )}
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{row.what}</p>
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
        <span className="text-[11px] font-mono text-white/20">07 / 13</span>
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

function SlideDemo() {
  const pages = [
    { route: "/lend", label: "Loan Pools", desc: "Browse vaults. Filter by yield, category, status. Fund with InvestDialog.", color: "#00e5cc" },
    { route: "/borrow", label: "My Loans", desc: "Active loans, repayment schedules. Pay button per installment.", color: "#ffaa00" },
    { route: "/tokenize", label: "Register Asset", desc: "KYC gate → collateral escrow → MPT issuance. Fully gated flow.", color: "#a855f7" },
    { route: "/validator", label: "Validator", desc: "Approve (EscrowFinish) or refund (EscrowCancel). Fee breakdown shown.", color: "#0099ff" },
    { route: "/dashboard", label: "Dashboard", desc: "Holdings, lending positions, loan history, full transaction audit trail.", color: "#00e5cc" },
    { route: "/trust", label: "Trust & DID", desc: "XRP DID explainer, verification status, compliance controls.", color: "#ff4d4d" },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>Live Demo</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            6 pages. All working.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">08 / 13</span>
      </div>

      <div className="grid grid-cols-3 gap-4 flex-1">
        {pages.map((p) => (
          <div
            key={p.route}
            className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${p.color}0d 0%, #0a0a0a 65%)`,
              border: `1px solid ${p.color}25`,
            }}
          >
            <div
              className="absolute top-3 right-4 text-[11px] font-mono font-bold opacity-40"
              style={{ color: p.color }}
            >
              {p.route}
            </div>
            <p className="text-xl font-black text-white mt-4">{p.label}</p>
            <p className="text-sm text-white/50 leading-relaxed flex-1">{p.desc}</p>
            <div
              className="h-px w-full opacity-30"
              style={{ background: p.color }}
            />
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: p.color }} />
              <span className="text-[10px] text-white/30 font-mono">live on localhost:3000</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stack summary */}
      <div className="rounded-2xl border border-[#00e5cc]/20 bg-[#00e5cc]/5 px-6 py-4">
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "Blockchain", value: "XRPL testnet · wss://s.altnet.rippletest.net" },
            { label: "Framework", value: "Next.js 15 App Router · React 19 · TypeScript" },
            { label: "State", value: "Zustand 5 · persisted to localStorage" },
            { label: "Auth / Wallet", value: "Supabase auth · TON Connect · XRP DID" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[10px] text-[#00e5cc]/60 uppercase tracking-wider font-semibold mb-1">
                {s.label}
              </p>
              <p className="text-xs text-white/60 font-mono leading-relaxed">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideXRPLImpl() {
  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>XRPL Deep Dive</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            The actual implementation.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">09 / 13</span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">
        {/* Column 1: Interest rate formula */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(0,229,204,0.05)", border: "1px solid rgba(0,229,204,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-[#00e5cc]" />
            <p className="text-sm font-black text-white uppercase tracking-wide">Interest Rate</p>
          </div>

          {/* Formula box */}
          <div
            className="rounded-xl px-4 py-3 font-mono text-[11px] leading-relaxed"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,229,204,0.15)" }}
          >
            <span className="text-[#00e5cc]">rate</span>
            <span className="text-white/40"> = </span>
            <span className="text-white">base</span>
            <span className="text-white/40"> + </span>
            <span className="text-[#ffaa00]">risk</span>
            <span className="text-white/40"> + </span>
            <span className="text-[#a855f7]">duration</span>
            <span className="text-white/40"> − </span>
            <span className="text-[#0099ff]">collateral</span>
            <span className="text-white/40"> ± </span>
            <span className="text-[#ff4d4d]">xrp</span>
          </div>

          <div className="space-y-1.5">
            {[
              { label: "base", value: "5%", note: "always", color: "#ffffff" },
              { label: "real-estate / invoice", value: "+2%", note: "risk", color: "#ffaa00" },
              { label: "vehicle / business", value: "+4%", note: "risk", color: "#ffaa00" },
              { label: "art / unknown", value: "+7%", note: "risk", color: "#ffaa00" },
              { label: "< 30 days", value: "+1%", note: "duration", color: "#a855f7" },
              { label: "30–90 days", value: "+2%", note: "duration", color: "#a855f7" },
              { label: "> 90 days", value: "+3%", note: "duration", color: "#a855f7" },
              { label: "per 10% collateral", value: "−1%", note: "capped −5%", color: "#0099ff" },
              { label: "XRP volatility high", value: "+1%", note: "xrp adj", color: "#ff4d4d" },
              { label: "XRP volatility low", value: "−0.5%", note: "xrp adj", color: "#ff4d4d" },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-white/40 truncate">{r.label}</span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono font-bold" style={{ color: r.color }}>
                    {r.value}
                  </span>
                  <span className="text-[9px] text-white/20">{r.note}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-lg px-3 py-2 text-[10px] font-mono mt-auto"
            style={{ background: "rgba(0,229,204,0.08)", border: "1px solid rgba(0,229,204,0.15)" }}
          >
            <span className="text-white/40">risk rating: </span>
            <span className="text-[#00e5cc]">&lt;8%</span>
            <span className="text-white/25"> Low · </span>
            <span className="text-[#ffaa00]">8–12%</span>
            <span className="text-white/25"> Med · </span>
            <span className="text-[#ff4d4d]">&gt;12%</span>
            <span className="text-white/25"> High</span>
          </div>
        </div>

        {/* Column 2: Solvency / eligibility gate */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-[#a855f7]" />
            <p className="text-sm font-black text-white uppercase tracking-wide">
              Solvency Check
            </p>
          </div>

          <p className="text-xs text-white/45 leading-relaxed">
            <code className="text-[#a855f7] font-mono">checkUserEligibility()</code> runs two
            on-chain gates before any tokenization is allowed. Bypassing the UI re-runs the same
            check inside <code className="text-[#a855f7] font-mono">tokenizeAsset()</code>.
          </p>

          {/* Gate 1 */}
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: "rgba(255,77,77,0.06)", border: "1px solid rgba(255,77,77,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#ff4d4d] uppercase tracking-wider">
                Gate 1 — Identity
              </span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed font-mono">
              attachDIDToUser(address)<br />
              requireVerifiedDID(identity, "tokenize")<br />
              <span className="text-white/25">→ blocks if kycStatus ≠ verified</span>
            </p>
            <p className="text-[10px] text-[#ff4d4d]/70">
              Error: "Your XRP DID has not been verified."
            </p>
          </div>

          {/* Gate 2 */}
          <div
            className="rounded-xl p-3 flex flex-col gap-2"
            style={{ background: "rgba(255,170,0,0.06)", border: "1px solid rgba(255,170,0,0.2)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-[#ffaa00] uppercase tracking-wider">
                Gate 2 — Collateral
              </span>
            </div>
            <p className="text-[11px] text-white/50 leading-relaxed font-mono">
              verifyCollateralEscrow(address, required)<br />
              required = assetValue × 0.10<br />
              <span className="text-white/25">→ checks on-chain escrow balance</span>
            </p>
            <p className="text-[10px] text-[#ffaa00]/70">
              Error: "Must lock at least $X USDC (10%)"
            </p>
          </div>

          <div
            className="rounded-lg px-3 py-2 mt-auto"
            style={{ background: "rgba(0,229,204,0.06)", border: "1px solid rgba(0,229,204,0.15)" }}
          >
            <p className="text-[10px] text-white/40 font-mono">
              <span className="text-[#00e5cc]">COLLATERAL_RATIO</span> = 0.1 (hardcoded)<br />
              <span className="text-[#00e5cc]">originationFee</span> = principal × 0.01
            </p>
          </div>
        </div>

        {/* Column 3: Payment flow */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(0,153,255,0.05)", border: "1px solid rgba(0,153,255,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="h-4 w-4 text-[#0099ff]" />
            <p className="text-sm font-black text-white uppercase tracking-wide">Payment Flow</p>
          </div>

          <p className="text-xs text-white/45 leading-relaxed">
            Loans repay in <span className="text-white font-semibold">3 equal installments</span>.
            Each installment = 1 <code className="text-[#0099ff] font-mono">LoanPay</code> tx on
            XRPL testnet (real-first, simulation fallback).
          </p>

          {/* Installment breakdown */}
          <div
            className="rounded-xl px-4 py-3 font-mono text-[11px] space-y-1.5"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,153,255,0.15)" }}
          >
            <p className="text-white/30 text-[10px] uppercase tracking-wider mb-2">
              per installment
            </p>
            <div className="flex justify-between">
              <span className="text-white/50">principal</span>
              <span className="text-white">loanAmount / 3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">interest</span>
              <span className="text-white">(principal × rate / 3)</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1">
              <span className="text-[#0099ff]">total payment</span>
              <span className="text-[#0099ff]">principal + interest</span>
            </div>
          </div>

          {/* LoanPay tx structure */}
          <div
            className="rounded-xl p-3 flex flex-col gap-1.5"
            style={{ background: "rgba(0,153,255,0.06)", border: "1px solid rgba(0,153,255,0.18)" }}
          >
            <p className="text-[10px] text-[#0099ff]/60 uppercase tracking-wider font-semibold">
              LoanPay tx memo
            </p>
            {[
              { k: "loanId", v: "256-bit loan identifier" },
              { k: "borrowerAddress", v: "XRP wallet address" },
              { k: "amountUsdc", v: "principal + interest" },
              { k: "principal", v: "split for lender P&L" },
              { k: "interest", v: "split for lender P&L" },
            ].map((f) => (
              <div key={f.k} className="flex items-start gap-2">
                <span className="text-[10px] font-mono text-[#0099ff]/70 shrink-0">{f.k}:</span>
                <span className="text-[10px] text-white/35">{f.v}</span>
              </div>
            ))}
          </div>

          <div
            className="rounded-lg px-3 py-2 mt-auto flex flex-col gap-1.5"
            style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <p className="text-[10px] text-white/50 font-mono">
                EscrowCreate + LoanPay → real testnet first
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-yellow-400/70 shrink-0" />
              <p className="text-[10px] text-white/35 font-mono">
                MPT + LoanBrokerSet + LoanSet → simulated (XLS-33/66 not live on testnet)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideVault() {
  const lifecycle = [
    { n: "1", actor: "Lender", action: "Deposit → EscrowCreate", detail: "1 XRP drop on devnet (proof-of-commitment). USDC amount tracked in Zustand + Supabase. DestinationTag routes to vault.", tx: "EscrowCreate", color: "#00e5cc", live: true },
    { n: "2", actor: "Validator", action: "Approve → EscrowFinish", detail: "OfferSequence = stored xrplEscrowSequence. On-chain: 1 XRP released. In-app: USDC holdings minted.", tx: "EscrowFinish", color: "#0099ff", live: false },
    { n: "3", actor: "Borrower", action: "Request → LoanSet", detail: "DID verified. Rate = calculateLoanPricing(). originateLoan() writes BorrowingPosition.", tx: "LoanSet", color: "#ffaa00", live: false },
    { n: "4", actor: "Borrower", action: "Repay × 3 → LoanPay", detail: "3 equal instalments. Each Payment tx tagged with LoanPay memo. hash stored per row.", tx: "LoanPay", color: "#a855f7", live: false },
    { n: "5", actor: "Platform", action: "Vault earns", detail: "servicingFeePercent accrues. Lenders see yield on dashboard. activeLoansCount decrements.", tx: null, color: "#22c55e", live: false },
  ];

  const vaultFields = [
    { key: "assetId", val: "1:1 with Asset", note: "one vault per tokenized asset" },
    { key: "destinationTag", val: "uint32 (e.g. 1001)", note: "routes deposits on-chain" },
    { key: "firstLossCoverPercent", val: "e.g. 10%", note: "protects lenders from default" },
    { key: "originationFeePercent", val: "e.g. 1%", note: "charged at loan creation" },
    { key: "servicingFeePercent", val: "e.g. 0.5%", note: "annual, accrues to platform" },
    { key: "xrplBrokerAddress", val: "rQDN8Q…", note: "platform wallet receives funds" },
    { key: "status", val: "active | paused | closed", note: "controls new deposits" },
  ];

  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>Vault Protocol</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            One vault per asset.<br />Capital separated on-chain.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">10 / 13</span>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4">

        {/* Column 1: Vault data model */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(0,229,204,0.05)", border: "1px solid rgba(0,229,204,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-4 w-4 text-[#00e5cc]" />
            <p className="text-sm font-black text-white uppercase tracking-wide">Vault Model</p>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">
            Each asset gets exactly one vault.{" "}
            <code className="text-[#00e5cc] font-mono">LoanBrokerSet</code> tx creates the vault on XRPL.
            Lender capital pools into the same escrow address, separated by{" "}
            <code className="text-[#ffaa00] font-mono">DestinationTag</code>.
          </p>

          <div className="space-y-1.5 mt-1">
            {vaultFields.map((f) => (
              <div key={f.key} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[10px] font-mono text-[#00e5cc]">{f.key}</code>
                  <span className="text-[10px] font-mono text-white/60 shrink-0">{f.val}</span>
                </div>
                <span className="text-[9px] text-white/25 pl-1">{f.note}</span>
              </div>
            ))}
          </div>

          <div
            className="rounded-lg px-3 py-2 mt-auto font-mono text-[10px]"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,229,204,0.15)" }}
          >
            <span className="text-white/30">vault created via </span>
            <span className="text-[#00e5cc]">LoanBrokerSet</span>
            <span className="text-white/30"> (XLS-66)</span>
          </div>
        </div>

        {/* Column 2: Loan lifecycle */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(255,170,0,0.05)", border: "1px solid rgba(255,170,0,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-[#ffaa00]" />
            <p className="text-sm font-black text-white uppercase tracking-wide">Loan Lifecycle</p>
          </div>

          <div className="flex flex-col gap-2">
            {lifecycle.map((step) => (
              <div
                key={step.n}
                className="rounded-xl p-3 flex gap-3"
                style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${step.color}22` }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5"
                  style={{ background: `${step.color}22`, color: step.color }}
                >
                  {step.n}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className="text-[11px] font-black text-white">{step.action}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px]" style={{ color: step.live ? "#22c55e" : "rgba(255,255,255,0.2)" }}>
                        {step.live ? "● live" : "○ pending"}
                      </span>
                      {step.tx && (
                        <code
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                          style={{ background: `${step.color}18`, color: step.color }}
                        >
                          {step.tx}
                        </code>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-white/35 leading-relaxed">{step.detail}</p>
                  <p className="text-[9px] font-mono mt-0.5" style={{ color: `${step.color}80` }}>{step.actor}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Settlement model */}
          <div
            className="rounded-xl px-3 py-2.5 mt-auto space-y-1.5"
            style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,170,0,0.2)" }}
          >
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Settlement Model</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">🔗</span>
                <span className="text-[10px] font-mono text-white/60">1 XRP drop</span>
              </div>
              <span className="text-[9px] text-white/25">on-chain · XRPL devnet · proof-of-commitment</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px]">💵</span>
                <span className="text-[10px] font-mono text-[#22c55e]">$X USDC</span>
              </div>
              <span className="text-[9px] text-white/25">in-app · Zustand + Supabase · economic value</span>
            </div>
            <p className="text-[9px] text-white/20 pt-0.5 border-t border-white/6">
              xrplEscrowHash links the on-chain proof to the off-chain position.
            </p>
          </div>
        </div>

        {/* Column 3: DestinationTag routing */}
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: "rgba(0,153,255,0.05)", border: "1px solid rgba(0,153,255,0.2)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="h-4 w-4 text-[#0099ff]" />
            <p className="text-sm font-black text-white uppercase tracking-wide">On-chain Routing</p>
          </div>

          <p className="text-[11px] text-white/40 leading-relaxed">
            All lender deposits go to the same platform wallet. The{" "}
            <code className="text-[#ffaa00] font-mono">DestinationTag</code> (uint32) on each
            EscrowCreate separates them logically. Every vault gets a unique deterministic tag.
          </p>

          {/* Tag examples */}
          <div className="space-y-1.5">
            {[
              { name: "Dubai Marina Tower", tag: 1001, asset: "real-estate" },
              { name: "Geneva Flat B", tag: 1002, asset: "real-estate" },
              { name: "Porsche 911 GT3", tag: 1003, asset: "vehicle" },
              { name: "Hornsea Wind Farm", tag: 1005, asset: "infrastructure" },
            ].map((v) => (
              <div
                key={v.tag}
                className="flex items-center justify-between rounded-lg px-3 py-1.5"
                style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,153,255,0.12)" }}
              >
                <span className="text-[10px] text-white/50 truncate">{v.name}</span>
                <code className="text-[10px] font-mono text-[#0099ff] shrink-0 ml-2">Tag #{v.tag}</code>
              </div>
            ))}
          </div>

          {/* Memo structure */}
          <div
            className="rounded-xl px-4 py-3 font-mono text-[10px] leading-relaxed space-y-0.5"
            style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(0,153,255,0.15)" }}
          >
            <p className="text-white/25">MemoType:</p>
            <p className="text-[#0099ff]">LiquidX/VaultDeposit</p>
            <p className="text-white/25 mt-1">MemoData:</p>
            <p className="text-white/60">{`{ assetId, vaultTag }`}</p>
          </div>

          <div
            className="rounded-lg px-3 py-2 mt-auto text-[10px] leading-relaxed"
            style={{ background: "rgba(0,153,255,0.08)", border: "1px solid rgba(0,153,255,0.15)" }}
          >
            <p className="text-white/50">
              Query: <code className="text-[#0099ff]">account_objects</code> with{" "}
              <code className="text-[#ffaa00]">type: &quot;escrow&quot;</code> → filter by MemoType
              → sum drops → convert to USD via live XRP price.
            </p>
          </div>
        </div>

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
        <span className="text-[11px] font-mono text-white/20">11 / 13</span>
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

function SlideXRPLDiagram() {
  return (
    <div className="h-full flex flex-col px-10 py-8 gap-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Tag>XRPL Architecture</Tag>
          <h2 className="text-5xl font-black text-white leading-tight">
            XRPL as the trust backbone.
          </h2>
        </div>
        <span className="text-[11px] font-mono text-white/20">12 / 13</span>
      </div>

      <div className="flex-1 flex items-stretch gap-4">
        {/* Left: Participants */}
        <div className="w-44 shrink-0 flex flex-col justify-center gap-3">
          <p className="text-[9px] uppercase tracking-widest text-white/25 font-semibold px-1 mb-1">
            Participants
          </p>
          {[
            {
              label: "Borrower",
              sub: "tokenize → borrow → repay",
              color: "#ffaa00",
              txs: ["MPTokenIssuanceCreate", "LoanSet", "LoanPay"],
            },
            {
              label: "Lender",
              sub: "fund → earn → withdraw",
              color: "#00e5cc",
              txs: ["EscrowCreate"],
            },
            {
              label: "Validator",
              sub: "approve → release escrow",
              color: "#a855f7",
              txs: ["EscrowFinish", "EscrowCancel"],
            },
          ].map((actor) => (
            <div
              key={actor.label}
              className="rounded-xl px-4 py-3"
              style={{ background: `${actor.color}0d`, border: `1px solid ${actor.color}30` }}
            >
              <p className="text-sm font-bold" style={{ color: actor.color }}>
                {actor.label}
              </p>
              <p className="text-[9px] text-white/35 mt-0.5">{actor.sub}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {actor.txs.map((tx) => (
                  <span
                    key={tx}
                    className="text-[8px] font-mono px-1 py-0.5 rounded"
                    style={{ color: `${actor.color}90`, background: `${actor.color}12` }}
                  >
                    {tx}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Left arrows */}
        <div className="flex flex-col justify-center gap-10 shrink-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className="h-px w-10 bg-white/20" />
              <div
                className="w-0 h-0"
                style={{
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "7px solid rgba(255,255,255,0.2)",
                }}
              />
            </div>
          ))}
        </div>

        {/* XRPL Hub */}
        <div
          className="flex-1 rounded-3xl flex flex-col items-center justify-center gap-5 relative overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(0,229,204,0.13) 0%, rgba(0,229,204,0.03) 55%, transparent 100%)",
            border: "1px solid rgba(0,229,204,0.3)",
            boxShadow: "0 0 80px rgba(0,229,204,0.08)",
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-48 w-48 rounded-full bg-[#00e5cc]/8 blur-3xl pointer-events-none" />

          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#00e5cc] to-[#0099ff] flex items-center justify-center shadow-[0_0_50px_rgba(0,229,204,0.5)] relative">
            <Zap className="h-8 w-8 text-black" />
          </div>

          <div className="text-center relative">
            <p className="text-3xl font-black text-white">XRP Ledger</p>
            <p className="text-[11px] text-[#00e5cc]/60 font-mono mt-1">
              wss://s.altnet.rippletest.net:51233
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 px-6 relative">
            {[
              "EscrowCreate",
              "EscrowFinish",
              "EscrowCancel",
              "MPTokenIssuanceCreate",
              "LoanBrokerSet",
              "LoanSet",
              "LoanPay",
            ].map((tx) => (
              <span
                key={tx}
                className="rounded-lg px-2 py-1.5 text-[9px] font-mono text-center leading-tight"
                style={{
                  color: "rgba(0,229,204,0.8)",
                  background: "rgba(0,229,204,0.08)",
                  border: "1px solid rgba(0,229,204,0.2)",
                }}
              >
                {tx}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-5 relative">
            {(
              [
                { v: "3–5s", l: "Finality" },
                { v: "$0.001", l: "Per tx" },
                { v: "XLS-66", l: "Lending std" },
                { v: "XLS-33", l: "MPT std" },
              ] as const
            ).map((m, i) => (
              <div key={m.l} className="flex items-center gap-5">
                {i > 0 && <div className="h-6 w-px bg-white/10" />}
                <div className="text-center">
                  <p className="text-base font-black text-[#00e5cc]">{m.v}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">{m.l}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right arrows */}
        <div className="flex flex-col justify-center gap-10 shrink-0">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className="h-px w-10 bg-[#00e5cc]/30" />
              <div
                className="w-0 h-0"
                style={{
                  borderTop: "5px solid transparent",
                  borderBottom: "5px solid transparent",
                  borderLeft: "7px solid rgba(0,229,204,0.3)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Right: On-chain outputs */}
        <div className="w-44 shrink-0 flex flex-col justify-center gap-3">
          <p className="text-[9px] uppercase tracking-widest text-white/25 font-semibold px-1 mb-1">
            On-chain output
          </p>
          {[
            { label: "TX Hash", sub: "Explorer link per action", color: "#00e5cc" },
            { label: "Escrow IDs", sub: "Locked capital proof", color: "#00e5cc" },
            { label: "MPT ID", sub: "48-char issuance ID", color: "#a855f7" },
          ].map((o) => (
            <div
              key={o.label}
              className="rounded-xl px-4 py-3"
              style={{ background: `${o.color}0d`, border: `1px solid ${o.color}25` }}
            >
              <p className="text-sm font-bold text-white">{o.label}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{o.sub}</p>
            </div>
          ))}

          <div
            className="rounded-xl px-4 py-3 mt-1"
            style={{ background: "rgba(0,229,204,0.06)", border: "1px solid rgba(0,229,204,0.2)" }}
          >
            <p className="text-[10px] text-[#00e5cc]/70 font-mono leading-relaxed">
              testnet.xrpl.org explorer links live on every action
            </p>
          </div>
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
        <span className="text-[11px] font-mono text-white/20">13 / 13</span>
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

// ─── Slide map ────────────────────────────────────────────────────────────────

const SLIDE_COMPONENTS: Record<SlideId, React.ComponentType> = {
  cover: SlideCover,
  problem: SlideProblem,
  solution: SlideSolution,
  features: SlideFeatures,
  architecture: SlideArchitecture,
  "xrpl-txs": SlideXRPLTxs,
  "user-flows": SlideUserFlows,
  demo: SlideDemo,
  "xrpl-impl": SlideXRPLImpl,
  vault: SlideVault,
  identity: SlideIdentity,
  "xrpl-diagram": SlideXRPLDiagram,
  appendix: SlideAppendix,
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
