import type { Category } from "../lib/categories";

// ────────────────────────────────────────────────────────────
// Logo
// ────────────────────────────────────────────────────────────
export function Logo({ size = 22, tone = "ink" }: { size?: number; tone?: "ink" | "paper" }) {
  const color = tone === "paper" ? "#F5F1EA" : "#14181F";
  return (
    <div className="flex items-center gap-2" style={{ color }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.4" />
        <path d="M12 4 V20 M4 12 H20" stroke={color} strokeWidth="1.4" />
        <circle cx="12" cy="12" r="2.2" fill={color} />
      </svg>
      <span className="font-serif tracking-tight" style={{ fontSize: size * 0.95, fontWeight: 500, letterSpacing: "-0.01em" }}>
        Olivier
      </span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Pill — kleine status-label
// ────────────────────────────────────────────────────────────
type PillTone = "default" | "pos" | "neg" | "accent" | "dark";
export function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: PillTone }) {
  const map: Record<PillTone, string> = {
    default: "text-[color:var(--muted)] bg-white hair border",
    pos:     "text-[oklch(40%_0.10_152)] bg-[var(--pos-soft)] border-transparent",
    neg:     "text-[oklch(40%_0.13_28)] bg-[var(--neg-soft)] border-transparent",
    accent:  "text-[oklch(40%_0.07_232)] bg-[var(--accent-soft)] border-transparent",
    dark:    "text-paper bg-[var(--deep)] border-transparent",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-[3px] text-[11px] tabular rounded-full border ${map[tone]}`}>
      {children}
    </span>
  );
}

// ────────────────────────────────────────────────────────────
// Button
// ────────────────────────────────────────────────────────────
type BtnKind = "primary" | "ghost" | "outline" | "accent";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: BtnKind;
  size?: BtnSize;
  icon?: React.ReactNode;
  full?: boolean;
}

export function Btn({ children, kind = "primary", size = "md", icon, full, className = "", ...rest }: BtnProps) {
  const sizes: Record<BtnSize, string> = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-10 px-4 text-[14px]",
    lg: "h-12 px-5 text-[15px]",
  };
  const kinds: Record<BtnKind, string> = {
    primary: "bg-[var(--deep)] text-[var(--paper)] hover:bg-black",
    ghost:   "bg-transparent text-[var(--ink)] hover:bg-[var(--paper-soft)]",
    outline: "bg-white text-[var(--ink)] border hair hover:bg-[var(--paper-soft)]",
    accent:  "bg-[oklch(46%_0.07_232)] text-white hover:brightness-110",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.005em] ${sizes[size]} ${kinds[kind]} ${full ? "w-full" : ""} ${className}`}
    >
      {children}
      {icon ? <span className="opacity-80">{icon}</span> : null}
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// CategoryDot
// ────────────────────────────────────────────────────────────
export function CategoryDot({ cat }: { cat: Category }) {
  return <span className={`dot dot-${cat}`} />;
}
