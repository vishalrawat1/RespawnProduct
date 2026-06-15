import { NextRequest, NextResponse } from "next/server";
import { getTrustScore, updateTrustScore, gradeToTrustDelta } from "@/lib/riskEngine";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId") || "acc-1";
  const score = getTrustScore(userId);
  return NextResponse.json({ status: "success", userId, trustScore: score });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, grade, delta } = body;

    if (!userId) {
      return NextResponse.json(
        { status: "error", message: "userId is required" },
        { status: 400 }
      );
    }

    // Accept either an explicit delta or derive it from a return grade
    const scoreDelta = typeof delta === "number" ? delta : gradeToTrustDelta(grade || "B");
    const newScore = updateTrustScore(userId, scoreDelta);

    return NextResponse.json({
      status: "success",
      userId,
      trustScore: newScore,
      delta: scoreDelta,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update trust score" },
      { status: 500 }
    );
  }
}
