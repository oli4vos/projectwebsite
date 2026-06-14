import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ToolActionButtonVariant = "secondary" | "accent" | "submit";
type ToolActionButtonSize = "sm" | "md";

function classesFor(variant: ToolActionButtonVariant, size: ToolActionButtonSize, full?: boolean) {
  const sizeClass =
    size === "sm" ? "px-3 py-2 text-[12px]" : "px-4 py-2 text-[13px] font-medium";

  const variantClass =
    variant === "secondary"
      ? "border hair bg-white text-[var(--ink)] hover:bg-[var(--paper-soft)]"
      : variant === "accent"
        ? "bg-[var(--accent)] text-white hover:opacity-90"
        : "ring-focus hair h-12 border bg-[var(--deep)] px-4 text-[14px] text-white";

  const widthClass = full ? "w-full justify-center" : "";
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg transition duration-200 focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0";

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
