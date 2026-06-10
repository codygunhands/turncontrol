"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TurnControlLogo } from "@/components/TurnControlLogo";
import {
  LayoutDashboard,
  Plane,
  AlertTriangle,
  Layers,
  FileText,
  BarChart2,
  Settings,
  GitBranch,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/",         label: "Live Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/flights",  label: "Flights",       icon: <Plane className="h-4 w-4" /> },
  { href: "/alerts",   label: "Alerts",        icon: <AlertTriangle className="h-4 w-4" />, badge: "7" },
  { href: "/sections", label: "Sections",      icon: <Layers className="h-4 w-4" />, disabled: true },
  { href: "/reports",  label: "Reports",       icon: <FileText className="h-4 w-4" /> },
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
    <aside
      className="hidden md:flex w-56 shrink-0 flex-col no-print"
      style={{
        background: "#061018",
        borderRight: "1px solid rgba(143, 161, 183, 0.1)",
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-3 px-4 py-[14px]"
        style={{ borderBottom: "1px solid rgba(143, 161, 183, 0.08)" }}
      >
        <TurnControlLogo size="sm" />
      </div>

      {/* Station badge */}
      <div
        className="px-4 py-2.5"
        style={{ borderBottom: "1px solid rgba(143, 161, 183, 0.08)" }}
      >
        <p className="tc-label mb-0.5">Station</p>
        <p className="font-mono text-sm font-bold" style={{ color: "#207CFF" }}>BKK / VTBS</p>
        <p className="text-[10px]" style={{ color: "#687289" }}>Bangkok Suvarnabhumi</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        <p className="px-4 pb-1 pt-2 text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#4a5568" }}>
          Operations
        </p>
        {navItems.map((item) => (
          <div key={item.href}>
            {item.disabled ? (
              <div className="flex cursor-not-allowed items-center gap-3 px-4 py-2 opacity-30">
                <span style={{ color: "#687289" }}>{item.icon}</span>
                <span className="text-sm" style={{ color: "#687289" }}>{item.label}</span>
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm transition-colors duration-100",
                  isActive(item.href)
                    ? "border-r-2 font-medium"
                    : "hover:bg-white/5",
                )}
                style={
                  isActive(item.href)
                    ? {
                        background: "rgba(32, 124, 255, 0.1)",
                        color: "#5ba4ff",
                        borderRightColor: "#207CFF",
                      }
                    : { color: "#8FA1B7" }
                }
              >
                <span style={isActive(item.href) ? { color: "#207CFF" } : { color: "#687289" }}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={{ background: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User */}
      <div
        className="px-4 py-3"
        style={{ borderTop: "1px solid rgba(143, 161, 183, 0.08)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(32, 124, 255, 0.15)", border: "1px solid rgba(32, 124, 255, 0.25)" }}
          >
            <span className="text-[10px] font-bold" style={{ color: "#207CFF" }}>RS</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">Ramp Supervisor</p>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#22C55E" }} />
              <span className="text-[10px]" style={{ color: "#687289" }}>Online</span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[9px]" style={{ color: "#3a4a5c" }}>TurnControl v1.0 · Demo</p>
      </div>
    </aside>
  );
}
