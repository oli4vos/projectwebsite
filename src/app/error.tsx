"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Btn } from "@/components/ui";

const CHUNK_RECOVERY_KEY = "projectwebsite:chunk-recovery-attempted";

function isLikelyChunkError(error: Error) {
  const message = error.message.toLowerCase();
  return (
    message.includes("chunkloaderror") ||
    message.includes("loading chunk") ||
    message.includes("failed to fetch dynamically imported module")
  );
}

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!isLikelyChunkError(error)) {
      return;
    }

    const hasAttemptedReload = window.sessionStorage.getItem(CHUNK_RECOVERY_KEY);
    if (hasAttemptedReload) {
      return;
    }

    window.sessionStorage.setItem(CHUNK_RECOVERY_KEY, "1");
    window.location.reload();
  }, [error]);

  function handleReload() {
    window.sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
    window.location.reload();
  }

  function handleTryAgain() {
    window.sessionStorage.removeItem(CHUNK_RECOVERY_KEY);
    reset();
  }

  return (
    <main id="main-content" className="page-shell flex min-h-[72dvh] items-center py-10">
      <section className="grid w-full gap-6 rounded-[1.5rem] border hair bg-white p-6 shadow-paper sm:p-8">
        <div className="text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
          Foutmelding
        </div>
        <h1 className="font-serif text-[clamp(1.8rem,1.5rem+1.5vw,2.8rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
          Deze pagina kon niet goed laden
        </h1>
        <p className="max-w-[62ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
          Waarschijnlijk gebruikt je browser nog oude bestanden van een vorige
          versie van de site.
        </p>
        <p className="text-[13px] leading-[1.65] text-[var(--muted)]">
          Blijft dit gebeuren? Ververs hard met Cmd+Shift+R of wis de
          sitegegevens voor deze website.
        </p>
        <div className="flex flex-wrap gap-3">
          <Btn type="button" kind="primary" size="md" onClick={handleReload}>
            Pagina opnieuw laden
          </Btn>
          <Btn type="button" kind="outline" size="md" onClick={handleTryAgain}>
            Opnieuw proberen
          </Btn>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border hair bg-white px-4 text-[14px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
          >
            Terug naar dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

