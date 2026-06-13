"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser } = useApp();
  const [loginKey, setLoginKey] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginKey || !password) {
      setError("Please enter all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch request targeting our newly created backend Express API
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loginKey, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        loginUser({
          id: data.user.userId,
          name: data.user.username,
          pincode: "110001", // Default address pincode
          city: "Delhi",
        });
        router.push("/orders");
      } else {
        setError(data.message || "Invalid username/email or password.");
      }
    } catch (err) {
      console.warn("Backend server not reachable, falling back to simulated login validation.", err);
      
      // Fallback fallback simulated login matching backend presets
      if (loginKey === "Vishal Rawat" && password === "password123") {
        loginUser({
          id: "acc-1",
          name: "Vishal Rawat",
          pincode: "110001",
          city: "Delhi",
        });
        router.push("/orders");
      } else if (loginKey === "Anjali Panwar" && password === "password123") {
        loginUser({
          id: "acc-2",
          name: "Anjali Panwar",
          pincode: "560001",
          city: "Bengaluru",
        });
        router.push("/orders");
      } else {
        setError("Invalid username/email or password (unreachable database fallback).");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Brand Logo Header */}
      <div style={styles.logoContainer}>
        <Link href="/" style={styles.logoText}>
          respawn<span style={styles.logoDot}>.</span>
        </Link>
      </div>

      {/* Main Form Box */}
      <div style={styles.card}>
        <h1 style={styles.title}>Sign in</h1>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} style={styles.alertIcon} />
            <div style={styles.errorText}>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="loginKey">Email or Username</label>
            <input
              id="loginKey"
              type="text"
              value={loginKey}
              onChange={(e) => setLoginKey(e.target.value)}
              style={styles.input}
              placeholder="Enter your email or username"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.passwordHeader}>
              <label style={styles.label} htmlFor="password">Password</label>
              <a href="#" style={styles.forgotLink}>Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} style={styles.primaryButton}>
            {loading ? (
              <span className="spinner" style={styles.spinner}></span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p style={styles.terms}>
          By continuing, you agree to RESPawn's <a href="#">Conditions of Use</a> and <a href="#">Privacy Notice</a>.
        </p>
      </div>

      {/* Redirect Link to Registration */}
      <div style={styles.dividerContainer}>
        <span style={styles.dividerLine}></span>
        <span style={styles.dividerText}>New to RESPawn?</span>
        <span style={styles.dividerLine}></span>
      </div>

      <Link href="/signup" style={styles.secondaryButton}>
        Create your RESPawn account
      </Link>

      {/* Footer Disclaimer */}
      <div style={styles.footer}>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>Conditions of Use</a>
          <a href="#" style={styles.footerLink}>Privacy Notice</a>
          <a href="#" style={styles.footerLink}>Help</a>
        </div>
        <p style={styles.footerCopy}>© 2026, RESPawn clone. Built for AI Returns Verification.</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#ffffff",
    padding: "20px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  logoContainer: {
    marginBottom: "18px",
  },
  logoText: {
    fontSize: "30px",
    fontWeight: "800",
    color: "var(--amazon-navy, #131921)",
    letterSpacing: "-1.5px",
    textDecoration: "none",
  },
  logoDot: {
    color: "var(--amazon-orange, #f3a847)",
  },
  card: {
    width: "100%",
    maxWidth: "350px",
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "26px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },
  title: {
    fontSize: "28px",
    fontWeight: "400",
    marginBottom: "18px",
    color: "#111",
  },
  errorAlert: {
    display: "flex",
    alignItems: "flex-start",
    backgroundColor: "#fff8f8",
    border: "1px solid #c40000",
    borderRadius: "4px",
    padding: "10px 12px",
    marginBottom: "15px",
  },
  alertIcon: {
    color: "#c40000",
    marginRight: "8px",
    flexShrink: 0,
    marginTop: "2px",
  },
  errorText: {
    fontSize: "12px",
    color: "#c40000",
    lineHeight: "1.4",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#111",
  },
  forgotLink: {
    fontSize: "12px",
    color: "#007185",
    textDecoration: "none",
  },
  input: {
    padding: "8px 10px",
    fontSize: "13px",
    border: "1px solid #a6a6a6",
    borderRadius: "4px",
    outline: "none",
    transition: "border-color 0.15s ease",
  },
  primaryButton: {
    backgroundColor: "var(--amazon-orange, #f3a847)",
    backgroundImage: "linear-gradient(to bottom, #f7dfa5, #f0c14b)",
    border: "1px solid #a88734",
    borderRadius: "4px",
    padding: "8px 14px",
    fontSize: "13px",
    fontWeight: "500",
    color: "#111",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "34px",
    transition: "background 0.2s ease",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(0,0,0,0.1)",
    borderTopColor: "#111",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  terms: {
    fontSize: "12px",
    color: "#555",
    marginTop: "16px",
    lineHeight: "1.5",
  },
  dividerContainer: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: "350px",
    margin: "20px 0",
  },
  dividerLine: {
    flexGrow: 1,
    height: "1px",
    backgroundColor: "#e7e7e7",
  },
  dividerText: {
    fontSize: "12px",
    color: "#767676",
    padding: "0 10px",
    whiteSpace: "nowrap",
  },
  secondaryButton: {
    width: "100%",
    maxWidth: "350px",
    backgroundColor: "#f0f2f2",
    backgroundImage: "linear-gradient(to bottom, #f7f8f8, #e7e9ec)",
    border: "1px solid #adb1b8",
    borderRadius: "4px",
    padding: "8px 14px",
    fontSize: "13px",
    color: "#111",
    textAlign: "center",
    cursor: "pointer",
    textDecoration: "none",
    boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset",
  },
  footer: {
    marginTop: "40px",
    textAlign: "center",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
    width: "100%",
    maxWidth: "350px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    marginBottom: "10px",
  },
  footerLink: {
    fontSize: "11px",
    color: "#007185",
    textDecoration: "none",
  },
  footerCopy: {
    fontSize: "11px",
    color: "#555",
  },
};
