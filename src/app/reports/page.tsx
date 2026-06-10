import Link from "next/link";
import { FileText } from "lucide-react";
import { getReports, getFlightById } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default function ReportsPage() {
  const reports = getReports();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Ground Stay Reports</h1>
        <p className="text-sm text-slate-500">Final turnaround reports for completed flights</p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-700/40 py-16 text-center">
          <FileText className="h-8 w-8 text-slate-700" />
          <p className="text-sm text-slate-500">No completed flights with reports yet.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const flight = getFlightById(report.flightId);
            return (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="group rounded-lg border border-slate-700/50 bg-slate-900/60 p-4 hover:border-slate-600/70 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="font-mono font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                      {report.flightNumber}
                    </span>
                  </div>
                  <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                    report.departureDelay === 0
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-orange-500/30 bg-orange-500/10 text-orange-400"
                  }`}>
                    {report.departureDelay === 0 ? "On Time" : `+${report.departureDelay}m Delay`}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-400">{report.route}</p>
                <p className="text-xs text-slate-500 mt-0.5">{report.airline} · {report.aircraftType}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-700/30 pt-3">
                  <div>
                    <p className="text-[10px] text-slate-600">Block-On</p>
                    <p className="font-mono text-slate-400">{formatDateTime(report.blockOnTime)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600">Block-Off</p>
                    <p className="font-mono text-slate-400">{formatDateTime(report.blockOffTime)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600">Ground Stay</p>
                    <p className="font-mono text-slate-400">{report.totalGroundStay}m</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-600">Variance</p>
                    <p className={`font-mono font-bold ${report.variance > 5 ? "text-orange-400" : report.variance < 0 ? "text-emerald-400" : "text-slate-400"}`}>
                      {report.variance >= 0 ? "+" : ""}{report.variance}m
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
