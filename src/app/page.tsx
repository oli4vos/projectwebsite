import { AppDashboard } from "@/components/AppDashboard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { BtnLink } from "@/components/ui";
import { appRegistry } from "@/lib/app-registry";

const routeSteps = [
  {
    title: "Begrijp je studieschuld",
    body: "Wat betaal je DUO per maand, wat blijft er over en waar blokkeert je schuld toekomstige keuzes?",
    links: [
      { href: "/apps/schulden-volgorde", label: "Welke schuld eerst?" },
      { href: "/apps/hypotheek-impact-studieschuld", label: "Impact op hypotheek" },
    ],
  },
  {
    title: "Kies wat je doet met extra geld",
    body: "Leg extra aflossen, buffer houden, sparen en beleggen rustig naast elkaar.",
    links: [
      { href: "/apps/volgende-euro", label: "Volgende euro" },
      { href: "/apps/studieschuld-vs-beleggen", label: "Aflossen of beleggen" },
    ],
  },
  {
    title: "Verdieping: een huis kopen",
    body: "Pas als stap 1 en 2 helder zijn: hypotheek, eigen geld, familielening en schenking.",
    links: [
      { href: "/apps/familiehulp-eerste-woning", label: "Lenen of schenken" },
    ],
  },
];

export default async function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell min-h-[100dvh] pb-10 pt-8 lg:pb-14">
        <section className="hair-b pb-10 pt-2">
          <div className="max-w-3xl">
            <div className="text-[13px] font-medium text-[var(--muted)]">
              Voor starters met een studieschuld
            </div>
            <h1
              className="text-fluid-h1 mt-4 font-serif tracking-[-0.03em] text-[var(--ink)]"
              style={{ textWrap: "balance" }}
            >
              Eerst grip op je studieschuld.
            </h1>
            <p className="text-fluid-lead mt-5 max-w-[58ch] leading-[1.75] text-[var(--ink-2)]">
              Zie wat je DUO-maandlast betekent voor wat je overhoudt. Daarna
              kijk je pas verder: extra aflossen, sparen, of een huis kopen.
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
        </section>

        <section id="route" className="hair-b py-10">
          <div className="max-w-2xl">
            <h2 className="font-serif text-fluid-h2 tracking-[-0.02em] text-[var(--ink)]">
              Het stappenplan
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-[var(--muted)]">
              Begin klein. Open pas meer wanneer de vorige laag duidelijk is.
            </p>
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {routeSteps.map((step, index) => (
              <article
                key={step.title}
                className="flex min-h-full flex-col rounded-xl border hair bg-white p-5 shadow-paper"
              >
                <div className="text-[13px] font-medium text-[var(--muted)]">
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
