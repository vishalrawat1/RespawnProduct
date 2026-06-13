"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { 
  ShoppingBag, 
  Search, 
  ChevronRight, 
  XCircle, 
  Upload, 
  Cpu, 
  ShieldCheck, 
  BarChart3, 
  History, 
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  CheckCircle,
  Circle,
  Package,
  Truck,
  Home,
  Star
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

  // Return Intake States (AI-driven returns)
  const [returningItem, setReturningItem] = useState<{ 
    orderId: string; 
    productId: string; 
    itemName: string; 
    itemImage: string; 
  } | null>(null);

  const [respawnItem, setRespawnItem] = useState<{
    orderId: string;
    productId: string;
    itemName: string;
    itemImage: string;
  } | null>(null);
  
  const [returnReason, setReturnReason] = useState("");
  const [comments, setComments] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // AI Scanner Steps
  const [wizardStep, setWizardStep] = useState<"intake" | "scanning" | "report">("intake");
  const [scanningProgress, setScanningProgress] = useState(0);
  const [scanningMessage, setScanningMessage] = useState("");
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

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

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.status === "success") {
        setOrders(prevOrders => 
          prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        );
      } else {
        alert("Failed to update status: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleBuyAgain = (items: OrderItem[]) => {
    items.forEach(item => addToCart({ id: item.id, name: item.name, price: item.price, mrp: item.price * 1.2, quantity: item.quantity, image: item.image, variation: item.variation, isPrime: true }));
    alert("Added all items back to your shopping cart!");
  };

  // Handle mock photo upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setSelectedPhotos(prev => [...prev, reader.result as string].slice(0, 5));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Initiate AI return scanning
  const startAIScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (returnReason !== "defective_damaged" && selectedPhotos.length < 3) {
      alert("Please upload at least 3 photos for the AI Quality Inspector.");
      return;
    }

    setWizardStep("scanning");
    setScanningProgress(5);
    setScanningMessage("Connecting to AI inspector server...");

    // Simulated progress timer alongside real fetch
    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        const next = prev + Math.floor(Math.random() * 15) + 5;
        
        // Update scanning status text dynamically
        if (next < 25) setScanningMessage("Extracting 3D seam contours & boundaries...");
        else if (next < 50) setScanningMessage("Matching RGB dye histograms with factory specifications...");
        else if (next < 75) setScanningMessage("Querying customer purchase & size history database...");
        else if (next < 90) setScanningMessage("Detecting scuffs, packaging integrity & tag presence...");
        else setScanningMessage("Calculating final grading and validation scores...");
        
        return Math.min(next, 95);
      });
    }, 200);

    try {
      const res = await fetch("/api/returns/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderId: returningItem?.orderId,
          productId: returningItem?.productId,
          userId: user.id,
          returnReason: returnReason,
          comments: comments,
          uploadedImages: selectedPhotos.length > 0 
            ? selectedPhotos.map((_, idx) => `image_${idx + 1}.jpg`) 
            : ["defective_claim.jpg"]
        })
      });

      const data = await res.json();
      clearInterval(interval);

      if (data.status === "success" && data.assessment) {
        setScanningProgress(100);
        setScanningMessage("Analysis complete.");
        setAssessmentResult(data.assessment);
        
        // Save back locally to sync the UI list
        setOrders(prevOrders => 
          prevOrders.map(o => {
            if (o.id === returningItem?.orderId) {
              return { ...o, status: "Returned" };
            }
            return o;
          })
        );
        
        setWizardStep("report");
      } else {
        alert("AI Returns inspection failed: " + data.message);
        setWizardStep("intake");
      }
    } catch (err) {
      clearInterval(interval);
      console.error(err);
      alert("An error occurred during AI analysis.");
      setWizardStep("intake");
    }
  };

  const closeReturnWizard = () => {
    setReturningItem(null);
    setReturnReason("");
    setComments("");
    setSelectedPhotos([]);
    setWizardStep("intake");
    setAssessmentResult(null);
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

  // Helper colors for Quality Grade Badges
  const getGradeStyle = (grade: string) => {
    switch(grade) {
      case "A+":
      case "A":
        return { color: "green", background: "#e6f4ea", border: "1px solid #137333" };
      case "B+":
      case "B":
        return { color: "#b06000", background: "#fef7e0", border: "1px solid #f29900" };
      case "C":
      case "D":
        return { color: "#c5221f", background: "#fce8e6", border: "1px solid #c5221f" };
      default:
        return { color: "#fff", background: "#3c4043", border: "1px solid #202124" };
    }
  };

  return (
    <div className="orders-container">
      {/* Dynamic scan line CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanline {
          0% { top: 0%; opacity: 0.8; }
          50% { top: 100%; opacity: 0.8; }
          100% { top: 0%; opacity: 0.8; }
        }
        .scanner-container {
          position: relative;
          overflow: hidden;
        }
        .scanner-line {
          position: absolute;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(to right, rgba(255, 153, 0, 0) 10%, rgba(255, 153, 0, 1) 50%, rgba(255, 153, 0, 0) 90%);
          box-shadow: 0 0 10px rgba(255, 153, 0, 0.8);
          animation: scanline 2s infinite ease-in-out;
          z-index: 10;
        }
      `}} />

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
                      {order.status === "Returned"       && "Refund Processed (Item Returned via AI)"}
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

                  {order.status === "Delivered" && (() => {
                    const deliveryDate = new Date(order.estimatedDelivery);
                    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                    const isWithin7Days = daysSinceDelivery <= 7;

                    if (isWithin7Days) {
                      return (
                        <button 
                          className="btn-gray" 
                          onClick={() => setReturningItem({ 
                            orderId: order.id, 
                            productId: order.items[0].id,
                            itemName: order.items[0].name,
                            itemImage: order.items[0].image
                          })}
                        >
                          Return or replace items
                        </button>
                      );
                    } else {
                      return (
                        <button 
                          style={{
                            background: "linear-gradient(135deg, #111 0%, #2c3e50 100%)",
                            color: "#fff",
                            fontWeight: "700",
                            border: "none",
                            borderRadius: "3px",
                            padding: "8px 12px",
                            cursor: "pointer",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px"
                          }}
                          onClick={() => setRespawnItem({ 
                            orderId: order.id, 
                            productId: order.items[0].id,
                            itemName: order.items[0].name,
                            itemImage: order.items[0].image
                          })}
                        >
                          ♻️ RESPawn
                        </button>
                      );
                    }
                  })()}

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

                  {/* Simulation Dropdown */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                    padding: "12px 16px",
                    backgroundColor: "#fff",
                    border: "1px solid #ff9900",
                    borderRadius: "6px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}>
                    <div>
                      <strong style={{ fontSize: "13px", color: "#111", display: "block" }}>⚙️ Package Simulation</strong>
                      <span style={{ fontSize: "11px", color: "#666" }}>Change package stage to simulate delivery.</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "4px",
                          border: "1px solid #ff9900",
                          fontSize: "12px",
                          fontWeight: "700",
                          backgroundColor: "#fff",
                          color: "#111",
                          cursor: "pointer",
                          outline: "none"
                        }}
                      >
                        <option value="Ordered">Ordered</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>

                      {order.status === "Delivered" && (() => {
                        const deliveryDate = new Date(order.estimatedDelivery);
                        const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                        const isWithin7Days = daysSinceDelivery <= 7;
                        return (
                          <select
                            value={isWithin7Days ? "within" : "after"}
                            onChange={async (e) => {
                              const daysAgo = e.target.value === "within" ? 2 : 10;
                              const newEstDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
                              try {
                                const res = await fetch("/api/orders", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ orderId: order.id, estimatedDelivery: newEstDate })
                                });
                                const data = await res.json();
                                if (data.status === "success") {
                                  setOrders(prev => prev.map(o => o.id === order.id ? { ...o, estimatedDelivery: newEstDate } : o));
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            style={{
                              padding: "6px 12px",
                              borderRadius: "4px",
                              border: "1px solid #ff9900",
                              fontSize: "12px",
                              fontWeight: "700",
                              backgroundColor: "#fff",
                              color: "#111",
                              cursor: "pointer",
                              outline: "none"
                            }}
                          >
                            <option value="within">Within 7 Days (Return Period)</option>
                            <option value="after">After 7 Days (Unlock RESPawn)</option>
                          </select>
                        );
                      })()}
                    </div>
                  </div>

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

                                    {(() => {
                                      const deliveryDate = new Date(order.estimatedDelivery);
                                      const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
                                      const isWithin7Days = daysSinceDelivery <= 7;

                                      if (isWithin7Days) {
                                        return (
                                          <button
                                            onClick={() => setReturningItem({ 
                                              orderId: order.id, 
                                              productId: order.items[0].id,
                                              itemName: order.items[0].name, 
                                              itemImage: order.items[0].image 
                                            })}
                                            style={{
                                              display: "inline-flex", alignItems: "center", gap: "5px",
                                              padding: "7px 14px", backgroundColor: "#fff", color: "#0066c0",
                                              border: "1px solid #0066c0", borderRadius: "20px", fontSize: "12px", fontWeight: "700", cursor: "pointer"
                                            }}
                                          >
                                            Return / Replace
                                          </button>
                                        );
                                      } else {
                                        return (
                                          <button
                                            onClick={() => setRespawnItem({ 
                                              orderId: order.id, 
                                              productId: order.items[0].id,
                                              itemName: order.items[0].name, 
                                              itemImage: order.items[0].image 
                                            })}
                                            style={{
                                              display: "inline-flex", alignItems: "center", gap: "5px",
                                              padding: "7px 14px", background: "linear-gradient(135deg, #111 0%, #2c3e50 100%)", color: "#fff",
                                              border: "none", borderRadius: "20px", fontSize: "12px", fontWeight: "700", cursor: "pointer",
                                              boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
                                            }}
                                          >
                                            ♻️ RESPawn
                                          </button>
                                        );
                                      }
                                    })()}

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

      {/* ========================================================
          SECURE AI RETURNS QUALITY INSPECTOR WIZARD MODAL
         ======================================================== */}
      {returningItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", borderRadius: "10px", maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 40px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column" }}>
            
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #eee" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu color="var(--amazon-orange)" size={22} /> Secure AI-Driven Return Assessment
              </h3>
              {wizardStep !== "scanning" && (
                <button type="button" style={{ background: "none", cursor: "pointer" }} onClick={closeReturnWizard}><XCircle size={20} /></button>
              )}
            </div>

            {/* Step 1: Intake Form */}
            {wizardStep === "intake" && (
              <form onSubmit={startAIScan} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ display: "flex", gap: "12px", border: "1px solid #eee", padding: "10px", borderRadius: "6px", backgroundColor: "#f9f9f9" }}>
                  <div style={{ width: "50px", height: "50px", backgroundImage: `url(${returningItem.itemImage})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}></div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#666", display: "block" }}>Returning item from Order #{returningItem.orderId}</span>
                    <strong style={{ fontSize: "13px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textOverflow: "ellipsis" }}>{returningItem.itemName}</strong>
                  </div>
                </div>

                {/* Reason Select */}
                <div>
                  <label htmlFor="reasonSelect" style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Select return reason:</label>
                  <select 
                    id="reasonSelect"
                    value={returnReason} 
                    onChange={(e) => setReturnReason(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px" }}
                    required
                  >
                    <option value="">Choose a reason...</option>
                    <option value="color_difference">Color mismatch / faded look</option>
                    <option value="size_issue">Size issue / incorrect fit</option>
                    <option value="defective_damaged">Defective / damaged item</option>
                    <option value="changed_mind">Changed mind / no longer needed</option>
                    <option value="mistake_cheaper_late">Ordered by mistake / late delivery</option>
                  </select>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>
                    Upload 3 to 5 Photos for Quality Analysis: <span style={{ fontWeight: "400", color: "red" }}>*</span>
                  </label>
                  
                  <div 
                    style={{ 
                      border: "2px dashed #ccc", 
                      padding: "20px 10px", 
                      borderRadius: "6px", 
                      textAlign: "center", 
                      backgroundColor: isDragging ? "#fff3e0" : "#fafafa",
                      cursor: "pointer"
                    }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files) {
                        const filesArray = Array.from(e.dataTransfer.files);
                        filesArray.forEach(file => {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === "string") {
                              setSelectedPhotos(prev => [...prev, reader.result as string].slice(0, 5));
                            }
                          };
                          reader.readAsDataURL(file);
                        });
                      }
                    }}
                  >
                    <input 
                      type="file" 
                      id="ai-photos" 
                      multiple 
                      accept="image/*" 
                      style={{ display: "none" }} 
                      onChange={handlePhotoSelect}
                    />
                    <label htmlFor="ai-photos" style={{ cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                      <Upload size={28} color="#888" />
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "#007185" }}>Drag photos here or click to browse</span>
                      <span style={{ fontSize: "11px", color: "#666" }}>JPEG, PNG formats supported. Please provide angles showing tags, joints & colors.</span>
                    </label>
                  </div>

                  {/* Thumbnail Previews */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                    {selectedPhotos.map((url, idx) => (
                      <div key={idx} style={{ position: "relative", width: "70px", height: "70px", border: "1px solid #ddd", borderRadius: "4px", backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                        <button 
                          type="button" 
                          style={{ position: "absolute", top: "-5px", right: "-5px", background: "white", borderRadius: "50%", border: "1px solid #ccc", padding: "1px", cursor: "pointer" }}
                          onClick={() => setSelectedPhotos(selectedPhotos.filter((_, i) => i !== idx))}
                        >
                          <XCircle size={14} color="red" />
                        </button>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 3 - selectedPhotos.length) }).map((_, idx) => (
                      <div key={idx} style={{ width: "70px", height: "70px", border: "1px dashed #ccc", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "11px", backgroundColor: "#fafafa" }}>
                        Slot {selectedPhotos.length + idx + 1}
                      </div>
                    ))}
                  </div>
                   <span style={{ display: "block", marginTop: "6px", fontSize: "11px", color: returnReason === "defective_damaged" || selectedPhotos.length >= 3 ? "green" : "#b06000", fontWeight: "600" }}>
                    {returnReason === "defective_damaged" 
                      ? "✓ Defective Claim: Photos optional. Product will route directly to the manufacturer."
                      : `${selectedPhotos.length} / 5 photos uploaded. (Minimum 3 required)`
                    }
                  </span>
                </div>

                {/* Additional Comments */}
                <div>
                  <label htmlFor="commentsText" style={{ display: "block", fontSize: "13px", fontWeight: "700", marginBottom: "6px" }}>Add optional comments describing condition:</label>
                  <textarea 
                    id="commentsText"
                    rows={3} 
                    placeholder="Describe any specific issues (e.g. tag status, scratches, dimension defects, color differences)" 
                    value={comments} 
                    onChange={(e) => setComments(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "13px", fontFamily: "inherit" }}
                  />
                </div>

                {/* Submit button */}
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: "100%", padding: "12px", fontWeight: "700", marginTop: "10px" }}
                  disabled={!returnReason || (returnReason !== "defective_damaged" && selectedPhotos.length < 3)}
                >
                  Initiate AI Return Scan
                </button>
              </form>
            )}

            {/* Step 2: AI Scanning Progress Screen */}
            {wizardStep === "scanning" && (
              <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "25px" }}>
                
                {/* Images grid with scanline overlay */}
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
                  {selectedPhotos.map((url, idx) => (
                    <div key={idx} className="scanner-container" style={{ width: "80px", height: "80px", border: "2px solid var(--amazon-orange)", borderRadius: "6px", backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                      <div className="scanner-line"></div>
                    </div>
                  ))}
                </div>

                {/* Progress Circle & Text */}
                <div style={{ width: "100%", maxWidth: "400px" }}>
                  <div style={{ height: "8px", width: "100%", backgroundColor: "#eee", borderRadius: "4px", overflow: "hidden", marginBottom: "15px" }}>
                    <div style={{ height: "100%", width: `${scanningProgress}%`, backgroundColor: "var(--amazon-orange)", transition: "width 0.2s ease" }}></div>
                  </div>
                  
                  <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111" }}>{scanningProgress}% Analyzed</h3>
                  <p style={{ color: "#666", fontSize: "13px", marginTop: "8px", fontStyle: "italic", height: "20px" }}>{scanningMessage}</p>
                </div>

                <div style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} color="green" /> Secure real-time analytical weights shifting active.
                </div>
              </div>
            )}

            {/* Step 3: AI Grading Report Dashboard */}
            {wizardStep === "report" && assessmentResult && (
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                
                {/* Main Grade Badge Header */}
                <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", border: "1px solid #ddd", borderRadius: "8px", padding: "15px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#666", display: "block", textTransform: "uppercase", fontWeight: "700" }}>Return Quality Grade</span>
                    <strong style={{ fontSize: "28px", fontWeight: "800", color: getGradeStyle(assessmentResult.assignedGrade).color }}>
                      {assessmentResult.assignedGrade}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#555", marginLeft: "10px" }}>
                      {assessmentResult.assignedGrade === "A+" || assessmentResult.assignedGrade === "A" ? "(Like New Condition)" : assessmentResult.assignedGrade.startsWith("B") ? "(Very Good Condition)" : "(Needs Refurbishment/Scrapped)"}
                    </span>
                  </div>
                  
                  <div style={{ 
                    padding: "8px 16px", 
                    borderRadius: "20px", 
                    fontSize: "13px", 
                    fontWeight: "700",
                    ...getGradeStyle(assessmentResult.assignedGrade)
                  }}>
                    {assessmentResult.status}
                  </div>
                </div>

                {/* Refund Status Alerts */}
                {assessmentResult.status === "Approved (Auto-Refund)" && (
                  <div style={{ backgroundColor: "#e6f4ea", border: "1px solid #137333", color: "#137333", padding: "12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    ✓ Instant Refund Initiated. Amount will credit back to your original payment method in 1-2 hours.
                  </div>
                )}
                {assessmentResult.status === "Approved (Sent to Manufacturer)" && (
                  <div style={{ backgroundColor: "#e8f0fe", border: "1px solid #1a73e8", color: "#1c3d5a", padding: "12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    📦 <strong>Manufacturer RMA Active:</strong> Defective item verified. The system has routed this request directly to the manufacturer's RMA queue. A pre-paid manufacturer return shipping label has been generated.
                  </div>
                )}
                {assessmentResult.status === "Flagged (Manual Review)" && (
                  <div style={{ backgroundColor: "#fef7e0", border: "1px solid #f29900", color: "#b06000", padding: "12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    ⚠ Flagged for Agent Check. The image mismatch score exceeds the threshold. A manual warehouse agent check (human review) has been queued to confirm eligibility.
                  </div>
                )}
                {assessmentResult.status === "Rejected" && (
                  <div style={{ backgroundColor: "#fce8e6", border: "1px solid #c5221f", color: "#c5221f", padding: "12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    ✗ Return request rejected. Visual grade score falls below the required threshold for returns processing.
                  </div>
                )}

                {/* AI Visual Image Match Validation */}
                {assessmentResult.analysisMetrics.factoryImage && (
                  <div style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "6px", backgroundColor: "#fafafa" }}>
                    <h4 style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                      🔍 AI Visual Similarity Match Validation
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "4px", fontWeight: "600" }}>Factory pre-shipment reference image</span>
                        <div style={{
                          height: "120px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundImage: `url(${assessmentResult.analysisMetrics.factoryImage})`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          backgroundColor: "#fff"
                        }}></div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "11px", color: "#666", display: "block", marginBottom: "4px", fontWeight: "600" }}>Buyer uploaded return image</span>
                        <div style={{
                          height: "120px",
                          border: "1px solid #ccc",
                          borderRadius: "4px",
                          backgroundImage: `url(${selectedPhotos[0] || returningItem.itemImage})`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          backgroundColor: "#fff"
                        }}></div>
                      </div>
                    </div>
                    <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", padding: "8px", borderRadius: "4px", backgroundColor: assessmentResult.analysisMetrics.mismatchScore > assessmentResult.analysisMetrics.mismatchThreshold ? "#fdf5ea" : "#e6f4ea", border: assessmentResult.analysisMetrics.mismatchScore > assessmentResult.analysisMetrics.mismatchThreshold ? "1px solid #f29900" : "1px solid #137333" }}>
                      <div>
                        <span>Mismatch Deviation: <strong>{assessmentResult.analysisMetrics.mismatchScore}%</strong></span>
                        <span style={{ color: "#666", marginLeft: "10px" }}>Threshold Limit: <strong>{assessmentResult.analysisMetrics.mismatchThreshold}%</strong></span>
                      </div>
                      <span style={{ fontWeight: "700", color: assessmentResult.analysisMetrics.mismatchScore > assessmentResult.analysisMetrics.mismatchThreshold ? "#b06000" : "green" }}>
                        {assessmentResult.analysisMetrics.mismatchScore > assessmentResult.analysisMetrics.mismatchThreshold ? "❌ High Mismatch (Human Check Needed)" : "✓ Matches Reference (Auto-Refund)"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Adaptive weights breakdown */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <BarChart3 size={16} /> Dynamic Weight Distributions
                  </h4>
                  <div style={{ display: "grid", gap: "10px", backgroundColor: "#fafafa", padding: "12px", borderRadius: "6px", border: "1px solid #eee" }}>
                    {Object.entries(assessmentResult.weightBreakdown).map(([name, weight]: any) => (
                      <div key={name} style={{ fontSize: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px", textTransform: "capitalize" }}>
                          <span>{name.replace(/([A-Z])/g, ' $1')}</span>
                          <strong>{Math.round(weight * 100)}% weight</strong>
                        </div>
                        <div style={{ height: "6px", width: "100%", backgroundColor: "#eee", borderRadius: "3px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${weight * 100}%`, backgroundColor: "var(--amazon-orange)" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sizing history insights */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <History size={16} /> AI Context Analysis & Sizing History Logs
                  </h4>
                  <div style={{ fontSize: "12px", lineHeight: "1.5", color: "#333", backgroundColor: "#fdf5ea", padding: "12px", borderRadius: "6px", border: "1px solid #fbe8d0" }}>
                    {assessmentResult.historyInsights}
                  </div>
                </div>

                {/* Physical metrics extracted */}
                <div>
                  <h4 style={{ fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    <FileText size={16} /> Extracted Visual Characteristics
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px" }}>
                    {assessmentResult.analysisMetrics.colorAccuracy !== undefined && (
                      <div style={{ padding: "8px", border: "1px solid #eee", borderRadius: "4px" }}>
                        <span>Color Accuracy Score:</span> <strong>{assessmentResult.analysisMetrics.colorAccuracy}%</strong>
                      </div>
                    )}
                    {assessmentResult.analysisMetrics.damageDetected !== undefined && (
                      <div style={{ padding: "8px", border: "1px solid #eee", borderRadius: "4px" }}>
                        <span>Damage Detected:</span> <strong>{assessmentResult.analysisMetrics.damageDetected ? "Yes" : "No"}</strong>
                        <div style={{ fontSize: "10px", color: "#666" }}>{assessmentResult.analysisMetrics.damageDetails}</div>
                      </div>
                    )}
                    {assessmentResult.analysisMetrics.tagIntact !== undefined && (
                      <div style={{ padding: "8px", border: "1px solid #eee", borderRadius: "4px" }}>
                        <span>Barcode Tags Intact:</span> <strong>{assessmentResult.analysisMetrics.tagIntact ? "Yes" : "No"}</strong>
                      </div>
                    )}
                    {assessmentResult.analysisMetrics.dimensionCheck !== undefined && (
                      <div style={{ padding: "8px", border: "1px solid #eee", borderRadius: "4px", gridColumn: "span 2" }}>
                        <div>Ordered size: <strong>{assessmentResult.analysisMetrics.dimensionCheck.orderedSize}</strong> | Measured size: <strong>{assessmentResult.analysisMetrics.dimensionCheck.measuredSize}</strong></div>
                        <div style={{ fontSize: "11px", color: "#555", marginTop: "3px" }}>
                          Mismatch deviation: <strong>{assessmentResult.analysisMetrics.dimensionCheck.mismatchPercent}%</strong> | Manufacturer defect: <strong>{assessmentResult.analysisMetrics.dimensionCheck.isManufacturerDefect ? "Yes" : "No"}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Speed Metadata */}
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666", borderTop: "1px solid #eee", paddingTop: "10px", marginTop: "5px" }}>
                  <span>AI Confidence Score: <strong>{assessmentResult.confidenceScore}%</strong></span>
                  <span>Inspection Speed: <strong>{(assessmentResult.processingTimeMs / 1000).toFixed(2)} seconds</strong></span>
                </div>

                {/* Done button */}
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ width: "100%", padding: "12px", fontWeight: "700", marginTop: "5px" }}
                  onClick={closeReturnWizard}
                >
                  Return Flow Completed
                </button>

              </div>
            )}

          </div>
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

      {/* ========================================================
          RESPAWN TRADE-IN & RECYCLE MODAL
         ======================================================== */}
      {respawnItem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: "20px" }}>
          <div style={{
            background: "linear-gradient(135deg, #181824 0%, #101015 100%)",
            color: "#fff",
            borderRadius: "12px",
            maxWidth: "550px",
            width: "100%",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
            border: "1px solid #3b3b5c",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid #28283d" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", color: "#00f0ff" }}>
                ♻️ RESPawn Lifecycle Recycling Program
              </h3>
              <button 
                type="button" 
                style={{ background: "none", border: "none", color: "#ccc", cursor: "pointer" }} 
                onClick={() => setRespawnItem(null)}
              >
                <XCircle size={22} />
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div style={{ display: "flex", gap: "12px", border: "1px solid #2c2c3e", padding: "12px", borderRadius: "8px", backgroundColor: "#1c1c28" }}>
                <div style={{ width: "60px", height: "60px", backgroundImage: `url(${respawnItem.itemImage})`, backgroundSize: "contain", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundColor: "#fff", borderRadius: "6px" }}></div>
                <div>
                  <span style={{ fontSize: "11px", color: "#a0a0c0", display: "block" }}>Order #{respawnItem.orderId} (7+ Days Delivered)</span>
                  <strong style={{ fontSize: "14px", color: "#fff", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{respawnItem.itemName}</strong>
                </div>
              </div>

              <div style={{ backgroundColor: "#202030", padding: "12px", borderRadius: "6px", borderLeft: "4px solid #00f0ff", fontSize: "13px", lineHeight: "1.5" }}>
                💡 <strong>What is RESPawn?</strong> Since your 7-day return period has expired, this item is eligible for the RESPawn trade-in program. Send this item back to us, and we will inspect it to give it a second life. You will receive up to <strong>70% cashback</strong> depending on its condition, or recycle it for premium platform credits!
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ border: "1px solid #2a2a3c", padding: "12px", borderRadius: "6px", backgroundColor: "#13131d" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#00ff88", marginBottom: "6px" }}>Option A: Resell / Trade-In</h4>
                  <p style={{ fontSize: "11px", color: "#c0c0d0", lineHeight: "1.4" }}>Get up to 70% value in wallet cash depending on refurbished grade.</p>
                </div>
                <div style={{ border: "1px solid #2a2a3c", padding: "12px", borderRadius: "6px", backgroundColor: "#13131d" }}>
                  <h4 style={{ fontSize: "12px", fontWeight: "700", color: "#ffaa00", marginBottom: "6px" }}>Option B: Green Recycle</h4>
                  <p style={{ fontSize: "11px", color: "#c0c0d0", lineHeight: "1.4" }}>Eco-friendly materials recovery. Receive flat 20% carbon offsets and coupon bonuses.</p>
                </div>
              </div>

              <div style={{ border: "1px solid #ffaa00", borderRadius: "6px", padding: "10px 12px", fontSize: "11px", color: "#ffaa00", backgroundColor: "rgba(255,170,0,0.05)" }}>
                ⚡ <em>Note: RESPawn is an exclusive hackathon feature created to promote zero-waste circular commerce.</em>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: "10px", padding: "15px 20px", borderTop: "1px solid #28283d", justifyContent: "flex-end", backgroundColor: "#12121a" }}>
              <button 
                type="button" 
                style={{ padding: "8px 16px", borderRadius: "4px", backgroundColor: "transparent", color: "#ccc", border: "1px solid #444", cursor: "pointer" }}
                onClick={() => setRespawnItem(null)}
              >
                Close
              </button>
              <button 
                type="button" 
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  background: "linear-gradient(135deg, #00f0ff 0%, #0072ff 100%)",
                  color: "#000",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(0,240,255,0.4)"
                }}
                onClick={() => {
                  alert("Initiating RESPawn evaluation! You will receive a pre-paid mail-in envelope to ship your device for grading.");
                  setRespawnItem(null);
                }}
              >
                Start RESPawn Flow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
