import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// Mock storage for local fallback
export const MOCK_HEALTHCARDS: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body.id || !body.grade) {
      return NextResponse.json({ status: "error", message: "Missing required fields." }, { status: 400 });
    }

    const { db, isMock } = await connectToDatabase();
    
    if (!isMock && db) {
      try {
        await db.collection("healthcards").insertOne({
          ...body,
          createdAt: new Date().toISOString()
        });
      } catch (dbErr) {
        console.error("Database persistence failed for healthcard:", dbErr);
        MOCK_HEALTHCARDS.push(body);
      }
    } else {
      MOCK_HEALTHCARDS.push(body);
    }

    return NextResponse.json({ status: "success", message: "Health Card saved successfully." });
  } catch (error: any) {
    console.error("Error saving healthcard:", error);
    return NextResponse.json({ status: "error", message: "Internal server error." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const { db, isMock } = await connectToDatabase();
    
    if (!isMock && db) {
      const query = id ? { id } : {};
      const cards = await db.collection("healthcards").find(query).sort({ createdAt: -1 }).toArray();
      return NextResponse.json({ status: "success", data: cards });
    } else {
      const cards = id ? MOCK_HEALTHCARDS.filter(c => c.id === id) : MOCK_HEALTHCARDS;
      return NextResponse.json({ status: "success", data: cards });
    }
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: "Internal server error." }, { status: 500 });
  }
}
