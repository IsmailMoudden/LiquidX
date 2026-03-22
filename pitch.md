# LiquidX — Hackathon Pitch
**XRPL Commons · Lending & Borrowing + Social Impact · March 2026**

---

## What is LiquidX?

LiquidX is a decentralized lending protocol that lets anyone borrow against real-world assets and anyone lend against them — settled on XRPL, no bank required.

Own a property, a vehicle, a piece of art? Tokenize it, lock collateral, borrow USDC at a transparent rate. Have $100 and want 8% yield? Fund the same deals institutions do. Every step — escrow, identity, repayment — is on-chain and auditable.

---

## The Problem

### $16T locked in illiquid real-world assets
Real estate, art, infrastructure — owners can't borrow against them without selling or going through a bank that takes weeks and charges 15% fees.

### $10B+ liquidated in a single DeFi crash
Crypto-collateral lending has one fatal flaw: the collateral crashes with the market. There's no real-world floor. Mass liquidations are a feature, not a bug.

### 3B+ adults denied credit by geography
A developer in Lagos, a landlord in Cairo, a farm owner in São Paulo — they hold real assets but banks reject them by nationality, documentation, or jurisdiction. The asset qualifies. The person doesn't. That's not risk management. That's bias.

> **Missing layer:** a trustless, borderless bridge between real-world asset value and on-chain capital — open to anyone with an asset, regardless of nationality, bank, or bureaucracy.

---

## The Solution

A full end-to-end lending protocol on XRPL — asset tokenization, escrow settlement, validator approval, loan origination, and repayment — every step anchored to a public transaction hash.

```
Tokenize → Validate → Escrow → Borrow → Repay
```

| Step | What happens | XRPL tx |
|---|---|---|
| **Tokenize** | Asset owner creates an MPT on XRPL with requireAuth + canEscrow flags | `MPTokenIssuanceCreate` |
| **Validate** | Independent validator verifies KYC, collateral proof, legal declaration | — |
| **Escrow** | Lender capital locked on XRPL — auto-refunded if validator rejects | `EscrowCreate` |
| **Borrow** | Borrower receives USDC. Loan terms written to XRPL as a LoanBroker entry | `LoanSet` (XLS-66) |
| **Repay** | 3 on-chain installments. Each LoanPay tx gets a unique hash and explorer link | `LoanPay` |

---

## Who This Is Really For

### For borrowers the system froze out
Traditional finance rejects based on nationality, documentation, and jurisdiction. LiquidX judges on the asset — not on where you're from or who your bank is.

- Your asset is your credential — not your passport
- No SWIFT. No correspondent bank. No credit bureau.
- DID-verified identity — on merit, not origin
- Collateral on-chain, terms transparent, no gatekeepers

### For lenders who never had access to institutional yields
Private credit, real estate debt, infrastructure yield — reserved for institutions with $1M+ minimums. LiquidX opens the same loan pools from **$100**, to anyone, anywhere.

- Minimum $100 — no accreditation required
- 5–12% APY on verified real-world collateral
- Capital in XRPL escrow — auto-returned if deal falls through

### Green infrastructure. Open to everyone.
From offshore wind to solar — LiquidX lets anyone fund real-world green infrastructure from $100. Same deal. Same yield. No institution required.

---

## What We Built — 6 Modules

### 1. RWA Tokenization
- DID identity gate — KYC must be verified before form unlocks
- 10% collateral escrow required and verified on-chain
- `MPTokenIssuanceCreate` with `requireAuth + canLock + canEscrow + canTrade`
- 48-char `mptIssuanceId` stored on asset

### 2. Validator Settlement
- Independent validator per asset
- 3-point checklist: documentation · collateral on-chain · legal declaration hash
- Approve → `EscrowFinish` (funds released to borrower)
- Reject → `EscrowCancel` (100% returned to lenders, zero loss)

### 3. Escrow Lending
- Lender capital locked via `EscrowCreate` with `FinishAfter` condition
- Auto-refund on deadline expiry
- Validator fee deducted at release
- Every position has XRPL hash + testnet explorer link

### 4. Loan Protocol (XLS-66)
- `LoanBrokerSet` creates on-chain vault with fee structure
- `LoanSet` records terms + generates 256-bit `loanId`
- 3 equal installments, each a `LoanPay` tx
- Rate = `base(5%) + risk + duration − collateral bonus ± XRP adjustment`

### 5. Identity & Privacy (XRP DID)
- W3C Decentralized Identifier anchored on XRPL
- KYC happens off-chain — only a cryptographic proof is on-chain
- Other participants see a pseudonymous DID address, never your real identity
- Verified to the platform. Pseudonymous to the world.

### 6. Full Audit Trail
- Every action produces a `Transaction` record with `xrplHash + xrplTxType`
- `testnet.xrpl.org` explorer links live on every event
- Dashboard shows P&L, holdings, repayment schedules

---

## Technical Architecture

```
┌─────────────────────────────────────────────┐
│  PAGES  — Next.js 15 App Router · React 19  │
│  /lend  /borrow  /tokenize  /validator  /dashboard
└───────────────┬─────────────────────────────┘
                │ read / dispatch actions
┌───────────────▼─────────────────────────────┐
│  STORE  — Zustand 5 · localStorage persist  │
│  invest()  approveAndRelease()  originateLoan()  repayLoan()
└───────────────┬─────────────────────────────┘
                │ calls service with params
┌───────────────▼─────────────────────────────┐
│  SERVICE  — lending-service.ts              │
│  checkUserEligibility()  depositToVault()  requestLoan()
└───────────────┬─────────────────────────────┘
                │ calls XRPL primitives
┌───────────────▼─────────────────────────────┐
│  XRPL  — xrpl.ts · testnet first → fallback │
│  EscrowCreate  EscrowFinish  EscrowCancel    │
│  MPTokenIssuanceCreate  LoanBrokerSet        │
│  LoanSet  LoanPay                            │
└─────────────────────────────────────────────┘
```

UI never touches the chain directly. No shortcuts.

---

## XRPL Transaction Types

| Tx | Triggered when | Status |
|---|---|---|
| `EscrowCreate` | Lender funds pool | **Real testnet** |
| `EscrowFinish` | Validator approves | Simulated |
| `EscrowCancel` | Validator rejects / expired | Simulated |
| `MPTokenIssuanceCreate` | Issuer tokenizes asset | Simulated (XLS-33 pending) |
| `LoanBrokerSet` | Vault created for asset | Simulated (XLS-66 pending) |
| `LoanSet` | Borrower requests loan | Simulated (XLS-66 pending) |
| `LoanPay` | Borrower repays installment | **Real testnet** |

**Testnet endpoint:** `wss://s.altnet.rippletest.net:51233`
**Finality:** 3–5s · **Cost:** $0.001/tx

> `EscrowCreate` and `LoanPay` attempt the real XRPL testnet first. Simulation is only the fallback if the WebSocket fails. `MPTokenIssuanceCreate`, `LoanBrokerSet`, and `LoanSet` are simulated because XLS-33 and XLS-66 amendments are not yet live on testnet — the transaction logic is fully written.

---

## Interest Rate Formula

```
rate = BASE(5%) + RISK[assetType] + DURATION(days) − COLLATERAL_BONUS + XRP_ADJ
```

| Component | Value |
|---|---|
| Base rate | 5% always |
| Real estate / invoice | +2% |
| Vehicle / business | +4% |
| Art / unknown | +7% |
| < 30 days | +1% |
| 30–90 days | +2% |
| > 90 days | +3% |
| Per 10% collateral locked | −1% (capped −5%) |
| XRP volatility high | +1% |
| XRP volatility low | −0.5% |
| Risk rating | < 8% Low · 8–12% Medium · > 12% High |

---

## Identity & Privacy Model

LiquidX uses **XRP DID (W3C standard)** to verify every participant off-chain through a licensed KYC provider. Only a cryptographic proof is anchored on-chain.

**On-chain (public):** DID identifier · escrow hashes · MPT issuance ID · loan payment records · verification status

**Off-chain (confidential):** Legal name · ID document · date of birth · KYC result · asset ownership proofs

```
KYC off-chain → DID anchored on XRPL → Platform gate opens → On-chain actions (no identity leak)
```

A DID proves you are a real, verified person — without revealing your nationality or any factor a traditional institution might use to reject you.

---

## User Flows

### Lender
1. Browse `/lend` — filter pools by yield, category, utilization
2. Fund pool → `depositToVault()` → `EscrowCreate` — capital locked on-chain
3. Validator approves → `EscrowFinish` — holding minted, fee deducted
4. Borrower repays → each `LoanPay` updates dashboard P&L

### Borrower
1. Verify identity on `/account` — XRP DID anchored, `kycStatus: verified`
2. Lock collateral → `lockCollateral()` → `EscrowCreate` with `LiquidX/CollateralEscrow` memo
3. Tokenize asset → `MPTokenIssuanceCreate` — 48-char `mptIssuanceId` returned
4. Request loan → `LoanSet` — rate calculated, `loanId` generated
5. Repay 3 installments → `LoanPay` per row — each has its own on-chain hash

### Validator
1. Open `/validator` — see all funded assets with locked capital and investor count
2. Review 3-point checklist: documentation · collateral escrow · legal declaration hash
3. Approve → `EscrowFinish` — all positions released, holdings minted
4. Reject → `EscrowCancel` — 100% returned, zero counterparty loss

---

## Live Pages

| Route | What it does |
|---|---|
| `/lend` | Browse loan pools, fund with escrow, track positions |
| `/borrow` | Active loans, repayment schedule, pay installments |
| `/tokenize` | KYC gate → collateral escrow → MPT issuance |
| `/validator` | Approve (EscrowFinish) or refund (EscrowCancel) |
| `/dashboard` | Holdings, lending positions, loan history, full audit trail |
| `/trust` | XRP DID explainer, identity model, compliance controls |

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · Framer Motion |
| State | Zustand 5 · localStorage persistence (`liquidx-portfolio-v4`) |
| Blockchain | xrpl.js v4.6 · XRPL testnet · XLS-33 MPT · XLS-66 Lending · XRP DID (W3C) |
| Auth & Identity | Supabase · TON Connect · XRP DID |

---

## Track Alignment

| Track | Fit |
|---|---|
| **Best Use of Lending & Borrowing** | Full lending lifecycle on XRPL — escrow, DID enforcement, loan origination, 3-installment repayment, transparent rate formula |
| **Programmability Track** | Smart escrow with `FinishAfter` condition · collateral escrow with typed memo verified via `account_objects` · multi-party trustless workflow |
| **Best Social Impact Application** | Borrowers frozen out by nationality/bureaucracy · retail lenders accessing institutional yields from $100 · green infrastructure financing open to all |
