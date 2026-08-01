---
tool: duo-leenbedrag-impact
title: Impact van mijn leenbedrag
route: /apps/duo-leenbedrag-impact
status: active-public
lastReviewed: 2026-08-01
sourceHash: sha256:4dc10e91bd7b3597bb9e977b18e6bb017e6c3c0631c6cdd88573d979c4a9e930
sources:
  - apps/duo-leenbedrag-impact/app.json
  - apps/duo-leenbedrag-impact/Calculator.tsx
  - apps/duo-leenbedrag-impact/logic.ts
  - apps/_duo_simple/FocusedDuoTool.tsx
  - apps/_duo_simple/focused-logic.ts
  - apps/_duo_simple/ProjectedDebtMortgageImpact.tsx
  - apps/_duo_simple/projected-debt-mortgage-impact.ts
  - apps/duo-doorlenen-of-stoppen/report.ts
  - src/lib/duo/studeren-stoppen.ts
  - src/lib/duo/calculations.ts
  - src/lib/financial-constants/index.ts
  - src/lib/financial-constants/duo-rate-history.ts
  - src/lib/financial-constants/duo-student-finance-amounts-2026.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Impact van mijn leenbedrag

## 1. Identificatie

- **Tool-ID:** `duo-leenbedrag-impact`
- **Publieke route:** `/apps/duo-leenbedrag-impact`
- **Doel:** laten zien wat een gekozen maandelijkse DUO-lening doet met eindschuld en terugbetaling tijdens een lopende studie.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** mode `monthly-impact` in `apps/_duo_simple/FocusedDuoTool.tsx`, mapping in `apps/_duo_simple/focused-logic.ts` en scenario-engine in `src/lib/duo/studeren-stoppen.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open Impact van mijn leenbedrag] --> B[Vul lening per maand in of gebruik slider]
  B --> C{Verder specificeren?}
  C -->|Nee| D[Gebruik 36 maanden, geen huidige schuld en SF35]
  C -->|Ja| E[Vul maanden tot diploma en huidige schuld in]
  E --> F[Vul optioneel collegegeldkrediet en rentejaar in]
  D --> G{Invoer geldig?}
  F --> G
  G -->|Nee| H[Herstel maandbedrag, duur of rentejaar]
  H --> G
  G -->|Ja| I[Bereken studiescenario]
  I --> J[Bekijk verwachte eindschuld]
  J --> JA{Impact op hypotheekruimte bekijken?}
  JA -->|Ja| JB[Bereken impact van de schuld op het diplomamoment]
  JA -->|Nee| K[Open rente, aflosduur en schuldenvrije datum]
  JB --> K
  K --> L{Vervolgactie?}
  L -->|PDF| M[Download overzicht]
  L -->|Andere lening| B
  L -->|Volgende tool| N[Open voorgestelde studieschuldtool zonder dataoverdracht]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Maandbedrag geldig en niet negatief?} -->|Nee| B[Blokkeer berekening]
  A -->|Ja| C{Studieduur ingevuld?}
  C -->|Nee| D[Gebruik lege invoer als fout of voorbeeldstandaard]
  C -->|Ja| E{Rentejaar ondersteund?}
  E -->|Nee| F[Vraag een beschikbaar DUO-rentejaar]
  E -->|Ja| G[Gebruik SF35 als vaste eenvoudige regeling]
  G --> H{Huidige schuld ingevuld?}
  H -->|Nee| I[Start projectie op nul]
  H -->|Ja| J[Start projectie op bestaande schuld]
  I --> K[Voeg lening en optioneel collegegeldkrediet maandelijks toe]
  J --> K
  K --> L[Selecteer focus: effect van gewijzigd maandbedrag]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Huidige lening en collegegeldkrediet] --> B[Vorm beginschuld]
  C[Lening en collegegeldkrediet per maand] --> D[Vorm maandelijkse toevoeging]
  E[Maanden tot diploma] --> F[Herhaal per studiemaand]
  B --> F
  D --> F
  G[DUO-rentejaar] --> H[Bereken maandrente]
  H --> F
  F --> I[Bereken schuld bij diploma]
  I --> J[Laat rente doorlopen tot start terugbetaling]
  J --> K[Bereken wettelijke SF35-termijn]
  K --> L[Simuleer reguliere aflosfase]
  L --> M[Leid totaal betaald, rente en schuldenvrije maand af]
  M --> N[Selecteer verwachte eindschuld als hoofdresultaat]
  N --> O{Hypotheekimpact openen?}
  O -->|Ja| P[Gebruik nieuwste DUO-rente en 35 jaar voor de maandtermijn]
  P --> Q[Zet de maandtermijn centraal om naar minder hypotheekruimte]
  O -->|Nee| R[Behoud alleen het DUO-resultaat]
```

De eenvoudige flow gebruikt bewust SF35 en geen regelingselector. De actuele beursbedragen dienen alleen als voorbeelddefaults in de gedeelde invoer; de feitelijke berekening gebruikt uitsluitend wat de gebruiker invoert.

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant U as Gebruiker
  participant F as Gedeelde DUO-formulierlaag
  participant E as Studiescenario-engine
  participant H as Hypotheekimpact-adapter
  participant P as Gedeelde PDF-generator
  U->>F: Voert maandlening en optionele details in
  F->>F: Valideert en mapt naar SF35-scenario
  F->>E: Stuurt beginschuld, maandtoevoegingen en studieduur
  E-->>F: Geeft scenario en focusuitkomst
  F-->>U: Toont eindschuld en terugbetaalcontext
  U->>F: Vraagt hypotheekimpact van de eindschuld
  F->>H: Stuurt schuld op het diplomamoment
  H-->>F: Geeft SF35-termijn en indicatief minder hypotheekruimte
  U->>P: Downloadt PDF van hetzelfde scenario
```

Er is geen profielprefill, sessieherstel of persistente opslag. Vervolglinks uit `src/lib/tool-journeys.ts` dragen geen bedragen over. De PDF-renderer staat gedeeld in `apps/duo-doorlenen-of-stoppen/report.ts`, maar de publieke tool blijft de hier beschreven `monthly-impact`-modus.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Verwachte eindschuld | Schuld na studie- en aanloopfase | Na geldige berekening | Gebaseerd op opgegeven maandlening en studieduur. |
| Collegegeldkrediet en reisproduct | Centrale jaar- en maandnormen | Bij invoer van verdiepende maandbedragen | Collegegeldkrediet is jaarlijks wettelijk collegegeld gedeeld door 12; reisproduct telt als prestatiebeurs zolang het geen gift is. |
| Hypotheekimpact eindschuld | Schuld op het diplomamoment, nieuwste DUO-rente en centrale hypotheekdefaults | Na één druk op de impactknop | Indicatie zonder inkomen, draagkracht, andere schulden, woningwaarde of bankbeleid. |
| Totaal terug te betalen | Reguliere SF35-projectie | In resultaatdetails | Inclusief modelrente, zonder persoonlijke draagkracht. |
| Rente in aflosfase | Verschil tussen terugbetaling en startsaldo | In verdieping | Rentepercentages kunnen later veranderen. |
| Schuldenvrij rond | Maandsimulatie van aflossing | In verdieping | Indicatief, geen DUO-beschikking. |
| PDF | Dezelfde scenario-output | Na resultaat | Geen zelfstandig rekenpad. |

Ongeldige maanden, negatieve bedragen of een onbekend rentejaar blokkeren. Als lening en beursbedragen samen boven de centrale maandnorm uitkomen, noemt de foutmelding ook de resterende maximale leenruimte bij de ingevulde beursbedragen. De engine waarschuwt dat toekomstige rente en persoonlijke draagkracht kunnen afwijken.

## 7. Functionele bronverwijzingen

- `apps/duo-leenbedrag-impact/app.json`: publieke identiteit.
- `apps/duo-leenbedrag-impact/Calculator.tsx`: activeert de gedeelde `monthly-impact`-modus.
- `apps/_duo_simple/FocusedDuoTool.tsx`: velden, verdieping, submit, resultaat en PDF.
- `apps/_duo_simple/focused-logic.ts`: defaults, validatie, mapping en focusselectie.
- `apps/_duo_simple/ProjectedDebtMortgageImpact.tsx`: toont de optionele hypotheekimpact na een expliciete gebruikersactie.
- `apps/_duo_simple/projected-debt-mortgage-impact.ts`: vertaalt de eindschuld via de centrale DUO- en hypotheekfuncties naar een indicatie.
- `src/lib/duo/studeren-stoppen.ts`: studie-, aanloop- en aflossimulatie.
- Regressies: `apps/duo-leenbedrag-impact/logic.test.ts` en `src/lib/duo/studeren-stoppen.test.ts`.
