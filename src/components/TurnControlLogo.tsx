interface TMarkProps {
  size?: number;
  className?: string;
}

export function TMark({ size = 32, className = "" }: TMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* T crossbar */}
      <rect x="1" y="4" width="20" height="7" rx="1" fill="white" />
      {/* Blue forward-accent slash 1 */}
      <path d="M19 4 L25 4 L21.5 11 L15.5 11 Z" fill="#207CFF" />
      {/* Blue forward-accent slash 2 (lighter) */}
      <path d="M24 4 L30 4 L26.5 11 L20.5 11 Z" fill="#207CFF" fillOpacity="0.55" />
      {/* T stem */}
      <rect x="7" y="11" width="8" height="18" rx="1" fill="white" />
    </svg>
  );
}

interface LogoProps {
  variant?: "horizontal" | "mark-only";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { mark: 22, text: "text-base", sub: "text-[8px]" },
  md: { mark: 28, text: "text-lg", sub: "text-[9px]" },
  lg: { mark: 40, text: "text-2xl", sub: "text-xs" },
};

export function TurnControlLogo({
  variant = "horizontal",
  size = "md",
  className = "",
}: LogoProps) {
  const s = sizeMap[size];

  if (variant === "mark-only") {
    return <TMark size={s.mark} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <TMark size={s.mark} />
      <div className="flex flex-col leading-none">
        <span
          className={`${s.text} font-semibold tracking-tight text-white`}
          style={{ fontFamily: "var(--font-inter), system-ui, sans-serif", letterSpacing: "-0.01em" }}
        >
          Turn<span style={{ color: "#207CFF" }}>Control</span>
        </span>
        {size !== "sm" && (
          <span
            className={`${s.sub} font-medium uppercase tracking-[0.12em] mt-0.5`}
            style={{ color: "#687289", fontFamily: "var(--font-inter), system-ui, sans-serif" }}
          >
            Airline Ground Stay Control
          </span>
        )}
      </div>
    </div>
  );
}
