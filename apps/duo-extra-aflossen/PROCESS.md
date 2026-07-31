---
tool: duo-extra-aflossen
title: Wat doet extra aflossen?
route: /apps/duo-extra-aflossen
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:a2d16a10f5f11429c857c5abb357c663c97107ae60c40c272af7936aee480417
sources:
  - apps/duo-extra-aflossen/app.json
  - apps/duo-extra-aflossen/Calculator.tsx
  - apps/duo-extra-aflossen/logic.ts
  - apps/duo-extra-aflossen/report.ts
  - src/lib/duo/calculations.ts
  - src/lib/duo/debt-parts-form.ts
  - src/lib/financial-constants/index.ts
  - src/lib/financial-constants/years.ts
  - src/lib/financial-constants/duo-rate-history.ts
  - src/lib/profile-tool-mapping.ts
  - src/lib/profile-prefill.ts
  - src/lib/profile-result-mapping.ts
  - src/lib/tool-handoff.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Wat doet extra aflossen?

## 1. Identificatie

- **Tool-ID:** `duo-extra-aflossen`
- **Publieke route:** `/apps/duo-extra-aflossen`
- **Doel:** het effect van eenmalig en maandelijks extra aflossen tonen op DUO-maandtermijn, looptijd en rente.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** formulier in `apps/duo-extra-aflossen/Calculator.tsx`, adapter in `apps/duo-extra-aflossen/logic.ts` en centrale projectie in `src/lib/duo/calculations.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open Wat doet extra aflossen] --> B{Profiel of handoff beschikbaar?}
  B -->|Ja| C[Neem studieschuldgegevens vooraf over]
  B -->|Nee| D[Start met lege invoer]
  C --> E[Kies totaalbedrag of leningdelen]
  D --> E
  E --> F[Vul regeling en rentejaar in]
  F --> G[Vul huidig maandbedrag optioneel in]
  G --> H[Vul eenmalig en maandelijks extra bedrag in]
  H --> I[Kies lagere maandtermijn of kortere looptijd]
  I --> J{Invoer geldig?}
  J -->|Nee| K[Herstel schuld-, rente- of aflosbedragen]
  K --> J
  J -->|Ja| L[Bereken projectie]
  L --> M[Bekijk nieuwe termijn, einddatum en rentebesparing]
  M --> N[Open volledige berekening en afloscurve]
  N --> O{Vervolgactie?}
  O -->|Profiel| P[Sla resultaat lokaal op]
  O -->|PDF| Q[Download overzicht]
  O -->|Nieuwe invoer| E
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Leningdelen gebruiken?} -->|Nee| B[Gebruik totale schuld met gekozen rentejaar]
  A -->|Ja| C[Valideer ieder leningdeel en bereken gewogen rente]
  B --> D{Concrete regeling gekozen?}
  C --> D
  D -->|Nee| E[Blokkeer en verwijs naar Mijn DUO]
  D -->|Ja| F{Eenmalige aflossing hoger dan schuld?}
  F -->|Ja| G[Blokkeer ongeldige aflossing]
  F -->|Nee| H{Strategie kortere looptijd?}
  H -->|Ja| I[Houd betaalritme hoger en verkort einddatum]
  H -->|Nee| J[Verlaag verplichte maandtermijn]
  I --> K{Aflossing leidt tot directe aflossing?}
  J --> K
  K -->|Ja| L[Zet resterende looptijd en rente op nul]
  K -->|Nee| M[Projecteer maandelijkse rente en betaling]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Schuld of leningdelen] --> B[Bepaal totale schuld en gewogen DUO-rente]
  C[Regeling] --> D[Selecteer wettelijke looptijd]
  B --> E[Bereken wettelijke maandtermijn zonder extra aflossing]
  D --> E
  F[Eenmalige extra aflossing] --> G[Verlaag hoofdsom tot minimaal nul]
  G --> H[Bereken wettelijke maandtermijn na aflossing]
  I[Extra bedrag per maand] --> J[Bepaal feitelijk projectiebedrag]
  H --> J
  K[Gekozen strategie] --> L[Simuleer lagere termijn of kortere looptijd]
  J --> L
  E --> M[Projecteer basislijn per maand]
  L --> N[Projecteer nieuwe lijn per maand]
  M --> O[Vergelijk einddatum, totaal betaald en rente]
  N --> O
  O --> P[Bouw jaarpunten voor afloscurve en waarschuwingen]
```

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant U as Gebruiker
  participant P as Profiel of handoff
  participant T as Extra-aflostool
  participant E as Centrale DUO-engine
  participant R as PDF-generator
  U->>T: Opent tool
  P-->>T: Levert optionele schuld, regeling en rente
  T->>E: Stuurt gevalideerde schuld en extra aflossingen
  E-->>T: Geeft basislijn, nieuwe lijn en waarschuwingen
  T-->>U: Toont maandtermijn, einddatum en rentebesparing
  U->>P: Slaat gekozen resultaat optioneel in profiel op
  U->>R: Downloadt PDF uit hetzelfde resultaat
```

Profiel- en handoffwaarden worden lokaal verwerkt via `src/lib/profile-tool-mapping.ts` en `src/lib/tool-handoff.ts`. De tool heeft geen speciale retourflow naar een andere calculator. PDF-data komt uit de gevalideerde view en `apps/duo-extra-aflossen/report.ts`; er is geen tweede berekening.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Nieuwe verplichte maandtermijn | Resterende schuld na eenmalige aflossing | Na geldige berekening | Kan verschillen van het bedrag dat de gebruiker vrijwillig blijft betalen. |
| Nieuwe einddatum | Maandelijkse simulatie volgens gekozen strategie | Na berekening | Kortere looptijd ontstaat alleen bij passend betaalgedrag. |
| Indicatieve rentebesparing | Verschil tussen beide projecties | Na berekening | Afhankelijk van gekozen rentejaar en constant renteverloop. |
| Afloscurve | Jaarlijkse sluitstanden uit beide tijdlijnen | In verdieping | Maakt verloop zichtbaar, niet een DUO-beschikking. |
| PDF | Laatste geldige view | Na berekening | Gebruikt hetzelfde projectieresultaat als het scherm. |

Onbekende regeling, ongeldige leningdelen, negatieve bedragen en een eenmalige aflossing boven de schuld blokkeren. De centrale engine waarschuwt onder meer wanneer het huidige maandbedrag niet past bij de wettelijke termijn of wanneer een projectie de maximale simulatiehorizon raakt.

## 7. Functionele bronverwijzingen

- `apps/duo-extra-aflossen/app.json`: publieke identiteit en status.
- `apps/duo-extra-aflossen/Calculator.tsx`: formulier, profielprefill, strategie en resultaatweergave.
- `apps/duo-extra-aflossen/logic.ts`: validatie, schuldportefeuille en grafiekdata.
- `apps/duo-extra-aflossen/report.ts`: PDF vanuit de berekende view.
- `src/lib/duo/calculations.ts`: wettelijke termijn, extra-aflosprojectie en tijdlijnen.
- `src/lib/duo/debt-parts-form.ts`: validatie en normalisatie van leningdelen.
- `src/lib/financial-constants/duo-rate-history.ts`: beschikbare rentejaren en percentages.
- Regressies: `apps/duo-extra-aflossen/logic.test.ts` en `apps/duo-extra-aflossen/report.test.ts`.
