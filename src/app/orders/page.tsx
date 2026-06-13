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
  FileText 
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
}

export default function OrdersPage() {
  const { user, addToCart } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search orders locally
  const [searchQuery, setSearchQuery] = useState("");
  
  // Tracking timeline toggle states
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  // Return Intake States
  const [returningItem, setReturningItem] = useState<{ 
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

  // Handle mock photo upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPhotos: string[] = [];
      
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
    if (selectedPhotos.length < 3) {
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
          uploadedImages: selectedPhotos.map((_, idx) => `image_${idx + 1}.jpg`)
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
                  {order.status === "Returned" && "Refund Processed (Item Returned via AI)"}
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
                    onClick={() => setReturningItem({ 
                      orderId: order.id, 
                      productId: order.items[0].id, 
                      itemName: order.items[0].name, 
                      itemImage: order.items[0].image 
                    })}
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
                  <span style={{ display: "block", marginTop: "6px", fontSize: "11px", color: selectedPhotos.length >= 3 ? "green" : "#b06000", fontWeight: "600" }}>
                    {selectedPhotos.length} / 5 photos uploaded. (Minimum 3 required)
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
                  disabled={selectedPhotos.length < 3 || !returnReason}
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
                {assessmentResult.status === "Flagged (Manual Review)" && (
                  <div style={{ backgroundColor: "#fef7e0", border: "1px solid #f29900", color: "#b06000", padding: "12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    ⚠ Flagged for Agent Check. The sizing/damage anomalies require standard manual warehouse review. Verification completed in 24 hours.
                  </div>
                )}
                {assessmentResult.status === "Rejected" && (
                  <div style={{ backgroundColor: "#fce8e6", border: "1px solid #c5221f", color: "#c5221f", padding: "12px", borderRadius: "6px", fontSize: "13px", fontWeight: "600" }}>
                    ✗ Return request rejected. Visual grade score falls below the required threshold for returns processing.
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
    </div>
  );
}
