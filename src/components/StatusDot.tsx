import { getStatusHex } from "@/lib/utils";
import type { FlightStatus, TaskStatus } from "@/lib/types";

interface StatusDotProps {
  status: FlightStatus | TaskStatus | string;
  size?: number;
  pulse?: boolean;
  className?: string;
}

export function StatusDot({ status, size = 8, pulse = false, className = "" }: StatusDotProps) {
  const color = getStatusHex(status);
  const active = status === "in_progress" || status === "delayed" || status === "critical";

  return (
    <span className={`relative inline-flex ${className}`} style={{ width: size, height: size }}>
      {(pulse && active) && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-50"
          style={{ backgroundColor: color }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 8 8"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="4" cy="4" r="3.5" fill={color} />
      </svg>
    </span>
  );
}

interface StatusIconProps {
  status: FlightStatus | TaskStatus | string;
  size?: number;
  className?: string;
}

export function StatusIcon({ status, size = 16, className = "" }: StatusIconProps) {
  const color = getStatusHex(status);

  const iconPath: Record<string, string> = {
    on_time:     "M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L6.64 12.8l4.186 4.186 7.43-7.43-1.42-1.42-6.013 6.004z",
    at_risk:     "M12 2L1 21h22L12 2zm0 3.516L21.016 19H2.984L12 5.516zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z",
    delayed:     "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9H13V7h-2v6h4.5l-2 2z",
    critical:    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
    in_progress: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    completed:   "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.41-1.41L10 13.67l7.18-7.18 1.41 1.41L10 16.5z",
    not_started: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z",
    blocked:     "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4-11H8v2h8v-2z",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      aria-hidden="true"
    >
      <path d={iconPath[status] ?? iconPath.not_started} />
    </svg>
  );
}
