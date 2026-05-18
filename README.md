# Financiële rekentools MVP

Een modulaire Next.js-site voor financiële rekentools. Elke rekentool leeft als losse module onder `apps/` en wordt automatisch ontdekt via een `app.json`-manifest.

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

## Beschikbare scripts

```bash
npm run generate:apps
npm run dev
npm run typecheck
npm run lint
npm run build
npm run start
```

`predev` en `prebuild` draaien automatisch eerst `generate:apps`, zodat de registry altijd synchroon blijft met de contents van `apps/`.

## Structuur

```text
apps/
  annuitair-lineair/
    app.json
    Calculator.tsx
    logic.ts
  studieschuld-vs-beleggen/
    app.json
    Calculator.tsx
    logic.ts
  hypotheek-impact-studieschuld/
    app.json
    Calculator.tsx
    logic.ts
  compensatie-pechgeneratie/
    app.json
    Calculator.tsx
    logic.ts

scripts/
  generate-app-registry.mjs

src/
  app/
    apps/[slug]/page.tsx
    profiel/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    AppCard.tsx
    AppDashboard.tsx
    AppRenderer.tsx
    ResultCard.tsx
  lib/
    app-components.tsx
    app-registry.ts
    app-types.ts
    profile-tool-mapping.ts
    user-profile.ts
```

## Nieuwe app toevoegen

1. Maak een nieuwe map onder `apps/<jouw-slug>`.
2. Voeg minimaal deze bestanden toe:
   - `app.json`
   - `Calculator.tsx`
   - optioneel `logic.ts`
3. Zorg dat `slug` exact gelijk is aan de mapnaam.
4. Draai `npm run generate:apps`.
5. Start of herstart `npm run dev`.

### Voorbeeld `app.json`

```json
{
  "slug": "studieschuld-vs-beleggen",
  "title": "Studieschuld aflossen of beleggen",
  "description": "Vergelijk of extra aflossen op je studieschuld financieel gunstiger is dan beleggen.",
  "type": "frontend",
  "category": "Schulden",
  "tags": ["studieschuld", "beleggen", "rente"],
  "status": "active",
  "version": "1.0.0",
  "entry": "Calculator.tsx"
}
```

## Auto-discovery

`scripts/generate-app-registry.mjs` leest alle submappen onder `apps/`, verwacht daar een `app.json`, valideert het manifest en schrijft daarna:

- `src/lib/app-registry.ts`
- `src/lib/app-components.tsx`

De generator valideert minimaal:

- `slug` is verplicht
- `slug` matcht de mapnaam
- `slug` bevat alleen kleine letters, cijfers en koppeltekens
- `title` is verplicht
- `description` is verplicht
- `type` is `frontend` of `api`
- `category` is verplicht
- `tags` is een array
- `status` is `active`, `beta` of `draft`
- `visibility` is optioneel `public` of `hidden` (`public` is default)
- `entry` is verplicht en mag geen `..` bevatten

De browser doet geen filesystem-discovery. Alleen de gegenereerde registry en lazy imports worden gebruikt.

Tools met `"visibility": "hidden"` blijven in de codebase, maar worden niet in de gegenereerde dashboard/route-registry opgenomen.

## Build en deploy

```bash
npm install
npm run generate:apps
npm run build
npm run start
```

Deze app gebruikt Next.js App Router en kan als standaard Node.js Next-app gedeployed worden.

## Publiceren via GitHub Pages

Deze repo is voorbereid op dezelfde route als `volpa`: publiceren via GitHub Pages vanaf `main`, maar dan via GitHub Actions.

1. Maak op GitHub een nieuwe lege repository aan.
2. Push deze map naar de `main` branch van die repository.
3. Ga in GitHub naar `Settings > Pages`.
4. Kies bij `Source`: `GitHub Actions`.
5. Pushes naar `main` bouwen daarna automatisch een statische export en publiceren die op GitHub Pages.

De workflow staat in `.github/workflows/deploy-pages.yml`.

Let op:

- GitHub Pages moet eerst eenmalig op de repository geactiveerd zijn via `Settings > Pages`.
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
- Homepage-marktcontext gebruikt wel externe publieke bronnen met fallbacks (`src/lib/market.ts`).
- Apps worden alleen zichtbaar via een geldig manifest.
- Inputvalidatie gebeurt in de calculatorcomponenten.
- De generator weigert ongeldige manifests of onveilige `entry`-paden.
