"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BtnLink, Pill } from "@/components/ui";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { AppManifest } from "@/lib/app-types";
import {
  getProfileCompleteness,
  getRecommendedAppSlugsForProfile,
} from "@/lib/profile-recommendations";

type PersonalRouteProps = {
  apps: AppManifest[];
};

export function PersonalRoute({ apps }: PersonalRouteProps) {
  const { profile, hasProfile } = useUserProfile();
  const completeness = useMemo(() => getProfileCompleteness(profile), [profile]);
  const availableSlugs = useMemo(() => apps.map((app) => app.slug), [apps]);
  const recommendedSlugs = useMemo(
    () =>
      getRecommendedAppSlugsForProfile(profile, {
        availableSlugs,
        max: 3,
      }),
    [availableSlugs, profile],
  );
  const recommendedApps = useMemo(
    () =>
      recommendedSlugs
        .map((slug) => apps.find((app) => app.slug === slug))
        .filter((app): app is AppManifest => Boolean(app)),
    [apps, recommendedSlugs],
  );

  const needsMoreProfileInput = hasProfile && completeness.score < 35;

  return (
    <section className="grid gap-4 rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
      <div>
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
          Jouw snelle route
        </div>
        {!hasProfile ? (
          <>
            <h3 className="mt-2 font-serif text-[clamp(1.3rem,1.1rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
              Vul je profiel in om tools automatisch te laten voorinvullen
            </h3>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
              Nog geen profiel ingevuld? Geen probleem. Je kunt direct starten, of
              eerst basisgegevens invullen voor persoonlijkere startpunten.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <BtnLink href="/profiel" kind="outline" size="md">
                Open mijn profiel
              </BtnLink>
              <BtnLink href="/apps/volgende-euro" kind="ghost" size="md">
                Of start zonder profiel
              </BtnLink>
            </div>
          </>
        ) : (
          <>
            <h3 className="mt-2 font-serif text-[clamp(1.3rem,1.1rem+0.8vw,1.7rem)] tracking-[-0.02em] text-[var(--ink)]">
              Op basis van je ingevulde gegevens zijn dit logische startpunten
            </h3>
            <p className="mt-3 max-w-[62ch] text-[14px] leading-[1.65] text-[var(--ink-2)]">
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
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedApps.map((app) => (
                <article
                  key={app.slug}
                  className="rounded-xl border border-[var(--hair)] bg-white p-4"
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
