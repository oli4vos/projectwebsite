"use client";

import { useMemo, useState } from "react";
import type { AppManifest } from "@/lib/app-types";
import { V2AppCard } from "@/components/v2/V2AppCard";

type V2DashboardProps = {
  apps: AppManifest[];
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function V2Dashboard({ apps }: V2DashboardProps) {
  const publicApps = useMemo(
    () => apps.filter((app) => app.visibility !== "hidden"),
    [apps],
  );
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    return ["all", ...new Set(publicApps.map((app) => app.category))].sort((left, right) =>
      left.localeCompare(right, "nl"),
    );
  }, [publicApps]);

  const filteredApps = useMemo(() => {
    const normalizedQuery = normalize(query);

    return publicApps.filter((app) => {
      const matchesCategory = activeCategory === "all" || app.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        app.title,
        app.description,
        app.category,
        ...(app.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [activeCategory, publicApps, query]);

  return (
    <main id="main-content" className="v2-section">
      <div className="v2-container space-y-8">
        <section className="space-y-4">
          <div className="v2-kicker v2-kicker--blue">Tools</div>
          <div className="max-w-3xl">
            <h1>Alle tools in één rustig overzicht</h1>
            <p className="mt-4 text-[var(--v2-ink-soft)]">
              Zoek op vraag, categorie of tag. De registry blijft de enige bron
              van waarheid voor zichtbare tools.
            </p>
          </div>
        </section>

        <section className="grid gap-4 rounded-[16px] border border-[var(--v2-line)] bg-[var(--v2-white)] p-5 shadow-[var(--v2-shadow-card)] md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
          <label className="v2-search v2-field">
            <span className="v2-label">Zoek tool</span>
            <input
              className="v2-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Bijvoorbeeld: studieschuld, hypotheek, familiehulp"
              type="search"
            />
          </label>

          <div className="v2-field">
            <span className="v2-label">Resultaten</span>
            <div className="rounded-[8px] border border-[var(--v2-line)] bg-[var(--v2-paper)] px-4 py-3 text-[14px] text-[var(--v2-ink)]">
              {filteredApps.length} van {publicApps.length}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="v2-label">Filter op categorie</div>
          <div className="v2-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className="v2-chip"
              >
                {category === "all" ? "Alles" : category}
              </button>
            ))}
          </div>
        </section>

        {filteredApps.length > 0 ? (
          <section className="v2-grid v2-grid--3">
            {filteredApps.map((app) => (
              <V2AppCard key={app.slug} app={app} />
            ))}
          </section>
        ) : (
          <section className="v2-empty">
            <h3>Geen tools gevonden</h3>
            <p className="mt-2">
              Probeer een andere zoekterm of zet de categorie terug op alles.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
                className="v2-btn v2-btn--dark v2-btn--sm"
              >
                Filter wissen
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
