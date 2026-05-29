# Start Hier — Agent Protocol voor Invulbladen

Dit bestand is het vaste startpunt voor de agent wanneer de opdracht is:

- "maak tools met behulp van het invulblad"
- "implementeer logica uit artifacts"
- "werk categorie X uit naar werkende tool(s)"

## Scope

Werkmap:

`artifacts/externe-bron-logic-2026-05-28T16-50-04-860Z`

Doelmap voor werkende staging-apps (nog niet live):

`artifacts/staging-apps`

Automatisering:

- `node scripts/build-artifact-toolkits.mjs`
- `node scripts/build-staging-apps-from-toolkits.mjs`
- `npx vitest run --config vitest.artifacts.config.ts`

Invulbladen in deze map zijn de functionele bron voor:

1. berekenlogica
2. inputvalidatie
3. outputcontract
4. testcases

## Bronvolgorde (altijd deze volgorde)

1. Categorie-invulblad (bijv. `basis-berekeningen-logic-invulblad.md`)
2. Eventuele categorie-varianten met alternatieve naam (bijv. `basisberekeningen-logic-invulblad.md`)
3. `extracted/` alleen voor controle/aanvulling
4. `raw/` alleen als fallback

## Canonical categoriebestanden

- `basis-berekeningen-logic-invulblad.md`
- `kalender-vrije-tijd-logic-invulblad.md`
- `gezin-relatie-logic-invulblad.md`
- `geld-lenen-financiering-logic-invulblad.md`
- `hypotheek-wonen-logic-invulblad.md`
- `ondernemen-zzp-dga-logic-invulblad.md`
- `overig-logic-invulblad.md`
- `pensioen-aow-logic-invulblad.md`
- `schenken-erven-logic-invulblad.md`
- `sparen-beleggen-logic-invulblad.md`
- `werk-inkomen-ontslag-logic-invulblad.md`

Opmerking:
`basisberekeningen-logic-invulblad.md` en `lenen-financiering-logic-invulblad.md` zijn compatibiliteitsvarianten. Gebruik primair de canonical bestanden hierboven.

## Verplicht eindresultaat per tool

Voor elke tool moet de agent een werkende staging-app opleveren in:

`artifacts/staging-apps/<tool-slug>/`

Met minimaal deze bestanden:

1. `app.json`
2. `logic.ts`
3. `logic.test.ts`
4. `Calculator.tsx`
5. `README.md`

Optioneel maar aanbevolen:

- `types.ts`
- `fixtures.ts`
- `validation.ts`

## Implementatieprotocol per tool (verplicht)

1. Lees één toolblok volledig uit het invulblad.
2. Converteer `INVUL:`-inhoud naar:
   - inputmodel
   - berekenstappen
   - validatieregels
   - outputmodel
3. Maak of update toolkit-bron onder:
   - `artifacts/toolkits/categories/<categorie>/tools/<tool-slug>/`
4. Implementeer pure logic in:
   - `artifacts/staging-apps/<tool-slug>/logic.ts`
5. Bouw tests in:
   - `artifacts/staging-apps/<tool-slug>/logic.test.ts`
   met minimaal:
   - basiscase
   - edge-case
   - regressiecase
   - ongeldige input (NaN/Infinity/undefined)
6. Implementeer calculator-UI in:
   - `artifacts/staging-apps/<tool-slug>/Calculator.tsx`
   zonder formulewijziging.
7. Voeg `app.json` toe in staging-map met:
   - `status: "draft"`
   - `visibility: "hidden"`
   - juiste `slug`, `title`, `category`, `entry`.
8. Run checks:
   - `npm run test`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
9. Pas pas daarna door naar volgende tool.

## Belangrijke regels

- Geen aannames toevoegen die niet in het invulblad staan, tenzij expliciet gemarkeerd als TODO.
- Als `INVUL:` leeg is: tool niet implementeren, eerst markeren als "onvoldoende specificatie".
- Gebruik centrale helpers waar mogelijk (formatting, input parsing, chart utils, shells).
- Lege velden niet stil interpreteren als 0 als dat inhoudelijk misleidend is.
- Geen categoriebrede bulk-implementatie zonder tussenliggende tests.
- Alles blijft in `artifacts/` tot expliciete opdracht om te verplaatsen.
- Niet schrijven naar `apps/` in deze fase.

## Outputstatus die agent moet rapporteren

Per tool minimaal:

- status: `done` | `blocked` | `needs-spec`
- welke velden uit invulblad gebruikt zijn
- welke tests geslaagd zijn
- open risico's / TODO's

## Definitie "klaar voor productie"

Een tool telt pas als "klaar" wanneer:

1. logic en tests aanwezig zijn;
2. alle checks groen zijn;
3. output aansluit op invulblad;
4. geen NaN/Infinity of onveilige defaults;
5. copy en foutmeldingen in begrijpelijk Nederlands staan.

## Definitie "klaar in artifacts"

Een tool telt pas als "klaar in artifacts" wanneer:

1. alle verplichte staging-bestanden bestaan;
2. `logic.ts` en `logic.test.ts` inhoudelijk overeenkomen met invulblad;
3. staging `app.json` valide is en op `draft/hidden` staat;
4. migratie naar `apps/<slug>/` een pure verplaatsactie is zonder herontwerp.
