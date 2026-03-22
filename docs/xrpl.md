# XRPL Integration

Source: [src/lib/xrpl.ts](../src/lib/xrpl.ts) · [src/lib/xrpl-client.ts](../src/lib/xrpl-client.ts)

---

## Network

```
wss://s.devnet.rippletest.net:51233   — XRPL devnet WebSocket
https://devnet.xrpl.org/transactions  — explorer base URL
```

LiquidX runs on **XRPL devnet** (not testnet). This is where both XLS-33 (MPTokensV1) and XLS-66 (Lending) amendments are active as of March 2026. Every real transaction is verifiable on [devnet.xrpl.org](https://devnet.xrpl.org).

---

## Real vs. Simulated — authoritative table

| Transaction | Status | Notes |
|---|---|---|
| `EscrowCreate` (lender deposit) | **Real devnet** | `realEscrowCreate()` — `Client.submitAndWait` |
| `EscrowCreate` (collateral) | **Real devnet** | `realCollateralEscrowCreate()` — with `LiquidX/CollateralEscrow` memo |
| `verifyCollateralEscrow` | **Real devnet** | `account_objects` query — reads actual ledger state |
| `EscrowFinish` | **Real devnet** | `finishXRPLEscrow(sequence)` — uses stored `escrowSequence` from EscrowCreate |
| `EscrowCancel` | Simulated | No real path needed in demo flow |
| `Payment` (vault repay) | **Real devnet** | `realLoanPay()` — Payment tx with `LiquidX/VaultRepay` memo |
| `DIDSet` | **Real devnet** | W3C DID anchored on-chain, resolved via `account_objects` |
| `MPTokenIssuanceCreate` | **Real devnet** | XLS-33 (MPTokensV1) enabled on devnet — 48-char `mptIssuanceId` from `AffectedNodes` |
| `LoanBrokerSet` | **Real devnet** | XLS-66 now active on devnet — creates `LoanBroker` ledger entry |
| `LoanSet` | **Real devnet** | XLS-66 now active — generates 256-bit `loanId` on-chain |
| `LoanPay` | **Real devnet** | XLS-66 now active — each of 3 installments is a real tx |

**"Real devnet"** means the function calls `Client.connect()` + `submitAndWait` against `wss://s.devnet.rippletest.net:51233`. If the WebSocket is unavailable, it falls back to a simulation with the same result shape and `status: "simulated"`.

---

## 3-Wallet Architecture

```
rGguTpZQ… (Lender wallet)
  Sends: EscrowCreate → Platform wallet
         DestinationTag routes to specific vault

rQDN8QJX… (Platform wallet)
  Sends: EscrowFinish — releases capital after validator approval
         LoanBrokerSet — creates vault (XLS-66)
         LoanSet — originates loan (XLS-66)

rG1Lt5T1… (Asset Owner wallet)
  Sends: DIDSet — anchors W3C identity
         EscrowCreate (self-escrow) — collateral lock
         MPTokenIssuanceCreate — tokenizes asset (XLS-33)
         LoanPay × 3 — repayment installments (XLS-66)
```

---

## Result shape every function returns

```ts
interface XRPLPaymentResult {
  hash: string                        // 64-char uppercase hex
  ledger?: number                     // real from devnet, or mockLedger() (92M–94M range)
  status: "confirmed" | "simulated"   // shown as badge in UI
  explorerUrl: string                 // always set — devnet.xrpl.org/transactions/{hash}
  network: "devnet"
  txType: XRPLTxType
  mptIssuanceId?: string              // only from MPTokenIssuanceCreate
  loanId?: string                     // only from LoanSet
}
```

`explorerUrl` is always constructed. For simulated hashes it won't resolve on the explorer — that's intentional and shown visually in the UI.

---

## USD → drops conversion

XRPL amounts are in drops (1 XRP = 1,000,000 drops). All LiquidX amounts are in USD.

```ts
getXrpPriceUsd()    // CoinGecko public API, cached 60s, falls back to $0.50
usdToDrops(usd)     // → String(ceil(usd / price) * 1_000_000)
dropsToUsd(drops)   // → (drops / 1_000_000) * price
```

Used in: `realEscrowCreate`, `realLoanPay`, `realCollateralEscrowCreate`.

The amount on-chain is 1 XRP symbolic — the full USD amount is tracked in Zustand/Supabase as the dual-layer settlement model.

---

## EscrowCreate / EscrowFinish / EscrowCancel

### EscrowCreate (lender deposit)

Triggered: lender confirms investment in `InvestDialog`

Path: `InvestDialog` → `lending-service.depositToVault()` → `xrpl.createXRPLEscrow()`

```ts
createXRPLEscrow(amountUSD, destination, destinationTag, assetId)
```

Real tx fields:
- `TransactionType: "EscrowCreate"`
- `Amount: usdToDrops(amountUSD)` (symbolic 1 XRP in demo)
- `Destination: rQDN8QJX… (platform wallet)`
- `DestinationTag: vault.destinationTag` — routes to correct vault
- `FinishAfter: now + fundingDeadline`
- `Memo: LiquidX/VaultDeposit { assetId, vaultTag }`

The returned `escrowSequence` (from `account_info` before submit) is stored as `investment.xrplEscrowSequence` — required for `EscrowFinish`.

---

### EscrowFinish

Triggered: validator clicks "Approve & Release" in `ValidatorPanel`

Path: `ValidatorPanel` → `finishXRPLEscrow(escrowSequence)` → `EscrowFinish`

```ts
finishXRPLEscrow(escrowSequence?: number): Promise<XRPLPaymentResult>
```

Real tx fields:
- `TransactionType: "EscrowFinish"`
- `Owner: rGguTpZQ… (lender wallet)`
- `OfferSequence: escrowSequence` — the sequence stored at EscrowCreate time

Without `escrowSequence`, falls back to simulation. After resolution, `store.approveAndRelease()` converts locked positions to holdings.

---

### EscrowCancel

Triggered: validator clicks "Refund", or `DeadlineWatcher` fires when `fundingDeadline` expires.

Always simulated in current demo flow (no active escrow sequences to cancel during demo).

---

## MPTokenIssuanceCreate (XLS-33)

Amendment: **MPTokensV1 — enabled on devnet (confirmed 22 March 2026)**

Triggered: end of tokenize form on `/tokenize`, after both eligibility gates pass.

```ts
createMPTIssuance({ assetName, maxAmount, transferFeePercent, requireAuth })
→ XRPLPaymentResult & { mptIssuanceId: string }
```

Real tx flags: `tfMPTCanLock | tfMPTRequireAuth | tfMPTCanEscrow | tfMPTCanTrade`

The `mptIssuanceId` is a 48-char hex extracted from `AffectedNodes` in the validated tx. It's stored as `asset.mptIssuanceId` and in `store.mptIssuances[]`.

Because `tfMPTRequireAuth` is set, each investor wallet must be explicitly authorized (`MPTokenAuthorize`) before receiving tokens. This runs automatically after `EscrowFinish` in production.

---

## DIDSet (W3C Identity)

Triggered: user completes KYC on Account page.

```ts
// Real tx:
{
  TransactionType: "DIDSet",
  DIDDocument: hex(JSON.stringify(w3cDocument)),  // ≤256 bytes
  URI: hex("https://liquidx.io/did/" + walletAddress)
}
```

Resolved server-side in `src/lib/did.ts`:
```ts
resolveDID(walletAddress)
// → account_objects with type: "did"
// → decode DIDDocument hex → return W3C DID document
```

The DID is required before loan origination (`requireVerifiedDID()` gate in `lending-service.ts`) and before MPT issuance.

---

## XLS-66 — LoanBrokerSet / LoanSet / LoanPay

Amendment: **XLS-66 (Lending) — now active on XRPL devnet**

### LoanBrokerSet

Creates the `LoanBroker` ledger entry — the on-chain vault governing a loan pool.

```ts
createLoanBroker({ originationFeePercent, servicingFeePercent, firstLossCoverPercent, assetLabel })
```

Called during asset onboarding. The returned hash is stored as `vault.xrplHash`.

---

### LoanSet

Records loan terms on-chain. Generates the `loanId` that tracks this loan through all repayments.

```ts
originateLoan({ borrowerAddress, principalUsdc, interestRatePercent, termDays, originationFee })
→ XRPLPaymentResult & { loanId: string }
```

The `loanId` is a 256-bit hex. It is stored as `loan.xrplLoanId` and referenced in every `LoanPay` transaction.

---

### LoanPay

Records one installment repayment. Each of 3 installments is a separate on-chain transaction.

```ts
submitLoanPay({ loanId, borrowerAddress, amountUsdc, principal, interest })
```

Real path: `Payment` tx with `Memo: LiquidX/VaultRepay { loanId, principal, interest }`. Each hash stored on the individual `LoanRepayment` entry.

---

## Collateral Escrow Gate

Before `MPTokenIssuanceCreate`, issuers must prove ≥10% of asset value is locked on-chain.

### createCollateralEscrow

```ts
createCollateralEscrow(userAddress, amountUsdc) → CollateralEscrowResult
```

Real tx:
- `Destination: userAddress` — self-escrow (funds stay with issuer)
- `FinishAfter: now + 180 days` — 6-month lock
- `Memo: LiquidX/CollateralEscrow { issuer, purpose: "tokenization-collateral" }`

### verifyCollateralEscrow

```ts
verifyCollateralEscrow(userAddress, requiredAmount) → { exists, amount, sufficient, escrowCount }
```

Real path: `account_objects` with `type: "escrow"` for `userAddress`. Filters by `MemoType === "LiquidX/CollateralEscrow"`. Converts drops to USD, checks against `requiredAmount`. Returns exact shortfall if insufficient.

---

## Simulation Fallback Pattern

Every exported function follows this pattern:

```ts
export async function someAction(...) {
  try {
    return await realAction(...)      // real devnet
  } catch (err) {
    console.warn("[XRPL] fallback:", err)
    return simulatedAction(...)       // random hash, realistic delay
  }
}
```

The UI receives the same `XRPLPaymentResult` shape either way. `status: "confirmed"` vs `status: "simulated"` is shown as a badge next to each transaction hash in the UI.

A new `Client` is created per call, connected, used, then disconnected in a `finally` block. No persistent WebSocket.
