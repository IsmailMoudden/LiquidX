# LiquidX

**Unlock the value of what you own.**

LiquidX is a lending protocol for real-world assets, built natively on XRPL. Property owners tokenize their assets, lock collateral on-chain, and access loans. Lenders earn 8–12% APY backed by real assets, capital secured in XRPL escrow.

No bank. No credit score. No minimum $500,000. The asset is the passport.

---

## What's Built

A full end-to-end protocol running on XRPL devnet — not a mockup.

- **Lend** — browse vaults, deposit capital, watch escrow status update in real time with XRPL tx hashes
- **Borrow** — request loans, view repayment schedule, pay installments with on-chain receipts
- **Tokenize** — onboard an asset: DID gate → collateral escrow → MPT issuance
- **Validator dashboard** — review assets, approve or refund with one click, on-chain settlement
- **Dashboard** — holdings, allocation chart, full transaction audit trail with explorer links
- **Identity layer** — W3C DID setup, verification status, enforcement gates throughout

Every material action produces an XRPL transaction hash. Every hash links to [devnet.xrpl.org](https://devnet.xrpl.org).

---

## On-Chain Transactions (XRPL Devnet)

| Tx Type | Standard | What it does |
|---|---|---|
| `EscrowCreate / EscrowFinish` | Native | Lender locks capital; ledger enforces release |
| `DIDSet` | Native | Borrower anchors W3C identity in 256 bytes |
| `MPTokenIssuanceCreate` | XLS-33 | Asset tokenized; mptIssuanceId from AffectedNodes |
| `LoanBrokerSet` | XLS-66 | Vault created on-chain with fee structure |
| `LoanSet` | XLS-66 | Loan originated; 256-bit loanId on-chain |
| `LoanPay` | XLS-66 | Each installment is a real on-chain tx |

XLS-33 (MPTokensV1) and XLS-66 (Lending Protocol) both active on XRPL devnet as of March 2026.

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Blockchain | XRPL devnet — `wss://s.devnet.rippletest.net:51233` |
| Amendments | XLS-33 (MPTokensV1) + XLS-66 (Lending) |
| Identity | W3C DID via `DIDSet` + `account_objects` resolution |
| State | Zustand 5 with localStorage persistence |
| Backend | Supabase (Postgres + Auth) |
| UI | TailwindCSS, Radix UI, Lucide, Recharts, Framer Motion |

---

## Setup

```bash
git clone https://github.com/IsmailMoudden/LiquidX
cd LiquidX
npm install
cp .env.example .env.local
# fill in .env.local (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app seeds with pre-populated demo assets and live devnet tx hashes. XRPL calls attempt real devnet first — if the network is unavailable, the app falls back to simulation with a `status: "simulated"` badge in the UI.

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# XRPL Devnet — platform wallet (server-only, never exposed to browser)
XRPL_PLATFORM_SECRET=<platform-wallet-seed>
XRPL_PLATFORM_ADDRESS=<platform-r-address>
XRPL_WSS=wss://s.devnet.rippletest.net:51233

# XRPL Explorer (safe to expose)
NEXT_PUBLIC_XRPL_NETWORK_ID=1
NEXT_PUBLIC_XRPL_EXPLORER=https://devnet.xrpl.org/transactions
```

Generate a devnet wallet at [faucet.devnet.rippletest.net](https://faucet.devnet.rippletest.net/accounts).

---

*Built for XRPL Commons Hackathon · March 2026 · Ismail Moudden*
