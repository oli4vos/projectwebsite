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
- Manifesten kunnen optioneel `visibility: "public" | "hidden"` zetten.
- Alleen `visibility: "public"` wordt naar de gegenereerde registry/component-map geschreven.
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

## Huidige data/config

- `src/lib/app-types.ts`: manifest-typen
- `src/lib/categories.ts`: mapping van categorie/slug naar visueel category-type
- `src/lib/market.ts`: homepage-marktcontext met externe fetches en fallbacks
- `src/lib/user-profile.ts`: local-first profieltype, sanitizing en localStorage helpers
- `src/lib/profile-tool-mapping.ts`: centrale mapping van profielwaarden naar tool-defaults
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
  - v2 rekent primair via relevante DUO-maandlast -> brutering -> annuïtaire hypotheekimpact
  - verwerkt DUO-situaties zoals aanloopfase, draagkrachtverlaging en betaalpauze
  - bevat checklist voor Mijn DUO, uitleg van SF35/SF15-varianten en een nauwkeuriger aflosscenario
- `apps/compensatie-pechgeneratie`
  - staat als draft in de codebase met `visibility: "hidden"`
  - wordt daardoor niet opgenomen in dashboard/route-registry

## Profiel-MVP

- Er is nu een local-first profielpagina op `/profiel`.
- Profieldata wordt alleen lokaal opgeslagen in de browser via `localStorage`.
- Storage key: `project-site:user-profile:v1`.
- Privacy-uitgangspunt: geen server-opslag, geen auth, geen cookies, geen cloud sync.
- Gekoppelde tools:
  - `apps/hypotheek-impact-studieschuld`
  - `apps/studieschuld-vs-beleggen`
- Die tools lezen profielwaarden als defaults, maar schrijven nog niet automatisch terug naar het profiel.
- De mapping daarvan loopt centraal via `src/lib/profile-tool-mapping.ts`.

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
- Verborgen tools blijven buiten dashboard en app-routes via manifestveld `visibility: "hidden"`.
- Donkere CTA's moeten expliciet wit contrast houden. Bronbestand: `src/components/ui.tsx`.
- Er zijn nu meerdere pechgeneratie/studieschuld-tools; hou tone of voice en disclaimerstijl tussen die modules consistent.
- Partnerstudieschuld zit nog niet als aparte invoer in `apps/hypotheek-impact-studieschuld`; alleen copy/context. Dat is een logische v3-uitbreiding.
- Toekomstige profielstap:
  - expliciet opslaan vanuit tools naar profiel
  - optionele cloud/account-sync
  - eventueel profielvelden als manifestmetadata
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

## Responsive design en layout-conventies

De site moet mobile-first worden ontworpen. Elke pagina en rekentool moet goed werken op mobiel, tablet en laptop/desktop.

### Algemene responsive regels

- Ontwerp eerst voor mobiel en schaal daarna op naar grotere schermen.
- Geen vaste breedtes gebruiken die horizontale scroll veroorzaken.
- Gebruik `max-width` containers in plaats van brede full-width tekstblokken.
- Tekstblokken blijven op desktop beperkt in breedte voor leesbaarheid.
- Layouts mogen op desktop naast elkaar staan, maar moeten op mobiel netjes onder elkaar vallen.
- Gebruik flex/grid bewust:
  - mobiel: meestal één kolom
  - tablet: twee kolommen waar logisch
  - desktop: meerdere kolommen alleen als dit de begrijpelijkheid verbetert
- CTA’s en invoervelden moeten op mobiel makkelijk aanklikbaar zijn.
- Minimaal aanraakvlak voor knoppen en interactieve elementen: ongeveer 44px hoog.

### Typografie

- Gebruik fluid typography met `clamp()` waar logisch.
- Koppen mogen groot zijn op desktop, maar moeten op mobiel compacter blijven.
- Bodytekst moet op mobiel goed leesbaar blijven, niet te klein.
- Op smallere laptops of wanneer het browservenster kleiner wordt, moeten koppen en spacing netjes meeschalen.
- Vermijd enorme hero-teksten die op mobiel of half scherm te veel ruimte innemen.
- Lange financiële uitleg moet scanbaar blijven met korte alinea’s, tussenkoppen en bullets.

### Voorbeeld typografieregel

Gebruik bij voorkeur dit principe:

```css
--text-body: clamp(0.95rem, 0.9rem + 0.2vw, 1.05rem);
--text-lead: clamp(1.05rem, 1rem + 0.35vw, 1.25rem);
--text-h1: clamp(2rem, 1.4rem + 3vw, 4.5rem);
--text-h2: clamp(1.5rem, 1.2rem + 1.4vw, 2.75rem);
```

Doorgevoerd in code:
- `src/app/globals.css`: fluid typografietokens + utility classes.
- `src/components/ui.tsx`: knoppen minimaal ~44px hoog.
- `src/components/SiteHeader.tsx`: nav-items met minimaal ~44px tap-target.
- `src/app/page.tsx`, `src/components/AppDashboard.tsx`, `src/app/apps/[slug]/page.tsx`, `src/components/ToolCard.tsx`: responsievere heading/body-schaal met `clamp()`.
