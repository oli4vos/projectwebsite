# Jaarlijkse update van brondata

Deze handleiding beschrijft de vaste jaarlijkse update voor alle wettelijke bedragen, percentages, grenzen, tabellen en uitvoeringsregels op de Project Site. De runtime-SSOT blijft `src/lib/financial-constants`; losse apps, React-componenten en PDF-code bevatten geen jaarnormen.

## Centraal overzicht

`SOURCE_DATASET_REGISTRY` in `src/lib/financial-constants/source-datasets.ts` is de machineleesbare inventaris. `docs/source-data-overview.md` wordt daaruit gegenereerd en toont per dataset het jaar, de geldigheid, de officiële bron, de laatste verificatie, de volgende review en de afnemende tools.

Gebruik voor de jaarlijkse planning vooral:

- `effectiveTo`: wanneer de huidige norm niet meer juridisch of beleidsmatig geldt;
- `nextReviewAt`: wanneer de primaire bron uiterlijk opnieuw gecontroleerd moet zijn;
- `usedBy`: welke tools regressiecontrole nodig hebben;
- `methodologyType`: onderscheid tussen officiële norm, providerwaarde, secundaire bron en projectaanname;
- `supersedes`: welke oudere dataset door een nieuwe jaargang wordt vervangen.

## Jaarcyclus

1. Draai uiterlijk half november `npm run check:source-freshness` en gebruik `docs/source-data-overview.md` als werklijst.
2. Open voor iedere due dataset de geregistreerde primaire `sourceUrl`. Controleer publicatiedatum, geldigheidsperiode, doelgroep, eenheid en eventuele overgangsregels.
3. Voeg de nieuwe jaargang toe naast de bestaande jaargang. Overschrijf historische data niet wanneer oude berekeningen een peildatum ondersteunen.
4. Leg minimaal `year`, `version`, `effectiveFrom`, `effectiveTo`, `retrievedAt`, `lastVerifiedAt`, `nextReviewAt`, bron, methodologie, status en `usedBy` vast.
5. Zet een nog niet geldende jaargang op `future`. Zet de oude jaargang pas op `expired` of `archived` wanneer de selectie voor alle ondersteunde peildata correct blijft.
6. Voeg expliciete regressietests toe voor bedragen, grenzen, periodeovergangen, afronding en selectie op peildatum. Controleer alle tools in `usedBy`.
7. Genereer het centrale overzicht opnieuw en inspecteer de diff.
8. Publiceer pas nadat source-validatie, freshness, tests, typecheck en build groen zijn.

## Verplichte commando's

```bash
npm run validate:source-data
npm run generate:source-overview
npm run check:source-freshness
npm test
npm run lint
npm run typecheck
npm run build
git diff --check
```

Bij manifest- of registryimpact komt daar `npm run generate:apps` bij. De gegenereerde bestanden mogen na opnieuw genereren geen onverwachte diff bevatten.

## DUO-bedragen

Alle maximale bedragen voor basisbeurs, aanvullende beurs, gewone rentedragende lening, leenfase, collegegeld en het studentenreisproduct staan per periode of jaar in `src/lib/financial-constants/duo-student-finance-amounts-2026.ts`. `calculateDuoBorrowingCapacity` in `src/lib/duo/borrowing-capacity.ts` bepaalt de resterende leenruimte.

De centrale regel is:

```text
maximale rentedragende lening tijdens beursfase
= gewone lening
+ (maximale aanvullende beurs - werkelijk ontvangen aanvullende beurs)
```

De basisbeurs verlaagt de gewone lening niet. In de leenfase geldt het afzonderlijke leenfasemaximum. Collegegeldkrediet blijft apart en mag nooit hoger zijn dan het werkelijk verschuldigde collegegeld of de toepasselijke DUO-grens.

Het reguliere maandmaximum voor collegegeldkrediet wordt niet los ingevoerd:

```text
maximaal collegegeldkrediet per maand
= jaarlijks wettelijk collegegeld ÷ 12
```

Leg daarom het jaarlijkse collegegeld per studiejaar centraal vast. Leg ook de officiële maandwaarde van het studentenreisproduct vast. Voor mbo 3/4, hbo en universiteit telt die waarde als prestatiebeurs mee zolang DUO deze nog niet in een gift heeft omgezet.

DUO kan bedragen binnen één kalenderjaar op verschillende momenten wijzigen. Voeg daarom perioden met volledige ISO-datums toe en test ten minste de dag vóór en op iedere overgang.

## Review en eigenaarschap

Een inhoudelijke wijziging aan financiële brondata vereist controle door de Financial Domain & Calculation Guardian. Een nieuwe datasetfamilie of gewijzigde selectielogica vereist daarnaast architectuurcontrole. De QA & Release Guardian controleert voor publicatie de afhankelijke actieve tools, bronverwijzingen en productiebuild.

Een bronwijziging is niet afgerond wanneer alleen de waarde is aangepast. Metadata, tests, het gegenereerde overzicht en de afnemende tools moeten in dezelfde update aantoonbaar zijn gecontroleerd.
