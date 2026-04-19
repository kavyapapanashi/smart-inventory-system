"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, Bell, User, Settings, LogOut, Shield, ChevronDown, Package, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUser, clearSession, inventory, Item } from "@/lib/api";

export default function TopHeader() {
  const router = useRouter();

  // ── Profile dropdown ──────────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [userInitials, setUserInitials] = useState("U");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Search ────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch ALL items once so filtering is instant client-side
  const loadItems = useCallback(async () => {
    setSearchLoading(true);
    const { data } = await inventory.list(1, 100);
    setAllItems(data?.items ?? []);
    setSearchLoading(false);
  }, []);

  // Case-insensitive filter: compare lowercase of both sides
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) { setSearchResults([]); return; }
    setSearchResults(
      allItems.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      ).slice(0, 7)
    );
  }, [query, allItems]);

  // Open search dropdown when user starts typing
  useEffect(() => {
    if (query.trim()) {
      setSearchOpen(true);
      if (allItems.length === 0) loadItems();
    } else {
      setSearchOpen(false);
    }
  }, [query, allItems.length, loadItems]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const user = getUser();
    if (user) {
      setUserName(user.name);
      setUserEmail(user.email);
      setUserRole(user.role);
      const parts = user.name.trim().split(" ");
      setUserInitials(
        parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase()
      );
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    clearSession();
    router.push("/login");
  };

  const isAdmin = userRole === "admin";

  return (
    <header className="h-16 flex items-center justify-between px-8 border-b border-brand-border/50 shrink-0 w-full bg-brand-bg/80 backdrop-blur-md"
      style={{ position: "relative", zIndex: 40 }}
    >
      {/* Search */}
      <div className="flex-1 max-w-md" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="global-search"
            type="text"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (query.trim()) setSearchOpen(true); }}
            placeholder="Search resources..."
            className="w-full pl-10 pr-8 py-2 bg-[#080b14] border border-brand-border rounded-full text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setSearchOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Results Dropdown */}
          {searchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-brand-border shadow-2xl overflow-hidden"
              style={{ background: "linear-gradient(145deg,#161f33 0%,#0f1829 100%)", zIndex: 500 }}
            >
              {searchLoading ? (
                <div className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400">
                  <span className="w-4 h-4 border-2 border-[#4a9eff] border-t-transparent rounded-full animate-spin" />
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Inventory matches
                  </p>
                  <ul>
                    {searchResults.map((item) => {
                      // Highlight the matched portion without changing casing
                      const lq = query.trim().toLowerCase();
                      const lname = item.name.toLowerCase();
                      const idx = lname.indexOf(lq);
                      const before = item.name.slice(0, idx);
                      const match  = item.name.slice(idx, idx + lq.length);
                      const after  = item.name.slice(idx + lq.length);
                      return (
                        <li key={item.id}>
                          <Link
                            href="/inventory"
                            onClick={() => { setSearchOpen(false); setQuery(""); }}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors group"
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#4a9eff]/10 border border-[#4a9eff]/20 flex items-center justify-center shrink-0">
                              <Package className="w-3.5 h-3.5 text-[#4a9eff]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              {/* Original casing — only the matched chars get highlighted */}
                              <span className="text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                                {before}
                                <mark className="bg-[#4a9eff]/30 text-[#4a9eff] rounded px-0.5">{match}</mark>
                                {after}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">
                                Qty: {item.quantity} · {item.description || "No description"}
                              </span>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-brand-border/50">
                    <Link
                      href="/inventory"
                      onClick={() => { setSearchOpen(false); setQuery(""); }}
                      className="text-[11px] font-bold text-[#4a9eff] hover:text-white transition-colors"
                    >
                      View all inventory →
                    </Link>
                  </div>
                </>
              ) : (
                <div className="px-4 py-4 text-sm text-slate-400 text-center">
                  No items found for &ldquo;<span className="text-white">{query}</span>&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 ml-4">

        {/* Bell */}
        <button className="relative text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-brand-danger rounded-full border border-brand-bg animate-pulse" />
        </button>

        {/* Profile trigger */}
        <div className="relative" ref={dropdownRef} style={{ zIndex: 200 }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-brand-border bg-slate-800/60 hover:bg-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-[#4a9eff] focus:ring-offset-2 focus:ring-offset-brand-bg"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4a9eff] to-[#7c3aed] flex items-center justify-center text-xs font-bold text-white shadow-md">
              {userInitials}
            </div>
            {/* Name + role */}
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-semibold text-white leading-tight">
                {userName.split(" ")[0]}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isAdmin ? "text-[#4a9eff]" : "text-brand-success"}`}>
                {userRole}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {/* ── Dropdown Panel ────────────────────────────────────────────── */}
          {isOpen && (
            <>
              {/* Invisible backdrop to catch outside clicks at high z */}
              <div
                className="fixed inset-0"
                style={{ zIndex: 199 }}
                onClick={() => setIsOpen(false)}
              />

              <div
                className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl overflow-hidden border border-brand-border/60"
                style={{
                  zIndex: 300,
                  background: "linear-gradient(145deg, #161f33 0%, #0f1829 100%)",
                }}
              >
                {/* User Card */}
                <div className="px-4 py-4 border-b border-brand-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#4a9eff] to-[#7c3aed] flex items-center justify-center text-sm font-bold text-white shadow-lg shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{userEmail}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4a9eff]/10 border border-[#4a9eff]/20 text-[10px] font-bold text-[#4a9eff] uppercase tracking-wider">
                            <Shield className="w-2.5 h-2.5" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-success/10 border border-brand-success/20 text-[10px] font-bold text-brand-success uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-success" /> User
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Settings className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    Account Settings
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="px-3 py-3 border-t border-brand-border/50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-brand-danger hover:bg-brand-danger/10 transition-colors border border-brand-danger/20 hover:border-brand-danger/40"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-danger/10 flex items-center justify-center">
                      <LogOut className="w-3.5 h-3.5 text-brand-danger" />
                    </div>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
