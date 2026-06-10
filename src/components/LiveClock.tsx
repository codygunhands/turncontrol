"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    function update() {
      setTime(
        new Date().toLocaleString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Bangkok",
          timeZoneName: "short",
        }),
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <span className="font-mono text-xs text-slate-400">{time}</span>
  );
}
