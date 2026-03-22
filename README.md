# LiquidX — RWA Lending Protocol on XRPL

**Hackathon submission · XRPL Commons · March 2026**

LiquidX is a real-world asset (RWA) lending protocol built natively on XRPL. Property owners in emerging markets use their assets as collateral to access on-chain loans. Lenders earn 8–12% APY backed by escrow-locked capital. Every step — from locking funds to releasing them — is settled with a verifiable XRPL transaction.

**8 real transaction types on devnet. XLS-66 now live. Zero smart contracts.**

---

## Prize Tracks

| Track | How LiquidX qualifies |
|---|---|
| **Lending & Borrowing** | Full loan lifecycle on-chain: EscrowCreate → EscrowFinish → LoanBrokerSet → LoanSet → LoanPay × 3. XLS-66 amendment active on devnet — LoanBrokerSet, LoanSet, LoanPay are all real. |
| **Programmability** | 8 native XRPL tx types, no EVM, no smart contracts. MPT (XLS-33) for token issuance. DID (W3C) for identity. DestinationTag-based vault routing. All composable via XRPL primitives. |
| **Social Impact** | Unlocks credit for 1.4B unbanked asset owners who own property but can't get loans. $100 minimum investment opens yield to retail. DID-based identity — no bank account required. |

---

## Live Demo

```
https://liquidx-demo.vercel.app   (or run locally — see below)
```

Pitch deck (17 slides): `/deck` route inside the app, or `src/app/deck/page.tsx`.

---

## What's Real on Devnet

All transactions verified on [devnet.xrpl.org](https://devnet.xrpl.org).

| Transaction | Status | Amendment |
|---|---|---|
| `EscrowCreate` | Real devnet | Native |
| `EscrowFinish` | Real devnet | Native |
| `Payment` (vault repay) | Real devnet | Native |
| `DIDSet` | Real devnet | Native |
| `MPTokenIssuanceCreate` | Real devnet | XLS-33 (MPTokensV1 enabled) |
| `LoanBrokerSet` | Real devnet | **XLS-66 now active** |
| `LoanSet` | Real devnet | **XLS-66 now active** |
| `LoanPay` | Real devnet | **XLS-66 now active** |

XLS-66 amendment confirmed active on XRPL devnet as of March 2026. MPTokensV1 amendment enabled=true on devnet (confirmed 22 March 2026).

---

## 3-Wallet Architecture

```
rGguTpZQ… (Lender wallet)
  └─ EscrowCreate → rQDN8QJX (Platform wallet)
       ├─ DestinationTag 1001  → Dubai Marina vault
       ├─ DestinationTag 1002  → Geneva Flat vault
       └─ ...

rQDN8QJX… (Platform wallet)
  ├─ EscrowFinish  — releases funds after validator approval
  ├─ LoanBrokerSet — creates on-chain vault (XLS-66)
  └─ LoanSet       — originates loan on-chain (XLS-66)

rG1Lt5T1… (Asset owner wallet)
  ├─ Collateral EscrowCreate (self-escrow, 180-day lock)
  ├─ MPTokenIssuanceCreate   — tokenizes the asset (XLS-33)
  ├─ DIDSet                  — anchors W3C DID on-chain
  └─ LoanPay × 3             — repayment installments (XLS-66)
```

DestinationTag routes capital between vaults on a single platform wallet — no per-asset wallet needed.

---

## Full On-Chain Flow

```
1. ISSUER
   DIDSet  →  collateral EscrowCreate (≥10% of asset value, 180-day lock)
   ↓ platform verifies escrow via account_objects
   MPTokenIssuanceCreate  →  asset live, mptIssuanceId stored
   LoanBrokerSet  →  vault created on-chain with fee structure

2. LENDER
   EscrowCreate  →  capital locked (FinishAfter = funding deadline)
   DestinationTag routes deposit to correct vault

3. VALIDATOR
   Reviews compliance: ownership doc hash, DID, escrow positions
   EscrowFinish  →  releases capital to issuer
   Holdings minted as MPT fractions for each lender

4. BORROWER
   DID verified  →  LoanSet originates loan, loanId recorded on-chain
   LoanPay × 3  →  each installment is a separate on-chain tx
   All paid  →  loan closed on-chain
```

---

## Quick Start

```bash
git clone https://github.com/IsmailMoudden/LiquidX
cd LiquidX
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app seeds with a demo wallet, pre-populated assets, and a funded USDC balance. All XRPL calls attempt real devnet first; if the network is unavailable the app falls back to simulation with the same result shape (`status: "simulated"` shown in the UI).

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              Next.js App Router (React 19)           │
│  /lend  /borrow  /tokenize  /validator  /deck  ...   │
└─────────────────────┬───────────────────────────────┘
                      │ read / dispatch
┌─────────────────────▼───────────────────────────────┐
│              Zustand Portfolio Store                 │
│           src/store/portfolio-store.ts               │
│   investments · loans · holdings · transactions      │
└─────────────────────┬───────────────────────────────┘
                      │ calls
┌─────────────────────▼───────────────────────────────┐
│              Lending Service Layer                   │
│            src/lib/lending-service.ts                │
│   eligibility gates · fee calc · result shape        │
└─────────────────────┬───────────────────────────────┘
                      │ wraps
┌─────────────────────▼───────────────────────────────┐
│              XRPL Client Layer                       │
│   src/lib/xrpl.ts · src/lib/xrpl-client.ts          │
│   real devnet first → simulation fallback            │
│   wss://s.devnet.rippletest.net:51233                │
└─────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Supabase (persistence)                  │
│   assets · lending_positions · loans · transactions  │
└─────────────────────────────────────────────────────┘
```

UI never calls XRPL directly. Every blockchain action goes through the service layer, returns a `ServiceResult<T>` with hash + explorer link, and is recorded in Supabase.

---

## User Flows

### Lender
1. Browse vaults on `/lend`
2. Click an asset → `/assets/[id]`
3. "Invest — Lock in Escrow" → `EscrowCreate` fires on devnet
4. Capital locked; position shows as `locked` with tx hash
5. Validator approves → `EscrowFinish` → tokens minted as holdings

### Borrower
1. Set up DID on Account page (`DIDSet` on devnet)
2. Lock ≥10% collateral (`EscrowCreate` with 180-day lock)
3. Platform verifies collateral via `account_objects`
4. Tokenize asset → `MPTokenIssuanceCreate` (XLS-33)
5. Request loan → `LoanSet` (XLS-66) — loanId recorded on-chain
6. Pay 3 installments → `LoanPay` × 3 (XLS-66), each with explorer hash

### Validator
1. Open `/validator` dashboard
2. Review: ownership doc hash, DID verified, locked positions
3. **Approve** → `EscrowFinish` releases funds + mints MPT holdings
4. **Refund** → `EscrowCancel` returns capital to lenders

---

## Key Files

```
src/
├── lib/
│   ├── xrpl.ts               # All XRPL primitives (8 tx types)
│   ├── xrpl-client.ts        # Per-component XRPL call wrappers
│   ├── lending-service.ts    # Service layer — eligibility + tx orchestration
│   ├── loan-pricing.ts       # Interest rate model (5 components)
│   ├── did.ts                # W3C DID resolution via account_objects
│   └── types.ts              # All TypeScript types
├── store/
│   ├── portfolio-store.ts    # Zustand store (investments, loans, holdings, txs)
│   └── identity-store.ts     # Wallet + DID single source of truth
├── data/
│   ├── assets.ts             # 8 seeded RWA assets
│   ├── validators.ts         # Validator registry
│   └── loanBrokers.ts        # Vault registry (DestinationTag map)
├── app/
│   ├── page.tsx              # Landing page
│   ├── lend/page.tsx         # Vault browser + on-chain flow explainer
│   ├── borrow/page.tsx       # Loan request + repayment schedule
│   ├── tokenize/page.tsx     # Asset onboarding + collateral gate
│   ├── dashboard/page.tsx    # Portfolio: stats, allocation, holdings, txs
│   ├── validator/page.tsx    # Settlement dashboard
│   ├── deck/page.tsx         # 17-slide pitch deck (for judges)
│   ├── trust/page.tsx        # DID + compliance explainer
│   └── assets/[id]/page.tsx  # Asset detail + invest
└── components/
    ├── assets/
    │   ├── InvestDialog.tsx      # EscrowCreate flow
    │   ├── ValidatorPanel.tsx    # EscrowFinish / EscrowCancel
    │   ├── FundingCard.tsx       # Asset preview with funding progress
    │   └── EscrowStatusBadge.tsx # On-chain status indicators
    └── identity/
        └── IdentityGateBanner.tsx  # DID enforcement banner
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Blockchain | XRPL devnet — `wss://s.devnet.rippletest.net:51233` |
| Amendments | XLS-33 (MPTokensV1), XLS-66 (Lending) — both active on devnet |
| Identity | W3C DID via XRPL `DIDSet` + `account_objects` resolution |
| State | Zustand 5 with localStorage persistence |
| Backend | Supabase (auth + Postgres) |
| UI | TailwindCSS, Radix UI, Lucide, Recharts, Framer Motion |
| Wallet | TON Connect (`@tonconnect/ui-react`) |

---

## Technical Documentation

| Doc | Content |
|---|---|
| [docs/xrpl.md](docs/xrpl.md) | Every XRPL tx type: mechanics, real vs simulated, escrow, MPT, DID, XLS-66 |
| [docs/lending.md](docs/lending.md) | Service layer, interest rate formula, vault lifecycle, eligibility gates |
| [docs/state.md](docs/state.md) | Zustand store: actions, computed values, persistence |
| [docs/types.md](docs/types.md) | All TypeScript types: Asset, Loan, Investment, Validator, XRPIdentity |

---

## Why XRPL — Not Ethereum

- **Native escrow** — `FinishAfter` is a ledger condition enforced by the protocol, not a Solidity function that can be exploited
- **MPT (XLS-33)** — `requireAuth + canEscrow + canTrade` compliance flags at the protocol layer
- **XRP DID (W3C)** — identity anchored on-chain in ≤256 bytes, resolved server-side
- **XLS-66** — native lending primitives: `LoanBrokerSet / LoanSet / LoanPay` — full loan lifecycle without a single line of smart contract code
- **Speed + cost** — 3–5s finality, ~$0.000006 per escrow (vs $5–50 on Ethereum)
- **No layer-2, no rollup, no gas wars**

---

## Hackathon Context

- **Event:** XRPL Commons Hackathon, March 2026
- **Team:** Ismail Moudden
- **Network:** XRPL devnet (`wss://s.devnet.rippletest.net:51233`)
- **Status:** All 8 tx types verified real on devnet. XLS-66 and XLS-33 both active.
- **Pitch deck:** `/deck` route — 17 slides covering problem, solution, track alignment, XRPL primitives, live txs, identity, adoption roadmap, and 4 appendix slides with full architecture details
