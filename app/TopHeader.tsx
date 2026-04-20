"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Bell, User, Settings, LogOut, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getUser, clearSession, inventory, Item } from "@/lib/api";

export default function TopHeader() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("Staff");
  
  const [lowStockAlerts, setLowStockAlerts] = useState<Item[]>([]);
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
          setLowStockAlerts(res.data.items.filter((i: Item) => i.quantity <= 10).sort((a: Item, b: Item) => a.quantity - b.quantity));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAlerts();
  }, []);

  // Close notif panel if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
            <div className="absolute right-0 mt-3 w-80 bg-[#161f33] border border-brand-border rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col origin-top-right animate-in fade-in zoom-in duration-200">
              <div className="px-4 py-3 border-b border-brand-border bg-[#0b1121]/50 flex justify-between items-center">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-danger/20 text-brand-danger font-bold">{lowStockAlerts.length} Alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {lowStockAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">You are all caught up!</div>
                ) : (
                  lowStockAlerts.map(item => (
                    <div key={item.id} className="p-3 border-b border-brand-border/50 hover:bg-white/5 transition-colors flex gap-3">
                      <div className="mt-0.5"><AlertTriangle className="w-4 h-4 text-brand-warning"/></div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-white leading-tight mb-1">{item.name}</p>
                        <p className="text-[10px] text-brand-warning">Only {item.quantity} units remaining in stock.</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {lowStockAlerts.length > 0 && (
                <div className="p-2 border-t border-brand-border text-center">
                  <Link href="/inventory" onClick={() => setShowNotifPanel(false)} className="text-[11px] font-bold text-[#4a9eff] hover:text-white uppercase tracking-wider">
                    Manage Inventory →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Button */}
        <div>
          <button 
            onClick={() => setShowProfileModal(true)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4a9eff] to-[#7c3aed] flex items-center justify-center overflow-hidden shadow-lg border border-brand-border hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[#4a9eff] focus:ring-offset-2 focus:ring-offset-brand-bg"
            aria-expanded={showProfileModal}
          >
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Centered Profile Modal Overlay */}
      {showProfileModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#161f33] border border-brand-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-brand-border bg-[#0b1121]/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#4a9eff]" /> Account Profile
              </h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Modal Body */}
            <div className="p-6 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4a9eff] to-[#7c3aed] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(74,158,255,0.3)]">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">{userName}</h2>
              <span className="px-3 py-1 bg-brand-success/10 text-brand-success outline outline-1 outline-brand-success/30 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                {userRole}
              </span>

              <div className="w-full space-y-2">
                <Link href="/users" onClick={() => setShowProfileModal(false)} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-200 rounded-lg text-sm font-semibold transition-colors border border-brand-border">
                  <Settings className="w-4 h-4 text-[#4a9eff]" /> My Settings
                </Link>
                <Link href="/login" onClick={() => { setShowProfileModal(false); clearSession(); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger rounded-lg text-sm font-semibold transition-colors border border-brand-danger/20">
                  <LogOut className="w-4 h-4" /> Sign Out completely
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
