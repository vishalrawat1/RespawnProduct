import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PRODUCTS, Product } from "@/lib/mockData";
import { MOCK_RESPAWNED } from "@/app/api/respawned/route";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const rating = parseFloat(searchParams.get("rating") || "0");
  const priceMin = parseFloat(searchParams.get("priceMin") || "0");
  const priceMax = parseFloat(searchParams.get("priceMax") || "999999999");
  const prime = searchParams.get("prime") === "true";
  const respawnOnly = searchParams.get("respawnOnly") === "true";
  const sort = searchParams.get("sort") || "featured";

  const { db, isMock } = await connectToDatabase();

  if (isMock) {
    // ----------------------------------------------------
    // MOCK MODE FALLBACK: Local JS filtering
    // ----------------------------------------------------
    const mappedRespawned: Product[] = MOCK_RESPAWNED.map((r: any) => ({
      id: r.id,
      name: r.name + " (Certified Refurbished)",
      description: `RESPawn AI Certified item from ${r.type}. Fully inspected. ID: ${r.productbuyid || r.id}`,
      price: r.price,
      mrp: r.price * 1.5,
      rating: 4.5,
      ratingCount: 1,
      category: "electronics",
      image: r.image,
      thumbnails: [r.image],
      variations: [],
      specs: { "Condition": "Refurbished", "Source": r.type },
      whatInBox: ["Refurbished Item", "Inspection Report"],
      isPrime: true,
      isBestSeller: false,
      isChoice: false,
      stock: 1,
      seller: "Respawn Certified Refurbished",
      reviews: [],
      qas: [],
      respawn: {
        isRespawned: true,
        healthCardId: r.healthCardId,
        grade: r.healthCardData?.grade || "A",
        currentStage: r.currentStage,
        status: r.status
      }
    }));

    let filtered = respawnOnly ? [...mappedRespawned] : [...mappedRespawned, ...PRODUCTS];

    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category === category);
    }

    if (brand) {
      filtered = filtered.filter((p) => p.specs?.["Brand"]?.toLowerCase() === brand.toLowerCase());
    }

    if (rating > 0) {
      filtered = filtered.filter((p) => p.rating >= rating);
    }

    if (priceMin > 0 || priceMax < 999999999) {
      filtered = filtered.filter((p) => p.price >= priceMin && p.price <= priceMax);
    }

    if (prime) {
      filtered = filtered.filter((p) => p.isPrime);
    }

    if (respawnOnly) {
      filtered = filtered.filter((p) => p.respawn?.isRespawned);
    }

    // Sorting
    if (sort === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === "rating-desc") {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === "newest") {
      // simulate newest by reversing or ID matching
      filtered.reverse();
    } else if (sort === "best-health") {
      filtered.sort((a, b) => {
        const gradeA = a.respawn?.grade || "Z";
        const gradeB = b.respawn?.grade || "Z";
        return gradeA.localeCompare(gradeB);
      });
    }

    return NextResponse.json({
      status: "success",
      source: "mock",
      products: filtered,
    });
  }

  // ----------------------------------------------------
  // MONGO DB MODE
  // ----------------------------------------------------
  try {
    const queryObj: any = {};

    // Search query
    if (q) {
      queryObj.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    // Filters
    if (category) {
      queryObj.category = category;
    }

    if (brand) {
      queryObj["specs.Brand"] = { $regex: new RegExp(`^${brand}$`, "i") };
    }

    if (rating > 0) {
      queryObj.rating = { $gte: rating };
    }

    if (priceMin > 0 || priceMax < 999999999) {
      queryObj.price = { $gte: priceMin, $lte: priceMax };
    }

    if (prime) {
      queryObj.isPrime = true;
    }

    if (respawnOnly) {
      queryObj["respawn.isRespawned"] = true;
    }

    const productsCollection = db!.collection("products");
    let queryCursor = productsCollection.find(queryObj);

    // Sorting
    if (sort === "price-asc") {
      queryCursor = queryCursor.sort({ price: 1 });
    } else if (sort === "price-desc") {
      queryCursor = queryCursor.sort({ price: -1 });
    } else if (sort === "rating-desc") {
      queryCursor = queryCursor.sort({ rating: -1 });
    } else if (sort === "newest") {
      queryCursor = queryCursor.sort({ _id: -1 });
    } else if (sort === "best-health") {
      queryCursor = queryCursor.sort({ "respawn.grade": 1 });
    }

    const products = await queryCursor.toArray();

    // Map _id to id for consistency in frontend
    let mappedProducts: any[] = products.map((p) => ({
      ...p,
      id: p.id || p._id.toString(),
    }));

    // Fetch and map from respawnedCollection
    const respawnedCollection = db!.collection("respawned");
    let respawnedItems = await respawnedCollection.find({}).toArray();
    
    // Fallback to MOCK_RESPAWNED if DB is empty for demo
    if (respawnedItems.length === 0) {
      respawnedItems = MOCK_RESPAWNED;
    }

    const mappedRespawnedProducts = respawnedItems.map((r: any) => ({
      id: r._id ? r._id.toString() : r.id,
      name: r.name + " (Certified Refurbished)",
      description: `RESPawn AI Certified item from ${r.type}. Fully inspected. ID: ${r.productbuyid || r.id}`,
      price: r.price,
      mrp: r.price * 1.5,
      rating: 4.5,
      ratingCount: 1,
      category: "electronics",
      image: r.image,
      thumbnails: [r.image],
      variations: [],
      specs: { "Condition": "Refurbished", "Source": r.type },
      whatInBox: ["Refurbished Item", "Inspection Report"],
      isPrime: true,
      isBestSeller: false,
      isChoice: false,
      stock: 1,
      seller: "Respawn Certified Refurbished",
      reviews: [],
      qas: [],
      respawn: {
        isRespawned: true,
        healthCardId: r.healthCardId,
        grade: r.healthCardData?.grade || "A",
        currentStage: r.currentStage,
        status: r.status
      }
    }));

    // Filter respawned items in memory based on query
    let filteredRespawned = mappedRespawnedProducts;
    if (q) {
      const qLower = q.toLowerCase();
      filteredRespawned = filteredRespawned.filter(p => p.name.toLowerCase().includes(qLower) || p.description.toLowerCase().includes(qLower));
    }
    // ...other filters can be applied similarly if needed

    if (respawnOnly) {
      mappedProducts = filteredRespawned;
    } else {
      mappedProducts = [...filteredRespawned, ...mappedProducts];
    }

    return NextResponse.json({
      status: "success",
      source: "mongodb",
      products: mappedProducts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to retrieve products from MongoDB." },
      { status: 500 }
    );
  }
}
