# Project Notes

Dit bestand is bedoeld als werksamenvatting voor toekomstige agent-rondes. Werk dit bij zodra architectuur, conventies of kernflows veranderen.

## Doel en toon

- Financiële rekentool-site voor mensen die meer grip, regie en inzicht willen in financiële keuzes.
- Subtiele knipoog naar de pechgeneratie, zonder slachtoffertaal of politieke boosheid.
- Copy moet handelingsgericht zijn: scenario's, keuzes, vooruitkijken, heldere aannames.
- De site moet toegankelijk zijn voor mensen met weinig financiële kennis, maar ook verdieping bieden voor mensen die de berekening echt willen begrijpen.
- Onderliggende boodschap: we hebben misschien pech gehad, maar we zijn niet zielig; we pakken de controle terug.

## Taalconventie frontend

Alle zichtbare tekst in de frontend moet standaard in het Nederlands zijn.

Dit geldt voor:

- navigatie
- knoppen
- formulieren
- labels
- helperteksten
- foutmeldingen
- lege states
- tooltips
- disclaimers
- resultaatblokken
- dashboardteksten
- calculatoruitleg
- verdiepingssecties
- metadata die zichtbaar wordt in de UI

Gebruik geen Engelse frontend-copy zoals:

- "Submit"
- "Reset"
- "Learn more"
- "Get started"
- "No results found"
- "Loading"
- "Error"

Gebruik in plaats daarvan Nederlandse termen, bijvoorbeeld:

- "Bereken"
- "Opnieuw invullen"
- "Lees meer"
- "Bekijk rekentools"
- "Geen resultaten gevonden"
- "Laden..."
- "Er ging iets mis"

Technische bestandsnamen, componentnamen, variabelen, routes en code mogen Engels blijven als dat logisch is voor onderhoudbaarheid.

Interne documentatie mag Nederlands of Engels zijn, maar alle gebruikersgerichte frontend-copy moet Nederlands zijn, tenzij expliciet anders gevraagd.

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
- `/variabelen` via `src/app/variabelen/page.tsx`
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
- `src/components/ToolDisclosure.tsx`: standaard uitklapbare verdiepingssectie voor rekentools

## Huidige data/config

- `src/lib/app-types.ts`: manifest-typen
- `src/lib/categories.ts`: mapping van categorie/slug naar visueel category-type
- `src/lib/market.ts`: homepage-marktcontext met externe fetches en fallbacks
- `src/lib/user-profile.ts`: local-first profieltype, sanitizing en localStorage helpers
- `src/lib/profile-tool-mapping.ts`: centrale mapping van profielwaarden naar tool-defaults
- `src/lib/profile-prefill.ts`: gedeelde helper voor consistente tool-prefill-flow
- `src/lib/financial-constants/`: centrale jaarlijkse aannames/variabelen + helpers
- `src/lib/duo/`: centrale DUO-domeinlaag met wettelijk maandbedrag, relevant maandbedrag per situatie en scenariofuncties voor extra aflossen
- `src/lib/duo/calculations.test.ts`: regressietests voor centrale DUO-berekenfuncties
- `src/lib/tax/`: centrale indicatieve tax-laag voor box 1, hypotheekrenteaftrek en box 3
- `src/lib/financial-constants/index.test.ts`: regressietests voor jaarkeuze/fallbacks en centrale aannames-helpers
- `src/lib/profile-prefill.test.ts` en `src/lib/profile-tool-mapping.test.ts`: regressietests voor centrale profiel-prefill en toolmapping
- `apps/hypotheek-impact-studieschuld/logic.test.ts`: regressietests voor tool-specifieke scenario-uitkomsten en defensieve inputafhandeling
- `next.config.ts`: standaard Next-config + GitHub Pages static export in Actions
- GitHub Pages draait als project-site onder `/projectwebsite` (basePath/assetPrefix worden in Actions automatisch gezet)
- `.github/workflows/ci.yml`: sequentiële CI-checks voor generate/test/lint/typecheck/build
- `.github/workflows/deploy-pages.yml`: deploy draait pas na succesvolle `CI` (`workflow_run`) op `main`; handmatige deploy via `workflow_dispatch` blijft mogelijk

## Huidige tools

- `apps/studieschuld-vs-beleggen`
  - eenvoudige frontend calculator
  - pure berekening in `logic.ts`
  - gebruikt optioneel centrale tax-laag voor een indicatieve box 3-correctie in de verdiepingslaag
  - box 3-methode is instelbaar: `werkelijk` (default) of `forfaitair`
  - box 3-effect wordt jaarlijks toegepast; jaarlijkse heffing wordt uit het beleggingsscenario betaald en telt daarna niet mee in verdere compoundgroei
  - detailweergave bevat een extra uitklaplaag met box 3-betalingen per jaar
  - grafiek gebruikt adaptieve jaar- en euro-assen voor leesbaarheid op mobiel en desktop
- `apps/annuitair-lineair`
  - wrapper rond bestaande JS-logica
  - bevat oudere rekenscripts in `.js`
- `apps/hypotheek-impact-studieschuld`
  - indicatieve tool voor de impact van een DUO-maandlast op hypotheekruimte
  - v2 rekent primair via relevante DUO-maandlast -> brutering -> annuïtaire hypotheekimpact
  - verwerkt DUO-situaties zoals aanloopfase, draagkrachtverlaging en betaalpauze
  - bevat nu ook indicatie van DUO-verplichting op inkomen (draagkracht) versus vrijwillige extra ruimte
  - bevat checklist voor Mijn DUO, uitleg van SF35/SF15-varianten en een nauwkeuriger aflosscenario
- `apps/compensatie-pechgeneratie`
  - staat als draft in de codebase met `visibility: "hidden"`
  - wordt daardoor niet opgenomen in dashboard/route-registry

## Profiel-MVP

- Er is nu een local-first profielpagina op `/profiel`.
- Profieldata wordt alleen lokaal opgeslagen in de browser via `localStorage`.
- Storage key: `project-site:user-profile:v1`.
- Privacy-uitgangspunt: geen server-opslag, geen auth, geen cookies, geen cloud sync.
- Profiel bevat naast inkomen/schuld/wonen/sparen nu ook:
  - werksituatie (loondienst/zzp/mix)
  - AOV-indicatie
  - pensioenopbouw-indicatie
  - box 3-voorkeuren (werkelijk of forfaitair, fiscale partner, voorkeursjaar)
- Gekoppelde tools:
  - `apps/hypotheek-impact-studieschuld`
  - `apps/studieschuld-vs-beleggen`
- Die tools lezen profielwaarden als defaults, maar schrijven nog niet automatisch terug naar het profiel.
- De mapping daarvan loopt centraal via `src/lib/profile-tool-mapping.ts`.
- Tool-prefillgedrag (initial values, profile-key, apply profile patch) loopt gedeeld via `src/lib/profile-prefill.ts`.

## Werkwijze bij nieuwe rekentools

1. Maak een map `apps/<slug>/`.
2. Voeg minimaal `app.json` en `Calculator.tsx` toe.
3. Zet pure berekeningen in `logic.ts` als dat logisch is.
4. Draai `npm run generate:apps`.
5. Controleer `npm run typecheck`, `npm run lint`, `npm run build`.

## Belangrijke conventies

- Hou rekenlogica zo veel mogelijk puur en los van UI.
- DUO-logica (wettelijk maandbedrag, situatie-afhankelijke relevantie, extra aflossen scenario's) loopt centraal via `src/lib/duo`.
- `npm run test` draait lichte unit-tests (Vitest) voor pure domeinlogica.
- Teststrategie:
  - centrale constants altijd via `src/lib/financial-constants` en met regressietests op jaar-fallbacks;
  - DUO-berekeningen via `src/lib/duo` testen op sanitizing, scenario's en clamping;
  - belastingen via `src/lib/tax` testen op indicatieve box 1/box 3/mortgage-interest paden;
  - profielkoppeling altijd via `profile-tool-mapping` + `profile-prefill` en met regressietests;
  - tool-specifieke `logic.ts` alleen testen op gedrag dat niet al in centrale lagen zit.
- `npm run check` draait lokaal dezelfde sequentie als CI inclusief registry-verificatie.
- Taxfuncties in `src/lib/tax` zijn indicatief en bewust beperkt:
  - `calculateBox1Tax`
  - `calculateMortgageInterestDeduction`
  - `calculateBox3Tax`
- De tax-laag is geen volledige IB-aangifte en rekent bewust niet met heffingskortingen, toeslagen, ondernemersaftrek of persoonlijke uitzonderingen.
- Validatie gebeurt nu per calculatorcomponent in de client.
- Dashboard haalt alleen manifestdata op uit de gegenereerde registry.
- Verborgen tools blijven buiten dashboard en app-routes via manifestveld `visibility: "hidden"`.
- Donkere CTA's moeten expliciet wit contrast houden. Bronbestand: `src/components/ui.tsx`.
- Alle gebruikersgerichte frontend-copy is standaard Nederlands. Engelse tekst mag alleen in code, technische namen of wanneer expliciet gekozen.
- Mobile-first is verplicht: elke nieuwe component of tool moet standaard goed werken op mobiel.
- Uitvoerige QA-rondes of brede responsive testmatrices alleen uitvoeren als de gebruiker daarom vraagt én dit bevestigt.
- Bij runtime laadproblemen na deploy is er een Nederlandse error-fallback via `src/app/error.tsx` en `src/app/global-error.tsx`.
- Bij “Deze pagina kon niet goed laden”: eerst hard refresh (`Cmd+Shift+R`) of sitegegevens wissen voor `oli4vos.github.io`.
- UX-standaard voor rekentools:
  - eerst invulvelden
  - dan een beknopte samenvatting met kernuitkomst in gewone taal
  - daarna uitklapbare verdieping, standaard dicht, met uitleg, aannames en praktische aandachtspunten
- Mobiele tool-layout is gecentraliseerd via `src/components/tool/CalculatorShell.tsx`:
  - op mobiel staat de samenvatting/resultaatkaart eerst
  - daarna volgt het formulier met mobile field flow
  - op desktop blijft de twee-kolomsindeling actief
- Regels voor toekomstige tools:
  - gebruik eerst centrale constants uit `src/lib/financial-constants`;
  - gebruik centrale DUO-logica uit `src/lib/duo` waar DUO-input meespeelt;
  - gebruik centrale tax-logica uit `src/lib/tax` voor box 1/box 3/aftrek-indicaties;
  - gebruik profieldefaults uitsluitend via `profile-tool-mapping` + `profile-prefill`;
  - volg het mobiele shell-patroon (`CalculatorShell`) en houd aannames vindbaar via disclosure.
- Jaarlijkse financiële aannames komen centraal uit `src/lib/financial-constants`.
- Toolverdieping mag die centrale aannames tonen, maar light-gebruikers worden niet gedwongen die details te openen.
- In `studieschuld-vs-beleggen` blijft box 3 een optionele verdieping (toggle + disclosure); de hoofdflow blijft licht en bruikbaar zonder fiscale invoer.
- In `studieschuld-vs-beleggen` wordt box 3 nu jaarlijks toegepast in het scenario; belasting wordt per jaar betaald en groeit daarna niet mee in compound.
- Mobiele header schakelt bij omlaag scrollen naar compacte modus (logo + Rekentools/Mijn profiel) en klapt terug open bij omhoog scrollen.
- In `hypotheek-impact-studieschuld` is de oude snelle vuistregel verwijderd; de kern blijft netto DUO-last -> brutering -> annuïtaire impact.
- `hypotheek-impact-studieschuld` toont nu ook een indicatieve inkomens-naar-hypotheek-capaciteit als context (geen officiële leennormberekening).
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
- Cache/chunk mismatches na GitHub Pages deploy kunnen bij sommige browsers tijdelijk voorkomen; error-fallback probeert éénmalig auto-reload bij bekende chunk-load errors.

## Aanbevolen uitbreidingsrichting

- Voor nieuwe tools dezelfde modulevorm aanhouden onder `apps/`.
- Eerst metadata/manifest stabiel houden, daarna UI en logica per tool.
- Als er meer tools bijkomen, overweeg `app.json` uit te breiden met extra velden zoals `hero`, `assumptions`, `disclaimer` of `order`.
- Toekomstige tax-engine kan deze centrale constantslaag hergebruiken, maar is nu bewust nog niet gebouwd.
- Volgende DUO-stap: officiële draagkrachtberekening pas toevoegen zodra alle actuele draagkrachtparameters betrouwbaar in de constantslaag staan.
- Volgende teststap: tax-engine en chart-utils pas opnemen in testlaag zodra die modules stabiel zijn.
- Volgende inhoudelijke stap: DUO-draagkrachtlogica verder verdiepen zodra actuele officiële parameters stabiel en centraal beschikbaar zijn.
- Toekomstige tax-verdieping: meerjarige box 3-projectie of aparte box 3-tool, pas na validatie van gebruikservaring in de huidige optionele v1-koppeling.
- CI controleert expliciet dat `src/lib/app-registry.ts` en `src/lib/app-components.tsx` na `generate:apps` geen diff hebben.

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
