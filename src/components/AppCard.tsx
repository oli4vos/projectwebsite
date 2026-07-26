import type { AppManifest } from "@/lib/app-types";
import { ToolCard } from "@/components/ToolCard";

type AppCardProps = {
  app: AppManifest;
};

export function AppCard({ app }: AppCardProps) {
  return (
    <ToolCard
      title={app.title}
      blurb={app.description}
      href={`/apps/${app.slug}`}
    />
  );
}
