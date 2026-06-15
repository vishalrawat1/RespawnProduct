"use client";

import React from "react";

export default function HealthCardSkeleton() {
  return (
    <div className="health-card" style={{ animation: "pulse 1.5s infinite" }}>
      <div className="health-card-header" style={{ backgroundColor: "#d0d0d0" }}>
        <div style={{ width: "150px", height: "16px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
        <div style={{ width: "80px", height: "12px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
      </div>

      <div className="health-card-body">
        <div className="health-grade-row">
          <div style={{ width: "50px", height: "50px", backgroundColor: "#e0e0e0", borderRadius: "8px" }}></div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ width: "120px", height: "18px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
            <div style={{ width: "100px", height: "12px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
          </div>
        </div>

        <div className="health-details" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ width: "100%", height: "14px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
          <div style={{ width: "80%", height: "14px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
          <div style={{ width: "90%", height: "14px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
        </div>
      </div>

      <div className="health-footer" style={{ backgroundColor: "#f0f0f0" }}>
        <div style={{ width: "100px", height: "16px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
        <div style={{ width: "80px", height: "24px", backgroundColor: "#e0e0e0", borderRadius: "4px" }}></div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
