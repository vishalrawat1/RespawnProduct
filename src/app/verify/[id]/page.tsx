"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product, HealthCardData, HEALTH_CARDS } from "@/lib/mockData";
import { ShieldCheck, ArrowLeft, Cpu, Activity, Info } from "lucide-react";
import HealthCardSkeleton from "@/components/HealthCardSkeleton";

export default function VerifyHealthCardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [healthData, setHealthData] = useState<HealthCardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVerificationData() {
      setLoading(true);
      try {
        // Fetch product
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        
        if (data.status === "success" && data.product) {
          const prod: Product = data.product;
          setProduct(prod);

          if (prod.respawn?.isRespawned && prod.respawn.healthCardId) {
            // Mock fetching the health card from blockchain/db
            setTimeout(() => {
              const cardData = HEALTH_CARDS[prod.respawn!.healthCardId!];
              setHealthData(cardData || null);
              setLoading(false);
            }, 800); // simulate network delay for dramatic effect
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
    
    if (id) fetchVerificationData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Verifying Identity...</h2>
        <HealthCardSkeleton />
      </div>
    );
  }

  if (!product || !healthData) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <ShieldCheck size={48} color="#cc0c39" style={{ margin: "0 auto 15px auto" }} />
        <h2>Verification Unavailable</h2>
        <p>We could not find a valid RESPawn Health Card for this item.</p>
        <button className="btn-primary" style={{ padding: "8px 16px", marginTop: "15px" }} onClick={() => router.back()}>Go back</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px" }}>
      <button 
        style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", color: "#007185", marginBottom: "20px" }}
        onClick={() => router.back()}
      >
        <ArrowLeft size={16} /> Back to Product
      </button>

      <div style={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "var(--shadow)", overflow: "hidden", border: "1px solid #e7e7e7" }}>
        {/* Header */}
        <div style={{ backgroundColor: "#008296", color: "#fff", padding: "20px", textAlign: "center" }}>
          <ShieldCheck size={48} style={{ margin: "0 auto 10px auto" }} />
          <h1 style={{ fontSize: "24px", margin: 0 }}>Verified Authentic</h1>
          <p style={{ opacity: 0.9, marginTop: "4px" }}>RESPawn AI Certified Refurbished</p>
        </div>

        {/* Product Summary */}
        <div style={{ display: "flex", gap: "15px", padding: "20px", borderBottom: "1px solid #e7e7e7" }}>
          <div style={{ width: "80px", height: "80px", backgroundImage: `url(${product.image})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}></div>
          <div>
            <h3 style={{ fontSize: "16px", margin: "0 0 4px 0" }}>{product.name}</h3>
            <p style={{ fontSize: "13px", color: "#555" }}>Seller: {product.seller}</p>
          </div>
        </div>

        {/* Report Details */}
        <div style={{ padding: "20px" }}>
          <h4 style={{ fontSize: "14px", color: "#666", textTransform: "uppercase", marginBottom: "15px" }}>Full Health Report</h4>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "20px" }}>
            <div style={{ backgroundColor: "#f6fafa", padding: "15px", borderRadius: "4px", border: "1px solid #d8e2e3" }}>
              <div style={{ fontSize: "12px", color: "#555" }}>AI Assigned Grade</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#008296" }}>{healthData.grade}</div>
            </div>
            <div style={{ backgroundColor: "#f6fafa", padding: "15px", borderRadius: "4px", border: "1px solid #d8e2e3" }}>
              <div style={{ fontSize: "12px", color: "#555" }}>AI Confidence Score</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "#0f1111" }}>{healthData.confidence}%</div>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h5 style={{ fontSize: "14px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Activity size={16} color="#008296" /> Assessment Insights
            </h5>
            <div style={{ padding: "15px", border: "1px solid #eee", borderRadius: "4px" }}>
              <p style={{ fontSize: "13px", margin: "0 0 10px 0" }}><strong>Returns recorded:</strong> {healthData.returns.length}</p>
              <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "#444", margin: "0 0 10px 0" }}>
                {healthData.returns.map((ret, idx) => (
                  <li key={idx} style={{ marginBottom: "4px" }}>
                    Reason: {ret.reason} {ret.count && `(${ret.count} occurrences)`}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: "13px", margin: "0" }}><strong>Manufacturer Note:</strong> {healthData.manufacturerNote}</p>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h5 style={{ fontSize: "14px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Cpu size={16} color="#008296" /> Blockchain Verification
            </h5>
            <div style={{ padding: "15px", backgroundColor: "#f8f9fa", border: "1px solid #eee", borderRadius: "4px", fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all", color: "#555" }}>
              <div style={{ marginBottom: "4px" }}><strong>Hash:</strong> {healthData.blockchainHash || "0x9d2e1b4f7a8c3d5e6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3"}</div>
              <div style={{ marginBottom: "4px" }}><strong>Timestamp:</strong> {healthData.generatedDate}T14:32:01Z</div>
              <div style={{ color: "green", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                <ShieldCheck size={14} /> Immutable record verified on RESPawn Ledger.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "start", gap: "8px", padding: "15px", backgroundColor: "#fff8e1", borderLeft: "4px solid #ffc107", borderRadius: "0 4px 4px 0", fontSize: "12px", color: "#666" }}>
            <Info size={16} color="#ffc107" style={{ flexShrink: 0, marginTop: "2px" }} />
            <p style={{ margin: 0 }}>This item has undergone rigorous multi-modal AI inspection (visual + history + dimensional checks) to ensure it meets our quality standards. Buying refurbished saves {healthData.sustainability} of e-waste.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
