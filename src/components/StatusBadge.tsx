import { cn, getFlightStatusBg, getTaskStatusBg, getStatusLabel } from "@/lib/utils";
import type { FlightStatus, TaskStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: FlightStatus | TaskStatus;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const isTaskStatus = ["not_started", "in_progress", "blocked"].includes(status);
  const colorClass = isTaskStatus
    ? getTaskStatusBg(status as TaskStatus)
    : getFlightStatusBg(status as FlightStatus);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border font-semibold tracking-wide",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        colorClass,
        className,
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
