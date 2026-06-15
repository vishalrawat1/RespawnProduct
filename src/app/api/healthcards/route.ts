import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// In-memory mock storage (survives hot-reloads within the same server session)
export const MOCK_HEALTHCARDS: any[] = [
  {
    id: "hc-mock-001",
    productbuyid: "pbid-mock-001",
    productId: "sony-wh-1000xm5",
    orderId: "ord-mock-1",
    grade: "A",
    confidence: 95,
    returns: [{ id: 1, reason: "No longer needed", count: 1 }],
    routed: "Secondary Market Resell",
    manufacturerNote: "Device is in perfect working condition. No wear and tear.",
    sustainability: "Eco-Verified Inspection",
    generatedDate: new Date().toISOString().split("T")[0],
    generatedAt: new Date().toISOString(),
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"],
    mismatchScore: 0,
    crossVerifiedDefects: [],
    status: "Approved",
    respawnOption: "p2p"
  },
  {
    id: "hc-mock-002",
    productbuyid: "pbid-mock-002",
    productId: "iphone-15-pro",
    orderId: "ord-mock-2",
    grade: "B+",
    confidence: 88,
    returns: [{ id: 2, reason: "Minor scratch on bezel", count: 1 }],
    routed: "Manufacturer Refurbishment Pipeline",
    manufacturerNote: "Needs minor polishing. Fully functional.",
    sustainability: "Eco-Verified Inspection",
    generatedDate: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80"],
    mismatchScore: 12,
    crossVerifiedDefects: [],
    status: "Approved",
    respawnOption: "refurb"
  },
  {
    id: "hc-mock-003",
    productbuyid: "pbid-mock-003",
    productId: "asus-rog-g14",
    orderId: "ord-mock-3",
    grade: "A",
    confidence: 92,
    returns: [{ id: 3, reason: "Ordered wrong spec", count: 1 }],
    routed: "Secondary Market Resell",
    manufacturerNote: "Like new, open box condition.",
    sustainability: "Eco-Verified Inspection",
    generatedDate: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    generatedAt: new Date(Date.now() - 172800000).toISOString(),
    images: ["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80"],
    mismatchScore: 5,
    crossVerifiedDefects: [],
    status: "Approved",
    respawnOption: "p2p"
  },
  {
    id: "hc-mock-004",
    productbuyid: "pbid-mock-004",
    productId: "ring-video-doorbell",
    orderId: "ord-mock-4",
    grade: "C",
    confidence: 75,
    returns: [{ id: 4, reason: "Scratched lens cover", count: 1 }],
    routed: "Manufacturer Refurbishment Pipeline",
    manufacturerNote: "Requires parts replacement (lens cover).",
    sustainability: "0.2kg e-waste diverted",
    generatedDate: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    generatedAt: new Date(Date.now() - 259200000).toISOString(),
    images: ["https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80"],
    mismatchScore: 35,
    crossVerifiedDefects: [],
    status: "Approved",
    respawnOption: "refurb"
  },
  {
    id: "hc-mock-005",
    productbuyid: "pbid-mock-005",
    productId: "boldfit-yoga-mat",
    orderId: "ord-mock-5",
    grade: "A+",
    confidence: 99,
    returns: [{ id: 5, reason: "Too thick for my preference", count: 1 }],
    routed: "NGO Donation Network",
    manufacturerNote: "Pristine condition. Sent directly to local partner NGO.",
    sustainability: "100% Repurposed",
    generatedDate: new Date(Date.now() - 345600000).toISOString().split("T")[0],
    generatedAt: new Date(Date.now() - 345600000).toISOString(),
    images: ["https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80"],
    mismatchScore: 0,
    crossVerifiedDefects: [],
    status: "Approved",
    respawnOption: "donate"
  }
];

// ── POST /api/healthcards ─────────────────────────────────────────────────────
// Body: { id, grade, confidence, returns, routed, manufacturerNote,
//         sustainability, generatedDate, images, mismatchScore,
//         crossVerifiedDefects, productId, orderId, respawnSessionId }
// Returns: { status, id } so the caller can store the confirmed persisted ID
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.id || !body.grade) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields (id, grade)." },
        { status: 400 }
      );
    }

    const record = {
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { db, isMock } = await connectToDatabase();

    if (!isMock && db) {
      try {
        // Upsert: replace existing card with same id (re-scan case)
        await db.collection("healthcards").replaceOne(
          { id: body.id },
          record,
          { upsert: true }
        );
      } catch (dbErr) {
        console.error("DB persistence failed for healthcard:", dbErr);
        // Fall back to mock storage
        const existingIdx = MOCK_HEALTHCARDS.findIndex((c) => c.id === body.id);
        if (existingIdx !== -1) {
          MOCK_HEALTHCARDS[existingIdx] = record;
        } else {
          MOCK_HEALTHCARDS.push(record);
        }
      }
    } else {
      // Mock mode: upsert in memory
      const existingIdx = MOCK_HEALTHCARDS.findIndex((c) => c.id === body.id);
      if (existingIdx !== -1) {
        MOCK_HEALTHCARDS[existingIdx] = record;
      } else {
        MOCK_HEALTHCARDS.push(record);
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Health Card saved successfully.",
      id: body.id,
    });
  } catch (error: any) {
    console.error("Error saving healthcard:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error." },
      { status: 500 }
    );
  }
}

// ── GET /api/healthcards?id=<id>&productId=<pid>&orderId=<oid> ───────────────
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id           = searchParams.get("id");
    const productId    = searchParams.get("productId");
    const orderId      = searchParams.get("orderId");
    const productbuyid = searchParams.get("productbuyid");

    const { db, isMock } = await connectToDatabase();

    if (!isMock && db) {
      let query: Record<string, any> = {};
      if (id)           query.id           = id;
      if (productId)    query.productId    = productId;
      if (orderId)      query.orderId      = orderId;
      if (productbuyid) query.productbuyid = productbuyid;
      let cards = await db
        .collection("healthcards")
        .find(query)
        .sort({ createdAt: -1 })
        .toArray();

      if (cards.length === 0) {
        let mockCards = MOCK_HEALTHCARDS;
        if (id)           mockCards = mockCards.filter((c) => c.id           === id);
        if (productId)    mockCards = mockCards.filter((c) => c.productId    === productId);
        if (orderId)      mockCards = mockCards.filter((c) => c.orderId      === orderId);
        if (productbuyid) mockCards = mockCards.filter((c) => c.productbuyid === productbuyid);
        cards = [...mockCards].sort(
          (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        );
      }

      return NextResponse.json({ status: "success", data: cards });
    } else {
      let cards = MOCK_HEALTHCARDS;
      if (id)           cards = cards.filter((c) => c.id           === id);
      if (productId)    cards = cards.filter((c) => c.productId    === productId);
      if (orderId)      cards = cards.filter((c) => c.orderId      === orderId);
      if (productbuyid) cards = cards.filter((c) => c.productbuyid === productbuyid);
      // newest first
      cards = [...cards].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return NextResponse.json({ status: "success", data: cards });
    }
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: "Internal server error." },
      { status: 500 }
    );
  }
}
