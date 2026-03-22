# LiquidX

**Tokenized real-world asset (RWA) marketplace with XRPL-settled escrow, lending, and validator-gated settlement.**

LiquidX lets investors fund fractional ownership of real-world assets (real estate, infrastructure, art, etc.) using USDC. Every material action — locking capital, releasing funds, tokenizing an asset, originating a loan — is settled on the **XRPL testnet** with a real transaction hash.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [User Flows](#user-flows)
- [Technical Docs](#technical-docs)
- [Key Files](#key-files)
- [Tech Stack](#tech-stack)

---

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). All data is mock/demo — no real assets or money involved. The app ships with a seeded USDC balance (100,000 USDC) and pre-populated holdings, loans, and transactions.

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                   Pages / UI                │
│  /lend  /borrow  /tokenize  /validator  ... │
└─────────────────┬───────────────────────────┘
                  │ read / dispatch
┌─────────────────▼───────────────────────────┐
│           Zustand Portfolio Store           │
│          src/store/portfolio-store.ts       │
└─────────────────┬───────────────────────────┘
                  │ calls
┌─────────────────▼───────────────────────────┐
│           Lending Service Layer             │
│         src/lib/lending-service.ts          │
└─────────────────┬───────────────────────────┘
                  │ wraps
┌─────────────────▼───────────────────────────┐
│           XRPL Integration                  │
│             src/lib/xrpl.ts                 │
│   Real testnet first → simulation fallback  │
└─────────────────────────────────────────────┘
```

The app is strictly layered: UI never calls XRPL directly. Every blockchain action goes through the service layer, which calls `xrpl.ts` and returns a `ServiceResult<T>` with an XRPL hash and explorer link.

---

## User Flows

### Lender flow
1. Browse vaults on `/lend`
2. Click an asset → asset detail page (`/assets/[id]`)
3. "Invest — Lock in Escrow" opens **InvestDialog**
4. Confirm amount → XRPL **EscrowCreate** tx fires
5. Capital locked; position shows as `locked`
6. Validator approves → **EscrowFinish** → position becomes `released`, tokens minted as holdings

### Borrower flow
1. Tokenize an asset on `/tokenize` (requires DID + 10% collateral escrow)
2. Asset listed → go to `/borrow`
3. Request a loan → XRPL **LoanSet** tx
4. View repayment schedule; pay each installment → XRPL **LoanPay** txs

### Validator flow
1. Open `/validator` dashboard
2. Review assets awaiting settlement
3. **Approve** → EscrowFinish (releases funds to issuer) or **Refund** → EscrowCancel (returns capital to lenders)

### Issuer / tokenization flow
1. Complete KYC → DID verified on-chain
2. Lock ≥ 10% of asset value as collateral escrow (180-day lock)
3. Platform verifies escrow on-chain
4. Submit asset → XRPL **MPTokenIssuanceCreate** (XLS-33)
5. MPT issuance ID returned; asset is live

---

## Technical Docs

| Document | What it covers |
|---|---|
| [docs/xrpl.md](docs/xrpl.md) | Full XRPL integration: every tx type, escrow mechanics, MPT issuance, simulation fallback |
| [docs/lending.md](docs/lending.md) | Lending service layer, interest rate formula, eligibility gates, vault/loan lifecycle |
| [docs/state.md](docs/state.md) | Zustand store: actions, computed values, persistence, seed data |
| [docs/types.md](docs/types.md) | All TypeScript types: Asset, Vault, LendingPosition, BorrowingPosition, Validator, XRPIdentity |

---

## Key Files

```
src/
├── lib/
│   ├── xrpl.ts               # All XRPL primitives (EscrowCreate/Finish/Cancel, MPT, LoanBroker, LoanSet/Pay)
│   ├── lending-service.ts    # Service layer — UI calls this, not xrpl.ts directly
│   ├── loan-pricing.ts       # Interest rate calculator
│   └── types.ts              # All TypeScript types
├── store/
│   └── portfolio-store.ts    # Single Zustand store (holdings, loans, transactions, assets)
├── data/
│   ├── assets.ts             # 8 mock RWA assets
│   ├── validators.ts         # 2 mock validators
│   └── loanBrokers.ts        # 3 mock vaults
├── app/
│   ├── page.tsx              # Landing page
│   ├── lend/page.tsx         # Vault / loan pool browser
│   ├── borrow/page.tsx       # Loan management
│   ├── tokenize/page.tsx     # Asset onboarding + collateral gate
│   ├── dashboard/page.tsx    # Portfolio overview
│   ├── validator/page.tsx    # Settlement dashboard
│   ├── trust/page.tsx        # DID / compliance explainer
│   └── assets/[id]/page.tsx  # Asset detail + invest
└── components/
    ├── assets/
    │   ├── InvestDialog.tsx      # Escrow funding flow
    │   ├── TradeDialog.tsx       # Secondary market buy/sell
    │   ├── ValidatorPanel.tsx    # Approve / refund UI
    │   ├── FundingCard.tsx       # Asset preview card
    │   └── EscrowStatusBadge.tsx # Status badge components
    ├── portfolio/
    │   ├── HoldingsTable.tsx     # Token holdings table
    │   └── TransactionList.tsx  # Transaction audit trail
    └── providers/
        └── DeadlineWatcher.tsx  # Auto-expires past-deadline assets
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| State | Zustand 5 with localStorage persistence |
| Blockchain | XRPL (xrpl v4.6.0) — testnet settlement |
| Wallet | TON Connect (`@tonconnect/ui-react`) |
| Auth | Supabase |
| UI | TailwindCSS, Radix UI, Framer Motion, Recharts, Lucide |

---

## XRPL Overview

LiquidX uses XRPL testnet (`wss://s.altnet.rippletest.net:51233`) for all on-chain settlement. The integration attempts a real testnet transaction first; if that fails (network unavailable, amendment not active), it falls back to a realistic simulation with a random hash and authentic-looking ledger numbers.

Every XRPL action returns an explorer link to `https://testnet.xrpl.org/transactions/{hash}`.

See [docs/xrpl.md](docs/xrpl.md) for the full breakdown.
