"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Plane,
  AlertTriangle,
  Layers,
  FileText,
  BarChart2,
  Settings,
  Radio,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/",        label: "Live Overview",  icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/flights", label: "Flights",        icon: <Plane className="h-4 w-4" /> },
  { href: "/alerts",  label: "Alerts",         icon: <AlertTriangle className="h-4 w-4" />, badge: "7" },
  { href: "/sections",label: "Sections",       icon: <Layers className="h-4 w-4" />, disabled: true },
  { href: "/reports", label: "Reports",        icon: <FileText className="h-4 w-4" /> },
  { href: "/analytics",label: "Analytics",     icon: <BarChart2 className="h-4 w-4" />, disabled: true },
  { href: "/settings", label: "Settings",      icon: <Settings className="h-4 w-4" />, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-700/50 bg-slate-950/80 no-print">
      {/* Branding */}
      <div className="flex items-center gap-3 border-b border-slate-700/50 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-600/20 ring-1 ring-sky-500/40">
          <Radio className="h-4 w-4 text-sky-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-wide text-slate-100">TurnControl</p>
          <p className="text-[10px] text-slate-500 leading-tight">Ground Stay Control</p>
        </div>
      </div>

      {/* Station */}
      <div className="border-b border-slate-700/50 px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Station</p>
        <p className="mt-0.5 font-mono text-sm font-bold text-sky-400">BKK / VTBS</p>
        <p className="text-[10px] text-slate-500">Bangkok Suvarnabhumi</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        <p className="px-4 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-widest text-slate-600">
          Operations
        </p>
        {navItems.map((item) => (
          <div key={item.href}>
            {item.disabled ? (
              <div className="flex cursor-not-allowed items-center gap-3 px-4 py-2 opacity-35">
                <span className="text-slate-500">{item.icon}</span>
                <span className="text-sm text-slate-500">{item.label}</span>
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-100",
                  isActive(item.href)
                    ? "bg-sky-600/15 text-sky-300 border-r-2 border-sky-500"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                )}
              >
                <span className={isActive(item.href) ? "text-sky-400" : "text-slate-500"}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="border-t border-slate-700/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-700/30 ring-1 ring-sky-600/40">
            <span className="text-[10px] font-bold text-sky-400">RS</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Ramp Supervisor</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-600">Online</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[9px] text-slate-700">TurnControl v1.0 · Demo</p>
      </div>
    </aside>
  );
}
