"use client";

import React, { useState, useEffect } from "react";
import { Download, PieChart, FileText, BarChart2, ShieldAlert, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { isStaff, downloadFile, inventory, transactions, reports as reportsApi, Item, Transaction, ReportSummary } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function ReportsPage() {
  const [canView, setCanView] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [activeTab, setActiveTab] = useState<"usage" | "alerts" | "audit" | null>(null);
  
  // Data states
  const [lowStockItems, setLowStockItems] = useState<Item[]>([]);
  const [auditLogs, setAuditLogs] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loadingView, setLoadingView] = useState(false);

  useEffect(() => {
    setCanView(isStaff());
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (!activeTab) return;
    const fetchData = async () => {
      setLoadingView(true);
      try {
        if (activeTab === "alerts") {
          const res = await inventory.list(1, 100);
          if (res.data) {
            setLowStockItems(res.data.items.filter(i => i.quantity <= 10).sort((a,b) => a.quantity - b.quantity));
          }
        } else if (activeTab === "audit") {
          const res = await transactions.list(1, 50);
          if (res.data) {
            setAuditLogs(res.data.transactions);
          }
        } else if (activeTab === "usage") {
          // Minimal summary for usage context
          const res = await reportsApi.summary();
          if (res.data) setSummary(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingView(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // Mock chart data for Monthly Usage
  const usageData = [
    { name: "Jan", issues: 45, returns: 32 },
    { name: "Feb", issues: 52, returns: 40 },
    { name: "Mar", issues: 38, returns: 45 },
    { name: "Apr", issues: 65, returns: 20 },
    { name: "May", issues: Math.floor(Math.random()*40)+30, returns: Math.floor(Math.random()*40)+20 },
    { name: "Jun", issues: summary ? summary.total_transactions/2 : 40, returns: summary ? summary.total_transactions/3 : 25 }
  ];

  if (!canView) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-brand-bg relative z-10">
        <div className="w-16 h-16 bg-brand-danger/10 text-brand-danger border border-brand-danger/20 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400 max-w-md">
          You do not have the required permissions to view stock reports.
          Please contact an administrator if you believe this is an error.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Stockline</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-medium text-gradient">Reports</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight mt-1">Analytics & Reporting</h2>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button 
            disabled={downloadingPdf}
            onClick={async () => {
              setDownloadingPdf(true);
              try { await downloadFile("/reports/export/inventory/pdf", "inventory_report.pdf"); }
              catch (err) { alert("Failed to download PDF"); }
              finally { setDownloadingPdf(false); }
            }}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors rounded-lg text-white font-medium text-sm disabled:opacity-50"
          >
            <PieChart className="w-4 h-4 text-[#4a9eff]" />
            {downloadingPdf ? "Generating..." : "Generate PDF"}
          </button>
          <button 
            disabled={downloadingCsv}
            onClick={async () => {
              setDownloadingCsv(true);
              try { await downloadFile("/reports/export/inventory/csv", "inventory_report.csv"); }
              catch (err) { alert("Failed to download CSV"); }
              finally { setDownloadingCsv(false); }
            }}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 py-2.5 bg-gradient-primary rounded-lg text-white font-semibold text-sm btn-glow hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {downloadingCsv ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </header>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Report Card 1 */}
        <div 
          onClick={() => setActiveTab("usage")}
          className={`bg-brand-card border rounded-xl p-6 glow-hover flex flex-col cursor-pointer transition-all duration-300 ${activeTab === 'usage' ? 'border-[#4a9eff] ring-1 ring-[#4a9eff]/50 -translate-y-2' : 'border-brand-border hover:-translate-y-1'}`}
        >
          <div className="w-12 h-12 rounded-full bg-[#4a9eff]/10 border border-[#4a9eff]/20 flex items-center justify-center mb-4">
            <BarChart2 className="w-6 h-6 text-[#4a9eff]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Monthly Stock Usage</h3>
          <p className="text-sm text-slate-400 flex-1 mb-4 leading-relaxed">
            A comprehensive report outlining the distribution and usage pattern of inventory assets across the current month.
          </p>
          <div className={`pt-4 border-t border-brand-border/50 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'usage' ? 'text-white' : 'text-[#4a9eff] hover:text-white'}`}>
            {activeTab === "usage" ? "Viewing Analytics" : "View Analytics →"}
          </div>
        </div>

        {/* Report Card 2 */}
        <div 
          onClick={() => setActiveTab("alerts")}
          className={`bg-brand-card border rounded-xl p-6 glow-hover flex flex-col cursor-pointer transition-all duration-300 ${activeTab === 'alerts' ? 'border-brand-warning ring-1 ring-brand-warning/50 -translate-y-2' : 'border-brand-border hover:-translate-y-1'}`}
        >
          <div className="w-12 h-12 rounded-full bg-brand-warning/10 border border-brand-warning/20 flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-brand-warning" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Low Stock Alerts</h3>
          <p className="text-sm text-slate-400 flex-1 mb-4 leading-relaxed">
            Report on all inventory items currently at or below minimum threshold requirements, aiding in rapid reordering execution.
          </p>
          <div className={`pt-4 border-t border-brand-border/50 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'alerts' ? 'text-white' : 'text-brand-warning hover:text-white'}`}>
            {activeTab === "alerts" ? "Viewing Analytics" : "View Analytics →"}
          </div>
        </div>

        {/* Report Card 3 */}
        <div 
          onClick={() => setActiveTab("audit")}
          className={`bg-brand-card border rounded-xl p-6 glow-hover flex flex-col cursor-pointer transition-all duration-300 ${activeTab === 'audit' ? 'border-[#7c3aed] ring-1 ring-[#7c3aed]/50 -translate-y-2' : 'border-brand-border hover:-translate-y-1'}`}
        >
          <div className="w-12 h-12 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-[#7c3aed]" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">User Activity Audit</h3>
          <p className="text-sm text-slate-400 flex-1 mb-4 leading-relaxed">
            Detailed breakdown of who requested and returned what, measuring productivity and resource spending tracking.
          </p>
          <div className={`pt-4 border-t border-brand-border/50 text-xs font-semibold uppercase tracking-widest transition-colors ${activeTab === 'audit' ? 'text-white' : 'text-[#7c3aed] hover:text-white'}`}>
            {activeTab === "audit" ? "Viewing Analytics" : "View Analytics →"}
          </div>
        </div>

      </div>
      
      {/* Expanded Data View */}
      <div className="flex-1 bg-brand-card border border-brand-border rounded-xl relative overflow-hidden min-h-[400px] flex flex-col">
        {!activeTab ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50 border-dashed border-2 border-brand-border m-4 rounded-xl group hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4a9eff]/5 to-[#7c3aed]/5 pointer-events-none" />
            <div className="flex flex-col items-center gap-3 relative z-10">
              <FileText className="w-10 h-10 text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-sm font-semibold text-slate-400 tracking-wide uppercase group-hover:text-[#4a9eff] transition-colors">
                Select A Report Template to Visualize
              </span>
            </div>
          </div>
        ) : loadingView ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#4a9eff]/20 border-t-[#4a9eff] animate-spin" />
          </div>
        ) : (
          <div className="p-6 flex-1 flex flex-col animate-in fade-in duration-500">
            {activeTab === "usage" && (
              <>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-[#4a9eff]"/> Usage Trends (Current Year)</h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        cursor={{fill: '#1e293b', opacity: 0.4}}
                      />
                      <Bar dataKey="issues" name="Items Issued" fill="#4a9eff" radius={[4, 4, 0, 0]} barSize={24} />
                      <Bar dataKey="returns" name="Items Returned" fill="#7c3aed" radius={[4, 4, 0, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {activeTab === "alerts" && (
              <>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-brand-warning"/> Critical Inventory Levels</h3>
                {lowStockItems.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400">All items are sufficiently stocked.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-brand-border">
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-brand-border">
                        <tr>
                          <th className="px-6 py-4">Item Name</th>
                          <th className="px-6 py-4">Quantity Remaining</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockItems.map((item) => (
                          <tr key={item.id} className="border-b border-brand-border hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                            <td className="px-6 py-4"><span className="font-bold text-white">{item.quantity}</span> units</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${item.quantity === 0 ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {activeTab === "audit" && (
              <>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-[#7c3aed]"/> Recent Activity Log</h3>
                {auditLogs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400">No recent transactions found.</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-brand-border h-[400px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left text-slate-300">
                      <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-brand-border sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-4">Time</th>
                          <th className="px-6 py-4">User</th>
                          <th className="px-6 py-4">Action</th>
                          <th className="px-6 py-4">Item</th>
                          <th className="px-6 py-4">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map((log) => (
                          <tr key={log.id} className="border-b border-brand-border hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                              {new Date(log.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 font-medium text-white">{log.user_name}</td>
                            <td className="px-6 py-4">
                              <span className={`flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider ${log.type === 'issued' ? 'text-[#4a9eff]' : 'text-brand-success'}`}>
                                {log.type === 'issued' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5"/>}
                                {log.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 truncate max-w-[200px]">{log.item_name}</td>
                            <td className="px-6 py-4 font-bold">{log.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
      
    </div>
  );
}
