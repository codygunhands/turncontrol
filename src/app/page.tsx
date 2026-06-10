import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, Plane, TrendingUp } from "lucide-react";
import { getFlights } from "@/lib/data";
import {
  formatTime,
  getFlightStatusBg,
  getGroundStayMinutes,
  getTimeToSTD,
  formatMinutes,
  getSectionProgressColor,
  getStatusLabel,
} from "@/lib/utils";
import { LiveClock } from "@/components/LiveClock";
import { AutoRefresh } from "@/components/AutoRefresh";
import { AirlineBadge } from "@/components/AirlineBadge";
import type { FlightStatus, SectionType } from "@/lib/types";

const SECTIONS: { type: SectionType; short: string }[] = [
  { type: "passenger_service", short: "PAX" },
  { type: "flight_operations", short: "OPS" },
  { type: "cargo",             short: "CGO" },
  { type: "maintenance",       short: "MNT" },
  { type: "ramp",              short: "RMP" },
];

const SECTION_DOT: Record<string, string> = {
  completed: "bg-emerald-500",
  on_time:   "bg-emerald-500",
  at_risk:   "bg-amber-400",
  delayed:   "bg-orange-500",
  critical:  "bg-red-500",
};

export default function DashboardPage() {
  const flights = getFlights();

  const total     = flights.length;
  const onTime    = flights.filter((f) => f.status === "on_time").length;
  const atRisk    = flights.filter((f) => f.status === "at_risk").length;
  const delayed   = flights.filter((f) => f.status === "delayed").length;
  const critical  = flights.filter((f) => f.status === "critical").length;
  const completed = flights.filter((f) => f.status === "completed").length;

  return (
    <div className="flex flex-col min-h-full p-4 md:p-6 gap-4">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">Live Overview</h1>
          <p className="text-sm text-slate-500">Bangkok (BKK) Station · UTC+7</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <AutoRefresh />
          <LiveClock />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Total Flights"   value={total}            icon={<Plane className="h-4 w-4" />}         color="text-slate-300" />
        <SummaryCard label="On Time"         value={onTime}           icon={<CheckCircle2 className="h-4 w-4" />}  color="text-emerald-400" highlight={onTime > 0} />
        <SummaryCard label="At Risk"         value={atRisk}           icon={<TrendingUp className="h-4 w-4" />}    color="text-amber-400"   highlight={atRisk > 0} />
        <SummaryCard label="Delayed"         value={delayed + critical} icon={<AlertTriangle className="h-4 w-4" />} color={delayed + critical > 0 ? "text-red-400" : "text-slate-400"} highlight={delayed + critical > 0} />
        <SummaryCard label="Completed"       value={completed}        icon={<Clock className="h-4 w-4" />}         color="text-slate-400" />
      </div>

      {/* Critical alert banner */}
      {critical > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/8 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
          <span className="text-sm font-medium text-red-300">
            {critical} flight{critical > 1 ? "s" : ""} at CRITICAL —{" "}
            {flights.filter((f) => f.status === "critical").map((f) => f.flightNumber).join(", ")}.
            Immediate action required.
          </span>
          <Link href="/alerts" className="ml-auto shrink-0 rounded border border-red-500/40 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors">
            View Alerts ({flights.reduce((a, f) => a + f.alertCount, 0)})
          </Link>
        </div>
      )}

      {/* ── Mobile flight cards (< md) ─────────────────────────────── */}
      <div className="flex flex-col gap-2 md:hidden">
        {flights.map((flight) => {
          const timeToStd   = getTimeToSTD(flight.std);
          const isCompleted = flight.status === "completed";
          return (
            <Link
              key={flight.id}
              href={`/flights/${flight.id}`}
              className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-3 hover:border-slate-600/70 hover:bg-slate-800/50 transition-colors active:scale-[0.99]"
            >
              {/* Top row: badge + flight + status */}
              <div className="flex items-center gap-2.5">
                <AirlineBadge code={flight.airlineCode} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-mono font-bold text-slate-100">{flight.flightNumber}</p>
                    <span className="font-mono text-xs text-slate-500">{flight.origin}→{flight.destination}</span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-tight">{flight.aircraftType} · Gate {flight.gate}</p>
                </div>
                <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide ${getFlightStatusBg(flight.status as FlightStatus)}`}>
                  {getStatusLabel(flight.status)}
                </span>
              </div>

              {/* Bottom row: ATA · STD · time · section dots */}
              <div className="mt-2.5 flex items-center gap-3 border-t border-slate-700/30 pt-2">
                <div className="flex gap-3 flex-1 min-w-0">
                  {flight.ata && (
                    <div>
                      <p className="text-[9px] text-slate-600 uppercase tracking-widest">ATA</p>
                      <p className="font-mono text-xs text-slate-300">{formatTime(flight.ata)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">STD</p>
                    <p className="font-mono text-xs text-slate-300">{formatTime(flight.std)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest">{isCompleted ? "ATD" : "To STD"}</p>
                    {isCompleted ? (
                      <p className="font-mono text-xs text-slate-500">{flight.atd ? formatTime(flight.atd) : "—"}</p>
                    ) : (
                      <p className={`font-mono text-xs font-bold tabular-nums ${timeToStd < 0 ? "text-red-400" : timeToStd < 20 ? "text-amber-400" : "text-slate-300"}`}>
                        {timeToStd < 0 ? `${Math.abs(timeToStd)}m late` : `${timeToStd}m`}
                      </p>
                    )}
                  </div>
                </div>

                {/* Section dots */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {SECTIONS.map(({ type, short }) => {
                    const section  = flight.sections.find((s) => s.type === type);
                    const dotColor = SECTION_DOT[section?.status ?? "not_started"] ?? "bg-slate-700";
                    return (
                      <div key={type} className="flex flex-col items-center gap-0.5" title={`${short}: ${getStatusLabel(section?.status ?? "not_started")}`}>
                        <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                        <span className="text-[8px] text-slate-700">{short}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Alert indicator */}
                {flight.alertCount > 0 && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    <AlertTriangle className={`h-3.5 w-3.5 ${flight.status === "critical" ? "text-red-400" : "text-amber-400"}`} />
                    <span className={`text-[10px] font-bold ${flight.status === "critical" ? "text-red-400" : "text-amber-400"}`}>
                      {flight.alertCount}
                    </span>
                  </div>
                )}
              </div>

              {/* Blocker notice */}
              {flight.currentBlocker && !isCompleted && (
                <p className="mt-1.5 text-[10px] text-amber-400/90 leading-tight border-t border-amber-500/10 pt-1.5">
                  ⚠ {flight.currentBlocker}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {/* ── Desktop flight table (≥ md) ──────────────────────────────── */}
      <div className="hidden md:block rounded-lg border border-slate-700/50 bg-slate-900/60 overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1020px] text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="tc-table-header px-4 py-3 text-left">Flight</th>
              <th className="tc-table-header px-3 py-3 text-left">Route</th>
              <th className="tc-table-header px-3 py-3 text-left">Aircraft</th>
              <th className="tc-table-header px-3 py-3 text-left">Date / Stand</th>
              <th className="tc-table-header px-3 py-3 text-left">ATA / Block-On</th>
              <th className="tc-table-header px-3 py-3 text-left">STD (Target)</th>
              <th className="tc-table-header px-3 py-3 text-left">Section Status</th>
              <th className="tc-table-header px-3 py-3 text-left">Status</th>
              <th className="tc-table-header px-3 py-3 text-left">Time to STD</th>
              <th className="tc-table-header px-3 py-3 text-left">Alert</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => {
              const groundStay = flight.ata ? getGroundStayMinutes(flight.ata, flight.atd) : null;
              const timeToStd  = getTimeToSTD(flight.std);
              const isCompleted = flight.status === "completed";

              return (
                <tr
                  key={flight.id}
                  className="group border-b border-slate-700/30 transition-colors hover:bg-slate-800/40"
                >
                  {/* Flight + airline badge */}
                  <td className="px-4 py-3">
                    <Link
                      href={`/flights/${flight.id}`}
                      className="flex items-center gap-2 hover:text-sky-300 transition-colors"
                    >
                      <AirlineBadge code={flight.airlineCode} size="sm" />
                      <div>
                        <p className="font-mono font-bold text-slate-100 group-hover:text-sky-300 leading-tight">
                          {flight.flightNumber}
                        </p>
                        <p className="text-[10px] text-slate-600 leading-tight">{flight.airlineCode}</p>
                      </div>
                    </Link>
                  </td>

                  {/* Route */}
                  <td className="px-3 py-3">
                    <span className="font-mono text-sm text-slate-300">{flight.origin}–{flight.destination}</span>
                  </td>

                  {/* Aircraft */}
                  <td className="px-3 py-3">
                    <p className="font-mono text-xs text-slate-400">{flight.aircraftType}</p>
                    <p className="font-mono text-[10px] text-slate-600">{flight.registration}</p>
                  </td>

                  {/* Date / stand */}
                  <td className="px-3 py-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-slate-300">
                      {flight.gate}
                    </span>
                  </td>

                  {/* ATA */}
                  <td className="px-3 py-3">
                    {flight.ata ? (
                      <span className="font-mono text-xs text-slate-300">{formatTime(flight.ata)}</span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* STD */}
                  <td className="px-3 py-3">
                    <p className="font-mono text-xs text-slate-300">{formatTime(flight.std)}</p>
                    {flight.etd && flight.etd !== flight.std && (
                      <p className="font-mono text-[10px] text-amber-400">ETD {formatTime(flight.etd)}</p>
                    )}
                  </td>

                  {/* Section status dots */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {SECTIONS.map(({ type, short }) => {
                        const section = flight.sections.find((s) => s.type === type);
                        const dotColor = SECTION_DOT[section?.status ?? "not_started"] ?? "bg-slate-700";
                        return (
                          <div key={type} className="flex flex-col items-center gap-0.5" title={`${short}: ${getStatusLabel(section?.status ?? "not_started")}`}>
                            <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                            <span className="text-[8px] text-slate-700">{short}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${getFlightStatusBg(flight.status as FlightStatus)}`}
                    >
                      {flight.hasAlert && !isCompleted && (
                        <AlertTriangle className="mr-1 h-2.5 w-2.5" />
                      )}
                      {getStatusLabel(flight.status)}
                    </span>
                    {flight.currentBlocker && (
                      <p className="mt-0.5 text-[10px] text-amber-400 max-w-[140px] leading-tight">
                        {flight.currentBlocker}
                      </p>
                    )}
                  </td>

                  {/* Time to STD */}
                  <td className="px-3 py-3">
                    {isCompleted ? (
                      <div>
                        <p className="font-mono text-[10px] text-slate-500">Departed</p>
                        {flight.atd && (
                          <p className="font-mono text-[10px] text-slate-600">{formatTime(flight.atd)}</p>
                        )}
                      </div>
                    ) : (
                      <span
                        className={`font-mono text-xs font-bold ${
                          timeToStd < 0
                            ? "text-red-400"
                            : timeToStd < 20
                            ? "text-amber-400"
                            : "text-slate-300"
                        }`}
                      >
                        {timeToStd < 0
                          ? `${Math.abs(timeToStd)}m late`
                          : `${timeToStd} min`}
                      </span>
                    )}
                  </td>

                  {/* Alert icon */}
                  <td className="px-3 py-3">
                    {flight.alertCount > 0 ? (
                      <Link href="/alerts" className="flex items-center gap-1">
                        <AlertTriangle className={`h-3.5 w-3.5 ${flight.status === "critical" ? "text-red-400" : "text-amber-400"}`} />
                        <span className={`text-[10px] font-bold ${flight.status === "critical" ? "text-red-400" : "text-amber-400"}`}>
                          {flight.alertCount}
                        </span>
                      </Link>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-600">
        <span className="font-semibold uppercase tracking-widest">Section Status:</span>
        {[
          { color: "bg-emerald-500", label: "On Time" },
          { color: "bg-amber-400",   label: "At Risk (5–15m)" },
          { color: "bg-orange-500",  label: "Delayed (>15m)" },
          { color: "bg-slate-700",   label: "Not Started" },
          { color: "bg-slate-500",   label: "Completed" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-slate-900/60 px-4 py-3 ${
        highlight ? "border-slate-600/60" : "border-slate-700/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
        <span className={color}>{icon}</span>
      </div>
      <p className={`mt-1.5 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}
