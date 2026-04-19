"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800;900&display=swap');

        .splash-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #080b14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
          animation: rootFadeOut 0.4s ease 2.65s forwards;
        }

        @keyframes rootFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; pointer-events: none; }
        }

        /* Ambient glow blobs */
        .splash-blob-1 {
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(74,158,255,0.07) 0%, transparent 70%);
          pointer-events: none;
          animation: blobPulse 4s ease-in-out infinite alternate;
        }
        .splash-blob-2 {
          position: absolute;
          bottom: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%);
          pointer-events: none;
          animation: blobPulse 4s ease-in-out infinite alternate-reverse;
        }

        @keyframes blobPulse {
          from { opacity: 0.5; transform: translateX(-50%) scale(1); }
          to   { opacity: 1;   transform: translateX(-50%) scale(1.15); }
        }

        /* Content wrapper */
        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 22px;
          text-align: center;
        }

        /* 1 · Wordmark */
        .splash-wordmark {
          font-size: clamp(3.5rem, 10vw, 7rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 1;
          background: linear-gradient(135deg, #4a9eff 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0;
          transform: scale(0.88);
          animation: wordmarkIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
        }

        @keyframes wordmarkIn {
          to { opacity: 1; transform: scale(1); }
        }

        /* 2 · Slogan */
        .splash-slogan {
          font-family: 'Courier New', 'Consolas', monospace;
          font-size: clamp(0.7rem, 2vw, 0.9rem);
          font-weight: 400;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #6b7a9a;
          opacity: 0;
          animation: fadeUp 0.5s ease 0.7s forwards;
        }

        /* 3 · Gradient divider */
        .splash-divider {
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #4a9eff, #7c3aed, transparent);
          border-radius: 999px;
          animation: dividerExpand 0.5s cubic-bezier(0.22, 1, 0.36, 1) 1.2s forwards;
        }

        @keyframes dividerExpand {
          from { width: 0; opacity: 0; }
          to   { width: min(260px, 40vw); opacity: 1; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="splash-root">
        <div className="splash-blob-1" />
        <div className="splash-blob-2" />

        <div className="splash-content">
          {/* 1 · Wordmark */}
          <h1 className="splash-wordmark">Stockline</h1>

          {/* 2 · Slogan */}
          <p className="splash-slogan">SmartStock&nbsp;·&nbsp;Zero Chaos</p>

          {/* 3 · Gradient divider */}
          <div className="splash-divider" />
        </div>
      </div>
    </>
  );
}
