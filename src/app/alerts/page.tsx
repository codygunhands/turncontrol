import Link from "next/link";
import { AlertTriangle, CheckCircle, Clock, Info } from "lucide-react";
import { getAlerts } from "@/lib/data";
import { formatTime, getAlertSeverityBg, getSectionName } from "@/lib/utils";
import type { SectionType } from "@/lib/types";

const SUGGESTED_ACTIONS = [
  "Contact fuel provider supervisor immediately for ETA update.",
  "Assign additional cleaning team from standby roster.",
  "Issue gate announcement and begin pre-boarding for priority pax.",
  "Escalate to ramp supervisor for pushback coordination.",
  "Confirm boarding readiness with gate agent and ops control.",
  "Update Ops Control via ACARS with revised ETD.",
  "Contact cargo supervisor for loader crew reallocation.",
];

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  return <Info className="h-4 w-4 text-sky-400 shrink-0" />;
}

export default function AlertsPage() {
  const alerts = getAlerts();
  const critical = alerts.filter((a) => a.severity === "critical");
  const warnings = alerts.filter((a) => a.severity === "warning");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Operational Alerts</h1>
          <p className="text-sm text-slate-500">
            Live alert feed — Bangkok BKK · All active flights
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
            {critical.length} Critical
          </span>
          <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400">
            {warnings.length} Warning
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Alert list */}
        <div className="flex-1 flex flex-col gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${getAlertSeverityBg(alert.severity)}`}
            >
              {/* Alert header */}
              <div className="flex items-start gap-3">
                <SeverityIcon severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wide ${
                      alert.severity === "critical" ? "text-red-400" : alert.severity === "warning" ? "text-amber-400" : "text-sky-400"
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <Link
                      href={`/flights/${alert.flightId}`}
                      className="font-mono text-sm font-bold text-slate-200 hover:text-sky-300 transition-colors"
                    >
                      {alert.flightNumber}
                    </Link>
                    <span className="text-xs text-slate-500">
                      {getSectionName(alert.section as SectionType)}
                    </span>
                    {alert.task && (
                      <>
                        <span className="text-slate-700">·</span>
                        <span className="text-xs text-slate-500">{alert.task}</span>
                      </>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-slate-500">
                      <Clock className="inline h-3 w-3 mr-0.5" />
                      {formatTime(alert.time)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>

                  {/* Suggested action */}
                  <div className="mt-3 rounded border border-slate-700/40 bg-slate-900/50 px-3 py-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-1">
                      Suggested Action
                    </p>
                    <p className="text-xs text-slate-400">{alert.suggestedAction}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-2 flex gap-2">
                    <Link
                      href={`/flights/${alert.flightId}`}
                      className="rounded border border-slate-600/40 px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
                    >
                      View Flight
                    </Link>
                    {alert.task && (
                      <Link
                        href={`/flights/${alert.flightId}/sections/${alert.section}`}
                        className="rounded border border-slate-600/40 px-2.5 py-1 text-[11px] font-semibold text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
                      >
                        View Section
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggested actions panel */}
        <div className="xl:w-72 shrink-0">
          <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
            <h2 className="text-sm font-bold text-slate-200 mb-1">Station-Wide Actions</h2>
            <p className="text-[10px] text-slate-500 mb-3">
              Recommended immediate actions for current alert status
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTED_ACTIONS.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500/60" />
                  <p className="text-xs text-slate-400 leading-relaxed">{action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
            <h2 className="text-sm font-bold text-slate-200 mb-3">Alert Summary</h2>
            <div className="flex flex-col gap-2">
              <StatRow label="Active Alerts" value={alerts.length.toString()} />
              <StatRow label="Critical" value={critical.length.toString()} valueClass="text-red-400" />
              <StatRow label="Warning" value={warnings.length.toString()} valueClass="text-amber-400" />
              <StatRow label="Flights Affected" value={new Set(alerts.map((a) => a.flightId)).size.toString()} />
              <StatRow label="Sections Affected" value={new Set(alerts.map((a) => a.section)).size.toString()} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, valueClass = "text-slate-300" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-slate-700/30 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`font-mono text-sm font-bold ${valueClass}`}>{value}</span>
    </div>
  );
}
