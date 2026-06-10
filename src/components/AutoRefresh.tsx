"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const INTERVAL = 30;

export function AutoRefresh() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(INTERVAL);
  const ref = useRef(INTERVAL);

  useEffect(() => {
    ref.current = INTERVAL;
    setCountdown(INTERVAL);

    const tick = setInterval(() => {
      ref.current -= 1;
      setCountdown(ref.current);
      if (ref.current <= 0) {
        ref.current = INTERVAL;
        setCountdown(INTERVAL);
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [router]);

  return (
    <button
      onClick={() => { ref.current = INTERVAL; setCountdown(INTERVAL); router.refresh(); }}
      className="flex items-center gap-1.5 rounded border border-slate-700/50 bg-slate-800/40 px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
    >
      <RefreshCw className="h-2.5 w-2.5" />
      Auto refresh in {countdown}s
    </button>
  );
}
