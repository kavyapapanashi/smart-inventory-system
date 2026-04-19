"use client";

import React, { useState } from "react";
import { LogIn, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, saveSession } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error: apiError } = await auth.login(email, password);

    if (apiError || !data) {
      setError(apiError || "Login failed. Please try again.");
      setLoading(false);
      return;
    }

    saveSession(data.token, data.user);
    router.push("/");
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#0b1121] text-white font-sans overflow-hidden">
      <div className="w-full max-w-[440px] p-8 md:p-10 bg-[#161f33] rounded-[24px] shadow-2xl z-10 m-4 lg:m-0 flex flex-col items-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#4f46e5]/10 flex items-center justify-center mb-6">
          <LogIn className="w-6 h-6 text-[#6366f1]" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-[22px] font-semibold text-white mb-2 tracking-wide">Welcome Back</h2>
          <p className="text-sm font-medium text-slate-400">Enter your credentials to access StockLine</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="w-full mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-[12px] flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-slate-300 mb-2" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b1121] border border-transparent rounded-[14px] text-[15px] text-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all placeholder:text-slate-500"
                placeholder="admin@stockline.com"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-300 mb-2" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0b1121] border border-transparent rounded-[14px] text-[15px] text-white focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition-all placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px] pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-[#0b1121] text-[#4f46e5] focus:ring-[#4f46e5] focus:ring-offset-0 focus:border-none" />
              <span>Remember me</span>
            </label>
            <a href="#" className="font-medium text-[#6366f1] hover:text-[#818cf8] transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#4f46e5] hover:bg-[#6366f1] disabled:opacity-60 disabled:cursor-not-allowed rounded-[14px] font-medium text-white transition-colors text-[15px] flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-[13px] text-slate-400 font-medium">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#6366f1] hover:text-[#818cf8] font-medium transition-colors ml-1">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
