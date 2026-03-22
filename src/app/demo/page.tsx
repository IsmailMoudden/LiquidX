"use client";

import { ExternalLink, CheckCircle2, AlertCircle, Zap, Wallet, FlaskConical, Github, ArrowRight } from "lucide-react";
import Link from "next/link";

const REAL_TXS = [
  {
    label: "LoanBrokerSet — vault created (XLS-66)",
    hash: "282563D29EA37B82D1985E1A3A5B97320E120826DF993BF42F954314C40292DF",
  },
  {
    label: "MPTokenIssuanceCreate — Lagos asset tokenized (XLS-33)",
    hash: "4F6EA98CD1856AF74447F6974B323FAA9E8D90897ED1771D8A565EF3694AEA53",
  },
  {
    label: "LoanSet — $100 loan originated, ASSET_OWNER borrows (XLS-66)",
    hash: "7E410068A867BF529FF1E1FD47E4334C00A31B96CB8D199824523F383DC5D368",
  },
  {
    label: "MPTokenIssuanceCreate — Dakar asset tokenized (XLS-33)",
    hash: "FAE29DE6E7C6EE1FFF1AF0471617A8237AACAB11694B67DFE5D5CE409C687B1B",
  },
  {
    label: "LoanSet — $200 loan originated, USER borrows (XLS-66)",
    hash: "B27A5C6CC6FEE9FC3380F98CFDC0B3637554740DD5729A29CB58BBEE26D4DD11",
  },
  {
    label: "LoanPay — first instalment repaid by USER (XLS-66)",
    hash: "17CE9CB2F389DA803B40F3DD4DC2A438395627877CA16FF5E477C194E0261322",
  },
];

const EXPLORER = "https://devnet.xrpl.org/transactions";

export default function DemoPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-white/6 bg-[#060606]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-primary uppercase tracking-widest mb-5">
            <FlaskConical className="h-3 w-3" /> Demo Project
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">About this project</h1>
          <p className="text-white/50 text-base leading-relaxed">
            LiquidX is a hackathon prototype built for XRPL Commons (March 2026). The transactions are real — confirmed on XRPL devnet. The wallet balances and portfolio are seeded for demo purposes.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">

        {/* Real vs mocked */}
        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6">
            <h2 className="font-semibold text-white">What's real vs seeded</h2>
          </div>
          <div className="divide-y divide-white/6">
            {[
              { real: true,  label: "XRPL transactions",        desc: "EscrowCreate, LoanBrokerSet, LoanSet, LoanPay, MPTokenIssuanceCreate — all submitted to XRPL devnet. Hashes are verifiable below." },
              { real: true,  label: "DID resolution",            desc: "W3C DID documents resolved live from the ledger via account_objects." },
              { real: true,  label: "LoanPay on-chain",          desc: "Clicking 'Pay Now' submits a real XLS-66 LoanPay tx to devnet and returns a confirmed hash." },
              { real: true,  label: "Supabase auth & data",      desc: "Sign up / sign in is real. Your lending positions and transactions persist across sessions." },
              { real: false, label: "USDC balance",              desc: "Every new account starts with $10,000 USDC. This is not a real stablecoin — it's an in-app balance for demo purposes." },
              { real: false, label: "Portfolio seed data",       desc: "Pre-loaded assets, loans, and transactions are seeded locally so the app is immediately explorable. They reference real devnet tx hashes." },
              { real: false, label: "XRP price ($100/XRP)",      desc: "An artificial price is used on devnet so $100 = 1 XRP, keeping test wallet balances solvent across multiple demo runs." },
            ].map(({ real, label, desc }) => (
              <div key={label} className="flex items-start gap-4 px-6 py-4">
                {real
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  : <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                }
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-sm text-white/40 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real tx hashes */}
        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-white">Confirmed devnet transactions</h2>
          </div>
          <div className="divide-y divide-white/6">
            {REAL_TXS.map(({ label, hash }) => (
              <div key={hash} className="flex items-start justify-between gap-4 px-6 py-3">
                <p className="text-sm text-white/60 leading-relaxed">{label}</p>
                <a
                  href={`${EXPLORER}/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-mono text-primary hover:underline shrink-0"
                >
                  <ExternalLink className="h-3 w-3" />
                  {hash.slice(0, 10)}…
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* How to use with real wallet */}
        <div className="rounded-2xl border border-white/8 bg-[#0d0d0d] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary" />
            <h2 className="font-semibold text-white">Use with your own devnet wallet</h2>
          </div>
          <div className="px-6 py-5 space-y-4 text-sm text-white/50 leading-relaxed">
            <p>If you want your own actions (Lend, Pay Now) to appear on your devnet wallet:</p>
            <ol className="space-y-3 list-none">
              {[
                <>Get a devnet wallet at <a href="https://faucet.devnet.rippletest.net/accounts" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">faucet.devnet.rippletest.net</a> — free, ~1000 XRP funded instantly.</>,
                <>Sign up on LiquidX, go to <Link href="/account" className="text-primary hover:underline">Account</Link>, paste your devnet r-address in the XRPL field.</>,
                <>The platform will use your address in all EscrowCreate transactions — your wallet shows the debit on <a href="https://devnet.xrpl.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">devnet.xrpl.org</a>.</>,
                <>For LoanPay (borrower repayments), the platform currently signs with its own demo wallet — full borrower-side signing with user keys is the next step toward production.</>,
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 text-[10px] font-bold text-white/40 shrink-0 mt-0.5">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Source + CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="https://github.com/IsmailMoudden/LiquidX"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/4 px-5 py-3 text-sm font-medium text-white hover:bg-white/8 transition-colors"
          >
            <Github className="h-4 w-4" />
            View source on GitHub
          </a>
          <Link
            href="/lend"
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-black hover:bg-primary/90 transition-colors"
          >
            Explore the platform
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </div>
  );
}
