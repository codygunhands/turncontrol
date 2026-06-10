import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getFlightById, getTimelineActivities } from "@/lib/data";
import { formatTime, getSectionName } from "@/lib/utils";
import type { SectionType } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

const SECTION_COLOR: Record<SectionType, string> = {
  passenger_service: "bg-sky-500",
  flight_operations: "bg-violet-500",
  cargo: "bg-amber-500",
  maintenance: "bg-rose-500",
  ramp: "bg-teal-500",
};

const SECTION_TEXT: Record<SectionType, string> = {
  passenger_service: "text-sky-400",
  flight_operations: "text-violet-400",
  cargo: "text-amber-400",
  maintenance: "text-rose-400",
  ramp: "text-teal-400",
};

const SECTION_ACTUAL_COLOR: Record<SectionType, string> = {
  passenger_service: "bg-sky-400/30 border-sky-500/60",
  flight_operations: "bg-violet-400/30 border-violet-500/60",
  cargo: "bg-amber-400/30 border-amber-500/60",
  maintenance: "bg-rose-400/30 border-rose-500/60",
  ramp: "bg-teal-400/30 border-teal-500/60",
};

export default async function TimelinePage({ params }: Props) {
  const { id } = await params;
  const flight = getFlightById(id);
  if (!flight?.ata) notFound();

  const activities = getTimelineActivities(id);
  const ata = new Date(flight.ata).getTime();
  const std = new Date(flight.std).getTime();
  const gtMinutes = Math.round((std - ata) / 60_000);
  const windowEnd = gtMinutes + 15;

  // Compute total delay from critical path
  const criticalDelay = activities
    .filter((a) => a.isCriticalPath)
    .reduce((max, a) => Math.max(max, a.delayMinutes), 0);

  function pct(minutes: number) {
    return Math.max(0, Math.min(100, (minutes / windowEnd) * 100));
  }

  const stdPct = pct(gtMinutes);

  // Time axis labels every 15min
  const timeLabels: { min: number; label: string }[] = [];
  for (let m = 0; m <= windowEnd; m += 15) {
    const labelTime = new Date(ata + m * 60_000);
    timeLabels.push({
      min: m,
      label: labelTime.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      }),
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">Dashboard</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/flights/${id}`} className="hover:text-slate-300 transition-colors">
          {flight.flightNumber}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-400">Timeline</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Critical Path Timeline</h1>
          <p className="text-sm text-slate-500">
            {flight.flightNumber} · {flight.origin}–{flight.destination} · Gate {flight.gate}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">Block-On: <span className="font-mono text-slate-300">{formatTime(flight.ata!)}</span></p>
          <p className="text-[10px] text-slate-500">STD: <span className="font-mono text-slate-300">{formatTime(flight.std)}</span></p>
          <p className="text-[10px] text-slate-500">Planned Ground Time: <span className="font-mono text-slate-300">{gtMinutes}m</span></p>
        </div>
      </div>

      {/* Delay summary */}
      {criticalDelay > 0 && (
        <div className="rounded-lg border border-orange-500/40 bg-orange-500/8 px-4 py-3">
          <p className="text-sm font-semibold text-orange-300">
            Critical Path Delay: +{criticalDelay} min
          </p>
          <p className="mt-0.5 text-xs text-orange-400/80">
            {flight.id === "tg409"
              ? "Fueling start delay is impacting W&B confirmation and passenger boarding readiness."
              : flight.id === "sq979"
              ? "Cargo load delay is blocking baggage load and W&B update. Boarding cannot start."
              : flight.id === "pg213"
              ? "Cleaning delay has blocked gate open, boarding, and pushback readiness."
              : "Review section activities below for delay source."}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded bg-emerald-500/70" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded border border-sky-500/60 bg-sky-400/40" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded border border-orange-500/60 bg-orange-400/30" />
          <span>At Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded bg-slate-700/80" />
          <span>Not Started</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-6 rounded bg-slate-600/70 ring-1 ring-red-500/40" />
          <span>Critical Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-0.5 bg-amber-400" />
          <span>STD</span>
        </div>
      </div>

      {/* Gantt chart */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4 overflow-x-auto scrollbar-thin">
        <div className="min-w-[640px]">
          {/* Time axis */}
          <div className="relative mb-1 h-6 pl-40">
            {timeLabels.map(({ min, label }) => (
              <div
                key={min}
                className="absolute -translate-x-1/2 text-[9px] text-slate-600"
                style={{ left: `${pct(min)}%` }}
              >
                {label}
              </div>
            ))}
          </div>

          {/* Tick marks */}
          <div className="relative mb-3 h-2 pl-40 border-b border-slate-700/40">
            {timeLabels.map(({ min }) => (
              <div
                key={min}
                className="absolute bottom-0 h-2 w-px bg-slate-700/60"
                style={{ left: `calc(160px + ${pct(min)}% * (100% - 160px) / 100)` }}
              />
            ))}
          </div>

          {/* Activity rows */}
          <div className="flex flex-col gap-2">
            {activities.map((activity) => {
              const hasActual = activity.actualStart !== undefined;
              const isActive = hasActual && activity.actualEnd === undefined;

              return (
                <div key={activity.id} className="flex items-center gap-3">
                  {/* Label */}
                  <div className="w-40 shrink-0 flex flex-col">
                    <span className={`text-xs font-medium ${SECTION_TEXT[activity.section]}`}>
                      {activity.name}
                    </span>
                    <span className="text-[9px] text-slate-600">
                      {getSectionName(activity.section)}
                    </span>
                  </div>

                  {/* Bar container */}
                  <div className="relative flex-1 h-6">
                    {/* Planned bar */}
                    <div
                      className={`absolute inset-y-1 rounded ${
                        activity.isCriticalPath
                          ? "bg-slate-600/70 ring-1 ring-red-500/30"
                          : "bg-slate-700/60"
                      }`}
                      style={{
                        left: `${pct(activity.plannedStart)}%`,
                        width: `${pct(activity.plannedEnd) - pct(activity.plannedStart)}%`,
                      }}
                    />

                    {/* Actual bar */}
                    {hasActual && (
                      <div
                        className={`absolute inset-y-0.5 rounded border ${
                          activity.actualEnd !== undefined
                            ? "bg-emerald-500/40 border-emerald-500/70"
                            : activity.delayMinutes > 0
                            ? "bg-orange-500/40 border-orange-500/70"
                            : `${SECTION_ACTUAL_COLOR[activity.section]}`
                        } ${isActive && activity.delayMinutes === 0 ? "animate-pulse" : ""}`}
                        style={{
                          left: `${pct(activity.actualStart!)}%`,
                          width: activity.actualEnd !== undefined
                            ? `${pct(activity.actualEnd) - pct(activity.actualStart!)}%`
                            : `${pct(Math.max(gtMinutes - 5, activity.actualStart! + 1)) - pct(activity.actualStart!)}%`,
                        }}
                      />
                    )}

                    {/* STD vertical line */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-amber-400/70 z-10"
                      style={{ left: `${stdPct}%` }}
                    />

                    {/* Delay indicator */}
                    {activity.delayMinutes > 0 && (
                      <div
                        className="absolute top-0 -translate-y-full text-[9px] font-bold text-orange-400"
                        style={{ left: `${pct(activity.actualStart ?? activity.plannedStart)}%` }}
                      >
                        +{activity.delayMinutes}m
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="w-16 shrink-0 text-right">
                    <span className={`text-[10px] font-semibold ${
                      activity.actualEnd !== undefined
                        ? "text-emerald-400"
                        : isActive && activity.delayMinutes > 0
                        ? "text-orange-400"
                        : isActive
                        ? "text-sky-400"
                        : "text-slate-600"
                    }`}>
                      {activity.actualEnd !== undefined
                        ? "Done"
                        : isActive && activity.delayMinutes > 0
                        ? "At Risk"
                        : isActive
                        ? "Active"
                        : "Pending"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* STD label */}
          <div className="relative mt-2 pl-40 h-4">
            <div
              className="absolute text-[9px] font-bold text-amber-400 -translate-x-1/2"
              style={{ left: `${stdPct}%` }}
            >
              STD {formatTime(flight.std)}
            </div>
          </div>
        </div>
      </div>

      {/* Back */}
      <Link
        href={`/flights/${id}`}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-3 w-3" /> Back to {flight.flightNumber} Detail
      </Link>
    </div>
  );
}
