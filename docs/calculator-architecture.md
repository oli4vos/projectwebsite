# Calculatorarchitectuur

Deze blueprint beschrijft hoe calculators in de Project Site worden gebouwd, beoordeeld en geactiveerd. Het doel is een consistent, onderhoudbaar en testbaar laagmodel zonder dubbele financiële formules of tool-specifieke uitzonderingen in gedeelde renderers.

## Doel van het laagmodel

Calculators moeten zichtbaar eenvoudig blijven, maar intern streng gescheiden zijn. React verzamelt invoer en toont resultaten. Financiële regels, wettelijke aannames, tabellen, afronding en scenario-uitkomsten blijven in centrale domeinlagen. Tool-specifieke applicatielogica mag gegevens normaliseren en orchestreren, maar mag geen tweede bron van waarheid voor DUO-, hypotheek-, fiscale of andere rekenregels worden.

Het laagmodel voorkomt:

- formules in `Calculator.tsx`;
- verschillende calculatorpatronen zonder contract;
- herhaalde parsing-, default-, validatie- en mappinglogica;
- PDF-uitvoer die een eigen berekenpad krijgt;
- publicatie van hidden/draft tools zonder architectuurcontrole.

## Verantwoordelijkheden per laag

### 1. Centrale domeinlaag

Voorbeelden: `src/lib/duo/`, `src/lib/mortgage/`, `src/lib/tax/`, `src/lib/pension/`, `src/lib/planning/`, `src/lib/basis-calculations.ts` en `src/lib/financial-constants/`.

Deze laag bevat financiele formules, wettelijke regels, normen, bronmetadata, tabellen, afrondingsregels, scenariofuncties en domeinresultaten. Deze laag bevat geen React, JSX, formulierstatus, browser-API's, dashboardlogica, routes of PDF-rendering.

### 2. Applicatielaag

Voorbeelden: `apps/<slug>/logic.ts`, `apps/<slug>/report.ts` voor report-viewmodels, of gerichte modules onder `apps/<slug>/application/`.

Deze laag bevat use-cases, scenario-orkestratie, normalisatie, mapping van gevalideerde formulierinput naar domeininput, aanroepen van centrale domeinfuncties, resultaatmodellen en adapters tussen tool en domeinlaag. Deze laag bevat geen JSX, React-state of gekopieerde financiele formules.

### 3. Formulier- en presentatielaag

Voorbeelden: componenten onder `apps/<slug>/components/`, `apps/<slug>/form/`, `src/components/forms/`, `CalculatorShell`, `ToolActionButton`, `MobileFieldFlowControls`, `FieldError`, `DisclosureSection` en resultaatcomponenten.

Deze laag bevat invoervelden, lokale formulierstatus, submit- en resetgedrag, validatiemeldingen, progressive disclosure, schermresultaten en de aanroep naar de centrale PDF/report-laag. Deze laag berekent geen DUO-regels, hypotheekregels, fiscale regels of andere financiele uitkomsten.

### 4. Toolfacade

`apps/<slug>/Calculator.tsx` is een dun compositiebestand. Het verbindt formulier, applicatie-adapter, resultaatweergave, gedeelde shell en PDF-actie. Een lengte van ongeveer 150 tot 200 regels is een signaal om verantwoordelijkheden te splitsen, geen harde norm.

De facade bevat geen financiele formules, grote parsingblokken, uitgebreide validatielogica, complexe scenario-orkestratie, grote resultaatmappings of PDF-berekeningen.

## Toegestane importrichting

De toegestane richting is:

```text
toolfacade
  -> formulier en presentatie
  -> applicatie-adapter of use-case
  -> centrale domeinlaag
```

Imports in de andere richting zijn niet toegestaan. Centrale domeinmodules importeren geen toolbestanden. Gedeelde UI-componenten importeren geen specifieke toolconfiguratie. Generieke renderers kennen geen specifieke financiele tool.

## Verboden afhankelijkheden

Niet toegestaan:

- React, JSX of browser-API's in domeinlagen.
- Financiele formules in `Calculator.tsx`, routecode of gedeelde UI.
- Tool-specifieke uitzonderingen in generieke renderers zoals `_artifact_shared`.
- PDF-formules die losstaan van de webberekening.
- Gekopieerde DUO-, hypotheek-, fiscale of pensioenlogica in appdirectories.
- Nieuwe parallelle utility- of calculatorlagen naast bestaande bruikbare helpers.
- Circulaire imports tussen app-, component- en domeinlagen.

## Domeinlogica versus applicatie-orkestratie

Domeinlogica beantwoordt inhoudelijke vragen: welk maandbedrag volgt uit een DUO-regel, welke hypotheekruimte hoort bij een rente en looptijd, welke belastingtabel geldt voor een jaar. Applicatie-orkestratie beantwoordt toolvragen: welke velden zijn ingevuld, welke defaults gelden, hoe wordt profieldata gemapt, welke scenario's tonen we, welke waarschuwingen horen in het viewmodel.

Als dezelfde formule in twee tools nodig is, hoort die in de centrale domeinlaag. Als dezelfde parsing of mapping in twee actieve tools terugkomt, mag een kleine gedeelde helper worden toegevoegd. Centraliseer alleen aantoonbaar herhaald gedrag.

## Configuratiecalculators en maatwerkcalculators

Configuratiecalculators gebruiken een gedeelde runtime of renderer met toolprofiel, velden, labels en outputvolgorde. De huidige artifact-tools gebruiken `apps/_artifact_shared/ArtifactCalculator.tsx` plus `apps/_artifact_shared/runtime.ts`. Dit patroon is geschikt voor eenvoudige, generieke berekeningen met een gelijkvormig formulier en resultaat.

Maatwerkcalculators hebben eigen formulierflows, scenario's, profielprefill, resultaatframing of PDF-output. Voorbeelden zijn `hypotheek-impact-studieschuld`, `familiehulp-eerste-woning`, `schulden-volgorde` en de DUO-tools. Ook maatwerkcalculators volgen hetzelfde laagmodel: `Calculator.tsx` blijft compositie, applicatie- en reportmodules zijn pure TypeScript waar mogelijk, en domeinformules blijven centraal.

## Gedeeld calculatorcontract

Gebruik bestaande helpers eerst:

- `useSubmittedCalculation` voor submit-driven formulierstatus, dirty state, reset en scroll naar resultaat.
- `CalculatorShell` voor de mobiele en desktop toollayout.
- `parseOptionalDecimalInput` en gerelateerde helpers in `src/lib/number-input.ts` voor numerieke invoer.
- `profile-tool-mapping` en `profile-prefill` voor profieldefaults.
- Centrale domeinfuncties in `src/lib/duo`, `src/lib/mortgage`, `src/lib/tax`, `src/lib/pension` en `src/lib/planning`.

Wanneer herhaling in minimaal twee actieve tools ontstaat, mag een klein type-safe contract worden toegevoegd. Richtinggevend:

```ts
export interface CalculatorAdapter<TFormInput, TDomainInput, TDomainResult, TViewModel> {
  getDefaults(): TFormInput;
  parse(input: TFormInput): ParseResult<TDomainInput>;
  calculate(input: TDomainInput): TDomainResult;
  toViewModel(result: TDomainResult, input: TDomainInput): TViewModel;
}
```

Dit contract is optioneel. Het mag geen verplicht framework voor iedere eenvoudige calculator worden en mag geen nieuwe god file opleveren. De eisen zijn: type-safe, unit-testbaar zonder React, bruikbaar voor configuratie- en maatwerkcalculators, en ondergeschikt aan de centrale domeinfuncties.

## Huidige calculatorpatronen

Inventarisatie op basis van de huidige repository:

- `useSubmittedCalculation` + `CalculatorShell`: submit-driven maatwerktools en enkele hidden/direct calculators.
- `ArtifactCalculator`: gedeelde configuratierenderer voor artifact-tools. Pure types en input/parsing/format-adapters staan in aparte `_artifact_shared` modules; labels, strict profile configs, validatie en resultaatrendering zitten nog grotendeels in de renderer.
- `FocusedDuoTool`: gedeelde eenvoudige DUO-presentatielaag voor meerdere korte DUO-tools.
- Losse maatwerkcalculators: tools met eigen formulier, profielprefill, scenarioresultaten en soms PDF.

Belangrijke probleemgebieden:

- `apps/hypotheek-impact-studieschuld/Calculator.tsx` gebruikt inmiddels een pure `form.ts` voor defaults, labels, parsing, validatie en mapping, maar bevat nog veel resultaatweergave, submitorkestratie, profielprefill en PDF-actie.
- `apps/_artifact_shared/ArtifactCalculator.tsx` is nog steeds groot: tool-/domeinlabels, strict profile configs, validatie, formulierrendering en resultaatrendering staan nog samen. Verdere splitsing moet per verantwoordelijkheid gebeuren, niet op regeltelling.

## Actieve versus inactieve tools

Statuscriteria:

- `app.json` is de bron voor `status` en `visibility`.
- `scripts/generate-app-registry.mjs` neemt alleen `visibility: "public"` op in `src/lib/app-registry.ts` en `src/lib/app-components.tsx`.
- Dashboard en directe app-routes gebruiken de gegenereerde registry.
- `FUNCTIONALITY_STATUS.md` is de functionele SSOT en moet aansluiten op manifests en registry.

Binnen scope voor actieve-toolrefactors staan de publieke registry-tools:

| Tool | Manifeststatus | Scopecriterium |
|---|---|---|
| `artifact-hypotheek-wonen-maximale-hypotheek` | `active`, `public` | Publieke registry en dashboardroute |
| `duo-extra-aflossen` | `beta`, `public` | Publieke registry en dashboardroute |
| `duo-leenbedrag-impact` | `beta`, `public` | Publieke registry en dashboardroute |
| `duo-maandbedrag` | `beta`, `public` | Publieke registry en dashboardroute |
| `duo-schuld-bij-starten-lenen` | `beta`, `public` | Publieke registry en dashboardroute |
| `duo-stoppen-kosten-prestatiebeurs` | `beta`, `public` | Publieke registry en dashboardroute |
| `familiehulp-eerste-woning` | `beta`, `public` | Publieke registry en dashboardroute |
| `hypotheek-impact-studieschuld` | `beta`, `public` | Publieke registry en dashboardroute |
| `schulden-volgorde` | `beta`, `public` | Publieke registry en dashboardroute |

Buiten scope voor proactieve migratie staan hidden, draft, experimentele of niet-gepubliceerde tools, waaronder:

- `duo-doorlenen-of-stoppen`, omdat het manifest nu `visibility: "hidden"` heeft ondanks eerdere statusdocumentatie.
- `studieschuld-vs-beleggen`, `volgende-euro`, `kind-wordt-18-impact`, `koop-vs-huur`, `private-lease-impact-hypotheek`, `jaarruimte-vs-vrij-beleggen`, `box-3-impact`, `fire-na-belasting`, `hypotheek-aflossen-vs-beleggen`, `zzp-uurtarief` en andere hidden directe tools.
- Alle hidden/draft artifact-tools behalve wanneer gedeelde infrastructuurwijzigingen buildcompatibiliteit vereisen.

Inactieve tools worden niet proactief gemigreerd, niet inhoudelijk verfijnd en niet onbedoeld zichtbaar gemaakt. Bij wijzigingen in gedeelde infrastructuur moet import- en buildcompatibiliteit behouden blijven.

## Blueprint voor actieve tools

Een actieve of publiek gemaakte tool moet voldoen aan de blueprint-check in `AGENTS.md`. Kernpunten:

- eigen `apps/<slug>` directory met geldig manifest;
- correcte registry-, route- en dashboardzichtbaarheid;
- dunne `Calculator.tsx`;
- scheiding tussen defaults, parsing, validatie, mapping, domeinberekening, viewmodel, scherm en PDF;
- geen formules in React;
- geen aparte PDF-berekening;
- unit- en regressietests voor defaults, mapping, edge cases, resultaten en registry/visibility;
- productiebuild, directe URL en refresh werken.

## Procedure voor activatie van een inactieve tool

1. Controleer `FUNCTIONALITY_STATUS.md`, manifest, registry en bestaande documentatie.
2. Voer de volledige blueprint-check uit voordat `visibility` naar `public` gaat of een route zichtbaar wordt.
3. Migreer de tool alleen waar nodig naar het actuele laagmodel.
4. Verifieer dat scherm en PDF hetzelfde berekenpad en viewmodel gebruiken.
5. Voeg of actualiseer tests voor parsing, validatie, mapping, domeininput, viewmodel, PDF-data en zichtbaarheid.
6. Draai `npm run generate:apps`, lint, typecheck, tests en build.
7. Update `FUNCTIONALITY_STATUS.md` en relevante documentatie.

Een inactieve of experimentele tool hoeft niet direct volledig naar de actuele blueprint te worden gemigreerd. Zodra deze tool wordt geactiveerd, gepubliceerd of zichtbaar gemaakt, is de volledige blueprint-check verplicht en moeten alle relevante afwijkingen vóór activatie worden opgelost.

## Migratiestrategie voor bestaande tools

Werk gefaseerd:

1. Documenteer en corrigeer status- en architectuurregels.
2. Introduceer alleen minimale gedeelde types of helpers wanneer hetzelfde gedrag in minimaal twee actieve tools voorkomt.
3. Migreer `hypotheek-impact-studieschuld` als primaire maatwerktool naar defaults, form mapping, applicatie-use-case, viewmodel, resultaatcomponent en PDF-actie.
4. Splits `ArtifactCalculator` zodat configuraties, parsing/validatie, veldrendering en resultaatrendering gescheiden zijn.
5. Migreer daarna twee actieve voorbeeldtools: een eenvoudige tool en een complexere tool.

Niet in scope: alle calculators automatisch migreren, hidden/draft tools inhoudelijk verbeteren, routes hernoemen, zichtbare copy herschrijven, financiele formules wijzigen of nieuwe dependencies toevoegen zonder noodzaak.

## Uitzonderingsprocedure

Een afwijking van de blueprint mag alleen tijdelijk en expliciet:

- documenteer de reden en scope;
- leg vast waarom bestaande centrale logica niet past;
- voeg tests toe rond het afwijkende gedrag;
- zorg dat de afwijking geen hidden tool publiceert;
- plan een vervolg om de afwijking te verwijderen of te centraliseren.

Functionele bugs die tijdens een architectuurrefactor worden gevonden, worden apart beoordeeld. Financiele logica verandert alleen met expliciete onderbouwing en tests.

## Agentverantwoordelijkheden

- Project Orchestrator: bewaakt scope, overdracht, blokkades en volgende agent, maar neemt specialistisch werk niet over.
- Feature Integrator: bouwt of activeert tools volgens blueprint en houdt zichtbaarheid, manifest, route, formulier, resultaat en PDF integraal consistent.
- Financial Domain & Calculation Guardian: beheert centrale formules, regels, constants, bronmetadata en regressietests.
- Form UX & PDF Guardian: bewaakt formulierflow, foutmeldingen, progressive disclosure en scherm/PDF-gelijkheid.
- DevOps, Security & Performance Guardian: bewaakt static hosting, dependencies, secrets, runtimekosten, securitychecks en build/deploybaarheid.
- Sources & Regulations Guardian: bewaakt primaire bronnen, geldigheidsdata, regelinterpretaties en bronaanduidingen.
- QA & Release Guardian: geeft het definitieve releasebesluit na registry-, route-, test-, build-, zichtbaarheid-, PDF- en regressiecontrole.

## Relatie tussen scherm en PDF

Schermweergave en PDF-output gebruiken dezelfde gevalideerde invoer, domeinberekening, domeinresultaten, resultaatmodellen, viewmodels, toelichtingen en bronmetadata. De PDF-laag mag layout, paginering en tekstplaatsing verzorgen, maar rekent niet opnieuw.

Voorbeelden van gewenste richting:

- `src/lib/mortgage/report.ts` bouwt domeinrapportdata; app-specifieke `report.ts` tekent de PDF.
- DUO-reportmodules bouwen PDF-data vanuit dezelfde centrale resultdata als de webinterface.

Nieuwe PDF-acties moeten vanuit het bestaande resultaat of viewmodel werken. Als PDF en scherm andere getallen tonen, is dat een architectuurfout tenzij expliciet gedocumenteerd en getest als ander perspectief op dezelfde domeinresultaten.
