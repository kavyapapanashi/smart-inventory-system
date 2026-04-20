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
    { w: "25%",  color: "#ef4444", label: "Weak — add uppercase, number & symbol" },
    { w: "50%",  color: "#f59e0b", label: "Fair" },
    { w: "75%",  color: "#3b82f6", label: "Good" },
    { w: "100%", color: "#10b981", label: "Strong ✓" },
  ];
  return levels[score] || levels[0];
}

function validatePassword(val) {
  if (val.length < 8)  return "Password must be at least 8 characters";
  if (val.length > 12) return "Password must be at most 12 characters";
  if (!/[A-Z]/.test(val)) return "Password needs an uppercase letter";
  if (!/[0-9]/.test(val)) return "Password needs a number";
  if (!/[^A-Za-z0-9]/.test(val)) return "Password needs a symbol (e.g. @, #, !)";
  return null;
}

const inputStyle = {
  width: "100%", padding: "0.75rem 1rem", background: "#080b14",
  border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
  color: "#fff", fontSize: "0.875rem", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s"
};
const labelStyle = {
  display: "block", fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8",
  textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const strength = getStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const pwdErr = validatePassword(password);
    if (pwdErr) { setError(pwdErr); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    const { error: apiErr } = await auth.register(name, email, password, role);
    if (apiErr) { 
      setLoading(false);
      setError(apiErr); 
      return; 
    }
    
    // Automatically log the user in after successful registration!
    const { data: loginData, error: loginErr } = await auth.login(email, password);
    setLoading(false);
    
    if (loginErr || !loginData) {
      // If auto-login somehow fails, fallback to manual login screen
      router.replace("/login");
      return;
    }
    
    // Actually save the session!
    saveSession(loginData.token, loginData.user);
    
    // Send directly to dashboard!
    router.replace("/dashboard");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#080b14",
      fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "1rem"
    }}>
      {/* ambient blobs */}
      <div style={{ position: "fixed", top: "10%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(124,58,237,0.05) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", left: "50%", transform: "translateX(-50%)", width: 500, height: 200, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(74,158,255,0.06) 0%, transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{
        width: "100%", maxWidth: 440, position: "relative",
        background: "rgba(11,17,33,0.85)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20, padding: "2.5rem 2rem",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)"
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{
            fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.04em", margin: 0,
            background: "linear-gradient(135deg, #ffffff 30%, #7c3aed 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
          }}>Stockline</h1>
          <p style={{ fontSize: "0.75rem", color: "rgba(148,163,184,0.7)", marginTop: 6, letterSpacing: "0.15em", textTransform: "uppercase" }}>Create your account</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "0.65rem 1rem", marginBottom: "1.25rem", fontSize: "0.8rem", color: "#f87171", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={labelStyle}>Full Name</label>
            <input id="reg-name" type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="John Doe" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#7c3aed"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={labelStyle}>Email Address</label>
            <input id="reg-email" type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="name@college.edu" style={inputStyle}
              onFocus={e => e.target.style.borderColor = "#7c3aed"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
          </div>

          {/* Role */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={labelStyle}>Role</label>
            <select id="reg-role" value={role} onChange={e => setRole(e.target.value)}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.1rem" }}>
            <label style={labelStyle}>Password <span style={{ color: "#475569", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(8–12 chars)</span></label>
            <div style={{ position: "relative" }}>
              <input id="reg-password" type={showPwd ? "text" : "password"} required
                maxLength={12} autoComplete="new-password"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8, max 12 characters"
                style={{ ...inputStyle, paddingRight: "2.75rem" }}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"} />
              <button type="button" onClick={() => setShowPwd(v => !v)} tabIndex={-1}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 4 }}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 3, borderRadius: 2, background: "#1e293b" }}>
                  <div style={{ height: "100%", width: strength.w, borderRadius: 2, background: strength.color, transition: "width 0.3s, background 0.3s" }} />
                </div>
                <span style={{ fontSize: "0.68rem", color: strength.color, display: "block", marginTop: 4 }}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "0.5rem" }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <input id="reg-confirm" type={showConfirm ? "text" : "password"} required
                maxLength={12} autoComplete="new-password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat password"
                style={{
                  ...inputStyle, paddingRight: "2.75rem",
                  borderColor: confirm && confirm !== password ? "#ef4444" : "rgba(255,255,255,0.08)"
                }}
                onFocus={e => e.target.style.borderColor = confirm && confirm !== password ? "#ef4444" : "#7c3aed"}
                onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? "#ef4444" : "rgba(255,255,255,0.08)"} />
              <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", padding: 4 }}>
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirm && confirm !== password && (
              <span style={{ fontSize: "0.68rem", color: "#ef4444", display: "block", marginTop: 4 }}>Passwords do not match</span>
            )}
          </div>

          {/* Rules hint */}
          <p style={{ fontSize: "0.68rem", color: "#475569", marginBottom: "1.5rem", marginTop: 6 }}>
            Must include uppercase letter, number &amp; symbol (e.g. @, #, !)
          </p>

          <button
            id="register-btn"
            type="submit" disabled={loading}
            style={{
              width: "100%", padding: "0.85rem", borderRadius: 12, border: "none", cursor: loading ? "not-allowed" : "pointer",
              background: "linear-gradient(135deg, #7c3aed, #4a9eff)", color: "#fff", fontWeight: 700, fontSize: "0.9rem",
              letterSpacing: "0.05em", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 0 20px rgba(124,58,237,0.3)", transition: "opacity 0.2s"
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.8rem", color: "#475569" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#7c3aed", fontWeight: 700, textDecoration: "none" }}>Sign In</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder, select option { color: #334155; background: #080b14; }
      `}</style>
    </div>
  );
}
