# Store — how LiquidX manages state

Source: [src/store/portfolio-store.ts](../src/store/portfolio-store.ts)

---

One Zustand store holds all client state. It's the only place where assets, holdings, positions, loans, and transactions are mutated. Components read from it directly; service functions return results that get passed into it as arguments.

Persisted to `localStorage` under the key `liquidx-portfolio-v4`. Hydrates on first render; survives page refreshes. `resetPortfolio()` wipes back to seed data.

---

## What's in the store

```ts
{
  usdcBalance: number         // starts at 50,000 in demo
  assets: Asset[]             // 8 mock RWAs — the source of truth for funding status
  holdings: Holding[]         // tokens owned after a position is released
  investments: LendingPosition[]   // lender positions (locked/released/refunded)
  loans: BorrowingPosition[]       // active and closed loans
  loanBrokers: Vault[]             // lending vaults (one per asset)
  mptIssuances: MPTIssuance[]      // on-chain token issuances
  transactions: Transaction[]      // full audit trail
}
```

`investments`, `loans`, and `loanBrokers` are the names used in all store code. The type aliases `LendingPosition`, `BorrowingPosition`, and `Vault` are the canonical names in [types.ts](../src/lib/types.ts) — they map to the same data.

---

## Seed data

What loads on a fresh start (or after `resetPortfolio()`):

| Field | What's there |
|---|---|
| `usdcBalance` | 50,000 USDC |
| `holdings` | 21 tokens of Munich Logistics Hub (asset-005), bought at $100/token |
| `investments` | 1 released position — inv-seed-001, $2,100 into asset-005, both escrow and release hashes set |
| `loans` | 1 active loan — 125,000 USDC on Solar Farm Alpha (asset-002), 8% APR, 90-day term, 3 instalments all `"due"` |
| `loanBrokers` | 3 vaults from [src/data/loanBrokers.ts](../src/data/loanBrokers.ts) |
| `mptIssuances` | 1 MPT for asset-005, ledger 92,188,443, flags all true |
| `transactions` | 4 entries: EscrowCreate for inv-seed-001 · EscrowFinish (release) · MPTokenIssuanceCreate for asset-005 · LoanSet for loan-seed-001 |
| `assets` | 8 RWAs from [src/data/assets.ts](../src/data/assets.ts) |

---

## Actions

### invest

Called by [InvestDialog](../src/components/assets/InvestDialog.tsx) after `depositToVault()` resolves.

```ts
invest(assetId, amount, xrpl: XRPLSettlement, tonAddress?)
→ { success, investmentId?, error? }
```

Guards: asset must exist · `fundingStatus === "open"` · deadline not passed · `amount ≤ usdcBalance` · `amount ≥ asset.minInvestment`

What changes:
- `usdcBalance` decremented by `amount`
- New `LendingPosition` created with `status: "locked"`, `xrplEscrowHash: xrpl.hash`
- `asset.amountRaised` incremented; if `≥ fundingTarget`, sets `fundingStatus: "funded"`
- New `Transaction` appended: `type: "invest"`, `xrplTxType: "EscrowCreate"`

---

### approveAndRelease

Called by [ValidatorPanel](../src/components/assets/ValidatorPanel.tsx) after `releaseVaultPosition()` resolves.

```ts
approveAndRelease(assetId, xrpl: XRPLSettlement)
→ { success, error? }
```

Guard: `asset.fundingStatus === "funded"`

What changes for every `"locked"` investment on this asset:
- `status` → `"released"`, `xrplReleaseHash` set
- Validator fee computed: `amount × (validator.feePercentage / 100)` — the validator is looked up from `VALIDATORS` via `asset.validatorId`, defaults to 1% if not found
- A `Holding` is created (or merged into an existing one — weighted average price)
- A `Transaction` is appended: `type: "release"`, `xrplTxType: "EscrowFinish"`, `validatorFee` set

Asset: `fundingStatus → "released"`, `complianceApproved → true`

---

### refundAll

Called by [ValidatorPanel](../src/components/assets/ValidatorPanel.tsx) after `refundVaultPosition()` resolves, or indirectly by `expireDeadlines()`.

```ts
refundAll(assetId, xrpl: XRPLSettlement)
→ { success, error? }
```

What changes for every `"locked"` or `"pending"` investment on this asset:
- `status` → `"refunded"`, `xrplCancelHash` set
- `usdcBalance` increased by that investment's `amount`
- `Transaction` appended: `type: "refund"`, `xrplTxType: "EscrowCancel"`

Asset: `fundingStatus → "refunded"`

---

### mintMPT

Called by [/tokenize](../src/app/tokenize/page.tsx) after `tokenizeAsset()` succeeds.

```ts
mintMPT(assetId, xrpl: XRPLSettlement & { mptIssuanceId: string })
→ { success, error? }
```

Guard: no existing `MPTIssuance` for this `assetId`

What changes:
- New `MPTIssuance` created with `id = xrpl.mptIssuanceId`, all four flags set to `true`
- `asset.mptIssuanceId` set
- `Transaction` appended: `type: "mpt-issuance"`, `xrplTxType: "MPTokenIssuanceCreate"`

---

### originateLoan

Called by [/borrow](../src/app/borrow/page.tsx) after `requestLoan()` resolves.

```ts
originateLoan(assetId, params, xrpl: XRPLSettlement & { loanId: string })
→ { success, loanId?, error? }
```

Guards: asset exists · matching vault exists · `vault.status === "active"`

What changes:
- `originationFee = principal × vault.originationFeePercent / 100`
- Repayment schedule built — always 3 instalments:
  ```ts
  periodRate = (annualRate × termDays / 365) / 3
  instalment = principal × periodRate / (1 - (1 + periodRate)^-3)
  ```
- New `BorrowingPosition` created, `status: "active"`, `xrplLoanHash` and `xrplLoanId` set
- `vault.activeLoansCount` incremented, `vault.totalOriginated` increased
- `Transaction` appended: `type: "loan-originate"`, `xrplTxType: "LoanSet"`

---

### repayLoan

Called by [/borrow](../src/app/borrow/page.tsx) when a borrower pays an installment row.

```ts
repayLoan(loanId, repaymentId, xrpl: XRPLSettlement)
→ { success, error? }
```

Guards: loan exists · `status === "active"` · target repayment not already `"paid"`

What changes:
- The specific `LoanRepayment` row: `status → "paid"`, `paidAt` set, `xrplHash` set
- `loan.totalRepaid` incremented
- If all instalments are now paid: `loan.status → "repaid"`, `vault.activeLoansCount` decremented
- `Transaction` appended: `type: "loan-repay"`, `xrplTxType: "LoanPay"`

---

### expireDeadlines

Called by [DeadlineWatcher](../src/components/providers/DeadlineWatcher.tsx) on mount and every minute.

```ts
expireDeadlines() → { expiredCount, refundedAmount }
```

Finds all assets where `fundingStatus === "open"` and `new Date(fundingDeadline) < now`. For each expired asset:
- `fundingStatus → "expired"`
- All `"locked"` or `"pending"` investments: `status → "refunded"`, USDC returned to `usdcBalance`
- `Transaction` appended per refund: `type: "refund"`, `xrplTxType: "EscrowCancel"`, **`xrplHash` is `undefined`** — no XRPL call is made here

This is the only place refunds happen without a real or simulated XRPL transaction.

---

### Legacy: buyAsset / sellAsset

Used by [TradeDialog](../src/components/assets/TradeDialog.tsx) for secondary-market trades. No escrow involved.

`buyAsset` deducts USDC and creates/merges a Holding. If `xrpl` is passed, records `xrplTxType: "Payment"`. `sellAsset` adds USDC and reduces/removes the Holding. No XRPL call.

---

## Selectors

Defined at the bottom of the file, used by components that only need a subset of state:

```ts
selectPendingAssets(state)         // assets where fundingStatus === "funded" — shown on /validator
selectMyInvestments(state)         // investments with status "locked" or "pending"
selectReleasedHoldings(state)      // all holdings (alias for state.holdings)
selectActiveLoans(state)           // loans with status "active"
selectBrokerForAsset(state, id)    // vault matching a given assetId
```
