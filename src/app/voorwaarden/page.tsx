import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Gebruiksvoorwaarden | Financiele rekentools",
  description:
    "Voorwaarden voor het gebruik van de informatieve en indicatieve financiele rekentools.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Gebruiksvoorwaarden"
      intro="Door deze site te gebruiken accepteer je dat de tools uitsluitend informatieve, indicatieve uitkomsten geven en geen persoonlijk of officieel advies vervangen."
    >
      <LegalSection title="Informatief en indicatief">
        <p>
          Financiële uitkomsten zijn schattingen op basis van de ingevulde
          gegevens, beschikbare brondata, aannames en vereenvoudigingen. Zij
          zijn geen financieel, fiscaal, juridisch of hypotheekadvies, geen
          aanbod en geen officiële beschikking.
        </p>
        <p>
          Controleer beslissingen met grote gevolgen aan de hand van je
          persoonlijke documenten en, waar nodig, bij de bevoegde instantie of
          een gekwalificeerde professional. DUO, Dienst Toeslagen,
          Belastingdienst, hypotheekverstrekkers en andere instanties bepalen
          hun eigen officiële uitkomst.
        </p>
      </LegalSection>

      <LegalSection title="Juistheid en beschikbaarheid">
        <p>
          De beheerder probeert rekenregels, bronnen en uitleg actueel en
          controleerbaar te houden, maar garandeert niet dat iedere uitkomst
          volledig, foutloos of geschikt is voor jouw situatie. Wetgeving,
          uitvoeringsbeleid, brondata en productvoorwaarden kunnen wijzigen.
        </p>
        <p>
          De site kan worden aangepast, tijdelijk niet beschikbaar zijn of een
          tool terugtrekken wanneer betrouwbaarheid of onderhoud dat vereist.
          Meld een vermoedelijke fout voordat je op de uitkomst vertrouwt.
        </p>
      </LegalSection>

      <LegalSection title="Eigen verantwoordelijkheid">
        <p>
          Je blijft zelf verantwoordelijk voor de juistheid van je invoer en
          voor keuzes die je mede op basis van de site maakt. Voor zover de wet
          dat toestaat, is de beheerder niet aansprakelijk voor schade door het
          gebruik van een indicatieve uitkomst, een onderbreking of verouderde
          broninformatie. Wettelijke rechten die niet kunnen worden uitgesloten
          blijven onverminderd gelden.
        </p>
      </LegalSection>

      <LegalSection title="Software, merk en content">
        <p>
          De softwarecode is beschikbaar onder{" "}
          <a
            href="https://github.com/oli4vos/projectwebsite/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--ink)]"
          >
            AGPL-3.0-or-later
          </a>
          . Wie de code wijzigt en via een netwerk laat gebruiken, moet de
          toepasselijke AGPL-verplichtingen naleven en de bijbehorende broncode
          beschikbaar stellen.
        </p>
        <p>
          De open-sourcelicentie omvat niet automatisch de naam Grip of Project
          Site, het logo, de herkenbare visuele identiteit en originele
          redactionele content. Afgeleide deployments mogen niet suggereren dat
          zij officieel zijn of worden onderschreven. De volledige scheiding
          staat in het{" "}
          <a
            href="https://github.com/oli4vos/projectwebsite/blob/main/NOTICE.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--ink)]"
          >
            copyright-, merk- en contentbericht
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Officiële brondata">
        <p>
          De Project Site claimt geen exclusief eigendom op wet- en regelgeving,
          officiële normen, tarieven, percentages, grensbedragen of publicaties
          van bronhouders. Rechten op bronmateriaal en merknamen blijven bij de
          betreffende instanties. Een bronverwijzing betekent niet dat die
          instantie de site ondersteunt.
        </p>
      </LegalSection>

      <LegalSection title="Toepassing en wijzigingen">
        <p>
          Misbruik van de site, misleidend gebruik van de merkidentiteit en
          pogingen om de beschikbaarheid of veiligheid te verstoren zijn niet
          toegestaan. Op deze voorwaarden is Nederlands recht van toepassing,
          met behoud van dwingende consumentenrechten.
        </p>
        <p>
          Nieuwe verwerking of een wezenlijke wijziging wordt in deze
          voorwaarden of de{" "}
          <Link href="/privacy" className="underline text-[var(--ink)]">
            privacyverklaring
          </Link>{" "}
          vastgelegd.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
