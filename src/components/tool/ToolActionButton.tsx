import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ToolActionButtonVariant = "secondary" | "accent" | "submit";
type ToolActionButtonSize = "sm" | "md";

function classesFor(variant: ToolActionButtonVariant, size: ToolActionButtonSize, full?: boolean) {
  const sizeClass =
    size === "sm" ? "px-3 py-2 text-[12px]" : "px-4 py-2 text-[13px] font-medium";

  const variantClass =
    variant === "secondary"
      ? "border hair bg-white/80 text-[var(--ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] hover:border-[var(--accent-line)] hover:bg-white"
      : variant === "accent"
        ? "bg-[var(--accent)] text-white shadow-[0_14px_34px_-28px_rgba(72,105,155,0.75)] hover:brightness-105"
        : "ring-focus hair h-12 border bg-[var(--deep)] px-4 text-[14px] text-white shadow-[0_14px_34px_-28px_rgba(22,22,22,0.7)]";

  const widthClass = full ? "w-full justify-center" : "";
  const base =
    "touch-link inline-flex min-h-11 items-center justify-center gap-2 rounded-lg transition duration-200 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:translate-y-0";

  return `${base} ${sizeClass} ${variantClass} ${widthClass}`.trim();
}

type ToolActionButtonProps = {
  children: ReactNode;
  variant?: ToolActionButtonVariant;
  size?: ToolActionButtonSize;
  full?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function ToolActionButton({
  children,
  variant = "secondary",
  size = "sm",
  full = false,
  className,
  ...props
}: ToolActionButtonProps) {
  return (
    <button
      {...props}
      className={`${classesFor(variant, size, full)} ${className ?? ""}`.trim()}
    >
      {children}
    </button>
  );
}

type ToolActionLinkButtonProps = {
  children: ReactNode;
  href: string;
  variant?: ToolActionButtonVariant;
  size?: ToolActionButtonSize;
  full?: boolean;
  className?: string;
};

export function ToolActionLinkButton({
  children,
  href,
  variant = "secondary",
  size = "sm",
  full = false,
  className,
}: ToolActionLinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${classesFor(variant, size, full)} ${className ?? ""}`.trim()}
    >
      {children}
    </Link>
  );
}
