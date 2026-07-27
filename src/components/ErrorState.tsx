"use client";

import Link from "next/link";
import { Btn } from "@/components/ui";

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="grid w-full gap-5 rounded-[1.5rem] border hair bg-white p-6 shadow-paper sm:p-8">
      <h1 className="font-serif text-[clamp(1.8rem,1.5rem+1.5vw,2.8rem)] leading-[1.08] tracking-[-0.02em] text-[var(--ink)]">
        Deze pagina kon niet laden
      </h1>
      <p className="max-w-[62ch] text-[14px] leading-[1.7] text-[var(--ink-2)]">
        Probeer het opnieuw. Blijft de fout terugkomen, ga dan terug naar de
        homepage en open de pagina opnieuw.
      </p>
      <div className="flex flex-wrap gap-3">
        <Btn type="button" kind="primary" size="md" onClick={onRetry}>
          Opnieuw proberen
        </Btn>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border hair bg-white px-4 text-[14px] text-[var(--ink)] transition hover:bg-[var(--paper-soft)]"
        >
          Naar de homepage
        </Link>
      </div>
    </section>
  );
}
