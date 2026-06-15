"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Factory,
  TrendingUp,
  Package,
  Leaf,
  CheckCircle,
} from "lucide-react";
import { PRODUCTS } from "@/lib/mockData";

interface ProductInsight {
  productId: string;
  productName: string;
  productImage: string;
  productHealthGrade: string;
  totalReturns: number;
  sustainabilityScore: number;
  topReturnReason: string | null;
  manufacturerFeedback: string[];
  avgAiConfidence: number;
}

const REASON_LABELS: Record<string, string> = {
  size_fit: "Size / Fit Issue",
  defective_damaged: "Defective / Damaged",
  not_as_described: "Not as Described",
  changed_mind: "Changed Mind",
  arrived_late: "Arrived Late",
  wrong_item: "Wrong Item Sent",
  other: "Other",
};

const GRADE_COLORS: Record<string, { bg: string; text: string }> = {
  "A+": { bg: "#e6f9f0", text: "#0a5c36" },
  "A":  { bg: "#e6f4ea", text: "#137333" },
  "B+": { bg: "#fef7e0", text: "#b06000" },
  "B":  { bg: "#fff8e0", text: "#a05000" },
  "C":  { bg: "#fce8e6", text: "#c5221f" },
  "D":  { bg: "#fce8e6", text: "#b31412" },
};

export default function ManufacturerDashboard() {
  const [insights, setInsights] = useState<ProductInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGrade, setFilterGrade] = useState<string>("all");

  useEffect(() => {
    async function loadInsights() {
      setLoading(true);
      // Fetch health cards for all products
      const results: ProductInsight[] = [];
      // Only fetch for products that could realistically have returns (first 10 products)
      const targetProducts = PRODUCTS.slice(0, 12);

      await Promise.all(
        targetProducts.map(async (product) => {
          try {
            const res = await fetch(`/api/health-card?productId=${product.id}`);
            const data = await res.json();
            if (data.status === "success") {
              results.push({
                productId: product.id,
                productName: product.name,
                productImage: product.image,
                productHealthGrade: data.healthCard.productHealthGrade,
                totalReturns: data.healthCard.totalReturns,
                sustainabilityScore: data.healthCard.sustainabilityScore,
                topReturnReason: data.healthCard.topReturnReason,
                manufacturerFeedback: data.healthCard.manufacturerFeedback,
                avgAiConfidence: data.healthCard.avgAiConfidence,
              });
            }
          } catch (e) {
            // skip this product
          }
        })
      );

      // Sort by total returns desc so most problematic products come first
      results.sort((a, b) => b.totalReturns - a.totalReturns);
      setInsights(results);
      setLoading(false);
    }
    loadInsights();
  }, []);

  const filtered =
    filterGrade === "all"
      ? insights
      : insights.filter((i) => i.productHealthGrade === filterGrade);

  const totalReturnsAcrossAll = insights.reduce((s, i) => s + i.totalReturns, 0);
  const avgSustainability =
    insights.length > 0
      ? Math.round(insights.reduce((s, i) => s + i.sustainabilityScore, 0) / insights.length)
      : 100;
  const flaggedCount = insights.filter((i) =>
    ["C", "D"].includes(i.productHealthGrade)
  ).length;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "30px 20px 60px" }}>
      {/* ── Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
          borderRadius: "16px",
          padding: "28px 30px",
          marginBottom: "28px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,153,0,0.1)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <Factory size={24} color="#ff9900" />
          <h1 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>Manufacturer Intelligence Dashboard</h1>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: 0 }}>
          Real-time product return analytics, quality signals, and actionable recommendations powered by Respawn AI.
        </p>
      </div>

      {/* ── Summary KPIs ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "28px" }}>
        {[
          { icon: <Package size={20} color="#7c3aed" />, label: "Total Returns Analyzed", value: String(totalReturnsAcrossAll), bg: "#faf5ff", accent: "#7c3aed" },
          { icon: <Leaf size={20} color="#16a34a" />, label: "Avg Sustainability Score", value: `${avgSustainability}%`, bg: "#f0fdf4", accent: "#16a34a" },
          { icon: <AlertTriangle size={20} color="#dc2626" />, label: "Products Flagged", value: String(flaggedCount), bg: "#fff1f0", accent: "#dc2626" },
          { icon: <TrendingUp size={20} color="#0891b2" />, label: "Products Monitored", value: String(insights.length), bg: "#e0f7fa", accent: "#0891b2" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: kpi.bg,
              borderRadius: "12px",
              padding: "18px",
              border: "1px solid rgba(0,0,0,0.06)",
              borderLeft: `4px solid ${kpi.accent}`,
            }}
          >
            <div style={{ marginBottom: "8px" }}>{kpi.icon}</div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: "#111", marginBottom: "2px" }}>{kpi.value}</div>
            <div style={{ fontSize: "11px", color: "#666" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter Controls ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", color: "#555", fontWeight: "600" }}>Filter by Grade:</span>
        {["all", "A+", "A", "B+", "B", "C", "D"].map((grade) => (
          <button
            key={grade}
            onClick={() => setFilterGrade(grade)}
            style={{
              padding: "5px 14px",
              borderRadius: "20px",
              border: filterGrade === grade ? "2px solid #0f172a" : "1px solid #ddd",
              background: filterGrade === grade ? "#0f172a" : "#fff",
              color: filterGrade === grade ? "#fff" : "#333",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {grade === "all" ? "All" : `Grade ${grade}`}
          </button>
        ))}
      </div>

      {/* ── Product Table ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#888" }}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>🔄</div>
          <p>Loading manufacturer insights...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#888", background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
          <CheckCircle size={32} color="#16a34a" style={{ margin: "0 auto 10px" }} />
          <p>No products match this filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filtered.map((insight) => {
            const gc = GRADE_COLORS[insight.productHealthGrade] || { bg: "#f3f4f6", text: "#374151" };
            const hasFlaggedReason =
              insight.topReturnReason === "defective_damaged" ||
              insight.topReturnReason === "size_fit";

            return (
              <div
                key={insight.productId}
                style={{
                  background: "#fff",
                  border: hasFlaggedReason ? "1.5px solid #fca5a5" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto",
                  gap: "16px",
                  alignItems: "start",
                }}
              >
                {/* Product image */}
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "8px",
                    backgroundImage: `url(${insight.productImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid #e5e7eb",
                    flexShrink: 0,
                  }}
                />

                {/* Main info */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#111" }}>
                      {insight.productName.substring(0, 60)}{insight.productName.length > 60 ? "…" : ""}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "11px",
                        fontWeight: "800",
                        background: gc.bg,
                        color: gc.text,
                      }}
                    >
                      Grade {insight.productHealthGrade}
                    </span>
                    {hasFlaggedReason && (
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: "700",
                          background: "#fff1f0",
                          color: "#dc2626",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AlertTriangle size={10} /> Action Required
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#666", marginBottom: "10px", flexWrap: "wrap" }}>
                    <span>📦 {insight.totalReturns} returns</span>
                    <span>🌱 {insight.sustainabilityScore}% sustainability</span>
                    {insight.topReturnReason && (
                      <span>🔍 Top issue: <strong style={{ color: "#333" }}>{REASON_LABELS[insight.topReturnReason] || insight.topReturnReason}</strong></span>
                    )}
                  </div>

                  {/* Feedback bullets */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {insight.manufacturerFeedback.slice(0, 2).map((fb, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: "11px",
                          color: "#0c4a6e",
                          background: "#f0f9ff",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          borderLeft: "3px solid #0891b2",
                        }}
                      >
                        💬 {fb}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                  <Link
                    href={`/health-card/${insight.productId}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "7px 14px",
                      background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
                      color: "#fff",
                      borderRadius: "7px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Health Card <ArrowRight size={12} />
                  </Link>
                  <Link
                    href={`/products/${insight.productId}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "7px 14px",
                      background: "#f9fafb",
                      color: "#374151",
                      border: "1px solid #d1d5db",
                      borderRadius: "7px",
                      fontSize: "12px",
                      fontWeight: "600",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Feedback Loop Note ── */}
      <div
        style={{
          marginTop: "32px",
          padding: "20px",
          background: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)",
          border: "1px solid #fde047",
          borderRadius: "12px",
          fontSize: "13px",
          color: "#713f12",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", marginBottom: "8px" }}>
          <ShieldCheck size={16} color="#ca8a04" />
          Layer 4: Prevention Feedback Loop Active
        </div>
        <p style={{ margin: 0, lineHeight: "1.6" }}>
          Every return outcome automatically feeds back into the risk model. Customers who make good-faith purchases have their
          trust scores restored. Manufacturer insights from this dashboard help reduce future return rates by flagging
          sizing, quality, and description issues at the source.
        </p>
      </div>
    </div>
  );
}
