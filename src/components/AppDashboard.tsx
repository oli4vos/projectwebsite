"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { AppManifest } from "@/lib/app-types";
import { BtnLink } from "@/components/ui";
import { AppCard } from "./AppCard";
import { KnowledgeLevelSelector } from "./KnowledgeLevelSelector";
import { PersonalRoute } from "./PersonalRoute";

type AppDashboardProps = {
  apps: AppManifest[];
};

type AppGroup = {
  title: string;
  description: string;
  slugs: string[];
};

const groups: AppGroup[] = [
  {
    title: "Persoonlijke financiën",
    description: "Voor je eerste prioriteit als je extra geld overhoudt.",
    slugs: ["volgende-euro"],
  },
  {
    title: "Studieschuld",
    description: "Vergelijk verplicht aflossen, extra aflossen en alternatieven.",
    slugs: ["studieschuld-vs-beleggen", "hypotheek-impact-studieschuld"],
  },
  {
    title: "Wonen",
    description: "Inzicht in hypotheekkeuzes, maandlasten en extra aflossen.",
    slugs: [
      "hypotheek-impact-studieschuld",
      "hypotheek-aflossen-vs-beleggen",
      "annuitair-lineair",
    ],
  },
  {
    title: "Sparen & beleggen",
    description: "Voor vermogensopbouw met belastingimpact en flexibiliteit.",
    slugs: ["box-3-impact", "jaarruimte-vs-vrij-beleggen", "fire-na-belasting"],
  },
  {
    title: "Belasting",
    description: "Rekentools rond box 3 en fiscale afwegingen.",
    slugs: ["box-3-impact", "jaarruimte-vs-vrij-beleggen"],
  },
  {
    title: "FIRE / financiële vrijheid",
    description: "Langetermijnprojectie richting minder of niet meer hoeven werken.",
    slugs: ["fire-na-belasting"],
  },
  {
    title: "Werk & ZZP",
    description: "Inschatten welk uurtarief nodig is inclusief reserveringen.",
    slugs: ["zzp-uurtarief"],
  },
];

export function AppDashboard({ apps }: AppDashboardProps) {
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
      groups
        .map((group) => ({
          ...group,
          apps: group.slugs
            .map((slug) => appsBySlug[slug])
            .filter((app): app is AppManifest => Boolean(app)),
        }))
        .filter((group) => group.apps.length > 0),
    [appsBySlug],
  );

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
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groupedApps.map((group) => (
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
              <Link href={`#groep-${encodeURIComponent(group.title)}`} className="text-[12px] text-[var(--ink)] underline">
                Bekijk tools
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-6">
        {groupedApps.map((group) => (
          <section
            id={`groep-${encodeURIComponent(group.title)}`}
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

      <PersonalRoute apps={apps} />

      <section className="grid gap-4 rounded-[1.5rem] border hair bg-white p-6 shadow-paper md:grid-cols-2">
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
