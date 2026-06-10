import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { getReportById, getFlightById } from "@/lib/data";
import { formatDateTime, formatTime, getSectionName } from "@/lib/utils";
import { PrintButton } from "@/components/PrintButton";
import type { SectionType } from "@/lib/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ReportPage({ params }: Props) {
  const { id } = await params;
  const report = getReportById(id);
  const flight = getFlightById(id);

  if (!report) notFound();

  const onTime = report.departureDelay === 0;
  const totalDelayMin = (report.primaryDelayMinutes ?? 0) + (report.secondaryDelayMinutes ?? 0) + (report.otherDelayMinutes ?? 0);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 print-page">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <Link
          href={flight ? `/flights/${id}` : "/reports"}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Live Overview
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded border border-slate-700/40 bg-slate-800/30 px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-not-allowed">
            <Download className="h-3.5 w-3.5" /> Export PDF
          </button>
          <button className="flex items-center gap-1.5 rounded border border-slate-700/40 bg-slate-800/30 px-3 py-1.5 text-xs font-semibold text-slate-600 cursor-not-allowed">
            <Download className="h-3.5 w-3.5" /> Export Excel
          </button>
          <PrintButton />
        </div>
      </div>

      {/* Report container */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 overflow-hidden">

        {/* ── Report header ── */}
        <div className="border-b border-slate-700/40 bg-slate-900/80 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="tc-label mb-1">Turnaround Summary Report</p>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-mono text-2xl font-bold text-slate-100">{report.flightNumber}</h1>
                <span className="font-mono text-sm text-slate-400">{report.route}</span>
                <span className="text-slate-600">·</span>
                <span className="font-mono text-xs text-slate-500">{report.aircraftType} / {report.registration}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{report.airline} · Gate {report.gate} · Bangkok BKK</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className={`inline-flex items-center rounded border px-3 py-1 text-sm font-bold ${
                  onTime
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-orange-500/10 text-orange-400 border-orange-500/30"
                }`}>
                  {onTime ? "COMPLETED — On Time" : `COMPLETED — Delay +${report.departureDelay} min`}
                </span>
                {!onTime && (
                  <p className="mt-1 font-mono text-xs text-orange-400">
                    ATD: {formatTime(report.blockOffTime)} · Delay: {report.departureDelay} min
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Three-column main body ── */}
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700/40">

          {/* Column 1: Turnaround Times */}
          <div className="px-5 py-5">
            <h2 className="tc-label mb-4">Turnaround Times</h2>
            <div className="flex flex-col gap-3">
              <TRow label="ATA (Actual Block-on)"      value={formatTime(report.blockOnTime)} mono />
              <TRow label="ATD / Block-off (Actual)"   value={formatTime(report.blockOffTime)} mono />
              <TRow label="Actual Ground Stay"         value={`${Math.floor(report.totalGroundStay / 60)}h ${report.totalGroundStay % 60}m`} mono />
              <TRow label="Scheduled Ground Stay"      value={`${Math.floor(report.scheduledGroundStay / 60)}h ${report.scheduledGroundStay % 60}m`} mono />
              <div className="border-t border-slate-700/30 pt-3">
                <TRow
                  label="Departure Delay"
                  value={report.departureDelay > 0 ? `+${report.departureDelay} min` : "0 min (On Time)"}
                  mono
                  highlight={report.departureDelay > 0}
                  good={report.departureDelay === 0}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Delay Analysis */}
          <div className="px-5 py-5">
            <h2 className="tc-label mb-4">Delay Analysis</h2>
            {report.departureDelay === 0 ? (
              <p className="text-sm text-emerald-400">No departure delay. All critical path milestones met on schedule.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {report.primaryDelayCause && (
                  <div className="rounded border border-slate-700/40 bg-slate-800/40 px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Primary Cause</p>
                      <span className="font-mono text-sm font-bold text-orange-400">
                        +{report.primaryDelayMinutes ?? 0} min
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{report.primaryDelayCause}</p>
                  </div>
                )}
                {report.secondaryDelayCause && (
                  <div className="rounded border border-slate-700/40 bg-slate-800/40 px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Secondary Cause</p>
                      <span className="font-mono text-sm font-bold text-amber-400">
                        +{report.secondaryDelayMinutes ?? 0} min
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{report.secondaryDelayCause}</p>
                  </div>
                )}
                {report.otherDelayMinutes !== undefined && report.otherDelayMinutes !== 0 && (
                  <div className="flex items-center justify-between px-3 py-1">
                    <p className="text-xs text-slate-500">Other Minor Delays</p>
                    <span className={`font-mono text-sm font-bold ${report.otherDelayMinutes < 0 ? "text-emerald-400" : "text-slate-400"}`}>
                      {report.otherDelayMinutes > 0 ? "+" : ""}{report.otherDelayMinutes} min
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-slate-700/40 px-3 pt-2">
                  <p className="text-xs font-semibold text-slate-400">Total Delay</p>
                  <span className="font-mono text-base font-bold text-red-400">
                    +{report.departureDelay} min
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Responsibility Attribution */}
          <div className="px-5 py-5">
            <h2 className="tc-label mb-4">Responsibility Attribution</h2>
            {report.departureDelay === 0 ? (
              <p className="text-sm text-slate-500">N/A — no delay to attribute.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {[
                  { label: "Ground Handler",         pct: report.responsibility.groundHandler },
                  { label: "Catering (L/SO)",        pct: report.responsibility.catering },
                  { label: "Fuel Provider (S/P)",    pct: report.responsibility.fuelProvider },
                  { label: "Other / Uncontrollable", pct: report.responsibility.other },
                ].map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className={`font-mono text-sm font-bold ${pct > 0 ? "text-slate-200" : "text-slate-600"}`}>
                        {pct}%
                      </p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${pct > 30 ? "bg-orange-500" : "bg-slate-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Section Performance ── */}
        <div className="border-t border-slate-700/40 px-6 py-5">
          <h2 className="tc-label mb-4">Section Performance</h2>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-700/40">
                  <th className="tc-table-header pb-2 text-left">Section</th>
                  <th className="tc-table-header pb-2 text-right">Planned</th>
                  <th className="tc-table-header pb-2 text-right">Actual</th>
                  <th className="tc-table-header pb-2 text-right">Variance</th>
                  <th className="tc-table-header pb-2 text-right">Tasks</th>
                  <th className="tc-table-header pb-2 text-left pl-4">Completion</th>
                </tr>
              </thead>
              <tbody>
                {report.sections.map((sec) => {
                  const pct = Math.round((sec.completedTasks / sec.totalTasks) * 100);
                  return (
                    <tr key={sec.section} className="border-b border-slate-700/20">
                      <td className="py-2.5 text-slate-300">{getSectionName(sec.section as SectionType)}</td>
                      <td className="py-2.5 text-right font-mono text-xs text-slate-400">{sec.plannedDuration}m</td>
                      <td className="py-2.5 text-right font-mono text-xs text-slate-400">{sec.actualDuration}m</td>
                      <td className={`py-2.5 text-right font-mono text-xs font-bold ${
                        sec.variance > 0 ? "text-orange-400" : sec.variance < 0 ? "text-emerald-400" : "text-slate-500"
                      }`}>
                        {sec.variance === 0 ? "—" : `${sec.variance > 0 ? "+" : ""}${sec.variance}m`}
                      </td>
                      <td className="py-2.5 text-right font-mono text-xs text-slate-400">
                        {sec.completedTasks}/{sec.totalTasks}
                      </td>
                      <td className="py-2.5 pl-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className={`h-full rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-sky-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs text-slate-400">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Bottom three columns: Service Summary + Notes + Report Info ── */}
        <div className="grid grid-cols-1 gap-0 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700/40 border-t border-slate-700/40">

          {/* Service Summary */}
          <div className="px-5 py-5">
            <h2 className="tc-label mb-4">Service Summary</h2>
            <div className="flex flex-col gap-2.5">
              <StatRow label="Total Tasks"        value={report.totalTasks.toString()} />
              <StatRow label="Completed On Time"  value={report.completedOnTime.toString()} valueClass="text-emerald-400" />
              <StatRow label="Completed Late"     value={report.completedLate.toString()} valueClass={report.completedLate > 0 ? "text-amber-400" : "text-slate-400"} />
              <StatRow label="Not Started"        value={report.notStarted.toString()} valueClass={report.notStarted > 0 ? "text-slate-500" : "text-slate-600"} />
              <div className="border-t border-slate-700/30 pt-2">
                <StatRow
                  label="Average Delay"
                  value={`${report.averageDelayMinutes.toFixed(1)} min`}
                  valueClass={report.averageDelayMinutes > 2 ? "text-orange-400" : "text-slate-400"}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="px-5 py-5">
            <h2 className="tc-label mb-4">Notes</h2>
            {report.operationalNotes.length === 0 ? (
              <p className="text-sm text-slate-500">No operational notes recorded.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {report.operationalNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                    <p className="text-xs text-slate-400 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Info */}
          <div className="px-5 py-5">
            <h2 className="tc-label mb-4">Report Info</h2>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[10px] text-slate-600">Report Generated</p>
                <p className="font-mono text-xs text-slate-300 mt-0.5">{formatDateTime(report.generatedAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600">Generated By</p>
                <p className="text-xs text-slate-400 mt-0.5">{report.generatedBy}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600">Station</p>
                <p className="font-mono text-xs text-slate-400 mt-0.5">Bangkok BKK / VTBS</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-600">Gate / Stand</p>
                <p className="font-mono text-xs text-slate-400 mt-0.5">{report.gate}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TRow({
  label,
  value,
  mono,
  highlight,
  good,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-slate-500 shrink-0">{label}</p>
      <p className={`text-sm font-semibold text-right ${mono ? "font-mono" : ""} ${
        good ? "text-emerald-400" : highlight ? "text-orange-400" : "text-slate-300"
      }`}>
        {value}
      </p>
    </div>
  );
}

function StatRow({
  label,
  value,
  valueClass = "text-slate-300",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700/20 pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`font-mono text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
