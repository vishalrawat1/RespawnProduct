import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PRODUCTS, Product } from "@/lib/mockData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const rating = parseFloat(searchParams.get("rating") || "0");
  const priceMin = parseFloat(searchParams.get("priceMin") || "0");
  const priceMax = parseFloat(searchParams.get("priceMax") || "999999999");
  const prime = searchParams.get("prime") === "true";
  const sort = searchParams.get("sort") || "featured";

  const { db, isMock } = await connectToDatabase();

  if (isMock) {
    // ----------------------------------------------------
    // MOCK MODE FALLBACK: Local JS filtering
    // ----------------------------------------------------
    let filtered = [...PRODUCTS];

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
    }

    const products = await queryCursor.toArray();

    // Map _id to id for consistency in frontend
    const mappedProducts = products.map((p) => ({
      ...p,
      id: p.id || p._id.toString(),
    }));

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
