"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import type { AppManifest } from "@/lib/app-types";
import { CategoryDot } from "@/components/ui";
import { resolveCategory } from "@/lib/categories";
import { AppCard } from "./AppCard";

type AppDashboardProps = {
  apps: AppManifest[];
};

export function AppDashboard({ apps }: AppDashboardProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const deferredQuery = useDeferredValue(query);

  const categories = ["Alle", ...new Set(apps.map((app) => app.category))];
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const filteredApps = apps.filter((app) => {
    const matchesCategory =
      selectedCategory === "Alle" || app.category === selectedCategory;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      [app.title, app.description, app.category, ...app.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    return matchesCategory && matchesQuery;
  });

  const recentExamples = [
    {
      slug: "studieschuld-vs-beleggen",
      title: "Aflossen of beleggen bij 2,56% DUO-rente",
      meta: "€ 150 / mnd · 10 jaar · scenariovergelijking",
      when: "vandaag",
      result: "€ 4.283 verschil",
      category: resolveCategory("Schulden", "studieschuld-vs-beleggen"),
    },
    {
      slug: "studieschuld-vs-beleggen",
      title: "Wat verandert er bij hogere maandinleg?",
      meta: "€ 300 / mnd · 15 jaar · zelfde aannames",
      when: "voorbeeld",
      result: "meer grip op tempo",
      category: resolveCategory("Schulden", "studieschuld-vs-beleggen"),
    },
  ];

  return (
    <div className="space-y-8">
      <section
        id="apps"
        className="grid gap-4 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
      >
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            Overzicht
          </div>
          <h2 className="mt-2 font-serif text-[30px] tracking-[-0.02em] text-[var(--ink)]">
            Kies het scenario waar je nu regie op wilt
          </h2>
          <p className="mt-3 max-w-[58ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
            Zoek op onderwerp of filter op categorie. Elke tool gebruikt heldere
            aannames en is bedoeld om keuzes vergelijkbaar te maken, niet om ze voor
            je te maken.
          </p>
        </div>

        <div className="text-[12px] text-[var(--muted)]">
          {filteredApps.length} van {apps.length} rekentools zichtbaar
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper md:grid-cols-[minmax(0,1fr)_280px] md:items-end">
        <label className="grid gap-2">
          <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
            Zoek op titel, thema of tag
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Bijvoorbeeld: studieschuld, beleggen of hypotheek"
            className="ring-focus hair h-12 rounded-full border bg-white px-4 text-[14px] text-[var(--ink)] outline-none"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[12px] uppercase tracking-[0.04em] text-[var(--muted)]">
            Categorie
          </span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="ring-focus hair h-12 rounded-full border bg-white px-4 text-[14px] text-[var(--ink)] outline-none"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-3 py-2 text-[13px] transition ${
              selectedCategory === category
                ? "bg-[var(--deep)] text-[var(--paper)]"
                : "hair border bg-white text-[var(--muted)] hover:text-[var(--ink)]"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredApps.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredApps.map((app) => (
            <AppCard key={app.slug} app={app} />
          ))}
        </div>
      ) : (
        <section className="rounded-[1.5rem] border border-dashed hair bg-white/60 p-10 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
            Geen rekentools gevonden
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
            Pas je zoekterm of categorie aan om weer bruikbare scenario&apos;s en keuzes
            in beeld te krijgen.
          </p>
        </section>
      )}

      <section id="scenario" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.5rem] border hair bg-white p-6 shadow-paper">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-serif text-[22px] tracking-[-0.015em] text-[var(--ink)]">
              Voorbeeldscenario&apos;s
            </h3>
            <span className="text-[12px] text-[var(--muted)]">
              Herkenbaar, maar altijd aanpasbaar naar je eigen situatie
            </span>
          </div>
          <div className="mt-4">
            {recentExamples.map((example) => (
              <Link
                key={example.title}
                href={`/apps/${example.slug}`}
                className="hair-b grid grid-cols-[minmax(0,1fr)_auto] gap-4 py-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <CategoryDot cat={example.category} />
                    <span className="text-[12px] text-[var(--soft)]">{example.when}</span>
                  </div>
                  <div className="mt-2 text-[14px] tracking-[-0.005em] text-[var(--ink)]">
                    {example.title}
                  </div>
                  <div className="mt-1 text-[12px] text-[var(--muted)] tabular">
                    {example.meta}
                  </div>
                </div>
                <div className="self-center font-mono text-[13px] tabular text-[var(--ink-2)]">
                  {example.result}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div
          id="werkwijze"
          className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-[var(--paper)] shadow-paper-lg"
        >
          <div className="text-[11px] uppercase tracking-[0.14em] text-white/55">
            Werkwijze
          </div>
          <h3 className="mt-3 font-serif text-[24px] leading-[1.12] tracking-[-0.02em]">
            Geen black box. Wel betere uitgangspunten.
          </h3>
          <p className="mt-4 text-[14px] leading-[1.7] text-white/75">
            Niet iedereen begon met veel marge. Juist dan helpt het om aannames
            zichtbaar te maken, scenario&apos;s naast elkaar te zetten en keuzes stap
            voor stap terug te brengen tot iets waar je zelf weer grip op hebt.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
            {[
              ["1", "voorbeeldtool"],
              ["4", "kernuitkomsten"],
              ["100%", "lokaal in de browser"],
            ].map(([number, label]) => (
              <div key={label}>
                <div className="font-serif text-[24px] leading-none">{number}</div>
                <div className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-white/55">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
