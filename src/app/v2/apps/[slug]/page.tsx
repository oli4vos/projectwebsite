import { notFound } from "next/navigation";
import { appRegistry } from "@/lib/app-registry";
import { AppRenderer } from "@/components/AppRenderer";
import Link from "next/link";

type PageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return appRegistry.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const app = appRegistry.find((a) => a.slug === params.slug);
  return {
    title: app ? `${app.title} | GRIP v2` : "Tool | GRIP v2",
    description: app?.description || "Financiële calculator",
  };
}

export default function V2ToolPage({ params }: PageProps) {
  const app = appRegistry.find((a) => a.slug === params.slug);

  if (!app) {
    notFound();
  }

  return (
    <div className="v2-root min-h-screen">
      {/* Breadcrumb */}
      <div className="v2-section border-b border-[var(--v2-sage)]/10">
        <div className="v2-container flex items-center gap-2 text-sm">
          <Link href="/v2/apps" className="text-[var(--v2-sage)] hover:underline">
            Tools
          </Link>
          <span className="text-[var(--v2-text-muted)]">/</span>
          <span className="text-[var(--v2-text-secondary)]">{app.title}</span>
        </div>
      </div>

      {/* Tool Header */}
      <div className="v2-section bg-gradient-to-b from-[var(--v2-bg-soft)] to-[var(--v2-bg)]">
        <div className="v2-container max-w-3xl">
          <p className="v2-eyebrow mb-2">Calculator</p>
          <h1 className="v2-h1 mb-4">{app.title}</h1>
          <p className="v2-body-lg text-[var(--v2-text-secondary)]">
            {app.description}
          </p>
        </div>
      </div>

      {/* Tool Renderer */}
      <div className="v2-section">
        <div className="v2-container max-w-4xl">
          <AppRenderer appSlug={params.slug} />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="v2-section border-t border-[var(--v2-sage)]/10">
        <div className="v2-container text-center">
          <p className="v2-body-lg mb-4">Meer tools verkennen?</p>
          <Link href="/v2/apps">
            <button className="v2-btn v2-btn-secondary">
              Terug naar alle tools
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
