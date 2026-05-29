import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryText } from "@/components/GlossaryText";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill } from "@/components/ui";
import { appRegistryBySlug } from "@/lib/app-registry";
import {
  knowledgeHorizonBands,
  knowledgeTopics,
} from "@/lib/knowledge-base";

export const metadata: Metadata = {
  title: "Financiële kennisbank | Financiële rekentools",
  description:
    "Praktische kennisbank met besliskaders voor sparen, beleggen, aflossen, kopen of huren, horizon en inflatie.",
};

function getRelatedToolLabel(slug: string) {
  return appRegistryBySlug[slug]?.title ?? slug;
}

export default function KnowledgeBasePage() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14"
      >
        <section className="hair-b pb-8">
          <div className="max-w-4xl pt-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Kennisbank
            </div>
            <h1 className="text-fluid-h1 mt-4 font-serif tracking-[-0.03em] text-[var(--ink)]">
              Wanneer overweeg je wat met je geld?
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[66ch] leading-[1.7] text-[var(--ink-2)]">
              Deze kennisbank helpt je keuzes kaderen vóórdat je gaat rekenen.
              Denk aan: sparen voor een huis over 5 jaar, huren versus kopen,
              beleggen per horizon, risico en <GlossaryText text="inflatie" />.
            </p>
            <p className="mt-4 max-w-[66ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
              Gebruik dit als routehulp. Voor je eigen cijfers en scenario&apos;s
              ga je daarna door naar de rekentools.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[clamp(1.25rem,1.05rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
            Stap 1: kies je horizon
          </h2>
          <p className="mt-2 max-w-[66ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
            Hoe lang je geld kan blijven staan bepaalt vaak meer dan het gekozen
            product.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {knowledgeHorizonBands.map((band) => (
              <article
                key={band.id}
                className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
              >
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                  {band.periodLabel}
                </div>
                <h3 className="mt-1 font-serif text-[1.2rem] text-[var(--ink)]">
                  {band.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
                  <GlossaryText text={band.primaryGoal} />
                </p>
                <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
                  <GlossaryText text={band.typicalApproach} />
                </p>
                <p className="mt-2 text-[12.5px] leading-[1.55] text-[var(--soft)]">
                  Let op: <GlossaryText text={band.watchOut} />
                </p>
                <ul className="mt-3 space-y-1 text-[12.5px] leading-[1.55] text-[var(--muted)]">
                  {band.firstChecks.map((item) => (
                    <li key={item}>• <GlossaryText text={item} /></li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 space-y-6">
          {knowledgeTopics.map((topic) => (
            <article
              key={topic.id}
              className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="font-serif text-[clamp(1.2rem,1.02rem+0.75vw,1.6rem)] tracking-[-0.02em] text-[var(--ink)]">
                  {topic.title}
                </h2>
                <Pill>Kader</Pill>
              </div>
              <p className="mt-3 max-w-[68ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
                <GlossaryText text={topic.summary} />
              </p>
              <p className="mt-2 max-w-[68ch] text-[13px] leading-[1.65] text-[var(--muted)]">
                <strong className="text-[var(--ink)]">Wanneer relevant:</strong>{" "}
                <GlossaryText text={topic.whenRelevant} />
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                    Checklist
                  </div>
                  <ul className="mt-2 space-y-1 text-[13px] leading-[1.6] text-[var(--muted)]">
                    {topic.checklist.map((item) => (
                      <li key={item}>• <GlossaryText text={item} /></li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                    Veelgemaakte fouten
                  </div>
                  <ul className="mt-2 space-y-1 text-[13px] leading-[1.6] text-[var(--muted)]">
                    {topic.commonMistakes.map((item) => (
                      <li key={item}>• <GlossaryText text={item} /></li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                  Verdiepen met tools
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {topic.relatedTools.map((slug) => (
                    <Link
                      key={slug}
                      href={`/apps/${slug}`}
                      className="inline-flex items-center rounded-full border border-[var(--hair)] bg-white px-3 py-1.5 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                    >
                      {getRelatedToolLabel(slug)}
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

