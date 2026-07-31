---
tool: toeslagen-scan
title: Welke toeslagen passen mogelijk bij mij?
route: /apps/toeslagen-scan
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:fd2dd6430ffaca04337e4388d83d4baef33eb68e8757e46e6b317048cad85652
sources:
  - apps/toeslagen-scan/app.json
  - apps/toeslagen-scan/Calculator.tsx
  - apps/toeslagen-scan/logic.ts
  - apps/toeslagen-scan/types.ts
  - apps/toeslagen-scan/copy.ts
  - src/lib/allowances/advisor-experience.ts
  - src/lib/allowances/official-calculations.ts
  - src/lib/allowances/scan-adapters.ts
  - src/lib/allowances/scan-types.ts
  - src/lib/allowances/regulations-pipeline.ts
  - src/lib/allowances/definitions.ts
  - src/lib/allowances/signaling.ts
  - src/lib/allowances/rent-benefit.ts
  - src/lib/allowances/child-budget.ts
  - src/lib/allowances/childcare-benefit.ts
  - src/lib/regulations/question-flow.ts
  - src/lib/regulations/evaluator.ts
  - src/lib/regulations/unknown.ts
  - src/lib/regulations/recommendations.ts
  - src/lib/financial-constants/allowance-calculation-rules-2026.ts
  - src/lib/financial-constants/source-datasets.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Welke toeslagen passen mogelijk bij mij?

## 1. Identificatie

- **Tool-ID:** `toeslagen-scan`
- **Publieke route:** `/apps/toeslagen-scan`
- **Doel:** voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag signaleren of een berekening mogelijk is en waar mogelijk een officiële 2026-indicatie tonen.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** alle formulierstatus en conditionele rendering staan in `apps/toeslagen-scan/Calculator.tsx`; validatie, mappings, Question Flow en viewmodels staan in `apps/toeslagen-scan/logic.ts`; centrale regels en brondata staan in de genoemde allowance-, regulations- en financial-constantsmodules.

## 2. Gebruikersproces

```mermaid
flowchart TD
    A[Open Toeslagenscan] --> B[Vul leeftijd, huishouden, inkomen en vermogen in]
    B --> C{Toeslagpartner?}
    C -- Ja --> D[Vul partnerleeftijd, gezamenlijk inkomen en vermogen in]
    C -- Nee of onbekend --> E[Ga verder met eigen gegevens]
    D --> F[Vul verzekering en woonsituatie in]
    E --> F
    F --> G{Huurwoning?}
    G -- Ja --> H[Vul zelfstandigheid, huur en medebewoners in]
    G -- Nee of onbekend --> I[Ga naar kinderen]
    H --> I
    I --> J{Kinderen?}
    J -- Ja --> K[Vul aantal, leeftijden, kinderbijslag en verblijf in]
    J -- Nee of onbekend --> L[Ga naar controle]
    K --> M{Kinderopvang gebruikt?}
    M -- Ja --> N[Vul registratie, uren, tarief en activiteiten in]
    M -- Nee of onbekend --> L
    N --> L
    L --> O[Question Flow toont voortgang en volgende vraag]
    O --> P{Blokkerende gegevens opgelost?}
    P -- Nee --> Q[Beantwoord alternatieve vraag of herstel invoer]
    Q --> O
    P -- Ja --> R[Bekijk toeslagenindicatie]
    R --> S[Open uitleg, onzekerheden en bronnen per regeling]
    S --> T{Invoer aanpassen?}
    T -- Ja --> B
    T -- Nee --> U[Bekijk vervolgstappen]
```

De gebruiker kan voorbeeldwaarden laden of resetten. `Weet ik niet` blijft tijdelijke intake-invoer: de centrale flow markeert wat blokkeert, welke alternatieve vraag helpt en welke antwoorden verantwoord zijn afgeleid.

## 3. Beslisproces

```mermaid
flowchart TD
    A[Maak answers uit zichtbare formulierinvoer] --> B[Pas afhankelijkheden van de vier regelingen toe]
    B --> C{Antwoord bekend?}
    C -- Ja --> D[Markeer als beantwoord]
    C -- Afleidbaar --> E[Markeer als inferred en vraag zo nodig bevestiging]
    C -- Onbekend --> F{Vraag blokkerend?}
    F -- Ja --> G[Zet flow op blocked en kies volgende vraag]
    F -- Nee --> H[Houd vraag pending of sla toegestaan over]
    D --> I{Vraag van toepassing?}
    E --> I
    H --> I
    I -- Nee --> J[Markeer not-applicable]
    I -- Ja --> K[Behoud vraag in actieve route]
    J --> L[Bereken voortgang en completion state]
    K --> L
    G --> L
    L --> M{Voldoende concrete gegevens?}
    M -- Nee --> N[Toon incomplete of bijzondere status]
    M -- Ja --> O[Evalueer regeling en maak indicatie]
```

De scan neemt geen nieuwe beslissing op basis van recommendation-copy. Recommendations en unknown-resolutionteksten geven alleen context bij de uitkomst van Evaluation en Question Flow.

### Regelingselectie en uitzonderingen

```mermaid
flowchart TD
    A[Huishoudgegevens] --> B{Nederlandse zorgverzekering?}
    B -- Ja --> C[Beoordeel zorgtoeslag]
    B -- Nee --> D[Geen zorgtoeslag]
    B -- Onbekend --> E[Zorgtoeslag onvolledig]
    A --> F{Huurwoning en zelfstandige woonruimte?}
    F -- Ja --> G[Beoordeel huurtoeslag]
    F -- Nee --> H[Geen huurtoeslag of niet van toepassing]
    F -- Onbekend --> I[Huurtoeslag onvolledig]
    A --> J{Kind en recht op kinderbijslag?}
    J -- Ja --> K[Beoordeel kindgebonden budget]
    J -- Nee --> L[Geen kindgebonden budget]
    J -- Onbekend --> M[Kindgebonden budget onvolledig]
    K --> N{Geregistreerde opvang, eigen bijdrage en kwalificerende activiteit?}
    N -- Ja --> O[Beoordeel kinderopvangtoeslag]
    N -- Nee --> P[Geen kinderopvangtoeslag]
    N -- Onbekend --> Q[Kinderopvangtoeslag onvolledig]
```

## 4. Rekenproces

```mermaid
flowchart TD
    A[Gevalideerde formulierstatus] --> B[Map naar publieke scaninput en Regulation answers]
    B --> C[Controleer brondata en rekenjaar 2026]
    C --> D[Evaluation bepaalt recht, ontbrekende velden en reason codes]
    D --> E{Welke regeling?}
    E -- Zorgtoeslag --> F[Pas inkomens- en vermogensregels toe]
    E -- Huurtoeslag --> G[Bepaal rekenhuur en huishoudsituatie]
    E -- Kindgebonden budget --> H[Pas kind-, partner-, inkomens- en vermogensregels toe]
    E -- Kinderopvangtoeslag --> I[Begrens uurprijs en uren en pas inkomenspercentage toe]
    F --> J[Bereken maand- en jaarindicatie]
    G --> J
    H --> J
    I --> J
    J --> K[Combineer estimate, confidence en reason codes]
    K --> L[Maak resultaatkaart per regeling]
    L --> M[Tel alleen berekende bedragen op in totaalschatting]
    M --> N[Voeg ontbrekende invoer, waarschuwingen en bronnen toe]
```

Voor huurtoeslag worden kale huur en toegestane servicekosten via `src/lib/allowances/rent-benefit.ts` verwerkt. Kindgebonden budget gebruikt kindleeftijden en huishoudsituatie via `src/lib/allowances/child-budget.ts`. Kinderopvangtoeslag gebruikt opvangsoort, uren, tarief, geregistreerde opvang, eigen bijdrage en kwalificerende activiteiten via `src/lib/allowances/childcare-benefit.ts`. Alle normen, grenzen, staffels en bronmetadata komen uit `src/lib/financial-constants/allowance-calculation-rules-2026.ts` en geregistreerde datasets.

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
    participant G as Gebruiker
    participant F as Toeslagenformulier
    participant Q as Question Flow
    participant P as Allowance Pipeline
    participant C as Centrale brondata
    participant V as Resultaatweergave
    G->>F: Vult of wijzigt huishoudgegevens
    F->>Q: Stuurt answers en afhankelijkheden
    Q->>F: Geeft voortgang, blocking unknowns en volgende vraag
    G->>F: Verzendt concrete invoer
    F->>P: Map naar scan- en regulationcontracten
    P->>C: Leest officiele regels en bronmetadata voor 2026
    C->>P: Levert normen, staffels en bronnen
    P->>V: Levert vier resultaatkaarten en totaalschatting
    V->>G: Toont uitleg, onzekerheid en bronlinks
```

Er is geen profielprefill, sessieherstel, URL-overdracht, persistente opslag, PDF of functionele handoff naar een andere tool gevonden. Formulier en ingediend resultaat leven alleen in lokale browserstatus; statische vervolgstappen worden opgehaald uit `src/lib/tool-journeys.ts`.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Waarschijnlijk recht met indicatie | Evaluation positief en alle rekeninput concreet | Op de kaart van de regeling | Maand- en jaarbedrag zijn een 2026-indicatie, geen beschikking. |
| Waarschijnlijk geen recht | Een uitsluitende regel of grens is aantoonbaar geraakt | Op de betreffende kaart | Reason codes leggen de doorslaggevende reden uit. |
| Onvolledig | Een benodigd antwoord is nog unknown | Als berekening nog niet verantwoord is | De kaart benoemt ontbrekende informatie en een alternatieve vraag. |
| Bijzondere situatie | Een gemarkeerde complexe uitzondering geldt | Wanneer standaardberekening niet betrouwbaar is | Er wordt geen schijnzeker bedrag getoond. |
| Afgeleid antwoord | Inference kon een veld uit eerdere antwoorden afleiden | In flow en resultaatdetails | Het blijft herkenbaar als inferred en kan bevestiging vereisen. |
| Totaalschatting | Som van resultaatkaarten met een berekend bedrag | Wanneer minstens een bedrag bijdraagt | Onvolledige of niet-berekende regelingen tellen niet stil als nul mee. |

Validatie blokkeert ongeldige getallen, negatieve bedragen, leeftijden buiten 0 tot 120, inconsistente kindaantallen en foutieve lijsten. Conditioneel verborgen velden worden niet als actieve invoer behandeld. Complexe woon-, familie-, buitenlandse, vermogens- of opvangsituaties kunnen tot een bijzondere of onzekere uitkomst leiden. Blocking unknowns voorkomen een definitieve indicatie voor de getroffen regeling; non-blocking unknowns blijven zichtbaar als onzekerheid.

## 7. Functionele bronverwijzingen

- `apps/toeslagen-scan/app.json`: bepaalt titel, publieke status, routeafleiding en hoofdcomponent.
- `apps/toeslagen-scan/Calculator.tsx`: bevat alle zichtbare secties, conditionele velden, submitflow en resultaatkaarten.
- `apps/toeslagen-scan/logic.ts`: valideert, mappt invoer, bouwt Question Flow en maakt de publieke viewmodels.
- `apps/toeslagen-scan/types.ts`: definieert formulier-, fout-, flow- en resultaatcontracten.
- `apps/toeslagen-scan/copy.ts`: vertaalt centrale statuses en reason codes naar gebruikerscopy.
- `src/lib/allowances/advisor-experience.ts`: levert missing-inputbegeleiding, betrouwbaarheid en rapportcontext.
- `src/lib/allowances/official-calculations.ts`: orkestreert de officiële 2026-berekeningen zonder React-afhankelijkheid.
- `src/lib/allowances/scan-adapters.ts`: vertaalt publieke scaninput naar regeling-specifieke berekeningen.
- `src/lib/allowances/scan-types.ts`: definieert het publieke scancontract en regelingresultaten.
- `src/lib/allowances/regulations-pipeline.ts`: voert Regulation Evaluation, recommendations en estimates uit.
- `src/lib/allowances/definitions.ts`: beschrijft velden, afhankelijkheden en regels per toeslag.
- `src/lib/allowances/signaling.ts`: bepaalt signalen, ontbrekende invoer en vaste volgorde van regelingen.
- `src/lib/allowances/rent-benefit.ts`: berekent huurtoeslag op basis van woon- en huishoudgegevens.
- `src/lib/allowances/child-budget.ts`: berekent kindgebonden budget op basis van gezin en inkomen.
- `src/lib/allowances/childcare-benefit.ts`: berekent kinderopvangtoeslag uit opvang en activiteiten.
- `src/lib/regulations/question-flow.ts`: bepaalt volgende vraag, voortgang, blocking en completion state.
- `src/lib/regulations/evaluator.ts`: evalueert centrale Regulation Definitions.
- `src/lib/regulations/unknown.ts`: beschrijft hoe tijdelijke onbekende antwoorden worden opgelost.
- `src/lib/regulations/recommendations.ts`: levert aanvullende context zonder de rekenbeslissing te vervangen.
- `src/lib/financial-constants/allowance-calculation-rules-2026.ts`: bevat gecontroleerde 2026-normen, grenzen en staffels.
- `src/lib/financial-constants/source-datasets.ts`: registreert geldigheid, freshness en primaire bronnen.
- `src/lib/tool-journeys.ts`: levert alleen de vervolgstappen na het scanresultaat.
