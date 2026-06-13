import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    const { db, isMock } = await connectToDatabase();
    
    if (isMock || !db) {
      return NextResponse.json({
        status: "mock_mode",
        message: "Running in mock mode. Return assessments are managed on the client side.",
        returns: []
      });
    }

    const query: any = {};
    if (userId) query.userId = userId;
    if (orderId) query.orderId = orderId;

    const returns = await db.collection("returns").find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      status: "success",
      returns
    });
  } catch (error: any) {
    console.error("Error fetching returns:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to fetch returns" },
      { status: 500 }
    );
  }
}
