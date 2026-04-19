"use client";

import React, { useState, useEffect } from "react";
import { Download, PieChart, FileText, BarChart2, Loader2, AlertCircle, Package, Users, Clock, CheckCircle } from "lucide-react";
import { reports, downloadFile, type ReportSummary } from "@/lib/api";

export default function ReportsPage() {
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [dlError, setDlError] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error: err } = await reports.summary();
      if (err || !data) { setError(err || "Failed to load summary"); }
      else { setSummary(data); }
      setLoading(false);
    })();
  }, []);

  const download = async (path: string, filename: string, key: string) => {
    setDlError("");
    setDownloading(key);
    try {
      await downloadFile(path, filename);
    } catch (e: unknown) {
      setDlError(e instanceof Error ? e.message : "Download failed");
    }
    setDownloading(null);
  };

  const statCards = summary ? [
    { label: "Total Items",         value: summary.total_items,        icon: Package,       color: "text-[#4a9eff]",        bg: "bg-[#4a9eff]/10" },
    { label: "Low Stock",           value: summary.low_stock,          icon: AlertCircle,   color: "text-brand-warning",    bg: "bg-brand-warning/10" },
    { label: "Pending Requests",    value: summary.pending_requests,   icon: Clock,         color: "text-brand-danger",     bg: "bg-brand-danger/10" },
    { label: "Approved Requests",   value: summary.approved_requests,  icon: CheckCircle,   color: "text-brand-success",    bg: "bg-brand-success/10" },
    { label: "Total Users",         value: summary.total_users,        icon: Users,         color: "text-[#7c3aed]",        bg: "bg-[#7c3aed]/10" },
    { label: "Total Transactions",  value: summary.total_transactions, icon: BarChart2,     color: "text-indigo-400",       bg: "bg-indigo-400/10" },
  ] : [];

  const exportActions = [
    { key: "inv-pdf", label: "Inventory Report PDF", icon: FileText,  path: "/reports/export/inventory/pdf", filename: "inventory_report.pdf", color: "bg-gradient-primary btn-glow" },
    { key: "inv-csv", label: "Inventory CSV",         icon: Download,  path: "/reports/export/inventory/csv", filename: "inventory_report.csv", color: "bg-slate-800 border border-slate-700 hover:bg-slate-700" },
    { key: "req-pdf", label: "Requests Report PDF",   icon: PieChart,  path: "/reports/export/requests/pdf",  filename: "requests_report.pdf",  color: "bg-[#7c3aed]/20 border border-[#7c3aed]/30 hover:bg-[#7c3aed]/30 text-[#a78bfa]" },
    { key: "txn-pdf", label: "Transactions PDF",      icon: BarChart2, path: "/transactions/export/pdf",      filename: "transactions.pdf",     color: "bg-[#4a9eff]/10 border border-[#4a9eff]/20 hover:bg-[#4a9eff]/20 text-[#4a9eff]" },
    { key: "txn-csv", label: "Transactions CSV",      icon: Download,  path: "/transactions/export/csv",      filename: "transactions.csv",     color: "bg-slate-800 border border-slate-700 hover:bg-slate-700" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span><span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Reports</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mt-1">Analytics &amp; Reporting</h2>
        </div>
      </header>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}
      {dlError && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          ⚠️ {dlError}
        </div>
      )}

      {/* Summary Stats */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading analytics...
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-brand-card border border-brand-border rounded-xl p-4 glow-hover flex flex-col gap-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-slate-400 font-medium leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Export Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-white mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportActions.map((action) => (
            <button
              key={action.key}
              onClick={() => download(action.path, action.filename, action.key)}
              disabled={!!downloading}
              className={`flex items-center gap-3 px-5 py-4 rounded-xl font-semibold text-sm text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${action.color}`}
            >
              {downloading === action.key
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BarChart2, color: "text-[#4a9eff]", bg: "bg-[#4a9eff]/10 border-[#4a9eff]/20", title: "Monthly Stock Usage", desc: "Full breakdown of inventory distribution and usage patterns across the current month." },
          { icon: FileText, color: "text-brand-warning", bg: "bg-brand-warning/10 border-brand-warning/20", title: "Low Stock Alerts", desc: "All items at or below minimum threshold — export PDF to share with procurement." },
          { icon: PieChart, color: "text-[#7c3aed]", bg: "bg-[#7c3aed]/10 border-[#7c3aed]/20", title: "User Activity Audit", desc: "Detailed breakdown of who requested what, measuring resource usage and spending." },
        ].map((card) => (
          <div key={card.title} className="bg-brand-card border border-brand-border rounded-xl p-6 glow-hover flex flex-col cursor-pointer hover:-translate-y-1 transition-transform">
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center mb-4 ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
            <p className="text-sm text-slate-400 flex-1 leading-relaxed">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
