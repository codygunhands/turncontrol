"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, MessageSquarePlus, Paperclip } from "lucide-react";
import { getFlightById, getTaskById } from "@/lib/data";
import {
  formatTime,
  getSectionName,
  getTaskStatusBg,
  getStatusLabel,
} from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import type { TaskStatus, FlightStatus } from "@/lib/types";

export default function TaskDetailPage() {
  const params = useParams<{ id: string; taskId: string }>();
  const { id, taskId } = params;

  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [noteInput, setNoteInput] = useState("");
  const [noteVisible, setNoteVisible] = useState(false);

  const flight = getFlightById(id);
  const task = getTaskById(taskId);

  useEffect(() => {
    if (task) setTaskStatus(task.status);
  }, [task]);

  if (!flight || !task) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Task not found.{" "}
        <Link href={`/flights/${id}`} className="ml-2 text-sky-400 hover:underline">
          Back to flight
        </Link>
      </div>
    );
  }

  const currentStatus = taskStatus ?? task.status;

  // Task X of Y
  const sectionTasks = flight.sections.find((s) => s.type === task.section)?.tasks ?? [];
  const taskIndex = sectionTasks.findIndex((t) => t.id === taskId);
  const taskPosition = taskIndex >= 0 ? `Task ${taskIndex + 1} of ${sectionTasks.length}` : "";

  function handleMarkStarted() {
    setTaskStatus("in_progress");
  }

  function handleMarkComplete() {
    setTaskStatus("completed");
  }

  function handleAddNote() {
    if (!noteInput.trim()) return;
    setNotes((prev) => [
      `${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" })} — ${noteInput.trim()}`,
      ...prev,
    ]);
    setNoteInput("");
    setNoteVisible(false);
  }

  const depTasks = task.dependencies
    ?.map((depId) => {
      const all = flight.sections.flatMap((s) => s.tasks);
      return all.find((t) => t.id === depId);
    })
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 flex-wrap">
        <Link href="/" className="hover:text-slate-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href={`/flights/${id}`} className="hover:text-slate-300 transition-colors">
          {flight.flightNumber}
        </Link>
        <span>/</span>
        <Link
          href={`/flights/${id}/sections/${task.section}`}
          className="hover:text-slate-300 transition-colors"
        >
          {getSectionName(task.section)}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{task.name}</span>
      </div>

      {/* Task header */}
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-100">{task.name}</h1>
              {taskPosition && (
                <span className="rounded border border-slate-700/50 bg-slate-800/50 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  {taskPosition}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Section: <span className="text-slate-400">{getSectionName(task.section)}</span>
              {" · "}
              Flight:{" "}
              <Link href={`/flights/${id}`} className="font-mono font-bold text-sky-400 hover:text-sky-300">
                {flight.flightNumber}
              </Link>
              {" · "}
              {flight.origin}–{flight.destination}
            </p>
          </div>
          <StatusBadge status={currentStatus} />
        </div>

        {/* Timing grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 border-t border-slate-700/40 pt-4">
          <TimingField label="Planned Start" value={formatTime(task.plannedStart)} />
          <TimingField label="Planned End" value={formatTime(task.plannedEnd)} />
          <TimingField
            label="Actual Start"
            value={task.actualStart ? formatTime(task.actualStart) : "—"}
            highlight={!!task.actualStart}
          />
          <TimingField
            label="Actual End"
            value={task.actualEnd ? formatTime(task.actualEnd) : "—"}
            highlight={!!task.actualEnd}
          />
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-slate-700/40 pt-4">
          <div>
            <p className="tc-label">Responsible</p>
            <p className="mt-1 text-sm text-slate-300">{task.responsible}</p>
          </div>
          {task.teamVehicle && (
            <div>
              <p className="tc-label">Team / Vehicle</p>
              <p className="mt-1 text-sm font-mono text-slate-300">{task.teamVehicle}</p>
            </div>
          )}
          <div>
            <p className="tc-label">Delay</p>
            <p className={`mt-1 text-sm font-mono font-bold ${task.delayMinutes > 0 ? "text-orange-400" : "text-slate-500"}`}>
              {task.delayMinutes > 0 ? `+${task.delayMinutes} min` : "No delay"}
            </p>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div className="mt-4 border-t border-slate-700/40 pt-4">
            <p className="tc-label">Description</p>
            <p className="mt-1 text-sm text-slate-400 leading-relaxed">{task.description}</p>
          </div>
        )}

        {/* Notes */}
        {task.notes && (
          <div className="mt-4 border-t border-slate-700/40 pt-4">
            <p className="tc-label">Notes</p>
            <p className="mt-1 text-sm text-amber-400/90 leading-relaxed">{task.notes}</p>
          </div>
        )}

        {/* Dependencies */}
        {depTasks && depTasks.length > 0 && (
          <div className="mt-4 border-t border-slate-700/40 pt-4">
            <p className="tc-label mb-2">Dependencies</p>
            <div className="flex flex-col gap-1.5">
              {depTasks.map((dep) => (
                <div
                  key={dep!.id}
                  className="flex items-center justify-between rounded border border-slate-700/40 bg-slate-800/50 px-3 py-2"
                >
                  <span className="text-xs text-slate-300">{dep!.name}</span>
                  <StatusBadge status={dep!.status as TaskStatus} size="sm" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attachment placeholder */}
        <div className="mt-4 border-t border-slate-700/40 pt-4">
          <p className="tc-label mb-2">Attachments</p>
          <div className="flex items-center gap-2 rounded border border-dashed border-slate-700/60 px-3 py-3 text-xs text-slate-600">
            <Paperclip className="h-3.5 w-3.5" />
            <span>No attachments — drop files here or click to attach</span>
          </div>
        </div>
      </div>

      {/* User-added notes */}
      {notes.length > 0 && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
          <p className="tc-label mb-3">Operational Notes</p>
          <div className="flex flex-col gap-2">
            {notes.map((note, i) => (
              <div key={i} className="rounded border border-slate-700/40 bg-slate-800/50 px-3 py-2 text-xs text-slate-300">
                {note}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add note form */}
      {noteVisible && (
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-4">
          <p className="tc-label mb-2">Add Note</p>
          <textarea
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            placeholder="Enter operational note..."
            className="w-full rounded border border-slate-700/50 bg-slate-800/60 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-sky-500/50 focus:outline-none resize-none"
            rows={3}
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleAddNote}
              className="rounded border border-sky-500/40 bg-sky-600/10 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-600/20 transition-colors"
            >
              Save Note
            </button>
            <button
              onClick={() => { setNoteVisible(false); setNoteInput(""); }}
              className="rounded border border-slate-600/40 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {currentStatus === "not_started" && (
          <button
            onClick={handleMarkStarted}
            className="flex items-center gap-2 rounded border border-sky-500/40 bg-sky-600/10 px-4 py-2 text-sm font-semibold text-sky-400 hover:bg-sky-600/20 transition-colors"
          >
            <Clock className="h-4 w-4" /> Mark Started
          </button>
        )}
        {(currentStatus === "in_progress" || currentStatus === "delayed") && (
          <button
            onClick={handleMarkComplete}
            className="flex items-center gap-2 rounded border border-emerald-500/40 bg-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-600/20 transition-colors"
          >
            <CheckCircle2 className="h-4 w-4" /> Mark Complete
          </button>
        )}
        <button
          onClick={() => setNoteVisible(true)}
          className="flex items-center gap-2 rounded border border-slate-600/40 bg-slate-800/40 px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 transition-colors"
        >
          <MessageSquarePlus className="h-4 w-4" /> Add Note
        </button>
      </div>

      {/* Back */}
      <Link
        href={`/flights/${id}/sections/${task.section}`}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors w-fit"
      >
        <ArrowLeft className="h-3 w-3" /> Back to {getSectionName(task.section)}
      </Link>
    </div>
  );
}

function TimingField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="tc-label">{label}</p>
      <p className={`mt-0.5 font-mono text-sm ${highlight ? "text-slate-200" : "text-slate-500"}`}>
        {value}
      </p>
    </div>
  );
}
