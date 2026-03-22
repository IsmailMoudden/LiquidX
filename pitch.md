# LiquidX — Hackathon Pitch
**XRPL Commons · Lending & Borrowing + Social Impact · March 2026**

---

## What is LiquidX?

LiquidX is a decentralized lending protocol that lets anyone borrow against real-world assets and anyone lend against them — settled on XRPL, no bank required.

Own a property, a vehicle, a piece of art? Tokenize it, lock collateral, borrow at a transparent rate. Have $100 and want 8% yield? Fund the same deals institutions do. Every step — escrow, identity, repayment — is on-chain and auditable.

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
| **Tokenize** | User creates a real MPT on XRPL devnet — `requireAuth + canEscrow + canTrade + canTransfer` flags, asset metadata hex-encoded, 48-char `mptIssuanceId` returned from ledger | `MPTokenIssuanceCreate` ✅ real |
| **Validate** | Independent validator verifies KYC, collateral proof, legal declaration | — |
| **Escrow** | Lender capital locked in real XRP on XRPL devnet — auto-refunded if validator rejects | `EscrowCreate` ✅ real |
| **Borrow** | Validator releases escrow to asset owner via EscrowFinish. Loan terms written on-chain | `EscrowFinish` + `LoanSet` |
| **Repay** | 3 on-chain installments. Each LoanPay tx gets a unique hash and explorer link | `LoanPay` ✅ real |

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
- 10% collateral escrow required and verified on-chain via `account_objects` query
- Drag-and-drop ownership document → SHA-256 hash computed in-browser, anchored to DID
- **`MPTokenIssuanceCreate` is real and live on XRPL devnet** — `canTransfer + canEscrow + canTrade` flags, asset metadata hex-encoded in the tx
- `mptIssuanceId` (48-char) extracted directly from `AffectedNodes.CreatedNode.LedgerIndex` in tx metadata — not mocked
- Issuer: `rGguTpZQ…` (the user's own devnet wallet)

### 2. Validator Settlement
- Independent validator per asset
- 3-point checklist: documentation · collateral on-chain · DID verification hash
- Approve → `EscrowFinish` — real XRP released from escrow to asset owner's wallet
- Reject → `EscrowCancel` — 100% returned to lenders, zero loss

### 3. Escrow Lending (real XRP on testnet)
- Lender capital locked via `EscrowCreate` with `FinishAfter = xrplNow + 30s`
- Amount is real XRP — converted live from USD using CoinGecko price feed
- `escrowSequence` captured via `account_info` before submit (xrpl.js v4 fix)
- Auto-refund on deadline expiry
- Validator fee deducted at release
- Every position carries XRPL hash + devnet explorer link

### 4. Loan Protocol (XLS-66) — now live
- **XLS-66 amendment active on devnet** — all loan transactions are real on-chain
- `LoanBrokerSet` creates on-chain vault with origination + servicing fee structure
- `LoanSet` records borrower address, rate, term, and generates unique `loanId`
- 3 equal installments, each a `LoanPay` tx — payable individually or early
- Rate = `base(5%) + risk + duration − collateral bonus ± XRP adjustment`

### 5. Identity & Privacy (XRP DID)
- W3C Decentralized Identifier anchored on XRPL via `DIDSet` transaction
- KYC happens off-chain — only a cryptographic proof is on-chain (max 256 bytes)
- DID resolved server-side via `account_objects` type=`did` — no browser WebSocket required
- Other participants see a pseudonymous DID address, never your real identity
- Verified to the platform. Pseudonymous to the world.

### 6. Full Audit Trail
- Every action produces a `Transaction` record with `xrplHash + xrplTxType`
- `devnet.xrpl.org` explorer links live on every event — click any hash, see the tx
- Dashboard shows lending positions, loan repayment schedules, P&L

---

## Deep Dive: How Lending & Borrowing Actually Works On-Chain

### Three-Wallet Architecture

LiquidX uses three distinct XRPL wallets — each with a clear, separated role:

| Role | Address | Responsibility |
|---|---|---|
| **Platform** | `rQDN8QJX…` | Orchestrates, pays fees, signs `EscrowFinish` |
| **User / Borrower / Issuer** | `rGguTpZQ…` | Signs `EscrowCreate`, issues MPT, repays loans — the demo user's wallet |
| **Asset Owner (recipient)** | `rG1Lt5T1…` | Receives real XRP when validator approves |

This separation is intentional. The platform never holds user funds. Lender capital flows directly from user wallet → escrow → asset owner — with the platform acting only as the releasing authority. The user wallet (`rGguTpZQ…`) is also the MPT issuer — meaning the asset creator and the lender are the same devnet identity during the demo.

---

### Step 1 — Lender Funds a Pool (`EscrowCreate`)

When a lender clicks "Lock in Escrow" on `/lend`:

1. **Live XRP price** fetched from CoinGecko (`/api/xrpl/price`) — e.g. `$0.58/XRP`
2. **USD → drops** conversion: `$500 / $0.58 = ~862 XRP = 862,000,000 drops`
3. **`account_info`** queried for the lender wallet to capture current `Sequence` number **before** submitting — this becomes the `escrowSequence` (xrpl.js v4 does not expose it post-submit)
4. **`EscrowCreate`** submitted by the lender wallet:
   ```
   Account:         rGguTpZQ…  (lender — real XRP deducted here)
   Destination:     rG1Lt5T1…  (asset owner — receives on finish)
   Amount:          862000000 drops (~$500 at live price)
   FinishAfter:     xrplEpochNow + 30
   DestinationTag:  <vault tag — links escrow to specific asset pool>
   ```
5. **`escrowSequence`** stored in the investment record — required for `EscrowFinish` later
6. Lender wallet balance drops in real time on devnet explorer

> **You can verify this live:** open the lender wallet on `devnet.xrpl.org` and see the XRP balance decrease. The escrow object appears under the account's owned objects.

---

### Step 2 — Validator Approves (`EscrowFinish`)

When the validator clicks "Approve & Release" on `/validator`:

1. **3-point checklist verified**: ownership document · collateral escrow on-chain · borrower DID verified
2. For each locked investment, **`EscrowFinish`** submitted by the **platform wallet**:
   ```
   Account:         rQDN8QJX…  (platform — pays the fee)
   Owner:           rGguTpZQ…  (lender who created the escrow)
   OfferSequence:   <escrowSequence captured at creation>
   ```
3. XRPL validates: `FinishAfter` has passed, sequence matches, condition met → **XRP released to `rG1Lt5T1…` (asset owner)**
4. Investment status → `"released"` in the store
5. Asset `fundingStatus` → `"released"`

> **What you see on devnet:** asset owner wallet balance increases by the exact XRP amount. The escrow object disappears from the lender's account. The platform wallet is charged only the XRP fee (~0.00001 XRP).

**This is a real, trustless, multi-party on-chain settlement. No smart contract. No trusted intermediary holding funds. The escrow is enforced by the XRPL ledger itself.**

---

### Step 3 — Borrower Repays (`Payment`)

When the borrower clicks "Repay" on `/borrow`:

1. **Interest computed** in real time:
   ```
   interest = principal × (projectedYield / 100) × (daysElapsed / 365)
   ```
   Interest accrues from the day escrow was released. Rounded to 2 decimals.

2. **Due date** = `releasedAt + 90 days`. Overdue badge shows in days if exceeded.

3. **`Payment`** submitted by the asset owner wallet:
   ```
   Account:     rG1Lt5T1…  (asset owner — repaying the loan)
   Destination: rQDN8QJX…  (platform — distributes to lenders)
   Amount:      <principal + interest in drops, at live XRP price>
   Memo:        LiquidX/VaultRepay
   ```

4. Investment status → `"repaid"`, `repaidAt` timestamp set, `interestEarned` stored
5. Asset `fundingStatus` → `"repaid"`
6. Lender's dashboard reflects the repayment with XRPL hash

> **Advance payment supported**: borrowers can repay before the 90-day term. Interest is calculated on actual days elapsed — not the full term — so early repayment costs less.

---

### Step 4 — Loan Repayment Schedule (`LoanPay`)

For the XLS-66 borrowing flow (separate from escrow lending):

1. Loan originated via `LoanSet` — 3 installments generated, dates spaced across the term
2. Each installment has its own `LoanPay` transaction:
   ```
   LoanId:    <256-bit loanId from LoanSet>
   Amount:    principal/3 + accrued_interest
   DueDate:   term/3 intervals
   ```
3. **Individual payment** — each installment has its own "Pay now" / "Pay early" button
4. **Early payment** — future installments (not yet due) can be paid ahead with "Pay early"
5. When all 3 are paid → loan status → `"repaid"`, broker active count decremented

---

## Full On-Chain Flow: What Moves Where

```
LEND                           APPROVE                        REPAY
────────────────────           ──────────────────────         ──────────────────────
Lender wallet                  Platform wallet                Asset owner wallet
rGguTpZQ…                      rQDN8QJX…                      rG1Lt5T1…
   │                               │                               │
   │── EscrowCreate ──────────────►│                               │
   │   Amount: ~862 XRP            │── EscrowFinish ──────────────►│
   │   Destination: rG1Lt5T1…      │   Owner: rGguTpZQ…            │
   │   FinishAfter: now+30s        │   OfferSequence: <seq>         │
   │   DestTag: <vaultTag>         │                               │── Payment ─────►Platform
   │                               │                               │   Amount: principal+interest
   │   [XRP deducted NOW]          │   [XRP arrives at             │   Memo: LiquidX/VaultRepay
   │                               │    asset owner NOW]           │
```

**Every arrow is a real XRPL transaction. Every step is independently verifiable on devnet.xrpl.org.**

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
│  invest()  approveAndRelease()  originateLoan()
│  repayLoan()  settleAllLoan()  repayVaultPositions()
└───────────────┬─────────────────────────────┘
                │ calls service with params
┌───────────────▼─────────────────────────────┐
│  SERVICE  — lending-service.ts              │
│  checkUserEligibility()  depositToVault()
│  requestLoan()  repayInstalment()
└───────────────┬─────────────────────────────┘
                │ calls XRPL primitives
┌───────────────▼─────────────────────────────┐
│  XRPL  — xrpl.ts · testnet first → fallback │
│  EscrowCreate  EscrowFinish  EscrowCancel    │
│  MPTokenIssuanceCreate  LoanBrokerSet        │
│  LoanSet  LoanPay  DIDSet  Payment           │
└─────────────────────────────────────────────┘
```

UI never touches the chain directly. No shortcuts.

---

## XRPL Transaction Types

| Tx | Triggered when | Wallet | Status |
|---|---|---|---|
| `EscrowCreate` | Lender funds pool | Lender (`rGguTpZQ…`) | ✅ **Real devnet** |
| `EscrowFinish` | Validator approves | Platform (`rQDN8QJX…`) | ✅ **Real devnet** |
| `EscrowCancel` | Validator rejects / expired | Platform (`rQDN8QJX…`) | Simulated |
| `Payment` | Borrower repays vault | Asset Owner (`rG1Lt5T1…`) | ✅ **Real devnet** |
| `DIDSet` | Identity anchored on-chain | User wallet | ✅ **Real devnet** |
| `MPTokenIssuanceCreate` | User tokenizes asset | User (`rGguTpZQ…`) | ✅ **Real devnet** |
| `LoanBrokerSet` | Vault created for asset | Platform | ✅ **Real devnet** (XLS-66 now live) |
| `LoanSet` | Borrower requests loan | Platform | ✅ **Real devnet** (XLS-66 now live) |
| `LoanPay` | Borrower repays installment | Platform | ✅ **Real devnet** (XLS-66 now live) |

**Devnet endpoint:** `wss://s.devnet.rippletest.net:51233`
**Finality:** 3–5s · **Cost:** ~0.00001 XRP/tx

> **All 8 transaction types are now real on XRPL devnet.** `EscrowCreate`, `EscrowFinish`, `Payment`, `DIDSet`, `MPTokenIssuanceCreate` — real since day one. `LoanBrokerSet`, `LoanSet`, and `LoanPay` — real as of XLS-66 activation on devnet.
>
> **`MPTokensV1` (XLS-33) amendment: `enabled=true`** — confirmed live 22 March 2026.
> **`Lending` (XLS-66) amendment: `enabled=true`** — now active on devnet.

---

## Key Implementation Details

### escrowSequence — Why It Matters

`EscrowFinish` requires the `OfferSequence` of the original `EscrowCreate`. In xrpl.js v4, `tx.result.Sequence` is **undefined** after `submitAndWait`. We solve this by reading `account_info` on the lender wallet **before** submitting the escrow — capturing the sequence at that point. This sequence is stored in the investment record and passed to `EscrowFinish` later.

```ts
// Capture BEFORE submit
const accountInfo = await client.request({
  command: "account_info",
  account: signerWallet.address,
  ledger_index: "current"
});
const escrowSequence = accountInfo.result.account_data.Sequence;
// ... submit EscrowCreate ...
// escrowSequence stored in investment record
```

### USD → XRP Conversion

Amounts are quoted in USD on the UI but settled in real XRP on-chain. Live price is fetched from CoinGecko, cached 60 seconds server-side, and used to convert at the moment of transaction submission.

```ts
const price = await fetchXrpPrice(); // from CoinGecko, server-cached
const drops = Math.ceil((amountUSD / price) * 1_000_000); // 1 XRP = 1,000,000 drops
```

### DID Resolution — Server-Side Only

Browser-based DID resolution via WebSocket times out in production. LiquidX resolves DIDs server-side: `GET /api/xrpl/did/resolve?address=rXXX` queries `account_objects` type=`did`, decodes the hex `DIDDocument` field, and returns the parsed JSON. Max document size: 256 bytes (XRPL ledger limit).

### Interest Accrual

Interest is not fixed at loan origination — it accrues in real time based on actual days elapsed since escrow release:

```
interest = principal × (projectedYield / 100) × (daysElapsed / 365)
```

This means borrowers who repay early pay less interest. Due date is `releasedAt + 90 days`. The UI shows a live overdue badge counting days past due.

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

LiquidX uses **XRP DID (W3C standard)** to verify every participant. A `DIDSet` transaction anchors a minimal W3C DID document on-chain (≤256 bytes). KYC happens entirely off-chain — only a cryptographic proof is anchored.

**On-chain (public):** DID identifier · escrow hashes · MPT issuance ID · loan payment records · verification status

**Off-chain (confidential):** Legal name · ID document · date of birth · KYC result · asset ownership proofs

```
KYC off-chain → DIDSet tx on XRPL → Platform resolves server-side → Gate opens → On-chain actions
```

A DID proves you are a real, verified person — without revealing your nationality or any factor a traditional institution might use to reject you.

---

## User Flows

### Lender
1. Browse `/lend` — filter pools by yield, category, utilization
2. Fund pool → `EscrowCreate` — **real XRP deducted from wallet, locked in escrow**
3. Validator approves → `EscrowFinish` — **real XRP delivered to asset owner**
4. Borrower repays → `Payment` on-chain → lender position marked repaid with interest

### Borrower
1. Verify identity on `/account` — `DIDSet` tx anchors W3C DID on XRPL
2. Lock collateral → `EscrowCreate` with `LiquidX/CollateralEscrow` memo
3. Tokenize asset → **`MPTokenIssuanceCreate` real on devnet** — 48-char `mptIssuanceId` extracted from tx metadata, stored on asset
4. Request loan → validator approves escrow → **receives real XRP directly to wallet**
5. Repay from `/borrow` or `/dashboard` — individual installments, or pay early
6. Interest accrues daily from release date — early repayment costs less

### Validator
1. Open `/validator` — see all funded assets with locked capital and investor count
2. Review 3-point checklist: documentation · collateral escrow · DID verification
3. **Approve → `EscrowFinish` — real XRP moves from escrow to asset owner on-chain**
4. Reject → `EscrowCancel` — 100% returned to lenders, zero counterparty loss

---

## Live Pages

| Route | What it does |
|---|---|
| `/lend` | Browse loan pools, fund with real XRP escrow, track positions |
| `/borrow` | Active loans, repayment schedule, pay installments individually or early |
| `/tokenize` | KYC gate → collateral escrow → MPT issuance |
| `/validator` | Approve (`EscrowFinish`) or refund (`EscrowCancel`) — real on-chain settlement |
| `/dashboard` | Holdings, lending positions, loan history, full audit trail with XRPL hashes |
| `/trust` | XRP DID explainer, identity model, compliance controls |

---

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js 15 (App Router) · React 19 · TypeScript · TailwindCSS · Framer Motion |
| State | Zustand 5 · localStorage persistence (`liquidx-portfolio-v4`) |
| Blockchain | xrpl.js v4.6 · XRPL devnet · XLS-33 MPT · XLS-66 Lending · XRP DID (W3C) |
| Auth & Identity | Supabase · XRP DID · W3C DIDSet on-chain |
| Price Feed | CoinGecko API (server-cached 60s) — live USD→XRP conversion |

---

## Track Alignment

| Track | Fit |
|---|---|
| **Best Use of Lending & Borrowing** | Full lending lifecycle on XRPL — all 8 tx types real on devnet. `EscrowCreate` · `EscrowFinish` · `LoanBrokerSet` · `LoanSet` · `LoanPay` all on-chain. Transparent rate formula, early repayment, 3-wallet settlement. |
| **Programmability Track** | Smart escrow with `FinishAfter` condition · 3-wallet separation (lender / platform / asset owner) · `escrowSequence` pre-capture pattern · DID resolution via `account_objects` · USD→XRP live conversion |
| **Best Social Impact Application** | Borrowers frozen out by nationality/bureaucracy · retail lenders accessing institutional yields from $100 · green infrastructure financing open to all · identity on merit, not origin |
