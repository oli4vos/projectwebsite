import Link from "next/link";
import { CATEGORY_LABEL, type Category } from "@/lib/categories";
import { CategoryDot, Pill } from "@/components/ui";

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
      className={`group sheet relative flex w-full flex-col overflow-hidden text-left transition duration-200 hover:-translate-y-px hover:shadow-paper focus-visible:-translate-y-px focus-visible:shadow-paper focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 active:translate-y-0 ${
        dense ? "p-5" : "p-6"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CategoryDot cat={cat} />
          <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
            {CATEGORY_LABEL[cat]}
          </span>
        </div>
        {badge ? <Pill>{badge}</Pill> : null}
      </div>

      <h3
        className={`mt-5 max-w-[22ch] font-serif leading-[1.08] tracking-[-0.015em] text-[var(--ink)] ${
          dense ? "text-[18px]" : "text-[24px]"
        }`}
      >
        {title}
      </h3>

      <p className="mt-3 line-clamp-3 text-[13.5px] leading-[1.65] text-[var(--muted)]">
        {blurb}
      </p>

      <div className="mt-5 h-px w-full bg-[var(--hair)]" />

      {stat ? (
        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--soft)]">
              {statLabel}
            </div>
            <div className="mt-1 font-mono text-[17px] tabular text-[var(--ink)]">{stat}</div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-soft)] border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-2 text-[13px] font-medium text-[var(--ink)] transition group-hover:border-[var(--ink)] group-focus-visible:border-[var(--ink)]">
            Open rekentool
            <span className="transition group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
              →
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-[12px] text-[var(--soft)]">
            Scenario, samenvatting en aannames
          </span>
          <div className="inline-flex items-center gap-2 rounded-[var(--radius-soft)] border border-[var(--hair)] bg-[var(--paper-soft)] px-3 py-2 text-[13px] font-medium text-[var(--ink)] transition group-hover:border-[var(--ink)] group-focus-visible:border-[var(--ink)]">
            Open rekentool
            <span className="transition group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
              →
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
