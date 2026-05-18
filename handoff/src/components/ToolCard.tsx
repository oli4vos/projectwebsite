import { CategoryDot, Pill } from "./ui";
import { CATEGORY_LABEL, type Category } from "../lib/categories";

interface ToolCardProps {
  cat: Category;
  title: string;
  blurb: string;
  stat?: string;
  statLabel?: string;
  badge?: string;
  /** Smaller padding + smaller title for second tier in a grid. */
  dense?: boolean;
  href?: string;
  onOpen?: () => void;
}

export function ToolCard({ cat, title, blurb, stat, statLabel, badge, dense, onOpen }: ToolCardProps) {
  return (
    <button
      onClick={onOpen}
      className={`group text-left relative bg-white border hair rounded-xl overflow-hidden flex flex-col w-full ${
        dense ? "p-5" : "p-6"
      } hover:shadow-paper transition`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CategoryDot cat={cat} />
          <span className="text-[11px] tracking-[0.06em] uppercase text-[var(--muted)]">
            {CATEGORY_LABEL[cat]}
          </span>
        </div>
        {badge && <Pill>{badge}</Pill>}
      </div>

      <h3 className={`font-serif mt-4 ${dense ? "text-[18px]" : "text-[22px]"} leading-[1.15] tracking-[-0.01em]`}>
        {title}
      </h3>

      <p className="text-[13.5px] leading-[1.55] text-[var(--muted)] mt-2 line-clamp-2">{blurb}</p>

      {stat ? (
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.06em] text-[var(--soft)]">{statLabel}</div>
            <div className="font-mono text-[18px] tabular mt-1">{stat}</div>
          </div>
          <span className="text-[13px] text-[var(--ink)] font-medium opacity-80 group-hover:opacity-100">
            Openen →
          </span>
        </div>
      ) : (
        <div className="mt-6 flex items-center justify-between">
          <span className="text-[12px] text-[var(--soft)]">Gem. 2 min.</span>
          <span className="text-[13px] text-[var(--ink)] font-medium opacity-80 group-hover:opacity-100">
            Openen →
          </span>
        </div>
      )}
    </button>
  );
}
