---
tool: duo-maandbedrag
title: Wat wordt mijn DUO-maandbedrag?
route: /apps/duo-maandbedrag
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:de69040e2b013d26841d72f5e04819e86a04d878101cd300e387889a76e14a5b
sources:
  - apps/duo-maandbedrag/app.json
  - apps/duo-maandbedrag/Calculator.tsx
  - apps/duo-maandbedrag/logic.ts
  - apps/duo-maandbedrag/report.ts
  - src/lib/duo/calculations.ts
  - src/lib/duo/mortgage-assessment.ts
  - src/lib/duo/debt-parts-form.ts
  - src/lib/financial-constants/index.ts
  - src/lib/financial-constants/years.ts
  - src/lib/financial-constants/duo-rate-history.ts
  - src/lib/duo-mortgage-transfer.ts
  - src/lib/profile-tool-mapping.ts
  - src/lib/profile-prefill.ts
  - src/lib/profile-result-mapping.ts
  - src/lib/tool-handoff.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Wat wordt mijn DUO-maandbedrag?

## 1. Identificatie

- **Tool-ID:** `duo-maandbedrag`
- **Publieke route:** `/apps/duo-maandbedrag`
- **Doel:** de wettelijke DUO-maandtermijn berekenen en optioneel een draagkrachtindicatie tonen, met een gecontroleerde retourflow naar hypotheektools.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** `apps/duo-maandbedrag/Calculator.tsx`, adapter `apps/duo-maandbedrag/logic.ts` en centrale DUO-functies in `src/lib/duo/calculations.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open DUO-maandbedrag] --> B{Profiel, handoff of hypotheektransfer?}
  B -->|Ja| C[Neem geldige schuldgegevens vooraf over]
  B -->|Nee| D[Start met lege invoer]
  C --> E[Kies totale schuld of leningdelen]
  D --> E
  E --> F[Kies concrete terugbetalingsregel en rentejaar]
  F --> G{Draagkracht indiceren?}
  G -->|Ja| H[Vul toetsingsinkomen en huishoudsituatie in]
  G -->|Nee| I[Laat inkomen leeg]
  H --> J{Invoer geldig?}
  I --> J
  J -->|Nee| K[Herstel schuld, regeling, rente of inkomen]
  K --> J
  J -->|Ja| L[Bereken wettelijke maandtermijn]
  L --> M[Bekijk optioneel draagkrachtbedrag]
  M --> N{Gestart vanuit hypotheektool?}
  N -->|Ja| O[Bevestig terugsturen van hypotheektoetsbedrag]
  N -->|Nee| P[Bekijk details, profielactie en vervolgstappen]
  O --> Q[Keer terug en vul hypotheektool automatisch]
  P --> R[Download PDF of wijzig invoer]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Leningdelen gekozen?} -->|Ja| B[Valideer delen en bereken gewogen rente]
  A -->|Nee| C[Gebruik totale schuld en gekozen rentejaar]
  B --> D{Concrete regeling bekend?}
  C --> D
  D -->|Nee| E[Blokkeer en verwijs naar Mijn DUO]
  D -->|Ja| F[Bepaal wettelijke looptijd]
  F --> G{Toetsingsinkomen ingevuld?}
  G -->|Nee| H[Toon alleen wettelijke termijn]
  G -->|Ja| I[Bereken draagkrachtvrije voet en percentage]
  I --> J{Draagkracht lager dan wettelijke termijn?}
  J -->|Ja| K[Gebruik draagkracht als indicatief te betalen bedrag]
  J -->|Nee| L[Gebruik wettelijke termijn]
  H --> M{Hypotheektransfer actief?}
  K --> M
  L --> M
  M -->|Ja| N[Maak hypotheekassessment volgens schuldscenario]
  M -->|Nee| O[Geen retourkandidaat nodig]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Schuld of afzonderlijke leningdelen] --> B[Bepaal totale schuld]
  C[Rentejaar per schuld] --> D[Bepaal rente en gewogen rente]
  E[Terugbetalingsregel] --> F[Selecteer 15 of 35 jaar]
  B --> G[Bereken annuitaire wettelijke termijn]
  D --> G
  F --> G
  H[Toetsingsinkomen en huishoudsituatie] --> I[Selecteer draagkrachtvrije voet]
  I --> J[Bereken inkomen boven vrijstelling]
  K[Draagkrachtpercentage per regeling] --> L[Bereken draagkracht per maand]
  J --> L
  G --> M[Neem laagste van wettelijke termijn en draagkracht]
  L --> M
  M --> N[Bepaal bron: wettelijk of draagkracht]
  N --> O[Bouw waarschuwingen en hypotheekassessment]
```

Voor `SF15_OLD` is geen eenvoudig centraal draagkrachtpercentage beschikbaar; die situatie blijft expliciet beperkt en gewaarschuwd. Rentehistorie, looptijden en draagkrachtregels komen via `src/lib/financial-constants/index.ts`.

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant H as Hypotheektool
  participant S as Sessieopslag
  participant D as DUO-maandbedrag
  participant E as Centrale DUO-engine
  participant P as Profiel of PDF
  H->>S: Bewaart hypotheekconcept met transfer-ID
  H->>D: Opent tool met transfer-ID
  D->>S: Leest geldige niet-verlopen transfer
  D->>E: Bereken termijn en hypotheekassessment
  E-->>D: Geeft wettelijk of draagkrachtbedrag
  D->>S: Koppelt kandidaatbedrag aan transfer
  D-->>H: Keert terug via toegestane route
  H->>S: Consumeert transfer en herstelt concept
  D->>P: Kan resultaat lokaal opslaan of als PDF renderen
```

De specifieke hypotheektransfer gebruikt `sessionStorage`, een onvoorspelbaar transfer-ID, een whitelist van retourroutes en een geldigheid van 45 minuten in `src/lib/duo-mortgage-transfer.ts`. Zonder transfer kan profielprefill via `src/lib/profile-tool-mapping.ts` worden gebruikt. Bedragen staan niet in de URL.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Wettelijke maandtermijn | Schuld, rente en wettelijke looptijd | Na geldige berekening | Dit is de termijn volgens het gekozen schuldmodel. |
| Indicatief draagkrachtbedrag | Inkomen boven vrije voet en percentage | Alleen met toetsingsinkomen | DUO stelt draagkracht jaarlijks officieel vast. |
| Hypotheektoetsbedrag | Centrale mortgage-assessmentkeuze | Alleen bij actieve transfer | Kan afwijken van het actueel geïncasseerde bedrag. |
| Gewogen rente | Meerdere leningdelen | Alleen bij leningdelen | Elk deel behoudt eigen rentejaar in de berekening. |
| PDF | Geldige view | Na berekening | Gebruikt hetzelfde resultaat. |

Onbekende regeling, ongeldige schuld, ongeldige leningdelen, een niet-ondersteund rentejaar of negatief inkomen blokkeren. Een ontbrekende, corrupte, verlopen of al verbruikte transfer wordt niet teruggestuurd en toont een herstelmelding.

## 7. Functionele bronverwijzingen

- `apps/duo-maandbedrag/app.json`: publieke identiteit.
- `apps/duo-maandbedrag/Calculator.tsx`: formulier, transferstatus, profiel, resultaat en PDF.
- `apps/duo-maandbedrag/logic.ts`: validatie, portefeuille, draagkracht en transferkandidaat.
- `src/lib/duo/calculations.ts`: wettelijke termijn en draagkrachtindicatie.
- `src/lib/duo/mortgage-assessment.ts`: keuze van relevant hypotheektoetsbedrag.
- `src/lib/duo-mortgage-transfer.ts`: tijdelijke sessie- en retourflow.
- `apps/duo-maandbedrag/report.ts`: PDF uit dezelfde view.
- Regressies: `apps/duo-maandbedrag/logic.test.ts`, `apps/duo-maandbedrag/report.test.ts` en `src/lib/duo/mortgage-assessment.test.ts`.
