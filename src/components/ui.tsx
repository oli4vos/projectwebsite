import Link from "next/link";
import type { Category } from "@/lib/categories";

export function Logo({
  size = 22,
  tone = "ink",
  name = "Grip",
}: {
  size?: number;
  tone?: "ink" | "paper";
  name?: string;
}) {
  const color = tone === "paper" ? "var(--paper)" : "var(--ink)";

  return (
    <div className="flex items-center gap-2.5" style={{ color }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3" fill={color} />
      </svg>
      <span
        className="font-serif tracking-tight"
        style={{ fontSize: size * 0.92, letterSpacing: "-0.01em", fontWeight: 650 }}
      >
        {name}
      </span>
    </div>
  );
}

type PillTone = "default" | "pos" | "neg" | "accent" | "dark" | "warn";

export function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: PillTone;
}) {
  const map: Record<PillTone, string> = {
    default: "border hair bg-[rgba(255,255,255,0.72)] text-[var(--muted)]",
    pos: "border-transparent bg-[var(--pos-soft)] text-[oklch(38%_0.09_155)]",
    neg: "border-transparent bg-[var(--neg-soft)] text-[oklch(38%_0.12_30)]",
    accent: "border-transparent bg-[var(--accent-soft)] text-[oklch(38%_0.09_245)]",
    dark: "border-transparent bg-[var(--deep)] text-white",
    warn: "border-transparent bg-[var(--warn-soft)] text-[oklch(40%_0.1_80)]",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-medium ${map[tone]}`}>
      {children}
    </span>
  );
}

type BtnKind = "primary" | "ghost" | "outline" | "accent";
type BtnSize = "sm" | "md" | "lg";

function btnClassName(kind: BtnKind, size: BtnSize, full?: boolean, className?: string) {
  const sizes: Record<BtnSize, string> = {
    sm: "min-h-11 px-3.5 text-[13.5px]",
    md: "min-h-11 px-4 text-[14.5px]",
    lg: "h-12 px-5 text-[15px]",
  };

  const kinds: Record<BtnKind, string> = {
    primary:
      "bg-[var(--deep)] text-white shadow-[0_14px_34px_-28px_rgba(22,22,22,0.7)] hover:bg-[var(--ink-2)] hover:text-white visited:text-white",
    ghost: "bg-transparent text-[var(--ink)] hover:bg-white/70",
    outline: "border hair bg-white/76 text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:border-[var(--accent-line)] hover:bg-white",
    accent: "bg-[var(--accent)] text-white shadow-[0_14px_34px_-28px_rgba(72,105,155,0.75)] hover:brightness-105",
  };

  return `touch-link inline-flex items-center justify-center gap-2 rounded-[10px] font-medium tracking-[-0.005em] transition duration-150 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:translate-y-0 ${sizes[size]} ${kinds[kind]} ${
    full ? "w-full" : ""
  } ${className ?? ""}`;
}

function btnStyle(kind: BtnKind) {
  if (kind === "primary" || kind === "accent") {
    return { color: "#ffffff" };
  }

  return undefined;
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  kind?: BtnKind;
  size?: BtnSize;
  full?: boolean;
}

export function Btn({
  children,
  kind = "primary",
  size = "md",
  full,
  className,
  ...props
}: BtnProps) {
  return (
    <button
      {...props}
      className={btnClassName(kind, size, full, className)}
      style={btnStyle(kind)}
    >
      {children}
    </button>
  );
}

export function BtnLink({
  children,
  href,
  kind = "primary",
  size = "md",
  full,
  className,
}: {
  children: React.ReactNode;
  href: string;
  kind?: BtnKind;
  size?: BtnSize;
  full?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={btnClassName(kind, size, full, className)}
      style={btnStyle(kind)}
    >
      {children}
    </Link>
  );
}

export function CategoryDot({ cat }: { cat: Category }) {
  return <span className={`dot dot-${cat}`} aria-hidden="true" />;
}
