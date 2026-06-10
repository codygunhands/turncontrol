import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  ChevronRight,
  Clipboard,
  FileText,
  Package,
  Plane,
  UserRound,
  Wrench,
} from "lucide-react";
import { getFlightById } from "@/lib/data";
import {
  formatTime,
  getFlightStatusBg,
  getGroundStayMinutes,
  getTimeToSTD,
  formatMinutes,
  getStatusLabel,
  getSectionProgressColor,
} from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { AirlineBadge } from "@/components/AirlineBadge";
import type { FlightStatus, SectionType, TaskStatus } from "@/lib/types";

const SECTION_ICONS: Record<SectionType, React.ReactNode> = {
  passenger_service: <UserRound className="h-4 w-4" />,
  flight_operations: <Plane className="h-4 w-4" />,
  cargo:             <Package className="h-4 w-4" />,
  maintenance:       <Wrench className="h-4 w-4" />,
  ramp:              <Clipboard className="h-4 w-4" />,
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FlightDetailPage({ params }: Props) {
  const { id } = await params;
  const flight = getFlightById(id);
  if (!flight) notFound();

  const groundStay = flight.ata ? getGroundStayMinutes(flight.ata, flight.atd) : null;
  const timeToStd = getTimeToSTD(flight.std);
  const isCompleted = flight.status === "completed";
  const isCritical = flight.status === "critical";
  const isAtRisk = flight.status === "at_risk";

  const totalTasks = flight.sections.reduce((acc, s) => acc + s.tasks.length, 0);
  const doneTasks = flight.sections.reduce(
    (acc, s) => acc + s.tasks.filter((t) => t.status === "completed").length,
    0,
  );
  const overallPct = Math.round((doneTasks / totalTasks) * 100);

  const predictedDelay =
    flight.etd && flight.std
      ? Math.round((new Date(flight.etd).getTime() - new Date(flight.std).getTime()) / 60_000)
      : 0;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Back */}
      <Link
        href="/"
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-3 w-3" /> Back to Live Overview
      </Link>

      {/* Critical / alert bar */}
      {(isCritical || isAtRisk || flight.hasAlert) && (
        <div
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
            isCritical
              ? "border-red-500/50 bg-red-500/8"
              : "border-amber-500/40 bg-amber-500/8"
          }`}
        >
          <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${isCritical ? "text-red-400" : "text-amber-400"}`} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${isCritical ? "text-red-300" : "text-amber-300"}`}>
              {isCritical ? "CRITICAL ALERT" : "OPERATIONAL ALERT"}
            </p>
            <p className={`text-sm mt-0.5 ${isCritical ? "text-red-400/80" : "text-amber-400/80"}`}>
              {flight.currentBlocker ?? "Review section status below."}
              {predictedDelay > 0 && ` Projected departure delay: ${predictedDelay} min.`}
            </p>
          </div>
          <Link
            href="/alerts"
            className={`shrink-0 rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
              isCritical
                ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
                : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
            }`}
          >
            View All Alerts ({flight.alertCount})
          </Link>
        </div>
      )}

      {/* Main flight header card */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
        {/* Top row: airline + route + callouts */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left: airline badge + flight info */}
          <div className="flex items-start gap-3 flex-1">
            <AirlineBadge code={flight.airlineCode} size="md" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-mono text-2xl font-bold text-slate-100">{flight.flightNumber}</h1>
                <StatusBadge status={flight.status as FlightStatus} />
              </div>
              <p className="text-sm text-slate-400 mt-0.5">{flight.airline}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-base font-bold text-slate-200">{flight.origin}</span>
                  <span className="text-xs text-slate-600">{flight.originCity}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-base font-bold text-slate-200">{flight.destination}</span>
                  <span className="text-xs text-slate-600">{flight.destinationCity}</span>
                </div>
              </div>
              <p className="mt-1 font-mono text-xs text-slate-500">
                {flight.aircraftType} · {flight.registration}
              </p>
            </div>
          </div>

          {/* Right: prominent delay + time callouts */}
          {!isCompleted && (
            <div className="flex gap-3 shrink-0">
              {predictedDelay > 0 && (
                <div className={`rounded-lg border px-3 py-2 text-right ${
                  isCritical ? "border-red-500/40 bg-red-500/8" : "border-amber-500/30 bg-amber-500/8"
                }`}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Projected Delay
                  </p>
                  <p className={`font-mono text-xl font-bold ${isCritical ? "text-red-400" : "text-amber-400"}`}>
                    +{predictedDelay} min
                  </p>
                </div>
              )}
              <div className={`rounded-lg border px-3 py-2 text-right ${
                timeToStd < 0
                  ? "border-red-500/40 bg-red-500/8"
                  : timeToStd < 20
                  ? "border-amber-500/30 bg-amber-500/8"
                  : "border-slate-700/50 bg-slate-800/30"
              }`}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Time to STD
                </p>
                <p className={`font-mono text-xl font-bold ${
                  timeToStd < 0 ? "text-red-400" : timeToStd < 20 ? "text-amber-400" : "text-slate-300"
                }`}>
                  {timeToStd < 0 ? `-${Math.abs(timeToStd)}` : timeToStd} min
                </p>
              </div>
              <div className={`rounded-lg border px-3 py-2 text-right ${
                isCritical ? "border-red-500/30 bg-red-500/5" :
                isAtRisk ? "border-amber-500/30 bg-amber-500/5" :
                "border-slate-700/50 bg-slate-800/30"
              }`}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Turnaround Status
                </p>
                <p className={`font-mono text-sm font-bold mt-1 ${getFlightStatusBg(flight.status as FlightStatus).split(" ")[2]?.replace("border-", "text-") ?? "text-slate-300"}`}>
                  <StatusBadge status={flight.status as FlightStatus} />
                </p>
              </div>
            </div>
          )}
          {isCompleted && (
            <div className="rounded-lg border border-slate-700/40 bg-slate-800/30 px-3 py-2 text-right shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">ATD</p>
              <p className="font-mono text-xl font-bold text-slate-400">
                {flight.atd ? formatTime(flight.atd) : "—"}
              </p>
            </div>
          )}
        </div>

        {/* Key stats row */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 border-t border-slate-700/40 pt-4">
          <KeyStat label="STA (Sched.)"     value={formatTime(flight.sta)} mono />
          <KeyStat label="ATA / Block-On"   value={flight.ata ? formatTime(flight.ata) : "—"} mono />
          <KeyStat label="STD (Target)"     value={formatTime(flight.std)} mono />
          <KeyStat label="ATD (Est.)"       value={flight.etd ? formatTime(flight.etd) : formatTime(flight.std)} mono highlight={predictedDelay > 0} />
          <KeyStat label="Planned Ground"   value={`${flight.plannedGroundTime} min`} mono />
          <KeyStat label="Actual Ground"    value={groundStay !== null ? `${groundStay} min` : "—"} mono highlight={groundStay !== null && groundStay > flight.plannedGroundTime + 5} />
          <KeyStat label="Gate / Stand"     value={flight.gate} mono />
          <KeyStat label="Task Completion"  value={`${overallPct}%`} mono />
        </div>
      </div>

      {/* Section cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-slate-500">
          Section Status
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {flight.sections.map((section) => {
            const done  = section.tasks.filter((t) => t.status === "completed").length;
            const total = section.tasks.length;
            const pct   = Math.round((done / total) * 100);
            const activeTask  = section.tasks.find((t) => ["in_progress", "delayed"].includes(t.status));
            const blockedTask = section.tasks.find((t) => t.status === "blocked");
            const icon = SECTION_ICONS[section.type];

            return (
              <div
                key={section.type}
                className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-800/80 ring-1 ring-slate-700/60 text-slate-400">
                      {icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 leading-tight">{section.name}</p>
                      <p className="text-[11px] text-slate-500">{done} / {total} Tasks</p>
                    </div>
                  </div>
                  <StatusBadge status={section.status as FlightStatus} size="sm" />
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getSectionProgressColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Delay badge */}
                {section.delayMinutes > 0 && (
                  <p className="mt-2 text-[11px] font-semibold text-orange-400">
                    Delay: {section.delayMinutes} min
                  </p>
                )}

                {/* Active task */}
                {(activeTask ?? blockedTask) && (
                  <div className="mt-2 rounded border border-slate-700/40 bg-slate-800/50 px-2.5 py-1.5">
                    <p className="text-[10px] text-slate-600">Active</p>
                    <p className="text-xs text-slate-300 leading-snug">
                      {(activeTask ?? blockedTask)!.name}
                    </p>
                    {(activeTask ?? blockedTask)!.delayMinutes > 0 && (
                      <p className="text-[10px] text-orange-400">
                        +{(activeTask ?? blockedTask)!.delayMinutes}m
                      </p>
                    )}
                  </div>
                )}

                <Link
                  href={`/flights/${id}/sections/${section.type}`}
                  className="mt-3 flex items-center justify-center gap-1 rounded border border-slate-600/40 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-colors"
                >
                  View Tasks <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/flights/${id}/timeline`}
          className="flex items-center gap-1.5 rounded border border-slate-600/50 bg-slate-800/50 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700/50 transition-colors"
        >
          <BarChart2 className="h-3.5 w-3.5" /> View Timeline
        </Link>
        <Link
          href={`/reports/${id}`}
          className={`flex items-center gap-1.5 rounded border px-3 py-2 text-xs font-semibold transition-colors ${
            isCompleted
              ? "border-sky-500/40 bg-sky-600/10 text-sky-400 hover:bg-sky-600/20"
              : "border-slate-700/40 bg-slate-800/30 text-slate-600 cursor-not-allowed"
          }`}
        >
          <FileText className="h-3.5 w-3.5" /> Generate Report
        </Link>
      </div>
    </div>
  );
}

function KeyStat({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">{label}</p>
      <p className={`mt-0.5 text-sm font-semibold ${mono ? "font-mono" : ""} ${highlight ? "text-amber-400" : "text-slate-300"}`}>
        {value}
      </p>
    </div>
  );
}
