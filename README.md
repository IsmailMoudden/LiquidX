# LiquidX

## Unlock the value of what you own.

There are 1.4 billion people in the world who own land, property, or real assets — but can't borrow against them. Not because the assets aren't valuable. Because the systems that would recognize that value don't reach them.

LiquidX changes that.

---

## The Problem

A property owner in Lagos has a $200,000 home. She wants a $30,000 loan to expand her business. The bank says no — no credit score, no formal payslip, wrong passport.

A retail investor in Europe wants exposure to real-asset yields. The 0.5% his savings account offers doesn't cover inflation. The institutional products that do — minimum ticket $500,000 — don't reach him.

A Dubai notary spends three days every week manually verifying property documents, issuing paper certificates that live in a drawer and can't be checked by anyone digitally.

These three people are stuck. Not because of a lack of assets, capital, or expertise — but because the infrastructure connecting them doesn't exist.

---

## What LiquidX Does

LiquidX is a lending protocol for real-world assets, built natively on XRPL.

A property owner tokenizes their asset, locks collateral on-chain, and accesses a loan. A lender deposits capital into an escrow-locked vault and earns 8–12% APY backed by real assets. A validator — an existing notary or legal firm — approves the settlement on-chain and earns a fee for work they're already doing.

No bank. No credit score. No minimum $500,000. The asset is the passport.

---

## Why This Matters

**For borrowers:** A $30,000 loan at 8% APR that a bank would never approve. Accessible from $100. Secured by on-chain escrow, not paperwork. The only identity required is a W3C DID anchored in 256 bytes on XRPL — pseudonymous to the world, verified to the platform.

**For lenders:** Real-asset-backed returns. Capital locked in an escrow enforced by the ledger itself — not a promise in a smart contract, not a counterparty's word. When the validator approves, the `FinishAfter` condition in the ledger releases the funds. No reentrancy. No gas war. No Solidity.

**For validators:** Notaries and registries are already verifying these assets. LiquidX gives them an on-chain trail for the work they do every day, a fee on every settlement, and a digital reputation anchored to their DID.

---

## How It Works — End to End

**1. The asset owner sets up identity and collateral**

She anchors a W3C DID document on XRPL with a `DIDSet` transaction — 256 bytes, confirmed in 3 seconds. She locks ≥10% of the asset value in a self-escrow on-chain (180-day lock). The platform verifies the escrow by reading `account_objects` directly from the ledger — no oracle, no third party.

She submits her asset. An `MPTokenIssuanceCreate` transaction (XLS-33) mints fractional token supply with `requireAuth + canEscrow + canTrade` flags — compliance enforced at the protocol layer, not application code.

**2. Lenders fund the vault**

Lenders browse assets, pick a vault, and commit capital. An `EscrowCreate` transaction locks their funds with a `DestinationTag` routing them to the correct vault on the platform wallet. The `FinishAfter` timestamp is the funding deadline — if the asset doesn't fund in time, `EscrowCancel` returns every lender's capital automatically.

There is no pool of funds. There is no contract holding money. The XRPL ledger holds it.

**3. A validator settles**

An independent validator — a notary, a legal firm, a registry — reviews the asset's documentation on-chain. Ownership document hash, DID verification, escrow positions. When they approve, an `EscrowFinish` transaction releases the capital to the asset owner. Holdings are minted as MPT fractions for each lender. The validator's fee is deducted and recorded.

**4. The borrower repays**

A `LoanSet` transaction (XLS-66) records the loan terms on-chain — rate, term, borrower address, origination fee. A `loanId` is generated on the ledger. Each of three installments triggers a `LoanPay` transaction, each with its own explorer hash. When all three are paid, the loan closes on-chain.

---

## The Technology — Why XRPL

LiquidX uses no smart contracts. Every primitive it needs exists natively on XRPL.

**Native Escrow** — `EscrowCreate / EscrowFinish / EscrowCancel`. The `FinishAfter` field is a ledger condition, not a function call. It cannot be exploited. It cannot be frontrun.

**Multi-Purpose Tokens (XLS-33)** — `MPTokenIssuanceCreate`. The `requireAuth`, `canEscrow`, and `canTrade` flags enforce compliance at the protocol layer. The `mptIssuanceId` is real — extracted from `AffectedNodes` on the validated transaction.

**W3C DID (XRP Ledger)** — `DIDSet`. Identity anchored on-chain in ≤256 bytes. KYC happens off-chain. The platform sees a verified DID. The world sees a pseudonymous address.

**Lending Primitives (XLS-66)** — `LoanBrokerSet / LoanSet / LoanPay`. The XLS-66 amendment is now active on XRPL devnet. The full loan lifecycle — vault creation, loan origination, installment repayment — runs as real transactions on the ledger, verifiable on devnet.xrpl.org.

**Speed and cost** — 3–5 second finality. ~$0.000006 per escrow. Accessible from $100. No layer-2, no rollup, no waiting 12 blocks.

---

## 8 Real Transactions on Devnet

All verified on [devnet.xrpl.org](https://devnet.xrpl.org).

| Transaction | What it does |
|---|---|
| `EscrowCreate` | Lender locks capital; FinishAfter enforced by ledger |
| `EscrowFinish` | Validator releases capital to issuer after approval |
| `Payment` | Borrower repays vault; LiquidX/VaultRepay memo on-chain |
| `DIDSet` | Borrower/issuer anchors W3C identity in 256 bytes |
| `MPTokenIssuanceCreate` | Asset tokenized; 48-char mptIssuanceId from AffectedNodes |
| `LoanBrokerSet` | Vault created on-chain with fee structure (XLS-66) |
| `LoanSet` | Loan originated; 256-bit loanId on-chain (XLS-66) |
| `LoanPay × 3` | Each repayment installment is a real tx (XLS-66) |

XLS-66 amendment confirmed active on XRPL devnet — LoanBrokerSet, LoanSet, LoanPay are all real.
MPTokensV1 amendment enabled on devnet (confirmed 22 March 2026).

---

## Who This Reaches First

**Borrowers** — property owners in UAE, West Africa, Southeast Asia who own assets worth $100K–$500K but have no path to formal credit. LiquidX's first 10 pilots target Dubai expat property owners. Their asset becomes collateral. Their DID becomes their credit identity.

**Lenders** — 50M+ retail investors and crypto-native yield seekers who want real-asset returns without counterparty risk. Starting investment: $100. The escrow on XRPL is their guarantee — not a company's promise.

**Validators** — 500,000 notaries and property registries globally who are already verifying these exact assets. LiquidX doesn't replace them. It gives their existing work an on-chain trail, a fee on every settlement, and a digital reputation they can build over time.

---

## What's Built

A full end-to-end protocol — not a mockup.

- **Lend page** — browse vaults, deposit capital, watch escrow status update in real time with XRPL tx hashes
- **Borrow page** — request loans, view repayment schedule, pay installments with on-chain receipts
- **Tokenize page** — onboard an asset: DID gate → collateral escrow → MPT issuance
- **Validator dashboard** — review assets, approve or refund with one click, on-chain settlement
- **Portfolio / Dashboard** — holdings, allocation chart, full transaction audit trail with explorer links
- **Identity layer** — DID setup, verification status, enforcement gates throughout the protocol

Every material action produces an XRPL transaction hash. Every hash links to devnet.xrpl.org.

---

## Running the Demo

```bash
git clone https://github.com/IsmailMoudden/LiquidX
cd LiquidX
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app seeds with a funded wallet, pre-populated assets, and live demo positions. XRPL calls attempt real devnet first — if the network is unavailable, the app falls back to simulation with the same result shape and a `status: "simulated"` badge shown in the UI.

The pitch deck lives at `/deck` — 17 slides with the full problem, solution, track alignment, and architecture details.

---

## Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Blockchain | XRPL devnet — `wss://s.devnet.rippletest.net:51233` |
| Amendments | XLS-33 (MPTokensV1) + XLS-66 (Lending) — both active on devnet |
| Identity | W3C DID via `DIDSet` + `account_objects` resolution |
| State | Zustand 5 with localStorage persistence |
| Backend | Supabase (auth + Postgres) |
| UI | TailwindCSS, Radix UI, Lucide, Recharts |

---

## Technical Documentation

- [docs/xrpl.md](docs/xrpl.md) — every XRPL tx type: mechanics, real vs simulated, escrow, MPT, DID, XLS-66
- [docs/lending.md](docs/lending.md) — service layer, interest rate model, vault lifecycle, eligibility gates
- [docs/state.md](docs/state.md) — Zustand store: actions, computed values, persistence
- [docs/types.md](docs/types.md) — all TypeScript types

---

*XRPL Commons Hackathon · March 2026 · Ismail Moudden*
