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
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl border hair bg-white text-left transition hover:-translate-y-px hover:shadow-paper ${
        dense ? "p-5" : "p-6"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CategoryDot cat={cat} />
          <span className="text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
            {CATEGORY_LABEL[cat]}
          </span>
        </div>
        {badge ? <Pill>{badge}</Pill> : null}
      </div>

      <h3
        className={`mt-4 font-serif leading-[1.15] tracking-[-0.01em] text-[var(--ink)] ${
          dense ? "text-[18px]" : "text-[22px]"
        }`}
      >
        {title}
      </h3>

      <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.55] text-[var(--muted)]">
        {blurb}
      </p>

      {stat ? (
        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--soft)]">
              {statLabel}
            </div>
            <div className="mt-1 font-mono text-[18px] tabular">{stat}</div>
          </div>
          <span className="text-[13px] font-medium text-[var(--ink)] opacity-80 group-hover:opacity-100">
            Openen →
          </span>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[12px] text-[var(--soft)]">Scenario en uitleg</span>
          <span className="text-[13px] font-medium text-[var(--ink)] opacity-80 group-hover:opacity-100">
            Openen →
          </span>
        </div>
      )}
    </Link>
  );
}
