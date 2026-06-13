"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import {
  ShoppingBag, Search, XCircle, ChevronDown, ChevronUp,
  MapPin, Clock, CheckCircle, Circle, Package, Truck, Home, Star
} from "lucide-react";

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
  cancelReason?: string;
  cancelDetails?: string;
}

const STATUS_ORDER = ["Ordered", "Shipped", "Out for Delivery", "Delivered"];

const STAGE_ICONS: Record<string, React.ReactNode> = {
  "Ordered":         <Package size={16} />,
  "Shipped":         <Truck size={16} />,
  "Out for Delivery":<MapPin size={16} />,
  "Delivered":       <Home size={16} />,
};

export default function OrdersPage() {
  const { user, addToCart } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");

  // Which order's track panel is open
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  // Which stage accordion is open inside the track panel  {orderId: stageName}
  const [openStage, setOpenStage] = useState<{ orderId: string; stage: string } | null>(null);

  // Return dialog
  const [returningItem, setReturningItem] = useState<{ orderId: string; itemName: string } | null>(null);
  const [returnReason, setReturnReason] = useState("");

  // Cancellation dialog
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelComment, setCancelComment] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch("/api/orders", {
          headers: { "x-user-name": user.name }
        });
        const data = await res.json();
        if (data.status === "success") setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user]);

  /* ── helpers ── */

  const getDaysLeft = (estimatedDelivery: string) => {
    const diff = new Date(estimatedDelivery).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    return `${days} days`;
  };

  const getStageDate = (order: Order, stageIdx: number) => {
    const orderDate = new Date(order.orderDate).getTime();
    const estDate   = new Date(order.estimatedDelivery).getTime();
    // Fixed short offsets: Ordered=0h, Shipped=+18h, Out for Delivery=+36h, Delivered=estimatedDelivery
    const offsets   = [0, 18 * 3600 * 1000, 36 * 3600 * 1000, estDate - orderDate];
    return new Date(orderDate + offsets[stageIdx])
      .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  /** Info shown inside each accordion panel */
  const getStageDetail = (order: Order, stage: string, stageIdx: number) => {
    const city    = order.shippingAddress.city    || "New Delhi";
    const pincode = order.shippingAddress.pincode || "110001";
    const address = order.shippingAddress.address || "Customer Address";
    const date    = getStageDate(order, stageIdx);
    const daysLeft = getDaysLeft(order.estimatedDelivery);

    switch (stage) {
      case "Ordered":
        return {
          facility: "Mumbai Fulfillment Center, Maharashtra",
          description: "Your order has been confirmed and is being packed at our Mumbai warehouse. It will be handed over to the courier within 18 hours.",
          eta: `📦 Shipping starts within 18 hrs  •  Estimated delivery in ${daysLeft}`,
          date,
        };
      case "Shipped":
        return {
          facility: "Delhi NCR Regional Sorting Hub, Okhla Phase II",
          description: "Package picked up from warehouse and in transit. It reached the Delhi sorting hub ~18 hrs after order and will be dispatched to your city hub within the next 18 hrs.",
          eta: `🚚 Dispatched to local hub within 18 hrs  •  Arriving in ${daysLeft}`,
          date,
        };
      case "Out for Delivery":
        return {
          facility: `Local Delivery Hub — ${city} (PIN: ${pincode})`,
          description: `Your package arrived at the ${city} local hub ~36 hrs after order. Our delivery partner is heading to your address now.`,
          eta: daysLeft === "Today" ? "🛵 Arriving Today!" : `🛵 Arriving ${daysLeft}`,
          date,
        };
      case "Delivered":
        return {
          facility: `${address}, ${city} — ${pincode}`,
          description: "Package successfully handed over to the recipient at the delivery address.",
          eta: `✅ Delivered on ${new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`,
          date,
        };
      default:
        return { facility: "", description: "", eta: "", date };
    }
  };

  /* ── actions ── */

  const submitCancellation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrderId || !cancelReason.trim()) return;
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cancellingOrderId, status: "Cancelled", cancelReason, cancelDetails: cancelComment })
      });
      const data = await res.json();
      if (data.status === "success") {
        setOrders(orders.map(o => o.id === cancellingOrderId
          ? { ...o, status: "Cancelled", cancelReason, cancelDetails: cancelComment } : o));
        alert("Order cancelled successfully.");
      } else alert("Failed to cancel order: " + data.message);
    } catch { alert("Failed to cancel order."); }
    finally { setCancellingOrderId(null); setCancelReason(""); setCancelComment(""); }
  };

  const handleBuyAgain = (items: OrderItem[]) => {
    items.forEach(item => addToCart({ id: item.id, name: item.name, price: item.price, mrp: item.price * 1.2, quantity: item.quantity, image: item.image, variation: item.variation, isPrime: true }));
    alert("Added all items back to your shopping cart!");
  };

  const submitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim() || !returningItem) return;
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: returningItem.orderId, status: "Returned", returnReason })
      });
      const data = await res.json();
      if (data.status === "success") {
        setOrders(orders.map(o => o.id === returningItem?.orderId ? { ...o, status: "Returned" } : o));
        alert(`Return request submitted for "${returningItem?.itemName}". Reason: ${returnReason}. Please keep the package ready for pickup.`);
      } else alert("Failed to submit return: " + data.message);
    } catch { alert("Failed to submit return."); }
    finally { setReturningItem(null); setReturnReason(""); }
  };

  const toggleStage = (orderId: string, stage: string) => {
    setOpenStage(prev =>
      prev?.orderId === orderId && prev.stage === stage ? null : { orderId, stage }
    );
  };

  const filteredOrders = orders.filter(o =>
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /* ── render ── */

  return (
    <div className="orders-container">
      <h1 style={{ fontSize: "24px", fontWeight: "500", marginBottom: "20px" }}>Your Orders</h1>

      {/* Search */}
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
        filteredOrders.map((order) => {
          const currentStageIdx = STATUS_ORDER.indexOf(order.status);
          const isTrackingOpen  = trackingOrderId === order.id;

          return (
            <div key={order.id} className="order-card">
              {/* ── Card Header ── */}
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
                  <span><Link href="#" style={{ color: "#007185" }}>View order details</Link></span>
                </div>
              </div>

              {/* ── Card Body ── */}
              <div className="order-card-body">
                <div className="order-card-items">
                  {/* Status headline */}
                  <div style={{ marginBottom: "15px" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: order.status === "Cancelled" ? "red" : order.status === "Returned" ? "orange" : "green", margin: 0 }}>
                      {order.status === "Delivered"      && `Delivered on ${new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`}
                      {order.status === "Cancelled"      && "Order Cancelled"}
                      {order.status === "Returned"       && "Refund Processed (Item Returned)"}
                      {!["Delivered","Cancelled","Returned"].includes(order.status) && (
                        `Arriving by ${new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}`
                      )}
                    </h3>
                    {order.status === "Cancelled" && order.cancelReason && (
                      <div style={{ fontSize: "13px", color: "#666", marginTop: "5px", padding: "8px 12px", borderLeft: "3px solid red", backgroundColor: "#fff5f5" }}>
                        <strong>Cancellation Reason:</strong> {order.cancelReason}
                        {order.cancelDetails && ` (${order.cancelDetails})`}
                      </div>
                    )}
                  </div>

                  {/* Item rows */}
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <Link href={`/products/${item.id}`}>
                        <div className="order-item-img" style={{ backgroundImage: `url(${item.image})` }} />
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

                {/* ── Action Buttons ── */}
                <div className="order-card-actions">
                  <button className="btn-primary" onClick={() => handleBuyAgain(order.items)}>Buy it again</button>

                  {order.status !== "Cancelled" && order.status !== "Returned" && (
                    <button
                      className="btn-gray"
                      onClick={() => {
                        setTrackingOrderId(isTrackingOpen ? null : order.id);
                        setOpenStage(null);
                      }}
                    >
                      {isTrackingOpen ? "Hide tracking" : "Track package"}
                    </button>
                  )}

                  {!["Cancelled","Returned","Delivered"].includes(order.status) && (
                    <button className="btn-gray" style={{ color: "red", borderColor: "#f5c0c0" }} onClick={() => setCancellingOrderId(order.id)}>
                      Cancel Order
                    </button>
                  )}

                  {order.status === "Delivered" && (
                    <button className="btn-gray" onClick={() => setReturningItem({ orderId: order.id, itemName: order.items[0].name })}>
                      Return or replace items
                    </button>
                  )}

                  <Link href={`/products/${order.items[0].id}`} className="btn-gray" style={{ display: "block", textAlign: "center", padding: "10px", fontSize: "13px" }}>
                    Write a product review
                  </Link>
                </div>
              </div>

              {/* ════════════════════════════════════════════
                  TRACKING ACCORDION PANEL
              ════════════════════════════════════════════ */}
              {isTrackingOpen && (
                <div style={{ borderTop: "1px solid #e0e0e0", backgroundColor: "#f9f9f9", padding: "20px 24px" }}>
                  <h4 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "#111" }}>
                    📦 Shipment Tracking
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
                    {STATUS_ORDER.map((stage, idx) => {
                      const isCompleted = currentStageIdx >= idx;
                      const isCurrent   = currentStageIdx === idx;
                      const isUpcoming  = currentStageIdx < idx;
                      const isOpen      = openStage?.orderId === order.id && openStage.stage === stage;
                      const detail      = getStageDetail(order, stage, idx);
                      const isLastItem  = idx === STATUS_ORDER.length - 1;

                      return (
                        <div key={stage} style={{ position: "relative" }}>
                          {/* Vertical connector line */}
                          {!isLastItem && (
                            <div style={{
                              position: "absolute",
                              left: "19px",
                              top: "44px",
                              width: "2px",
                              height: isOpen ? "calc(100% - 16px)" : "28px",
                              backgroundColor: isCompleted ? "#ff9900" : "#ddd",
                              zIndex: 0,
                              transition: "height 0.3s ease"
                            }} />
                          )}

                          {/* Stage Row — ALL stages are clickable */}
                          <button
                            onClick={() => toggleStage(order.id, stage)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              width: "100%",
                              background: isOpen ? "rgba(255,153,0,0.04)" : "none",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              padding: "10px 8px",
                              position: "relative",
                              zIndex: 1,
                              textAlign: "left",
                              transition: "background 0.15s ease"
                            }}
                          >
                            {/* Status dot */}
                            <div style={{
                              width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              backgroundColor: isUpcoming ? "#f0f0f0" : isCurrent ? "#ff9900" : "#4caf50",
                              color: "#fff",
                              border: isUpcoming ? "2px dashed #bbb" : "none",
                              boxShadow: isCurrent ? "0 0 0 4px rgba(255,153,0,0.2)" : "none",
                              transition: "all 0.2s ease"
                            }}>
                              {isUpcoming
                                ? <Circle size={10} color="#bbb" />
                                : isCurrent
                                  ? <span style={{ fontSize: "10px", fontWeight: "bold" }}>●</span>
                                  : <CheckCircle size={12} />}
                            </div>

                            {/* Stage label */}
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                <span style={{
                                  fontSize: "13px",
                                  fontWeight: isCurrent || isCompleted ? "700" : "500",
                                  color: isUpcoming ? "#888" : isCurrent ? "#cc7000" : "#111"
                                }}>
                                  {STAGE_ICONS[stage]}&nbsp;&nbsp;{stage}
                                </span>
                                {isCurrent && (
                                  <span style={{ fontSize: "11px", backgroundColor: "#fff3cd", color: "#856404", padding: "1px 8px", borderRadius: "12px", fontWeight: "600" }}>
                                    ● Current
                                  </span>
                                )}
                                {isCompleted && !isCurrent && (
                                  <span style={{ fontSize: "11px", backgroundColor: "#d4edda", color: "#155724", padding: "1px 8px", borderRadius: "12px", fontWeight: "600" }}>
                                    ✓ Done
                                  </span>
                                )}
                                {isUpcoming && (
                                  <span style={{ fontSize: "11px", backgroundColor: "#f0f0f0", color: "#888", padding: "1px 8px", borderRadius: "12px", fontWeight: "500" }}>
                                    Upcoming
                                  </span>
                                )}
                              </div>
                              {isCompleted && (
                                <div style={{ fontSize: "11px", color: "#888", marginTop: "2px" }}>{getStageDate(order, idx)}</div>
                              )}
                              {isUpcoming && (
                                <div style={{ fontSize: "11px", color: "#bbb", marginTop: "2px", fontStyle: "italic" }}>Click to preview this stage</div>
                              )}
                            </div>

                            {/* Chevron — always shown */}
                            <span style={{ color: isUpcoming ? "#ccc" : "#888", marginRight: "4px" }}>
                              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </span>
                          </button>

                          {/* ── Expanded Stage Panel ── */}
                          {isOpen && (
                            <div style={{
                              marginLeft: "32px",
                              marginBottom: "10px",
                              backgroundColor: "#fff",
                              border: "1px solid #e8e8e8",
                              borderRadius: "8px",
                              padding: "16px",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                            }}>
                              {/* Facility */}
                              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "10px" }}>
                                <MapPin size={15} color="#ff9900" style={{ marginTop: "2px", flexShrink: 0 }} />
                                <div>
                                  <div style={{ fontSize: "11px", color: "#888", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Facility / Location</div>
                                  <div style={{ fontSize: "13px", fontWeight: "700", color: "#111", marginTop: "2px" }}>{detail.facility}</div>
                                </div>
                              </div>

                              {/* Description */}
                              <div style={{ fontSize: "13px", color: "#555", marginBottom: "10px", lineHeight: "1.5" }}>
                                {detail.description}
                              </div>

                              {/* ETA / delivery info — only for non-delivered */}
                              {stage !== "Delivered" && (
                                <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "8px 12px", backgroundColor: "#fff8ed", borderRadius: "6px", border: "1px solid #ffe0a0" }}>
                                  <Clock size={14} color="#e07b00" />
                                  <span style={{ fontSize: "13px", color: "#a05c00", fontWeight: "600" }}>{detail.eta}</span>
                                </div>
                              )}

                              {/* ── Delivered stage: review + return actions ── */}
                              {stage === "Delivered" && (
                                <div>
                                  <div style={{ padding: "8px 12px", backgroundColor: "#eaf6ea", borderRadius: "6px", border: "1px solid #b2dfb2", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <CheckCircle size={14} color="#2e7d32" />
                                    <span style={{ fontSize: "13px", color: "#1b5e20", fontWeight: "600" }}>{detail.eta}</span>
                                  </div>

                                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#444", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Post-Delivery Actions</div>
                                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    <Link
                                      href={`/products/${order.items[0].id}`}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: "5px",
                                        padding: "7px 14px", backgroundColor: "#ff9900", color: "#111",
                                        borderRadius: "20px", fontSize: "12px", fontWeight: "700", textDecoration: "none"
                                      }}
                                    >
                                      <Star size={13} /> Write a Review
                                    </Link>

                                    <button
                                      onClick={() => setReturningItem({ orderId: order.id, itemName: order.items[0].name })}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: "5px",
                                        padding: "7px 14px", backgroundColor: "#fff", color: "#0066c0",
                                        border: "1px solid #0066c0", borderRadius: "20px", fontSize: "12px", fontWeight: "700", cursor: "pointer"
                                      }}
                                    >
                                      Return / Replace
                                    </button>

                                    <button
                                      onClick={() => handleBuyAgain(order.items)}
                                      style={{
                                        display: "inline-flex", alignItems: "center", gap: "5px",
                                        padding: "7px 14px", backgroundColor: "#fff", color: "#111",
                                        border: "1px solid #ccc", borderRadius: "20px", fontSize: "12px", fontWeight: "700", cursor: "pointer"
                                      }}
                                    >
                                      Buy Again
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Return Dialog ── */}
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
              <select id="reasonSelect" value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }} required>
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

      {/* ── Cancellation Dialog ── */}
      {cancellingOrderId && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1001 }}>
          <form onSubmit={submitCancellation} style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", maxWidth: "450px", width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700" }}>Cancel Order</h3>
              <button type="button" style={{ background: "none" }} onClick={() => setCancellingOrderId(null)}><XCircle size={20} /></button>
            </div>
            <p style={{ fontSize: "13px", color: "#666", marginBottom: "15px" }}>
              Please specify the reason for cancelling order <strong>#{cancellingOrderId}</strong>.
            </p>
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="cancelReasonSelect" style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Reason for cancellation</label>
              <select id="cancelReasonSelect" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px" }} required>
                <option value="">Choose a reason...</option>
                <option value="Order created by mistake">Order created by mistake</option>
                <option value="Item price is too high / found a cheaper alternative">Item price is too high / found a cheaper alternative</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
                <option value="Incorrect shipping address selected">Incorrect shipping address selected</option>
                <option value="Change of mind">Change of mind</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label htmlFor="cancelCommentTextArea" style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "4px" }}>Additional details (optional)</label>
              <textarea id="cancelCommentTextArea" value={cancelComment} onChange={(e) => setCancelComment(e.target.value)}
                placeholder="Please share more details about your cancellation request..."
                style={{ width: "100%", height: "80px", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "13px", resize: "none" }} />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button type="button" className="btn-gray" onClick={() => setCancellingOrderId(null)} style={{ padding: "8px 16px" }}>Close</button>
              <button type="submit" className="btn-primary" style={{ padding: "8px 16px" }}>Confirm Cancellation</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
