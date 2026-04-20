"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Check, X, Loader2 } from "lucide-react";
import { requests } from "@/lib/api";

export default function PreBookingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formItemName, setFormItemName] = useState("");
  const [formQty, setFormQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    const { data } = await requests.list(1, 100); // Fetch up to 100 for now
    if (data) {
      setBookings(data.requests);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formItemName.trim()) return;

    setSubmitting(true);
    const { error } = await requests.create(formItemName, formQty);
    if (!error) {
      setFormItemName("");
      setFormQty(1);
      fetchBookings();
    } else {
      alert(error);
    }
    setSubmitting(false);
  };

  const handleApprove = async (id) => {
    const { error } = await requests.approve(id);
    if (!error) fetchBookings();
    else alert(error);
  };

  const handleReject = async (id) => {
    const { error } = await requests.reject(id);
    if (!error) fetchBookings();
    else alert(error);
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
          <h2 className="text-3xl font-bold tracking-tight mt-1">Reservations</h2>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1 bg-brand-card border border-brand-border rounded-xl p-6 glow-hover border-gradient-top flex flex-col h-fit">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4a9eff]" />
            New Reservation
          </h3>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Product Name</label>
              <input 
                type="text" 
                value={formItemName}
                onChange={(e) => setFormItemName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all" 
                placeholder="e.g. Advanced Mathematics" 
              />
            </div>
            {/* Removed Customer Name input because backend automatically assigns requested_by to current loggen in user */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quantity Requested</label>
              <input 
                type="number" 
                value={formQty}
                onChange={(e) => setFormQty(Number(e.target.value))}
                min="1" 
                required
                className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all" 
              />
            </div>
            <button 
              disabled={submitting}
              className="w-full py-3 mt-2 bg-gradient-primary text-white rounded-lg font-semibold btn-glow transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {submitting ? "Submitting..." : "Submit Pre-booking"}
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/40">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Reservation ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Item & User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Date / Qty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" /> Fetching reservations...
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No active bookings found.
                    </td>
                  </tr>
                ) : bookings
                  .filter(res => res.requested_by?.toLowerCase().includes(searchTerm.toLowerCase()) || res.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) || res.id?.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((res) => (
                  <tr key={res.id} className="hover:bg-brand-bg/60 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-400 group-hover:text-[#4a9eff] transition-colors">{res.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{res.item_name}</span>
                        <span className="text-xs text-slate-400">By {res.requested_by}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center">
                        <span className="text-white font-medium">—</span>
                        <span className="text-[11px] font-mono text-slate-400 mt-0.5">Qty: {res.quantity}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border uppercase ${
                        res.status === 'approved' 
                          ? 'bg-brand-success/10 text-brand-success border-brand-success/20' 
                          : res.status === 'rejected'
                          ? 'bg-brand-danger/10 text-brand-danger border-brand-danger/20'
                          : 'bg-brand-warning/10 text-brand-warning border-brand-warning/20'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === 'pending' && (
                          <>
                            <button onClick={() => handleApprove(res.id)} className="p-1.5 text-brand-success hover:bg-brand-success/10 rounded-lg transition-all border border-transparent hover:border-brand-success/30" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleReject(res.id)} className="p-1.5 text-brand-danger hover:bg-brand-danger/10 rounded-lg transition-all border border-transparent hover:border-brand-danger/30" title="Reject">
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  );
}
