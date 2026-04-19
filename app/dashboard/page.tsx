"use client";

import { useEffect, useState, useMemo } from "react";
import QuickStockModal from "./QuickStockModal";
import {
  BookOpen,
  AlertTriangle,
  PlusCircle,
  Users,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import { getUser } from "@/lib/api";

// ── Dynamic greeting helper ───────────────────────────────────────────────
function getDynamicSubtitle(name: string): string {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0=Sun … 6=Sat

  const timeOfDay =
    hour < 5  ? "night" :
    hour < 12 ? "morning" :
    hour < 17 ? "afternoon" :
    hour < 21 ? "evening" : "night";

  const dayMessages: Record<number, string[]> = {
    0: [ // Sunday
      `Sunday mode, ${name}. Light day — perfect for reviewing stock levels before the week kicks off.`,
      `Rest day, but inventory never sleeps. A quick scan today saves chaos tomorrow.`,
    ],
    1: [ // Monday
      `New week, fresh goals. Let's make Monday count on the shelves, ${name}.`,
      `Monday momentum — your inventory dashboard is primed and ready to go.`,
      `Week starts now. Check what's low, restock what matters, crush it.`,
    ],
    2: [ // Tuesday
      `Tuesdays are for tightening up. Any gaps from yesterday?`,
      `You're two days in — a great time to spot what needs attention, ${name}.`,
    ],
    3: [ // Wednesday
      `Midweek check-in. How are those stock levels holding up, ${name}?`,
      `Hump day! Stay sharp — the week is yours to command.`,
      `Wednesday snapshot: half the week done, half the opportunities ahead.`,
    ],
    4: [ // Thursday
      `Almost Friday, ${name}. Make sure everything is stocked before the weekend rush.`,
      `Thursday hustle — one push and you're golden for the week.`,
    ],
    5: [ // Friday
      `End of week review time, ${name}. Let's close strong. 🔥`,
      `Friday energy! Wrap up the week with your inventory in top shape.`,
      `Last sprint, ${name}. Lock in the numbers before the weekend.`,
    ],
    6: [ // Saturday
      `Saturday in the system — you're dedicated, ${name}. Respect. 🚀`,
      `Weekend warrior mode activated. Quick check before you log off for the day.`,
    ],
  };

  const timeMessages: Record<string, string[]> = {
    night: [
      `Burning the midnight oil, ${name}? The inventory is watching over you too.`,
      `Late-night session — the quietest time to get the clearest picture.`,
    ],
    morning: [
      `Good morning, ${name}! Fresh start, fresh stock — let's set the tone for the day.`,
      `Rise and log in. Your morning briefing for Central Campus is ready.`,
      `Morning clarity is the best clarity. Here's where things stand today.`,
    ],
    afternoon: [
      `Afternoon check-in — see how the day's moves are shaping up, ${name}.`,
      `Peak hours, peak focus. Here's your live inventory snapshot.`,
      `Midday pulse: stay ahead of demand and keep the shelves in check.`,
    ],
    evening: [
      `Evening wrap-up, ${name}. How did today's inventory hold up?`,
      `Winding down the day — one last look at the numbers before you rest.`,
      `Golden hour for data review. Here's tonight's campus inventory summary.`,
    ],
  };

  // Combine day + time messages and pick one deterministically
  const pool = [
    ...(dayMessages[day] ?? []),
    ...(timeMessages[timeOfDay] ?? []),
  ];

  // Use minute as a slowly-rotating seed so it changes each visit but feels stable
  const seed = now.getMinutes() % pool.length;
  return pool[seed] ?? `Here is your ${timeOfDay} briefing for Central Campus Inventory.`;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("there");
  const [userRole, setUserRole] = useState("User");

  useEffect(() => {
    const user = getUser();
    if (user) {
      // Show first name only
      setUserName(user.name.split(" ")[0]);
      setUserRole(
        user.role.charAt(0).toUpperCase() + user.role.slice(1)
      );
    }
  }, []);

  const subtitle = useMemo(() => getDynamicSubtitle(userName), [userName]);

  const criticalItems = [
    { id: "PRD-001", name: "GMIT Record Book", left: 2, unit: "books", color: "danger" },
    { id: "PRD-045", name: "Engineering Drawing Kit", left: 5, unit: "kits", color: "warning" },
    { id: "PRD-112", name: "A4 Copy Paper (Ream)", left: 8, unit: "reams", color: "warning" },
  ];

  const trendingItems = [
    { rank: 1, name: "Advanced Mathematics", requests: "+45 requests" },
    { rank: 2, name: "Physics Lab Manual", requests: "+32 requests" },
    { rank: 3, name: "CS Data Structures", requests: "+28 requests" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto relative z-10 px-8 py-6">

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4">
        <div>
          <span className="inline-block px-3 py-1 bg-brand-success/10 border border-brand-success/20 text-brand-success text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
            {userRole}
          </span>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">
            Welcome back, {userName}.
          </h2>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        </div>
        <QuickStockModal />
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {/* Total Books */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top glow-hover relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-[11px] font-bold text-brand-success">+12% this month</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1">Total Books</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">12,408</span>
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top glow-hover relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-lg bg-brand-danger/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-brand-danger" />
            </div>
            <span className="text-[11px] font-bold text-brand-danger">Requires Attention</span>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1">Low Stock Items</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">04</span>
          </div>
        </div>

        {/* Items Added Today */}
        <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top glow-hover relative overflow-hidden flex flex-col justify-between h-32">
          <div className="flex items-start">
            <div className="w-8 h-8 rounded-lg bg-[#4a9eff]/10 flex items-center justify-center">
              <PlusCircle className="w-4 h-4 text-[#4a9eff]" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 mb-1">Items Added Today</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">34</span>
          </div>
        </div>

        {/* Total Active Users — gradient card */}
        <div className="bg-gradient-primary rounded-xl p-5 shadow-lg glow-hover relative overflow-hidden flex flex-col justify-between h-32 border border-white/10">
          <div className="absolute inset-0 bg-black/10" />
          <div className="flex items-start relative z-10">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-xs font-semibold text-white/80 mb-1">Total Active Users</h3>
            <span className="text-3xl font-bold font-mono text-white tracking-tight">1,204</span>
          </div>
        </div>

      </div>

      {/* Lower Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

        {/* Critical Low Stock */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Critical Low Stock</h3>
            <a href="/inventory" className="text-xs font-bold text-[#4a9eff] hover:text-white transition-colors">
              View All Inventory
            </a>
          </div>
          <div className="space-y-3">
            {criticalItems.map((item, idx) => {
              const isDanger = item.color === "danger";
              const dotColor = isDanger ? "bg-brand-danger" : "bg-brand-warning";
              const textColor = isDanger ? "text-brand-danger" : "text-brand-warning";
              const iconBg = isDanger ? "bg-brand-danger/10 border-brand-danger/20" : "bg-brand-warning/10 border-brand-warning/20";
              const iconColor = isDanger ? "text-brand-danger" : "text-brand-warning";
              return (
                <div
                  key={idx}
                  className="bg-brand-card/50 border border-brand-border rounded-xl p-4 flex items-center justify-between hover:bg-brand-bg/60 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center border group-hover:scale-105 transition-transform ${iconBg}`}>
                      <BookOpen className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{item.name}</span>
                      <span className="text-xs font-mono text-slate-400 mt-0.5">ID: {item.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${dotColor} ${isDanger ? "animate-pulse" : ""}`} />
                    <span className={`font-bold text-sm ${textColor}`}>
                      {item.left} {item.unit} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trending This Week */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-white mb-4">Trending This Week</h3>
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 border-gradient-top h-full flex flex-col">
            <div className="space-y-6 flex-1">
              {trendingItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-8 h-8 rounded-full bg-[#4a9eff]/10 text-[#4a9eff] flex items-center justify-center font-bold text-sm border border-[#4a9eff]/20 group-hover:bg-[#4a9eff] group-hover:text-white transition-colors">
                    {item.rank}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5">
                      {item.requests}
                    </span>
                  </div>
                  <ArrowUp className="w-4 h-4 text-brand-success" />
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-brand-border">
              <a
                href="/inventory"
                className="w-full text-center text-xs font-bold text-[#4a9eff] flex items-center justify-center gap-1 hover:text-white transition-colors"
              >
                See full trend report <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
