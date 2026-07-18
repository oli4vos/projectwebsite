import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppRenderer } from "@/components/AppRenderer";
import { GlossaryText } from "@/components/GlossaryText";
import { KnowledgeLevelHint } from "@/components/KnowledgeLevelHint";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CategoryDot, Pill } from "@/components/ui";
import type {
  AppStatus,
  AppType,
} from "@/lib/app-types";
import { resolveCategory } from "@/lib/categories";
import {
  getAssumptionDomainLabel,
  getCalculationDomainLabel,
  getDisclaimerTypeLabel,
  getOutputTypeLabel,
  getRiskLevelLabel,
} from "@/lib/copy-glossary";
import { ENABLE_KNOWLEDGE_LEVEL, ENABLE_PROFILE } from "@/lib/feature-flags";
import { appRegistry, appRegistryBySlug } from "@/lib/app-registry";

type AppDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const statusLabel: Record<AppStatus, string> = {
  active: "Actief",
  beta: "Beta",
  draft: "Concept",
};

const typeLabel: Record<AppType, string> = {
  frontend: "Rekentool",
  api: "API",
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
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg text-[13px] text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
        >
          ← Terug naar dashboard
        </Link>

        <section className="mt-5 pb-8">
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
              <GlossaryText text={app.description} />
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {app.tags.map((tag) => (
                <Pill key={tag}>{tag}</Pill>
              ))}
            </div>
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

        <section className="mt-6">
          <details className="surface-panel p-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-[13px] font-medium text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2">
              Toolcontext en aannames
              <span className="text-[var(--muted)]">Uitklappen</span>
            </summary>

            <div className="mt-4 space-y-3 text-[13.5px]">
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Status</span>
                <span className="font-medium text-[var(--ink)]">
                  {statusLabel[app.status]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Type</span>
                <span className="font-medium text-[var(--ink)]">
                  {typeLabel[app.type]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Versie</span>
                <span className="font-mono tabular text-[var(--ink)]">
                  {app.version ?? "n.v.t."}
                </span>
              </div>
              {app.riskLevel && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Gevoeligheid voor aannames</span>
                  <span className="font-medium text-[var(--ink)]">
                    {getRiskLevelLabel(app.riskLevel)}
                  </span>
                </div>
              )}
              {app.disclaimerType && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Disclaimer</span>
                  <span className="font-medium text-[var(--ink)]">
                    {getDisclaimerTypeLabel(app.disclaimerType)}
                  </span>
                </div>
              )}
              {app.outputType && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Resultaatvorm</span>
                  <span className="font-medium text-[var(--ink)]">
                    {getOutputTypeLabel(app.outputType)}
                  </span>
                </div>
              )}
              {app.requiredProfileFields && app.requiredProfileFields.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Profielvelden</span>
                  <span className="font-medium text-[var(--ink)]">
                    {app.requiredProfileFields.length}
                  </span>
                </div>
              )}
            </div>
            {app.calculationDomains && app.calculationDomains.length > 0 && (
              <div className="mt-5 border-t border-[var(--hair)] pt-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  Domeinen
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {app.calculationDomains.map((domain) => (
                    <Pill key={domain}>{getCalculationDomainLabel(domain)}</Pill>
                  ))}
                </div>
              </div>
            )}
            {app.assumptionsUsed && app.assumptionsUsed.length > 0 && (
              <div className="mt-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  Aannames
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {app.assumptionsUsed.map((assumption) => (
                    <Pill key={assumption}>{getAssumptionDomainLabel(assumption)}</Pill>
                  ))}
                </div>
              </div>
            )}
            {ENABLE_PROFILE && app.requiredProfileFields && app.requiredProfileFields.length > 0 && (
              <div className="mt-4 border-t border-[var(--hair)] pt-4 text-[12.5px] leading-[1.6] text-[var(--muted)]">
                Voor deze tool kun je basisvelden vooraf invullen in{" "}
                <Link href="/profiel" className="text-[var(--ink)] underline">
                  Mijn profiel
                </Link>
                .
              </div>
            )}
          </details>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
