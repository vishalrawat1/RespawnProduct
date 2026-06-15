import { NextRequest, NextResponse } from "next/server";
import { MOCK_RETURNS } from "@/lib/mockReturns";
import { gradeToRoutingPath, routingPathLabel } from "@/lib/riskEngine";

/**
 * Product Health Card API
 * Aggregates all return data for a given productId and returns a rich
 * health card object used by the health card page, manufacturer dashboard,
 * and QR-code audit trail.
 */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { status: "error", message: "productId is required" },
      { status: 400 }
    );
  }

  // Get all returns for this product
  const productReturns = MOCK_RETURNS.filter(
    (r) => r.productId === productId
  );

  // Grade distribution
  const gradeCount: Record<string, number> = {};
  const reasonCount: Record<string, number> = {};
  const routingCount: Record<string, number> = {
    LOCAL_STORE_RESELL: 0,
    RESELL_AS_IS: 0,
    REFURBISH: 0,
    DONATE: 0,
  };

  let totalConfidence = 0;

  productReturns.forEach((ret) => {
    // Count grades
    const grade = ret.assignedGrade || "B";
    gradeCount[grade] = (gradeCount[grade] || 0) + 1;

    // Count return reasons
    const reason = ret.returnReason || "other";
    reasonCount[reason] = (reasonCount[reason] || 0) + 1;

    // Count routing paths
    const path = gradeToRoutingPath(grade, reason);
    routingCount[path] += 1;

    totalConfidence += ret.confidenceScore || 90;
  });

  const totalReturns = productReturns.length;
  const avgConfidence =
    totalReturns > 0 ? Math.round(totalConfidence / totalReturns) : 0;

  // Sustainability score: percentage of items diverted from landfill
  // (local resell + resold + refurbished = diverted)
  const diverted = routingCount.LOCAL_STORE_RESELL + routingCount.RESELL_AS_IS + routingCount.REFURBISH;
  const sustainabilityScore =
    totalReturns > 0 ? Math.round((diverted / totalReturns) * 100) : 100;

  // Top return reason
  const sortedReasons = Object.entries(reasonCount).sort(
    ([, a], [, b]) => b - a
  );
  const topReason = sortedReasons[0]?.[0] || null;

  // Manufacturer feedback messages based on top reasons
  const manufacturerFeedback: string[] = [];
  if (reasonCount["size_fit"]) {
    const pct = Math.round((reasonCount["size_fit"] / totalReturns) * 100);
    manufacturerFeedback.push(
      `Size fit issues account for ${pct}% of returns — consider adjusting size chart or pattern.`
    );
  }
  if (reasonCount["defective_damaged"]) {
    const pct = Math.round((reasonCount["defective_damaged"] / totalReturns) * 100);
    manufacturerFeedback.push(
      `${pct}% of returns are defective/damaged — inspect quality control at assembly.`
    );
  }
  if (reasonCount["not_as_described"]) {
    manufacturerFeedback.push(
      `Customers report product not matching description — review listing images and specs.`
    );
  }
  if (manufacturerFeedback.length === 0) {
    manufacturerFeedback.push("Product performance is within acceptable return thresholds.");
  }

  // Overall health grade for the product itself
  let productHealthGrade = "A";
  if (totalReturns === 0) {
    productHealthGrade = "A+";
  } else if (sustainabilityScore >= 90) {
    productHealthGrade = "A";
  } else if (sustainabilityScore >= 70) {
    productHealthGrade = "B";
  } else if (sustainabilityScore >= 50) {
    productHealthGrade = "C";
  } else {
    productHealthGrade = "D";
  }

  // QR code URL pointing to the health card page
  const healthCardUrl = `${req.nextUrl.origin}/health-card/${productId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(healthCardUrl)}`;

  return NextResponse.json({
    status: "success",
    healthCard: {
      productId,
      totalReturns,
      returnCount: totalReturns,
      gradeDistribution: gradeCount,
      reasonDistribution: reasonCount,
      routingDistribution: {
        LOCAL_STORE_RESELL: routingCount.LOCAL_STORE_RESELL,
        RESELL_AS_IS: routingCount.RESELL_AS_IS,
        REFURBISH: routingCount.REFURBISH,
        DONATE: routingCount.DONATE,
      },
      routingLabels: {
        LOCAL_STORE_RESELL: routingPathLabel("LOCAL_STORE_RESELL"),
        RESELL_AS_IS: routingPathLabel("RESELL_AS_IS"),
        REFURBISH: routingPathLabel("REFURBISH"),
        DONATE: routingPathLabel("DONATE"),
      },
      topReturnReason: topReason,
      avgAiConfidence: avgConfidence,
      sustainabilityScore,
      productHealthGrade,
      manufacturerFeedback,
      qrCodeUrl,
      healthCardUrl,
      generatedAt: new Date().toISOString(),
    },
  });
}
