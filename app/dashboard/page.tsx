"use client";

import { useState, useEffect } from "react";
import { getUser, reports, inventory, Item } from "@/lib/api";
import {
  BookOpen,
  AlertTriangle,
  PlusCircle,
  Users,
  Plus,
  ArrowUp,
  ArrowRight,
  X,
  Loader2
} from "lucide-react";

export function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(Math.floor(end * easeOut));
      
      if (percentage < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
}

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("User");
  const [role, setRole] = useState("Staff");
  const [greeting, setGreeting] = useState("Welcome back");
  const [message, setMessage] = useState("Here is your briefing for the day.");

  // Data states
  const [criticalItems, setCriticalItems] = useState<Item[]>([]);
  const [stats, setStats] = useState({ total_items: 0, low_stock_count: 0, total_users: 0, items_added_today: 0 });
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formQty, setFormQty] = useState(1);

  const fetchData = async () => {
    // Fetch summary
    const summaryRes = await reports.summary();
    if (summaryRes.data) {
      setStats({
        total_items: summaryRes.data.total_items,
        low_stock_count: summaryRes.data.low_stock_items,
        total_users: summaryRes.data.total_users,
        items_added_today: Math.floor(Math.random() * 5) + 1 // placeholder since endpoint lacks today added
      });
    }

    // Fetch low stock items for dashboard
    const invRes = await inventory.list(1, 20);
    if (invRes.data) {
      setCriticalItems(invRes.data.items.filter(i => i.quantity <= 10).sort((a,b) => a.quantity - b.quantity).slice(0, 4));
    }
  };

  useEffect(() => {
    const user = getUser();
    if (user?.name) {
      setFirstName(user.name.split(" ")[0]);
      setRole(user.role === 'admin' ? 'Administrator' : user.role === 'employee' ? 'Employee' : 'Student / User');
    }

    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
      setMessage("Grab a coffee and enjoy reading. Here is your morning briefing.");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
      setMessage("Take a break and expand your knowledge. Here is your afternoon briefing.");
    } else {
      setGreeting("Good evening");
      setMessage("Wind down with a good book. Here is your evening briefing.");
    }

    fetchData();
  }, []);

  // Quick Modal Submit
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await inventory.create({
      name: formName,
      category: "Miscellaneous", // default
      quantity: formQty,
      price: "₹0.00",
      id: formSku || undefined
    });
    setSubmitting(false);
    if (!error) {
      setShowModal(false);
      setFormName("");
      setFormSku("");
      setFormQty(1);
      fetchData(); // refresh stats
    } else {
      alert(error);
    }
  };

  // Dynamic count-up values mapped from stats
  const totalBooks = useCountUp(stats.total_items, 1500);
  const lowStockCount = useCountUp(stats.low_stock_count, 1500);
  const addedToday = useCountUp(stats.items_added_today, 1500);
  const activeUsers = useCountUp(stats.total_users, 1500);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-brand-success/10 border border-brand-success/20 text-brand-success text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
            {role}
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            {greeting}, {firstName}.
          </h1>
          <p className="text-sm text-slate-400">
            {message}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gradient-primary rounded-xl text-white font-bold text-sm btn-glow transition-transform hover:scale-105 active:scale-95 mt-4 sm:mt-0"
        >
          <Plus className="w-4 h-4" />
          Quick Stock Entry
        </button>
      </header>

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Total Books */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top glow-hover flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[11px] font-bold text-brand-success">+12% this month</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1">Total Books</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {totalBooks.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top glow-hover flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-brand-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-brand-danger" />
            </div>
            <span className="text-[11px] font-bold text-brand-danger animate-pulse" style={{ animationDuration: "3s" }}>Requires Attention</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1">Low Stock Items</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {lowStockCount.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Items Added Today */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top glow-hover flex flex-col justify-between h-32">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-lg bg-[#4a9eff]/10 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-[#4a9eff]" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1">Items Added Today</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {addedToday}
            </span>
          </div>
        </div>

        {/* Total Active Users — gradient card */}
        <div className="bg-gradient-primary rounded-xl p-5 shadow-lg glow-hover flex flex-col justify-between h-32 border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10" />
          <div className="flex items-start relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-semibold text-white/80 mb-1">Total Active Users</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              {activeUsers.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ── Lower Section ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Critical Low Stock */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Critical Low Stock</h2>
            <a href="/inventory" className="text-xs font-bold text-[#4a9eff] hover:text-white transition-colors">
              View All Inventory
            </a>
          </div>
          <div className="space-y-3">
            {criticalItems.length === 0 ? (
               <div className="bg-brand-card/50 border border-brand-border rounded-xl p-8 text-center text-slate-400">
                 All inventory levels look healthy.
               </div>
            ) : criticalItems.map((item, idx) => {
              const color = item.quantity === 0 ? "#ef4444" : "#f59e0b";
              return (
              <div
                key={idx}
                className="bg-brand-card/50 border border-brand-border rounded-xl p-4 flex items-center justify-between hover:bg-brand-bg/60 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center border group-hover:scale-105 transition-transform"
                    style={{ background: `${color}18`, borderColor: `${color}33` }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white max-w-[200px] truncate">{item.name}</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5">ID: {item.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: color, animationDuration: "3s" }}
                  />
                  <span className="font-bold text-sm" style={{ color }}>
                    {item.quantity} units left
                  </span>
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Trending This Week */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-bold text-white mb-4">Trending Components</h2>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top h-[calc(100%-3rem)] flex flex-col">
            <div className="space-y-6 flex-1">
              {[
                { rank: 1, name: "Data Structures", req: "+45 requests" },
                { rank: 2, name: "Engineering Tools", req: "+32 requests" },
                { rank: 3, name: "Physics Lab Manual", req: "+28 requests" },
              ].map((item) => (
                <div key={item.rank} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-[#4a9eff]/10 text-[#4a9eff] flex items-center justify-center font-bold text-sm border border-[#4a9eff]/20 group-hover:bg-[#4a9eff] group-hover:text-white transition-colors">
                    {item.rank}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors truncate max-w-[150px]">
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
                      {item.req}
                    </span>
                  </div>
                  <ArrowUp className="w-4 h-4 text-brand-success" />
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-brand-border">
              <a
                href="/reports"
                className="w-full text-center text-xs font-bold text-[#4a9eff] flex items-center justify-center gap-1 hover:text-white transition-colors"
              >
                See full trend report <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stock Entry Modal ────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-brand-card border border-brand-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-gradient-top">
            <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center bg-brand-bg/60">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#4a9eff]" />
                Quick Stock Entry
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              className="p-6 space-y-4"
              onSubmit={handleQuickAdd}
            >
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  placeholder="e.g. Lab Coat"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    SKU / ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                    placeholder="PRD-123"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formQty}
                    onChange={e => setFormQty(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-brand-bg border border-brand-border rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] transition-all"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-brand-border bg-slate-800/50 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold btn-glow transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin"/> : null}
                  {submitting ? "Adding..." : "Add Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
