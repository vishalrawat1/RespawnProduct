"use client";

import React from "react";
import { ShieldCheck, Leaf, QrCode } from "lucide-react";
import { HealthCardData } from "@/lib/mockData";
import { useRouter } from "next/navigation";

interface HealthCardProps {
  productId: string;
  data: HealthCardData;
}

export default function HealthCard({ productId, data }: HealthCardProps) {
  const router = useRouter();

  const handleVerify = () => {
    router.push(`/verify/${productId}`);
  };

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
            <span className="health-detail-label">Return History ({data.returns.length} times):</span>
            {data.returns.length > 0 ? (
              <ul className="health-returns-list">
                {data.returns.map((ret, idx) => (
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
    </div>
  );
}
