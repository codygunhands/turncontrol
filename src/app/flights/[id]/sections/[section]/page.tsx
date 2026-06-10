import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";
import { getFlightById, getSectionByType } from "@/lib/data";
import {
  formatTime,
  getSectionName,
  getTaskStatusBg,
  getStatusLabel,
  getFlightStatusBg,
} from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import type { FlightStatus, SectionType, TaskStatus } from "@/lib/types";

interface Props {
  params: Promise<{ id: string; section: string }>;
}

export default async function SectionPage({ params }: Props) {
  const { id, section } = await params;
  const flight = getFlightById(id);
  if (!flight) notFound();

  const sectionData = getSectionByType(id, section as SectionType);
  if (!sectionData) notFound();

  const done = sectionData.tasks.filter((t) => t.status === "completed").length;
  const total = sectionData.tasks.length;
  const pct = Math.round((done / total) * 100);

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
        <span className="text-slate-400">{sectionData.name}</span>
      </div>

      {/* Header */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-100">{sectionData.name}</h1>
              <StatusBadge status={sectionData.status as FlightStatus} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Flight{" "}
              <Link href={`/flights/${id}`} className="font-mono font-bold text-sky-400 hover:text-sky-300">
                {flight.flightNumber}
              </Link>{" "}
              · {flight.origin}–{flight.destination} · {flight.aircraftType} · Gate {flight.gate}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs text-slate-500">
              {done}/{total} tasks complete
            </p>
            <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  pct >= 90 ? "bg-emerald-500" : pct >= 60 ? "bg-sky-500" : pct >= 30 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {sectionData.delayMinutes > 0 && (
              <p className="text-xs text-orange-400">Section delay: +{sectionData.delayMinutes}m</p>
            )}
          </div>
        </div>
      </div>

      {/* Tasks table */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="tc-table-header px-3 py-3 text-center w-8">#</th>
              <th className="tc-table-header px-4 py-3 text-left">Task</th>
              <th className="tc-table-header px-3 py-3 text-left">Planned Start</th>
              <th className="tc-table-header px-3 py-3 text-left">Planned End</th>
              <th className="tc-table-header px-3 py-3 text-left">Actual Start</th>
              <th className="tc-table-header px-3 py-3 text-left">Actual End</th>
              <th className="tc-table-header px-3 py-3 text-left">Responsible</th>
              <th className="tc-table-header px-3 py-3 text-left">Status</th>
              <th className="tc-table-header px-3 py-3 text-left">Delay</th>
              <th className="tc-table-header px-3 py-3 text-left">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sectionData.tasks.map((task, rowIndex) => (
              <tr
                key={task.id}
                className="group border-b border-slate-700/30 hover:bg-slate-800/40 transition-colors"
              >
                {/* Row number */}
                <td className="px-3 py-3 text-center font-mono text-xs text-slate-600">
                  {rowIndex + 1}
                </td>
                {/* Task name */}
                <td className="px-4 py-3">
                  <Link
                    href={`/flights/${id}/tasks/${task.id}`}
                    className="font-medium text-slate-200 hover:text-sky-300 transition-colors"
                  >
                    {task.name}
                  </Link>
                  {task.dependencies && task.dependencies.length > 0 && (
                    <p className="text-[10px] text-slate-600 mt-0.5">
                      Deps: {task.dependencies.length}
                    </p>
                  )}
                </td>
                {/* Planned start */}
                <td className="px-3 py-3 font-mono text-xs text-slate-400">
                  {formatTime(task.plannedStart)}
                </td>
                {/* Planned end */}
                <td className="px-3 py-3 font-mono text-xs text-slate-400">
                  {formatTime(task.plannedEnd)}
                </td>
                {/* Actual start */}
                <td className="px-3 py-3">
                  {task.actualStart ? (
                    <span className="font-mono text-xs text-slate-300">{formatTime(task.actualStart)}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                {/* Actual end */}
                <td className="px-3 py-3">
                  {task.actualEnd ? (
                    <span className="font-mono text-xs text-slate-300">{formatTime(task.actualEnd)}</span>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
                {/* Responsible */}
                <td className="px-3 py-3 text-xs text-slate-400">
                  {task.responsible}
                </td>
                {/* Status */}
                <td className="px-3 py-3">
                  <StatusBadge status={task.status as TaskStatus} size="sm" />
                </td>
                {/* Delay */}
                <td className="px-3 py-3">
                  {task.delayMinutes > 0 ? (
                    <span className="font-mono text-xs font-semibold text-orange-400">
                      +{task.delayMinutes}m
                    </span>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
                {/* Notes */}
                <td className="px-3 py-3 max-w-[200px]">
                  {task.notes ? (
                    <Link
                      href={`/flights/${id}/tasks/${task.id}`}
                      className="flex items-center gap-1 text-[10px] text-sky-500 hover:text-sky-400 transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{task.notes}</span>
                    </Link>
                  ) : (
                    <span className="text-slate-600 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Behind-schedule notice */}
        {sectionData.delayMinutes > 0 && (
          <div className="border-t border-slate-700/40 px-4 py-2.5">
            <p className="text-xs font-semibold text-orange-400">
              {sectionData.name} section is behind schedule by {sectionData.delayMinutes} minutes.
            </p>
          </div>
        )}
      </div>

      {/* View timeline link */}
      <Link
        href={`/flights/${id}/timeline`}
        className="flex items-center gap-1.5 w-fit rounded border border-slate-600/40 bg-slate-800/40 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
      >
        View Section Timeline
      </Link>

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
