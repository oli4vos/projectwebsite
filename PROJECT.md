# Project Notes

Dit bestand is bedoeld als werksamenvatting voor toekomstige agent-rondes. Werk dit bij zodra architectuur, conventies of kernflows veranderen.

## Doel en toon

- Financiële rekentool-site voor mensen die meer grip, regie en inzicht willen in financiële keuzes.
- Subtiele knipoog naar de pechgeneratie, zonder slachtoffertaal of politieke boosheid.
- Copy moet handelingsgericht zijn: scenario's, keuzes, vooruitkijken, heldere aannames.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4 via `@import "tailwindcss"`
- ESLint 9
- `src/`-structuur met alias `@/*`
- npm als package manager

## Belangrijkste architectuur

- Rekentools leven als losse modules onder `apps/<slug>/`.
- Elke tool heeft verplicht een `app.json` en doorgaans een `Calculator.tsx`.
- `scripts/generate-app-registry.mjs` scant `apps/`, valideert manifests en genereert:
  - `src/lib/app-registry.ts`
  - `src/lib/app-components.tsx`
- `app-registry.ts` bevat alleen metadata.
- `app-components.tsx` lazy-loadt calculatorcomponenten via `next/dynamic`.
- Geen runtime filesystem discovery in de browser.

## Huidige routes

- `/` via `src/app/page.tsx`
- `/apps/[slug]` via `src/app/apps/[slug]/page.tsx`
- `not-found` via `src/app/not-found.tsx`

## Huidige UI-structuur

- `src/app/layout.tsx`: globale fonts, metadata, skip-link
- `src/app/globals.css`: design tokens, typografie, helpers, visuele basis
- `src/components/SiteHeader.tsx`: topnavigatie en CTA's
- `src/components/SiteFooter.tsx`: footerlinks
- `src/components/AppDashboard.tsx`: zoek/filter/dashboardflow
- `src/components/AppCard.tsx`: vertaalt manifest naar card-props
- `src/components/ToolCard.tsx`: daadwerkelijke kaart-UI
- `src/components/AppRenderer.tsx`: pakt lazy toolcomponent op basis van slug
- `src/components/ui.tsx`: `Btn`, `BtnLink`, `Pill`, `Logo`, `CategoryDot`
- `src/components/ExplanationPanel.tsx`: vaste verdiepingsblokken voor berekening, aannames en risico's
- `src/components/ResultReceipt.tsx`: rekensheet-achtige samenvatting van uitkomsten
- `src/components/inputs.tsx`: bevat nu ook `InputField` voor consistente calculatorvelden

## Huidige data/config

- `src/lib/app-types.ts`: manifest-typen
- `src/lib/categories.ts`: mapping van categorie/slug naar visueel category-type
- `src/lib/market.ts`: homepage-marktcontext met externe fetches en fallbacks
- `next.config.ts`: standaard Next-config + GitHub Pages static export in Actions

## Huidige tools

- `apps/studieschuld-vs-beleggen`
  - eenvoudige frontend calculator
  - pure berekening in `logic.ts`
- `apps/annuitair-lineair`
  - wrapper rond bestaande JS-logica
  - bevat oudere rekenscripts in `.js`
- `apps/hypotheek-impact-studieschuld`
  - indicatieve tool voor de impact van een DUO-maandlast op hypotheekruimte
  - gebruikt drie transparante scenariofactoren: 4,5 / 5,0 / 5,5
  - bevat optioneel een simpel aflosscenario op basis van proportionele daling

## Werkwijze bij nieuwe rekentools

1. Maak een map `apps/<slug>/`.
2. Voeg minimaal `app.json` en `Calculator.tsx` toe.
3. Zet pure berekeningen in `logic.ts` als dat logisch is.
4. Draai `npm run generate:apps`.
5. Controleer `npm run typecheck`, `npm run lint`, `npm run build`.

## Belangrijke conventies

- Hou rekenlogica zo veel mogelijk puur en los van UI.
- Validatie gebeurt nu per calculatorcomponent in de client.
- Dashboard haalt alleen manifestdata op uit de gegenereerde registry.
- Donkere CTA's moeten expliciet wit contrast houden. Bronbestand: `src/components/ui.tsx`.
- Designrichting is bewust papierachtig en niet-SaaS:
  - off-white achtergrond
  - donkere inktkleur
  - beperkte radius
  - cards als sheets of scenario-vellen
  - uitleg altijd onder de uitkomst
- Als architectuur of navigatie verandert, update ook dit bestand.

## Risico's en aandachtspunten

- `README.md` loopt deels achter op de werkelijkheid:
  - er staat nog "geen externe API-calls", maar `src/lib/market.ts` gebruikt Yahoo en ECB.
- `src/lib/market.ts` maakt de homepage deels afhankelijk van externe endpoints.
- `src/lib/categories.ts` is nu heuristisch op string-matching gebaseerd; bij meer tools kan dat te grof worden.
- `apps/annuitair-lineair/` mixt TypeScript wrappercode met oudere `.js` rekenscripts; dat maakt uniform onderhoud lastiger.
- Manifesten ondersteunen nu alleen één entry-component per tool; geen subpagina's of complexere toolmodules.

## Aanbevolen uitbreidingsrichting

- Voor nieuwe tools dezelfde modulevorm aanhouden onder `apps/`.
- Eerst metadata/manifest stabiel houden, daarna UI en logica per tool.
- Als er meer tools bijkomen, overweeg `app.json` uit te breiden met extra velden zoals `hero`, `assumptions`, `disclaimer` of `order`.
