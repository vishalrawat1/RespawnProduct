"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  BarChart3,
  Leaf,
  QrCode,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Package,
  TrendingDown,
  Wrench,
  Heart,
} from "lucide-react";
import { PRODUCTS } from "@/lib/mockData";

interface HealthCard {
  productId: string;
  totalReturns: number;
  gradeDistribution: Record<string, number>;
  reasonDistribution: Record<string, number>;
  routingDistribution: { LOCAL_STORE_RESELL: number; RESELL_AS_IS: number; REFURBISH: number; DONATE: number };
  routingLabels: { LOCAL_STORE_RESELL: string; RESELL_AS_IS: string; REFURBISH: string; DONATE: string };
  topReturnReason: string | null;
  avgAiConfidence: number;
  sustainabilityScore: number;
  productHealthGrade: string;
  manufacturerFeedback: string[];
  qrCodeUrl: string;
  healthCardUrl: string;
  generatedAt: string;
}

const GRADE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "A+": { bg: "#e6f9f0", text: "#0a5c36", border: "#0a5c36" },
  "A":  { bg: "#e6f4ea", text: "#137333", border: "#137333" },
  "B+": { bg: "#fef7e0", text: "#b06000", border: "#f29900" },
  "B":  { bg: "#fff8e0", text: "#a05000", border: "#f0a000" },
  "C":  { bg: "#fce8e6", text: "#c5221f", border: "#c5221f" },
  "D":  { bg: "#fce8e6", text: "#b31412", border: "#b31412" },
};

const REASON_LABELS: Record<string, string> = {
  size_fit: "Size / Fit Issue",
  defective_damaged: "Defective / Damaged",
  not_as_described: "Not as Described",
  changed_mind: "Changed Mind",
  arrived_late: "Arrived Late",
  wrong_item: "Wrong Item Sent",
  other: "Other",
};

const ROUTING_ICONS: Record<string, React.ReactNode> = {
  LOCAL_STORE_RESELL: <CheckCircle size={16} color="#0284c7" />,
  RESELL_AS_IS: <CheckCircle size={16} color="#16a34a" />,
  REFURBISH: <Wrench size={16} color="#d97706" />,
  DONATE: <Heart size={16} color="#7c3aed" />,
};

export default function HealthCardPage() {
  const params = useParams();
  const productId = params.productId as string;
  const [healthCard, setHealthCard] = useState<HealthCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const product = PRODUCTS.find((p) => p.id === productId);

  useEffect(() => {
    async function fetchHealthCard() {
      setLoading(true);
      try {
        const res = await fetch(`/api/health-card?productId=${productId}`);
        const data = await res.json();
        if (data.status === "success") {
          setHealthCard(data.healthCard);
        } else {
          setError(data.message || "Failed to load health card");
        }
      } catch (e) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    if (productId) fetchHealthCard();
  }, [productId]);

  const gradeStyle = (grade: string) =>
    GRADE_COLORS[grade] || { bg: "#f3f4f6", text: "#374151", border: "#9ca3af" };

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔍</div>
          <p style={{ color: "#666", fontSize: "14px" }}>Loading Product Health Card...</p>
        </div>
      </div>
    );
  }

  if (error || !healthCard) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <AlertCircle size={40} color="#ef4444" style={{ margin: "0 auto 10px" }} />
          <p style={{ color: "#666" }}>{error || "Health card not available"}</p>
          <Link href="/" className="btn-gray" style={{ marginTop: "15px", display: "inline-block", padding: "8px 16px" }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const gs = gradeStyle(healthCard.productHealthGrade);
  const totalReturns = healthCard.totalReturns;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "30px 20px 60px" }}>
      {/* Back link */}
      <Link
        href={`/products/${productId}`}
        style={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "#007185", fontSize: "13px", marginBottom: "24px" }}
      >
        <ArrowLeft size={14} /> Back to Product
      </Link>

      {/* ── Hero Header ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          borderRadius: "16px",
          padding: "30px",
          marginBottom: "24px",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,153,0,0.08)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-20px", width: "200px", height: "200px", borderRadius: "50%", background: "rgba(255,153,0,0.05)" }} />

        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px", position: "relative" }}>
          {/* Product image */}
          {product && (
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "10px",
                backgroundImage: `url(${product.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                flexShrink: 0,
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            />
          )}

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <ShieldCheck size={18} color="#ff9900" />
              <span style={{ fontSize: "12px", color: "#ff9900", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase" }}>
                Respawn Product Health Card
              </span>
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "4px", lineHeight: "1.3" }}>
              {product?.name || productId}
            </h1>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Generated {new Date(healthCard.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Grade Badge */}
          <div
            style={{
              flexShrink: 0,
              background: gs.bg,
              border: `2px solid ${gs.border}`,
              borderRadius: "12px",
              padding: "10px 18px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: "900", color: gs.text, lineHeight: 1 }}>
              {healthCard.productHealthGrade}
            </div>
            <div style={{ fontSize: "9px", color: gs.text, fontWeight: "700", marginTop: "3px", letterSpacing: "0.5px" }}>
              HEALTH GRADE
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "24px" }}>
        {[
          { icon: <Package size={18} color="#7c3aed" />, label: "Total Returns", value: totalReturns === 0 ? "None" : String(totalReturns), bg: "#faf5ff" },
          { icon: <ShieldCheck size={18} color="#0891b2" />, label: "AI Confidence", value: totalReturns > 0 ? `${healthCard.avgAiConfidence}%` : "N/A", bg: "#e0f7fa" },
          { icon: <Leaf size={18} color="#16a34a" />, label: "Sustainability", value: `${healthCard.sustainabilityScore}%`, bg: "#f0fdf4" },
          { icon: <BarChart3 size={18} color="#ea580c" />, label: "Diverted from Landfill", value: totalReturns > 0 ? `${healthCard.routingDistribution.LOCAL_STORE_RESELL + healthCard.routingDistribution.RESELL_AS_IS + healthCard.routingDistribution.REFURBISH} items` : "0 items", bg: "#fff7ed" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: stat.bg,
              borderRadius: "10px",
              padding: "16px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#111", marginBottom: "2px" }}>{stat.value}</div>
            <div style={{ fontSize: "11px", color: "#666" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        {/* ── Return Reasons ── */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "7px" }}>
            <TrendingDown size={16} color="#dc2626" /> Return Reasons
          </h3>
          {totalReturns === 0 ? (
            <p style={{ color: "#888", fontSize: "13px" }}>✅ No returns recorded for this product yet.</p>
          ) : (
            Object.entries(healthCard.reasonDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([reason, count]) => {
                const pct = Math.round((count / totalReturns) * 100);
                return (
                  <div key={reason} style={{ marginBottom: "10px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "3px" }}>
                      <span style={{ color: "#333" }}>{REASON_LABELS[reason] || reason}</span>
                      <span style={{ fontWeight: "700", color: "#111" }}>{pct}%</span>
                    </div>
                    <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #ff9900, #e47911)",
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* ── Routing Distribution ── */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "7px" }}>
            <RefreshCw size={16} color="#16a34a" /> Smart Routing Outcomes
          </h3>
          {totalReturns === 0 ? (
            <p style={{ color: "#888", fontSize: "13px" }}>No routing data available yet.</p>
          ) : (
            (["LOCAL_STORE_RESELL", "RESELL_AS_IS", "REFURBISH", "DONATE"] as const).map((path) => {
              const count = healthCard.routingDistribution[path];
              const pct = Math.round((count / totalReturns) * 100);
              return (
                <div key={path} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                    {ROUTING_ICONS[path]}
                    <span style={{ fontSize: "12px", color: "#333", flex: 1 }}>
                      {healthCard.routingLabels[path]}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#111" }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background:
                          path === "LOCAL_STORE_RESELL"
                            ? "linear-gradient(90deg, #0284c7, #38bdf8)"
                            : path === "RESELL_AS_IS"
                            ? "linear-gradient(90deg, #16a34a, #22c55e)"
                            : path === "REFURBISH"
                            ? "linear-gradient(90deg, #d97706, #f59e0b)"
                            : "linear-gradient(90deg, #7c3aed, #a78bfa)",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Manufacturer Feedback ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          border: "1px solid #bae6fd",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "#0369a1", display: "flex", alignItems: "center", gap: "7px" }}>
          🏭 Manufacturer Feedback Loop
        </h3>
        {healthCard.manufacturerFeedback.map((fb, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
              marginBottom: i < healthCard.manufacturerFeedback.length - 1 ? "10px" : 0,
              fontSize: "13px",
              color: "#0c4a6e",
              padding: "10px 12px",
              background: "rgba(255,255,255,0.7)",
              borderRadius: "8px",
              border: "1px solid rgba(186,230,253,0.5)",
            }}
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>💬</span>
            <span>{fb}</span>
          </div>
        ))}
      </div>

      {/* ── QR Code & Audit Trail ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          gap: "20px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
            <QrCode size={16} color="#374151" />
            <strong style={{ fontSize: "14px" }}>QR Audit Code</strong>
          </div>
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "10px", maxWidth: "300px" }}>
            Resale buyers can scan this code to view the complete return & condition history of this product before purchasing.
          </p>
          <code style={{ fontSize: "10px", color: "#888", wordBreak: "break-all" }}>
            {healthCard.healthCardUrl}
          </code>
        </div>
        <div style={{ flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={healthCard.qrCodeUrl}
            alt="QR Code for Health Card"
            width={120}
            height={120}
            style={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
          />
        </div>
      </div>

      {/* ── Customer Tip ── */}
      <div
        style={{
          marginTop: "20px",
          padding: "14px 18px",
          background: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: "10px",
          fontSize: "12px",
          color: "#78350f",
          display: "flex",
          gap: "8px",
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: "16px" }}>💡</span>
        <span>
          <strong>Customer Tip:</strong>{" "}
          {healthCard.topReturnReason === "size_fit"
            ? "This product has sizing return history — check the size guide carefully before ordering."
            : healthCard.topReturnReason === "defective_damaged"
            ? "Some units have been reported defective — inspect packaging on delivery."
            : "This product has a clean health record. Returned units are routed responsibly."}
        </span>
      </div>
    </div>
  );
}
