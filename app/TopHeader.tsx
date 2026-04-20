"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Settings, LogOut, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getUser, clearSession, inventory, Item } from "@/lib/api";

export default function TopHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Staff");

  const [lowStockAlerts, setLowStockAlerts] = useState<Item[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = getUser();
    if (user?.name) setUserName(user.name);
    if (user?.role) setUserRole(user.role);

    // Fetch low stock items for notifications
    const fetchAlerts = async () => {
      try {
        const res = await inventory.list(1, 100);
        if (res.data) {
          setLowStockAlerts(
            res.data.items
              .filter((i: Item) => i.quantity <= 10)
              .sort((a: Item, b: Item) => a.quantity - b.quantity)
          );
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAlerts();
  }, []);

  // Close profile dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative h-16 flex items-center justify-between px-8 border-b border-brand-border/50 shrink-0 z-50 w-full bg-brand-bg/80 backdrop-blur-md">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-10 pr-4 py-2 bg-[#080b14] border border-brand-border rounded-full text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-5 ml-4">

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifPanel(!showNotifPanel)}
            className="relative text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-slate-800 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {lowStockAlerts.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-danger rounded-full border border-brand-bg animate-pulse" />
            )}
          </button>

          {showNotifPanel && (
            <div className="absolute right-0 mt-3 w-80 bg-[#161f33] border border-brand-border rounded-xl shadow-2xl overflow-hidden z-[9999] flex flex-col origin-top-right animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-brand-border bg-[#0b1121]/50 flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-danger/20 text-brand-danger font-bold">
                  {lowStockAlerts.length} Alerts
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {lowStockAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">You are all caught up!</div>
                ) : (
                  lowStockAlerts.map((item) => (
                    <div key={item.id} className="p-3 border-b border-brand-border/50 hover:bg-white/5 transition-colors flex gap-3">
                      <div className="mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-brand-warning" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white leading-tight mb-1">{item.name}</p>
                        <p className="text-[10px] text-brand-warning">Only {item.quantity} units remaining.</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {lowStockAlerts.length > 0 && (
                <div className="p-2 border-t border-brand-border text-center">
                  <Link
                    href="/inventory"
                    onClick={() => setShowNotifPanel(false)}
                    className="text-[11px] font-bold text-[#4a9eff] hover:text-white uppercase tracking-wider inline-flex items-center gap-1"
                  >
                    Manage Inventory →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4a9eff] to-[#7c3aed] flex items-center justify-center overflow-hidden shadow-lg border border-brand-border hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#4a9eff] focus:ring-offset-2 focus:ring-offset-brand-bg"
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <User className="w-5 h-5 text-white" />
          </button>

          {isOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-[#161f33] border border-brand-border rounded-xl shadow-2xl overflow-hidden z-[9999] flex flex-col origin-top-right animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-brand-border bg-gradient-to-b from-[#161f33] to-[#0b1121]">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <div className="inline-flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse"></span>
                  <p className="text-xs text-brand-success font-bold uppercase tracking-wider">{userRole}</p>
                </div>
              </div>
              <div className="py-1">
                <Link
                  href="/users"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-[#4a9eff]/10 transition-colors"
                >
                  <User className="w-4 h-4 text-[#4a9eff]" />
                  My Profile
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-[#4a9eff]/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#7c3aed]" />
                  Account Settings
                </button>
              </div>
              <div className="py-1 border-t border-brand-border bg-black/20">
                <Link
                  href="/login"
                  onClick={() => { setIsOpen(false); clearSession(); }}
                  className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-brand-danger hover:bg-brand-danger/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
