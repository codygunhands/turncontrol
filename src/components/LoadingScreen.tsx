"use client";

import { useEffect, useState } from "react";
import { TMark } from "@/components/TurnControlLogo";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading operational data..." }: LoadingScreenProps) {
  const [dots, setDots] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotTimer = setInterval(() => setDots((d) => (d + 1) % 4), 500);
    const progTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) { clearInterval(progTimer); return p; }
        return p + Math.random() * 8;
      });
    }, 200);
    return () => { clearInterval(dotTimer); clearInterval(progTimer); };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#081320" }}
    >
      {/* Radar ring */}
      <div className="relative flex items-center justify-center mb-10">
        {/* Outer pulse rings */}
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className="absolute rounded-full border opacity-0"
            style={{
              width: 48 + i * 36,
              height: 48 + i * 36,
              borderColor: "rgba(32, 124, 255, 0.15)",
              animation: `ping ${1.6 + i * 0.5}s cubic-bezier(0, 0, 0.2, 1) infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        {/* Center mark */}
        <div
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{
            background: "rgba(32, 124, 255, 0.12)",
            border: "1px solid rgba(32, 124, 255, 0.3)",
          }}
        >
          <TMark size={32} />
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col items-center gap-1 mb-8">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{
            color: "#e8edf2",
            fontFamily: "var(--font-inter), system-ui, sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          Turn<span style={{ color: "#207CFF" }}>Control</span>
        </h1>
        <p
          className="text-[10px] font-medium uppercase tracking-[0.15em]"
          style={{ color: "#687289" }}
        >
          Airline Ground Stay Control
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 mb-3">
        <div
          className="h-0.5 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(143, 161, 183, 0.08)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.min(progress, 100)}%`,
              background: "linear-gradient(90deg, #207CFF 0%, #5ba4ff 100%)",
            }}
          />
        </div>
      </div>

      {/* Status line */}
      <p
        className="text-[11px] font-mono"
        style={{ color: "#687289" }}
      >
        {message}{"...".slice(0, dots)}
      </p>

      {/* Flight path lines (decorative) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.04 }}
        aria-hidden="true"
      >
        <line x1="0%" y1="35%" x2="100%" y2="60%" stroke="#207CFF" strokeWidth="1" strokeDasharray="6 8" />
        <line x1="0%" y1="65%" x2="100%" y2="40%" stroke="#207CFF" strokeWidth="1" strokeDasharray="6 8" />
        <line x1="20%" y1="0%" x2="70%" y2="100%" stroke="#207CFF" strokeWidth="1" strokeDasharray="6 8" />
      </svg>
    </div>
  );
}

export function InlineLoader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="h-4 rounded animate-pulse"
            style={{
              width: `${40 + Math.random() * 40}%`,
              background: "rgba(143, 161, 183, 0.08)",
            }}
          />
          <div
            className="h-4 rounded animate-pulse ml-auto"
            style={{
              width: "60px",
              background: "rgba(143, 161, 183, 0.06)",
              animationDelay: `${i * 100}ms`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
