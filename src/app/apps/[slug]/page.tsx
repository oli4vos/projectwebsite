import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppRenderer } from "@/components/AppRenderer";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CategoryDot, Pill } from "@/components/ui";
import { resolveCategory } from "@/lib/categories";
import { appRegistry, appRegistryBySlug } from "@/lib/app-registry";

type AppDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return appRegistry.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({
  params,
}: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = appRegistryBySlug[slug];

  if (!app) {
    return {
      title: "Rekentool niet gevonden",
    };
  }

  return {
    title: `${app.title} | Financiële rekentools`,
    description: app.description,
  };
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const app = appRegistryBySlug[slug];

  if (!app) {
    notFound();
  }

  const category = resolveCategory(app.category, app.slug);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="mx-auto min-h-[100dvh] max-w-7xl px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)]"
        >
          ← Terug naar dashboard
        </Link>

        <section className="hair-b mt-5 grid gap-8 pb-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-[12px] tabular text-[var(--muted)]">
              <span>Rekentools</span>
              <span className="text-[var(--soft)]">/</span>
              <span className="inline-flex items-center gap-1.5">
                <CategoryDot cat={category} />
                {app.category}
              </span>
            </div>

            <h1 className="text-fluid-h1 mt-4 font-serif tracking-[-0.03em] text-[var(--ink)]">
              {app.title}
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[62ch] leading-[1.7] text-[var(--ink-2)]">
              {app.description}
            </p>
            <p className="mt-4 max-w-[58ch] text-[14px] leading-[1.7] text-[var(--muted)]">
              Gebruik deze tool om scenario&apos;s naast elkaar te zetten, aannames
              expliciet te maken en met meer inzicht vooruit te kijken zonder dat het
              voelt alsof je eerst financieel jargon moet leren spreken.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {app.tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.5rem] border hair bg-white p-5 shadow-paper">
            <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
              Context
            </div>
            <div className="mt-4 space-y-3 text-[13.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Status</span>
                <span className="font-medium text-[var(--ink)]">{app.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Type</span>
                <span className="font-medium text-[var(--ink)]">{app.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Versie</span>
                <span className="font-mono tabular text-[var(--ink)]">
                  {app.version ?? "n.v.t."}
                </span>
              </div>
            </div>
            <div className="mt-5 border-t border-[var(--hair)] pt-4 text-[12.5px] leading-[1.6] text-[var(--muted)]">
              Heldere aannames, lokale berekening en een resultaat dat je direct kunt
              vertalen naar je eigen keuze of vervolgvraag.
            </div>
          </aside>
        </section>

        <section className="pt-8">
          <AppRenderer slug={app.slug} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
