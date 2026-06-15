import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// In-memory mock storage (survives hot-reloads within the same server session)
export const MOCK_RESPAWNED: any[] = [
  {
    id: "respawn-mock-1",
    productId: "sony-wh-1000xm5",
    productbuyid: "pbid-mock-001",
    name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    price: 25999,
    type: "p2p",
    currentStage: 1,
    status: "routing",
    healthCardId: "hc-mock-001",
    createdAt: new Date().toISOString()
  },
  {
    id: "respawn-mock-2",
    productId: "iphone-15-pro",
    productbuyid: "pbid-mock-002",
    name: "Apple iPhone 15 Pro (128 GB)",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80",
    price: 127999,
    type: "refurb",
    currentStage: 3,
    status: "routing",
    healthCardId: "hc-mock-002",
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
  },
  {
    id: "respawn-mock-3",
    productId: "asus-rog-g14",
    productbuyid: "pbid-mock-003",
    name: "ASUS ROG Zephyrus G14 Gaming Laptop",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500&auto=format&fit=crop&q=80",
    price: 134990,
    type: "p2p",
    currentStage: 2,
    status: "routing",
    healthCardId: "hc-mock-003",
    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
  },
  {
    id: "respawn-mock-4",
    productId: "ring-video-doorbell",
    productbuyid: "pbid-mock-004",
    name: "Ring Video Doorbell (2nd Gen)",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=80",
    price: 8499,
    type: "refurb",
    currentStage: 5,
    status: "matched",
    healthCardId: "hc-mock-004",
    createdAt: new Date(Date.now() - 259200000).toISOString() // 3 days ago
  },
  {
    id: "respawn-mock-5",
    productId: "boldfit-yoga-mat",
    productbuyid: "pbid-mock-005",
    name: "Boldfit Yoga Mat for Women and Men",
    image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80",
    price: 499,
    type: "donate",
    currentStage: 1,
    status: "fallback", // NGO Donation
    healthCardId: "hc-mock-005",
    createdAt: new Date(Date.now() - 345600000).toISOString() // 4 days ago
  }
];

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { item, type, currentStage, status } = data;

    const respawnedId = `respawn-${item.id}-${Date.now()}`;
    const healthCardId = item.healthCardId || respawnedId;

    const newRespawnedItem = {
      id: respawnedId,
      productId: item.id,
      productbuyid: item.productbuyid || "",
      name: item.name,
      image: item.image,
      price: item.price,
      type: type,
      currentStage: currentStage || 1,
      status: status || "routing",
      healthCardId: healthCardId,
      healthCardData: item.healthCardData,
      createdAt: new Date().toISOString()
    };

    const { db, isMock } = await connectToDatabase();

    if (isMock) {
      MOCK_RESPAWNED.unshift(newRespawnedItem);
    } else {
      const respawnedCollection = db!.collection("respawned");
      await respawnedCollection.insertOne({
        ...newRespawnedItem,
        _id: respawnedId as any
      });
    }

    return NextResponse.json({
      status: "success",
      id: respawnedId,
      data: newRespawnedItem
    });

  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to save respawned record" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, currentStage, status } = data;

    if (!id) {
      return NextResponse.json({ status: "error", message: "Missing id" }, { status: 400 });
    }

    const { db, isMock } = await connectToDatabase();

    if (isMock) {
      const index = MOCK_RESPAWNED.findIndex(p => p.id === id);
      if (index !== -1) {
        if (currentStage !== undefined) MOCK_RESPAWNED[index].currentStage = currentStage;
        if (status !== undefined) MOCK_RESPAWNED[index].status = status;
      }
    } else {
      const respawnedCollection = db!.collection("respawned");
      const updateFields: any = {};
      if (currentStage !== undefined) updateFields.currentStage = currentStage;
      if (status !== undefined) updateFields.status = status;

      await respawnedCollection.updateOne(
        { _id: id as any },
        { $set: updateFields }
      );
    }

    return NextResponse.json({ status: "success" });

  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update tracking state" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { db, isMock } = await connectToDatabase();

    if (isMock) {
      return NextResponse.json({
        status: "success",
        data: MOCK_RESPAWNED
      });
    } else {
      const respawnedCollection = db!.collection("respawned");
      let items = await respawnedCollection.find({}).sort({ createdAt: -1 }).toArray();
      
      // Fallback to mock data if DB is empty for demo purposes
      if (items.length === 0) {
        return NextResponse.json({
          status: "success",
          data: MOCK_RESPAWNED
        });
      }

      // Map _id to id for consistency
      const mappedItems = items.map(item => ({
        ...item,
        id: item._id.toString()
      }));
      return NextResponse.json({
        status: "success",
        data: mappedItems
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}
