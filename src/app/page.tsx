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
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant Liquidity",
    description:
      "Buy and sell asset fractions instantly using USDC. No lock-ups, no waiting periods.",
  },
  {
    icon: Shield,
    title: "Institutional Grade",
    description:
      "Every asset is professionally vetted, valued, and legally structured before tokenization.",
  },
  {
    icon: Globe,
    title: "Global Access",
    description:
      "Access premium real-world assets from Geneva, Munich, Lisbon, and beyond — from anywhere.",
  },
  {
    icon: TrendingUp,
    title: "Real Yield",
    description:
      "Earn 5–12% projected annual yield from rental income, energy contracts, and appreciation.",
  },
  {
    icon: Lock,
    title: "Stablecoin Powered",
    description:
      "All transactions settled in USDC — no volatility, no slippage, no currency risk.",
  },
  {
    icon: BarChart3,
    title: "Full Transparency",
    description:
      "Real-time portfolio dashboard with allocation charts and complete transaction history.",
  },
];

const STATS = [
  { label: "Total Assets Tokenized", value: "$31.4M+", change: "+2%" },
  { label: "Avg. Annual Yield", value: "8.5%", change: "+0.5%" },
  { label: "Assets Available", value: "6", change: null },
  { label: "Min. Investment", value: "$100", change: null },
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
          New Spring Update
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-200 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white mb-6">
          Buy, sell, and own fractions
          <br />
          <span className="gradient-text">of real-world assets</span>
        </h1>

        <p className="animate-fade-up delay-300 mx-auto max-w-xl text-base sm:text-lg text-white/50 mb-10 leading-relaxed">
          Powered by stablecoins for instant, seamless transactions.
        </p>

        <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-3 justify-center mb-20">
          <Link
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            Explore Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full border border-white/15 bg-white/5 text-white text-sm font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
          >
            <Play className="h-3.5 w-3.5" />
            Watch video
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
                Creating tools that make work
                <br />
                smarter and simpler
              </h2>
            </div>
            <div className="space-y-6 text-white/50 text-sm leading-relaxed">
              <p>
                We believe that meaningful work happens when tech fades into the
                background, when tools just get out of the way and let your ideas
                take center stage. From day one, our goal has been simple: create
                a foundation that&apos;s neutral and powerful, so your message shines
                above everything else.
              </p>
              <p>
                We build templates with one rule in mind: flexibility without
                compromise. Swap content, adjust visuals, or layer in future
                updates. The structure is modular, the styling minimal, and the
                outcome always professional. In a world full of noise, our mission
                is to deliver a clean digital canvas that stays sharp, no matter
                how you shape it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-widest mb-5">
              Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white">
              Built for clarity, built for speed
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="feature-card rounded-2xl p-7">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 mb-6">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
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
                Performance Insights
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                See your work in motion
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Monitor key metrics and trends effortlessly. Get real-time
                visibility into what matters most to your team.
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
                  title: "Browse Assets",
                  desc: "Explore tokenized real-world assets across real estate, infrastructure, art, and wine.",
                },
                {
                  step: "02",
                  title: "Buy Fractions with USDC",
                  desc: "Purchase fractional ownership tokens instantly. No minimums beyond $100. No lock-up.",
                },
                {
                  step: "03",
                  title: "Earn Yield & Exit Anytime",
                  desc: "Receive projected yields quarterly. Sell your tokens instantly back to the liquidity pool.",
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
                Ready to invest in the real world?
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto text-sm">
                Start with $100 USDC. No intermediaries. Instant settlement.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                Start Investing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
