"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AppManifest } from "@/lib/app-types";
import { toolGroups } from "@/lib/tool-groups";
import {
  filterGroupsForAudience,
  getAudienceRoute,
  visibleAudienceRoutes,
} from "@/lib/audience-routes";

type V2AppDashboardProps = {
  apps: AppManifest[];
};

export function V2AppDashboard({ apps }: V2AppDashboardProps) {
  const [activeAudience, setActiveAudience] = useState<string>("starter-studieschuld");
  const [searchTerm, setSearchTerm] = useState("");

  const primaryApps = useMemo(
    () => apps.filter((app) => !app.tags.includes("artifact-import")),
    [apps]
  );

  const appsBySlug = useMemo(
    () =>
      Object.fromEntries(primaryApps.map((app) => [app.slug, app])) as Record<
        string,
        AppManifest
      >,
    [primaryApps]
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
    [appsBySlug]
  );

  const filteredGroupedApps = useMemo(() => {
    return filterGroupsForAudience(groupedApps, activeAudience);
  }, [activeAudience, groupedApps]);

  const searchFilteredApps = useMemo(() => {
    if (!searchTerm.trim()) return filteredGroupedApps;

    const term = searchTerm.toLowerCase();
    return filteredGroupedApps
      .map((group) => ({
        ...group,
        apps: group.apps.filter(
          (app) =>
            app.title.toLowerCase().includes(term) ||
            app.description.toLowerCase().includes(term) ||
            app.tags.some((tag) => tag.toLowerCase().includes(term))
        ),
      }))
      .filter((group) => group.apps.length > 0);
  }, [filteredGroupedApps, searchTerm]);

  const activeAudiencePreset = useMemo(
    () => getAudienceRoute(activeAudience),
    [activeAudience]
  );

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="bg-gradient-to-b from-[var(--v2-bg-soft)] to-[var(--v2-bg)] py-12">
        <div className="v2-container">
          <p className="v2-eyebrow mb-2">Alle tools</p>
          <h1 className="v2-h2 mb-4">Vind je volgende stap</h1>
          <p className="v2-body-lg max-w-2xl text-[var(--v2-text-secondary)]">
            Kies een onderwerp of zoek naar een specifieke tool. Elke tool helpt je één vraag te beantwoorden.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <div className="v2-container">
        <div className="grid gap-6 mb-8">
          {/* Search */}
          <div>
            <label htmlFor="search" className="v2-eyebrow block mb-2">
              Zoeken
            </label>
            <input
              id="search"
              type="text"
              placeholder="Zoek een tool of onderwerp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="v2-input w-full"
            />
          </div>

          {/* Audience Filter */}
          <div>
            <p className="v2-eyebrow mb-2">Of kies je situatie</p>
            <div className="flex flex-wrap gap-2">
              {visibleAudienceRoutes.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setActiveAudience(preset.id)}
                  className={`px-4 py-2 rounded-full text-sm font-serif transition-all ${
                    activeAudience === preset.id
                      ? "bg-[var(--v2-sage)] text-white shadow-md"
                      : "bg-[var(--v2-bg-soft)] text-[var(--v2-text-secondary)] hover:bg-[var(--v2-bg-overlay)]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {activeAudiencePreset && (
              <p className="v2-body-lg mt-4 p-4 bg-[var(--v2-bg-soft)] rounded-lg border border-[var(--v2-sage)]/10">
                <strong>Jouw volgende stap:</strong> {activeAudiencePreset.userQuestion}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* App Groups */}
      <div className="v2-container">
        {searchFilteredApps.length === 0 ? (
          <div className="text-center py-12">
            <p className="v2-h3 mb-2">Geen tools gevonden</p>
            <p className="v2-body text-[var(--v2-text-muted)]">
              Probeer andere zoektermen of kies een ander onderwerp.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {searchFilteredApps.map((group) => (
              <section key={group.title}>
                <div className="mb-6">
                  <h2 className="v2-h2 mb-2">{group.title}</h2>
                  <p className="v2-body text-[var(--v2-text-muted)]">{group.description}</p>
                </div>
                <div className="v2-grid v2-grid-cols-3">
                  {group.apps.map((app) => (
                    <Link key={app.slug} href={`/v2/apps/${app.slug}`}>
                      <article className="v2-card h-full cursor-pointer group">
                        <div className="flex flex-col h-full">
                          <div className="mb-4">
                            <p className="v2-eyebrow">{group.title}</p>
                          </div>
                          <h3 className="v2-h3 mb-3 group-hover:text-[var(--v2-sage)] transition">
                            {app.title}
                          </h3>
                          <p className="v2-body text-[var(--v2-text-secondary)] mb-4 flex-grow">
                            {app.description}
                          </p>
                          <div className="flex items-center text-[var(--v2-sage)] group-hover:translate-x-1 transition">
                            <span className="v2-small font-serif">Open tool</span>
                            <span className="ml-2">→</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <section className="v2-section bg-[var(--v2-bg-soft)]">
        <div className="v2-container grid v2-grid-cols-2 gap-8">
          <div>
            <p className="v2-eyebrow mb-2">Controleer aannames</p>
            <p className="v2-body-lg mb-4">
              Wil je weten met welke percentages en normen we rekenen? Bekijk alle aannames en hun bronnen.
            </p>
            <Link href="/variabelen" className="v2-link">
              → Naar aannames
            </Link>
          </div>
          <div>
            <p className="v2-eyebrow mb-2">Meer context</p>
            <p className="v2-body-lg mb-4">
              Lees meer over studieschuld, hypotheken, belastingen en alles wat je moet weten.
            </p>
            <Link href="/kennisbank" className="v2-link">
              → Naar kennisbank
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
