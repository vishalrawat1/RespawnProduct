"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Leaf, QrCode, AlertCircle } from "lucide-react";
import { HealthCardData } from "@/lib/mockData";
import { useRouter } from "next/navigation";

interface HealthCardProps {
  productId: string;
  data?: HealthCardData;
  healthCardId?: string;
}

export default function HealthCard({ productId, data: initialData, healthCardId }: HealthCardProps) {
  const router = useRouter();
  const [data, setData] = useState<HealthCardData | null>(initialData || null);
  const [fetchState, setFetchState] = useState<"idle" | "loading" | "not_found">("idle");
  const prevKeyRef = React.useRef<string>("");

  useEffect(() => {
    // Build a stable key from the incoming data to detect real changes
    const newKey = initialData ? JSON.stringify({ g: initialData.grade, c: initialData.confidence, m: (initialData as any).mismatchScore }) : "";

    // If we have real passed-in data (has grade), always use it and mark it
    if (initialData && initialData.grade) {
      if (prevKeyRef.current !== newKey) {
        prevKeyRef.current = newKey;
        setData(initialData);
        setFetchState("idle");
      }
      return;
    }

    // No direct data — try fetching from DB
    const fetchCard = async () => {
      setFetchState("loading");
      try {
        // 1. Try by explicit healthCardId first
        if (healthCardId) {
          const res = await fetch(`/api/healthcards?id=${healthCardId}`);
          const result = await res.json();
          if (result.status === "success" && result.data && result.data.length > 0) {
            setData(result.data[0]);
            setFetchState("idle");
            return;
          }
        }
        // 2. Try by productId as a fallback
        if (productId) {
          const res2 = await fetch(`/api/healthcards?id=${productId}`);
          const result2 = await res2.json();
          if (result2.status === "success" && result2.data && result2.data.length > 0) {
            setData(result2.data[0]);
            setFetchState("idle");
            return;
          }
        }
        // Nothing found
        setFetchState("not_found");
      } catch (err) {
        console.error("HealthCard DB fetch failed", err);
        setFetchState("not_found");
      }
    };

    fetchCard();
  }, [initialData, healthCardId, productId]);

  const handleVerify = () => {
    router.push(`/verify/${productId}`);
  };

  // Loading state
  if (fetchState === "loading") {
    return (
      <div className="health-card" style={{ opacity: 0.7 }}>
        <div className="health-card-header">
          <div className="health-card-title">
            <ShieldCheck size={16} />
            RESPawn AI Health Card
          </div>
        </div>
        <div className="health-card-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "20px", color: "#555" }}>
          <div style={{ width: "16px", height: "16px", border: "2px solid #007185", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: "12px" }}>Fetching AI Health Card...</span>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Not found / not yet inspected
  if (!data || fetchState === "not_found") {
    return (
      <div className="health-card">
        <div className="health-card-header">
          <div className="health-card-title">
            <ShieldCheck size={16} />
            RESPawn AI Health Card
          </div>
          <div style={{ fontSize: "11px", opacity: 0.8 }}>Pending Inspection</div>
        </div>
        <div className="health-card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "20px", textAlign: "center" }}>
          <AlertCircle size={32} color="#e47911" />
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", color: "#0f1111", marginBottom: "4px" }}>No Inspection Report Yet</div>
            <div style={{ fontSize: "12px", color: "#565959", lineHeight: 1.4 }}>
              Run the OpenCV AI Inspection in the RESPawn modal to generate a quality health card for this item.
            </div>
          </div>
          <div style={{ fontSize: "11px", color: "#007185", backgroundColor: "#f0f9ff", border: "1px solid #b8e0f0", borderRadius: "6px", padding: "8px 12px" }}>
            💡 The health card will appear here automatically after the AI scan completes.
          </div>
        </div>
        <div className="health-footer">
          <div className="health-sustainability">
            <Leaf size={14} color="#007185" />
            Eco-Verified on Inspection
          </div>
          <button className="health-verify-btn" onClick={handleVerify}>
            <QrCode size={14} />
            [VERIFY]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-card">
      <div className="health-card-header">
        <div className="health-card-title">
          <ShieldCheck size={16} />
          RESPawn AI Health Card
        </div>
        <div style={{ fontSize: "11px", opacity: 0.8 }}>
          Generated: {data.generatedDate || new Date().toISOString().split("T")[0]}
        </div>
      </div>

      <div className="health-card-body">
        <div className="health-grade-row">
          <div className={`health-grade-badge grade-${data.grade.charAt(0)}`}>
            {data.grade}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>Certified Refurbished</div>
            <div className="health-confidence">AI Confidence: {data.confidence}%</div>
          </div>
        </div>

        <div className="health-details">
          <div className="health-detail-item">
            <span className="health-detail-label">Return History ({(data.returns || []).length} times):</span>
            {(data.returns || []).length > 0 ? (
              <ul className="health-returns-list">
                {(data.returns || []).map((ret, idx) => (
                  <li key={idx}>
                    #{idx + 1}: "{ret.reason}" {ret.count ? `(${ret.count}x)` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <span style={{ fontSize: "12px", color: "#555" }}>No previous returns recorded.</span>
            )}
          </div>

          <div className="health-detail-item" style={{ marginTop: "8px" }}>
            <span className="health-detail-label">Action Taken:</span>
            <span style={{ fontSize: "13px" }}>Routed to {data.routed}</span>
          </div>

          {data.manufacturerNote && (
            <div className="health-detail-item" style={{ marginTop: "8px" }}>
              <span className="health-detail-label">Manufacturer Note:</span>
              <span style={{ fontSize: "13px", fontStyle: "italic", color: "#444" }}>
                "{data.manufacturerNote}"
              </span>
            </div>
          )}

          {data.mismatchScore !== undefined && (
            <div className="health-detail-item" style={{ marginTop: "8px" }}>
              <span className="health-detail-label">OpenCV Analysis Mismatch:</span>
              <span style={{ fontSize: "13px", color: data.mismatchScore > 15 ? "#cc0c39" : "#007600", fontWeight: "bold" }}>
                {data.mismatchScore}% Deviation
              </span>
            </div>
          )}

          {data.crossVerifiedDefects && data.crossVerifiedDefects.length > 0 && (
            <div className="health-detail-item" style={{ marginTop: "12px" }}>
              <span className="health-detail-label">AI Detected Anomalies:</span>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", color: "#333" }}>
                {data.crossVerifiedDefects.map((defect: any, idx: number) => {
                  const severity = defect.final_severity || defect.severity || "medium";
                  const type = defect.type || defect.aspect || "Anomaly";
                  const details = defect.occurrences?.[0]?.details || defect.details || "Anomaly detected";
                  
                  return (
                    <li key={idx} style={{ marginBottom: "6px" }}>
                      <span style={{ 
                        backgroundColor: severity === "high" ? "rgba(204,12,57,0.1)" : "rgba(255,153,0,0.1)", 
                        color: severity === "high" ? "#cc0c39" : "#d97706",
                        padding: "2px 6px", 
                        borderRadius: "4px", 
                        fontSize: "10px",
                        fontWeight: "bold",
                        marginRight: "6px"
                      }}>
                        {type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <span style={{ fontSize: "12px", color: "#444" }}>
                        {details}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {data.images && data.images.length > 0 && (
            <div className="health-detail-item" style={{ marginTop: "12px" }}>
              <span className="health-detail-label">Verified Uploaded Photos:</span>
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
                {data.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`condition-${idx}`} style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ccc" }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="health-footer">
        <div className="health-sustainability">
          <Leaf size={14} color="#007185" />
          {data.sustainability}
        </div>
        <button className="health-verify-btn" onClick={handleVerify}>
          <QrCode size={14} />
          [VERIFY]
        </button>
      </div>

      {/* Unique RESPawn Session ID — shown when id is an RSP-xxx id */}
      {data.id && data.id.startsWith("RSP-") && (
        <div style={{
          borderTop: "1px solid #e8f5e9",
          padding: "6px 12px",
          backgroundColor: "#f0faf5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10px",
          gap: "6px"
        }}>
          <span style={{ color: "#555" }}>Session ID:</span>
          <span style={{
            fontFamily: "monospace",
            fontWeight: "700",
            color: "#007185",
            letterSpacing: "0.5px",
            fontSize: "10px",
            backgroundColor: "#e0f2f1",
            padding: "2px 6px",
            borderRadius: "3px"
          }}>
            {data.id}
          </span>
        </div>
      )}

      {/* Product Buy ID */}
      {data.productbuyid && (
        <div style={{
          borderTop: "1px solid #e8f5e9",
          padding: "6px 12px",
          backgroundColor: "#fdf8e6",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10px",
          gap: "6px"
        }}>
          <span style={{ color: "#555" }}>Product Buy ID:</span>
          <span style={{
            fontFamily: "monospace",
            fontWeight: "700",
            color: "#b06000",
            letterSpacing: "0.5px",
            fontSize: "10px",
            backgroundColor: "#fef0cd",
            padding: "2px 6px",
            borderRadius: "3px"
          }}>
            {data.productbuyid}
          </span>
        </div>
      )}

      {/* Selected Respawn Option */}
      {data.respawnOption && (
        <div style={{
          borderTop: "1px solid #e8f5e9",
          padding: "6px 12px",
          backgroundColor: "#f4f0ff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "10px",
          gap: "6px"
        }}>
          <span style={{ color: "#555" }}>RESPawn Route:</span>
          <span style={{
            fontWeight: "700",
            color: "#4a148c",
            letterSpacing: "0.5px",
            fontSize: "10px",
            backgroundColor: "#ede7f6",
            padding: "2px 6px",
            borderRadius: "3px",
            textTransform: "uppercase"
          }}>
            {data.respawnOption}
          </span>
        </div>
      )}
    </div>
  );
}
