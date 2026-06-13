import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PRODUCTS } from "@/lib/mockData";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { db, isMock } = await connectToDatabase();

  if (isMock) {
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ status: "success", source: "mock", product });
  }

  try {
    const productsCollection = db!.collection("products");
    
    // Attempt to search by id field first, then by _id ObjectId
    let product = await productsCollection.findOne({ id });
    
    if (!product && ObjectId.isValid(id)) {
      product = await productsCollection.findOne({ _id: new ObjectId(id) });
    }

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Map _id to id for consistency
    const mappedProduct = {
      ...product,
      id: product.id || product._id.toString(),
    };

    return NextResponse.json({ status: "success", source: "mongodb", product: mappedProduct });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to retrieve product details." },
      { status: 500 }
    );
  }
}
