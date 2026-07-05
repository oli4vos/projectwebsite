import { Suspense } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink, Pill } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main
        id="main-content"
        className="mx-auto flex min-h-[72dvh] max-w-7xl items-center px-5 py-10 sm:px-8 lg:px-10"
      >
        <section className="grid w-full gap-6 rounded-[1.75rem] border hair bg-white/88 p-8 shadow-paper lg:grid-cols-[minmax(0,1fr)_280px] lg:p-10">
          <div>
            <Pill tone="accent">Pagina niet gevonden</Pill>
            <h1 className="mt-5 max-w-3xl font-serif text-[40px] leading-[1.05] tracking-[-0.03em] text-[var(--ink)] sm:text-[54px]">
              Deze route geeft nu geen grip, maar je zit niet vast.
            </h1>
            <p className="mt-5 max-w-[60ch] text-[15px] leading-[1.7] text-[var(--ink-2)]">
              De pagina die je zoekt bestaat niet of is verplaatst. Ga terug naar het
              dashboard en kies daar een scenario dat wel beschikbaar is.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <BtnLink href="/" kind="primary" size="md">
                Terug naar dashboard
              </BtnLink>
              <BtnLink href="/apps/duo-maandbedrag" kind="outline" size="md">
                Bereken DUO-maandbedrag
              </BtnLink>
            </div>
          </div>

          <aside className="rounded-[1.5rem] bg-[var(--deep)] p-6 text-white shadow-paper-lg">
            <div className="text-[11px] uppercase tracking-[0.12em] text-white/55">
              Handige routes
            </div>
            <div className="mt-5 space-y-4 text-[14px] leading-[1.65]">
              <div>
                <div className="font-medium">Dashboard</div>
                <div className="mt-1 text-white/72">
                  Overzicht van alle beschikbare rekentools en filters.
                </div>
              </div>
              <div>
                <div className="font-medium">DUO-maandbedrag</div>
                <div className="mt-1 text-white/72">
                  Feitelijke indicatie van wettelijke termijn en draagkracht.
                </div>
              </div>
              <div>
                <div className="font-medium">Hypotheekimpact studieschuld</div>
                <div className="mt-1 text-white/72">
                  Bekijk wat je studieschuld doet met je hypotheekruimte.
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function HeaderFallback() {
  return (
    <header className="hair-b sticky top-0 z-20 bg-[rgba(245,241,234,0.78)] backdrop-blur-md">
      <div className="page-shell py-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="font-serif text-[18px] tracking-[-0.01em] text-[var(--ink)]">
            Rekentools
          </div>
          <div className="text-[13px] text-[var(--muted)]">Laden...</div>
        </div>
      </div>
    </header>
  );
}
