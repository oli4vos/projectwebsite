# Bronnenonderzoek externe hypotheekrentelink

Peildatum: 2026-07-19. Scope: externe informatielink bij hypotheekrente-invoervelden. Geen actuele rentepercentages, geen providerrecords, geen gemiddeldeberekening en geen actieve productiedataset.

## Besluit

De Project Site toont voorlopig geen eigen grootbankgemiddelde en geen vooraf ingevulde actuele hypotheekrente. De gebruiker kiest altijd zelf het rentepercentage en vult het renteveld handmatig in.

Aanbevolen linklabel:

> Bekijk actuele hypotheekrentes ter inspiratie

Aanbevolen toelichting:

> Controleer altijd of de rente past bij jouw rentevaste periode, hypotheekvorm, NHG-situatie en verhouding tussen lening en woningwaarde. Vul het percentage daarna zelf in.

## Aanbevolen externe overzichtslink

| Veld | Advies |
|---|---|
| Bronnaam | Geld.nl hypotheekrente vergelijken |
| URL | https://www.geld.nl/hypotheek/hypotheekrente |
| Bronsoort | Betrouwbare externe vergelijkingssite; secundaire praktijkbron, geen juridische of rekenkundige primaire bron. |
| Reden van keuze | De pagina toont een breed hypotheekrenteoverzicht, vermeldt een controle-/updatedatum en biedt filters die voor gebruikers precies relevant zijn: rentevaste periode, hypotheekvorm, tariefgroep/LTV, energielabel en bouwtype. |
| Gebruik in Project Site | Alleen als externe inspiratie- en orientatielink naast handmatige rente-invoer. Niet gebruiken als datavoeding, gemiddelde, default, autofill of representatief persoonlijk tarief. |
| Laatst gecontroleerd | 2026-07-19. |

Ondersteunende bevindingen:

- Geld.nl vermeldt een compleet overzicht van actuele hypotheekrentes in Nederland, met een expliciete controledatum en filters voor rentevaste periode, hypotheekvorm, tariefgroep, energielabel en type bouw.
- Consumentenbond biedt ook een actuele hypotheekrentevergelijker en benoemt naast rente ook voorwaarden. Dit is een goede fallback of alternatief wanneer Geld.nl ongeschikt blijkt.
- Vereniging Eigen Huis biedt eveneens een overzicht van actuele hypotheekrentes per bank. Dit is bruikbaar als tweede fallback.
- Er is geen officiële overheidspagina gevonden die een breed actueel hypotheekrenteoverzicht voor consumenten publiceert. Officiële bronnen blijven leidend voor hypotheeknormen, maar niet voor marktbrede rentestanden.

## Niet gebruiken als brondata

Deze externe link mag niet worden opgenomen als actieve `SourceDataset` in `src/lib/financial-constants/source-datasets.ts`, omdat:

- er geen Project Site-rentepercentage uit wordt afgeleid;
- de pagina een secundaire vergelijkingsbron is;
- de gebruiker zelf filters moet zetten;
- defaults op vergelijkingssites kunnen afwijken van de situatie van de gebruiker;
- de Project Site geen marktgemiddelde of persoonlijk passend tarief belooft.

`src/lib/mortgage/provider-rates.ts` blijft voorbereidende domeincode en blijft ongebruikt voor productie zolang deze koers geldt. Verwijderen of activeren vraagt een aparte architectuurbeslissing.

## Beperkingen en waarschuwingen

| Onderwerp | Waarschuwing voor gebruiker |
|---|---|
| Rentevaste periode | Een rente voor 5, 10, 20 of 30 jaar is niet onderling uitwisselbaar. Kies dezelfde periode als in de calculator. |
| Hypotheekvorm | Annuiteit, lineair en aflossingsvrij kunnen verschillende tarieven of voorwaarden hebben. |
| NHG | NHG-tarieven zijn vaak lager dan niet-NHG-tarieven. Meng deze niet met elkaar. |
| LTV/tariefgroep | De verhouding tussen lening en woningwaarde beinvloedt vaak de tariefklasse. Kies een tariefgroep die past bij de eigen situatie. |
| Energielabel | Sommige aanbieders verwerken energielabel of duurzaamheidskorting in de rente. Controleer het gekozen label. |
| Kortingen | Betaalpakket-, huisbank-, duurzaamheids- of tijdelijke kortingen kunnen het getoonde percentage verlagen. Gebruik alleen een rente die past bij de eigen voorwaarden. |
| Persoonlijke situatie | Het laagste tarief is niet automatisch passend; voorwaarden, acceptatie en aanbiederbeleid blijven relevant. |

## Centrale beheerplek

Aanbevolen later beheer:

- `src/lib/mortgage/external-rate-links.ts` of een bestaande hypotheekconfiguratiemodule;
- exporteer een klein presentatieneutraal object, bijvoorbeeld:

```ts
export const MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK = {
  label: "Bekijk actuele hypotheekrentes ter inspiratie",
  url: "https://www.geld.nl/hypotheek/hypotheekrente",
  sourceName: "Geld.nl hypotheekrente vergelijken",
  lastChecked: "2026-07-19",
  nextReviewAt: "2026-10-19",
  copy:
    "Controleer altijd of de rente past bij jouw rentevaste periode, hypotheekvorm, NHG-situatie en verhouding tussen lening en woningwaarde. Vul het percentage daarna zelf in.",
  fallbackUrl: "https://www.consumentenbond.nl/hypotheek/hypotheekadvies-rentevergelijker",
};
```

Niet doen:

- geen rentepercentages in deze constante;
- geen source-datasetregistratie;
- geen providerrecords;
- geen gemiddeldeberekening;
- geen knop "Gebruik deze indicatie";
- geen automatische overschrijving van het renteveld.

## Linkcontrole en fallback

Aanbevolen controlebeleid:

- controleer de externe link elk kwartaal of bij hypotheek-UX-wijzigingen;
- markeer `nextReviewAt` op maximaal drie maanden na `lastChecked`;
- controleer alleen of de link bereikbaar is, nog een hypotheekrenteoverzicht toont en filters/toelichting bevat voor rentevaste periode, hypotheekvorm, NHG/LTV en relevante kortingen;
- wanneer de link niet meer werkt: val terug op de Consumentenbond-rentevergelijker;
- wanneer ook de fallback niet werkt: toon alleen de toelichting zonder externe link en verwijs niet naar actuele rentepercentages.

Dit is bewust lichter dan banktarief-freshness, omdat de Project Site geen rentepercentage uit de pagina overneemt.

## Overdracht aan Feature Integrator

Aanbevolen volgende agent: `Add feature integrator guide`.

Scope voor de volgende opdracht:

- toon de externe rentelink bij relevante hypotheekrentevelden;
- gebruik exact of vrijwel exact de copy uit dit document;
- voeg de salarisverhogingsmodule toe via bestaande centrale domeinfuncties;
- geen eigen actuele rente-indicatie;
- geen knop "Gebruik deze indicatie";
- geen DUO-returnflow;
- geen toeslagenscan;
- geen wijzigingen aan `provider-rates.ts` behalve eventueel expliciet markeren dat de module niet productie-actief is.

## Samenvatting voor centrale projectchat

De koers voor grootbankrentes is aangepast. De Project Site gaat voorlopig geen actuele ABN AMRO-, ING- en Rabobanktarieven normaliseren, geen grootbankgemiddelde berekenen en geen provider-rentedataset activeren. Bij relevante hypotheekrentevelden komt later alleen een externe inspiratie-link met het label "Bekijk actuele hypotheekrentes ter inspiratie". De gebruiker vult het rentepercentage altijd zelf in.

Aanbevolen externe link is Geld.nl hypotheekrente vergelijken, omdat die pagina een breed renteoverzicht, zichtbare actualiteitsinformatie en relevante filters voor rentevaste periode, hypotheekvorm, tariefgroep/LTV, energielabel en bouwtype biedt. Consumentenbond is de aanbevolen fallback. De link hoort centraal beheerd te worden in een kleine hypotheekconfiguratie of `src/lib/mortgage/external-rate-links.ts`, niet in de source-datasetregistry. Volgende agent: `Add feature integrator guide`, met scope externe rentelink bij rentevelden plus salarisverhogingsmodule. Geen eigen actuele rente-indicatie en geen knop "Gebruik deze indicatie".
