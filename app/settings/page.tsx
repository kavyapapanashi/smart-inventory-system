"use client";

import { useState, FormEvent } from "react";
import {
  Users,
  Mail,
  Send,
  GraduationCap,
  Code2,
  Heart,
  ChevronRight,
} from "lucide-react";

/* ─── DATA ──────────────────────────────────────────────── */
const contributors = [
  { name: "Pushpa B R",   initials: "PB", hue: "#4a9eff" },
  { name: "Kavya P",      initials: "KP", hue: "#7c3aed" },
  { name: "Lakshmi H N",  initials: "LH", hue: "#06b6d4" },
];

/* ─── COMPONENT ─────────────────────────────────────────── */
export default function SettingsPage() {
  const [tab, setTab] = useState<"about" | "query">("about");

  /* form state */
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`
    );
    const subject = encodeURIComponent(form.subject || "Query from Stockline");
    window.location.href = `mailto:stockline.support@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">

      {/* ── Page Header ── */}
      <header className="mb-8">
        <span className="inline-block px-3 py-1 bg-[#4a9eff]/10 border border-[#4a9eff]/20 text-[#4a9eff] text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
          Settings
        </span>
        <h2 className="text-4xl font-black tracking-tight text-white mb-1">
          Settings & Info
        </h2>
        <p className="text-sm text-slate-400">
          Learn about the team or reach out for support.
        </p>
      </header>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-2 mb-8 p-1 bg-[#0f1623] border border-[#1a2035] rounded-xl w-fit">
        <button
          onClick={() => setTab("about")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            tab === "about"
              ? "text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200"
          }`}
          style={
            tab === "about"
              ? { background: "linear-gradient(135deg, #4a9eff, #7c3aed)" }
              : {}
          }
        >
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            About Us
          </span>
        </button>
        <button
          onClick={() => setTab("query")}
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            tab === "query"
              ? "text-white shadow-lg"
              : "text-slate-400 hover:text-slate-200"
          }`}
          style={
            tab === "query"
              ? { background: "linear-gradient(135deg, #4a9eff, #7c3aed)" }
              : {}
          }
        >
          <span className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Query / Support
          </span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1 — ABOUT US
      ══════════════════════════════════════════════════════ */}
      {tab === "about" && (
        <div className="space-y-8 animate-fadeIn">

          {/* Section heading */}
          <div className="text-center mb-2">
            <h3
              className="text-3xl font-black tracking-tight mb-2"
              style={{
                background: "linear-gradient(135deg, #4a9eff, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Meet the Team
            </h3>
            <p className="text-slate-400 text-sm">
              Built with purpose by CSE students
            </p>
          </div>

          {/* Coordinator badge */}
          <div className="flex justify-center">
            <div className="flex items-center gap-3 px-5 py-3 bg-[#0f1623] border border-[#1a2035] rounded-xl">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #4a9eff, #7c3aed)" }}
              >
                KS
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-sm">Khadergouse Savanur</span>
                <span className="text-[10px] text-[#4a9eff] uppercase tracking-widest font-semibold">
                  Project Coordinator
                </span>
              </div>
              <GraduationCap className="w-5 h-5 text-slate-500 ml-2" />
            </div>
          </div>

          {/* 3 Contributor profile cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contributors.map((c) => (
              <div
                key={c.name}
                className="group bg-[#0f1623] border border-[#1a2035] rounded-2xl p-6 flex flex-col items-center gap-4
                           transition-all duration-200 hover:-translate-y-1 cursor-default"
                style={{
                  "--glow": c.hue,
                } as React.CSSProperties}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    `0 0 22px ${c.hue}33, 0 0 0 1px ${c.hue}44`;
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${c.hue}55`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "#1a2035";
                }}
              >
                {/* Avatar with gradient border glow */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-black text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${c.hue}22, ${c.hue}44)`,
                    border: `2px solid ${c.hue}66`,
                    boxShadow: `0 0 20px ${c.hue}44`,
                  }}
                >
                  {c.initials}
                </div>

                <div className="text-center">
                  <p className="text-white font-bold text-base">{c.name}</p>
                  <span
                    className="inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      background: `${c.hue}18`,
                      color: c.hue,
                      border: `1px solid ${c.hue}33`,
                    }}
                  >
                    Project Developer
                  </span>
                </div>

                <Code2 className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            ))}
          </div>

          {/* Additional contributors */}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Heart className="w-3.5 h-3.5 text-[#7c3aed]" />
            <span>Additional contributors: <span className="text-slate-300 font-medium">Maanvi &amp; team</span></span>
          </div>

          {/* Project footer card */}
          <div
            className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border"
            style={{
              background: "linear-gradient(135deg, rgba(74,158,255,0.06), rgba(124,58,237,0.06))",
              borderColor: "#1a2035",
            }}
          >
            <div>
              <h4
                className="text-2xl font-black tracking-tight mb-0.5"
                style={{
                  background: "linear-gradient(135deg, #4a9eff, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Stockline
              </h4>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-mono mb-1">
                SmartStock · Zero Chaos
              </p>
              <p className="text-slate-500 text-xs flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                GMIT — Department of CSE
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-xs">
                © 2026 Stockline. All rights reserved.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2 — QUERY / SUPPORT
      ══════════════════════════════════════════════════════ */}
      {tab === "query" && (
        <div className="max-w-2xl mx-auto animate-fadeIn">

          {/* Heading */}
          <div className="mb-8">
            <h3
              className="text-3xl font-black tracking-tight mb-2"
              style={{
                background: "linear-gradient(135deg, #4a9eff, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Have a Query?
            </h3>
            <p className="text-slate-400 text-sm">
              Fill the form below and we&apos;ll get back to you.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-[#0f1623] border border-[#1a2035] rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  className="w-full px-4 py-3 bg-[#080b14] border border-[#1a2035] rounded-xl text-white text-sm placeholder-slate-600
                             outline-none transition-all duration-200
                             focus:border-[#4a9eff] focus:shadow-[0_0_0_3px_rgba(74,158,255,0.12)]"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-[#080b14] border border-[#1a2035] rounded-xl text-white text-sm placeholder-slate-600
                             outline-none transition-all duration-200
                             focus:border-[#4a9eff] focus:shadow-[0_0_0_3px_rgba(74,158,255,0.12)]"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief topic of your query"
                  className="w-full px-4 py-3 bg-[#080b14] border border-[#1a2035] rounded-xl text-white text-sm placeholder-slate-600
                             outline-none transition-all duration-200
                             focus:border-[#4a9eff] focus:shadow-[0_0_0_3px_rgba(74,158,255,0.12)]"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Describe your issue or question in detail..."
                  className="w-full px-4 py-3 bg-[#080b14] border border-[#1a2035] rounded-xl text-white text-sm placeholder-slate-600
                             outline-none transition-all duration-200 resize-none
                             focus:border-[#4a9eff] focus:shadow-[0_0_0_3px_rgba(74,158,255,0.12)]"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm
                           transition-all duration-200 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #4a9eff, #7c3aed)",
                  boxShadow: "0 4px 20px rgba(74,158,255,0.25)",
                }}
              >
                <Send className="w-4 h-4" />
                Send Query
              </button>

            </form>

            {/* Footer note */}
            <div className="mt-6 pt-5 border-t border-[#1a2035] flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[#4a9eff]" />
                Your query will be sent directly to our team email
              </p>
              <a
                href="mailto:stockline.support@gmail.com"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold
                           transition-all duration-200 hover:opacity-80"
                style={{
                  background: "rgba(74,158,255,0.1)",
                  border: "1px solid rgba(74,158,255,0.25)",
                  color: "#4a9eff",
                  boxShadow: "0 0 10px rgba(74,158,255,0.15)",
                }}
              >
                <Mail className="w-3 h-3" />
                stockline.support@gmail.com
              </a>
            </div>
          </div>

        </div>
      )}

      {/* Fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease forwards;
        }
      `}</style>
    </div>
  );
}
