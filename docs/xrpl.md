# XRPL — how LiquidX uses it

Source: [src/lib/xrpl.ts](../src/lib/xrpl.ts)

---

LiquidX uses XRPL testnet as its settlement layer. Every action that moves money or creates an on-chain record goes through `xrpl.ts`. The file never calls the store or the UI — it only knows about transactions.

---

## Real vs. Simulated — explicit breakdown

Not all tx types have the same execution status. This is the authoritative table:

| Transaction type | Execution | Reason |
|---|---|---|
| `EscrowCreate` (lender fund) | **Real testnet first** | `realEscrowCreate()` — `Client.submitAndWait` |
| `EscrowCreate` (collateral) | **Real testnet first** | `realCollateralEscrowCreate()` — with memo |
| `verifyCollateralEscrow` | **Real testnet first** | `account_objects` query on-chain |
| `LoanPay` repayment | **Real testnet first** | `realLoanPay()` — Payment tx with LoanPay memo |
| `EscrowFinish` | **Always simulated** | No real submission path in current code |
| `EscrowCancel` | **Always simulated** | No real submission path in current code |
| `MPTokenIssuanceCreate` | **Always simulated** | XLS-33 (MPTokensV1) amendment not yet live on testnet |
| `MPTokenAuthorize` | **Always simulated** | Same reason |
| `LoanBrokerSet` | **Always simulated** | XLS-66 (LendingProtocol) amendment not yet live on testnet |
| `LoanSet` | **Always simulated** | Same reason |

"Real testnet first" means the function attempts a live `Client.connect()` + `submitAndWait`. If the WebSocket fails or the transaction is rejected, it falls back to a realistic simulation (same result shape, `status: "simulated"`). Simulated hashes are cryptographically random but won't resolve on the XRPL explorer.

---

The rule for functions with a real path: **try the real testnet first, simulate if anything fails**. The UI always gets back the same shape regardless of which path ran.

---

## Connection

```ts
wss://s.altnet.rippletest.net:51233   // XRPL testnet WebSocket
https://testnet.xrpl.org/transactions  // explorer base URL
```

The demo uses a single shared testnet wallet (`sEdTM1uX8pu2do5XvTnutH6HsouMaM2` → `rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh`). Every real transaction in the demo goes out from that address. In production, each user connects their own wallet.

A new `Client` is created per call, connected, used, then disconnected in a `finally` block. There is no persistent connection.

---

## The result every function returns

```ts
interface XRPLPaymentResult {
  hash: string                        // 64-char uppercase hex
  ledger?: number                     // ledger sequence — real from testnet, or mockLedger() (92M–94M range)
  status: "confirmed" | "simulated"   // the UI shows this next to the hash
  explorerUrl: string                 // always set — testnet.xrpl.org/transactions/{hash}
  network: "testnet"
  txType: XRPLTxType
  mptIssuanceId?: string              // only from createMPTIssuance()
  loanId?: string                     // only from originateLoan()
}
```

`explorerUrl` is always constructed, even for simulated hashes. Simulated hashes won't resolve on the real explorer — that's intentional. The link still appears in the UI as proof-of-concept of what the audit trail would look like.

---

## USD → drops conversion

XRPL amounts are in drops (1 XRP = 1,000,000 drops). All LiquidX amounts are in USD. The conversion happens just before submitting any real transaction.

```ts
getXrpPriceUsd()   // CoinGecko public API, cached 60s, falls back to $0.50
usdToDrops(usd)    // → String(ceil(usd / price) * 1_000_000)
dropsToUsd(drops)  // → (drops / 1_000_000) * price
```

Used in three places: `realEscrowCreate`, `realLoanPay`, `realCollateralEscrowCreate`.

---

## Lender flow — EscrowCreate / EscrowFinish / EscrowCancel

These three transactions handle the complete lifecycle of a lender's capital.

### EscrowCreate

Triggered when a lender confirms their investment in [InvestDialog](../src/components/assets/InvestDialog.tsx).

Path: `InvestDialog` → `lending-service.depositToVault()` → `xrpl.createXRPLEscrow()`

```ts
export async function createXRPLEscrow(
  amountUSD: number,
  destination: string = DEMO_DESTINATION
): Promise<XRPLPaymentResult>
```

The real transaction uses `FinishAfter = now + 30 seconds`. This is a demo shortcut — on testnet, 30 seconds lets escrows become finishable quickly. In production this would be set to the asset's `fundingDeadline`.

The returned hash is stored as `xrplEscrowHash` on the `LendingPosition` and as `xrplHash` on the `Transaction`. It's shown in the UI in the position's detail row and in the transaction history.

Real path delay: varies with testnet. Simulated fallback: 900–1500ms.

---

### EscrowFinish

Triggered when a validator clicks "Approve & Release" in [ValidatorPanel](../src/components/assets/ValidatorPanel.tsx).

Path: `ValidatorPanel` → `lending-service.releaseVaultPosition()` → `xrpl.finishXRPLEscrow()`

```ts
export async function finishXRPLEscrow(): Promise<XRPLPaymentResult>
```

Always simulated (1000–1800ms). In production this would be submitted by the validator's own wallet, not the demo wallet. The hash is stored as `xrplReleaseHash` on each released `LendingPosition`.

After this resolves, `store.approveAndRelease()` converts every locked position into a `Holding`.

---

### EscrowCancel

Triggered two ways: a validator clicking "Refund" in `ValidatorPanel`, or `store.expireDeadlines()` running when a `fundingDeadline` passes.

Path: `ValidatorPanel` → `lending-service.refundVaultPosition()` → `xrpl.cancelXRPLEscrow()`

```ts
export async function cancelXRPLEscrow(): Promise<XRPLPaymentResult>
```

Always simulated (600–1000ms). The hash is stored as `xrplCancelHash` on each refunded `LendingPosition`. USDC is returned to lenders' balances in the store.

Note: when `expireDeadlines()` triggers the refund automatically, it skips the XRPL call entirely and leaves `xrplHash` undefined on the resulting transactions. This is a current limitation.

---

## Tokenization flow — MPTokenIssuanceCreate / MPTokenAuthorize

### MPTokenIssuanceCreate

Triggered at the end of the tokenize form on [/tokenize](../src/app/tokenize/page.tsx), after both gates pass.

Path: `/tokenize` → `lending-service.tokenizeAsset()` → `xrpl.createMPTIssuance()`

```ts
export interface MPTIssuanceParams {
  assetName: string
  maxAmount: number           // = asset.tokenSupply from the form
  transferFeePercent: number  // stored as basis points / 100 on-chain
  requireAuth: boolean        // always true — KYC gate on token holders
}

export async function createMPTIssuance(
  params: MPTIssuanceParams
): Promise<XRPLPaymentResult & { mptIssuanceId: string }>
```

**Always simulated.** XLS-33 (MPTokensV1) is not yet enabled on XRPL testnet as of March 2026. The simulated `mptIssuanceId` is a 48-char hex (192-bit), which matches the real XRPL spec. Delay: 1200–2000ms.

Flags the real transaction would set: `tfMPTCanLock | tfMPTRequireAuth | tfMPTCanEscrow | tfMPTCanTrade`

The `mptIssuanceId` is written to `asset.mptIssuanceId` and stored in `store.mptIssuances[]`.

---

### MPTokenAuthorize

```ts
export async function authorizeMPTHolder(
  mptIssuanceId: string,
  holderAddress: string
): Promise<XRPLPaymentResult>
```

Because MPTs are issued with `tfMPTRequireAuth`, each investor wallet must be explicitly authorized before they can receive tokens. This would be called after a KYC approval. Always simulated (600–1000ms). Not yet wired into a UI flow — it's called in the service layer but there's no dedicated page for it yet.

---

## Lending protocol — LoanBrokerSet / LoanSet / LoanPay

These correspond to the proposed XLS-66 LendingProtocol amendment. All are always simulated — the amendment is not live.

### LoanBrokerSet

Creates the on-chain `LoanBroker` ledger entry that governs a vault's fee structure and loan origination rules.

Path: asset onboarding → `lending-service.createVault()` → `xrpl.createLoanBroker()`

```ts
export interface LoanBrokerParams {
  originationFeePercent: number
  servicingFeePercent: number
  firstLossCoverPercent: number
  assetLabel: string
}
```

Simulated (800–1400ms). The hash is stored as `vault.xrplHash`.

---

### LoanSet

Records the loan terms between the vault and borrower on-chain. Generates the `loanId` that tracks this loan through all future repayments.

Path: `/borrow` request form → `lending-service.requestLoan()` → `xrpl.originateLoan()`

```ts
export interface LoanSetParams {
  borrowerAddress: string
  principalUsdc: number
  interestRatePercent: number  // annual, e.g. 8.0
  termDays: number
  originationFee: number       // principal × 0.01 (1%, hardcoded in lending-service)
}
```

Returns `XRPLPaymentResult & { loanId: string }`. The `loanId` is a 256-bit hex and is stored as `loan.xrplLoanId`. Every `LoanPay` transaction for this loan references this ID. Simulated (1000–1700ms).

---

### LoanPay

Records one installment repayment. The borrower sees this as "Pay" on a row of their repayment schedule.

Path: `/borrow` repayment row → `lending-service.repayInstalment()` → `xrpl.submitLoanPay()`

```ts
export interface LoanPayParams {
  loanId: string
  borrowerAddress: string
  amountUsdc: number    // total = principal + interest for this instalment
  principal: number
  interest: number
}
```

**Real path** (attempted): submits a `Payment` tx with `MemoData: hex("LoanPay")`. The current implementation doesn't embed `loanId` or the principal/interest split in the memo — it's a placeholder. A production implementation would use a structured memo.

**Fallback:** 700–1200ms. The hash is stored as `xrplHash` on the specific `LoanRepayment` row.

---

## Collateral escrow — the tokenization gate

Before an issuer can run `createMPTIssuance()`, they must prove they have skin in the game: ≥ 10% of the asset's value locked in a self-escrow on XRPL. This is separate from the lender escrow — it's the *issuer's* own funds, not investor capital.

### createCollateralEscrow

Path: `/tokenize` "Lock Collateral" button → `lending-service.lockCollateral()` → `xrpl.createCollateralEscrow()`

```ts
export async function createCollateralEscrow(
  userAddress: string,
  amountUsdc: number
): Promise<CollateralEscrowResult>
// CollateralEscrowResult extends XRPLPaymentResult with:
//   collateralAmount: number    — USD amount locked
//   escrowSequence?: number     — ledger sequence, needed to finish/cancel later
```

The real transaction uses:
- `Destination = wallet.address` — self-escrow, funds don't go anywhere
- `FinishAfter = now + 180 days` — 6-month lock
- `Memos[0].MemoType = hex("LiquidX/CollateralEscrow")`
- `Memos[0].MemoData = hex({ issuer: userAddress, purpose: "tokenization-collateral" })`

The memo type is what `verifyCollateralEscrow` looks for when reading back from the ledger.

---

### verifyCollateralEscrow

Path: `/tokenize` "Verify Collateral" button → `lending-service.checkUserEligibility()` → `xrpl.verifyCollateralEscrow()`

```ts
export async function verifyCollateralEscrow(
  userAddress: string,
  requiredAmount: number
): Promise<CollateralVerificationResult>
// { exists, amount, sufficient, escrowCount }
```

**Real path:** queries `account_objects` with `type: "escrow"` for `userAddress`. Filters by `MemoType === "LiquidX/CollateralEscrow"`. Sums the drops across all matching escrows and converts to USD. Returns whether the total is ≥ `requiredAmount`.

**Fallback:** always returns `{ exists: true, sufficient: true, amount: requiredAmount, escrowCount: 1 }`. In demo mode, the collateral check always passes.

If this check fails in the real path, `lending-service.checkUserEligibility()` blocks tokenization and shows the user exactly how much they're short.

---

## Simulation fallback pattern

Every exported function follows this structure:

```ts
export async function someAction(...) {
  try {
    return await realAction(...)    // real testnet
  } catch (err) {
    console.warn("[XRPL] fallback:", err)
    return simulatedAction(...)     // random hash, delay
  }
}
```

The UI receives the same `XRPLPaymentResult` shape either way. The only difference visible to the user is `status: "confirmed"` vs `status: "simulated"`, which is shown as a badge next to the transaction hash.

Functions that are always simulated (no real path): `finishXRPLEscrow`, `cancelXRPLEscrow`, `createMPTIssuance`, `authorizeMPTHolder`, `createLoanBroker`, `originateLoan`. Functions that attempt real testnet first: `createXRPLEscrow`, `submitLoanPay`, `createCollateralEscrow`, `verifyCollateralEscrow`, `sendXRPLPayment`.
