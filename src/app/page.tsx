import { AppDashboard } from "@/components/AppDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink } from "@/components/ui";
import { appRegistry } from "@/lib/app-registry";
import { ENABLE_PROFILE } from "@/lib/feature-flags";

export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <section className="hair-b pb-8">
          <div className="max-w-4xl pt-2">
            <div className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Toolbibliotheek
            </div>
            <h1
              className="text-fluid-h1 mt-4 font-serif tracking-[-0.03em] text-[var(--ink)]"
              style={{ textWrap: "balance" }}
            >
              Financiële rekentools voor slimme keuzes
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[64ch] leading-[1.7] text-[var(--ink-2)]">
              Vergelijk sparen, beleggen, aflossen, pensioen, wonen, belasting en werk. Eerst simpel invullen, daarna kun je de verdieping openklappen.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <BtnLink href="#apps" kind="primary" size="md">
                Bekijk rekentools
              </BtnLink>
              {ENABLE_PROFILE ? (
                <BtnLink href="/profiel" kind="outline" size="md">
                  Vul profiel in
                </BtnLink>
              ) : null}
              <BtnLink href="/kennisbank" kind="outline" size="md">
                Lees kennisbank
              </BtnLink>
              <BtnLink href="/variabelen" kind="ghost" size="md">
                Bekijk aannames
              </BtnLink>
            </div>
          </div>
        </section>

        <section className="pt-8">
          <AppDashboard apps={appRegistry} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
