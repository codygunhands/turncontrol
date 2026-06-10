"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plane, AlertTriangle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/",        label: "Overview",  icon: LayoutDashboard },
  { href: "/flights", label: "Flights",   icon: Plane },
  { href: "/alerts",  label: "Alerts",    icon: AlertTriangle, badge: "7" },
  { href: "/reports", label: "Reports",   icon: FileText },
];

export function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-slate-700/60 bg-slate-950/95 backdrop-blur-sm no-print">
      <div className="flex items-stretch">
        {tabs.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-center transition-colors duration-100",
                active ? "text-sky-400" : "text-slate-500 hover:text-slate-300",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge && !active && (
                  <span className="absolute -right-2 -top-1.5 rounded-full bg-red-500 px-1 text-[9px] font-bold leading-4 text-white">
                    {badge}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium leading-none",
                active ? "text-sky-400" : "text-slate-600",
              )}>
                {label}
              </span>
              {active && (
                <span className="absolute top-0 inset-x-0 h-0.5 bg-sky-500 rounded-b" />
              )}
            </Link>
          );
        })}
      </div>
      {/* iOS safe area spacer */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}
