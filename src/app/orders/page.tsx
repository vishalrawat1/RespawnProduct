"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { ShoppingBag, Search, Package, ChevronRight, XCircle } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variation?: string;
}

interface Order {
  id: string;
  orderDate: string;
  totalAmount: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentMethod: string;
  deliverySpeed: string;
  status: "Ordered" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled" | "Returned";
  estimatedDelivery: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, addToCart } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search orders locally
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tracking timeline toggle states
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Return dialog states
  const [returningItem, setReturningItem] = useState<{ orderId: string; itemName: string } | null>(null);
  const [returnReason, setReturnReason] = useState("");

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders", {
          headers: {
            "x-user-name": user.name
          }
        });
        const data = await res.json();
        if (data.status === "success") {
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  const handleCancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order? You will receive a full refund within 2-3 business days.")) {
      setOrders(orders.map(o => {
        if (o.id === orderId) {
          return { ...o, status: "Cancelled" };
        }
        return o;
      }));
      alert("Order cancelled successfully.");
    }
  };

  const handleBuyAgain = (items: OrderItem[]) => {
    items.forEach(item => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        mrp: item.price * 1.2, // mock MRP
        quantity: item.quantity,
        image: item.image,
        variation: item.variation,
        isPrime: true
      });
    });
    alert("Added all items back to your shopping cart!");
  };

  const submitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) return;

    setOrders(orders.map(o => {
      if (o.id === returningItem?.orderId) {
        return { ...o, status: "Returned" };
      }
      return o;
    }));

    alert(`Return request submitted for "${returningItem?.itemName}". Reason: ${returnReason}. Please keep the package ready for pickup.`);
    setReturningItem(null);
    setReturnReason("");
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getTimelineSteps = (status: string) => {
    const steps = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];
    const activeIndex = steps.indexOf(status);
    return steps.map((s, idx) => ({
      name: s,
      completed: status === "Cancelled" || status === "Returned" ? false : idx <= activeIndex
    }));
  };

  return (
    <div className="orders-container">
      {/* Title */}
      <h1 style={{ fontSize: "24px", fontWeight: "500", marginBottom: "20px" }}>Your Orders</h1>

      {/* Local Orders Search Bar */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "25px" }}>
        <div style={{ flexGrow: 1, position: "relative" }}>
          <input 
            type="text" 
            placeholder="Search all orders by product name or order ID" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "10px 15px 10px 40px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "14px" }}
          />
          <Search size={18} color="#888" style={{ position: "absolute", left: "14px", top: "12px" }} />
        </div>
        <button className="btn-gray" style={{ padding: "10px 20px" }}>Search Orders</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>Loading your orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", textAlign: "center", border: "1px solid #ddd" }}>
          <ShoppingBag size={48} color="#ccc" style={{ margin: "0 auto 15px auto" }} />
          <h3>No orders found</h3>
          <p style={{ color: "#666", marginTop: "8px" }}>Looks like you haven't placed any orders yet or no match found.</p>
          <Link href="/" className="btn-primary" style={{ padding: "8px 16px", marginTop: "15px", display: "inline-block" }}>Shop Now</Link>
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div key={order.id} className="order-card">
            {/* Header section of card */}
            <div className="order-card-header">
              <div className="order-card-header-col">
                <span>ORDER PLACED</span>
                <span>{new Date(order.orderDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="order-card-header-col">
                <span>TOTAL</span>
                <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="order-card-header-col">
                <span>SHIP TO</span>
                <span style={{ cursor: "pointer", color: "#007185" }} title={order.shippingAddress.address}>
                  {order.shippingAddress.name}
                </span>
              </div>
              <div className="order-card-header-col" style={{ marginLeft: "auto", textAlign: "right" }}>
                <span>ORDER # {order.id}</span>
                <span>
                  <Link href={`#`} style={{ color: "#007185" }}>View order details</Link>
                </span>
              </div>
            </div>

            {/* Body section containing items and tracking buttons */}
            <div className="order-card-body">
              <div className="order-card-items">
                {/* Status message */}
                <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "15px", color: order.status === "Cancelled" ? "red" : order.status === "Returned" ? "orange" : "green" }}>
                  {order.status === "Delivered" && `Delivered on ${new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`}
                  {order.status === "Cancelled" && "Order Cancelled"}
                  {order.status === "Returned" && "Refund Processed (Item Returned)"}
                  {order.status !== "Delivered" && order.status !== "Cancelled" && order.status !== "Returned" && (
                    `Arriving by ${new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}`
                  )}
                </h3>

                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <Link href={`/products/${item.id}`}>
                      <div className="order-item-img" style={{ backgroundImage: `url(${item.image})` }}></div>
                    </Link>
                    <div className="order-item-info">
                      <Link href={`/products/${item.id}`} style={{ fontWeight: "700", fontSize: "14px", display: "block", marginBottom: "4px" }}>
                        {item.name}
                      </Link>
                      {item.variation && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Options: {item.variation}</div>}
                      <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>Quantity: {item.quantity}</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", marginTop: "4px" }}>₹{item.price.toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons Column */}
              <div className="order-card-actions">
                <button 
                  className="btn-primary" 
                  onClick={() => handleBuyAgain(order.items)}
                >
                  Buy it again
                </button>
                
                {order.status !== "Cancelled" && order.status !== "Returned" && (
                  <button 
                    className="btn-gray" 
                    onClick={() => setTrackingOrderId(trackingOrderId === order.id ? null : order.id)}
                  >
                    Track package
                  </button>
                )}

                {order.status !== "Cancelled" && order.status !== "Returned" && order.status !== "Delivered" && (
                  <button 
                    className="btn-gray" 
                    style={{ color: "red", borderColor: "#f5c0c0" }}
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </button>
                )}

                {order.status === "Delivered" && (
                  <button 
                    className="btn-gray" 
                    onClick={() => setReturningItem({ orderId: order.id, itemName: order.items[0].name })}
                  >
                    Return or replace items
                  </button>
                )}
                
                <Link href={`/products/${order.items[0].id}`} className="btn-gray" style={{ display: "block", textAlign: "center", padding: "10px", fontSize: "13px" }}>
                  Write a product review
                </Link>
              </div>
            </div>

            {/* Tracking Package Timeline Box */}
            {trackingOrderId === order.id && (
              <div style={{ padding: "20px", borderTop: "1px solid #eee", backgroundColor: "#fafafa" }}>
                <h4 style={{ fontWeight: "700", marginBottom: "12px", fontSize: "14px" }}>Delivery Progress</h4>
                <div className="order-timeline">
                  {getTimelineSteps(order.status).map((step, idx) => (
                    <div key={idx} className={`timeline-step ${step.completed ? "completed" : ""}`}>
                      <div className="timeline-step-dot"></div>
                      <span>{step.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Return Dialog */}
      {returningItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
          <form onSubmit={submitReturn} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", maxWidth: "450px", width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Return Item</h3>
              <button type="button" style={{ background: "none" }} onClick={() => setReturningItem(null)}><XCircle size={20} /></button>
            </div>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
              You are starting a return for <strong>{returningItem.itemName}</strong>.
            </p>
            
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="reasonSelect" style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Reason for return</label>
              <select 
                id="reasonSelect"
                value={returnReason} 
                onChange={(e) => setReturnReason(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }}
                required
              >
                <option value="">Choose a reason...</option>
                <option value="Defective / does not work">Defective / does not work</option>
                <option value="Damaged product packaging">Damaged product packaging</option>
                <option value="Item arrived too late">Item arrived too late</option>
                <option value="Bought by mistake">Bought by mistake</option>
                <option value="Performance not satisfactory">Performance not satisfactory</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="btn-gray" onClick={() => setReturningItem(null)} style={{ padding: "8px 16px" }}>Cancel</button>
              <button type="submit" className="btn-primary" style={{ padding: "8px 16px" }}>Submit Return</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
