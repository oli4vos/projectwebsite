"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AppManifest } from "@/lib/app-types";
import { toAnchorId } from "@/lib/anchor-ids";
import { ENABLE_PROFILE } from "@/lib/feature-flags";
import { toolGroups } from "@/lib/tool-groups";
import { BtnLink } from "@/components/ui";
import { AppCard } from "./AppCard";
import { KnowledgeLevelSelector } from "./KnowledgeLevelSelector";
import { PersonalRoute } from "./PersonalRoute";

type AppDashboardProps = {
  apps: AppManifest[];
};

type AudiencePreset = {
  id: string;
  label: string;
  groups: string[];
};

const audiencePresets: AudiencePreset[] = [
  { id: "all", label: "Alles", groups: [] },
  {
    id: "oud-student",
    label: "Oud-student",
    groups: ["Studieschuld", "Wonen", "Persoonlijke financiën"],
  },
  {
    id: "zzp",
    label: "ZZP",
    groups: ["Werk & ZZP", "Belasting", "Persoonlijke financiën"],
  },
  {
    id: "pensioen",
    label: "Richting pensioen",
    groups: ["Sparen & beleggen", "Belasting", "FIRE / financiële vrijheid"],
  },
  {
    id: "beleggen",
    label: "Beleggen algemeen",
    groups: ["Sparen & beleggen", "Belasting", "FIRE / financiële vrijheid"],
  },
];

export function AppDashboard({ apps }: AppDashboardProps) {
  const [activeAudience, setActiveAudience] = useState<string>("all");
  const appsBySlug = useMemo(
    () =>
      Object.fromEntries(apps.map((app) => [app.slug, app])) as Record<
        string,
        AppManifest
      >,
    [apps],
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
    if (activeAudience === "all") {
      return groupedApps;
    }
    const preset = audiencePresets.find((item) => item.id === activeAudience);
    if (!preset) {
      return groupedApps;
    }
    return groupedApps.filter((group) => preset.groups.includes(group.title));
  }, [activeAudience, groupedApps]);

  return (
    <div className="space-y-8">
      <KnowledgeLevelSelector />

      <section id="apps" className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Kies een onderwerp
        </div>
        <h2 className="mt-2 font-serif text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] tracking-[-0.02em] text-[var(--ink)]">
          Rekentools per onderwerp
        </h2>
        <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
          Eerst invullen, daarna resultaat. Verdieping staat standaard dicht en open je alleen als je meer uitleg wilt.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {audiencePresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setActiveAudience(preset.id)}
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
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredGroupedApps.map((group) => (
          <article key={group.title} className="rounded-xl border hair bg-white p-4 shadow-paper">
            <h3 className="font-serif text-[1.2rem] tracking-[-0.01em] text-[var(--ink)]">
              {group.title}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
              {group.description}
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
                  {group.description}
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
          <PersonalRoute apps={apps} />
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
          <div className="mt-3">
            <BtnLink href="/variabelen" kind="outline" size="md">
              Naar aannames
            </BtnLink>
          </div>
        </div>
      </section>
    </div>
  );
}
