"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { AppManifest } from "@/lib/app-types";
import { BtnLink } from "@/components/ui";
import { AppCard } from "./AppCard";
import { PersonalRoute } from "./PersonalRoute";

type AppDashboardProps = {
  apps: AppManifest[];
};

type AppGroup = {
  title: string;
  description: string;
  slugs: string[];
};

const requestedGroups: AppGroup[] = [
  {
    title: "Start hier",
    description:
      "Begin met een brede keuzehulp als je twijfelt tussen aflossen, sparen, beleggen of pensioen.",
    slugs: ["volgende-euro"],
  },
  {
    title: "Studieschuld",
    description:
      "Voor DUO-verplichting, vrijwillige extra aflossing en impact op je andere keuzes.",
    slugs: ["studieschuld-vs-beleggen", "hypotheek-impact-studieschuld"],
  },
  {
    title: "Wonen",
    description:
      "Voor hypotheekruimte, extra aflossen of beleggen, en vergelijking van hypotheekvormen.",
    slugs: [
      "hypotheek-impact-studieschuld",
      "hypotheek-aflossen-vs-beleggen",
      "annuitair-lineair",
    ],
  },
  {
    title: "Sparen & beleggen",
    description:
      "Voor vermogensgroei, pensioeninleg versus vrij beleggen, en lange termijn FIRE-scenario's.",
    slugs: ["box-3-impact", "jaarruimte-vs-vrij-beleggen", "fire-na-belasting"],
  },
  {
    title: "Belasting",
    description:
      "Voor box 3-effecten en fiscale afwegingen rond pensioeninleg en beleggen.",
    slugs: ["box-3-impact", "jaarruimte-vs-vrij-beleggen"],
  },
  {
    title: "Werk & ZZP",
    description:
      "Voor inschatting van benodigd uurtarief inclusief buffer, pensioen en AOV-reservering.",
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
  const nextEuroApp = appsBySlug["volgende-euro"];

  const groups = useMemo(() => {
    const seen = new Set<string>();
    const resolved = requestedGroups
      .map((group) => {
        const groupApps = group.slugs
          .map((slug) => appsBySlug[slug])
          .filter((app): app is AppManifest => Boolean(app) && !seen.has(app.slug))
          .map((app) => {
            seen.add(app.slug);
            return app;
          });

        return {
          ...group,
          apps: groupApps,
        };
      })
      .filter((group) => group.apps.length > 0);

    const remainingApps = apps.filter((app) => !seen.has(app.slug));

    if (remainingApps.length > 0) {
      resolved.push({
        title: "Meer tools",
        description: "Extra rekentools die ook publiek beschikbaar zijn.",
        slugs: [],
        apps: remainingApps,
      });
    }

    return resolved;
  }, [apps, appsBySlug]);

  return (
    <div className="space-y-8">
      <section
        id="apps"
        className="grid gap-5 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Startpunt
          </div>
          <h2 className="text-fluid-h2 mt-2 font-serif tracking-[-0.02em] text-[var(--ink)]">
            Weet je niet waar je moet beginnen?
          </h2>
          <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
            Begin met één keuzehulp en ontdek waar je volgende euro het meest logisch
            naartoe kan: buffer, aflossen, pensioen, woning of beleggen.
          </p>
        </div>
        {nextEuroApp ? (
          <div className="rounded-xl border border-[var(--hair)] bg-white p-4">
            <div className="text-[13px] leading-[1.7] text-[var(--muted)]">
              Ontdek of je volgende euro logischer naar buffer, aflossen, pensioen,
              woning of beleggen kan.
            </div>
            <div className="mt-4">
              <BtnLink href={`/apps/${nextEuroApp.slug}`} kind="primary" size="md">
                Start met de keuzehulp
              </BtnLink>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[var(--hair)] bg-white p-4 text-[13px] leading-[1.7] text-[var(--muted)]">
            De keuzehulp is tijdelijk niet beschikbaar. Start hieronder met een thema.
          </div>
        )}
      </section>

      <section className="grid gap-4 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Mijn profiel
          </div>
          <h3 className="mt-2 font-serif text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] tracking-[-0.02em] text-[var(--ink)]">
            Maak berekeningen persoonlijker
          </h3>
          <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
            Vul één keer je basisgegevens in. Tools kunnen die waarden daarna
            gebruiken als voorinvulling. Je profiel is optioneel en blijft lokaal in
            je browser.
          </p>
        </div>
        <BtnLink href="/profiel" kind="outline" size="md">
          Open profiel
        </BtnLink>
      </section>

      <PersonalRoute apps={apps} />

      <section id="scenario" className="space-y-6">
        <div className="rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Kies een onderwerp
          </div>
          <h3 className="mt-2 font-serif text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] tracking-[-0.02em] text-[var(--ink)]">
            Kies de keuzehulp die past bij je vraag
          </h3>
          <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
            Geen losse lijst met calculators, maar een overzicht in thema&apos;s. Zo
            houd je het rustig en kom je sneller bij de juiste keuzevraag.
          </p>
        </div>

        {groups.map((group) => (
          <section
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

      <section
        id="werkwijze"
        className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg"
      >
        <div className="text-[11px] uppercase tracking-[0.14em] text-white/55">
          Aannames
        </div>
        <h3 className="mt-3 font-serif text-[clamp(1.35rem,1.1rem+1vw,1.9rem)] leading-[1.12] tracking-[-0.02em]">
          Wil je weten met welke percentages en aannames we rekenen?
        </h3>
        <p className="mt-4 max-w-[60ch] text-[14px] leading-[1.7] text-white/75">
          Bekijk alle gebruikte variabelen op één plek. Zo kun je uitkomsten beter
          controleren en scenario&apos;s aanpassen op je eigen aannames.
        </p>
        <div className="mt-5">
          <BtnLink href="/variabelen" kind="outline" size="md">
            Bekijk aannames en variabelen
          </BtnLink>
        </div>
      </section>

      <section className="rounded-[1.5rem] border hair bg-white/80 p-6 text-[13.5px] leading-[1.65] text-[var(--muted)] shadow-paper">
        <p>
          Twijfel je nog tussen meerdere richtingen? Begin met{" "}
          {nextEuroApp ? (
            <Link href={`/apps/${nextEuroApp.slug}`} className="text-[var(--ink)] underline">
              de keuzehulp
            </Link>
          ) : (
            "de toolgroep Start hier"
          )}{" "}
          en ga daarna pas de verdieping in per thema.
        </p>
      </section>
    </div>
  );
}
