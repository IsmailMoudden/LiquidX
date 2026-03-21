// ─── LiquidX Loan Pricing & Rating ────────────────────────────────────────────
// Interest Rate = Base + Risk + Duration - CollateralBonus ± XrpAdjustment
//
// Designed to be simple, transparent, and UI-friendly.
// All rates are expressed as percentages (e.g. 7.5 = 7.5%).

// ─── Types ────────────────────────────────────────────────────────────────────

export type AssetType =
  | "real-estate"
  | "invoice"
  | "vehicle"
  | "business"
  | "art"
  | string; // fallback: unknown asset types use default risk premium

export type RiskLevel = "Low" | "Medium" | "High";

export type XrpVolatility = "low" | "medium" | "high";

export interface LoanPricingBreakdown {
  base: number;
  risk: number;
  duration: number;
  collateralBonus: number; // always negative (a reduction)
  xrpAdjustment: number;   // negative, zero, or positive
}

export interface LoanPricingResult {
  interestRate: number;
  riskLevel: RiskLevel;
  breakdown: LoanPricingBreakdown;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_RATE = 5;

const RISK_PREMIUM: Record<string, number> = {
  "real-estate": 2,
  invoice: 2,
  vehicle: 4,
  business: 4,
  art: 7,
};
const DEFAULT_RISK_PREMIUM = 5;

const XRP_VOLATILITY_ADJUSTMENT: Record<XrpVolatility, number> = {
  low: -0.5,
  medium: 0,
  high: 1,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRiskPremium(assetType: AssetType): number {
  return RISK_PREMIUM[assetType] ?? DEFAULT_RISK_PREMIUM;
}

function getDurationPremium(durationDays: number): number {
  if (durationDays < 30) return 1;
  if (durationDays <= 90) return 2;
  return 3;
}

/** For every full 10% of collateral locked, reduce rate by 1%. Capped at 5% bonus. */
function getCollateralBonus(collateralPercent: number): number {
  const bonus = Math.floor(collateralPercent / 10);
  return -Math.min(bonus, 5);
}

function getRiskLevel(rate: number): RiskLevel {
  if (rate < 8) return "Low";
  if (rate <= 12) return "Medium";
  return "High";
}

// ─── Main function ─────────────────────────────────────────────────────────────

/**
 * calculateLoanPricing — computes interest rate and risk rating for a loan.
 *
 * @param assetType       - Type of collateral asset (e.g. "real-estate", "art")
 * @param durationDays    - Loan term in days
 * @param collateralPercent - Percentage of asset value locked in escrow (0–100)
 * @param xrpVolatility   - Current XRP market volatility (optional, default: "medium")
 *
 * @returns { interestRate, riskLevel, breakdown }
 *
 * @example
 * calculateLoanPricing("real-estate", 60, 20)
 * // → { interestRate: 7, riskLevel: "Low", breakdown: { base:5, risk:2, duration:2, collateralBonus:-2, xrpAdjustment:0 } }
 */
export function calculateLoanPricing(
  assetType: AssetType,
  durationDays: number,
  collateralPercent: number,
  xrpVolatility: XrpVolatility = "medium"
): LoanPricingResult {
  const base = BASE_RATE;
  const risk = getRiskPremium(assetType);
  const duration = getDurationPremium(durationDays);
  const collateralBonus = getCollateralBonus(collateralPercent);
  const xrpAdjustment = XRP_VOLATILITY_ADJUSTMENT[xrpVolatility];

  const interestRate = base + risk + duration + collateralBonus + xrpAdjustment;

  return {
    interestRate: Math.max(0, interestRate), // floor at 0%
    riskLevel: getRiskLevel(interestRate),
    breakdown: { base, risk, duration, collateralBonus, xrpAdjustment },
  };
}
