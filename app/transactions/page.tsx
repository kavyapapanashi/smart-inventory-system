"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Download, ArrowDownLeft, ArrowUpRight, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { transactions, downloadFile, type Transaction } from "@/lib/api";

export default function TransactionsPage() {
  const [txnList, setTxnList] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [downloading, setDownloading] = useState<"csv" | "pdf" | null>(null);
  const LIMIT = 10;

  const fetchTxns = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await transactions.list(page, LIMIT);
    if (err || !data) {
      setError(err || "Failed to load transactions");
    } else {
      setTxnList(data.transactions);
      setTotalPages(data.pagination.pages || 1);
      setTotal(data.pagination.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchTxns(); }, [fetchTxns]);

  const handleDownloadCSV = async () => {
    setDownloading("csv");
    try {
      await downloadFile("/transactions/export/csv", "transactions.csv");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Download failed");
    }
    setDownloading(null);
  };

  const handleDownloadPDF = async () => {
    setDownloading("pdf");
    try {
      await downloadFile("/transactions/export/pdf", "transactions.pdf");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Download failed");
    }
    setDownloading(null);
  };

  const filtered = txnList.filter(
    (t) =>
      t.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span><span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Transactions</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight mt-1">Transaction Log</h2>
            <div className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-full text-xs font-semibold text-slate-300">
              {total} records
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button onClick={fetchTxns} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium text-sm hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={!!downloading}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:border-[#4a9eff]/50 hover:text-[#4a9eff] transition-colors rounded-lg text-white font-medium text-sm disabled:opacity-60"
          >
            {downloading === "csv" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={!!downloading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-primary text-white rounded-lg font-medium text-sm btn-glow hover:scale-[1.02] transition-transform disabled:opacity-60"
          >
            {downloading === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="bg-brand-card border border-brand-border rounded-xl flex flex-col glow-hover mb-8 overflow-hidden border-gradient-top">
        <div className="p-6 border-b border-brand-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-bg/20">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search item, user, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#080b14] border border-brand-border rounded-lg text-sm focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" /> Loading transactions...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-sm gap-2">
              <p>No transactions logged yet.</p>
              <p className="text-xs text-slate-600">Transactions are recorded when items are issued or returned via the API.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-bg/40">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Item</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-right">Qty</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-brand-border text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/50 text-sm">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-brand-bg/60 transition-colors group">
                    <td className="px-6 py-4 font-mono text-slate-400 group-hover:text-[#4a9eff] transition-colors text-xs">{t.id.substring(0, 8)}…</td>
                    <td className="px-6 py-4">
                      {t.type === "issued" ? (
                        <span className="flex items-center gap-2 text-[#4a9eff]">
                          <ArrowUpRight className="w-4 h-4" /><span className="font-semibold text-xs tracking-wide">ISSUED</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-brand-success">
                          <ArrowDownLeft className="w-4 h-4" /><span className="font-semibold text-xs tracking-wide">RETURNED</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">{t.item_name}</td>
                    <td className="px-6 py-4 text-slate-300">{t.user_name}</td>
                    <td className="px-6 py-4 font-mono font-bold text-right text-white">{t.quantity}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs">{t.timestamp}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border bg-brand-success/10 text-brand-success border-brand-success/20">
                        {t.status.toUpperCase()}
                      </span>
                    </td>
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
  );
}
