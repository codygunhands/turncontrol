import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { FlightStatus, SectionType, TaskStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function addMin(base: Date, minutes: number): string {
  return new Date(base.getTime() + minutes * 60_000).toISOString();
}

export function formatTime(iso: string, tz = "Asia/Bangkok"): string {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Bangkok",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}

export function getGroundStayMinutes(ata: string, atd?: string): number {
  const end = atd ? new Date(atd) : new Date();
  return Math.round((end.getTime() - new Date(ata).getTime()) / 60_000);
}

export function getTimeToSTD(std: string): number {
  return Math.round((new Date(std).getTime() - Date.now()) / 60_000);
}

export function formatMinutes(minutes: number): string {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = minutes < 0 ? "-" : "+";
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}m`;
}

export function formatMinutesSigned(minutes: number): string {
  if (minutes === 0) return "0m";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = minutes < 0 ? "-" : "+";
  if (h > 0) return `${sign}${h}h ${m.toString().padStart(2, "0")}m`;
  return `${sign}${m}m`;
}

export function getSectionName(type: SectionType): string {
  const names: Record<SectionType, string> = {
    passenger_service: "Passenger Service",
    flight_operations: "Flight Operations",
    cargo: "Cargo",
    maintenance: "Maintenance",
    ramp: "Ramp Supervisor",
  };
  return names[type];
}

export function getSectionShortName(type: SectionType): string {
  const names: Record<SectionType, string> = {
    passenger_service: "PAX",
    flight_operations: "OPS",
    cargo: "CGO",
    maintenance: "MNT",
    ramp: "RMP",
  };
  return names[type];
}

export function getStatusLabel(status: FlightStatus | TaskStatus): string {
  const labels: Record<string, string> = {
    on_time: "On Time",
    at_risk: "At Risk",
    delayed: "Delayed",
    critical: "Critical",
    completed: "Completed",
    not_started: "Not Started",
    in_progress: "In Progress",
    blocked: "Blocked",
  };
  return labels[status] ?? status;
}

/* ── Brand semantic status colors (exact hex) ──────────────── */
export const STATUS_COLORS = {
  on_time:     "#22C55E",  // green-500
  at_risk:     "#FBBF24",  // amber-400
  delayed:     "#F97316",  // orange-500
  critical:    "#EF4444",  // red-500
  in_progress: "#3B82F6",  // blue-500
  completed:   "#64748B",  // slate-500
  not_started: "#687289",  // tc-neutral
  blocked:     "#EF4444",  // red-500
} as const;

export function getStatusHex(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.not_started;
}

export function getFlightStatusColor(status: FlightStatus): string {
  switch (status) {
    case "on_time":   return "text-green-500";
    case "at_risk":   return "text-amber-400";
    case "delayed":   return "text-orange-500";
    case "critical":  return "text-red-500";
    case "completed": return "text-slate-500";
  }
}

export function getFlightStatusBg(status: FlightStatus): string {
  switch (status) {
    case "on_time":   return "bg-green-500/10 text-green-400 border-green-500/25";
    case "at_risk":   return "bg-amber-400/10 text-amber-400 border-amber-400/25";
    case "delayed":   return "bg-orange-500/10 text-orange-400 border-orange-500/25";
    case "critical":  return "bg-red-500/10 text-red-400 border-red-500/25";
    case "completed": return "bg-slate-500/10 text-slate-400 border-slate-500/25";
  }
}

export function getTaskStatusBg(status: TaskStatus): string {
  switch (status) {
    case "completed":   return "bg-green-500/10 text-green-400 border-green-500/25";
    case "in_progress": return "bg-blue-500/10 text-blue-400 border-blue-500/25";
    case "delayed":     return "bg-orange-500/10 text-orange-400 border-orange-500/25";
    case "blocked":     return "bg-red-500/10 text-red-400 border-red-500/25";
    case "not_started": return "bg-slate-700/20 text-slate-500 border-slate-600/25";
  }
}

export function getAlertSeverityBg(severity: string): string {
  switch (severity) {
    case "critical": return "bg-red-500/10 text-red-400 border-red-500/25";
    case "warning":  return "bg-amber-400/10 text-amber-400 border-amber-400/25";
    case "info":     return "bg-blue-500/10 text-blue-400 border-blue-500/25";
    default:         return "bg-slate-700/20 text-slate-400 border-slate-600/20";
  }
}

export function getSectionProgressColor(pct: number): string {
  if (pct >= 90) return "bg-green-500";
  if (pct >= 60) return "bg-blue-500";
  if (pct >= 30) return "bg-amber-400";
  return "bg-red-500";
}
