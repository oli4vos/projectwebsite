---
tool: artifact-hypotheek-wonen-maximale-hypotheek
title: Maximale hypotheek
route: /apps/artifact-hypotheek-wonen-maximale-hypotheek
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:5cfd16bb57eb18574b20c4c3ae71e98ba51e604b487c3b6a24adc9d98d400277
sources:
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/app.json
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/Calculator.tsx
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/logic.ts
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/duo-transfer.ts
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/salary-explorer.ts
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/SalaryBorrowingPowerExplorer.tsx
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/MortgageCalculationBreakdown.tsx
  - apps/artifact-hypotheek-wonen-maximale-hypotheek/report.ts
  - src/lib/mortgage/max-mortgage.ts
  - src/lib/mortgage/salary-borrowing-power.ts
  - src/lib/financial-constants/index.ts
  - src/lib/financial-constants/years.ts
  - src/lib/financial-constants/mortgage-financing-load.ts
  - src/lib/financial-constants/mortgage-financing-load-data.ts
  - src/lib/duo-mortgage-transfer.ts
  - src/lib/profile-tool-mapping.ts
  - src/lib/profile-prefill.ts
  - src/lib/tool-handoff.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Maximale hypotheek

## 1. Identificatie

- **Tool-ID:** `artifact-hypotheek-wonen-maximale-hypotheek`
- **Publieke route:** `/apps/artifact-hypotheek-wonen-maximale-hypotheek`
- **Doel:** een indicatieve maximale hypotheek bepalen vanuit inkomen, rente, woning, eigen geld, overige schulden, studieschuld, NHG en energiegegevens.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** formulier en orkestratie in `apps/artifact-hypotheek-wonen-maximale-hypotheek/Calculator.tsx`, mapping in `apps/artifact-hypotheek-wonen-maximale-hypotheek/logic.ts` en centrale berekening in `src/lib/mortgage/max-mortgage.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open Maximale hypotheek] --> B{Profiel of handoff beschikbaar?}
  B -->|Ja| C[Neem passende waarden vooraf over]
  B -->|Nee| D[Start met lege invoer]
  C --> E[Vul inkomen en hypotheekrente in]
  D --> E
  E --> F[Vul koopprijs, woningwaarde en eigen geld in]
  F --> G[Geef overige schulden en eventuele DUO-situatie op]
  G --> H[Vul conditionele DUO- en woningdetails in]
  H --> I{Invoer geldig?}
  I -->|Nee| J[Herstel gemarkeerde velden]
  J --> I
  I -->|Ja| K[Bereken maximale hypotheek]
  K --> L[Bekijk maximum, maandlast, woningbudget en begrenzing]
  L --> LA[Open de opbouw van inkomen tot laagste hypotheekgrens]
  LA --> M{Vervolgactie?}
  M -->|Andere invoer| E
  M -->|DUO-bedrag onbekend| N[Open DUO-maandbedrag en keer terug]
  M -->|Salaris verkennen| O[Vergelijk leenruimte bij hoger inkomen]
  M -->|Rapport| P[Download PDF van laatst berekende invoer]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Rentevast minstens 10 jaar?} -->|Ja| B[Gebruik ingevulde hypotheekrente als toetsrente]
  A -->|Nee| C[Gebruik hoogste van hypotheekrente en AFM-toetsrente]
  B --> D{Studieschuld aanwezig?}
  C --> D
  D -->|Nee| E[Geen DUO-impact op maandbudget]
  D -->|Ja| F{DUO-status is al terugbetalen?}
  F -->|Ja| G[Gebruik actueel maandbedrag]
  F -->|Nee| H[Gebruik wettelijk maandbedrag]
  E --> I{NHG gewenst en toepasbaar?}
  G --> I
  H --> I
  I -->|Ja| J[Neem NHG-grens mee]
  I -->|Nee| K[Geen NHG-begrenzing]
  J --> L{Woning- en energiedata bekend?}
  K --> L
  L -->|Ja| M[Pas LTV en energiebedragen toe]
  L -->|Beperkt| N[Gebruik beschikbare woningwaarde zonder extra energieruimte]
  M --> O[Kies laagste grens van inkomen, onderpand en NHG]
  N --> O
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Bruto inkomen en partnerinkomen] --> B[Selecteer financieringslastpercentage 2026]
  C[Hypotheekrente en rentevaste periode] --> D[Bepaal gebruikte toetsrente]
  B --> E[Bereken maximaal woonbudget per maand]
  D --> E
  F[Overige maandlasten en DUO-maandbedrag] --> G[Bereken totale verplichtingen]
  E --> H[Trek verplichtingen af van woonbudget]
  G --> H
  H --> I[Zet beschikbaar maandbudget om naar annuitaire hoofdsom]
  J[Energielabel en verduurzaming] --> K[Bepaal extra inkomensruimte en LTV-ruimte]
  I --> L[Maximum op inkomen inclusief energieruimte]
  K --> L
  M[Woningwaarde] --> N[Bepaal onderpandgrens]
  O[NHG-keuze en koopprijs] --> P[Bepaal eventuele NHG-grens]
  L --> Q[Neem laagste toepasselijke maximum]
  N --> Q
  P --> Q
  Q --> R[Bereken bruto maandlast, woningbudget en tekort eigen geld]
  R --> S[Leid begrenzende factor, confidence en waarschuwingen af]
```

De financieringslasttabel komt uit `src/lib/financial-constants/mortgage-financing-load-data.ts`. NHG-, LTV-, energie- en AFM-normen komen via `src/lib/financial-constants/index.ts`; studieschuldweging en de uiteindelijke minimumselectie staan in `src/lib/mortgage/max-mortgage.ts`.

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant U as Gebruiker
  participant H as Hypotheektool
  participant S as Sessieopslag
  participant D as DUO-maandbedrag
  participant M as Centrale hypotheekengine
  participant P as PDF-generator
  U->>H: Opent tool of ontvangt profielhandoff
  H->>M: Stuurt gevalideerde hypotheekinvoer
  M-->>H: Geeft maximum, uitsplitsing en waarschuwingen
  U->>H: Vraagt hulp bij wettelijk DUO-bedrag
  H->>S: Bewaart concept met transfer-ID voor 45 minuten
  H->>D: Opent DUO-tool met alleen transfer-ID in URL
  D->>S: Schrijft gecontroleerd kandidaatbedrag
  D-->>H: Keert terug via toegestane route
  H->>S: Herstelt concept en consumeert transfer
  H->>M: Rekent direct opnieuw met DUO-bedrag
  U->>P: Downloadt rapport van laatst berekende invoer
```

Profielprefill loopt via `src/lib/profile-tool-mapping.ts` en `src/lib/profile-prefill.ts`. Algemene handoffs gebruiken `src/lib/tool-handoff.ts`; de specifieke retourflow naar `duo-maandbedrag` gebruikt `src/lib/duo-mortgage-transfer.ts` en `sessionStorage`. Financiële bedragen worden niet in de URL gezet.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Indicatieve maximale hypotheek | Laagste toepasselijke inkomens-, onderpand- en NHG-grens | Na geldige berekening | Dit is geen bindend aanbod of advies. |
| Bruto maandlast | Annuiteit over het gekozen maximum | Na berekening | Gebruikt de ingevulde rente, terwijl de hoofdsom met toetsrente kan zijn begrensd. |
| Maximaal woningbudget | Hypotheek plus eigen geld min kosten en verbouwing | Als woninggegevens bestaan | Laat zien welke koopprijs indicatief past. |
| Begrenzende factor | Vergelijking van inkomen, woningwaarde en NHG | Na berekening | Verklaart waarom meer inkomen niet altijd meer leencapaciteit geeft. |
| Berekeningsopbouw | Inkomen, toetsrente, ruimte na verplichtingen en alle grenzen | Na openen van de verdieping | Toont dezelfde tussenuitkomsten en eventueel een hogere tabeluitkomst bij een andere toetsrente. |
| Salarisverkenning | Zelfde centrale engine met alternatief inkomen | Alleen na openen verdieping | Verandert de oorspronkelijke berekening niet. |
| PDF | Laatst gevalideerde invoer en hetzelfde resultaat | Na berekening | PDF rekent niet zelfstandig opnieuw. |

Voornaamste blokkades zijn ontbrekend inkomen, rente, looptijd of koopprijs en ontbrekend relevant DUO-maandbedrag. Waarschuwingen ontstaan onder meer bij indicatieve aannames, onvoldoende eigen geld, NHG- of woningwaardebegrenzing en fallback van de financieringslasttabel. Een verlopen of ongeldige DUO-transfer wordt niet toegepast; de gebruiker blijft bij zijn bestaande formulier.

## 7. Functionele bronverwijzingen

- `apps/artifact-hypotheek-wonen-maximale-hypotheek/app.json`: publicatie, titel en route-entry.
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/Calculator.tsx`: zichtbare stappen, conditionele velden, profielprefill, submit en vervolgacties.
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/logic.ts`: parsing, validatie en mapping naar hypotheekinput.
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/salary-explorer.ts`: validatie en viewmodel voor de salarisverkenning.
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/MortgageCalculationBreakdown.tsx`: toont de gecontroleerde tussenstappen, grenzen en eventuele hogere tabeluitkomst.
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/report.ts`: PDF-opbouw vanuit hetzelfde resultaat.
- `src/lib/mortgage/max-mortgage.ts`: centrale hypotheekberekening, begrenzingen en waarschuwingen.
- `src/lib/financial-constants/mortgage-financing-load-data.ts`: officiële financieringslasttabellen.
- `src/lib/duo-mortgage-transfer.ts`: tijdelijke retourflow via sessieopslag.
- Regressies: `apps/artifact-hypotheek-wonen-maximale-hypotheek/logic.test.ts`, `apps/artifact-hypotheek-wonen-maximale-hypotheek/duo-transfer.test.ts` en `apps/artifact-hypotheek-wonen-maximale-hypotheek/salary-explorer.test.ts`.
