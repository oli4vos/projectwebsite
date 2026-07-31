---
tool: schulden-volgorde
title: Vergelijk mijn schulden
route: /apps/schulden-volgorde
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:c24242fb605803847ef3ebaa9756c86c9c745e21ad161cc0dc41be260f7df176
sources:
  - apps/schulden-volgorde/app.json
  - apps/schulden-volgorde/Calculator.tsx
  - apps/schulden-volgorde/logic.ts
  - src/lib/planning/debt-priority.ts
  - src/lib/planning/debt-priority-rules.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Vergelijk mijn schulden

## 1. Identificatie

- **Tool-ID:** `schulden-volgorde`
- **Publieke route:** `/apps/schulden-volgorde`
- **Doel:** verschillende schulden rangschikken en een beschikbaar extra bedrag indicatief verdelen over de meest urgente aflosstappen.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** formulier en validatie in `apps/schulden-volgorde/Calculator.tsx`, dunne exportadapter in `apps/schulden-volgorde/logic.ts` en centrale prioritering in `src/lib/planning/debt-priority.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
    A[Open schuldenvergelijker] --> B[Vul beschikbaar extra bedrag in]
    B --> C[Vul per schuld soort, bedrag en rente in]
    C --> D{Meer schuldregels nodig?}
    D -- Ja --> E[Voeg een schuldregel toe]
    E --> C
    D -- Nee --> F{Invoer geldig?}
    F -- Nee --> G[Herstel bedragen, rente of ontbrekende schuld]
    G --> C
    F -- Ja --> H[Vergelijk schulden]
    H --> I[Bekijk rangorde en verdeling]
    I --> J[Bekijk uitleg en waarschuwingen]
    J --> K{Andere situatie proberen?}
    K -- Ja --> B
    K -- Nee --> L[Bekijk relevante vervolgstappen]
```

De gebruiker kan voorbeeldwaarden laden of alle invoer wissen. Er wordt geen resultaat berekend totdat minimaal een schuld met een positief bedrag en geldige rente aanwezig is.

## 3. Beslisproces

```mermaid
flowchart TD
    A[Controleer schuldregel] --> B{Positief schuldbedrag?}
    B -- Nee --> C[Negeer lege of nulregel]
    B -- Ja --> D{Rente tussen 0 en 100?}
    D -- Nee --> E[Toon validatiefout]
    D -- Ja --> F[Bepaal basisscore voor schuldsoort]
    F --> G[Tel rentescore op]
    G --> H{DUO met lage rente?}
    H -- Ja --> I[Pas DUO-correctie toe]
    H -- Nee --> J[Behoud score]
    I --> K[Rangschik van hoge naar lage score]
    J --> K
    K --> L{Extra bedrag beschikbaar?}
    L -- Ja --> M[Verdeel bedrag in rangorde tot schuld of budget op is]
    L -- Nee --> N[Toon rangorde zonder aflosbedrag]
    M --> O[Voeg uitleg per schuldsoort toe]
    N --> O
```

## 4. Rekenproces

```mermaid
flowchart TD
    A[Gevalideerde schulden en extra bedrag] --> B[Normaliseer negatieve of niet-eindige waarden naar nul]
    B --> C[Rond geld en rente af]
    C --> D[Verwijder schulden zonder positief saldo]
    D --> E[Score is basisscore plus rente maal multiplier]
    E --> F{Lage DUO-rente?}
    F -- Ja --> G[Tel negatieve DUO-correctie op]
    F -- Nee --> H[Geen correctie]
    G --> I[Sorteer aflopend op score]
    H --> I
    I --> J[Wijs per stap minimum van restbudget en schuld toe]
    J --> K[Trek toewijzing van restbudget af]
    K --> L[Lever rang, allocatie, restbedrag en toelichting]
```

De soortbasisscores, rentemultiplier, DUO-drempel en correctie staan in `src/lib/planning/debt-priority-rules.ts`. De tool gebruikt deze rangorde alleen als routehulp; verplichte maandbetalingen, boeterente en contractvoorwaarden worden niet meegerekend.

## 5. Gegevensstroom en koppelingen

```mermaid
flowchart TD
    A[Lokale formulierstatus in browser] --> B[Validatie in Calculator]
    B --> C[DebtPriorityInput]
    C --> D[Centrale debt-priority module]
    D --> E[DebtPriorityResult]
    E --> F[Resultaatweergave en vervolgstappen]
```

Er is geen profielprefill, sessieherstel, URL-overdracht, persistente opslag, PDF of functionele toolhandoff gevonden. Alleen de statische vervolgstappen komen uit `src/lib/tool-journeys.ts`; invoer en resultaat verlaten de lokale React-status niet.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Gerangschikte aflosstappen | Schuldsoort, rente en centrale scoringsregels | Na geldige submit | Hoogste score staat bovenaan; dit is geen persoonlijk financieel advies. |
| Toegewezen extra bedrag | Extra budget verdeeld over de rangorde | Per resultaatregel | Een schuld ontvangt nooit meer dan het openstaande bedrag. |
| Resterend bedrag | Extra bedrag min eerdere toewijzingen | Per stap | Laat zien hoeveel budget na die stap overblijft. |
| Genegeerde regels | Lege of nulschulden | Na berekening wanneer aanwezig | Deze regels doen niet mee aan de rangorde. |
| Vaste waarschuwingen | Beperkingen van de rekenmethode | Altijd bij resultaat | Minimumtermijnen en contractvoorwaarden blijven buiten de berekening. |

Een negatief extra bedrag, een schuld zonder geldige rente, rente buiten 0 tot 100 en een rente zonder positief schuldbedrag blokkeren submit. Gelijke scores behouden de door de invoer aangeleverde volgorde. Een extra bedrag van nul is geldig en toont de prioriteit zonder toewijzing.

## 7. Functionele bronverwijzingen

- `apps/schulden-volgorde/app.json`: bepaalt titel, publieke status, routeafleiding en hoofdcomponent.
- `apps/schulden-volgorde/Calculator.tsx`: bevat defaults, dynamische schuldregels, validatie en resultaatweergave.
- `apps/schulden-volgorde/logic.ts`: exposeert de centrale prioriteitscontracten aan de tool.
- `src/lib/planning/debt-priority.ts`: normaliseert, scoort, sorteert en verdeelt het extra bedrag.
- `src/lib/planning/debt-priority-rules.ts`: bevat de centrale scoringsparameters en drempels voor 2026.
- `src/lib/tool-journeys.ts`: levert alleen de zichtbare vervolgstappen na het resultaat.
