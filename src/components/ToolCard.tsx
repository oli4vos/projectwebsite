import Link from "next/link";
import { GlossaryText } from "@/components/GlossaryText";

interface ToolCardProps {
  title: string;
  blurb: string;
  dense?: boolean;
  href: string;
}

export function ToolCard({
  title,
  blurb,
  dense,
  href,
}: ToolCardProps) {
  return (
    <Link
      href={href}
      className={`surface-panel touch-link group relative flex h-full w-full flex-col overflow-hidden text-left focus-visible:shadow-paper focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 ${
        dense ? "p-5" : "p-6"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[var(--accent-soft)] opacity-0 transition group-hover:opacity-100" />

      <h3
        className={`font-serif leading-[1.15] tracking-[-0.01em] text-[var(--ink)] ${
          dense
            ? "text-[clamp(1rem,0.95rem+0.3vw,1.125rem)]"
            : "text-[clamp(1.15rem,1.05rem+0.6vw,1.375rem)]"
        }`}
      >
        {title}
      </h3>

      <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.6] text-[var(--muted)]">
        <GlossaryText text={blurb} />
      </p>

      <div className="mt-auto flex justify-end pt-6">
        <span className="rounded-md bg-[var(--paper-soft)] px-2.5 py-1 text-[13px] font-medium text-[var(--ink)] opacity-90 transition group-hover:bg-[var(--deep)] group-hover:text-white group-focus-visible:bg-[var(--deep)] group-focus-visible:text-white">
          Open tool
        </span>
      </div>
    </Link>
  );
}
