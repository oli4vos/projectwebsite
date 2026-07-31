---
tool: hypotheek-impact-studieschuld
title: Hypotheek-impact studieschuld
route: /apps/hypotheek-impact-studieschuld
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:772ffbae7b45e719306894b6901d19310f4897348f3cfdb7eba0c98d6e979f0f
sources:
  - apps/hypotheek-impact-studieschuld/app.json
  - apps/hypotheek-impact-studieschuld/Calculator.tsx
  - apps/hypotheek-impact-studieschuld/form.ts
  - apps/hypotheek-impact-studieschuld/logic.ts
  - apps/hypotheek-impact-studieschuld/duo-transfer.ts
  - apps/hypotheek-impact-studieschuld/report.ts
  - src/lib/duo/calculations.ts
  - src/lib/duo/mortgage-assessment.ts
  - src/lib/duo/debt-parts-form.ts
  - src/lib/mortgage/annuity.ts
  - src/lib/mortgage/present-value.ts
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

# Procesplaat Hypotheek-impact studieschuld

## 1. Identificatie

- **Tool-ID:** `hypotheek-impact-studieschuld`
- **Publieke route:** `/apps/hypotheek-impact-studieschuld`
- **Doel:** indicatief tonen welk deel van de hypotheekruimte samenhangt met het DUO-maandbedrag, inclusief draagkracht, extra aflossen en een gewenst woningbedrag.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** formulier en mapping in `apps/hypotheek-impact-studieschuld/form.ts`, adapter in `apps/hypotheek-impact-studieschuld/logic.ts` en centrale DUO-, hypotheek- en bronmodules uit de frontmatter.

## 2. Gebruikersproces

```mermaid
flowchart TD
    A[Open hypotheekimpact] --> B{Profiel, concept of DUO-retour beschikbaar?}
    B -- Ja --> C[Herstel voorgestelde invoer]
    B -- Nee --> D[Start met lege invoer]
    C --> E[Kies DUO-situatie en aflosregeling]
    D --> E
    E --> F[Vul relevant maandbedrag en studieschuld in]
    F --> G{Schuld uit leningdelen opbouwen?}
    G -- Ja --> H[Vul bedrag en rentejaar per leningdeel in]
    G -- Nee --> I[Vul totale schuld en rentejaar in]
    H --> J[Vul inkomen en hypotheekrente in]
    I --> J
    J --> K[Voeg optioneel woningdoel en aannames toe]
    K --> L{Invoer geldig en essentieel gegeven bekend?}
    L -- Nee --> M[Herstel gemarkeerde invoer]
    M --> E
    L -- Ja --> N[Bereken hypotheekimpact]
    N --> O[Bekijk impact, bandbreedte en waarschuwingen]
    O --> P{Vervolgactie?}
    P -- DUO-bedrag berekenen --> Q[Open DUO-maandbedrag en bewaar concept]
    P -- Rapport --> R[Maak PDF uit hetzelfde resultaat]
    P -- Aanpassen --> E
```

## 3. Beslisproces

```mermaid
flowchart TD
    A[Beoordeel DUO-situatie] --> B{Welke betaalsituatie geldt?}
    B -- Normaal aflossen --> C[Gebruik feitelijk bedrag als beschikbaar]
    B -- Aanloopfase --> D[Gebruik wettelijk of geschat bedrag]
    B -- Draagkrachtverlaging --> E[Vergelijk feitelijk en wettelijk bedrag]
    B -- Betaalpauze --> F[Gebruik wettelijk of geschat bedrag]
    B -- Onbekend --> G[Vereis regeling en wettelijk bedrag of schuld]
    C --> H{Wettelijk bedrag bekend?}
    D --> H
    E --> H
    F --> H
    G --> H
    H -- Ja --> I[Gebruik opgegeven wettelijke termijn]
    H -- Nee, schuld bekend --> J[Schat termijn met schuld, rente en looptijd]
    H -- Nee, schuld ontbreekt --> K[Blokkeer berekening]
    I --> L{Extra aflossing ingevuld?}
    J --> L
    L -- Ja en schuld bekend --> M[Bereken scenario na extra aflossen]
    L -- Nee --> N[Geen extra-aflossingsscenario]
    L -- Ja maar schuld onbekend --> K
    M --> O{Woningdoel ingevuld?}
    N --> O
    O -- Ja --> P[Toon benodigde hypotheek en indicatieve ruimte]
    O -- Nee --> Q[Toon alleen impact op hypotheekruimte]
```

## 4. Rekenproces

```mermaid
flowchart TD
    A[Gevalideerde formulierinvoer] --> B[Bepaal DUO-rente en resterende looptijd]
    B --> C{Losse leningdelen?}
    C -- Ja --> D[Bereken termijn per leningdeel en tel op]
    C -- Nee --> E[Bereken termijn van totale restschuld]
    D --> F[Bepaal relevant wettelijk en feitelijk maandbedrag]
    E --> F
    F --> G[Kies bruteringsfactor bij hypotheekrente]
    G --> H[Zet netto DUO-termijn om in bruto maandimpact]
    H --> I[Bereken contante waarde over hypotheeklooptijd]
    I --> J[Leid optimistische en conservatieve impact af]
    J --> K[Bereken indicatieve inkomensruimte]
    K --> L[Bereken wettelijke draagkracht en vrije maandruimte]
    L --> M{Extra aflossing groter dan nul?}
    M -- Ja --> N[Herbereken schuld, termijn en extra hypotheekruimte]
    M -- Nee --> O[Behoud basisscenario]
    N --> P[Combineer resultaten, aannames en waarschuwingen]
    O --> P
```

De DUO-rentehistorie, standaardlooptijden, draagkrachtregels, bruteringsstaffel en indicatieve woonlastverhouding komen uit `src/lib/financial-constants/index.ts`; annuiteit en contante waarde komen uit de centrale DUO- en hypotheekfuncties. De uitkomst blijft een indicatie en geen volledige kredietacceptatie.

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
    participant G as Gebruiker
    participant H as Hypotheekimpact
    participant S as Sessiehandoff
    participant D as DUO-maandbedrag
    participant P as Profielopslag
    participant R as Rapportgenerator
    G->>H: Vult hypotheek- en DUO-gegevens in
    H->>P: Leest profielprefill en kan resultaat opslaan
    G->>H: Kiest DUO-bedrag berekenen
    H->>S: Bewaart formulierconcept en retourroute
    S->>D: Opent DUO-tool met handoff-token
    D->>S: Schrijft berekend beoordelingsbedrag
    S->>H: Herstelt concept en biedt kandidaat aan
    G->>H: Bevestigt overname van bedrag
    H->>H: Vult passend veld en herberekent
    G->>R: Maakt PDF uit het getoonde resultaat
```

De handoff gebruikt tijdelijke sessieopslag via `src/lib/tool-handoff.ts`; het bedrag wordt niet stil toegepast maar eerst als kandidaat aangeboden. Profielprefill en profielresultaten lopen via de centrale profielmappers. Het rapport in `apps/hypotheek-impact-studieschuld/report.ts` gebruikt dezelfde berekeningsuitkomst als het scherm.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Indicatieve hypotheekimpact | Gebruteerde DUO-termijn en contante waarde | Na geldige berekening | Dit is de geschatte afname van hypotheekruimte, geen offerte. |
| Bandbreedte | Feitelijk, wettelijk en eventueel geschat maandbedrag | Wanneer scenario's verschillen | Een bank kan een ander beoordelingsbedrag gebruiken. |
| Draagkrachtindicatie | Inkomen, regeling en centrale draagkrachtregels | Na berekening | Toont wettelijke termijn en resterende maandruimte naast de hypotheekimpact. |
| Extra-aflossingsscenario | Schuld en een positief extra aflossingsbedrag | Alleen wanneer beide bekend zijn | Vergelijkt lagere termijn met kortere looptijd en indicatieve extra hypotheekruimte. |
| Woningdoel | Woningprijs, eigen geld en indicatieve ruimte | Alleen bij ingevuld woningdoel | Laat een mogelijk tekort of overschot zien. |
| PDF | Dezelfde `HypotheekImpactResult` als op het scherm | Na resultaat | Bevat aannames, bronnen en waarschuwingen zonder apart rekenpad. |

Belangrijkste blokkerende fouten zijn een onbekende aflosregeling, ontbrekend relevant DUO-bedrag zonder schatbare schuld, ongeldige leningdelen, ontbrekend inkomen en ontbrekende hypotheekrente of looptijd. Een verlopen of ongeldige DUO-handoff wordt niet overgenomen; de bestaande invoer blijft dan staan. Onzekere of geschatte betaalgegevens leveren expliciete waarschuwingen op.

## 7. Functionele bronverwijzingen

- `apps/hypotheek-impact-studieschuld/app.json`: bepaalt titel, publieke status, routeafleiding en hoofdcomponent.
- `apps/hypotheek-impact-studieschuld/Calculator.tsx`: beheert formulierstappen, conditionele velden, profiel, handoff, resultaten en rapportactie.
- `apps/hypotheek-impact-studieschuld/form.ts`: bevat defaults, parsing, veldzichtbaarheid en validatie naar domeininvoer.
- `apps/hypotheek-impact-studieschuld/logic.ts`: combineert centrale DUO- en hypotheekfuncties tot de tooluitkomst.
- `apps/hypotheek-impact-studieschuld/duo-transfer.ts`: kiest na bevestiging het juiste veld voor een DUO-retourwaarde.
- `apps/hypotheek-impact-studieschuld/report.ts`: bouwt het PDF-model uit de bestaande uitkomst.
- `src/lib/duo/calculations.ts`: berekent DUO-termijnen, draagkracht en extra-aflossingseffecten.
- `src/lib/duo/mortgage-assessment.ts`: bepaalt welk DUO-bedrag voor de hypotheeksituatie relevant is.
- `src/lib/duo/debt-parts-form.ts`: valideert en totaliseert leningdelen met rentejaren.
- `src/lib/mortgage/annuity.ts`: levert de centrale annuiteitsberekening.
- `src/lib/mortgage/present-value.ts`: zet maandimpact om naar een contante hoofdsom.
- `src/lib/financial-constants/index.ts`: levert centrale DUO-, draagkracht-, bruterings- en hypotheeknormen.
- `src/lib/financial-constants/years.ts`: bepaalt ondersteunde en standaard rekenjaren.
- `src/lib/financial-constants/duo-rate-history.ts`: levert gecontroleerde DUO-rentejaren.
- `src/lib/duo-mortgage-transfer.ts`: definieert het overdrachtsresultaat vanuit DUO.
- `src/lib/profile-tool-mapping.ts`: koppelt profielvelden aan deze tool.
- `src/lib/profile-prefill.ts`: maakt gecontroleerde profielvoorstellen.
- `src/lib/profile-result-mapping.ts`: vertaalt resultaten naar profielupdates.
- `src/lib/tool-handoff.ts`: bewaart en consumeert tijdelijke overdrachten.
- `src/lib/tool-journeys.ts`: levert vervolgstappen naar andere tools.
