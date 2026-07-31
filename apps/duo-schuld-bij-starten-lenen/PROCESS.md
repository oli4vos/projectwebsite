---
tool: duo-schuld-bij-starten-lenen
title: Wat wordt mijn studieschuld?
route: /apps/duo-schuld-bij-starten-lenen
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:6ebbbc2c1319ae3c453cac4f1ee2653c385c8b2e77089c39793b039456142784
sources:
  - apps/duo-schuld-bij-starten-lenen/app.json
  - apps/duo-schuld-bij-starten-lenen/Calculator.tsx
  - apps/duo-schuld-bij-starten-lenen/logic.ts
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

# Procesplaat Wat wordt mijn studieschuld?

## 1. Identificatie

- **Tool-ID:** `duo-schuld-bij-starten-lenen`
- **Publieke route:** `/apps/duo-schuld-bij-starten-lenen`
- **Doel:** de toekomstige studieschuld ramen voor iemand die zonder beginschuld een nieuwe leenperiode start.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** mode `start-borrowing` in `apps/_duo_simple/FocusedDuoTool.tsx` en centrale scenario-engine in `src/lib/duo/studeren-stoppen.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open Wat wordt mijn studieschuld] --> B[Vul berekeningsmaand in]
  B --> C[Vul maanden tot diploma in]
  C --> D[Vul lening per maand in]
  D --> E[Kies DUO-rentejaar]
  E --> EA{Maximum lenen zonder diploma direct doorrekenen?}
  EA -->|Ja| EB[Vul centrale hbo-wo-maxima voor uitwonend en regulier collegegeld in]
  EB --> K[Bereken scenario doorstuderen zonder diploma]
  EA -->|Nee| F{Verdiepende studiefinanciering invullen?}
  F -->|Ja| G[Vul collegegeldkrediet, basisbeurs en aanvullende beurs in]
  F -->|Nee| H[Gebruik nul voor optionele maandcomponenten]
  G --> I{Invoer geldig?}
  H --> I
  I -->|Nee| J[Herstel datum, duur, bedragen of rentejaar]
  J --> I
  I -->|Ja| K[Bereken nieuwe studieschuld]
  K --> L[Bekijk schuld bij start terugbetaling en totaal betaald]
  L --> LA{Impact op hypotheekruimte bekijken?}
  LA -->|Ja| LB[Bereken impact van de schuld op het diplomamoment]
  LA -->|Nee| M[Open rente, einddatum en betaalcomponenten]
  LB --> M
  M --> N{Vervolgactie?}
  N -->|PDF| O[Download overzicht]
  N -->|Andere invoer| B
  N -->|DUO-maandbedrag| P[Open vervolgtool zonder automatische overdracht]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Berekeningsmaand geldig?} -->|Nee| B[Blokkeer berekening]
  A -->|Ja| C{Maanden tot diploma bekend?}
  C -->|Nee| D[Vraag concrete studieduur]
  C -->|Ja| E{Alle bedragen niet negatief?}
  E -->|Nee| F[Markeer ongeldige bedragen]
  E -->|Ja| G{Rentejaar ondersteund?}
  G -->|Nee| H[Vraag keuze uit beschikbare jaren]
  G -->|Ja| I[Gebruik beginschuld nul en regeling SF35]
  I --> J{Prestatiebeurscomponenten ingevuld?}
  J -->|Ja| K[Volg deze componenten afzonderlijk tot diploma]
  J -->|Nee| L[Projecteer alleen lening en collegegeldkrediet]
  K --> M[Selecteer scenario doorstuderen tot diploma]
  L --> M
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Beginschuld wordt nul] --> B[Maak schuldcomponenten aan]
  C[Maandelijkse lening en collegegeldkrediet] --> D[Voeg altijd terug te betalen schuld toe]
  E[Basisbeurs en aanvullende beurs] --> F[Voeg prestatiebeurscomponenten toe]
  G[DUO-rentejaar] --> H[Bereken maandrente per studiemaand]
  B --> I[Herhaal tot diploma]
  D --> I
  F --> I
  H --> I
  I --> J{Tijdig diploma in gekozen scenario?}
  J -->|Ja| JA[Zet prestatiebeurs om in gift]
  J -->|Nee| JB[Behoud prestatiebeurs als schuld]
  JA --> K[Laat lening doorrenten tot start terugbetaling]
  JB --> K
  K --> L[Bereken wettelijke SF35-maandtermijn]
  L --> M[Simuleer aflossing en totaal betaald]
  M --> N[Toon eindschuld bij start terugbetaling]
  N --> O{Hypotheekimpact openen?}
  O -->|Ja| P[Gebruik nieuwste DUO-rente en 35 jaar voor de maandtermijn]
  P --> Q[Zet de maandtermijn centraal om naar minder hypotheekruimte]
  O -->|Nee| R[Behoud alleen het DUO-resultaat]
```

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant U as Gebruiker
  participant F as Gedeelde DUO-tool
  participant E as Studiescenario-engine
  participant H as Hypotheekimpact-adapter
  participant P as PDF-generator
  U->>F: Vult toekomstige leenperiode in
  F->>E: Stuurt SF35-scenario zonder beginschuld
  E->>E: Scheidt lening en prestatiebeurscomponenten
  E-->>F: Geeft schuld bij terugbetaling en aflossimulatie
  F-->>U: Toont hoofdresultaat en details
  U->>F: Vraagt hypotheekimpact van de eindschuld
  F->>H: Stuurt schuld op het diplomamoment
  H-->>F: Geeft SF35-termijn en indicatief minder hypotheekruimte
  U->>P: Downloadt hetzelfde scenario als PDF
```

Er is geen profielprefill, session storage of persistente gegevensoverdracht. De link naar een volgende tool is navigatie zonder ingevulde bedragen. PDF-uitvoer gebruikt de gedeelde reportmodule en hetzelfde centrale scenarioresultaat.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Eindschuld bij start terugbetaling | Lening plus rente na studie en aanloopfase | Na geldige berekening | Prestatiebeurs wordt alleen als gift behandeld in het diplomascenario. |
| Maximumscenario zonder diploma | Centrale maximale hbo/wo-bedragen en gekozen studieduur | Na de expliciete maximumactie | Regulier collegegeldkrediet is jaarcollegegeld gedeeld door 12. De centrale reisproductwaarde telt als prestatiebeurs mee zolang die geen gift is. |
| Hypotheekimpact eindschuld | Schuld op het diplomamoment, nieuwste DUO-rente en centrale hypotheekdefaults | Na één druk op de impactknop | Indicatie zonder inkomen, draagkracht, andere schulden, woningwaarde of bankbeleid. |
| Totaal terug te betalen | SF35-aflossimulatie | Hoofdresultaat | Inclusief geraamde rente. |
| Rente in aflosfase | Aflossimulatie | In verdieping | Toekomstige rente kan afwijken. |
| Schuldenvrije maand | Einde van simulatie | In verdieping | Persoonlijke draagkracht kan de looptijd veranderen. |
| PDF | Zelfde resultaat | Na berekening | Geen aparte formule. |

De berekening wordt niet uitgevoerd bij ongeldige maand, ontbrekende studieduur, negatieve bedragen of onbekend rentejaar. De tool ondersteunt bewust alleen het eenvoudige SF35-pad.

## 7. Functionele bronverwijzingen

- `apps/duo-schuld-bij-starten-lenen/app.json`: publieke route en metadata.
- `apps/duo-schuld-bij-starten-lenen/Calculator.tsx`: activeert `start-borrowing`.
- `apps/_duo_simple/FocusedDuoTool.tsx`: formulier, verdieping, resultaat en PDF.
- `apps/_duo_simple/focused-logic.ts`: dwingt beginschuld nul en SF35 af en bouwt op verzoek het centrale maximumscenario met de afgeleide collegegeld- en reisproductnormen.
- `apps/_duo_simple/ProjectedDebtMortgageImpact.tsx`: toont de optionele hypotheekimpact na een expliciete gebruikersactie.
- `apps/_duo_simple/projected-debt-mortgage-impact.ts`: vertaalt de eindschuld via de centrale DUO- en hypotheekfuncties naar een indicatie.
- `src/lib/duo/studeren-stoppen.ts`: component-, diploma-, rente- en aflossimulatie, inclusief optioneel doorstuderen zonder diploma.
- Regressies: `apps/duo-schuld-bij-starten-lenen/logic.test.ts` en `src/lib/duo/studeren-stoppen.test.ts`.
