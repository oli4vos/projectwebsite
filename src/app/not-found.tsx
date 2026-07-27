import { Suspense } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink } from "@/components/ui";

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
        <section className="w-full rounded-[1.75rem] border hair bg-white/88 p-8 shadow-paper lg:p-10">
          <div>
            <h1 className="max-w-3xl font-serif text-[40px] leading-[1.05] tracking-[-0.03em] text-[var(--ink)] sm:text-[54px]">
              Deze pagina is niet gevonden.
            </h1>
            <p className="mt-5 max-w-[60ch] text-[15px] leading-[1.7] text-[var(--ink-2)]">
              De pagina die je zoekt bestaat niet of is verplaatst. Ga terug naar het
              het overzicht en kies daar een beschikbare tool.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <BtnLink href="/apps" kind="primary" size="md">
                Bekijk alle tools
              </BtnLink>
              <Link href="/" className="touch-link text-[14px] text-[var(--ink)] underline underline-offset-4">
                Naar de homepage
              </Link>
            </div>
          </div>
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
