import Link from "next/link";
import { CATEGORY_LABEL, type Category } from "@/lib/categories";
import { CategoryDot, Pill } from "@/components/ui";
import { GlossaryText } from "@/components/GlossaryText";

interface ToolCardProps {
  cat: Category;
  title: string;
  blurb: string;
  stat?: string;
  statLabel?: string;
  badge?: string;
  dense?: boolean;
  href: string;
}

export function ToolCard({
  cat,
  title,
  blurb,
  stat,
  statLabel,
  badge,
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CategoryDot cat={cat} />
          <span className="text-[12px] font-medium text-[var(--muted)]">
            {CATEGORY_LABEL[cat]}
          </span>
        </div>
        {badge ? <Pill>{badge}</Pill> : null}
      </div>

      <h3
        className={`mt-4 font-serif leading-[1.15] tracking-[-0.01em] text-[var(--ink)] ${
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

      {stat ? (
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="text-[12px] font-medium text-[var(--soft)]">{statLabel}</div>
            <div className="mt-1 font-mono text-[18px] tabular">{stat}</div>
          </div>
          <span className="rounded-md bg-[var(--paper-soft)] px-2.5 py-1 text-[13px] font-medium text-[var(--ink)] opacity-90 transition group-hover:bg-[var(--deep)] group-hover:text-white group-focus-visible:bg-[var(--deep)] group-focus-visible:text-white">
            Openen
          </span>
        </div>
      ) : (
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-[12px] text-[var(--soft)]">Scenario en uitleg</span>
          <span className="rounded-md bg-[var(--paper-soft)] px-2.5 py-1 text-[13px] font-medium text-[var(--ink)] opacity-90 transition group-hover:bg-[var(--deep)] group-hover:text-white group-focus-visible:bg-[var(--deep)] group-focus-visible:text-white">
            Openen
          </span>
        </div>
      )}
    </Link>
  );
}
