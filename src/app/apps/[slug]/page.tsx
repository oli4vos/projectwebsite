import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppRenderer } from "@/components/AppRenderer";
import { GlossaryText } from "@/components/GlossaryText";
import { KnowledgeLevelHint } from "@/components/KnowledgeLevelHint";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ENABLE_KNOWLEDGE_LEVEL } from "@/lib/feature-flags";
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
    title: `${app.title} | Project Site`,
    description: app.description,
  };
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const app = appRegistryBySlug[slug];

  if (!app) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
        >
          ← Terug naar dashboard
        </Link>

        <section className="mt-5 pb-8">
          <div className="max-w-4xl">
            <h1 className="text-fluid-h1 font-serif tracking-[-0.03em] text-[var(--ink)]">
              {app.title}
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[62ch] leading-[1.7] text-[var(--ink-2)]">
              <GlossaryText text={app.description} />
            </p>
          </div>
        </section>

        <section className="pt-6">
          {ENABLE_KNOWLEDGE_LEVEL ? (
            <div className="mb-4 rounded-xl border hair bg-white px-4 py-3 shadow-paper">
              <KnowledgeLevelHint />
            </div>
          ) : null}
          <AppRenderer slug={app.slug} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
