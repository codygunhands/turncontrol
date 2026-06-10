import { TurnControlLogo } from "@/components/TurnControlLogo";

export function MobileHeader() {
  return (
    <header
      className="md:hidden flex items-center justify-between px-4 py-3 shrink-0 no-print"
      style={{
        background: "#061018",
        borderBottom: "1px solid rgba(143, 161, 183, 0.1)",
      }}
    >
      <TurnControlLogo size="sm" />
      <div className="flex items-center gap-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "#22C55E" }}
        />
        <span className="font-mono text-[10px]" style={{ color: "#687289" }}>
          BKK · UTC+7
        </span>
      </div>
    </header>
  );
}
