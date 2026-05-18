import type { AppManifest } from "@/lib/app-types";
import { resolveCategory } from "@/lib/categories";
import { ToolCard } from "@/components/ToolCard";

const statusLabel: Record<AppManifest["status"], string> = {
  active: "Actief",
  beta: "Beta",
  draft: "Concept",
};

type AppCardProps = {
  app: AppManifest;
};

export function AppCard({ app }: AppCardProps) {
  const category = resolveCategory(app.category, app.slug);
  const statLabel = app.type === "frontend" ? "Direct in browser" : "Type";
  const stat = app.type === "frontend" ? statusLabel[app.status] : app.type;

  return (
    <ToolCard
      cat={category}
      title={app.title}
      blurb={app.description}
      badge={app.category}
      stat={stat}
      statLabel={statLabel}
      href={`/apps/${app.slug}`}
    />
  );
}
