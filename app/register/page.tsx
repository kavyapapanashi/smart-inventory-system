"use client";

import React, { useState } from "react";
import { UserPlus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { data, error: apiError } = await auth.register(name, email, password, role);

    if (apiError || !data) {
      setError(apiError || "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    setSuccess("Account created! Redirecting to login...");
    setTimeout(() => router.push("/login"), 1500);
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0b1121] text-white font-sans overflow-hidden">
      <div className="w-full max-w-[440px] p-8 md:p-10 bg-[#161f33] rounded-[24px] shadow-2xl z-10 m-4 lg:m-0 flex flex-col items-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#10b981]/10 flex items-center justify-center mb-6">
          <UserPlus className="w-6 h-6 text-[#10b981]" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[22px] font-semibold text-white mb-2 tracking-wide">Create an Account</h2>
          <p className="text-sm font-medium text-slate-400">Join StockLine to manage your inventory</p>
        </div>

        {/* Feedback banners */}
        {error && (
          <div className="w-full mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[12px] flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {success && (
          <div className="w-full mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-[12px] flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="w-full space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-300 mb-2" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1121] border border-transparent rounded-[14px] text-[15px] text-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all placeholder:text-slate-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-300 mb-2" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1121] border border-transparent rounded-[14px] text-[15px] text-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all placeholder:text-slate-500"
              placeholder="john@example.com"
            />
          </div>

          <div className="relative">
            <label className="block text-[13px] font-medium text-slate-300 mb-2" htmlFor="role">Role</label>
            <select
              id="role"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1121] border border-transparent rounded-[14px] text-[15px] text-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all appearance-none cursor-pointer"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 mt-7 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-300 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#0b1121] border border-transparent rounded-[14px] text-[15px] text-white focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] transition-all placeholder:text-slate-500"
              placeholder="Min. 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-60 disabled:cursor-not-allowed rounded-[14px] font-medium text-white transition-colors text-[15px] flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Register"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-[13px] text-slate-400 font-medium">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-[#10b981] hover:text-[#34d399] font-medium transition-colors ml-1">Sign in instead</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
