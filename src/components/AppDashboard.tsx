"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";
import {
  filterGroupsForAudience,
  getAudienceRoute,
  getAudienceRouteAnchorId,
  getAudienceRouteApps,
  visibleAudienceRoutes,
} from "@/lib/audience-routes";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import { toolGroups } from "@/lib/tool-groups";
import { BtnLink } from "@/components/ui";
import { AppCard } from "./AppCard";
import { GlossaryText } from "./GlossaryText";
import { KnowledgeLevelSelector } from "./KnowledgeLevelSelector";
import { PersonalRoute } from "./PersonalRoute";

type AppDashboardProps = {
  apps: AppManifest[];
};

function isArtifactImportedApp(app: AppManifest) {
  return app.tags.includes("artifact-import");
}

export function AppDashboard({ apps }: AppDashboardProps) {
  const [activeAudience, setActiveAudience] = useState<string>("starter-studieschuld");
  const artifactApps = useMemo(
    () => apps.filter(isArtifactImportedApp),
    [apps],
  );
  const artifactGroups = useMemo(() => {
    const groups = new Map<string, AppManifest[]>();

    for (const app of artifactApps) {
      const categoryLabel = app.category.startsWith("Artifacts · ")
        ? app.category.replace("Artifacts · ", "")
        : app.category;
      const existing = groups.get(categoryLabel) ?? [];
      existing.push(app);
      groups.set(categoryLabel, existing);
    }

    return [...groups.entries()]
      .map(([category, groupedApps]) => ({
        category,
        apps: [...groupedApps].sort((left, right) =>
          left.title.localeCompare(right.title),
        ),
      }))
      .sort((left, right) => left.category.localeCompare(right.category));
  }, [artifactApps]);
  const primaryApps = useMemo(
    () => apps.filter((app) => !isArtifactImportedApp(app)),
    [apps],
  );
  const appsBySlug = useMemo(
    () =>
      Object.fromEntries(primaryApps.map((app) => [app.slug, app])) as Record<
        string,
        AppManifest
      >,
    [primaryApps],
  );

  const groupedApps = useMemo(
    () =>
      toolGroups
        .map((group) => ({
          ...group,
          apps: group.slugs
            .map((slug) => appsBySlug[slug])
            .filter((app): app is AppManifest => Boolean(app)),
        }))
        .filter((group) => group.apps.length > 0),
    [appsBySlug],
  );

  const filteredGroupedApps = useMemo(() => {
    return filterGroupsForAudience(groupedApps, activeAudience);
  }, [activeAudience, groupedApps]);

  const activeAudiencePreset = useMemo(
    () => getAudienceRoute(activeAudience),
    [activeAudience],
  );

  const recommendedRouteApps = useMemo(
    () => getAudienceRouteApps(activeAudience, primaryApps),
    [activeAudience, primaryApps],
  );

  function applyAudienceFilter(nextAudienceId: string) {
    setActiveAudience(nextAudienceId);

    const targetId = getAudienceRouteAnchorId(nextAudienceId);

    requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-8">
      <KnowledgeLevelSelector />

      <section id="apps" className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Stap voor stap
        </div>
        <h2 className="mt-2 font-serif text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] tracking-[-0.02em] text-[var(--ink)]">
          Begin klein. Open pas meer als je eraan toe bent.
        </h2>
        <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
          Je hoeft niet meteen alle cijfers te weten. Kies eerst je situatie, vul
          alleen de velden in die nodig zijn en klap de uitleg open wanneer je meer
          wilt begrijpen.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
            <div className="text-[12px] font-medium text-[var(--ink)]">1. Begrijp DUO</div>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--muted)]">
              Wat betaal je, wat blijft over en wat blokkeert dat?
            </p>
          </div>
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
            <div className="text-[12px] font-medium text-[var(--ink)]">2. Kies met extra geld</div>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--muted)]">
              Aflossen, buffer, sparen of beleggen naast elkaar.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] p-4">
            <div className="text-[12px] font-medium text-[var(--ink)]">3. Ga naar wonen</div>
            <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--muted)]">
              Pas daarna hypotheek, familiehulp en schenking.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {visibleAudienceRoutes.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyAudienceFilter(preset.id)}
              className={`rounded-full border px-3 py-1.5 text-[12px] transition ${
                activeAudience === preset.id
                  ? "border-[var(--ink)] bg-[var(--deep)] text-white"
                  : "border-[var(--hair)] bg-white text-[var(--ink)] hover:bg-[var(--paper-soft)]"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl border hair bg-[var(--paper)] p-4">
          <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
            Jouw volgende vraag
          </div>
          <p className="mt-2 text-[14px] font-medium leading-[1.55] text-[var(--ink)]">
            {activeAudiencePreset.userQuestion}
          </p>
          <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
            <GlossaryText text={activeAudiencePreset.summary} />
          </p>
          <p className="mt-2 text-[12.5px] leading-[1.55] text-[var(--soft)]">
            <GlossaryText text={activeAudiencePreset.researchSignal} />
          </p>
          {recommendedRouteApps.length > 0 ? (
            <div className="mt-4 grid gap-2 md:grid-cols-3">
              {recommendedRouteApps.map((app) => (
                <Link
                  key={app.slug}
                  href={`/apps/${app.slug}`}
                  className="group rounded-lg border hair bg-white p-3 transition hover:-translate-y-px hover:shadow-paper focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 active:translate-y-0"
                >
                  <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--soft)]">
                    Startpunt
                  </div>
                  <div className="mt-1 text-[13px] font-medium leading-[1.35] text-[var(--ink)]">
                    {app.title}
                  </div>
                  <div className="mt-2 text-[12px] text-[var(--muted)] transition group-hover:text-[var(--ink)]">
                    Open tool →
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
          {activeAudiencePreset.futureOpportunity ? (
            <p className="mt-3 text-[12.5px] leading-[1.55] text-[var(--muted)]">
              <GlossaryText text={activeAudiencePreset.futureOpportunity} />
            </p>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredGroupedApps.map((group) => (
          <article key={group.title} className="rounded-xl border hair bg-white p-4 shadow-paper">
            <h3 className="font-serif text-[1.2rem] tracking-[-0.01em] text-[var(--ink)]">
              {group.title}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
              <GlossaryText text={group.description} />
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] text-[var(--soft)]">
                {group.apps.length} {group.apps.length === 1 ? "tool" : "tools"}
              </span>
              <Link
                href={`#${toAnchorId(group.title, "groep")}`}
                className="text-[12px] text-[var(--ink)] underline"
              >
                Bekijk tools
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        {filteredGroupedApps.map((group) => (
          <section
            id={toAnchorId(group.title, "groep")}
            key={group.title}
            className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-serif text-[clamp(1.2rem,1.05rem+0.7vw,1.5rem)] tracking-[-0.015em] text-[var(--ink)]">
                  {group.title}
                </h4>
                <p className="mt-2 max-w-[60ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
                  <GlossaryText text={group.description} />
                </p>
              </div>
              <span className="text-[12px] text-[var(--soft)]">
                {group.apps.length} {group.apps.length === 1 ? "tool" : "tools"}
              </span>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {group.apps.map((app) => (
                <AppCard key={app.slug} app={app} />
              ))}
            </div>
          </section>
        ))}
      </section>

      {ENABLE_PROFILE ? (
        <section id="persoonlijk">
          <PersonalRoute apps={primaryApps} />
        </section>
      ) : null}

      {artifactApps.length > 0 ? (
        <section
          id="apps-artifacts"
          className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper"
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Aparte categorie
          </div>
          <h4 className="mt-2 font-serif text-[clamp(1.2rem,1.05rem+0.7vw,1.5rem)] tracking-[-0.015em] text-[var(--ink)]">
            Artifacts tools (invulbladen)
          </h4>
          <p className="mt-2 max-w-[70ch] text-[13.5px] leading-[1.65] text-[var(--muted)]">
            Deze tools komen rechtstreeks uit ingevulde artifacts en staan bewust
            los van de reguliere toolgroepen.
          </p>
          <div className="mt-5 space-y-5">
            {artifactGroups.map((group) => (
              <section
                key={group.category}
                className="rounded-xl border border-[var(--hair)] bg-[var(--paper)]/45 p-4"
              >
                <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--soft)]">
                  Artifact-categorie
                </div>
                <h5 className="mt-1 font-serif text-[1.05rem] tracking-[-0.01em] text-[var(--ink)]">
                  {group.category}
                </h5>
                <div className="mt-3 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {group.apps.map((app) => (
                    <AppCard key={app.slug} app={app} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="aannames"
        className={`grid gap-4 rounded-[1.5rem] border hair bg-white p-6 shadow-paper ${
          ENABLE_PROFILE ? "md:grid-cols-2" : ""
        }`}
      >
        {ENABLE_PROFILE ? (
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              Maak het persoonlijker
            </div>
            <p className="mt-2 text-[14px] leading-[1.65] text-[var(--ink-2)]">
              Profiel is optioneel en blijft lokaal in je browser. Tools kunnen daarmee velden voorinvullen.
            </p>
            <div className="mt-3">
              <BtnLink href="/profiel" kind="outline" size="md">
                Naar profiel
              </BtnLink>
            </div>
          </div>
        ) : null}
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Controleer aannames
          </div>
          <p className="mt-2 text-[14px] leading-[1.65] text-[var(--ink-2)]">
            Bekijk met welke percentages en standaardwaarden de site rekent.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <BtnLink href="/variabelen" kind="outline" size="md">
              Naar aannames
            </BtnLink>
            <BtnLink href="/kennisbank" kind="outline" size="md">
              Naar kennisbank
            </BtnLink>
          </div>
        </div>
      </section>
    </div>
  );
}
