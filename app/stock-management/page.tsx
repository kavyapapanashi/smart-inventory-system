"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertTriangle, PackageCheck, Loader2, RefreshCw, Save, Check } from "lucide-react";
import { inventory, requests, type Item, type StockRequest, isAdmin } from "@/lib/api";

export default function StockManagementPage() {
  const [lowStock, setLowStock] = useState<Item[]>([]);
  const [pendingReqs, setPendingReqs] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockQty, setRestockQty] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [admin] = useState(isAdmin());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [itemsRes, reqsRes] = await Promise.all([
      inventory.list(1, 100),
      requests.list(1, 50),
    ]);
    if (itemsRes.data) {
      const low = itemsRes.data.items.filter((i) => i.quantity <= 10);
      setLowStock(low);
      const initQty: Record<string, string> = {};
      low.forEach((i) => { initQty[i.id] = "10"; });
      setRestockQty(initQty);
    }
    if (reqsRes.data) {
      setPendingReqs(reqsRes.data.requests.filter((r) => r.status === "pending"));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRestock = async (item: Item) => {
    const qty = parseInt(restockQty[item.id] || "0");
    if (!qty || qty <= 0) return;
    setSavingId(item.id);
    await inventory.update(item.id, item.name, item.quantity + qty, item.description);
    setSavingId(null);
    fetchData();
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    await requests.approve(id);
    setActionId(null);
    fetchData();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span><span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Administration</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mt-1">Stock Management</h2>
        </div>
        <button onClick={fetchData} className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-brand-border rounded-lg text-white font-semibold text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading stock data...
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">

          {/* Critical Low Stock */}
          <div className="bg-brand-card border border-brand-danger/30 rounded-xl p-6 glow-hover flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-danger/5 blur-[50px] rounded-full pointer-events-none" />
            <h3 className="text-xl font-semibold mb-6 flex items-center justify-between z-10">
              <span className="flex items-center gap-2 text-brand-danger">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                Critical Stock Resolution
              </span>
              <span className="bg-brand-danger/10 text-brand-danger text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-brand-danger/20">
                {lowStock.length} items
              </span>
            </h3>

            {lowStock.length === 0 ? (
              <p className="text-slate-400 text-sm">✅ All items are well-stocked!</p>
            ) : (
              <div className="space-y-4 z-10">
                {lowStock.map((item) => (
                  <div key={item.id} className="p-4 bg-[#080b14] border border-brand-border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-brand-bg/80 transition-all">
                    <div>
                      <p className="font-bold text-slate-100">{item.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        {item.quantity === 0 ? (
                          <span className="text-brand-danger font-bold">OUT OF STOCK</span>
                        ) : (
                          <span className="text-brand-warning font-bold">{item.quantity} left — LOW</span>
                        )}
                      </p>
                    </div>
                    {admin && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={restockQty[item.id] || "10"}
                          onChange={(e) => setRestockQty((prev) => ({ ...prev, [item.id]: e.target.value }))}
                          className="w-16 px-2 py-1.5 bg-[#080b14] border border-brand-border rounded-lg text-sm text-center text-white focus:outline-none focus:border-[#4a9eff] font-mono"
                          min="1"
                        />
                        <button
                          onClick={() => handleRestock(item)}
                          disabled={savingId === item.id}
                          className="p-2 bg-gradient-primary rounded-lg text-white hover:scale-105 active:scale-95 transition-transform btn-glow disabled:opacity-50"
                          title="Restock"
                        >
                          {savingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Requests */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 glow-hover border-gradient-top flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4a9eff]/5 blur-[50px] rounded-full pointer-events-none" />
            <h3 className="text-xl font-semibold mb-6 flex items-center justify-between z-10">
              <span className="flex items-center gap-2 text-white">
                <PackageCheck className="w-5 h-5 text-[#4a9eff] flex-shrink-0" />
                Pending Pre-Bookings
              </span>
              <span className="bg-brand-warning/10 text-brand-warning text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-brand-warning/20">
                {pendingReqs.length} pending
              </span>
            </h3>

            {pendingReqs.length === 0 ? (
              <p className="text-slate-400 text-sm">✅ No pending requests!</p>
            ) : (
              <div className="space-y-3 z-10">
                {pendingReqs.map((req) => (
                  <div key={req.id} className="p-4 bg-[#080b14] border border-brand-border rounded-xl flex justify-between items-center group hover:bg-brand-bg/60 transition-colors">
                    <div>
                      <p className="font-bold text-sm text-slate-200">{req.item_name}</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Qty: <span className="text-white font-medium">{req.quantity}</span> · By: <span className="text-white font-medium">{req.requested_by.substring(0, 8)}…</span>
                      </p>
                    </div>
                    {admin && (
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={actionId === req.id}
                        className="px-4 py-2 bg-brand-success/10 text-brand-success border border-brand-success/20 hover:bg-brand-success hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {actionId === req.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Approve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
