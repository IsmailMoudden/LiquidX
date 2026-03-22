# Types

Source: [src/lib/types.ts](../src/lib/types.ts)

All platform entities in one file. Types with "legacy" names are just aliases — they're the same type, renamed as the platform shifted from a trading demo toward a lending/escrow model. The old names are kept so existing store and component code compiles without changes.

---

## Asset

```ts
interface Asset {
  id: string           // "asset-001" through "asset-008" in seed data
  name: string
  category: AssetCategory
  description: string
  longDescription: string
  image: string
  location: string

  totalValue: number      // e.g. 12_500_000 — the USD value of the underlying asset
  tokenSupply: number     // total fractional tokens, e.g. 125_000
  tokenPrice: number      // totalValue / tokenSupply — token price in USDC
  projectedYield: number  // % annual yield shown to investors
  liquidityScore: number  // 0–100, shown as a badge on the card
  minInvestment: number   // enforced in store.invest() — rejects if amount < this
  tags: string[]
  highlights: string[]    // bullet points shown on the asset detail page

  // Funding state — mutated by store actions
  fundingTarget: number       // raise goal in USDC
  amountRaised: number        // incremented by store.invest()
  fundingDeadline: string     // ISO datetime — expireDeadlines() watches this
  fundingStatus: FundingStatus
  investorCount: number       // incremented by store.invest()
  validatorId: string         // links to a Validator — used to look up fee % in approveAndRelease()
  complianceApproved: boolean // set true by approveAndRelease()

  // Set after store.mintMPT() succeeds
  mptIssuanceId?: string       // 48-char hex from MPTokenIssuanceCreate
  mptIssuerAddress?: string

  vaultId?: string  // the Vault (LoanBroker) backing this asset's lending pool

  // Issuer identity — filled in on the /tokenize form
  issuerDid?: string              // "did:xrpl:1:{r-address}"
  issuerVerified?: boolean        // true when kycStatus === "verified"
  ownershipProofHash?: string     // SHA-256 of the uploaded ownership doc
  legalDeclarationHash?: string   // hash of the signed legal declaration
  verificationStatus?: "pending" | "verified" | "rejected"
}

type FundingStatus = "open" | "funded" | "released" | "refunded" | "expired"
//  "open"     — accepting investments
//  "funded"   — amountRaised >= fundingTarget, waiting for validator
//  "released" — validator approved, holdings minted
//  "refunded" — validator rejected or deadline expired
//  "expired"  — deadline passed while still "open"

type AssetCategory =
  "real-estate" | "infrastructure" | "art" | "wine" |
  "collectibles" | "private-equity" | "commodities"
```

---

## Vault

The on-chain lending pool for one asset. Maps to an XRPL `LoanBroker` ledger entry (XLS-66). Users see this as a "vault" — never as a "LoanBroker".

`LoanBrokerConfig` is a type alias for `Vault`. All store code uses the `loanBrokers` array.

```ts
interface Vault {
  id: string          // "broker-001", "broker-002", "broker-003"
  assetId: string     // the asset this pool serves — used by store.originateLoan() guard
  status: "active" | "paused" | "closed"  // only "active" accepts new loans

  // Fee structure — used by store.originateLoan() to compute originationFee
  originationFeePercent: number   // e.g. 0.75 — charged to borrower at loan origination
  servicingFeePercent: number     // e.g. 0.25 — ongoing servicing fee
  firstLossCoverPercent: number   // % of pool reserved as first-loss buffer, shown to lenders

  // Pool stats — mutated by originateLoan() and repayLoan()
  activeLoansCount: number        // incremented by originateLoan, decremented when repaid
  totalOriginated: number         // lifetime USDC volume, incremented by originateLoan
  defaultRate: number             // 0–1

  xrplBrokerAddress: string   // the XRPL r-address of the LoanBroker account
  xrplHash?: string           // LoanBrokerSet tx hash from createVault()
  createdAt: string
}
```

---

## LendingPosition

A lender's escrow position. Created by `store.invest()`, updated by `approveAndRelease()` or `refundAll()`.

`Investment` is a type alias for `LendingPosition`. The store uses `investments[]`.

```ts
interface LendingPosition {
  id: string          // "inv-{nanoid}"
  assetId: string
  assetName: string

  // Written by store.invest()
  amount?: number      // USDC deposited
  tokens?: number      // floor(amount / asset.tokenPrice)
  tokenPrice?: number  // asset.tokenPrice at time of investment

  status: LendingPositionStatus
  //  "locked"   — EscrowCreate submitted, waiting for validator action
  //  "released" — EscrowFinish confirmed, Holding created
  //  "refunded" — EscrowCancel confirmed, USDC returned
  //  "pending"  — interim state during processing

  timestamp?: string     // created at
  releasedAt?: string    // set by approveAndRelease()
  refundedAt?: string    // set by refundAll() or expireDeadlines()

  // XRPL hashes — each matches the hash of the corresponding on-chain tx
  xrplEscrowHash?: string    // EscrowCreate — set by store.invest()
  xrplReleaseHash?: string   // EscrowFinish — set by store.approveAndRelease()
  xrplCancelHash?: string    // EscrowCancel — set by store.refundAll()

  validatorFee?: number  // USD deducted on release, shown in the transaction record
}
```

---

## BorrowingPosition

A borrower's active or closed loan. Created by `store.originateLoan()`, updated by `store.repayLoan()`.

`Loan` is a type alias for `BorrowingPosition`. The store uses `loans[]`.

```ts
interface BorrowingPosition {
  id: string           // "loan-{nanoid}"
  brokerId?: string    // vault id — legacy alias (store uses this name)
  assetId: string
  assetName: string

  borrowerAddress: string      // XRPL r-address
  borrowerTonAddress?: string  // TON wallet (optional, for display)

  // Terms — set at origination, never mutated afterward
  principal: number
  interestRatePercent: number  // annual rate from calculateLoanPricing()
  termDays: number
  originationFee: number       // principal * vault.originationFeePercent / 100

  startDate: string
  maturityDate: string         // startDate + termDays

  // Repayment — 3 instalments built by store.originateLoan()
  repaymentSchedule: LoanRepayment[]
  totalRepaid: number   // incremented by store.repayLoan() on each paid instalment

  status: BorrowingStatus
  //  "active"    — loan live, repayments due
  //  "repaid"    — all instalments paid (set automatically when last instalment is paid)
  //  "late"      — overdue (not currently set automatically — future work)
  //  "defaulted" | "cancelled" | "requested"

  underwritingScore: number   // 0–100, visible to validators on /validator, not to borrowers
  underwritingNotes?: string

  xrplLoanHash?: string   // LoanSet tx hash — the origination transaction
  xrplLoanId?: string     // 256-bit hex — the persistent loan identifier, referenced in LoanPay memos

  createdAt: string
  updatedAt: string  // updated by store.repayLoan()
}

interface LoanRepayment {
  id: string           // "rep-{nanoid}"
  amount: number       // total = principal + interest for this instalment
  principal: number
  interest: number
  dueDate: string
  status: "due" | "paid" | "overdue"
  paidAt?: string      // set by store.repayLoan()
  xrplHash?: string    // LoanPay hash — set by store.repayLoan()
}
```

---

## Holding

Tokens owned by a lender after their position is released. Created by `store.approveAndRelease()`.

```ts
interface Holding {
  assetId: string
  tokens: number
  avgBuyPrice: number    // weighted average — recalculated when lots are merged
  purchasedAt: string    // timestamp of the release, not the original investment
  investmentId?: string  // links back to the LendingPosition this came from
}
```

If a lender already has a `Holding` for the same asset (e.g. from a previous round or a secondary buy), `approveAndRelease()` merges the new tokens in with a weighted average price — it doesn't create a second row.

---

## MPTIssuance

The on-chain record of an asset's token type. Created by `store.mintMPT()`.

```ts
interface MPTIssuance {
  id: string              // = mptIssuanceId from xrpl.createMPTIssuance() — 48-char hex
  assetId: string
  issuerAddress: string   // XRPL r-address of the token issuer (demo: DEMO_DESTINATION)
  maxAmount: string       // String(asset.tokenSupply) — XRPL stores amounts as strings
  transferFee: number     // basis points / 100
  flags: {
    canLock: boolean      // true — required for escrow-backed lending
    requireAuth: boolean  // true — each holder must be authorized via MPTokenAuthorize
    canEscrow: boolean    // true
    canTrade: boolean     // true — secondary market enabled
  }
  xrplHash: string        // MPTokenIssuanceCreate tx hash
  xrplLedger: number      // ledger sequence of the issuance
  createdAt: string
}
```

---

## Validator

Independent third party who approves or rejects funded assets. Two are seeded in [src/data/validators.ts](../src/data/validators.ts).

```ts
interface Validator {
  id: string               // "validator-001", "validator-002"
  name: string
  organization: string
  feePercentage: number    // % of the escrow amount taken as a fee on release
                           // used by store.approveAndRelease() to compute validatorFee per position
  xrplAddress: string      // the validator's own XRPL r-address (would submit EscrowFinish in production)
  approvedCount: number
  totalVolumeSettled: number
  status: "active" | "inactive"
}
```

Each `Asset` has a `validatorId`. When `approveAndRelease()` runs, it looks up the matching `Validator` to get `feePercentage`. If no validator is found, it defaults to 1%.

---

## XRPIdentity

The issuer's KYC identity anchored on XRPL via W3C DID. Not persisted in the main store — managed by the Account page.

```ts
interface XRPIdentity {
  did: string              // "did:xrpl:1:rN7n3473SaZBCG4dFL75SJQnvoFMoFGC9"
  walletAddress: string    // the r-address this DID is bound to
  kycStatus: "unverified" | "pending" | "verified" | "rejected"
  kycProvider?: string     // e.g. "Sumsub", "Jumio"
  kycVerifiedAt?: string
  legalName?: string       // only revealed to validators, not public
  jurisdiction?: string
}
```

`lending-service.checkUserEligibility()` receives `isDidVerified: boolean` — this maps to `kycStatus === "verified"`. It's the first gate before tokenization. If not verified, the tokenize form's submit path is blocked entirely.

---

## Transaction

Every store action that moves money or touches a position appends a Transaction. This is the platform's audit trail.

```ts
interface Transaction {
  id: string
  type: TransactionType
  assetId: string
  assetName: string
  tokens: number   // 0 for loan transactions
  price: number    // 0 for loan transactions
  total: number    // the USDC amount

  timestamp: string

  // XRPL receipt — present on every action except expireDeadlines() auto-refunds
  xrplHash?: string
  xrplStatus?: "confirmed" | "simulated"
  xrplExplorerUrl?: string
  xrplLedger?: number
  xrplTxType?: "EscrowCreate" | "EscrowFinish" | "EscrowCancel" | "Payment"
              | "MPTokenIssuanceCreate" | "MPTokenAuthorize"
              | "LoanBrokerSet" | "LoanSet" | "LoanPay"

  // Linkage — at least one is set, depending on type
  validatorId?: string
  validatorFee?: number  // USD, only on "release" type
  brokerId?: string      // vault id (legacy name for vaultId)
  loanId?: string        // links to BorrowingPosition
  investmentId?: string  // links to LendingPosition
  tonAddress?: string
}
```

Which `type` maps to which store action and XRPL tx:

| type | Created by | xrplTxType |
|---|---|---|
| `"invest"` | `store.invest()` | `EscrowCreate` |
| `"release"` | `store.approveAndRelease()` | `EscrowFinish` |
| `"refund"` | `store.refundAll()` | `EscrowCancel` |
| `"refund"` | `store.expireDeadlines()` | `EscrowCancel` (xrplHash is undefined) |
| `"mpt-issuance"` | `store.mintMPT()` | `MPTokenIssuanceCreate` |
| `"loan-originate"` | `store.originateLoan()` | `LoanSet` |
| `"loan-repay"` | `store.repayLoan()` | `LoanPay` |
| `"buy"` | `store.buyAsset()` | `Payment` (optional) |
| `"sell"` | `store.sellAsset()` | — |

The new canonical type names (`"lend"`, `"lending-release"`, `"loan-request"`) are defined in the type but not yet used by any store action — the store still writes the legacy names.
