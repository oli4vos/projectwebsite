import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryText } from "@/components/GlossaryText";
import { V2Footer } from "@/components/v2/V2Footer";
import { V2Header } from "@/components/v2/V2Header";
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
  title: "Kennisbank studieschuld | GRIP v2",
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

export default function V2KnowledgeBasePage() {
  const visibleHorizonBands = knowledgeHorizonBands.filter(
    (band) => band.visibility !== "hidden",
  );
  const visibleTopics = knowledgeTopics.filter(
    (topic) => topic.visibility !== "hidden",
  );

  return (
    <>
      <V2Header />
      <main id="main-content" className="v2-section">
        <div className="v2-container space-y-8">
          <section className="space-y-4">
            <div className="v2-kicker">Kennisbank</div>
            <div className="max-w-4xl">
              <h1>Studieschuld begrijpen, stap voor stap</h1>
              <p className="mt-4 text-[var(--v2-ink-soft)]">
                Feitelijke uitleg over wat je tijdens je studie opbouwt, wat je
                na je studie betaalt en wat je studieschuld betekent als je
                later een huis wilt kopen.
              </p>
              <p className="mt-3 text-[var(--v2-ink-soft)]">
                Gebruik dit als routehulp. Voor je eigen cijfers en scenario&apos;s
                ga je daarna door naar de rekentools.
              </p>
            </div>
          </section>

          {visibleHorizonBands.length > 0 ? (
            <section className="v2-card">
              <h2>Stap 1: kies je horizon</h2>
              <p>
                Hoe lang je geld kan blijven staan bepaalt vaak meer dan het
                gekozen product.
              </p>
              <div className="v2-grid v2-grid--3 pt-2">
                {visibleHorizonBands.map((band) => (
                  <article
                    key={band.id}
                    className="rounded-[12px] border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4"
                  >
                    <div className="v2-kicker v2-kicker--blue">{band.periodLabel}</div>
                    <h3 className="mt-1 text-[1.2rem] text-[var(--v2-ink)]">{band.title}</h3>
                    <p className="mt-2 text-[13px] leading-[1.6]">
                      <GlossaryText text={band.primaryGoal} />
                    </p>
                    <p className="mt-2 text-[13px] leading-[1.6]">
                      <GlossaryText text={band.typicalApproach} />
                    </p>
                    <p className="mt-2 text-[12.5px] leading-[1.55] text-[var(--v2-ink-soft)]">
                      Let op: <GlossaryText text={band.watchOut} />
                    </p>
                    <ul className="mt-3 space-y-1 text-[12.5px] leading-[1.55] text-[var(--v2-ink-soft)]">
                      {band.firstChecks.map((item) => (
                        <li key={item}>• <GlossaryText text={item} /></li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-6">
            {visibleTopics.map((topic) => {
              const relatedTools = topic.relatedTools.filter(
                (slug) => appRegistryBySlug[slug],
              );
              const sourceIds = topic.sourceIds ?? [];

              return (
                <article key={topic.id} className="v2-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h2>{topic.title}</h2>
                    <Pill>Kader</Pill>
                  </div>
                  <p className="max-w-[68ch] text-[14px] leading-[1.7]">
                    <GlossaryText text={topic.summary} />
                  </p>
                  <p className="max-w-[68ch] text-[13px] leading-[1.65]">
                    <strong className="text-[var(--v2-ink)]">Wanneer relevant:</strong>{" "}
                    <GlossaryText text={topic.whenRelevant} />
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[12px] border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4">
                      <div className="v2-kicker">Checklist</div>
                      <ul className="mt-2 space-y-1 text-[13px] leading-[1.6]">
                        {topic.checklist.map((item) => (
                          <li key={item}>• <GlossaryText text={item} /></li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-[12px] border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4">
                      <div className="v2-kicker">Veelgemaakte fouten</div>
                      <ul className="mt-2 space-y-1 text-[13px] leading-[1.6]">
                        {topic.commonMistakes.map((item) => (
                          <li key={item}>• <GlossaryText text={item} /></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {relatedTools.length > 0 ? (
                    <div className="pt-2">
                      <div className="v2-kicker v2-kicker--blue">Verdiepen met tools</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {relatedTools.map((slug) => (
                          <Link
                            key={slug}
                            href={`/v2/apps/${slug}`}
                            className="v2-btn v2-btn--sm"
                          >
                            {getRelatedToolLabel(slug)}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {sourceIds.length > 0 ? (
                    <div className="pt-2">
                      <div className="v2-kicker v2-kicker--blue">Bronnen</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sourceIds.map((sourceId) => {
                          const source = knowledgeSources[sourceId];

                          return (
                            <a
                              key={sourceId}
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                              className="v2-btn v2-btn--sm"
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

          <section className="v2-card">
            <h2>De drie fases</h2>
            <div className="v2-grid v2-grid--3 pt-2">
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
                  className="rounded-[12px] border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4"
                >
                  <h3 className="text-[1.15rem] text-[var(--v2-ink)]">{phase.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.65]">{phase.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="v2-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2>Bronnen die de kennisbank dragen</h2>
                <p className="mt-2 max-w-[72ch]">
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
                  className="flex h-full flex-col rounded-[14px] border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <Pill tone={getSourceTone(source.type)}>{source.type}</Pill>
                    <Pill>{source.publisher}</Pill>
                  </div>
                  <h3 className="mt-3 text-[1.05rem] font-semibold tracking-[-0.01em] text-[var(--v2-ink)]">
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.65]">{source.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-[var(--v2-ink-soft)]">
                    <span>{source.date}</span>
                    <span aria-hidden="true">•</span>
                    <a href={source.url} target="_blank" rel="noreferrer" className="underline">
                      Open bron
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-4">
              {knowledgeDocumentGroupEntries.map(([docId, sourceIds]) => (
                <article
                  key={docId}
                  className="rounded-[14px] border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="text-[1.02rem] font-semibold tracking-[-0.01em] text-[var(--v2-ink)]">
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
                          className="v2-btn v2-btn--sm"
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

            <div className="mt-6 grid gap-4">
              {knowledgeSourceHierarchy.map((level) => (
                <div
                  key={level.label}
                  className="rounded-[14px] border border-[var(--v2-line)] bg-[var(--v2-paper)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill tone="accent">{level.label}</Pill>
                    <span className="text-[13px] text-[var(--v2-ink-soft)]">
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
                          className="v2-btn v2-btn--sm"
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
        </div>
      </main>
      <V2Footer />
    </>
  );
}
