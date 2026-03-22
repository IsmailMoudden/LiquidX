# Lending — service layer and loan pricing

Sources: [src/lib/lending-service.ts](../src/lib/lending-service.ts) · [src/lib/loan-pricing.ts](../src/lib/loan-pricing.ts)

---

## Vault architecture — one vault per asset

Every tokenized asset has exactly one vault. The vault is the on-chain unit of account for that asset's lending pool. It is created by `LoanBrokerSet` (XLS-66) and seeded in [loanBrokers.ts](../src/data/loanBrokers.ts).

### Vault fields that matter

| Field | Type | Purpose |
|---|---|---|
| `assetId` | string | 1-to-1 link to the Asset — enforced by `originateLoan()` |
| `destinationTag` | number (uint32) | XRPL routing tag — separates deposits by vault within the platform wallet |
| `firstLossCoverPercent` | number | % of pool reserved to absorb defaults before lenders lose capital |
| `originationFeePercent` | number | Charged to the borrower at `LoanSet` (currently hardcoded to 1% in `requestLoan`) |
| `servicingFeePercent` | number | Annual fee accrued to the platform on outstanding principal |
| `xrplBrokerAddress` | string | Platform wallet that receives all EscrowCreate deposits |
| `status` | `active\|paused\|closed` | Only `active` vaults accept new deposits |

### DestinationTag — on-chain capital separation

All lender deposits across all vaults go to the same platform wallet (`rQDN8QJXcJUVkk3wtRtLwaiqiwxrLPnWik`). What separates them on-chain is the `DestinationTag` field on each `EscrowCreate` transaction.

Each vault has a unique deterministic tag:

| Asset | DestinationTag |
|---|---|
| Dubai Marina Tower | 1001 |
| Geneva Flat B | 1002 |
| Porsche 911 GT3 | 1003 |
| Hornsea Wind Farm | 1005 |

The `EscrowCreate` tx also carries a `LiquidX/VaultDeposit` memo with `{ assetId, vaultTag }` in hex. This memo is what `verifyCollateralEscrow()` filters on when reading `account_objects`.

```
EscrowCreate
├── Destination: rQDN8QJXcJUVkk3wtRtLwaiqiwxrLPnWik
├── DestinationTag: 1001
├── Amount: <drops>
├── FinishAfter: now + 30s
└── Memo: LiquidX/VaultDeposit { assetId, vaultTag }
```

### Full lifecycle — lender to repayment

```
Lender deposits
  → createXRPLEscrow(amount, destinationTag)         EscrowCreate  (real devnet)
  → store.invest(assetId, amount, xrpl)
    - LendingPosition: status = "locked"
    - stores xrplEscrowHash + xrplEscrowSequence

Validator approves
  → finishXRPLEscrow(xrplEscrowSequence)             EscrowFinish  (real if sequence present)
  → store.approveAndRelease(assetId, xrpl)
    - LendingPosition: status → "released"
    - LendingPosition converted to Holding (tokens in portfolio)
    - validator fee deducted from each position
    - asset.fundingStatus → "released"

Borrower requests loan
  → DID gate: attachDIDToUser() + requireVerifiedDID()
  → calculateLoanPricing(category, termDays, collateralPercent, xrpVolatility)
  → xrplOriginateLoan(params)                        LoanSet       (real devnet — XLS-66 now active)
  → store.originateLoan(assetId, params, xrpl)
    - BorrowingPosition: status = "active"
    - 3 LoanRepayment entries generated (equal instalments)
    - vault.activeLoansCount++, vault.totalOriginated += principal

Borrower repays each instalment
  → submitLoanPay(loanId, amount, principal, interest) LoanPay (real devnet — XLS-66 now active)
  → store.repayLoan(loanId, repaymentId, xrpl)
    - LoanRepayment: status → "paid", xrplHash stored
    - loan.totalRepaid += amount
    - all paid → BorrowingPosition.status = "repaid", vault.activeLoansCount--
```

### Repayment schedule generation

`originateLoan()` generates 3 equal instalments using compound interest:

```ts
periodRate = annualRate * (termDays / 365) / instalments
instalment = principal * (periodRate / (1 - (1 + periodRate)^-n))
```

Each instalment's principal + interest share is calculated so the total equals `principal + total_interest`. Due dates are spaced evenly across `termDays`.

---

## Why this layer exists

The UI pages and components never call `xrpl.ts` directly. Everything goes through `lending-service.ts`. This gives one place to enforce business rules (eligibility gates, fee calculations) before anything touches the chain, and keeps XRPL mechanics out of React components.

The service functions are thin: validate inputs, call an `xrpl.ts` function, wrap the result.

---

## The result shape every function returns

```ts
interface ServiceResult<T = void> {
  ok: boolean
  data?: T
  error?: string                  // shown directly in the UI on failure
  xrpl?: XRPLPaymentResult        // the on-chain receipt, passed to the store
}
```

On success, `data` has the specific fields the caller needs. `xrpl` is passed into the matching store action so it can record the hash on the right entity.

---

## Vault functions

### createVault

```ts
createVault({
  assetName, originationFeePercent, servicingFeePercent, firstLossCoverPercent
}) → ServiceResult<{ xrplHash }>
```

Calls `xrpl.createLoanBroker()` (→ LoanBrokerSet). Called during asset onboarding. Not currently wired to a user-facing button — it would be called by an admin flow when a new asset is approved for lending. The returned hash is stored as `vault.xrplHash` in [loanBrokers.ts](../src/data/loanBrokers.ts).

---

### depositToVault

```ts
depositToVault({ amountUsdc, vaultDestinationAddress? })
→ ServiceResult<{ xrplHash, ledger?, status }>
```

Calls `xrpl.createXRPLEscrow(amount, destination, destinationTag, assetId)` (→ EscrowCreate). The `destinationTag` from the vault is embedded in the transaction to route the deposit on-chain. The returned `xrplHash` goes into `store.invest()` as `xrpl.hash`, which stores it as `investment.xrplEscrowHash`. The tx also returns `escrowSequence`, stored as `investment.xrplEscrowSequence` — used later by `finishXRPLEscrow()` to identify which escrow to finish.

---

### releaseVaultPosition / refundVaultPosition

```ts
releaseVaultPosition(escrowSequence?) → ServiceResult<{ xrplHash }>  // → EscrowFinish
refundVaultPosition()                 → ServiceResult<{ xrplHash }>  // → EscrowCancel
```

Both called from [ValidatorPanel](../src/components/assets/ValidatorPanel.tsx) on the `/validator` page. The `xrpl` result is passed to `store.approveAndRelease()` or `store.refundAll()`, which apply it to every locked position for that asset.

`releaseVaultPosition` now accepts an optional `escrowSequence` — the sequence number stored on the first locked investment (`lockedInvestments[0].xrplEscrowSequence`). When provided, it calls `finishXRPLEscrow(sequence)` which attempts a real XRPL `EscrowFinish` with `OfferSequence: sequence`. Without a sequence, it falls back to simulation.

---

## Loan functions

### requestLoan

```ts
requestLoan({ borrowerAddress, principalUsdc, interestRatePercent, termDays })
→ ServiceResult<{ loanId, xrplHash }>
```

Calls `xrpl.originateLoan()` (→ LoanSet). Hardcodes `originationFee = principalUsdc * 0.01` before passing to XRPL — this 1% is always deducted, regardless of what the vault's `originationFeePercent` is. The `loanId` returned is a 256-bit hex identifier that is stored as `loan.xrplLoanId` and is referenced in every subsequent repayment transaction.

Called from the loan request form on [/borrow](../src/app/borrow/page.tsx).

---

### repayInstalment

```ts
repayInstalment({ loanId, borrowerAddress, amountUsdc, principal, interest })
→ ServiceResult<{ xrplHash }>
```

Calls `xrpl.submitLoanPay()` (→ LoanPay). Called when a borrower clicks "Pay" on a specific row of their repayment schedule. The `xrplHash` is stored on the individual `LoanRepayment` entry so each installment has its own on-chain receipt.

---

## Tokenization gates

Before `createMPTIssuance` is ever called, two conditions must be true. These are checked both in the UI (to show the right button state) and again inside `tokenizeAsset()` to prevent any bypass.

### checkUserEligibility

```ts
checkUserEligibility({ userAddress, isDidVerified, assetValueUsd })
→ Promise<EligibilityResult>
```

Runs two checks in order:

**1. Identity gate** — `isDidVerified` must be `true`. This comes from the user's KYC status on the Account page. If false, returns `status: "identity-not-verified"` and the message shown in the UI is:

> "Your XRP DID has not been verified. Complete identity verification in Account before registering assets."

**2. Collateral gate** — calls `xrpl.verifyCollateralEscrow(userAddress, assetValueUsd * 0.1)`. If the on-chain escrow is below 10% of the asset value, returns `status: "insufficient-collateral"` with the exact shortfall. The UI uses `collateralRequired` and `collateralLocked` to show a progress indicator.

Both checks passing returns `status: "ready"`.

The `COLLATERAL_RATIO = 0.1` constant is defined at [lending-service.ts:181](../src/lib/lending-service.ts).

---

### lockCollateral

```ts
lockCollateral({ userAddress, amountUsdc })
→ ServiceResult<{ xrplHash, escrowSequence?, collateralAmount }>
```

Calls `xrpl.createCollateralEscrow()` (→ EscrowCreate with `LiquidX/CollateralEscrow` memo, 180-day lock). Triggered by the "Lock Collateral" button on [/tokenize](../src/app/tokenize/page.tsx) when `checkUserEligibility` returns `"insufficient-collateral"`. After it resolves, the page re-runs `checkUserEligibility` to confirm the escrow landed.

---

### tokenizeAsset

```ts
tokenizeAsset({
  assetName, maxAmount, transferFeePercent, requireAuth,
  userAddress, isDidVerified, assetValueUsd
}) → ServiceResult<{ mptIssuanceId, xrplHash, eligibility }>
```

Runs `checkUserEligibility()` one final time even if the UI already passed it. If eligible, calls `xrpl.createMPTIssuance()`. The `mptIssuanceId` is passed back to the `/tokenize` page, which calls `store.mintMPT()` to record it on the asset and in `mptIssuances[]`.

---

## Interest rate formula

Source: [src/lib/loan-pricing.ts](../src/lib/loan-pricing.ts)

The rate is assembled from five components. Every component is visible in the UI breakdown on the loan request form.

```
rate = base + risk + duration + collateralBonus + xrpAdjustment
```

**Base** — always `5%`

**Risk** — depends on `asset.category`:

| Category | Added |
|---|---|
| `real-estate` or `invoice` | +2% |
| `vehicle` or `business` | +4% |
| `art` | +7% |
| anything else | +5% |

**Duration** — depends on `termDays`:

| Term | Added |
|---|---|
| < 30 days | +1% |
| 30–90 days | +2% |
| > 90 days | +3% |

**Collateral bonus** — every full 10% of asset value locked in escrow reduces the rate by 1%, capped at −5%:

```ts
collateralBonus = -Math.min(Math.floor(collateralPercent / 10), 5)
```

A borrower who locks 20% collateral gets −2%. 50%+ gets the full −5% discount.

**XRP volatility adjustment** — optional input, defaults to `"medium"`:

| Volatility | Adjustment |
|---|---|
| `"low"` | −0.5% |
| `"medium"` | 0% |
| `"high"` | +1% |

**Risk label** — derived from the final rate:
- < 8% → `"Low"`
- 8–12% → `"Medium"`
- > 12% → `"High"`

Rate is floored at 0%.

**Example** — the seed loan on Solar Farm Alpha (asset-002):
```
base=5 + infrastructure=2 + 90d=2 + no-collateral-bonus=0 + medium=0 = 9%
```
The seed has `interestRatePercent: 8.0`, which reflects a slight collateral discount applied at the time the seed data was written.
