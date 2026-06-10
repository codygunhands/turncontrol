import { Radio } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="md:hidden flex items-center gap-3 border-b border-slate-700/50 bg-slate-950/90 px-4 py-3 shrink-0 no-print">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-600/20 ring-1 ring-sky-500/40">
        <Radio className="h-3.5 w-3.5 text-sky-400" />
      </div>
      <div>
        <p className="text-sm font-bold tracking-wide text-slate-100 leading-tight">TurnControl</p>
        <p className="text-[10px] text-slate-500 leading-tight font-mono">BKK / VTBS · UTC+7</p>
      </div>
    </header>
  );
}
