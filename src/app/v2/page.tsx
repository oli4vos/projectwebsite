import Link from "next/link";

const scenarios = [
  {
    id: "studying",
    title: "Schuld opbouwen",
    description: "Bekijk wat je tijdens je studie opbouwt en welke rente daarbij hoort.",
    icon: "📚",
    links: [
      { href: "/apps/duo-doorlenen-of-stoppen", label: "Doorlenen of stoppen" },
      { href: "/kennisbank", label: "Hoe DUO-rente werkt" },
    ],
  },
  {
    id: "repay",
    title: "Later terugbetalen",
    description: "Bereken je wettelijke DUO-maandbedrag en wat extra aflossen feitelijk verandert.",
    icon: "💰",
    links: [
      { href: "/apps/duo-maandbedrag", label: "DUO-maandbedrag" },
      { href: "/apps/duo-extra-aflossen", label: "Extra aflossen" },
    ],
  },
  {
    id: "housing",
    title: "Huis kopen",
    description: "Zie hoe je studieschuld je hypotheekruimte beïnvloedt en wat je opties zijn.",
    icon: "🏠",
    links: [
      { href: "/apps/hypotheek-impact-studieschuld", label: "Impact op hypotheek" },
      { href: "/apps/artifact-hypotheek-wonen-maximale-hypotheek", label: "Maximale hypotheek" },
    ],
  },
];

export default function V2HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="v2-section bg-gradient-to-b from-[var(--v2-bg-soft)] to-[var(--v2-bg)]">
        <div className="v2-container max-w-3xl">
          <p className="v2-eyebrow mb-4">Voor starters met een studieschuld</p>
          <h1 className="v2-h1 mb-6">
            Wat staat je te wachten?
          </h1>
          <p className="v2-body-lg max-w-2xl mb-8 text-[var(--v2-text-secondary)]">
            Drie vragen die veel starters hebben. Kies een onderwerp en zie wat je schuld voor jou betekent — met jouw eigen cijfers.
          </p>
          <Link href="#scenarios" className="v2-btn v2-btn-primary">
            Begin verkennen
          </Link>
        </div>
      </section>

      {/* Scenario Cards */}
      <section id="scenarios" className="v2-section">
        <div className="v2-container">
          <p className="v2-eyebrow mb-4 text-center">Kies je startpunt</p>
          <h2 className="v2-h2 text-center mb-12">Drie grote vragen</h2>

          <div className="v2-grid v2-grid-cols-3">
            {scenarios.map((scenario) => (
              <article
                key={scenario.id}
                className="v2-card hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-4">{scenario.icon}</div>
                <h3 className="v2-h3 mb-3">{scenario.title}</h3>
                <p className="v2-body mb-6 text-[var(--v2-text-secondary)]">
                  {scenario.description}
                </p>
                <div className="flex flex-col gap-2">
                  {scenario.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="v2-link text-[var(--v2-sage)] hover:text-[var(--v2-sage-soft)] text-sm font-serif transition"
                    >
                      → {link.label}
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="v2-section bg-[var(--v2-sage)] text-white">
        <div className="v2-container text-center max-w-2xl">
          <h2 className="v2-h2 text-white mb-4">Klaar om alles te zien?</h2>
          <p className="v2-body-lg text-white/90 mb-8">
            Ontdek alle tools en maak je eigen scenario met je eigen getallen.
          </p>
          <Link
            href="/v2/apps"
            className="v2-btn v2-btn-lg"
            style={{ background: "white", color: "var(--v2-sage)" }}
          >
            Naar alle tools
          </Link>
        </div>
      </section>

      {/* Info Section */}
      <section className="v2-section">
        <div className="v2-container grid v2-grid-cols-2 gap-8">
          <div>
            <p className="v2-eyebrow mb-2">Geen advies</p>
            <p className="v2-body-lg mb-4">
              Je ziet scenario's met jouw eigen cijfers. Wat je ermee doet, bepaal jij. Wij geven geen financieel advies.
            </p>
          </div>
          <div>
            <p className="v2-eyebrow mb-2">Alleen huidige aannames</p>
            <p className="v2-body-lg mb-4">
              Alle percentages en normen zijn gebaseerd op actuele wettelijke bepalingen en officiële DUO-informatie.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
