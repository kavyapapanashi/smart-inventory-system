"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, Calendar, Check, X, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { requests, type StockRequest, isAdmin } from "@/lib/api";

export default function PreBookingPage() {
  const [requestsList, setRequestsList] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [admin, setAdmin] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Form state
  const [formItemName, setFormItemName] = useState("");
  const [formQty, setFormQty] = useState("1");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const LIMIT = 10;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await requests.list(page, LIMIT);
    if (err || !data) {
      setError(err || "Failed to load requests");
    } else {
      setRequestsList(data.requests);
      setTotalPages(data.pagination.pages || 1);
      setTotal(data.pagination.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    setAdmin(isAdmin());
    fetchRequests();
  }, [fetchRequests]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");
    const qty = parseInt(formQty);
    if (!formItemName.trim()) { setFormError("Item name is required"); return; }
    if (isNaN(qty) || qty <= 0) { setFormError("Quantity must be greater than 0"); return; }

    setFormLoading(true);
    const { error: err } = await requests.create(formItemName.trim(), qty);
    setFormLoading(false);

    if (err) { setFormError(err); return; }
    setFormSuccess("Request submitted successfully!");
    setFormItemName(""); setFormQty("1");
    setTimeout(() => setFormSuccess(""), 3000);
    fetchRequests();
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    await requests.approve(id);
    setActionId(null);
    fetchRequests();
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    await requests.reject(id);
    setActionId(null);
    fetchRequests();
  };

  const filtered = requestsList.filter(
    (r) =>
      r.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.requested_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusStyle = (status: string) => {
    if (status === "approved") return "bg-brand-success/10 text-brand-success border-brand-success/20";
    if (status === "rejected") return "bg-brand-danger/10 text-brand-danger border-brand-danger/20";
    return "bg-brand-warning/10 text-brand-warning border-brand-warning/20";
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Pre-Booking</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight mt-1">Reservations</h2>
            <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
              {total} requests
            </div>
          </div>
        </div>
        <button onClick={fetchRequests} className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-brand-border rounded-lg text-white font-semibold text-sm transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Form Section */}
        <div className="lg:col-span-1 bg-brand-card border border-brand-border rounded-xl p-6 glow-hover border-gradient-top flex flex-col h-fit">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4a9eff]" />
            New Reservation
          </h3>

          {formError && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="mb-4 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs">
              ✓ {formSuccess}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmitRequest}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Item Name *</label>
              <input
                type="text"
                value={formItemName}
                onChange={(e) => setFormItemName(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                placeholder="e.g. Lab Coat"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quantity *</label>
              <input
                type="number"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 mt-2 bg-gradient-primary text-white rounded-lg font-semibold btn-glow transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Plus className="w-4 h-4" /> Submit Pre-booking</>}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 bg-brand-card border border-brand-border rounded-xl flex flex-col glow-hover overflow-hidden border-gradient-top">
          <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-bg/20">
            <h3 className="text-lg font-semibold">Active Pre-bookings</h3>
            <div className="relative w-full sm:w-auto">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search reservations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 flex-grow bg-[#080b14] border border-brand-border rounded-lg text-sm focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading requests...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
                No requests found.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-bg/40">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Item</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Qty</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Status</th>
                    {admin && <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/50 text-sm">
                  {filtered.map((res) => (
                    <tr key={res.id} className="hover:bg-brand-bg/60 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200">{res.item_name}</span>
                          <span className="text-xs text-slate-400 font-mono">by {res.requested_by.substring(0, 8)}…</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-white">{res.quantity}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border ${statusStyle(res.status)}`}>
                          {res.status.toUpperCase()}
                        </span>
                      </td>
                      {admin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {res.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(res.id)}
                                  disabled={actionId === res.id}
                                  className="p-1.5 text-brand-success hover:bg-brand-success/10 rounded-lg transition-all border border-transparent hover:border-brand-success/30 disabled:opacity-50"
                                  title="Approve"
                                >
                                  {actionId === res.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => handleReject(res.id)}
                                  disabled={actionId === res.id}
                                  className="p-1.5 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-all border border-transparent hover:border-brand-danger/30 disabled:opacity-50"
                                  title="Reject"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {res.status !== "pending" && (
                              <span className="text-xs text-slate-500 italic">Actioned</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-brand-border bg-brand-bg/40 flex justify-between items-center text-xs text-slate-400 font-medium">
            <p>Page {page} of {totalPages} ({total} total)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50">Previous</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
