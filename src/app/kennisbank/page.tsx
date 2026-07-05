import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryText } from "@/components/GlossaryText";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Pill } from "@/components/ui";
import { appRegistryBySlug } from "@/lib/app-registry";
import { knowledgeHorizonBands, knowledgeTopics } from "@/lib/knowledge-base";
import {
  knowledgeDocumentGroupEntries,
  knowledgeDocumentTitles,
  knowledgeSourceEntries,
  knowledgeSourceHierarchy,
  knowledgeSources,
} from "@/lib/knowledge-sources";

export const metadata: Metadata = {
  title: "Kennisbank studieschuld | Financiële rekentools",
  description:
    "Praktische kennisbank over DUO-rente, aanloopfase, draagkracht, extra aflossen en de impact van studieschuld op hypotheekruimte.",
};

function getRelatedToolLabel(slug: string) {
  return appRegistryBySlug[slug]?.title ?? slug;
}

function getSourceTone(
  type: string,
): "default" | "accent" | "warn" | "pos" | "neg" | "dark" {
  if (type.toLowerCase().includes("jurid")) return "dark";
  if (type.toLowerCase().includes("norm")) return "accent";
  if (type.toLowerCase().includes("toezicht")) return "warn";
  if (type.toLowerCase().includes("praktijk")) return "default";
  return "default";
}

export default function KnowledgeBasePage() {
  const visibleHorizonBands = knowledgeHorizonBands.filter(
    (band) => band.visibility !== "hidden",
  );
  const visibleTopics = knowledgeTopics.filter(
    (topic) => topic.visibility !== "hidden",
  );

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
              Studieschuld begrijpen, stap voor stap
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[66ch] leading-[1.7] text-[var(--ink-2)]">
              Feitelijke uitleg over wat je tijdens je studie opbouwt, wat je
              na je studie betaalt en wat je studieschuld betekent als je later
              een huis wilt kopen.
            </p>
            <p className="mt-4 max-w-[66ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
              Gebruik dit als routehulp. Voor je eigen cijfers en scenario&apos;s
              ga je daarna door naar de rekentools.
            </p>
          </div>
        </section>

        {visibleHorizonBands.length > 0 ? (
          <section className="mt-8 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
            <h2 className="font-serif text-[clamp(1.25rem,1.05rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
              Stap 1: kies je horizon
            </h2>
            <p className="mt-2 max-w-[66ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
              Hoe lang je geld kan blijven staan bepaalt vaak meer dan het gekozen
              product.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {visibleHorizonBands.map((band) => (
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
        ) : null}

        <section className="mt-8 space-y-6">
          {visibleTopics.map((topic) => {
            const relatedTools = topic.relatedTools.filter(
              (slug) => appRegistryBySlug[slug],
            );
            const sourceIds = topic.sourceIds ?? [];

            return (
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

                {relatedTools.length > 0 ? (
                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                      Verdiepen met tools
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {relatedTools.map((slug) => (
                        <Link
                          key={slug}
                          href={`/apps/${slug}`}
                          className="inline-flex min-h-11 items-center rounded-full border border-[var(--hair)] bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                        >
                          {getRelatedToolLabel(slug)}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}

                {sourceIds.length > 0 ? (
                  <div className="mt-5">
                    <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                      Bronnen
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {sourceIds.map((sourceId) => {
                        const source = knowledgeSources[sourceId];

                        return (
                          <a
                            key={sourceId}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex min-h-11 items-center rounded-full border border-[var(--hair)] bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                          >
                            {source.publisher}: {source.title}
                          </a>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[clamp(1.25rem,1.05rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
            De drie fases
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Tijdens je studie",
                text: "Wat bouw ik op, welke rente hoort erbij en wat betekent doorlenen later?",
              },
              {
                title: "Na je studie",
                text: "Wat wordt mijn maandbedrag, hoe werkt draagkracht en wat doet extra aflossen?",
              },
              {
                title: "Verder",
                text: "Wat betekent mijn studieschuld voor hypotheekruimte, buffer en woningplannen?",
              },
            ].map((phase) => (
              <article
                key={phase.title}
                className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
              >
                <h3 className="font-serif text-[1.15rem] text-[var(--ink)]">
                  {phase.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
                  {phase.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-serif text-[clamp(1.25rem,1.05rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
                Bronnen die de kennisbank dragen
              </h2>
              <p className="mt-2 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
                Deze bronnen zijn de basis voor de uitleg op de kennisbank en
                voor toekomstige artikelen. Wet en normadvies staan bovenaan;
                praktijkbronnen zijn alleen aanvullend.
              </p>
            </div>
            <Pill tone="dark">Centrale bronlaag</Pill>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {knowledgeSourceEntries.map(([id, source]) => (
              <article
                key={id}
                className="flex h-full flex-col rounded-2xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <Pill tone={getSourceTone(source.type)}>{source.type}</Pill>
                  <Pill>{source.publisher}</Pill>
                </div>
                <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-dotted decoration-[var(--accent)] underline-offset-4 transition hover:text-[var(--accent)]"
                  >
                    {source.title}
                  </a>
                </h3>
                <p className="mt-2 text-[13px] leading-[1.65] text-[var(--ink-2)]">
                  {source.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[var(--muted)]">
                  <span>{source.date}</span>
                  <span aria-hidden="true">•</span>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center rounded-md underline decoration-dotted underline-offset-4 transition hover:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                  >
                    Open bron
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[clamp(1.25rem,1.05rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
            Bronnen per kennisdocument
          </h2>
          <p className="mt-2 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            Elk kennisdocument gebruikt een vaste bronset. Zo blijft duidelijk
            welke bron leidend is en welke alleen ter uitleg dient.
          </p>

          <div className="mt-6 grid gap-4">
            {knowledgeDocumentGroupEntries.map(([docId, sourceIds]) => (
              <article
                key={docId}
                className="rounded-2xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-[1.02rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">
                    {knowledgeDocumentTitles[docId]}
                  </h3>
                  <Pill>{sourceIds.length} bronnen</Pill>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sourceIds.map((sourceId) => {
                    const source = knowledgeSources[sourceId];

                    return (
                      <a
                        key={sourceId}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-[var(--hair)] bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                        title={`${source.title} · ${source.publisher}`}
                      >
                        {source.title}
                      </a>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <h2 className="font-serif text-[clamp(1.25rem,1.05rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
            Bronhiërarchie
          </h2>
          <p className="mt-2 max-w-[72ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
            De kennisbank rangschikt bronnen van hard naar zacht: wet en
            regeling eerst, daarna normadvies, toezicht, overheidsuitleg en
            ten slotte praktijkbronnen.
          </p>
          <div className="mt-5 grid gap-3">
            {knowledgeSourceHierarchy.map((level) => (
              <div
                key={level.label}
                className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="accent">{level.label}</Pill>
                  <span className="text-[13px] text-[var(--muted)]">
                    {level.useFor}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {level.sourceIds.map((sourceId) => {
                    const source = knowledgeSources[sourceId];

                    return (
                      <a
                        key={sourceId}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-[var(--hair)] bg-white px-3 py-2 text-[12px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
                      >
                        {source.title}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
