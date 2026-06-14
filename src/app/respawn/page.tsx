"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, ShieldCheck, Truck, Package, XCircle } from "lucide-react";

interface TrackedItem {
  id: string;
  name: string;
  image: string;
  price: number;
}

interface RespawnData {
  item: TrackedItem;
  type: string;
}

const TRACKING_STAGES = [
  { id: 1, label: "Local Pincode", desc: "Radius matching" },
  { id: 2, label: "City Hub", desc: "Same city demand" },
  { id: 3, label: "State Hub", desc: "Regional fulfillment" },
  { id: 4, label: "Zonal Whse", desc: "North India zone" },
  { id: 5, label: "National / Mfr", desc: "Manufacturer buyback" }
];

export default function RespawnTracker() {
  const router = useRouter();
  const [data, setData] = useState<RespawnData | null>(null);
  
  const [currentStage, setCurrentStage] = useState(1);
  const [status, setStatus] = useState<"routing" | "matched" | "fallback" | "declined" | "accepted" | "recycling_form">("routing");
  
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [searchRadius, setSearchRadius] = useState("5");
  const [recycleParts, setRecycleParts] = useState({ battery: false, screen: false, casing: false, motherboard: false, other: "" });

  useEffect(() => {
    // Load state from sessionStorage
    const stored = sessionStorage.getItem("pendingRespawn");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // Fallback dummy data for direct navigation testing
      setData({
        item: { id: "sony-wh-1000xm5", name: "Sony WH-1000XM5 Wireless Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80", price: 29990 },
        type: "p2p"
      });
    }
  }, []);

  useEffect(() => {
    if (!data) return;

    if (data.type === "donate" || data.type === "recycle" || data.type === "salvage") {
      if (data.type === "recycle") {
        setStatus("recycling_form");
      } else {
        setStatus("fallback");
        if (data.type === "donate") {
          setMatchDetails({ title: "NGO Donation Scheduled", desc: "Matched with Goonj (Sector 45). Thank you for your contribution!", payout: "500 RESPawn Points (2.5x NGO Multiplier)" });
        } else {
          setMatchDetails({ title: "Eco-Salvage", desc: "Hardware routed to Haryana Public Library", payout: "200 RESPawn Points" });
        }
      }
    } else {
      setStatus("routing");
      setCurrentStage(1);
    }
  }, [data]);

  const handleRecycleSubmit = () => {
    setStatus("fallback");
    setMatchDetails({ title: "E-Waste Processing", desc: "Routed to Green-E Facility based on component selection.", payout: "300 RESPawn Points" });
  };

  let maxStage = 5;
  if (data?.type === "lease") {
    if (data.item.price < 1000) maxStage = 3;
    else if (data.item.price < 2000) maxStage = 4;
  }

  const handleNextStep = () => {
    if (currentStage < maxStage) {
      setCurrentStage(prev => prev + 1);
    } else {
      setStatus("matched");
      if (data?.type === "lease") {
        setMatchDetails({ 
          title: `Lease Pool Reached (${TRACKING_STAGES[maxStage-1].label})`, 
          desc: "Item entered the regional leasing pool based on its valuation.", 
          payout: "Standard Lease Yield" 
        });
      } else {
        setMatchDetails({ 
          title: "Manufacturer Reached", 
          desc: "Item reached the National Manufacturer facility for standard processing.", 
          payout: "Standard Refund" 
        });
      }
    }
  };

  const handleCustomerFound = () => {
    setStatus("matched");
    let matchTitle = `Customer Matched at ${TRACKING_STAGES[currentStage-1].label}`;
    let matchDesc = "Return Intercepted! A local customer has purchased this item while it was routing back.";
    
    if (data?.type === "p2p") {
      matchTitle = "Local Buyer Matched";
      matchDesc = `Success! A verified buyer within a ${searchRadius}km radius has purchased this item directly.`;
    }

    setMatchDetails({ 
      title: matchTitle, 
      desc: matchDesc, 
      payout: "₹19,500 (Premium Resale)" 
    });
  };

  const handleAccept = () => {
    setStatus("accepted");
  };

  const handleDecline = () => {
    setStatus("declined");
    // Optionally remove session storage and navigate away
    // sessionStorage.removeItem("pendingRespawn");
  };

  if (!data) return <div style={{ padding: "40px", textAlign: "center" }}>Loading RESPawn Data...</div>;

  return (
    <div className="orders-page" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto", color: "#333", minHeight: "80vh" }}>
      
      {/* Breadcrumbs */}
      <div style={{ fontSize: "12px", color: "#565959", marginBottom: "15px" }}>
        <Link href="/orders" style={{ color: "#565959", textDecoration: "none" }}>Your Account</Link> › 
        <Link href="/orders" style={{ color: "#565959", textDecoration: "none" }}> Your Orders</Link> › 
        <span style={{ color: "#c45500", fontWeight: "bold" }}> RESPawn Returns</span>
      </div>

      <h1 style={{ fontSize: "24px", fontWeight: "400", marginBottom: "20px" }}>RESPawn Tracking: {data.type.toUpperCase()} Routing</h1>

      {/* Main Card */}
      <div style={{ border: "1px solid #d5d9d9", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff", marginBottom: "20px" }}>
        
        {/* Card Header */}
        <div style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#f0f2f2", padding: "14px 18px", borderBottom: "1px solid #d5d9d9", fontSize: "14px" }}>
          <div style={{ display: "flex", gap: "30px" }}>
            <div>
              <div style={{ color: "#565959" }}>ROUTING INITIATED</div>
              <div>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div>
              <div style={{ color: "#565959" }}>ITEM</div>
              <div style={{ fontWeight: "700" }}>{data.item.name}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#565959" }}>RESPAWN ACTION #</div>
            <div>RES-{Math.floor(Math.random() * 1000000)}</div>
          </div>
        </div>

        {/* Card Body */}
        <div style={{ padding: "20px" }}>
          
          <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
            <img src={data.item.image} alt={data.item.name} style={{ width: "80px", height: "80px", objectFit: "contain", border: "1px solid #eee", padding: "5px" }} />
            <div>
              <h3 style={{ margin: "0 0 10px 0", color: "#0f1111", fontSize: "18px" }}>
                {status === "routing" ? (data.type === "p2p" ? "Searching for local buyers..." : "Routing to Manufacturer (Scanning for Buyers)...") : 
                 status === "recycling_form" ? "Awaiting Recycling Details..." :
                 status === "matched" ? "Match Found! Pending your review." :
                 status === "fallback" ? "Fallback Logistics Confirmed." :
                 status === "declined" ? "RESPawn Action Declined." :
                 "RESPawn Action Accepted!"}
              </h3>
              <p style={{ color: "#565959", fontSize: "14px", margin: 0 }}>
                {data.type === "p2p" ? "Peer-to-Peer Resale Network" : 
                 data.type === "refurb" ? "Manufacturer Refurbishment Pipeline" :
                 data.type === "donate" ? "NGO Donation Network" : "Eco-Routing Protocol"}
              </p>
            </div>
          </div>

          {/* Amazon-style Horizontal Tracker */}
          {status !== "fallback" && status !== "declined" && status !== "recycling_form" && data.type !== "p2p" && (
            <div style={{ padding: "20px 40px", marginBottom: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
                
                {/* Background Line */}
                <div style={{ position: "absolute", top: "12px", left: "0", right: "0", height: "4px", backgroundColor: "#f0f2f2", zIndex: 1 }}></div>
                
                {/* Active Progress Line */}
                <div style={{ 
                  position: "absolute", top: "12px", left: "0", height: "4px", backgroundColor: "#007185", zIndex: 2,
                  width: `${((currentStage - 1) / (TRACKING_STAGES.length - 1)) * 100}%`,
                  transition: "width 0.8s ease"
                }}></div>

                {TRACKING_STAGES.map((stage, idx) => {
                  const isPassed = stage.id < currentStage || (stage.id === currentStage && (status === "matched" || status === "accepted"));
                  const isActive = stage.id === currentStage && status === "routing";
                  
                  return (
                    <div key={stage.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 3 }}>
                      {/* Node Circle */}
                      <div style={{ 
                        width: "28px", height: "28px", borderRadius: "50%", 
                        backgroundColor: isPassed || isActive ? "#007185" : "#f0f2f2",
                        border: "4px solid #fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: isActive ? "0 0 0 3px rgba(0,113,133,0.3)" : "none",
                        transition: "all 0.3s ease"
                      }}>
                        {isPassed && <Check size={14} color="#fff" strokeWidth={3} />}
                      </div>
                      
                      {/* Label */}
                      <div style={{ textAlign: "center", marginTop: "10px", minWidth: "100px" }}>
                        <div style={{ fontSize: "14px", fontWeight: isPassed || isActive ? "700" : "400", color: isPassed || isActive ? "#0f1111" : "#565959" }}>
                          {stage.label}
                        </div>
                        <div style={{ fontSize: "12px", color: "#565959", marginTop: "2px" }}>
                          {stage.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Simulator Controls */}
          {status === "routing" && (
            <div style={{ padding: "20px", backgroundColor: "#f2fdff", borderRadius: "8px", border: "1px dashed #007185", marginBottom: "30px", animation: "fadeIn 0.5s ease" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#007185", display: "flex", alignItems: "center", gap: "8px", fontSize: "16px" }}>
                <Package size={18} /> Interactive Simulation Controls
              </h4>
              {data.type !== "p2p" ? (
                <p style={{ fontSize: "14px", color: "#565959", marginBottom: "15px", marginTop: 0 }}>
                  Item is currently at <strong>{TRACKING_STAGES[currentStage-1].label}</strong> returning to manufacturer. 
                  Our AI is continuously scanning for a buyer.
                </p>
              ) : (
                <p style={{ fontSize: "14px", color: "#565959", marginBottom: "15px", marginTop: 0 }}>
                  Item is available for direct Peer-to-Peer transfer. 
                  Our AI is continuously scanning for a verified buyer nearby.
                </p>
              )}

              {data.type === "p2p" && (
                <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#fff", border: "1px solid #d5d9d9", borderRadius: "6px", display: "inline-block" }}>
                  <label style={{ fontSize: "14px", color: "#0f1111", fontWeight: "500", marginRight: "10px" }}>
                    Buyer Search Radius:
                  </label>
                  <select 
                    value={searchRadius} 
                    onChange={(e) => setSearchRadius(e.target.value)}
                    style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #888C8C", fontSize: "14px", outline: "none", cursor: "pointer" }}
                  >
                    <option value="2">2 km (Hyper-local)</option>
                    <option value="5">5 km (Neighborhood)</option>
                    <option value="10">10 km (City limits)</option>
                    <option value="25">25 km (Regional)</option>
                  </select>
                </div>
              )}

              <div style={{ display: "flex", gap: "15px" }}>
                <button onClick={handleCustomerFound} style={{ flex: 1, padding: "10px", backgroundColor: "#ffd814", border: "1px solid #fcd200", borderRadius: "8px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                  {data.type === "p2p" ? "Simulate: Customer Found Nearby" : "Intercept: Customer Found Here"}
                </button>
                {data.type !== "p2p" && (
                  <button onClick={handleNextStep} style={{ flex: 1, padding: "10px", backgroundColor: "#fff", border: "1px solid #d5d9d9", borderRadius: "8px", cursor: "pointer", fontWeight: "500", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                    {currentStage < maxStage ? "Continue Route to Next Hub" : (data.type === "lease" ? "Reach Leasing Hub" : "Reach Manufacturer")}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recycling Form Display */}
          {status === "recycling_form" && (
            <div style={{ padding: "20px", backgroundColor: "#f9f9f9", border: "1px solid #d5d9d9", borderRadius: "8px", marginBottom: "20px" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#0f1111", fontSize: "16px" }}>Recycling Details Required</h4>
              <p style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#565959" }}>Please specify which components of the <strong>{data.item.name}</strong> are intact and can be recycled:</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={recycleParts.battery} onChange={(e) => setRecycleParts({...recycleParts, battery: e.target.checked})} /> Battery
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={recycleParts.screen} onChange={(e) => setRecycleParts({...recycleParts, screen: e.target.checked})} /> Display / Screen
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={recycleParts.casing} onChange={(e) => setRecycleParts({...recycleParts, casing: e.target.checked})} /> Outer Casing / Shell
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={recycleParts.motherboard} onChange={(e) => setRecycleParts({...recycleParts, motherboard: e.target.checked})} /> Motherboard / Internal Electronics
                </label>
                <input 
                  type="text" 
                  placeholder="Other (please specify)" 
                  value={recycleParts.other} 
                  onChange={(e) => setRecycleParts({...recycleParts, other: e.target.value})}
                  style={{ padding: "8px", borderRadius: "4px", border: "1px solid #d5d9d9", marginTop: "5px", width: "100%", maxWidth: "300px" }}
                />
              </div>

              <button 
                onClick={handleRecycleSubmit} 
                style={{ padding: "10px 20px", backgroundColor: "#ffd814", border: "1px solid #fcd200", borderRadius: "8px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}
              >
                Submit & Route to Facility
              </button>
            </div>
          )}

          {/* Fallback Display */}
          {status === "fallback" && (
            <div style={{ padding: "20px", backgroundColor: "#f8f8f8", borderLeft: "4px solid #c45500", marginBottom: "20px" }}>
              <div style={{ fontWeight: "700", color: "#c45500", fontSize: "16px", marginBottom: "5px" }}>Direct Logistics Routed</div>
              <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>This item bypassed standard matching echelons and was directly assigned to a partner facility.</p>
            </div>
          )}

          {/* Interactive Match Confirmation Card */}
          {(status === "matched" || status === "fallback") && matchDetails && (
            <div style={{ border: "2px solid #84d8e3", backgroundColor: "#f2fdff", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "fadeIn 0.5s ease" }}>
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#007185", display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldCheck size={20} /> {matchDetails.title}
                </h4>
                <p style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#333" }}>{matchDetails.desc}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontSize: "13px", color: "#565959" }}>Estimated Yield:</span>
                  <span style={{ fontSize: "24px", fontWeight: "700", color: "#B12704" }}>{matchDetails.payout}</span>
                </div>
              </div>

              {status === "matched" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "200px" }}>
                  <button onClick={handleAccept} style={{ padding: "10px", backgroundColor: "#ffd814", border: "1px solid #fcd200", borderRadius: "8px", cursor: "pointer", fontWeight: "600", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
                    Accept Match
                  </button>
                  <button onClick={handleDecline} style={{ padding: "10px", backgroundColor: "#fff", border: "1px solid #d5d9d9", borderRadius: "8px", cursor: "pointer", fontWeight: "500", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                    Decline
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Accepted State */}
          {status === "accepted" && (
            <div style={{ border: "2px solid #008a00", backgroundColor: "#f0faf0", borderRadius: "8px", padding: "20px", display: "flex", alignItems: "center", gap: "15px", animation: "fadeIn 0.5s ease" }}>
              <Check size={32} color="#008a00" />
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "18px", color: "#008a00" }}>Offer Accepted & Pick-up Scheduled</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#333" }}>A courier will arrive within 24 hours to collect the item. Your payout will be processed upon warehouse verification.</p>
              </div>
            </div>
          )}

          {/* Declined State */}
          {status === "declined" && (
            <div style={{ border: "1px solid #d5d9d9", backgroundColor: "#f9f9f9", borderRadius: "8px", padding: "20px", display: "flex", alignItems: "center", gap: "15px", animation: "fadeIn 0.5s ease" }}>
              <XCircle size={32} color="#565959" />
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "16px", color: "#333" }}>Offer Declined</h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#565959" }}>You have rejected this routing path. The item remains in your dashboard for future actions.</p>
                <Link href="/orders" style={{ display: "inline-block", marginTop: "10px", color: "#007185", textDecoration: "none", fontSize: "14px" }}>
                  Return to Dashboard
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
