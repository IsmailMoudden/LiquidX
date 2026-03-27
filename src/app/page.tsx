import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Lock,
  BarChart3,
  Play,
  Leaf,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Tokenize Your Asset",
    description:
      "Convert a real-world asset into on-chain tokens. This becomes your collateral — verifiable, auditable, and locked on XRPL.",
  },
  {
    icon: Shield,
    title: "Validator Approval",
    description:
      "An independent validator verifies compliance and collateral before any funds move. No validator sign-off, no settlement.",
  },
  {
    icon: Globe,
    title: "Borrow in USDC",
    description:
      "Asset owners borrow against their tokenized collateral at fixed rates. Funds are released only after escrow conditions are met.",
  },
  {
    icon: TrendingUp,
    title: "Fund Loans, Earn Yield",
    description:
      "Lenders fund specific loan pools backed by real collateral. Fixed terms, fixed returns — 5 to 12% annually.",
  },
  {
    icon: Lock,
    title: "Escrow-Protected",
    description:
      "All capital is held in XRPL escrow. If conditions aren't met, funds return automatically. No counterparty risk.",
  },
  {
    icon: BarChart3,
    title: "Full Audit Trail",
    description:
      "Every loan origination, repayment, and settlement is on-chain. Your dashboard shows exactly where every dollar is.",
  },
];

const STATS = [
  { label: "Total Loans Originated", value: "$31.4M+", change: "+2%" },
  { label: "Avg. Lender Return", value: "8.5%", change: "+0.5%" },
  { label: "Active Loan Pools", value: "6", change: null },
  { label: "Min. to Lend", value: "$100", change: null },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="animate-blob absolute top-[-10%] left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full hero-blob opacity-80" />
        <div className="animate-blob-delay absolute top-[20%] right-[-5%] h-[500px] w-[500px] rounded-full hero-blob-2 opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        {/* Badge */}
        <div className="animate-fade-up delay-100 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-widest mb-10">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Asset-Backed Lending · XRPL
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-200 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white mb-6">
          Borrow against your assets.
          <br />
          <span className="gradient-text">Fund loans that earn yield.</span>
        </h1>

        <p className="animate-fade-up delay-300 mx-auto max-w-xl text-base sm:text-lg text-white/50 mb-10 leading-relaxed">
          Real-world assets as collateral. Fixed-term loans. Transparent settlement on XRPL.
        </p>

        <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-3 justify-center mb-20">
          <Link
            href="/lend"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Fund a Loan
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/borrow"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-white/15 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <Play className="h-3.5 w-3.5" />
            Borrow Against an Asset
          </Link>
          <Link
            href="/deck"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            <Play className="h-3.5 w-3.5 fill-primary" />
            Demo
          </Link>
        </div>

        {/* Dashboard preview card */}
        <div className="animate-fade-up delay-500 relative mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20">
              <Zap className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm font-semibold text-white">LiquidX</span>
            <span className="ml-auto text-xs text-white/30">Documents</span>
          </div>
          {/* Stats grid inside preview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 p-px">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-[#0d0d0d] p-5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-white/40">{stat.label}</p>
                  {stat.change && (
                    <span className="text-xs text-primary font-medium">
                      ↑ {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section className="relative overflow-hidden bg-[#060606] py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-transparent to-primary/5" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
                No bank required.
                <br />
                No borders. No bias.
              </h2>
            </div>
            <div className="space-y-6 text-white/50 text-sm leading-relaxed">
              <p>
                LiquidX lets asset owners unlock liquidity without selling — and without asking a bank for permission. Tokenize your real-world asset on XRPL, use it as collateral, and borrow against its value at transparent rates. Your asset is your credential. Where you're from is not.
              </p>
              <p>
                For lenders, it means access to the same loan pools that used to require a $1M minimum and an institutional account. Fund a specific deal backed by verified real collateral, earn 5–12% fixed, and get repaid on schedule — from anywhere, from $100.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features — bento */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-widest mb-5">
              How It Works
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Two sides. One platform.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Row 1 — wide + narrow */}
            <div className="sm:col-span-2 rounded-2xl border border-white/8 bg-[#0d0d0d] p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-primary/6 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
              <Zap className="h-6 w-6 text-primary mb-5" />
              <h3 className="text-xl font-bold text-white mb-2">Tokenize Your Asset</h3>
              <p className="text-sm text-white/40 leading-relaxed max-w-sm">Convert a real-world asset into on-chain tokens. This becomes your collateral — verifiable, auditable, and locked on XRPL.</p>
              <div className="mt-7 flex gap-2 flex-wrap">
                {["MPTokenIssuanceCreate", "XLS-33 ✓", "XRPL devnet"].map((t) => (
                  <span key={t} className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-[11px] font-mono text-primary/80">{t}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-7">
              <Shield className="h-6 w-6 text-primary mb-5" />
              <h3 className="text-lg font-bold text-white mb-2">Validator Approval</h3>
              <p className="text-sm text-white/40 leading-relaxed">Independent validator verifies compliance and collateral. No sign-off, no settlement.</p>
              <div className="mt-5 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">0.75–1% validator fee</span>
              </div>
            </div>

            {/* Row 2 — narrow + wide */}
            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-7">
              <Globe className="h-6 w-6 text-primary mb-5" />
              <h3 className="text-lg font-bold text-white mb-2">Borrow in USDC</h3>
              <p className="text-sm text-white/40 leading-relaxed">Borrow against your tokenized collateral at fixed rates. Funds released only after escrow conditions are met.</p>
            </div>

            <div className="sm:col-span-2 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute bottom-0 right-0 w-56 h-56 bg-primary/10 rounded-full translate-y-1/3 translate-x-1/4 blur-3xl" />
              <TrendingUp className="h-6 w-6 text-primary mb-5" />
              <h3 className="text-xl font-bold text-white mb-2">Fund Loans, Earn Yield</h3>
              <p className="text-sm text-white/40 leading-relaxed max-w-sm">Lenders fund specific loan pools backed by real collateral. Fixed terms, fixed returns.</p>
              <div className="mt-6 flex items-end gap-4">
                <div>
                  <p className="text-5xl font-black text-primary leading-none">5–12%</p>
                  <p className="text-xs text-white/30 mt-1.5">annual yield · real-asset backed</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-bold text-white">$100</p>
                  <p className="text-xs text-white/30">minimum to lend</p>
                </div>
              </div>
            </div>

            {/* Row 3 — three equal */}
            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
              <Lock className="h-5 w-5 text-primary mb-4" />
              <h3 className="font-bold text-white mb-2">Escrow-Protected</h3>
              <p className="text-xs text-white/40 leading-relaxed">All capital held in XRPL escrow. Auto-returned if conditions aren't met. No counterparty risk.</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6">
              <BarChart3 className="h-5 w-5 text-primary mb-4" />
              <h3 className="font-bold text-white mb-2">Full Audit Trail</h3>
              <p className="text-xs text-white/40 leading-relaxed">Every origination, repayment, and settlement is on-chain with a public tx hash.</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] p-6 flex flex-col items-center justify-center text-center gap-2">
              <p className="text-5xl font-black text-white">3–5s</p>
              <p className="text-xs text-white/30 uppercase tracking-widest">XRPL finality</p>
              <span className="text-[10px] font-mono text-primary/60 border border-primary/20 rounded-full px-2 py-0.5">EscrowCreate → confirmed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="bg-[#060606] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-widest mb-5">
              Who This Is Really For
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Built for those
              <br />
              the system froze out.
            </h2>
            <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-xl">
              Traditional finance rejects based on nationality, documentation, and jurisdiction.
              LiquidX judges on the asset — not on where you're from or who your bank is.
            </p>
          </div>

          {/* Bento: borrowers tall | lenders + green stacked */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" style={{ gridTemplateRows: "auto auto" }}>
            {/* Borrowers — tall, spans 2 rows */}
            <div className="sm:row-span-2 rounded-2xl border border-[#ffaa00]/20 bg-[#ffaa00]/5 p-8 flex flex-col">
              <div className="h-11 w-11 rounded-xl bg-[#ffaa00]/15 border border-[#ffaa00]/25 flex items-center justify-center mb-6">
                <Globe className="h-5 w-5 text-[#ffaa00]" />
              </div>
              <p className="text-[10px] text-[#ffaa00]/60 uppercase tracking-widest mb-1">For borrowers</p>
              <h3 className="text-xl font-bold text-white mb-4">If your bank said no.</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-6">
                You own a real asset. The bank denied you — nationality, paperwork, credit model.
                LiquidX removes the middleman. Your asset is your credential.
              </p>
              <ul className="space-y-3 flex-1">
                {[
                  "Asset is your credential — not your passport",
                  "No SWIFT. No credit bureau.",
                  "DID-verified identity — merit, not origin",
                  "Collateral on-chain, terms transparent",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/50">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#ffaa00] shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-xl bg-[#ffaa00]/10 border border-[#ffaa00]/20 p-4">
                <p className="text-3xl font-black text-[#ffaa00]">1.4B</p>
                <p className="text-xs text-white/30 mt-0.5">unbanked asset owners globally</p>
              </div>
            </div>

            {/* Lenders — top right (col-span-2) */}
            <div className="sm:col-span-2 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/8 to-transparent p-8 relative overflow-hidden">
              <div className="pointer-events-none absolute top-0 right-0 w-48 h-48 bg-primary/8 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
              <div className="h-11 w-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-6">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <p className="text-[10px] text-primary/60 uppercase tracking-widest mb-1">For lenders</p>
              <h3 className="text-xl font-bold text-white mb-3">If institutional yields were never for you.</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                Private credit, real estate debt, infrastructure yield — reserved for $1M+ institutions. LiquidX opens the same pools from $100, anywhere in the world.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { stat: "$100", label: "Minimum — no accreditation" },
                  { stat: "5–12%", label: "APY on verified collateral" },
                  { stat: "Auto", label: "returned if deal falls through" },
                  { stat: "Same", label: "assets institutions fund" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg bg-white/4 border border-white/8 px-3 py-2.5">
                    <p className="text-base font-bold text-primary">{s.stat}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Green — bottom right (col-span-2) */}
            <div className="sm:col-span-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <Leaf className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-emerald-400/60 uppercase tracking-widest mb-1">Social Impact</p>
                <p className="font-bold text-white mb-1">Green infrastructure. Open to everyone.</p>
                <p className="text-sm text-white/40 leading-relaxed">
                  Offshore wind to solar — from $100. The Hornsea Wind Farm pool gives retail lenders access to a government-backed CfD revenue stream. Same deal. Same yield. No institution required.
                </p>
              </div>
              <div className="sm:shrink-0 sm:text-right">
                <p className="text-3xl font-black text-emerald-400">$100</p>
                <p className="text-[10px] text-white/25 mt-0.5">to fund green infra</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Insights split section */}
      <section className="bg-[#060606] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: visual */}
            <div className="relative rounded-2xl border border-white/6 bg-[#0a0a0a] aspect-[4/3] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-full bg-white/20"
                      style={{ opacity: Math.random() * 0.8 + 0.1 }}
                    />
                  ))}
                </div>
              </div>
              <div className="relative z-10 h-24 w-24 rounded-full border-2 border-white/10 flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-white/30" />
              </div>
            </div>

            {/* Right: text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-widest mb-6">
                Built on XRPL
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Every transaction on-chain
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Loan origination, escrow creation, repayments — all settled as XRPL transactions with a public hash. LiquidX never holds your funds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/7 bg-[#080808] p-10 md:p-14">
            <div className="text-center mb-14">
              <h2 className="text-4xl font-bold text-white">How It Works</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                {
                  step: "01",
                  title: "Tokenize or Browse",
                  desc: "Asset owners tokenize their property on XRPL. Lenders browse active loan pools backed by verified collateral.",
                },
                {
                  step: "02",
                  title: "Lock Funds in Escrow",
                  desc: "Lenders commit USDC into XRPL escrow. Borrowers receive funds only after the validator approves the deal.",
                },
                {
                  step: "03",
                  title: "Repay & Earn",
                  desc: "Borrowers repay on a fixed schedule. Each LoanPay transaction is on-chain. Lenders receive principal + interest.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 text-primary font-bold text-lg mb-5">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl border border-white/8 bg-[#080808] p-12 text-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-3">
                Ready to put your capital to work?
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto text-sm">
                Fund a loan backed by real assets. Or borrow against what you own.
              </p>
              <Link
                href="/lend"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Explore Loan Pools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
