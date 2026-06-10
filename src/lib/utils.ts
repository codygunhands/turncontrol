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

export function getFlightStatusColor(status: FlightStatus): string {
  switch (status) {
    case "on_time":   return "text-emerald-400";
    case "at_risk":   return "text-amber-400";
    case "delayed":   return "text-orange-400";
    case "critical":  return "text-red-400";
    case "completed": return "text-slate-400";
  }
}

export function getFlightStatusBg(status: FlightStatus): string {
  switch (status) {
    case "on_time":   return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "at_risk":   return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "delayed":   return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    case "critical":  return "bg-red-500/10 text-red-400 border-red-500/30";
    case "completed": return "bg-slate-700/30 text-slate-400 border-slate-600/30";
  }
}

export function getTaskStatusBg(status: TaskStatus): string {
  switch (status) {
    case "completed":   return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "in_progress": return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    case "delayed":     return "bg-orange-500/10 text-orange-400 border-orange-500/30";
    case "blocked":     return "bg-red-500/10 text-red-400 border-red-500/30";
    case "not_started": return "bg-slate-700/20 text-slate-500 border-slate-600/30";
  }
}

export function getAlertSeverityBg(severity: string): string {
  switch (severity) {
    case "critical": return "bg-red-500/10 text-red-400 border-red-500/30";
    case "warning":  return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "info":     return "bg-sky-500/10 text-sky-400 border-sky-500/30";
    default:         return "bg-slate-700/20 text-slate-400 border-slate-600/20";
  }
}

export function getSectionProgressColor(pct: number): string {
  if (pct >= 90) return "bg-emerald-500";
  if (pct >= 60) return "bg-sky-500";
  if (pct >= 30) return "bg-amber-500";
  return "bg-red-500";
}
