"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  FileText,
  Users,
  Calendar,
  Database,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import TopHeader from "./TopHeader";
import { getUser, clearSession } from "@/lib/api";

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register"];

// Nav items — adminOnly: true means only admins see them
const NAV_ITEMS = [
  { label: "Dashboard",        href: "/dashboard",         icon: LayoutDashboard, adminOnly: false },
  { label: "Inventory",        href: "/inventory",         icon: Package,         adminOnly: false },
  { label: "Pre-Booking",      href: "/pre-booking",       icon: Calendar,        adminOnly: false },
  { label: "Stock Management", href: "/stock-management",  icon: Database,        adminOnly: false },
  { label: "Transactions",     href: "/transactions",      icon: ArrowLeftRight,  adminOnly: false },
  { label: "Reports",          href: "/reports",           icon: FileText,        adminOnly: false },
  { label: "Users",            href: "/users",             icon: Users,           adminOnly: true  },
  { label: "Settings",         href: "/settings",          icon: Settings,        adminOnly: false },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const [userRole, setUserRole] = useState("user");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    const user = getUser();

    if (!isPublic && !user) {
      // Not logged in — redirect to login
      router.replace("/login");
      return;
    }

    if (user) {
      setUserName(user.name);
      setUserRole(user.role);
      const parts = user.name.trim().split(" ");
      setUserInitials(
        parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase()
      );
    }

    setReady(true);
  }, [pathname, router]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  // Splash / login / register — full window, no shell
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // While checking auth, render nothing to avoid flash
  if (!ready) return null;

  const isAdmin = userRole === "admin";
  const visibleNav = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="min-h-full flex bg-brand-bg text-white h-screen overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 border-r border-brand-border bg-brand-card flex-col justify-between hidden md:flex z-10 relative">
        <div>
          {/* Logo */}
          <div className="h-20 flex flex-col justify-center border-b border-brand-border px-6">
            <h1 className="text-2xl font-black tracking-tighter text-gradient w-full">Stockline</h1>
            <span className="text-[10px] text-slate-400 w-full font-medium uppercase tracking-widest mt-0.5">
              Smart Stock, Zero Chaos
            </span>
          </div>

          {/* Nav */}
          <nav className="p-4 space-y-1 mt-4">
            {visibleNav.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname === href
                    ? "nav-active"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Sidebar Footer: user + logout ────────────────────────────────── */}
        <div className="p-4 border-t border-brand-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800/30 border border-brand-border mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold shadow-lg shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold truncate">{userName}</span>
              <span className="text-xs text-brand-success flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-success" />
                {isAdmin ? "Admin" : "User"}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 bg-brand-danger/10 hover:bg-brand-danger/20 text-brand-danger rounded-lg text-xs font-bold uppercase tracking-widest transition-colors border border-brand-danger/20"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-brand-bg relative z-0">
        {/* Ambient Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4a9eff]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#7c3aed]/5 blur-[120px] rounded-full pointer-events-none" />

        <TopHeader />

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
