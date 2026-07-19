import { AppDashboard } from "@/components/AppDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink } from "@/components/ui";
import { appRegistry } from "@/lib/app-registry";

const routeSteps = [
  {
    title: "Wat wordt mijn schuld?",
    body: "Bekijk wat je tijdens je studie opbouwt en welke rente daarbij hoort.",
    links: [
      { href: "/apps/duo-schuld-bij-starten-lenen", label: "Starten met lenen" },
      { href: "/apps/duo-leenbedrag-impact", label: "Impact leenbedrag" },
      { href: "/kennisbank", label: "Lees hoe DUO-rente werkt" },
    ],
  },
  {
    title: "Wat ga ik betalen?",
    body: "Bereken je wettelijke DUO-maandbedrag en wat extra aflossen feitelijk verandert.",
    links: [
      { href: "/apps/duo-maandbedrag", label: "DUO-maandbedrag" },
      { href: "/apps/duo-extra-aflossen", label: "Extra aflossen" },
    ],
  },
  {
    title: "Wat betekent dit voor een huis?",
    body: "Bekijk de impact van je studieschuld op hypotheekruimte, eigen geld en familiehulp.",
    links: [
      { href: "/apps/hypotheek-impact-studieschuld", label: "Impact op hypotheek" },
      { href: "/apps/artifact-hypotheek-wonen-maximale-hypotheek", label: "Maximale hypotheek" },
      { href: "/apps/familiehulp-eerste-woning", label: "Familiehulp eerste woning" },
    ],
  },
];

export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <section className="pb-10 pt-2">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(19rem,0.72fr)] lg:items-end">
            <div className="max-w-3xl">
            <div className="section-label">
              Voor starters met een studieschuld
            </div>
            <h1
              className="text-fluid-h1 mt-4 max-w-[13ch] font-serif tracking-[-0.03em] text-[var(--ink)]"
              style={{ textWrap: "balance" }}
            >
              Eerst grip op je studieschuld.
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[58ch] leading-[1.75] text-[var(--ink-2)]">
              Zie wat je opbouwt, wat je straks betaalt en wat je studieschuld
              betekent als je later een huis wilt kopen.
            </p>
            <div className="mt-7">
              <BtnLink href="#route" kind="primary" size="lg">
                Begin bij stap 1
              </BtnLink>
            </div>
            <p className="mt-4 max-w-[60ch] text-[13px] leading-6 text-[var(--muted)]">
              Geen advies. Je ziet scenario&apos;s met jouw eigen cijfers. Wat je
              ermee doet, bepaal jij.
            </p>
          </div>
            <aside className="surface-panel p-5">
              <div className="section-label">Waarom dit rustig blijft</div>
              <div className="trust-strip mt-5">
                <div>
                  <div className="font-mono text-[22px] tabular text-[var(--ink)]">10</div>
                  <p className="text-[12.5px] leading-5 text-[var(--muted)]">publieke tools, bewust beperkt</p>
                </div>
                <div>
                  <div className="font-mono text-[22px] tabular text-[var(--ink)]">DUO</div>
                  <p className="text-[12.5px] leading-5 text-[var(--muted)]">velden verwijzen naar primaire gegevens</p>
                </div>
                <div>
                  <div className="font-mono text-[22px] tabular text-[var(--ink)]">PDF</div>
                  <p className="text-[12.5px] leading-5 text-[var(--muted)]">rapporten volgen dezelfde uitkomstdata</p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="route" className="py-10">
          <div className="max-w-2xl">
            <h2 className="font-serif text-fluid-h2 tracking-[-0.02em] text-[var(--ink)]">
              Het stappenplan
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
              Begin klein. Open pas meer wanneer de vorige laag duidelijk is.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[1.1fr_0.95fr_1.05fr]">
            {routeSteps.map((step, index) => (
              <article
                key={step.title}
                className="surface-panel flex min-h-full flex-col p-5"
              >
                <div className="section-label">
                  Stap {index + 1}
                </div>
                <h3 className="mt-3 font-serif text-[1.25rem] tracking-[-0.02em] text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-6 text-[var(--muted)]">
                  {step.body}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {step.links.map((link) => (
                    <BtnLink key={link.href} href={link.href} kind="outline" size="sm">
                      {link.label}
                    </BtnLink>
                  ))}
                </div>
              </article>
            ))}
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
