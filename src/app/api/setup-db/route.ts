import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PRODUCTS } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const { db, isMock } = await connectToDatabase();

  if (isMock) {
    return NextResponse.json({
      status: "mock_mode",
      message: "Application is running in Mock Mode (MongoDB connection is not active). Database seeding skipped.",
    });
  }

  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";
    const productsCollection = db!.collection("products");

    if (force) {
      console.log("Force re-seeding: Clearing existing products...");
      await productsCollection.deleteMany({});
    }

    const count = await productsCollection.countDocuments();

    if (count === 0) {
      // Format the mock products to make sure we don't duplicate id fields or anything
      const formattedProducts = PRODUCTS.map((p) => ({
        ...p,
        _id: undefined, // Let MongoDB generate its own ObjectIds
      }));
      
      await productsCollection.insertMany(formattedProducts);
      return NextResponse.json({
        status: "success",
        message: `Seeded database with ${PRODUCTS.length} products successfully.`,
      });
    }

    return NextResponse.json({
      status: "already_seeded",
      message: `Database already contains ${count} products. Seeding skipped.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to seed database." },
      { status: 500 }
    );
  }
}
export async function POST(req: NextRequest) {
  return GET(req);
}
