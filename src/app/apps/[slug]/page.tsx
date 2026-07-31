import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppRenderer } from "@/components/AppRenderer";
import { KnowledgeLevelHint } from "@/components/KnowledgeLevelHint";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ToolProcessGuide } from "@/components/tool/ToolProcessGuide";
import { ENABLE_KNOWLEDGE_LEVEL } from "@/lib/feature-flags";
import { appRegistry, appRegistryBySlug } from "@/lib/app-registry";
import { getPublishedToolProcess } from "@/lib/tool-process-docs.server";

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

  const toolProcess = getPublishedToolProcess(app.slug);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <Link
          href="/apps"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
        >
          ← Alle tools
        </Link>

        <section className="mt-5 pt-2">
          {ENABLE_KNOWLEDGE_LEVEL ? (
            <div className="mb-4 rounded-xl border hair bg-white px-4 py-3 shadow-paper">
              <KnowledgeLevelHint />
            </div>
          ) : null}
          <AppRenderer slug={app.slug} />
        </section>
        <section className="mt-10" aria-label="Werking van deze tool">
          <ToolProcessGuide process={toolProcess} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
