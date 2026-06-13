"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { loginUser } = useApp();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Fetch request targeting our newly created backend Express API register endpoint
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        setSuccess("Account created successfully!");
        
        // Log user in automatically after registration
        loginUser({
          id: data.user.userId,
          name: data.user.username,
          pincode: "110001",
          city: "Delhi",
        });

        setTimeout(() => {
          router.push("/orders");
        }, 1200);
      } else {
        setError(data.message || "Could not register user. Try another username/email.");
      }
    } catch (err) {
      console.warn("Backend server not reachable, falling back to simulated registration.", err);
      
      // Fallback fallback simulated sign-up
      setSuccess("Account created successfully (simulation mode)!");
      loginUser({
        id: `mock-user-${Date.now()}`,
        name: username,
        pincode: "110001",
        city: "Delhi",
      });

      setTimeout(() => {
        router.push("/orders");
      }, 1200);
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
        <h1 style={styles.title}>Create Account</h1>

        {error && (
          <div style={styles.errorAlert}>
            <AlertCircle size={18} style={styles.alertIcon} />
            <div style={styles.errorText}>{error}</div>
          </div>
        )}

        {success && (
          <div style={styles.successAlert}>
            <div style={styles.successText}>{success}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="username">Your name</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="First and last name"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
            <span style={styles.infoText}>Passwords are saved securely in plain-text format per configuration.</span>
          </div>

          <button type="submit" disabled={loading} style={styles.primaryButton}>
            {loading ? (
              <span className="spinner" style={styles.spinner}></span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div style={styles.signinRedirect}>
          Already have an account? <Link href="/login" style={styles.signinLink}>Sign in</Link>
        </div>
      </div>

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
  successAlert: {
    backgroundColor: "#f4fdf4",
    border: "1px solid #007600",
    borderRadius: "4px",
    padding: "10px 12px",
    marginBottom: "15px",
  },
  successText: {
    fontSize: "12px",
    color: "#007600",
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
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#111",
  },
  input: {
    padding: "8px 10px",
    fontSize: "13px",
    border: "1px solid #a6a6a6",
    borderRadius: "4px",
    outline: "none",
    transition: "border-color 0.15s ease",
  },
  infoText: {
    fontSize: "11px",
    color: "#555",
    lineHeight: "1.3",
    marginTop: "2px",
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
    marginTop: "6px",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(0,0,0,0.1)",
    borderTopColor: "#111",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  signinRedirect: {
    fontSize: "13px",
    color: "#333",
    marginTop: "20px",
    borderTop: "1px solid #eee",
    paddingTop: "15px",
  },
  signinLink: {
    color: "#007185",
    textDecoration: "none",
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
