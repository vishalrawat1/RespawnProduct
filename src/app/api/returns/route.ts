import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

export const MOCK_RETURNS: any[] = [];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const orderId = searchParams.get("orderId");

    const { db, isMock } = await connectToDatabase();
    
    if (isMock || !db) {
      let filtered = [...MOCK_RETURNS];
      if (userId) filtered = filtered.filter(r => r.userId === userId);
      if (orderId) filtered = filtered.filter(r => r.orderId === orderId);
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return NextResponse.json({
        status: "mock_mode",
        message: "Running in mock mode. Return assessments loaded from memory.",
        returns: filtered
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
