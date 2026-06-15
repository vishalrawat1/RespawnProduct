"use client";

import React, { useState } from "react";
import { RiskTier } from "@/lib/riskEngine";
import { AlertTriangle, MessageCircle, Ruler, Sparkles, Users, ShieldAlert, Clock, Lock } from "lucide-react";

interface CheckoutNudgeProps {
  tier: RiskTier;
  returnRate: number;
  trustScore: number;
  cartHasFashion: boolean;
  onChatConfirmed: () => void;
  chatConfirmed: boolean;
}

export default function CheckoutNudge({
  tier,
  returnRate,
  trustScore,
  cartHasFashion,
  onChatConfirmed,
  chatConfirmed,
}: CheckoutNudgeProps) {
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [arPromptDismissed, setArPromptDismissed] = useState(false);

  if (tier === "NEW_CUSTOMER") return null;

  /* ─────────────────────────── NUDGE MODE ─────────────────────────── */
  if (tier === "RETURN_CUSTOMER") {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #fff8e6 0%, #fffdf5 100%)",
          border: "1.5px solid #f5a623",
          borderRadius: "10px",
          padding: "18px 20px",
          marginBottom: "20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle stripe accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            background: "linear-gradient(180deg, #f5a623, #ff9900)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Sparkles size={16} color="#e47911" />
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#7a4d00" }}>
            Smart Shopping Tips — Personalized for You
          </span>
        </div>

        <p style={{ fontSize: "12px", color: "#555", marginBottom: "14px", lineHeight: "1.5" }}>
          Based on your shopping history, we've curated a few tips to help you find the perfect fit
          before you order — saving you time on returns.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {/* Size Guide Tip */}
          {cartHasFashion && (
            <button
              onClick={() => setSizeGuideOpen(!sizeGuideOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#fff",
                border: "1px solid #f5a623",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#7a4d00",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Ruler size={14} />
              📏 Size Guide
            </button>
          )}

          {/* AR Try-On */}
          {!arPromptDismissed && cartHasFashion && (
            <button
              onClick={() => setArPromptDismissed(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              🪞 Try AR Fit
            </button>
          )}

          {/* Social Proof */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: "6px",
              fontSize: "12px",
              color: "#166534",
              fontWeight: "600",
            }}
          >
            <Users size={13} />
            <span>847 customers kept this item this week</span>
          </div>
        </div>

        {/* Size Guide Expansion */}
        {sizeGuideOpen && (
          <div
            style={{
              marginTop: "14px",
              padding: "14px",
              background: "#fff",
              border: "1px solid #eee",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          >
            <strong style={{ display: "block", marginBottom: "8px" }}>📏 Quick Size Guide</strong>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  {["Size", "Chest (in)", "Waist (in)", "Hip (in)"].map((h) => (
                    <th key={h} style={{ padding: "5px 8px", textAlign: "left", fontWeight: "700", color: "#333" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["S", "34–36", "28–30", "35–37"],
                  ["M", "37–39", "31–33", "38–40"],
                  ["L", "40–42", "34–36", "41–43"],
                  ["XL", "43–45", "37–39", "44–46"],
                ].map(([size, chest, waist, hip]) => (
                  <tr key={size} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "5px 8px", fontWeight: "700" }}>{size}</td>
                    <td style={{ padding: "5px 8px", color: "#555" }}>{chest}</td>
                    <td style={{ padding: "5px 8px", color: "#555" }}>{waist}</td>
                    <td style={{ padding: "5px 8px", color: "#555" }}>{hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ marginTop: "8px", color: "#888", fontSize: "11px" }}>
              💡 Tip: If between sizes, size up for a comfortable fit.
            </p>
          </div>
        )}

        {/* Return window reminder */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "11px", color: "#666" }}>
          <Clock size={12} />
          <span>Your standard 7-day return window applies to this order.</span>
        </div>
      </div>
    );
  }

  /* ─────────────────────────── RESTRICT MODE ─────────────────────────── */
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fff1f0 0%, #fff8f8 100%)",
        border: "1.5px solid #ef4444",
        borderRadius: "10px",
        padding: "18px 20px",
        marginBottom: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "4px",
          height: "100%",
          background: "linear-gradient(180deg, #ef4444, #dc2626)",
        }}
      />

      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "14px" }}>
        <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
        <div>
          <div style={{ fontSize: "13px", fontWeight: "700", color: "#7f1d1d", marginBottom: "4px" }}>
            Account Return Policy Notice
          </div>
          <p style={{ fontSize: "12px", color: "#666", lineHeight: "1.5", margin: 0 }}>
            Your account has a high return rate ({returnRate}%). Modified return policies apply to protect our seller community.
          </p>
        </div>
      </div>

      {/* Restricted policies */}
      <div style={{ display: "grid", gap: "8px", marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 12px",
            background: "#fff",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        >
          <Clock size={14} color="#dc2626" />
          <span>
            <strong style={{ color: "#dc2626" }}>3-day</strong> return window applies
            <span style={{ color: "#888" }}> (standard: 7 days)</span>
          </span>
        </div>

        {cartHasFashion && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 12px",
              background: "#fff",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              fontSize: "12px",
            }}
          >
            <Lock size={14} color="#dc2626" />
            <span>
              <strong style={{ color: "#dc2626" }}>Fashion returns restricted</strong> — Final sale on apparel
            </span>
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "9px 12px",
            background: "#fff",
            border: "1px solid #fecaca",
            borderRadius: "6px",
            fontSize: "12px",
          }}
        >
          <AlertTriangle size={14} color="#b45309" />
          <span style={{ color: "#555" }}>
            Future returns require AI photo inspection & quality grading
          </span>
        </div>
      </div>

      {/* Trust score meter */}
      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "5px",
            fontSize: "11px",
            color: "#666",
          }}
        >
          <span>Your Trust Score</span>
          <strong style={{ color: trustScore < 40 ? "#dc2626" : "#b45309" }}>
            {trustScore}/100
          </strong>
        </div>
        <div
          style={{
            height: "6px",
            background: "#fee2e2",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${trustScore}%`,
              background:
                trustScore < 40
                  ? "#ef4444"
                  : trustScore < 70
                  ? "#f59e0b"
                  : "#22c55e",
              borderRadius: "3px",
              transition: "width 0.8s ease",
            }}
          />
        </div>
        <p style={{ fontSize: "10px", color: "#888", marginTop: "4px" }}>
          Complete good-faith purchases to restore your return privileges.
        </p>
      </div>

      {/* Mandatory chat confirmation */}
      {!chatConfirmed ? (
        <button
          onClick={onChatConfirmed}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "11px 16px",
            background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
            border: "none",
            borderRadius: "7px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "opacity 0.2s ease",
          }}
        >
          <MessageCircle size={15} />
          Chat with Support to Proceed
        </button>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 14px",
            background: "#f0fdf4",
            border: "1px solid #86efac",
            borderRadius: "7px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#166534",
          }}
        >
          ✅ Support acknowledged — you may proceed to place your order.
        </div>
      )}
    </div>
  );
}
