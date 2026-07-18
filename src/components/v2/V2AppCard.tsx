import Link from "next/link";
import type { AppManifest } from "@/lib/app-types";

const statusLabel: Record<AppManifest["status"], string> = {
  active: "Actief",
  beta: "Beta",
  draft: "Concept",
};

type V2AppCardProps = {
  app: AppManifest;
};

export function V2AppCard({ app }: V2AppCardProps) {
  return (
    <article className="v2-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="v2-kicker">{app.category}</div>
          <h3 className="text-[clamp(1.1rem,1.02rem+0.5vw,1.35rem)] text-[var(--v2-ink)]">
            {app.title}
          </h3>
        </div>
        <span className="v2-badge">{statusLabel[app.status]}</span>
      </div>

      <p className="max-w-none text-[14px] leading-[1.65]">{app.description}</p>

      <div className="flex flex-wrap gap-2 pt-1">
        {app.tags.slice(0, 4).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-[var(--v2-line)] bg-[var(--v2-paper)] px-2.5 py-1 text-[11px] font-medium text-[var(--v2-ink-soft)]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto pt-2">
        <Link href={`/v2/apps/${app.slug}`} className="v2-btn v2-btn--dark v2-btn--sm">
          Openen
        </Link>
      </div>
    </article>
  );
}
