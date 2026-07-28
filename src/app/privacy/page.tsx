import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy | Financiele rekentools",
  description:
    "Lees hoe deze local-first rekentools omgaan met invoer, browseropslag, hosting en externe links.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      intro="De huidige site is local-first. Financiele berekeningen worden in je browser uitgevoerd en persoonlijke invoer wordt niet standaard naar de beheerder verstuurd."
    >
      <LegalSection title="Welke gegevens de site verwerkt">
        <p>
          Rekentools verwerken de gegevens die je zelf invult om direct in je
          browser een uitkomst te berekenen. Deze invoer komt niet in de URL en
          wordt in de huidige publieke configuratie niet naar een database
          gestuurd.
        </p>
        <p>
          Een browserprofiel wordt standaard alleen voor de huidige sessie
          bewaard. Kies je bewust voor bewaren op dit apparaat, dan staat het
          profiel in de lokale browseropslag. Ook tijdelijke overdracht tussen
          tools en eventuele lokaal opgeslagen scenario&apos;s blijven op het
          apparaat.
        </p>
      </LegalSection>

      <LegalSection title="Technische foutgegevens">
        <p>
          De site kan een beperkt, gesaneerd technisch foutbericht lokaal in
          de browser bewaren. Dat bericht bevat alleen het fouttype, een korte
          melding, het pad, een release-aanduiding en een tijdstip. Financiele
          invoer hoort daar niet in. In de huidige publieke deployment is geen
          externe monitoring-webhook ingesteld.
        </p>
      </LegalSection>

      <LegalSection title="Cookies en analytics">
        <p>
          De site plaatst zelf geen advertentie- of trackingcookies en gebruikt
          momenteel geen bezoekersanalytics. Functionele browseropslag wordt
          alleen gebruikt voor de gekozen profielbewaring, voorkeuren,
          tijdelijke tooloverdracht en technische foutafhandeling.
        </p>
      </LegalSection>

      <LegalSection title="Hosting en externe diensten">
        <p>
          De site wordt momenteel via GitHub Pages aangeboden. GitHub kan voor
          beveiliging en levering technische verbindingsgegevens verwerken,
          zoals IP-adres, tijdstip, browserinformatie en opgevraagde URL. Daarop
          is het privacybeleid van GitHub van toepassing.
        </p>
        <p>
          Links naar DUO, overheidsinstanties en andere bronnen openen een
          externe website. Vanaf dat moment geldt het privacybeleid van die
          partij. De Project Site voegt geen persoonlijke financiële invoer aan
          zulke links toe.
        </p>
      </LegalSection>

      <LegalSection title="Gegevens verwijderen">
        <p>
          Sessiegegevens verdwijnen wanneer de browsersessie eindigt. Blijvend
          bewaarde profiel- en scenariogegevens kun je via de betreffende
          verwijderactie wissen, of door de sitegegevens in je browser te
          verwijderen. Omdat deze gegevens niet centraal worden ontvangen, kan
          de beheerder ze niet op afstand inzien of verwijderen.
        </p>
      </LegalSection>

      <LegalSection title="Vragen en wijzigingen">
        <p>
          Stel een algemene privacyvraag via de{" "}
          <a
            href="https://github.com/oli4vos/projectwebsite/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--ink)]"
          >
            projectrepository
          </a>
          . Plaats daar geen financiële of andere gevoelige gegevens. Voor een
          beveiligingsmelding volg je het{" "}
          <a
            href="https://github.com/oli4vos/projectwebsite/security/policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[var(--ink)]"
          >
            securitybeleid
          </a>
          .
        </p>
        <p>
          Bij activering van accounts, remote opslag, analytics, Cloudflare of
          andere gegevensverwerking wordt deze verklaring vooraf aangepast.
          Bekijk ook de{" "}
          <Link href="/voorwaarden" className="underline text-[var(--ink)]">
            gebruiksvoorwaarden
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
