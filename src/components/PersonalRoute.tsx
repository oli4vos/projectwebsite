"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BtnLink, Pill } from "@/components/ui";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { AppManifest } from "@/lib/app-types";
import {
  getProfileCompleteness,
  getRecommendedAppsForProfile,
} from "@/lib/profile-recommendations";

type PersonalRouteProps = {
  apps: AppManifest[];
};

export function PersonalRoute({ apps }: PersonalRouteProps) {
  const { profile, hasProfile } = useUserProfile();
  const completeness = useMemo(() => getProfileCompleteness(profile), [profile]);
  const availableSlugs = useMemo(() => apps.map((app) => app.slug), [apps]);
  const recommendations = useMemo(
    () =>
      getRecommendedAppsForProfile(profile, {
        availableSlugs,
        apps,
        max: 3,
      }),
    [apps, availableSlugs, profile],
  );
  const recommendedApps = useMemo(
    () =>
      recommendations
        .map((recommendation) => {
          const app = apps.find((candidate) => candidate.slug === recommendation.slug);
          if (!app) {
            return null;
          }
          return { app, reason: recommendation.reason };
        })
        .filter((item): item is { app: AppManifest; reason: string } => Boolean(item)),
    [apps, recommendations],
  );

  const needsMoreProfileInput = hasProfile && completeness.score < 35;

  return (
    <section className="grid gap-4 rounded-[1.5rem] border hair bg-white/70 p-5 shadow-paper">
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Jouw snelle route
        </div>
        {!hasProfile ? (
          <>
            <h3 className="mt-2 font-serif text-[clamp(1.15rem,1rem+0.6vw,1.45rem)] tracking-[-0.02em] text-[var(--ink)]">
              Heb je een profiel ingevuld?
            </h3>
            <p className="mt-2 max-w-[62ch] text-[13px] leading-[1.6] text-[var(--ink-2)]">
              Zonder profiel kun je direct starten. Met profiel krijg je compactere snelle startpunten.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <BtnLink href="/profiel" kind="outline" size="sm">
                Open mijn profiel
              </BtnLink>
              <BtnLink href="/apps/volgende-euro" kind="ghost" size="sm">
                Of start zonder profiel
              </BtnLink>
            </div>
          </>
        ) : (
          <>
            <h3 className="mt-2 font-serif text-[clamp(1.15rem,1rem+0.6vw,1.45rem)] tracking-[-0.02em] text-[var(--ink)]">
              Op basis van je ingevulde gegevens zijn dit logische startpunten
            </h3>
            <p className="mt-2 max-w-[62ch] text-[13px] leading-[1.6] text-[var(--ink-2)]">
              Dit zijn geen adviezen, maar handige startpunten op basis van je profiel.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Pill>Profielscore: {completeness.score}%</Pill>
              {completeness.usefulSections.map((section) => (
                <Pill key={section}>{section}</Pill>
              ))}
            </div>
          </>
        )}
      </div>

      {hasProfile ? (
        <>
          {recommendedApps.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-3">
              {recommendedApps.map(({ app, reason }) => (
                <article
                  key={app.slug}
                  className="rounded-xl border border-[var(--hair)] bg-white p-3"
                >
                  <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                    {app.category}
                  </div>
                  <h4 className="mt-2 text-[15px] font-medium text-[var(--ink)]">
                    {app.title}
                  </h4>
                  <p className="mt-2 text-[13px] leading-[1.6] text-[var(--muted)]">
                    {app.description}
                  </p>
                  <div className="mt-3 rounded-lg bg-[var(--paper-soft)] px-3 py-2">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--soft)]">
                      Waarom deze?
                    </p>
                    <p className="mt-1 text-[12.5px] leading-[1.55] text-[var(--muted)]">
                      {reason}
                    </p>
                  </div>
                  <div className="mt-3">
                    <BtnLink href={`/apps/${app.slug}`} kind="ghost" size="sm">
                      Open tool
                    </BtnLink>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {needsMoreProfileInput ? (
            <div className="rounded-xl border border-[var(--hair)] bg-[var(--paper-soft)] px-4 py-3 text-[13px] leading-[1.65] text-[var(--muted)]">
              Je profiel is nog beperkt ingevuld. Wil je scherpere startpunten?{" "}
              <Link href="/profiel" className="text-[var(--ink)] underline">
                Vul je profiel verder aan
              </Link>
              .
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
