import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PRODUCTS, Product } from "@/lib/mockData";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { item, type } = data; // from RespawnTracker state

    const newProductId = `respawn-${item.id}-${Date.now()}`;
    // Use the real AI assessment ID if passed (e.g. "RET-NN3NJUDJ3")
    // This must match what was saved in /api/healthcards
    const healthCardId = item.healthCardId || newProductId;

    const newProduct: Product = {
      id: newProductId,
      name: `${item.name} - Certified Refurbished`,
      description: `RESPawn AI Certified item from a ${type === "p2p" ? "local peer transfer" : "manufacturer refurbishment"}. Fully inspected.`,
      price: item.price,
      mrp: item.price > 1000 ? 29990 : item.price * 10,
      rating: 4.5,
      ratingCount: 1,
      category: "electronics",
      image: item.image,
      thumbnails: [item.image],
      variations: [],
      specs: { "Condition": "Refurbished", "Source": type },
      whatInBox: ["Refurbished Item", "Charging Cable", "Inspection Report"],
      isPrime: true,
      isBestSeller: false,
      isChoice: false,
      stock: 1,
      seller: "Respawn Certified Refurbished",
      reviews: [],
      qas: [],
      respawn: {
        isRespawned: true,
        healthCardId: healthCardId,  // real AI assessment ID
        grade: "A",
        currentStage: data.currentStage || 1,
        status: data.status || "routing"
      }
    };

    const { db, isMock } = await connectToDatabase();

    if (isMock) {
      PRODUCTS.push(newProduct);
    } else {
      const productsCollection = db!.collection("products");
      await productsCollection.insertOne({
        ...newProduct,
        _id: newProductId as any
      });
    }

    return NextResponse.json({
      status: "success",
      productId: newProductId
    });

  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to save respawn product" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { productId, currentStage, status } = data;

    if (!productId) {
      return NextResponse.json({ status: "error", message: "Missing productId" }, { status: 400 });
    }

    const { db, isMock } = await connectToDatabase();

    if (isMock) {
      const productIndex = PRODUCTS.findIndex(p => p.id === productId);
      if (productIndex !== -1 && PRODUCTS[productIndex].respawn) {
        if (currentStage !== undefined) PRODUCTS[productIndex].respawn.currentStage = currentStage;
        if (status !== undefined) PRODUCTS[productIndex].respawn.status = status;
      }
    } else {
      const productsCollection = db!.collection("products");
      const updateFields: any = {};
      if (currentStage !== undefined) updateFields["respawn.currentStage"] = currentStage;
      if (status !== undefined) updateFields["respawn.status"] = status;

      await productsCollection.updateOne(
        { $or: [{ _id: productId }, { id: productId }] },
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
