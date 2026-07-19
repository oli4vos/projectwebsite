# Source Data Architecture

Dit document beschrijft het centrale brondatafundament voor hypotheek-, DUO-, fiscale en toekomstige toeslagregels. De implementatie blijft bewust klein: `src/lib/financial-constants` blijft de SSOT en er is geen tweede `src/data`-runtime.

## Laagmodel

De vaste keten is:

```text
centrale dataset of constantsbestand
  -> schemavalidatie
  -> actieve-versieselectie
  -> getypte domeinconstant of bronrecord
  -> mortgage / DUO / tax / allowances domeinlaag
  -> app-adapter
  -> UI en PDF-source-reference
```

React-componenten, routes en PDF-layoutcode lezen geen willekeurige JSON en kiezen niet zelfstandig een normjaar. Ze krijgen data via domeinfuncties, app-adapters of het presentatieneutrale `SourceReference`-model.

## Registry

De registry staat in `src/lib/financial-constants/source-datasets.ts`.

Belangrijke exports:

- `SOURCE_DATASET_REGISTRY`: geregistreerde bronsets.
- `validateDatasetRegistry(...)`: harde validatie voor CI en tests.
- `getDatasetForDate(...)` en `getActiveDataset(...)`: selectie per familie, scenario en peildatum.
- `getDatasetFreshness(...)`: actualiteitsstatus los van juridische geldigheid.
- `getSourceReferences(...)`: UI- en PDF-neutraal broncontract.

Een dataset heeft een `family` en `scenario`. Daardoor mag bijvoorbeeld een AFM-kwartaal naast een NHG-jaar bestaan zonder ambiguiteit, maar twee actieve datasets voor dezelfde familie en scenario op dezelfde peildatum zijn een fout.

## Metadata

De centrale types staan in `src/lib/financial-constants/types.ts`.

Er is onderscheid tussen:

- datasetmetadata (`recordType: "dataset"`);
- individuele aanbiederswaarden (`recordType: "provider-value"`);
- officiele normen (`methodologyType: "official-norm"`);
- providerdata (`methodologyType: "provider-value"`);
- secundaire bronnen (`methodologyType: "secondary-source"`);
- projectaannames (`methodologyType: "project-assumption"`).

Actieve datasets hebben altijd `sourceUrl`, `effectiveFrom`, `retrievedAt`, `lastVerifiedAt`, `nextReviewAt`, `sourceType`, methodologie en status.

## Geldigheid En Freshness

Geldigheid en freshness zijn gescheiden:

- `effectiveFrom` en `effectiveTo` bepalen of een dataset juridisch of beleidsmatig voor een peildatum geldt.
- `status` bepaalt of een dataset selecteerbaar is: `active`, `future`, `expired` of `archived`.
- freshness bepaalt of de bron opnieuw gecontroleerd moet worden: `fresh`, `review-due`, `stale`, `expired`, `future` of `archived`.

Een dataset kan dus nog geldig zijn, maar door `nextReviewAt` of bronleeftijd operationeel `stale` worden.

## Build Failures Versus Warnings

`npm run validate:source-data` faalt bij harde fouten, waaronder:

- ontbrekende of ongeldige bron-URL;
- ontbrekende of ongeldige `effectiveFrom`;
- ongeldige datumvolgorde;
- verlopen actieve dataset;
- dubbele actieve dataset voor dezelfde familie en scenario;
- ontbrekende actieve dataset wanneer code die expliciet selecteert;
- negatieve grenzen of onmogelijke percentages;
- conflicterende ids of onbekende `supersedes`.

Warnings blokkeren niet automatisch:

- `nextReviewAt` nadert of is verstreken zonder harde expiratie;
- optionele checksum ontbreekt;
- secundaire bron vereist primaire corroboratie;
- methodologietekst is te dun;
- dataset nadert review of effective end.

`npm run check:source-freshness` rapporteert freshness zonder lokale ontwikkeling te breken op reviewwaarschuwingen.

## Jaarlijkse Updateprocedure

1. Controleer primaire bron en publicatie-/geldigheidsdatum.
2. Update de bestaande constants of voeg een kleine dataset toe binnen `src/lib/financial-constants`.
3. Voeg of wijzig metadata met versie, geldigheid, bron, methodologie en reviewdatum.
4. Voeg regressietests toe voor normale waarden, grenzen, nulwaarden, ongeldige waarden en jaargangselectie.
5. Draai `npm run validate:source-data`.
6. Draai `npm run generate:source-overview` en commit `docs/source-data-overview.md`.
7. Draai de volledige projectchecks voor release.

## UI En PDF

UI en PDF gebruiken dezelfde domeinuitkomsten en dezelfde bronmetadata. De `SourceReference`-output bevat bronnaam, link, peildatum, geldigheidsjaar, source type, methodologie, freshness, waarschuwing, dataset-id en versie. Presentatiecomponenten mogen dit renderen, maar niet zelf brondata selecteren of herberekenen.

## Migratiestrategie

Niet alle constants worden in een keer gemigreerd. De eerste bewijsdatasets zijn hypotheek-financieringslast 2026, NHG 2026, LTV 2026, energielabelbedragen 2026, AFM Q3 2026, DUO-rentejaar 2026 en DUO-leengrens 2026. Verdere normalisatie hoort bij de Financial Domain & Calculation Guardian.

Open migraties:

- DUO-draagkrachtvrije voeten met bronmetadata per bedrag.
- Banktarieven als handmatig beheerde providerwaardes, zonder scraper.
- Toeslagenscanregels pas na volledige normalisatie en tests.
- Projectaannames in hypotheekengine explicieter labelen wanneer ze publiek gaan sturen.

## Nieuwe Domeinfamilies

- `mortgage-provider-rate` is gereserveerd voor handmatig gereviewde provider-rentes. De centrale validatie controleert providerrecords, vergelijkbare scenario's, HTTPS-bronnen, datumvelden en plausibele rentebandbreedtes. Deze familie wordt pas actief geregistreerd wanneer volledige grootbankrecords beschikbaar zijn.
- `allowance-signal-rules` bevat de actieve 2026 signaleringsdataset voor harde toeslagenvoorwaarden en officiele bronlinks. De familie blijft signal-only: bedragen, afbouwformules en complexe uitzonderingen blijven buiten de dataset totdat ze volledig genormaliseerd en getest zijn.
- Inputlimieten staan los van datasets in `src/lib/financial-constants/input-limits.ts`. Een praktische slidergrens is geen wettelijke of providermaximumgrens en mag een invoer niet stil wijzigen.
