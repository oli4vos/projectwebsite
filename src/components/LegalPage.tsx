import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14"
      >
        <article className="rounded-[1.5rem] border hair bg-white/80 p-6 shadow-paper">
          <p className="text-[12px] font-semibold uppercase text-[var(--muted)]">
            Laatst bijgewerkt op 28 juli 2026
          </p>
          <h1 className="mt-2 max-w-4xl font-serif text-fluid-h2 text-[var(--ink)]">
            {title}
          </h1>
          <p className="mt-4 max-w-[70ch] text-[15px] leading-7 text-[var(--ink-2)]">
            {intro}
          </p>
          <div className="mt-8 max-w-[70ch] space-y-7 text-[14px] leading-[1.7] text-[var(--ink-2)]">
            {children}
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 font-serif text-[20px] text-[var(--ink)]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
