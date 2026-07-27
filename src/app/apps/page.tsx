import type { Metadata } from "next";
import { AppDashboard } from "@/components/AppDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { appRegistry } from "@/lib/app-registry";

export const metadata: Metadata = {
  title: "Alle tools | Project Site",
  description:
    "Overzicht van alle publieke tools voor studieschuld, wonen, schulden en toeslagen.",
};

export default function AppsPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <section className="pb-8">
          <div className="section-label">Tooloverzicht</div>
          <h1 className="text-fluid-h1 mt-4 max-w-[13ch] font-serif tracking-[-0.03em] text-[var(--ink)]">
            Alle tools.
          </h1>
          <p className="text-fluid-lead mt-5 max-w-[58ch] leading-[1.75] text-[var(--ink-2)]">
            Kies het hulpmiddel dat past bij je vraag. Je rekent direct in je browser.
          </p>
        </section>
        <AppDashboard apps={appRegistry} />
      </main>
      <SiteFooter />
    </>
  );
}
