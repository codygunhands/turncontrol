import { cn } from "@/lib/utils";

const AIRLINE_COLORS: Record<string, { bg: string; text: string; short: string }> = {
  TG: { bg: "bg-red-900/60",    text: "text-red-300",    short: "TG" },
  NH: { bg: "bg-blue-900/60",   text: "text-blue-300",   short: "NH" },
  SQ: { bg: "bg-sky-900/60",    text: "text-sky-300",    short: "SQ" },
  FD: { bg: "bg-red-900/60",    text: "text-red-400",    short: "FD" },
  AK: { bg: "bg-red-900/60",    text: "text-red-400",    short: "AK" },
  VZ: { bg: "bg-rose-900/60",   text: "text-rose-300",   short: "VZ" },
  PG: { bg: "bg-violet-900/60", text: "text-violet-300", short: "PG" },
};

const DEFAULT = { bg: "bg-slate-700/60", text: "text-slate-300", short: "??" };

interface AirlineBadgeProps {
  code: string;
  className?: string;
  size?: "sm" | "md";
}

export function AirlineBadge({ code, className, size = "md" }: AirlineBadgeProps) {
  const c = AIRLINE_COLORS[code] ?? DEFAULT;
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-mono font-bold ring-1 ring-white/10 shrink-0",
        size === "sm"
          ? "h-6 w-6 text-[9px]"
          : "h-8 w-8 text-[10px]",
        c.bg,
        c.text,
        className,
      )}
    >
      {c.short}
    </div>
  );
}
