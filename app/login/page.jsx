"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { auth, saveSession } from "@/lib/api";

function getStrength(val) {
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    { w: "0%",   color: "#ef4444", label: "" },
    { w: "25%",  color: "#ef4444", label: "Weak" },
    { w: "50%",  color: "#f59e0b", label: "Fair" },
    { w: "75%",  color: "#3b82f6", label: "Good" },
    { w: "100%", color: "#10b981", label: "Strong ✓" },
  ];
  return levels[score] || levels[0];
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: apiErr } = await auth.login(email, password);
    setLoading(false);
    if (apiErr || !data) { setError(apiErr || "Unknown error occurred"); return; }
    
    // Actually save the session!
    saveSession(data.token, data.user);
    
    // Redirect to dashboard
    router.replace("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#080b14",
      fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "1rem"
    }}>
      {/* ambient blobs */}
      <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,242,254,0.05) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", left: "50%", transform: "translateX(-50%)", width: 500, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(74,158,255,0.06) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: 420, position: "relative",
        background: "rgba(11,17,33,0.85)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, padding: "2.5rem 2rem",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)"
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0,
            background: "linear-gradient(135deg, #ffffff 30%, #4a9eff 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>Stockline</h1>
          <p style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.7)", marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>Smart Stock. Zero Chaos.</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "0.65rem 1rem", marginBottom: "1.25rem", fontSize: "0.8rem", color: "#f87171", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Email Address</label>
            <input
              id="login-email"
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@college.edu"
              style={{ width: "100%", padding: "0.75rem 1rem", background: "#080b14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#4a9eff"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPwd ? "text" : "password"} required
                maxLength={12} autoComplete="current-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ width: "100%", padding: "0.75rem 2.75rem 0.75rem 1rem", background: "#080b14", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor = "#4a9eff"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 4 }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 3, borderRadius: 2, background: "#1e293b" }}>
                  <div style={{ height: "100%", width: strength.w, borderRadius: 2, background: strength.color, transition: "width 0.3s, background 0.3s" }} />
                </div>
                <span style={{ fontSize: "0.68rem", color: strength.color, display: "block", marginTop: 4 }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Hint */}
          <p style={{ fontSize: "0.68rem", color: "#475569", marginBottom: "1.5rem", marginTop: 4 }}>
            Max 12 characters · uppercase · number · symbol
          </p>

          <button
            id="login-btn"
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "0.85rem", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #4a9eff, #7c3aed)", color: "#fff", fontWeight: 700, fontSize: "0.9rem",
              letterSpacing: "0.05em", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 0 20px rgba(74,158,255,0.3)", transition: "opacity 0.2s, transform 0.15s"
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "#475569" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ color: "#4a9eff", fontWeight: 700, textDecoration: "none" }}>Register here</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #334155; }
      `}</style>
    </div>
  );
}
