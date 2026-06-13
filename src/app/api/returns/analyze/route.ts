import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { analyzeReturnRequest } from "../../../../../backend/analyzer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, productId, userId, returnReason, comments, uploadedImages } = body;

    if (!orderId || !productId || !userId || !returnReason) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Run AI analysis simulation
    const assessment = analyzeReturnRequest({
      orderId,
      productId,
      userId,
      returnReason,
      comments: comments || "",
      uploadedImages: uploadedImages || []
    });

    // Simulate the exact processing time calculated by the AI engine
    await new Promise((resolve) => setTimeout(resolve, assessment.processingTimeMs));

    // Save to Database if active
    const { db, isMock } = await connectToDatabase();
    if (!isMock && db) {
      try {
        await db.collection("returns").insertOne(assessment);
        
        // Update corresponding order status
        const orderStatus = assessment.status === "Approved (Auto-Refund)" ? "Returned" : "Returned"; 
        await db.collection("orders").updateOne(
          { id: orderId },
          { $set: { status: orderStatus } }
        );
      } catch (dbErr) {
        console.error("Database persistence failed, returning mock response:", dbErr);
      }
    }

    return NextResponse.json({
      status: "success",
      isMock,
      assessment
    });
  } catch (error: any) {
    console.error("Error in returns/analyze:", error);
    return NextResponse.json(
      { status: "error", message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
