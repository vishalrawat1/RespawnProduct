import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";

// Memory storage for Mock Mode
export const MOCK_ORDERS: any[] = [
  {
    id: "ord-1001",
    userName: "Vishal Rawat",
    items: [
      {
        id: "echo-dot-5",
        name: "Echo Dot (5th Gen) | Smart speaker with Alexa and deeper bass",
        price: 4499,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1543069027-d73630640aa3?w=500&auto=format&fit=crop&q=80",
        variation: "Color: Black"
      }
    ],
    totalAmount: 4499,
    shippingAddress: {
      name: "Vishal Rawat",
      pincode: "110001",
      address: "Flat 402, Sector 12, Dwarka",
      city: "New Delhi",
      state: "Delhi",
      phone: "9876543210"
    },
    paymentMethod: "UPI (Amazon Pay)",
    deliverySpeed: "Prime FREE One-Day Delivery",
    orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    status: "Delivered",
    estimatedDelivery: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET(req: NextRequest) {
  const userName = req.headers.get("x-user-name") || "Vishal Rawat";
  const { db, isMock } = await connectToDatabase();

  if (isMock) {
    const userOrders = MOCK_ORDERS.filter((o) => o.userName === userName);
    // Sort chronological: newest first
    userOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    return NextResponse.json({ status: "success", source: "mock", orders: userOrders });
  }

  try {
    const ordersCollection = db!.collection("orders");
    const orders = await ordersCollection.find({ userName }).sort({ orderDate: -1 }).toArray();

    // Map _id to id for consistency
    const mappedOrders = orders.map((o) => ({
      ...o,
      id: o.id || o._id.toString(),
    }));

    return NextResponse.json({ status: "success", source: "mongodb", orders: mappedOrders });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to retrieve orders." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userName = req.headers.get("x-user-name") || "Vishal Rawat";
  const body = await req.json();
  const { items, totalAmount, shippingAddress, paymentMethod, deliverySpeed } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ message: "No items in order" }, { status: 400 });
  }

  const orderId = "ord-" + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    id: orderId,
    userName,
    items,
    totalAmount,
    shippingAddress,
    paymentMethod,
    deliverySpeed,
    orderDate: new Date().toISOString(),
    status: "Ordered", // Timeline: Ordered -> Shipped -> Out for Delivery -> Delivered
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days from now
  };

  const { db, isMock } = await connectToDatabase();

  if (isMock) {
    MOCK_ORDERS.push(newOrder);
    return NextResponse.json({ status: "success", source: "mock", order: newOrder });
  }

  try {
    const ordersCollection = db!.collection("orders");
    await ordersCollection.insertOne(newOrder);

    return NextResponse.json({ status: "success", source: "mongodb", order: newOrder });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to place order." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, cancelReason, cancelDetails, returnReason, estimatedDelivery } = body;

    if (!orderId) {
      return NextResponse.json({ status: "error", message: "Order ID is required." }, { status: 400 });
    }

    const { db, isMock } = await connectToDatabase();

    if (isMock) {
      const idx = MOCK_ORDERS.findIndex((o) => o.id === orderId);
      if (idx !== -1) {
        if (status !== undefined) MOCK_ORDERS[idx].status = status;
        if (estimatedDelivery !== undefined) MOCK_ORDERS[idx].estimatedDelivery = estimatedDelivery;
        if (cancelReason !== undefined) MOCK_ORDERS[idx].cancelReason = cancelReason;
        if (cancelDetails !== undefined) MOCK_ORDERS[idx].cancelDetails = cancelDetails;
        if (returnReason !== undefined) MOCK_ORDERS[idx].returnReason = returnReason;
        return NextResponse.json({ status: "success", source: "mock", order: MOCK_ORDERS[idx] });
      }
      return NextResponse.json({ status: "error", message: "Order not found in mock storage." }, { status: 404 });
    }

    const ordersCollection = db!.collection("orders");
    const updateFields: any = {};
    if (status !== undefined) updateFields.status = status;
    if (estimatedDelivery !== undefined) updateFields.estimatedDelivery = estimatedDelivery;
    if (cancelReason !== undefined) updateFields.cancelReason = cancelReason;
    if (cancelDetails !== undefined) updateFields.cancelDetails = cancelDetails;
    if (returnReason !== undefined) updateFields.returnReason = returnReason;

    const result = await ordersCollection.updateOne(
      { id: orderId },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ status: "error", message: "Order not found in database." }, { status: 404 });
    }

    return NextResponse.json({ status: "success", source: "mongodb" });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message || "Failed to update order." },
      { status: 500 }
    );
  }
}
