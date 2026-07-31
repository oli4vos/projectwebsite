---
tool: duo-aanvullende-beurs
title: Aanvullende beurs berekenen
route: /apps/duo-aanvullende-beurs
status: active-public
lastReviewed: 2026-07-31
sourceHash: sha256:acc7133e3e3a83c72887e2fae3d9140dd53ccd07d67ad92805964428fe14c9c5
sources:
  - apps/duo-aanvullende-beurs/app.json
  - apps/duo-aanvullende-beurs/Calculator.tsx
  - apps/duo-aanvullende-beurs/logic.ts
  - src/lib/duo/additional-grant/index.ts
  - src/lib/financial-constants/duo-additional-grant-rules-2026.ts
  - src/lib/financial-constants/duo-student-finance-amounts-2026.ts
  - src/lib/financial-constants/source-datasets.ts
  - src/lib/tool-journeys.ts
---

# Procesplaat Aanvullende beurs berekenen

## 1. Identificatie

- **Tool-ID:** `duo-aanvullende-beurs`
- **Publieke route:** `/apps/duo-aanvullende-beurs`
- **Doel:** de aanvullende beurs voor 2026 indicatief berekenen voor een reguliere ouder- en inkomenssituatie en bijzondere situaties veilig apart behandelen.
- **Gecontroleerd op:** 2026-07-31.
- **Functionele basis:** formulier en resultaat in `apps/duo-aanvullende-beurs/Calculator.tsx`, adapter in `apps/duo-aanvullende-beurs/logic.ts` en officiële centrale engine in `src/lib/duo/additional-grant/index.ts`.

## 2. Gebruikersproces

```mermaid
flowchart TD
  A[Open Aanvullende beurs berekenen] --> B[Kies opleiding en woonsituatie]
  B --> C{Mbo gekozen?}
  C -->|Ja| D[Vul maand in 2026 en lesgeldplicht in]
  C -->|Nee| E[Ga door naar oudersituatie]
  D --> E
  E --> F{Bijzondere oudersituatie?}
  F -->|Ja| G[Bekijk gerichte DUO-stappen]
  F -->|Nee| H[Kies een of twee meetellende ouders]
  H --> I[Vul ouderinkomen 2024 en betrouwbaarheid in]
  I --> J[Voeg optioneel aftrekposten en andere kinderen toe]
  J --> K{Invoer geldig?}
  K -->|Nee| L[Herstel gemarkeerde invoer]
  L --> K
  K -->|Ja| M[Bereken aanvullende beurs]
  G --> N[Geen regulier bedrag tonen]
  M --> O[Bekijk maandbedrag, jaarbedrag en waarschijnlijk recht]
  O --> P[Open berekening, aannames en bronnen]
  P --> Q[Wijzig invoer of open vervolgstap]
```

## 3. Beslisproces

```mermaid
flowchart TD
  A{Berekeningsjaar 2026?} -->|Nee| B[Niet ondersteund]
  A -->|Ja| C{Bijzondere oudersituatie gekozen?}
  C -->|Ja| D[Status bijzondere DUO-situatie]
  C -->|Nee| E{Alle verplichte oudergegevens bekend?}
  E -->|Nee| F[Status aanvullende gegevens nodig]
  E -->|Ja| G{Inkomen definitief?}
  G -->|Nee| H[Bereken met lagere confidence en officiële controle]
  G -->|Ja| I[Bereken reguliere ouderbijdrage]
  H --> J{Mbo zonder lesgeld of na juli?}
  I --> J
  J -->|Ja| K[Markeer aparte controle of beperking]
  J -->|Nee| L[Gebruik toepasselijk maximumbedrag]
  K --> M{Ouderbijdrage lager dan maximum?}
  L --> M
  M -->|Ja| N[Waarschijnlijk aanvullende beurs]
  M -->|Nee| O[Schatting nul euro]
```

## 4. Rekenproces

```mermaid
flowchart TD
  A[Opleiding, woonsituatie en maand] --> B[Selecteer maximaal maandbedrag 2026]
  C[Een of twee ouders] --> D[Selecteer vrije voet per ouder]
  E[Ouderinkomen 2024] --> F[Bereken inkomen boven vrije voet]
  D --> F
  G[DUO-termijnen ouder en andere kinderen] --> H[Bereken toegestane aftrekposten]
  F --> I[Pas centraal afbouwpercentage toe]
  H --> J[Trek aftrekposten af]
  I --> J
  K[Aantal kinderen met aanvullende beurs] --> L[Verdeel ouderbijdrage per kind]
  J --> L
  B --> M[Trek maandelijkse ouderbijdrage af van maximum]
  L --> M
  M --> N[Begrens uitkomst tussen nul en maximum]
  N --> O[Bereken maand- en jaarbedrag]
  O --> P[Voeg confidence, reason codes, aannames en bronnen toe]
```

De engine gebruikt de getraceerde regels in `src/lib/financial-constants/duo-additional-grant-rules-2026.ts`. Maximale studiefinancieringsbedragen per periode zijn centraal vastgelegd in `src/lib/financial-constants/duo-student-finance-amounts-2026.ts`.

## 5. Gegevensstroom en koppelingen

```mermaid
sequenceDiagram
  participant U as Gebruiker
  participant F as Formulieradapter
  participant E as Aanvullende-beursengine
  participant D as Centrale DUO-dataset
  participant R as Resultaatweergave
  U->>F: Vult opleiding, ouders en inkomen in
  F->>F: Valideert en parseert invoer
  F->>E: Stuurt getypte 2026-invoer
  E->>D: Leest maximumbedragen en rekenregels
  D-->>E: Geeft regels met bronmetadata
  E-->>F: Geeft bedrag, status, trace en reason codes
  F-->>R: Vertaalt naar begrijpelijke labels en waarschuwingen
  R-->>U: Toont resultaat en officiële bronlinks
```

Er is geen profielprefill, sessieherstel, URL-invoer of functionele handoff naar deze tool gevonden. De tool bewaart ouderinkomens niet persistent en heeft geen PDF-uitvoer. Vervolgacties zijn gewone links uit `src/lib/tool-journeys.ts`, zonder overdracht van bedragen.

## 6. Resultaten en uitzonderingen

| Resultaat of status | Ontstaat uit | Wanneer zichtbaar | Belangrijk voor gebruiker |
| --- | --- | --- | --- |
| Waarschijnlijk aanvullende beurs | Berekend bedrag groter dan nul | Na geldige reguliere berekening | DUO stelt het officiële bedrag vast. |
| Waarschijnlijk geen aanvullende beurs | Ouderbijdrage bereikt het maximum | Na geldige berekening | De schatting is nul, niet een formele afwijzing. |
| Officiële controle nodig | Geschat of onzeker ouderinkomen | Na berekening met lagere confidence | Een latere inkomenscorrectie kan terugbetaling geven. |
| Bijzondere DUO-situatie | Overleden, onbekende, buitenlandse of buiten beschouwing te laten ouder | Zodra gekozen | De reguliere formule wordt bewust niet toegepast. |
| Aanvullende gegevens nodig | Verplichte opleiding-, ouder- of inkomensdata ontbreekt | Voor resultaat | Er verschijnt geen berekend bedrag. |

Validatie accepteert negatieve ouderinkomens wanneer DUO die zo verwerkt, maar geldvelden en aantallen moeten verder geldig zijn. Mbo zonder lesgeldplicht en mbo-perioden na juli hebben expliciete reason codes en beperkingen. Er is geen PDF- of opslagvoorwaarde.

## 7. Functionele bronverwijzingen

- `apps/duo-aanvullende-beurs/app.json`: publieke identiteit en status.
- `apps/duo-aanvullende-beurs/Calculator.tsx`: conditionele formulierstappen en resultaatpresentatie.
- `apps/duo-aanvullende-beurs/logic.ts`: validatie, mapping, statuslabels en waarschuwingen.
- `src/lib/duo/additional-grant/index.ts`: pure berekening, trace, confidence en reason codes.
- `src/lib/financial-constants/duo-additional-grant-rules-2026.ts`: officiële 2026-regels en bronwaarden.
- `src/lib/financial-constants/source-datasets.ts`: bronmetadata, geldigheid en freshness.
- Regressies: `apps/duo-aanvullende-beurs/logic.test.ts` en `src/lib/duo/additional-grant/additional-grant.test.ts`.
