"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SplashScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Phase 1: brand fades in (after 300ms)
    const t1 = setTimeout(() => setPhase(1), 300);
    // Phase 2: slogan + divider appear (after 900ms)
    const t2 = setTimeout(() => setPhase(2), 900);
    // Phase 3: credit appears (after 1500ms)
    const t3 = setTimeout(() => setPhase(3), 1500);
    // Redirect to dashboard (after 5000ms) - Increased to 5 seconds
    const t4 = setTimeout(() => router.replace("/dashboard"), 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [router]);

  return (
    <div
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#080b14",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        fontFamily: "var(--font-jakarta-sans, 'Plus Jakarta Sans', sans-serif)",
        overflow: "hidden"
      }}
    >
      {/* Ambient Pearlescent tracking cursor for splash screen */}
      <div 
        style={{
          position: "absolute",
          top: mousePos.y - 400,
          left: mousePos.x - 400,
          width: 800,
          height: 800,
          borderRadius: "50%",
          // Pearl effect: Bright core -> Soft white/cyan -> Lavender shift -> Cyan fade
          background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(224,247,250,0.08) 25%, rgba(243,232,255,0.05) 45%, rgba(0,242,254,0.02) 70%, transparent 80%)",
          filter: "blur(50px)",
          pointerEvents: "none",
          transition: "top 0.4s ease-out, left 0.4s ease-out", // Smooth tracking
        }}
      />

      {/* Ambient fixed blobs (Bioluminescence) */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(0,242,254,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(2,132,199,0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Brand name */}
      <h1
        style={{
          fontSize: "clamp(3rem, 8vw, 6rem)",
          fontWeight: 900,
          letterSpacing: "-0.04em",
          background: "linear-gradient(135deg, #ffffff 30%, #4a9eff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          margin: 0,
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "translateY(0) scale(1)" : "translateY(16px) scale(0.96)",
          transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        Stockline
      </h1>

      {/* Gradient divider */}
      <div
        style={{
          width: phase >= 2 ? 220 : 0,
          height: 2,
          marginTop: 18,
          background: "linear-gradient(90deg, transparent, #4a9eff, #7c3aed, transparent)",
          borderRadius: 2,
          opacity: phase >= 2 ? 1 : 0,
          transition: "width 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s, opacity 0.5s ease 0.05s",
        }}
      />

      {/* Slogan */}
      <p
        style={{
          marginTop: 16,
          fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
          fontWeight: 600,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(148,163,184,0.9)",
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
        }}
      >
        Smart Stock, Zero Chaos
      </p>

      {/* Credit / loading indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
        }}
      >
        {/* Animated dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#00f2fe",
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                boxShadow: "0 0 10px rgba(0,242,254,0.5)"
              }}
            />
          ))}
        </div>
        <span
          style={{
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(100,116,139,0.8)",
          }}
        >
          GMIT · Smart Inventory System
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
