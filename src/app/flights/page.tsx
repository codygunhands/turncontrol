import Link from "next/link";
import { ChevronRight, Plane } from "lucide-react";
import { getFlights } from "@/lib/data";
import { formatTime, getFlightStatusBg, getStatusLabel, getGroundStayMinutes, formatMinutes } from "@/lib/utils";
import type { FlightStatus } from "@/lib/types";

export default function FlightsPage() {
  const flights = getFlights();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">Flights</h1>
        <p className="text-sm text-slate-500">All tracked aircraft for this operating period</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {flights.map((flight) => {
          const groundStay = flight.ata ? getGroundStayMinutes(flight.ata, flight.atd) : null;
          const isCompleted = flight.status === "completed";
          const totalTasks = flight.sections.reduce((acc, s) => acc + s.tasks.length, 0);
          const doneTasks = flight.sections.reduce(
            (acc, s) => acc + s.tasks.filter((t) => t.status === "completed").length, 0,
          );
          const pct = Math.round((doneTasks / totalTasks) * 100);

          return (
            <Link
              key={flight.id}
              href={`/flights/${flight.id}`}
              className="group rounded-lg border border-slate-700/50 bg-slate-900/60 p-4 hover:border-slate-600/70 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-slate-500" />
                  <span className="font-mono font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                    {flight.flightNumber}
                  </span>
                  <span className="text-xs text-slate-500">{flight.airline}</span>
                </div>
                <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getFlightStatusBg(flight.status as FlightStatus)}`}>
                  {getStatusLabel(flight.status)}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-slate-300">{flight.origin}</span>
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span className="font-mono text-sm font-bold text-slate-300">{flight.destination}</span>
                <span className="ml-auto text-xs text-slate-500">{flight.aircraftType}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-[10px] text-slate-600">ATA</p>
                  <p className="font-mono text-slate-400">{flight.ata ? formatTime(flight.ata) : "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">{isCompleted ? "ATD" : "STD"}</p>
                  <p className="font-mono text-slate-400">{formatTime(isCompleted && flight.atd ? flight.atd : flight.std)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-600">Ground</p>
                  <p className="font-mono text-slate-400">{groundStay !== null ? formatMinutes(groundStay) : "—"}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-slate-600 mb-1">
                  <span>Turnaround Progress</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCompleted ? "bg-slate-600" : pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-sky-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Gate {flight.gate} · {flight.registration}</span>
                {flight.currentBlocker && (
                  <span className="text-[10px] text-amber-400 truncate max-w-[160px]">{flight.currentBlocker}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
