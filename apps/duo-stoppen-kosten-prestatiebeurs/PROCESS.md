---
tool: duo-stoppen-kosten-prestatiebeurs
title: Wat kost stoppen met studeren?
route: /apps/duo-stoppen-kosten-prestatiebeurs
status: active-public
lastReviewed: 2026-08-01
sourceHash: sha256:6dc24cd56362abdb1fdd47e87546d549ea4e3b46c71032a659b1e261829790a8
sources:
  - apps/duo-stoppen-kosten-prestatiebeurs/app.json
  - apps/duo-stoppen-kosten-prestatiebeurs/Calculator.tsx
  - apps/duo-stoppen-kosten-prestatiebeurs/logic.ts
  - apps/_duo_simple/FocusedDuoTool.tsx
  - apps/_duo_simple/focused-logic.ts
  - apps/_duo_simple/ProjectedDebtMortgageImpact.tsx
  - apps/_duo_simple/projected-debt-mortgage-impact.ts
  - apps/duo-doorlenen-of-stoppen/report.ts
  - src/lib/duo/studeren-stoppen.ts
  - src/lib/duo/calculations.ts
  - src/lib/financial-constants/index.ts
  - src/lib/financial-constants/duo-rate-history.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Wat kost stoppen met studeren?

## 1. Identificatie

- **Tool-ID:** `duo-stoppen-kosten-prestatiebeurs`
- **Publieke route:** `/apps/duo-stoppen-kosten-prestatiebeurs`
- **Doel:** tonen welke bestaande lening-, beurs- en reisproductdelen schuld blijven bij stoppen zonder tijdig diploma.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** mode `stop-cost` in `apps/_duo_simple/FocusedDuoTool.tsx`, mapping in `apps/_duo_simple/focused-logic.ts` en centrale componentensimulatie in `src/lib/duo/studeren-stoppen.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open Wat kost stoppen met studeren] --> B[Vul berekeningsmaand in]
  B --> C[Vul huidige lening en collegegeldkrediet in]
  C --> D[Vul basisbeurs en aanvullende beurs als prestatiebeurs in]
  D --> E[Vul waarde van studentenreisproduct in]
  E --> F[Kies DUO-rentejaar]
  F --> G{Invoer geldig?}
  G -->|Nee| H[Herstel datum, bedragen of rentejaar]
  H --> G
  G -->|Ja| I[Bereken scenario stoppen zonder diploma]
  I --> J[Bekijk totaal dat schuld blijft]
  J --> JA{Impact op hypotheekruimte bekijken?}
  JA -->|Ja| JB[Bereken impact van de schuld op het stopmoment]
  JA -->|Nee| K[Bekijk beursdelen, reisproduct en aflossing apart]
  JB --> K
  K --> L{Vervolgactie?}
  L -->|PDF| M[Download overzicht]
  L -->|Andere invoer| B
  L -->|DUO-maandbedrag| N[Open vervolgtool zonder automatische overdracht]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Berekeningsmaand geldig?} -->|Nee| B[Geen resultaat]
  A -->|Ja| C{Alle schuldcomponenten geldig?}
  C -->|Nee| D[Markeer negatieve of onleesbare bedragen]
  C -->|Ja| E{Rentejaar ondersteund?}
  E -->|Nee| F[Vraag geldig DUO-rentejaar]
  E -->|Ja| G[Zet toekomstige maandtoevoegingen op nul]
  G --> H{Diploma in dit scenario?}
  H -->|Nee| I[Zet prestatiebeurs niet om in gift]
  H -->|Ja| J[Dit pad hoort niet bij deze focusuitkomst]
  I --> K[Tel lening, krediet, beurzen en reisproduct als schuld]
  K --> L[Selecteer stop-scenario als resultaat]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Huidige gewone lening] --> B[Altijd terug te betalen component]
  C[Huidig collegegeldkrediet] --> B
  D[Basisbeurs als prestatiebeurs] --> E[Voorwaardelijke schuldcomponent]
  F[Aanvullende beurs als prestatiebeurs] --> E
  G[Studentenreisproduct] --> E
  B --> H[Tel componenten op bij stopdatum]
  E --> H
  I[Geen tijdig diploma] --> J[Geen giftconversie toepassen]
  H --> K[Laat totale schuld doorrenten in aanloopfase]
  J --> K
  L[DUO-rentejaar en SF35] --> M[Bereken wettelijke maandtermijn]
  K --> M
  M --> N[Simuleer totale terugbetaling en einddatum]
  N --> O[Toon totaal en afzonderlijke prestatiebeursdelen]
  O --> P{Hypotheekimpact openen?}
  P -->|Ja| Q[Gebruik nieuwste DUO-rente en 35 jaar voor de maandtermijn]
  Q --> R[Zet de maandtermijn centraal om naar minder hypotheekruimte]
  P -->|Nee| S[Behoud alleen het DUO-resultaat]
```

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant U as Gebruiker
  participant F as Gedeelde DUO-tool
  participant E as Studiescenario-engine
  participant H as Hypotheekimpact-adapter
  participant P as PDF-generator
  U->>F: Neemt componentbedragen uit Mijn DUO over
  F->>E: Stuurt stopscenario zonder toekomstige toevoegingen
  E->>E: Houdt prestatiebeurs als schuld zonder diploma
  E-->>F: Geeft schuldcomponenten en terugbetaalprojectie
  F-->>U: Toont stopkosten en details
  U->>F: Vraagt hypotheekimpact van de eindschuld
  F->>H: Stuurt schuld op het stopmoment
  H-->>F: Geeft SF35-termijn en indicatief minder hypotheekruimte
  U->>P: Downloadt hetzelfde resultaat als PDF
```

Er is geen profielprefill, sessieherstel of persistente toolhandoff. De gebruiker moet bedragen uit Mijn DUO zelf invoeren. Vervolglinks dragen geen financiële gegevens over.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Totaal dat schuld blijft | Som van alle componenten zonder giftconversie | Na geldige berekening | Alleen van toepassing op het getoonde scenario zonder tijdig diploma. |
| Hypotheekimpact eindschuld | Schuld op het stopmoment, nieuwste DUO-rente en centrale hypotheekdefaults | Na één druk op de impactknop | Indicatie zonder inkomen, draagkracht, andere schulden, woningwaarde of bankbeleid. |
| Basisbeurs blijft schuld | Ingevoerde basisbeurscomponent | In details | Werkelijke omzetting hangt af van DUO-voorwaarden en diplomatermijn. |
| Aanvullende beurs blijft schuld | Ingevoerde aanvullende beurscomponent | In details | Bijzondere giftregels worden niet persoonlijk vastgesteld. |
| Studentenreisproduct blijft schuld | Ingevoerde of centraal begrensde reisproductwaarde | In details | De centrale 2026-maandwaarde telt als prestatiebeurs zolang DUO deze niet in een gift heeft omgezet. |
| Terugbetaalprojectie | Totale schuld, rentejaar en SF35 | In verdieping en PDF | Draagkracht kan de feitelijke betaling veranderen. |

Negatieve of onleesbare bedragen en een ongeldig rentejaar blokkeren. Nul is toegestaan. De waarschuwingen benadrukken dat dit geen DUO-beschikking is en dat prestatiebeurs alleen onder toepasselijke voorwaarden een gift wordt.

## 7. Functionele bronverwijzingen

- `apps/duo-stoppen-kosten-prestatiebeurs/app.json`: publieke identiteit.
- `apps/duo-stoppen-kosten-prestatiebeurs/Calculator.tsx`: activeert `stop-cost`.
- `apps/_duo_simple/FocusedDuoTool.tsx`: componentvelden, resultaat en PDF.
- `apps/_duo_simple/focused-logic.ts`: zet toekomstige toevoegingen op nul en kiest het stopscenario.
- `apps/_duo_simple/ProjectedDebtMortgageImpact.tsx`: toont de optionele hypotheekimpact na een expliciete gebruikersactie.
- `apps/_duo_simple/projected-debt-mortgage-impact.ts`: vertaalt de eindschuld via de centrale DUO- en hypotheekfuncties naar een indicatie.
- `src/lib/duo/studeren-stoppen.ts`: schuldcomponenten, giftconversie en aflossimulatie.
- Regressies: `apps/duo-stoppen-kosten-prestatiebeurs/logic.test.ts` en `src/lib/duo/studeren-stoppen.test.ts`.
