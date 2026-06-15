/**
 * Customer Risk Engine
 * Computes a buyer's return rate from their order history and classifies
 * them into one of three prevention tiers for the checkout flow.
 *
 * Tier thresholds (matching the Checkout Prevention Layer diagram):
 *   NEW_CUSTOMER    → 0–30%   → NORMAL checkout (no friction)
 *   RETURN_CUSTOMER → 30–60%  → NUDGE mode (size guide, social proof, AR prompt)
 *   HEAVY_RETURNER  → 60%+   → RESTRICT mode (3-day window, category blocks, chat gate)
 */

export type RiskTier = "NEW_CUSTOMER" | "RETURN_CUSTOMER" | "HEAVY_RETURNER";

export interface RiskProfile {
  tier: RiskTier;
  returnRate: number;         // 0–100 percentage
  returnsCount: number;
  totalDelivered: number;
  trustScore: number;         // 0–100 trust score (inverse of risk)
}

// Tier boundaries
export const RISK_THRESHOLDS = {
  NUDGE_MIN: 30,    // ≥ 30% → Nudge mode
  RESTRICT_MIN: 60, // ≥ 60% → Restrict mode
} as const;

// Simulated per-user trust scores stored in memory (in real app this would be DB)
const TRUST_SCORE_STORE: Record<string, number> = {
  "acc-1": 82,
  "acc-2": 55,
  "acc-3": 95,
};

export function computeRiskProfile(orders: {
  status: string;
  [key: string]: any;
}[]): RiskProfile {
  const deliveredOrders = orders.filter(
    (o) => o.status === "Delivered" || o.status === "Returned" || o.status === "Cancelled"
  );
  const returnedOrders = orders.filter((o) => o.status === "Returned");

  const totalDelivered = deliveredOrders.length;
  const returnsCount = returnedOrders.length;

  const returnRate =
    totalDelivered > 0
      ? Math.round((returnsCount / totalDelivered) * 100)
      : 0;

  let tier: RiskTier;
  if (returnRate >= RISK_THRESHOLDS.RESTRICT_MIN) {
    tier = "HEAVY_RETURNER";
  } else if (returnRate >= RISK_THRESHOLDS.NUDGE_MIN) {
    tier = "RETURN_CUSTOMER";
  } else {
    tier = "NEW_CUSTOMER";
  }

  // Trust score: starts at 100, decremented by return rate, floored at 0
  const trustScore = Math.max(0, Math.min(100, 100 - returnRate));

  return {
    tier,
    returnRate,
    returnsCount,
    totalDelivered,
    trustScore,
  };
}

export function getTrustScore(userId: string): number {
  return TRUST_SCORE_STORE[userId] ?? 80;
}

export function updateTrustScore(
  userId: string,
  delta: number
): number {
  const current = TRUST_SCORE_STORE[userId] ?? 80;
  const updated = Math.max(0, Math.min(100, current + delta));
  TRUST_SCORE_STORE[userId] = updated;
  return updated;
}

/**
 * Maps an AI return grade to a trust score delta.
 * Good outcomes restore trust; fraudulent outcomes penalize heavily.
 */
export function gradeToTrustDelta(grade: string): number {
  switch (grade) {
    case "A+": return +8;
    case "A":  return +5;
    case "B+": return +2;
    case "B":  return 0;
    case "C":  return -5;
    case "D":  return -12;
    case "F":  return -20; // wear-and-return fraud
    default:   return 0;
  }
}

/**
 * Maps an AI return grade to a smart routing path.
 * Grade A/A+ → Resell as-is
 * Grade B/B+ → Refurbish
 * Grade C/D/F → Donate
 */
export function gradeToRoutingPath(
  grade: string,
  reason?: string
): "LOCAL_STORE_RESELL" | "RESELL_AS_IS" | "REFURBISH" | "DONATE" {
  // If the reason implies an unopened/pristine product, and grade is A/A+, fast-track to local store
  const fastTrackReasons = ["changed_mind", "wrong_size", "wrong_color", "arrived_late", "gifting_different"];
  
  if (fastTrackReasons.includes(reason || "") && (grade === "A+" || grade === "A")) {
    return "LOCAL_STORE_RESELL";
  }

  switch (grade) {
    case "A+":
    case "A":
      return "RESELL_AS_IS";
    case "B+":
    case "B":
      return "REFURBISH";
    default:
      return "DONATE";
  }
}

export function routingPathLabel(path: "LOCAL_STORE_RESELL" | "RESELL_AS_IS" | "REFURBISH" | "DONATE"): string {
  switch (path) {
    case "LOCAL_STORE_RESELL": return "Local Store Resell";
    case "RESELL_AS_IS": return "Resell As-Is";
    case "REFURBISH":    return "Refurbish";
    case "DONATE":       return "Donate";
  }
}
