"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 rounded border border-sky-600/40 bg-sky-600/10 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-sky-600/20 transition-colors"
    >
      <Printer className="h-3.5 w-3.5" /> Print
    </button>
  );
}
