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
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-xl border hair bg-white text-left transition duration-200 hover:-translate-y-px hover:shadow-paper focus-visible:-translate-y-px focus-visible:shadow-paper focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 active:translate-y-0 ${
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
          dense
            ? "text-[clamp(1rem,0.95rem+0.3vw,1.125rem)]"
            : "text-[clamp(1.15rem,1.05rem+0.6vw,1.375rem)]"
        }`}
      >
        {title}
      </h3>

      <p className="mt-2 line-clamp-3 text-[13.5px] leading-[1.55] text-[var(--muted)]">
        <GlossaryText text={blurb} />
      </p>

      {stat ? (
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--soft)]">
              {statLabel}
            </div>
            <div className="mt-1 font-mono text-[18px] tabular">{stat}</div>
          </div>
          <span className="text-[13px] font-medium text-[var(--ink)] opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-100">
            Openen →
          </span>
        </div>
      ) : (
        <div className="mt-auto flex items-center justify-between pt-6">
          <span className="text-[12px] text-[var(--soft)]">Scenario en uitleg</span>
          <span className="text-[13px] font-medium text-[var(--ink)] opacity-80 transition group-hover:translate-x-0.5 group-hover:opacity-100 group-focus-visible:translate-x-0.5 group-focus-visible:opacity-100">
            Openen →
          </span>
        </div>
      )}
    </Link>
  );
}
