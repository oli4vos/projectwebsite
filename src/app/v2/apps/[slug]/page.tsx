import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppRenderer } from "@/components/AppRenderer";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2Header } from "@/components/v2/V2Header";
import type { AppStatus } from "@/lib/app-types";
import { appRegistry, appRegistryBySlug } from "@/lib/app-registry";

type V2AppPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const statusLabel: Record<AppStatus, string> = {
  active: "Actief",
  beta: "Beta",
  draft: "Concept",
};

export async function generateStaticParams() {
  return appRegistry.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({
  params,
}: V2AppPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = appRegistryBySlug[slug];

  if (!app) {
    return {
      title: "Tool niet gevonden | GRIP v2",
    };
  }

  return {
    title: `${app.title} | Project Site`,
    description: app.description,
  };
}

export default async function V2AppPage({ params }: V2AppPageProps) {
  const { slug } = await params;
  const app = appRegistryBySlug[slug];

  if (!app) {
    notFound();
  }

  return (
    <>
      <V2Header />
      <main id="main-content" className="v2-section">
        <div className="v2-container space-y-6">
          <Link href="/v2/apps" className="v2-btn v2-btn--sm">
            ← Terug naar tools
          </Link>

          <section className="v2-card">
            <div className="space-y-2">
              <div className="v2-kicker">{app.category}</div>
              <h1 className="max-w-3xl">{app.title}</h1>
              <p className="text-[var(--v2-ink-soft)]">{app.description}</p>
            </div>

            <dl className="grid gap-3 pt-2 text-[14px] md:grid-cols-2">
              <div className="v2-kv">
                <dt>Status</dt>
                <dd>{statusLabel[app.status] ?? app.status}</dd>
              </div>
              <div className="v2-kv">
                <dt>Type</dt>
                <dd>{app.type}</dd>
              </div>
              <div className="v2-kv">
                <dt>Risico</dt>
                <dd>{app.riskLevel ?? "n.v.t."}</dd>
              </div>
              <div className="v2-kv">
                <dt>Resultaatvorm</dt>
                <dd>{app.outputType ?? "n.v.t."}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap gap-2 pt-2">
              {app.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--v2-line)] bg-[var(--v2-paper)] px-2.5 py-1 text-[11px] font-medium text-[var(--v2-ink-soft)]"
                >
                  {tag}
                </span>
              ))}
            </div>

            {app.reasonHint ? (
              <div className="v2-alert v2-alert--info mt-4">
                <div>
                  <strong>Wanneer deze tool handig is</strong>
                  <p className="mt-1 max-w-none">{app.reasonHint}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="v2-card">
            <div className="v2-kicker v2-kicker--blue">Calculator</div>
            <div className="mt-2">
              <AppRenderer slug={app.slug} />
            </div>
          </section>
        </div>
      </main>
      <V2Footer />
    </>
  );
}
