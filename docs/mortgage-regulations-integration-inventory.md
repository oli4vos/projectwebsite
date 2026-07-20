# Hypotheektools Regulations Integratie Inventarisatie

Peildatum: 2026-07-20. Scope: eerste centrale integratielaag voor hypotheektools richting de bestaande Regulations-architectuur. Deze inventarisatie wijzigt geen publieke UI, routes, manifests, PDF-rendering, brondata, hypotheekberekeningen, NHG-logica, renteformules of fiscale logica.

## Geinventariseerde hypotheektools

Publieke of actieve hypotheekgerelateerde tools in de huidige migratiescope:

- `artifact-hypotheek-wonen-maximale-hypotheek`
- `hypotheek-impact-studieschuld`
- `familiehulp-eerste-woning`

Daarnaast bestaan veel hidden/draft of artifact-hypotheektools die niet proactief worden gemigreerd:

- `apps/artifact-hypotheek-wonen-*`
- `apps/private-lease-impact-hypotheek`
- `apps/hypotheek-aflossen-vs-beleggen`
- `apps/hypotheekrenteaftrek-afschaffen`
- `apps/koop-vs-huur`
- `apps/annuitair-lineair`

Deze blijven buiten publieke migratie totdat een aparte opdracht ze activeert of inhoudelijk migreert.

## Gedeelde inputvelden

De eerste centrale adapter modelleert de gedeelde hypotheekinput die direct aansluit op `MortgageMaxMortgageInput`:

- inkomen: `grossAnnualHouseholdIncome`, `grossAnnualPartnerIncome`
- rente en looptijd: `annualMortgageRate`, `fixedRatePeriodMonths`, `mortgageTermYears`, `afmStressAnnualRate`
- woning: `purchasePrice`, `marketValue`
- eigen middelen en verplichtingen: `ownFunds`, `monthlyDebtPayments`
- studieschuld: `hasStudentLoan`, `studentLoanStatus`, `studentLoanActualMonthlyPayment`, `studentLoanStatutoryMonthlyPayment`
- NHG en energie: `nhgRequested`, `energyLabel`, `energySavingMeasuresAmount`, `renovationAmount`

## Gedeelde vraagstructuren

De gedeelde vragen zijn gegroepeerd in:

- inkomen;
- hypotheekvoorwaarden;
- woning;
- studieschuld;
- andere verplichtingen;
- NHG, energie en eigen geld.

De centrale `Question Flow` kan hiermee voortgang, relevante vragen, skipped/not-applicable status en ontbrekende input bepalen zonder de bestaande calculators aan te passen.

## Gedeelde afhankelijkheden

- Partnerinkomen is optioneel en alleen inhoudelijk relevant wanneer aanwezig.
- Studieschuldstatus en DUO-maandbedragvelden hangen af van `hasStudentLoan`.
- Actueel DUO-maandbedrag is relevant bij status `repaying`; wettelijk maandbedrag is relevant bij andere studieschuldstatussen.
- Woningwaardevragen hangen samen met koopprijs en marktwaarde.
- AFM-toetsrente is vooral relevant wanneer de rentevaste periode korter is dan 10 jaar.
- Energiebesparende maatregelen en renovatiebedragen blijven optionele woningmodifiers.

## Gedeelde unknowns

De adapter markeert ontbrekende kernvelden als centrale unknowns:

- bruto huishoudinkomen;
- hypotheekrente;
- rentevaste periode;
- looptijd;
- koopprijs;
- marktwaarde;
- relevant DUO-maandbedrag.

Deze unknowns zijn flow- en evaluatiecontext. Ze vervangen geen bestaande formuliervalidatie en veranderen geen publieke uitkomst.

## Gedeelde recommendations

De centrale recommendationlaag kan in deze fase generiek adviseren:

- ontbrekende gegevens verzamelen;
- officiële hypotheeknormen of aanbieder controleren;
- relevante Project Site-tool gebruiken;
- later herzien;
- jaarlijkse bronwijzigingen monitoren.

De adapter neemt hiermee geen nieuwe hypotheekbeslissing. De bestaande rekentools blijven bepalend voor zichtbare bedragen.

## Gedeelde reportingmogelijkheden

De maximale-hypotheekflow heeft al een centrale report/viewmodel-laag:

- `MortgageMaxMortgageInput`
- `MortgageMaxMortgageResult`
- `buildMortgagePdfReport`

De adapter exposeert alleen dat deze reportingbron beschikbaar is wanneer een bestaand mortgage-resultaat is meegegeven. PDF-rendering blijft buiten deze iteratie.

## Wat centraal kan migreren

- Mapping van hypotheekinput naar `AnswerState`.
- Generieke `RegulationDefinition` voor maximale hypotheek/leencapaciteit.
- `Question Flow`-statussen rond ontbrekende, overgeslagen en niet-toepasselijke hypotheekvragen.
- Unknown Resolution voor kernvelden.
- Generieke recommendationcontext.
- Estimate-status als `signal-only` zolang er geen nieuwe bedraglaag wordt ontworpen.
- Reportingbeschikbaarheid als verwijzing naar bestaande mortgage-report viewmodeldata.

## Wat toolspecifiek blijft

- React-formulieren, validatiecopy, progressive disclosure en submitgedrag.
- `hypotheek-impact-studieschuld` DUO-portfoliomapping en betaalbronlogica.
- `familiehulp-eerste-woning` familielening-, schenking- en scenario-orkestratie.
- Hidden artifact-calculators en hun gedeelde artifact-runtime.
- PDF-layout en downloadactie.
- Alle hypotheek-, NHG-, rente-, fiscale en DUO-formules.

## Implementatiegrens

De eerste implementatie staat in `src/lib/mortgage/regulations-adapter.ts`. Deze adapter:

- roept geen nieuwe hypotheekberekening aan;
- verandert geen bestaande resultdata;
- gebruikt bestaande Regulations-contracten;
- levert immutable output;
- is backwards compatible met bestaande `MortgageMaxMortgageInput` en `MortgageMaxMortgageResult`;
- is nog niet gekoppeld aan React-calculators.
