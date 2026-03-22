// ─── XRP DID & Identity ───────────────────────────────────────────────────────
// Decentralized Identity anchored on the XRP Ledger (W3C DID standard).
// Every asset issuer must hold a verified DID before registering assets.

export type DIDVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface XRPIdentity {
  did: string;                        // e.g. "did:xrpl:1:rN7n3473SaZBCG4dFL75SJQnvoFMoFGC9"
  walletAddress: string;              // XRPL r-address bound to this DID
  kycStatus: DIDVerificationStatus;
  kycProvider?: string;               // e.g. "Sumsub", "Jumio"
  kycVerifiedAt?: string;             // ISO timestamp
  legalName?: string;                 // Revealed only to validators, not public
  jurisdiction?: string;              // Country of legal residence
}

// ─── Asset ────────────────────────────────────────────────────────────────────

export type AssetCategory =
  | "real-estate"
  | "infrastructure"
  | "art"
  | "wine"
  | "collectibles"
  | "private-equity"
  | "commodities";

export type FundingStatus = "open" | "funded" | "released" | "refunded" | "expired" | "repaid";

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  description: string;
  longDescription: string;
  image: string;
  location: string;
  totalValue: number;
  tokenSupply: number;
  tokenPrice: number;
  projectedYield: number;
  liquidityScore: number;
  minInvestment: number;
  tags: string[];
  highlights: string[];
  // ── Funding / Escrow ──
  fundingTarget: number;
  amountRaised: number;
  fundingDeadline: string;
  fundingStatus: FundingStatus;
  investorCount: number;
  validatorId: string;
  complianceApproved: boolean;
  // ── MPT tokenisation ──
  mptIssuanceId?: string;
  mptIssuerAddress?: string;
  // ── Vault link ──
  vaultId?: string;        // Vault backing this asset's loan pool
  // ── Identity & Trust (DID) ──
  issuerDid?: string;              // XRP DID of the asset issuer
  issuerVerified?: boolean;        // true once DID + KYC confirmed
  ownershipProofHash?: string;     // SHA-256 hash of the uploaded ownership document
  legalDeclarationHash?: string;   // Hash of the signed legal commitment
  verificationStatus?: "pending" | "verified" | "rejected";
  // ── Sources & Proof ──
  sources?: string[];              // Public reference URLs for asset verification
  proofOfOwnership?: {
    documentType: string;          // e.g. "Title Deed", "Certificate of Authenticity"
    issuedBy: string;              // Issuing authority
    issuedDate: string;            // ISO date
    hash: string;                  // SHA-256 of the document
    borrowerDid: string;           // XRPL DID of the borrower
    didVerified: boolean;
  };
  // ── Digital signature ──
  contractTxHash?: string;         // XRPL tx hash of the signed collateral contract
}

// ─── Vault ────────────────────────────────────────────────────────────────────
// A single-asset lending pool. Lenders deposit USDC and receive shares.
// Maps to XRPL LoanBroker ledger entry (XLS-66).
// Exposed to users as "Vault" — never as "LoanBroker".

export type VaultStatus = "active" | "paused" | "closed";

export interface Vault {
  id: string;
  assetId: string;
  assetName?: string;
  // What lenders see — new names
  name?: string;
  description?: string;
  expectedReturnPercent?: number;
  riskLevel?: "low" | "medium" | "high";
  // What lenders see — legacy names used by loanBrokers.ts seed data
  brokerName?: string;
  // Protection
  firstLossCoverPercent: number;
  firstLossCoverAmount?: number;
  // Pool stats — new names
  totalDeposited?: number;
  availableCapital?: number;
  utilization?: number;
  // Pool stats — legacy names
  vaultTotalDeposited?: number;
  vaultUtilization?: number;
  activeLoansCount: number;
  totalOriginated: number;
  defaultRate: number;
  lenderCount?: number;
  // Terms
  minDeposit?: number;
  lockupDays?: number;
  // Fees
  originationFeePercent: number;
  servicingFeePercent: number;
  // Status
  status: VaultStatus;
  // XRPL
  xrplBrokerAddress: string;
  // DestinationTag — routes deposits to this vault within the platform wallet.
  // Each vault has a unique tag so funds are logically separated on-chain.
  destinationTag: number;
  xrplHash?: string;
  createdAt: string;
}

// ─── Lending Position ─────────────────────────────────────────────────────────
// What a lender holds after depositing into a vault.
// Maps to XRPL trust line / MPT position in the vault.
// Exposed to users as "Lending Position" — never as "Investment".

export type LendingPositionStatus =
  | "active"
  | "earning"
  | "withdrawn"
  | "locked-in-escrow"
  // Legacy status values used by store internals
  | "locked"
  | "pending"
  | "released"
  | "refunded"
  | "repaid";

export interface LendingPosition {
  id: string;
  vaultId?: string;
  vaultName?: string;
  assetId: string;
  assetName: string;
  // Capital — new names
  amountDeposited?: number;
  currentValue?: number;
  earnedYield?: number;
  expectedAnnualReturn?: number;
  shares?: number;
  sharePrice?: number;
  // Capital — legacy names (used by store invest() action)
  amount?: number;
  tokens?: number;
  tokenPrice?: number;
  // Status
  status: LendingPositionStatus;
  depositedAt?: string;
  timestamp?: string;           // legacy alias for depositedAt
  maturesAt?: string;
  releasedAt?: string;
  refundedAt?: string;
  // XRPL (hidden from user, used for settlement)
  xrplEscrowHash?: string;
  xrplEscrowSequence?: number;
  xrplReleaseHash?: string;
  xrplCancelHash?: string;
  xrplRepayHash?: string;
  // Repayment
  repaidAt?: string;
  interestEarned?: number;
  // Validator approval
  validatorApproved?: boolean;
  validatorFee?: number;
}

// ─── Borrowing Position ───────────────────────────────────────────────────────
// What a borrower sees after a loan is approved.
// Maps to XRPL Loan ledger entry (XLS-66).
// Exposed to users as "Loan" — never as "LoanSet".

export type BorrowingStatus =
  | "requested"   // submitted, awaiting validator
  | "active"      // funds received, repaying
  | "repaid"      // fully repaid
  | "late"        // payment overdue (grace period)
  | "defaulted"   // enforcement triggered
  | "cancelled";

export interface LoanRepayment {
  id: string;
  amount: number;
  principal: number;
  interest: number;
  dueDate: string;
  paidAt?: string;
  xrplHash?: string;
  status: "due" | "paid" | "overdue";
}

export interface BorrowingPosition {
  id: string;
  vaultId?: string;
  brokerId?: string;            // legacy alias for vaultId used by store
  assetId: string;
  assetName: string;
  // Borrower identity
  borrowerAddress: string;
  borrowerTonAddress?: string;
  // Loan terms
  principal: number;
  interestRatePercent: number;
  termDays: number;
  originationFee: number;
  startDate: string;
  maturityDate: string;
  // Repayment
  repaymentSchedule: LoanRepayment[];
  totalRepaid: number;
  remainingBalance?: number;    // optional — computed as principal - totalRepaid if absent
  // Status
  status: BorrowingStatus;
  // Risk / underwriting (shown to validator, not borrower)
  underwritingScore: number;
  underwritingNotes?: string;
  // XRPL (abstracted — shown only in audit view)
  xrplLoanHash?: string;
  xrplLoanId?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Validator ────────────────────────────────────────────────────────────────

export interface Validator {
  id: string;
  name: string;
  organization: string;
  feePercentage: number;
  xrplAddress: string;
  approvedCount: number;
  totalVolumeSettled: number;
  status: "active" | "inactive";
}

// ─── MPT Issuance ─────────────────────────────────────────────────────────────

export interface MPTIssuance {
  id: string;
  assetId: string;
  issuerAddress: string;
  maxAmount: string;
  transferFee: number;
  flags: {
    canLock: boolean;
    requireAuth: boolean;
    canEscrow: boolean;
    canTrade: boolean;
  };
  xrplHash: string;
  xrplLedger: number;
  createdAt: string;
}

// ─── Legacy types (kept for backward compat with existing store/components) ───

// "Investment" is now a LendingPosition internally.
// Kept as alias so existing store code compiles without rewrite.
export type InvestmentStatus = LendingPositionStatus;
export type Investment = LendingPosition;

// "LoanBrokerConfig" is now a Vault internally.
export type LoanBrokerStatus = VaultStatus;
export type LoanBrokerConfig = Vault;

// "Loan" is now a BorrowingPosition internally.
export type LoanStatus = BorrowingStatus;
export type Loan = BorrowingPosition;

// Holding — released vault shares converted to tokens
export interface Holding {
  assetId: string;
  tokens: number;
  avgBuyPrice: number;
  purchasedAt: string;
  investmentId?: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────

export type TransactionType =
  | "lend"           // lender deposits into vault (was: invest)
  | "lending-release" // lender's position released (was: release)
  | "lending-refund" // lender's position refunded (was: refund)
  | "lending-repaid" // vault loan repaid — principal + interest returned to lenders
  | "loan-request"   // borrower requests a loan (was: loan-originate)
  | "loan-repay"     // borrower repays an instalment
  | "loan-default"
  | "mpt-issuance"
  | "tokenize"
  // legacy
  | "invest"
  | "release"
  | "refund"
  | "buy"
  | "sell"
  | "loan-originate";

export interface Transaction {
  id: string;
  type: TransactionType;
  assetId: string;
  assetName: string;
  tokens: number;
  price: number;
  total: number;
  timestamp: string;
  // XRPL settlement
  xrplHash?: string;
  xrplStatus?: "confirmed" | "simulated";
  xrplExplorerUrl?: string;
  xrplLedger?: number;
  xrplTxType?:
    | "EscrowCreate"
    | "EscrowFinish"
    | "EscrowCancel"
    | "Payment"
    | "MPTokenIssuanceCreate"
    | "MPTokenAuthorize"
    | "LoanBrokerSet"
    | "LoanSet"
    | "LoanPay";
  // Links
  validatorId?: string;
  validatorFee?: number;
  vaultId?: string;
  brokerId?: string;     // legacy alias for vaultId
  loanId?: string;
  investmentId?: string;
  tonAddress?: string;
  // Human-readable label (replaces type-based guessing in UI)
  label?: string;
}

// ─── App state ────────────────────────────────────────────────────────────────

export interface PortfolioState {
  usdcBalance: number;
  holdings: Holding[];
  mptIssuances: MPTIssuance[];
  transactions: Transaction[];
  assets: Asset[];
  // Lender side — canonical names
  lendingPositions?: LendingPosition[];
  // Borrower side — canonical names
  borrowingPositions?: BorrowingPosition[];
  // Platform — canonical names
  vaults?: Vault[];
  // Legacy names (used by store internals)
  investments: LendingPosition[];
  loans: BorrowingPosition[];
  loanBrokers: Vault[];
}
