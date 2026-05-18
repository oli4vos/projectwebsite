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
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.4" />
        <path d="M12 4V20M4 12H20" stroke={color} strokeWidth="1.4" />
        <circle cx="12" cy="12" r="2.2" fill={color} />
      </svg>
      <span
        className="font-serif font-medium tracking-tight"
        style={{ fontSize: size * 0.96, letterSpacing: "-0.01em" }}
      >
        {name}
      </span>
    </div>
  );
}

type PillTone = "default" | "pos" | "neg" | "accent" | "dark";

export function Pill({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: PillTone;
}) {
  const map: Record<PillTone, string> = {
    default: "border hair bg-white text-[var(--muted)]",
    pos: "border-transparent bg-[var(--pos-soft)] text-[oklch(40%_0.10_152)]",
    neg: "border-transparent bg-[var(--neg-soft)] text-[oklch(40%_0.13_28)]",
    accent: "border-transparent bg-[var(--accent-soft)] text-[oklch(40%_0.07_232)]",
    dark: "border-transparent bg-[var(--deep)] text-white",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] tabular ${map[tone]}`}
    >
      {children}
    </span>
  );
}

type BtnKind = "primary" | "ghost" | "outline" | "accent";
type BtnSize = "sm" | "md" | "lg";

function btnClassName(kind: BtnKind, size: BtnSize, full?: boolean, className?: string) {
  const sizes: Record<BtnSize, string> = {
    sm: "h-8 px-3 text-[13px]",
    md: "h-10 px-4 text-[14px]",
    lg: "h-12 px-5 text-[15px]",
  };

  const kinds: Record<BtnKind, string> = {
    primary:
      "bg-[var(--deep)] text-white hover:bg-black hover:text-white visited:text-white",
    ghost: "bg-transparent text-[var(--ink)] hover:bg-[var(--paper-soft)]",
    outline: "border hair bg-white text-[var(--ink)] hover:bg-[var(--paper-soft)]",
    accent: "bg-[var(--accent)] text-white hover:brightness-110",
  };

  return `inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[-0.005em] shadow-[0_0_0_rgba(0,0,0,0)] transition duration-200 hover:-translate-y-px hover:shadow-paper focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 active:translate-y-px ${sizes[size]} ${kinds[kind]} ${
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
