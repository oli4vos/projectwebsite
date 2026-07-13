# Grip op je studieschuld

Informatieve rekentools en kennisbank voor mensen met een studieschuld: geen advies, wel eigen cijfers en drie fases om te begrijpen wat je opbouwt, wat je straks gaat betalen en wat je schuld betekent voor een eerste huis.

## Publieke tools

Deze lijst komt overeen met de actuele publieke `app.json`-manifests (`visibility: "public"`):

| Slug | Titel | Status | Categorie |
|---|---|---|---|
| `artifact-hypotheek-wonen-maximale-hypotheek` | Maximale hypotheek | `active` | Hypotheek |
| `duo-doorlenen-of-stoppen` | DUO doorlenen of stoppen | `beta` | Schulden |
| `duo-extra-aflossen` | Wat doet extra aflossen? | `beta` | Schulden |
| `duo-maandbedrag` | Wat wordt mijn DUO-maandbedrag? | `beta` | Schulden |
| `familiehulp-eerste-woning` | Lenen of schenken voor eerste woning | `beta` | Studieschuld & wonen |
| `hypotheek-impact-studieschuld` | Hypotheek-impact studieschuld | `beta` | Hypotheek |
| `schulden-volgorde` | Welke schuld eerst? | `beta` | Schulden |

## Lokaal starten

Gebruik Node.js 20. In deze repo staat daarom ook een `.nvmrc` met `v20.19.6`.

```bash
nvm use
npm install
npm run generate:apps
npm run dev
```

Als `nvm` niet automatisch geladen is, werkt dit ook:

```bash
PATH="$HOME/.nvm/versions/node/v20.19.6/bin:$PATH" npm run dev
```

Open daarna `http://localhost:3000`.

Voor reproduceerbare CI-achtige installaties gebruik je `npm ci`; voor dagelijkse lokale ontwikkeling blijft `npm install` bruikbaar.

## Scripts

| Script | Doel |
|---|---|
| `npm run create:tool` | Scaffoldt een nieuwe tool via `scripts/create-tool.mjs`. |
| `npm run generate:apps` | Genereert `src/lib/app-registry.ts` en `src/lib/app-components.tsx` uit de manifests onder `apps/`. |
| `npm run update:mortgage-financing-load-table` | Werkt de centrale hypotheek-financieringslasttabel bij via het importscripts. |
| `npm run import:artifact-tools` | Importeert staging/artifact-tools naar `apps/`. |
| `npm run browser:compare` | Draait de browservergelijking voor hypotheekaanbiederscenario's. |
| `npm run predev` | Draait automatisch `generate:apps` vóór `dev`. |
| `npm run dev` | Start de Next.js development server. |
| `npm run prebuild` | Draait automatisch `generate:apps` vóór `build`. |
| `npm run build` | Bouwt de Next.js app; in GitHub Actions wordt dit een static export. |
| `npm run start` | Start een lokale Next.js production server na build. |
| `npm run test` | Draait de Vitest unit tests. |
| `npm run test:ux` | Draait Playwright UX-/browsertests. |
| `npm run check` | Draait registry-generatie, generated-file diff-check, unit tests, lint, typecheck en build. |
| `npm run lint` | Draait ESLint over de codebase. |
| `npm run typecheck` | Genereert Next route types en draait `tsc --noEmit`. |

`predev` en `prebuild` draaien automatisch eerst `generate:apps`, zodat de registry synchroon blijft met de inhoud van `apps/`.

## Structuur

```text
apps/
  duo-doorlenen-of-stoppen/
    app.json
    Calculator.tsx
    logic.ts
    logic.test.ts
  duo-maandbedrag/
    app.json
    Calculator.tsx
    logic.ts
    logic.test.ts
  duo-extra-aflossen/
    app.json
    Calculator.tsx
    logic.ts
    logic.test.ts
  hypotheek-impact-studieschuld/
    app.json
    Calculator.tsx
    logic.ts
    logic.test.ts

scripts/
  generate-app-registry.mjs

src/
  app/
    apps/[slug]/page.tsx
    kennisbank/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    AppCard.tsx
    AppDashboard.tsx
    AppRenderer.tsx
    CalculatorShell.tsx
    ResultCard.tsx
  lib/
    app-components.tsx
    app-registry.ts
    app-types.ts
    duo/
    financial-constants/
    mortgage/
```

## Nieuwe app toevoegen

1. Maak een nieuwe map onder `apps/<jouw-slug>`.
2. Voeg minimaal deze bestanden toe:
   - `app.json`
   - `Calculator.tsx`
   - optioneel `logic.ts` en `logic.test.ts`
3. Zorg dat `slug` exact gelijk is aan de mapnaam.
4. Plaats berekeningen in de centrale domeinlaag of in een dunne app-façade. Volg hiervoor `AGENTS.md`.
5. Draai `npm run generate:apps`.
6. Start of herstart `npm run dev`.

### Voorbeeld `app.json`

```json
{
  "slug": "duo-maandbedrag",
  "title": "Wat wordt mijn DUO-maandbedrag?",
  "description": "Bereken je wettelijke DUO-maandtermijn en bekijk optioneel een draagkrachtindicatie.",
  "type": "frontend",
  "category": "Schulden",
  "tags": ["DUO", "studieschuld", "maandbedrag", "draagkracht"],
  "status": "beta",
  "visibility": "public",
  "requiredProfileFields": [
    "studentDebt.remainingDebt",
    "studentDebt.repaymentRule",
    "income.grossAnnualIncome",
    "income.householdType"
  ],
  "reasonHint": "Handig als je wilt begrijpen welk DUO-maandbedrag bij je schuld hoort.",
  "assumptionsUsed": ["duo"],
  "calculationDomains": ["studentDebt", "cashflow"],
  "riskLevel": "medium",
  "disclaimerType": "duoIndicative",
  "outputType": "singleResult",
  "version": "1.0.0",
  "entry": "Calculator.tsx"
}
```

## Auto-discovery

`scripts/generate-app-registry.mjs` leest alle submappen onder `apps/`, verwacht daar een `app.json`, valideert het manifest en schrijft daarna:

- `src/lib/app-registry.ts`
- `src/lib/app-components.tsx`

De generator valideert minimaal:

- `slug` is verplicht;
- `slug` matcht de mapnaam;
- `slug` bevat alleen kleine letters, cijfers en koppeltekens;
- `title` is verplicht;
- `description` is verplicht;
- `type` is `frontend` of `api`;
- `category` is verplicht;
- `tags` is een array;
- `status` is `active`, `beta` of `draft`;
- `visibility` is optioneel `public` of `hidden` (`public` is default);
- `entry` is verplicht en mag geen `..` bevatten.

De browser doet geen filesystem-discovery. Alleen de gegenereerde registry en lazy imports worden gebruikt.

Tools met `"visibility": "hidden"` blijven in de codebase, maar worden niet in de gegenereerde dashboard/route-registry opgenomen.
Als een tool of flow niet meer actief aangeroepen wordt in de zichtbare site, hoort die ook hidden te blijven totdat er expliciet een heractivatiebesluit is.

## Architectuur in het kort

De site gebruikt Next.js App Router met losse tools onder `apps/`. UI verzamelt invoer en toont resultaten; formules en normen horen centraal.

Belangrijke centrale rekenlagen:

- `src/lib/duo/`: studieschuld, DUO-maandbedrag, terugbetalingsregels, extra aflossen en leenfaseprojecties.
- `src/lib/mortgage/`: hypotheek- en leencapaciteitsberekeningen.
- `src/lib/financial-constants/`: jaarafhankelijke aannames, rentes, tabellen en bronmetadata.
- `src/lib/tax/`, `src/lib/pension/` en `src/lib/planning/`: domeinspecifieke berekeningen en scenariohelpers.

`AGENTS.md` is bindend voor agents en engineers. Nieuwe of aangepaste berekeningslogica mag niet verspreid worden toegevoegd en mag niet in `Calculator.tsx` of routecode belanden.

## Documentatiewijzer

| Document | Waarvoor gebruiken |
|---|---|
| `PROJECT.md` | Actuele architectuur, productrichting, zichtbaarheid en technische context. |
| `AGENTS.md` | Verplichte regels voor agents en engineers, vooral centrale rekenlagen en UX-checks. |
| `CONTRIBUTING.md` | Lokale workflow, checks en opleverregels voor wijzigingen. |
| `FUNCTIONALITY_STATUS.md` | Single source of truth voor actief, hidden, voorbereid en uitgeschakeld gedrag. |
| `UX_GUIDELINES.md` | UX-regels voor calculators, formulieren, mobiele flow en toegankelijkheid. |
| `DESIGN_SYSTEM.md` | Design tokens, componentconventies en visuele patronen. |
| `GO_LIVE_CHECKLIST.md` | Release-gate voor juridische copy, aannames, CI, monitoring en export. |
| `docs/` | Aanvullende audits, bronregisters, databasevoorbereiding, browserautomatisering en technische onderzoeksnotities. |

## Positionering

De zichtbare site gaat over studieschuld begrijpen. Publieke copy blijft feitelijk en informatief: geen persoonlijk financieel advies, geen beleggingsadvies en geen aflossen-vs-beleggen-route in de zichtbare site.

Verborgen tools blijven in de codebase om later veilig te kunnen heractiveren. `FUNCTIONALITY_STATUS.md` is leidend voor welke tools en flows publiek zichtbaar zijn.
Inactieve tools worden daarbij standaard uit de publieke registry en navigatie gehouden.

## Build en deploy

```bash
npm install
npm run generate:apps
npm run build
npm run start
```

Deze app gebruikt Next.js App Router. Lokaal draait de app als normale Next.js app; in GitHub Actions schakelt `next.config.ts` automatisch over naar static export voor GitHub Pages.

## Publiceren via GitHub Pages

Deze repo publiceert via GitHub Pages vanaf `main` met GitHub Actions.

1. Ga in GitHub naar `Settings > Pages`.
2. Kies bij `Source`: `GitHub Actions`.
3. Pushes naar `main` bouwen daarna automatisch een statische export en publiceren die op GitHub Pages.

De workflow staat in `.github/workflows/deploy-pages.yml`.

Let op:

- GitHub Pages moet eenmalig op de repository geactiveerd zijn via `Settings > Pages`.
- De workflow kan dat niet zelfstandig inschakelen met alleen de standaard `GITHUB_TOKEN`.
- Zie je in Actions een fout rond `Get Pages site failed` of `Not Found`, dan staat `Source` meestal nog niet op `GitHub Actions`.

Belangrijk:

- Lokaal blijft de app normaal draaien met `npm run dev` en `npm run build`.
- In GitHub Actions schakelt `next.config.ts` automatisch over naar static export.
- Voor project-repositories wordt de juiste `basePath` automatisch afgeleid uit `GITHUB_REPOSITORY`.
- Live marktdata wordt op GitHub Pages een build-time snapshot. De site blijft werken, maar dagelijkse revalidatie van server-side Next caching bestaat daar niet.

## Security-uitgangspunten

- Geen `eval` of willekeurige code-executie.
- Geen secrets in de codebase.
- Geen externe API-calls binnen rekentools.
- Homepage-marktcontext gebruikt externe publieke bronnen met fallbacks (`src/lib/market.ts`).
- Apps worden alleen zichtbaar via een geldig manifest.
- Inputvalidatie gebeurt in calculatorcomponenten en app-façades; formules horen centraal.
- De generator weigert ongeldige manifests of onveilige `entry`-paden.
