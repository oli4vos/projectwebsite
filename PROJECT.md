# Project Notes

Dit bestand is bedoeld als werksamenvatting voor toekomstige agent-rondes. Werk dit bij zodra architectuur, conventies of kernflows veranderen.

## Doel en toon

- De huidige launch-scope is: mensen met een studieschuld helpen hun schuld te begrijpen.
- De site vertelt één informatieve route in drie fases: wat bouw ik op, wat ga ik betalen en wat betekent mijn schuld voor een huis?
- Copy moet feitelijk en terughoudend zijn: scenario's, eigen cijfers, vooruitkijken, heldere aannames.
- De rode draad blijft: geen advies, jij bepaalt.
- Er is bewust geen zichtbare aflossen-vs-beleggen- of vermogensallocatieflow in de publieke site.
- De site moet toegankelijk zijn voor mensen met weinig financiële kennis, maar ook verdieping bieden voor mensen die de berekening echt willen begrijpen.

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
- Manifesten ondersteunen daarnaast optionele schaalmetadata:
  - `requiredProfileFields: string[]`
  - `reasonHint: string`
  - `assumptionsUsed: ("duo" | "tax" | "box1" | "box3" | "mortgage" | "investment" | "inflation" | "charts")[]`
  - `calculationDomains: ("studentDebt" | "mortgage" | "housing" | "tax" | "investing" | "saving" | "cashflow" | "employment" | "pension")[]`
  - `riskLevel: "low" | "medium" | "high"`
  - `disclaimerType: "indicative" | "financialEducation" | "taxIndicative" | "mortgageIndicative" | "duoIndicative"`
  - `outputType: "singleResult" | "scenarioComparison" | "timeline" | "checklist" | "mixed"`
- Alleen `visibility: "public"` wordt naar de gegenereerde registry/component-map geschreven.
- `app-registry.ts` bevat alleen metadata.
- `app-components.tsx` lazy-loadt calculatorcomponenten via `next/dynamic`.
- Geen runtime filesystem discovery in de browser.
- Functionele zichtbaarheid wordt waar mogelijk via feature-flags gestuurd in plaats van code te verwijderen.
- Oude functionaliteiten die later terug kunnen komen worden standaard:
  - in UI/UX verborgen;
  - functioneel uitgezet;
  - technisch in code behouden voor snelle heractivatie.
- De publieke app-registry is nu gericht op studieschuld en wonen:
  - `duo-maandbedrag`
  - `duo-extra-aflossen`
  - `duo-leenbedrag-impact`
  - `duo-schuld-bij-starten-lenen`
  - `duo-stoppen-kosten-prestatiebeurs`
  - `hypotheek-impact-studieschuld`
  - `artifact-hypotheek-wonen-maximale-hypotheek`
  - `schulden-volgorde`
  - `familiehulp-eerste-woning`
- `duo-doorlenen-of-stoppen`, `studieschuld-vs-beleggen` en `volgende-euro` blijven technisch aanwezig maar zijn hidden.

## Centrale berekeningslaag

- Alle berekeningslogica moet zo dicht mogelijk bij de centrale domeinlaag staan en mag niet in `Calculator.tsx`, routes of andere presentatiecode worden gedupliceerd.
- `Calculator.tsx` mag alleen:
  - invoer renderen;
  - formuliervalidatie op veldniveau doen;
  - waarden parsen;
  - centrale berekeningsfuncties aanroepen;
  - resultaten en toelichting renderen.
- Gedeelde rekenregels horen eerst in bestaande centrale lagen te landen:
  - `src/lib/duo/` voor studieschuld- en DUO-regels;
  - `src/lib/mortgage/` voor hypotheek- en leenwiskunde;
  - `src/lib/basis-calculations.ts` voor generieke financiële wiskunde;
  - `src/lib/financial-constants/` voor tabellen, normen en jaarkoppelingen;
  - `src/lib/tax/`, `src/lib/pension/` en `src/lib/planning/` voor domeinspecifieke varianten.
- Tool-specifieke `apps/<slug>/logic.ts`-bestanden mogen orchestration doen, maar geen formulekopieën bevatten die al centraal beschikbaar zijn.
- Bij nieuwe berekeningen geldt:
  - eerst bestaande helpers zoeken;
  - daarna centrale laag uitbreiden;
  - pas dan een dunne app-façade toevoegen;
  - nooit dezelfde formule op meerdere plaatsen onderhouden.
- Jaarafhankelijke constants, tabellen en percentages moeten centraal en testbaar beheerd worden, niet verspreid over UI of routecode.

## Huidige routes

- `/` via `src/app/page.tsx`
- `/apps/[slug]` via `src/app/apps/[slug]/page.tsx`
- `/kennisbank` via `src/app/kennisbank/page.tsx`
- `/variabelen` via `src/app/variabelen/page.tsx`
- `not-found` via `src/app/not-found.tsx`

## Huidige UI-structuur

- `src/app/layout.tsx`: globale fonts, metadata, skip-link
- `src/app/globals.css`: design tokens, typografie, helpers, visuele basis
- `src/components/SiteHeader.tsx`: topnavigatie en CTA's
- `src/components/SiteFooter.tsx`: footerlinks
- `src/components/AppDashboard.tsx`: bibliotheek-first homepageflow met doelgroep-/geldroutes, categoriekaarten en tools per onderwerp
- `src/app/kennisbank/page.tsx`: aparte kennisbankpagina met besliskaders los van tooluitkomsten
- `src/components/AppCard.tsx`: vertaalt manifest naar card-props
- `src/components/ToolCard.tsx`: daadwerkelijke kaart-UI
- `src/components/AppRenderer.tsx`: pakt lazy toolcomponent op basis van slug
- `src/components/ui.tsx`: `Btn`, `BtnLink`, `Pill`, `Logo`, `CategoryDot`
- `src/components/ToolDisclosure.tsx`: standaard uitklapbare verdiepingssectie voor rekentools
- `src/components/DisclosureSection.tsx`: lichte presentatie-wrapper rond `ToolDisclosure` voor consistente verdiepingskoppen en spacing
- `src/components/charts.tsx`: gedeelde chartcomponenten met interactieve tooltip-ondersteuning
- `src/app/apps/[slug]/page.tsx`: toont ook manifestmetadata (domeinen, aannames, output/disclaimer/risico) zonder de dashboardflow zwaarder te maken
- Homepage en dashboard zijn nu bibliotheek-first:
  - primaire navigatie via drie fases: schuldopbouw, maandbedrag, wonen
  - doelgroep-/geldroutes zijn centrale configuratie en sturen naar de actieve studieschuld- en woninggroepen
  - hero is kort en taakgericht, zonder aflossen-vs-beleggen-route
  - kennisniveau-keuze (Basis / Normaal / Verdiept) wordt lokaal opgeslagen
  - persoonlijke route blijft beschikbaar maar staat lager en compacter
  - profiel en aannames blijven secundaire, subtiele blokken
- `/variabelen` is nu light-first:
  - bovenaan korte samenvatting met kernwaarden
  - daaronder uitklapbare verdiepingsblokken per domein (DUO, hypotheek, box 1, box 3, grafieken)
  - technische velden worden vertaald naar gewone labels zoals “Gecontroleerd op” en “Bron/aannameset”

## Huidige data/config

- `src/lib/app-types.ts`: manifest-typen
- `src/lib/audience-routes.ts`: centrale doelgroep-/geldroutes met copy, relevante groepen en aanbevolen starttools
- `src/lib/categories.ts`: mapping van categorie/slug naar visueel category-type
- `src/lib/market.ts`: homepage-marktcontext met externe fetches en fallbacks
- `src/lib/user-profile.ts`: local-first profieltype + sanitizing/normalisatie
- `src/lib/storage/profile-store.types.ts`: centrale store-interface voor profielopslag (load/save/clear contract)
- `src/lib/storage/local-profile-store.ts`: huidige localStorage-implementatie achter store-abstraction
- `src/lib/storage/local-profile-store-instance.ts`: gedeelde local store-instantie voor sync + async adapters
- `src/lib/storage/profile-store.ts`: centrale store-selectie (nu localStorage) voor hooks/components
- `src/lib/storage/storage-mode.ts`: opslagmodus-resolver (`local` / `hybrid` / `remote`) via `NEXT_PUBLIC_PROFILE_STORAGE_MODE`
- `src/lib/storage/remote-profile-store.ts`: voorbereidende remote/hybrid stub met veilige local fallback
- `src/lib/storage/profile-store-async.ts`: async entrypoint naast sync profielstore (nog niet actief in UI)
- `src/lib/storage/local-profile-store-async.ts`: async adapter rond de bestaande local store
- `src/lib/storage/remote-profile-store-async.ts`: async remote profielstore met Supabase-pad + veilige fallback naar local bij ontbrekende config/sessie/fouten
- `src/lib/storage/profile-sync.types.ts` + `src/lib/storage/profile-sync-policy.ts`: sync status/reason/eventmodel en conflict policy primitives
- `src/lib/storage/profile-sync-orchestrator.ts`: eenmalige hybrid sync-orchestrator (`syncProfileOnce`) met policy-gedreven conflictkeuze
- `src/lib/storage/profile-sync-events.ts`: lokaal eventlog voor sync-fallbacks (geen profieldata, max 20 events)
- `src/lib/storage/saved-calculations/saved-calculation.types.ts`: domeincontract voor opgeslagen scenario's/berekeningen
- `src/lib/storage/saved-calculations/local-saved-calculation-store.ts`: local-first scenario-opslag (max 50, sanitizing, SSR-safe)
- `src/lib/storage/saved-calculations/saved-calculation-store.ts`: centraal entrypoint met mode-voorbereiding (`local`/`hybrid`/`remote`, nu fallback local)
- `src/lib/storage/saved-calculations/saved-calculation-links.ts`: centrale deep-link helpers voor scenario-heropenflow (`savedCalculationId`)
- `src/lib/storage/saved-calculations/remote-saved-calculation-store.ts`: remote stub voor toekomstige databasefase
- `src/components/ProfileSyncPanel.tsx`: optioneel handmatig sync-paneel op profielpagina (feature-flagged)
- `src/components/SaveScenarioButton.tsx`: compacte handmatige “Scenario opslaan”-actie (feature-flagged, geen autosave)
- `src/components/SavedCalculationsList.tsx`: eenvoudige lijst op `/profiel` met lokaal opgeslagen scenario's, heropen-link en verwijderactie
- `src/components/SavedScenarioComparison.tsx`: feature-flagged vergelijking van de twee meest recente lokale scenario's
- `src/lib/supabase/config.ts` + `src/lib/supabase/browser-client.ts`: optionele browser-safe Supabase configuratie (no-op zonder env vars)
- `src/lib/auth/auth-session.ts` + `src/lib/auth/*.ts`: optioneel auth-session contract met veilige unauthenticated fallback
- `.env.example`: publieke voorbeeldvariabelen voor storage mode en optionele Supabase clientconfig
- `src/lib/user-preferences.ts`: local-first voorkeuren voor uitlegdiepte (`basic` / `standard` / `advanced`)
- `src/lib/profile-tool-mapping.ts`: centrale mapping van profielwaarden naar tool-defaults
- `src/lib/profile-prefill.ts`: gedeelde helper voor consistente tool-prefill-flow
- `src/hooks/useUserPreferences.ts`: sync-hook voor lokale kennisniveauvoorkeur
- `src/lib/financial-constants/`: centrale jaarlijkse aannames/variabelen + helpers
- `src/lib/financial-constants/duo-rate-history.ts`: centrale 5-jaars DUO-rentegeschiedenis voor terugbetalers en rentejaar-herleiding
- `src/lib/chart-utils.ts`: centrale format/tick helpers voor grafieken (hele jaren + eurolabels)
- `src/lib/knowledge-base.ts`: centrale kennisbankcontent; zichtbare topics zijn nu studieschuldartikelen, oude horizon-/beleggingskaders blijven hidden
- `src/lib/number-input.ts`: centrale parser voor numerieke invoer; komma wordt als decimaalpunt behandeld
- `src/lib/copy-glossary.ts`: centrale woordenlijst voor gebruikerstaal bij financiële termen en enumlabels
- `src/components/GlossaryText.tsx`: maakt bekende financiële begrippen klikbaar met korte hover/focus-uitleg
- `src/lib/knowledge-sources.ts`: centrale bronregisters en bronhiërarchie voor kennisbankdocumenten, inclusief DUO-bronnen met `lastChecked`
- `src/lib/duo/`: centrale DUO-domeinlaag met wettelijk maandbedrag, relevant maandbedrag per situatie en scenariofuncties voor extra aflossen
- `src/lib/duo/project-duo-loan.ts`: centrale leenfaseprojectie voor doorlenen of stoppen, inclusief rentevolgorde, aanloopfase, theoretische SF35-maandtermijn en optionele hypotheekimpact
- `src/lib/planning/`: centrale planninghelpers voor doelgroep-/levensgebeurtenis-tools zoals koop-vs-huur, schulden-volgorde en kind-wordt-18
- `src/lib/duo/calculations.test.ts`: regressietests voor centrale DUO-berekenfuncties
- `src/lib/tax/`: centrale indicatieve tax-laag voor box 1, hypotheekrenteaftrek en box 3
- `src/lib/pension/`: centrale indicatieve pensioenlaag voor inleg-/uitkeringsscenario's (jaarruimte/lijfrente)
- `src/lib/financial-constants/index.test.ts`: regressietests voor jaarkeuze/fallbacks en centrale aannames-helpers
- `src/lib/profile-prefill.test.ts` en `src/lib/profile-tool-mapping.test.ts`: regressietests voor centrale profiel-prefill en toolmapping
- `apps/hypotheek-impact-studieschuld/logic.test.ts`: regressietests voor tool-specifieke scenario-uitkomsten en defensieve inputafhandeling
- `next.config.ts`: standaard Next-config + GitHub Pages static export in Actions
- GitHub Pages draait als project-site onder `/projectwebsite` (basePath/assetPrefix worden in Actions automatisch gezet)
- `.github/workflows/ci.yml`: sequentiële CI-checks voor generate/test/lint/typecheck/build
- `.github/workflows/deploy-pages.yml`: deploy draait pas na succesvolle `CI` (`workflow_run`) op `main`; handmatige deploy via `workflow_dispatch` blijft mogelijk
- `GO_LIVE_CHECKLIST.md`: vaste release-gate voor juridische copy, CI, aannames, monitoring en export bij browser-only livegang
- `GO_LIVE_STATUS.md`: actuele go-live voortgang met open handmatige release-gates
- `RELEASE_NOTES.md`: release-overzicht met datum + commit + scope
- `ASSUMPTION_CHANGELOG.md`: expliciet logboek voor wijzigingen in aannames/percentages
- `INCIDENT_RESPONSE.md`: incidentproces met ernstniveaus, reactietijden en communicatieformat
- `docs/database/README.md` + `docs/database/supabase-schema.sql`: voorbereid databaseplan en schema voor side-by-side remote variant
- `src/lib/runtime-monitoring.ts` + `src/components/RuntimeMonitoringBootstrap.tsx`: privacy-first frontend runtime monitoring (error/unhandledrejection), met release-tag en optionele webhook via `NEXT_PUBLIC_MONITORING_WEBHOOK_URL`
- `src/lib/feature-flags.ts`: centrale flags voor tijdelijk uit/aan zetten van productfunctionaliteit (o.a. profiel en kennisniveau)
- `FUNCTIONALITY_STATUS.md`: **SSOT** voor functionele status (actief/uit/hidden/voorbereid) inclusief append-only mutatielog

### Profielopslag (voorbereid op databasevariant)

- Profielopslag loopt nu via een store-abstraction (`ProfileStore`), niet meer direct vanuit de hook naar `localStorage`.
- Opslagmodus loopt via `ProfileStorageMode`:
  - `local` (default): actieve localStorage-opslag.
  - `hybrid` (voorbereid): nu nog fallback naar localStorage.
  - `remote` (voorbereid): nu nog fallback naar localStorage.
- `NEXT_PUBLIC_PROFILE_STORAGE_MODE` bepaalt de modus; onbekende/lege waarden vallen veilig terug op `local`.
- De actieve implementatie blijft local-first (`local-profile-store`) en gebruikt dezelfde storage key/event als voorheen.
- Gedrag in de live site blijft gelijk: browser-only opslag, geen server, geen auth, geen sync.
- Deze laag maakt een latere database-backed store mogelijk achter feature flag, zonder directe UI- of rekengedragswijziging.
- Er bestaan nu twee contracten:
  - sync `ProfileStore` voor de huidige live flow (`useUserProfile`);
  - async `ProfileStoreAsync` als voorbereiding op remote/database.
- Async store is voorbereid maar nog niet geactiveerd in de UI-flow.
- Hybrid sync-orchestrator bestaat, maar wordt nog niet automatisch vanuit UI/hooks getriggerd.
- Er is nu een handmatige sync-entry op `/profiel`, maar alleen bij feature flag + relevante mode/config.
- Geen automatische background sync: sync gebeurt alleen na klik op “Synchroniseer profiel”.
- Echte database/auth-fase komt later en vereist implementatie van de remote async store zonder local fallback.
- Supabase is in deze fase optioneel: zonder `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` blijft runtime volledig local/no-op.
- Auth is voorbereid maar niet actief als verplichte flow; zonder account blijft de site volledig bruikbaar.
- Remote async profielopslag gebruikt `profiles.data` (jsonb) zodra Supabase + sessie beschikbaar zijn; anders blijft local fallback leidend.
- Conflict policy in sync-orchestrator:
  - default `preferNewest`;
  - optioneel `preferLocal`/`preferRemote`;
  - ontbrekende/ongeldige timestamps vallen veilig terug op local.
- Fallback events loggen alleen metadata (status/reason/message/timestamp), nooit volledige profielinhoud.
- Syncstatus in UI toont alleen metadata/events en geen profielpayload.
- Databasefase is nu expliciet gedocumenteerd, maar runtime blijft local-first en static-safe.

### Saved calculations (local-first, feature-flagged MVP)

- Scenario-opslag draait local-first en is UI-matig bewust klein gehouden achter feature flag.
- Doel: later per tool een expliciete “Scenario opslaan”-actie kunnen toevoegen zonder store-refactor.
- Opslag loopt voorlopig lokaal via `project-site:saved-calculations:v1`.
- Data per item:
  - `toolSlug`, `title`, `input`, optioneel `result`, `createdAt`, `updatedAt`, `version`.
- Sanitizing:
  - ongeldige items worden genegeerd;
  - invalid JSON valt veilig terug op lege lijst;
  - maximaal 50 items, newest-first.
- Modegedrag:
  - `local`: lokale opslag;
  - `hybrid`/`remote`: in deze fase nog veilige fallback naar local.
- Privacy:
  - scenario's blijven lokaal totdat account/sync later expliciet wordt geactiveerd.
- Voor de huidige en toekomstige UI geldt:
  - alleen handmatig opslaan (geen autosave);
  - input snapshot verplicht;
  - result snapshot optioneel;
  - duidelijk onderscheid tussen profieldata en scenario-opslag.

### Saved calculations UI MVP (feature-flagged)

- UI staat achter `ENABLE_SAVED_CALCULATIONS` (`NEXT_PUBLIC_ENABLE_SAVED_CALCULATIONS`).
- Default is uit (`false`), zodat live gedrag gelijk blijft zonder env-wijziging.
- Eerste referentie-integratie is alleen in `apps/volgende-euro`:
  - handmatige knop “Scenario opslaan”;
  - alleen na berekend resultaat;
  - opslag van input/resultaat als snapshot (geen meebewegen met latere veldwijzigingen).
- Op `/profiel` staat een compacte lijst “Mijn opgeslagen scenario's”:
  - local-first weergave;
  - max 10 nieuwste in de lijst;
  - verwijderen per item;
  - direct heropenen in de oorspronkelijke tool via `savedCalculationId` queryflow.
- Geen autosave, geen accountdashboard, geen databasecalls, geen remote sync in deze fase.

## Huidige tools

### Publieke tools

- `[public]` `apps/duo-maandbedrag`
  - beta-tool voor wettelijke DUO-maandtermijn en optionele draagkrachtindicatie.
  - gebruikt centrale DUO-berekeningen en centrale DUO-rente/looptijdconstants.
  - biedt een uitgebreide PDF-download op dezelfde centrale uitkomstdata.
  - kan in een veilige returnflow vanuit `hypotheek-impact-studieschuld` een hypotheekassessment-kandidaat teruggeven via sessionStorage, zonder financiële waarden in queryparameters.
- `[public]` `apps/duo-extra-aflossen`
  - beta-tool voor extra aflossen bij DUO.
  - toont feitelijk effect op maandtermijn, looptijd, rentelast en afloscurve zonder beleggingsvergelijking.
  - biedt een uitgebreide PDF-download op dezelfde centrale uitkomstdata.
- `[public]` `apps/duo-leenbedrag-impact`
  - beta-tool voor de impact van een nieuw leenbedrag per maand op de eindschuld.
  - gebruikt centrale DUO-leenfaseberekeningen.
- `[public]` `apps/duo-schuld-bij-starten-lenen`
  - beta-tool voor de verwachte studieschuld bij starten met studeren en maandelijks lenen.
  - gebruikt centrale DUO-leenfaseberekeningen.
- `[public]` `apps/duo-stoppen-kosten-prestatiebeurs`
  - beta-tool voor prestatiebeursbedragen die schuld blijven bij stoppen zonder diploma.
  - gebruikt centrale DUO-regels voor prestatiebeurscomponenten.
- `[public]` `apps/hypotheek-impact-studieschuld`
  - indicatieve tool voor de impact van een DUO-maandlast op hypotheekruimte.
  - rekent primair via relevante DUO-maandlast -> brutering -> annuïtaire hypotheekimpact.
  - verwerkt DUO-situaties zoals aanloopfase, draagkrachtverlaging en betaalpauze.
  - kan een concept lokaal bewaren, naar `duo-maandbedrag` sturen en een teruggegeven DUO-bedrag pas na expliciete bevestiging in het relevante maandbedragveld zetten.
- `[public]` `apps/artifact-hypotheek-wonen-maximale-hypotheek`
  - indicatieve maximale-hypotheektool voor starters zonder bestaande hypotheek.
  - toont inkomen, woningwaarde, studieschuld, NHG, financieringslast en energieruimte in een uitlegpad.
  - gebruikt de centrale hypotheeklaag en centrale financieringslasttabellen.
- `[public]` `apps/schulden-volgorde`
  - beta-tool die achteraf betalen, creditcard, DUO, hypotheek en overige schulden in een extra-aflosvolgorde zet.
  - gebruikt centrale planninghelper `calculateDebtPriority`.
- `[public]` `apps/familiehulp-eerste-woning`
  - beta-tool voor eerste woning met studieschuld, bankhypotheek, eigen geld, familielening en schenking.
  - gebruikt de centrale DUO-, mortgage- en family-financing-lagen.

### Verborgen tools (bewust uit positionering)

- `[hidden]` `apps/duo-doorlenen-of-stoppen`
  - technisch aanwezig, maar het manifest staat nu op `visibility: "hidden"` en de tool zit niet in de gegenereerde publieke registry.
  - heractivatie vereist manifestwijziging, `npm run generate:apps`, groene checks en de volledige blueprint-check.
- `[hidden]` `apps/studieschuld-vs-beleggen`
  - technisch aanwezig maar bewust uit de zichtbare site gehaald.
  - reden: huidige positionering is informatief over studieschuld, niet aflossen-vs-beleggen of vermogensallocatie.
  - alleen heractiveren met expliciete productbeslissing, copycheck en update van `FUNCTIONALITY_STATUS.md`.
- `[hidden]` `apps/volgende-euro`
  - technisch aanwezig maar niet meer gelinkt vanuit de publieke route.
  - reden: bredere prioriteitenhulp valt buiten de huidige studieschuld-launchscope.
- `[hidden]` overige artifact-, hypotheek-, tax-, pensioen-, FIRE-, planning- en concepttools.
  - code en manifests blijven behouden voor heractivatie.
  - publicatie verloopt via manifest `visibility: "public"` plus `npm run generate:apps` en groene checks.

## Profiel-MVP

- Er is nu een local-first profielpagina op `/profiel`.
- Profielinvoer is opgesplitst in stappen (inkomen, studieschuld, wonen, sparen/beleggen, belasting) met voortgangsindicator.
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
  - `apps/jaarruimte-vs-vrij-beleggen`
  - `apps/volgende-euro`
  - `apps/fire-na-belasting`
  - `apps/hypotheek-aflossen-vs-beleggen`
- Die tools lezen profielwaarden als defaults, maar schrijven nog niet automatisch terug naar het profiel.
- De mapping daarvan loopt centraal via `src/lib/profile-tool-mapping.ts`.
- Tool-prefillgedrag (initial values, profile-key, apply profile patch) loopt gedeeld via `src/lib/profile-prefill.ts`.

## Werkwijze bij nieuwe rekentools

1. Maak een map `apps/<slug>/`.
2. Voeg minimaal `app.json` en `Calculator.tsx` toe.
3. Vul manifestmetadata in (`requiredProfileFields`, `assumptionsUsed`, `calculationDomains`, `riskLevel`, `disclaimerType`, `outputType`) voor nieuwe publieke tools.
4. Voeg bij voorkeur `reasonHint` toe in `app.json` voor een korte, informatieve uitleg in persoonlijke route/toolcontext.
4. Zet pure berekeningen in `logic.ts` als dat logisch is.
5. Draai `npm run generate:apps`.
6. Controleer `npm run typecheck`, `npm run lint`, `npm run build`.

## Belangrijke conventies

- Hou rekenlogica zo veel mogelijk puur en los van UI.
- DUO-logica (wettelijk maandbedrag, situatie-afhankelijke relevantie, extra aflossen scenario's) loopt centraal via `src/lib/duo`.
- Pensioeninleg-/uitkeringsaannames voor tools lopen centraal via `src/lib/pension`.
- `npm run test` draait lichte unit-tests (Vitest) voor pure domeinlogica.
- Teststrategie:
  - centrale constants altijd via `src/lib/financial-constants` en met regressietests op jaar-fallbacks;
  - DUO-berekeningen via `src/lib/duo` testen op sanitizing, scenario's en clamping;
  - belastingen via `src/lib/tax` testen op indicatieve box 1/box 3/mortgage-interest paden;

## Functionality Lifecycle

- Oude functionaliteit wordt bij voorkeur niet hard verwijderd als herintroductie mogelijk gewenst is.
- Gebruik feature-flags om functionaliteit tijdelijk uit te zetten.
- Verberg uitgeschakelde functionaliteit in:
  - UI (geen zichtbare CTA’s of links),
  - UX-flow (niet als pad aanbieden),
  - gedrag (fallbacks zonder die feature).
- Houd altijd in `FUNCTIONALITY_STATUS.md` bij:
  - wat aan staat;
  - wat bewust uit staat;
  - hoe het weer geactiveerd wordt.
  - welke commit de laatste functionele statuswijziging heeft gedaan (mutatielog).
- Bij elke functionele wijziging is het updaten van `FUNCTIONALITY_STATUS.md` verplicht.
  - profielkoppeling altijd via `profile-tool-mapping` + `profile-prefill` en met regressietests;
  - tool-specifieke `logic.ts` alleen testen op gedrag dat niet al in centrale lagen zit.
- `npm run check` draait lokaal dezelfde sequentie als CI inclusief registry-verificatie.
- Taxfuncties in `src/lib/tax` zijn indicatief en bewust beperkt:
  - `calculateBox1Tax`
  - `calculateMortgageInterestDeduction`
  - `calculateBox3Tax`
- Waar box 3 relevant is in tools, loopt de heffingsberekening via centrale `calculateBox3Tax` (geen losse box 3-formules per tool).
- De tax-laag is geen volledige IB-aangifte en rekent bewust niet met heffingskortingen, toeslagen, ondernemersaftrek of persoonlijke uitzonderingen.
- Validatie gebeurt nu per calculatorcomponent in de client.
- Formvalidatie toont rode veldfouten pas zodra een gebruiker dat veld inhoudelijk invult; lege startvelden tonen geen foutmeldingen vooraf.
- Toolflow blijft light-first: eerst invullen, daarna resultaat; verdiepingsblokken staan standaard dicht.
- In `volgende-euro` worden lege optionele velden niet stil als `0` geïnterpreteerd voor prioriteiten; alleen ingevulde context telt mee.
- Dashboard haalt alleen manifestdata op uit de gegenereerde registry.
- Verborgen tools blijven buiten dashboard en app-routes via manifestveld `visibility: "hidden"`.
- `requiredProfileFields` is documenterend voor prefill-koppelingen; velden worden niet automatisch verplicht voor de gebruiker gemaakt.
- `reasonHint` is informatief (geen advies), kort, zonder HTML, en wordt gebruikt als fallback-uitleg in persoonlijke route.
- Vaste financiële termen en technische enumwaarden worden centraal vertaald via `src/lib/copy-glossary.ts`.
- Nieuwe tools en pagina's gebruiken waar mogelijk deze helper in plaats van losse lokale labelmaps.
- Interne enumwaarden blijven technisch; de UI toont begrijpelijke gebruikerstaal.
- Vaktermen worden bij eerste zichtbare gebruik kort uitgelegd.
- Aannames die een tool gebruikt horen via centrale constants + disclosure vindbaar te zijn.
- `Wat doe ik met mijn volgende euro?` is referentietool voor de gewenste invul-naar-uitkomst flow.
- `/variabelen` gebruikt centrale financial constants als bron van waarheid; tools mogen daarbovenop eigen invoerwaarden toestaan.
- Donkere CTA's moeten expliciet wit contrast houden. Bronbestand: `src/components/ui.tsx`.
- Alle gebruikersgerichte frontend-copy is standaard Nederlands. Engelse tekst mag alleen in code, technische namen of wanneer expliciet gekozen.
- Toolcopy begint met gebruikerstaal: eerst de vraag of keuze van de gebruiker, daarna pas vaktermen.
- Technische termen worden bij eerste gebruik kort uitgelegd (bijv. jaarlijks opnamepercentage i.p.v. alleen "withdrawal rate").
- `app.json` velden `title`, `description` en `reasonHint` moeten gewone taal gebruiken en geen dwingend advies geven.
- Verdieping en nuance blijven in uitklapblokken; de eerste schermtekst blijft kort en begrijpelijk.
- Verdiepingsblokken in tools volgen bij voorkeur dezelfde leesstructuur:
  - `Hoe rekenen we dit?`
  - `Welke aannames gebruiken we?`
  - `Waar moet je op letten?`
- Nieuwe tools gebruiken bij voorkeur `DisclosureSection` voor deze standaardblokken.
- Tool-specifieke extra disclosures (zoals DUO-checklists of voorbeeldinterpretaties) mogen daarnaast gewoon `ToolDisclosure` blijven gebruiken.
- `DisclosureSection` is presentatie-only en bevat geen rekenlogica.
- Tool-specifieke extra verdiepingen mogen blijven (bijv. DUO-checklist of jaarplanning), maar de kernkoppen blijven herkenbaar.
- Vaste begrippen in verdiepingen (zoals box 3, brutering, wettelijk DUO-bedrag, draagkracht, jaarlijks opnamepercentage) lopen via `src/lib/copy-glossary.ts` waar logisch.
- Grafieken gebruiken interactieve tooltips met duidelijke X/Y-weergave:
  - tijd op de X-as als hele jaren;
  - bedragen op de Y-as als euro's;
  - formatting via centrale helpers in `src/lib/chart-utils.ts`;
  - geen losse per-tool formatteringslogica dupliceren voor standaard chartlabels.
- Mobile-first is verplicht: elke nieuwe component of tool moet standaard goed werken op mobiel.
- Headernavigatie bevat vaste hoofdroutes. Toolcategorieën en toolkaarten op de homepage komen uit `appRegistry` en de centrale doelgroep- en toolgroepen.
- Uitvoerige QA-rondes of brede responsive testmatrices alleen uitvoeren als de gebruiker daarom vraagt én dit bevestigt.
- Bij runtime laadproblemen na deploy is er een Nederlandse error-fallback via `src/app/error.tsx` en `src/app/global-error.tsx`.
- Bij “Deze pagina kon niet goed laden”: eerst hard refresh (`Cmd+Shift+R`) of sitegegevens wissen voor `oli4vos.github.io`.
- UX-standaard voor rekentools:
  - bovenaan start-CTA's met voorbeeldwaarden en profielroute
  - elke tool met invoervelden biedt standaard ook een centrale `Wis invoer`-actie via de gedeelde submit-hook
  - eerst invulvelden
  - dan een beknopte samenvatting met kernuitkomst in gewone taal
  - daarna uitklapbare verdieping, standaard dicht, met uitleg, aannames en praktische aandachtspunten
- Tooldetailpagina (`/apps/[slug]`) toont contextmetadata als uitklapblok onder de calculator zodat light-gebruikers sneller bij de eerste invoer komen.
- Homepage-principe:
  - toon eerst “waar begin ik?” met duidelijke keuze-CTA
  - daarna profielblok en thematische toolgroepen
  - persoonlijke route toont maximaal 3 tools met korte “waarom deze tool?” uitleg
  - redenen zijn informatief en transparant, geen adviesmachine
  - daartussen “Jouw snelle route” op basis van local-first profielstatus
  - aanbevelingen zijn startpunten, geen financieel advies
  - technische metadata blijft buiten de primaire homepageflow
- Mobiele tool-layout is gecentraliseerd via `src/components/tool/CalculatorShell.tsx`:
  - op mobiel staat de invoer eerst
  - na berekenen scrollt de tool naar de samenvatting/resultaatkaart
  - op desktop blijft de twee-kolomsindeling actief
  - shell ondersteunt ook een slot-opbouw voor consistente toolflow:
    `intro`, `startActions`, `inputs`, `submitAction`, `result`, `details`, `disclaimer`
- Regels voor toekomstige tools:
  - start nieuwe tools via `npm run create:tool <slug>`;
  - generator maakt `app.json`, `logic.ts`, `logic.test.ts`, `Calculator.tsx` met hidden-default;
  - laat nieuwe tools eerst `visibility: "hidden"` tot copy, tests en metadata compleet zijn;
  - zet daarna pas op `public` als `npm run generate:apps` en `npm run check` groen zijn;
  - gebruik eerst centrale constants uit `src/lib/financial-constants`;
  - gebruik centrale DUO-logica uit `src/lib/duo` waar DUO-input meespeelt;
  - gebruik centrale tax-logica uit `src/lib/tax` voor box 1/box 3/aftrek-indicaties;
  - gebruik profieldefaults uitsluitend via `profile-tool-mapping` + `profile-prefill`;
  - volg het mobiele shell-patroon (`CalculatorShell`) en houd aannames vindbaar via disclosure;
  - gebruik bij voorkeur de slot-opbouw van `CalculatorShell` voor invullen → berekenen → resultaat.
  - neem waar passend ook de gedeelde reset-actie op, zodat gebruikers invoer in één klik kunnen wissen zonder de tool te verlaten.
  - publieke tools moeten minimaal compleet zijn in manifest en bestanden:
    `title`, `description`, `category`, `tags`, `reasonHint`, `assumptionsUsed`,
    `calculationDomains`, `riskLevel`, `disclaimerType`, `outputType` +
    `Calculator.tsx`, `logic.ts`, `logic.test.ts`;
  - hidden-first workflow: ontwikkel nieuwe tools standaard hidden en maak pas public na groene checks.
- Jaarlijkse financiële aannames komen centraal uit `src/lib/financial-constants`.
- Toolverdieping mag die centrale aannames tonen, maar light-gebruikers worden niet gedwongen die details te openen.
- In `studieschuld-vs-beleggen` blijft box 3 een optionele verdieping (toggle + disclosure); de hoofdflow blijft licht en bruikbaar zonder fiscale invoer.
- In `studieschuld-vs-beleggen` wordt box 3 nu jaarlijks toegepast in het scenario; belasting wordt per jaar betaald en groeit daarna niet mee in compound.
- `volgende-euro` is een educatieve prioriteitenhulp (geen adviesengine) en moet altijd uitleggen waarom een keuze hoger/lager scoort.
- De mobiele header gebruikt korte, herkenbare labels zodat alle hoofdroutes zonder afgekapt label zichtbaar blijven.
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

- Volgende DUO-stap: draagkracht verder verfijnen zodra alle actuele draagkrachtparameters betrouwbaar en centraal in `src/lib/financial-constants/` staan.
- Compensatie-pechgeneratie centraal modelleren als studieschuldcontext, niet als losse ad-hoc toolformule.
- Kennisbank uitbreiden met korte feitelijke artikelen over rente, aanloopfase, draagkracht, extra aflossen, hypotheekimpact en onzekerheden.
- Hypotheekimpact en maximale hypotheek technisch blijven koppelen via centrale `src/lib/duo/`, `src/lib/mortgage/` en `src/lib/financial-constants/`.
- Maximale hypotheek toont actuele-rente-orientatie alleen via de centrale externe linkconfig; de gebruiker vult hypotheekrente altijd zelf in. De salarisverhogingsanalyse gebruikt de bestaande centrale hypotheekengine en blijft voorlopig scherm-only totdat het PDF-report-viewmodel wordt uitgebreid.
- Browserautomatisering voor externe hypotheekcalculators alleen gebruiken als validatie-/vergelijkingshulp, niet als normbron.
- Voor nieuwe tools dezelfde modulevorm aanhouden onder `apps/`: hidden-first, manifest compleet, centrale logica, tests en daarna pas public.
- CI controleert expliciet dat `src/lib/app-registry.ts` en `src/lib/app-components.tsx` na `generate:apps` geen diff hebben.

### Later, buiten huidige scope

- Aflossen-vs-beleggen, FIRE, box 3, jaarruimte en bredere vermogensallocatie kunnen technisch worden heractiveerd, maar horen niet in de huidige zichtbare studieschuld-positionering.
- Werkvorm-/ZZP-uitbreidingen en brede “volgende euro”-prioritering zijn latere productrichtingen.

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
- Lange `select`-opties mogen de mobiele viewport niet verbreden; labels en controls moeten `min-width: 0` respecteren.
- Een mobiele veldflow toont één kernveld tegelijk, met zichtbare voortgang en altijd bereikbare vorige/volgende acties.
- Toon geen tweede berekenknop naast de mobiele veldnavigatie. De laatste stap gebruikt de primaire actie van `MobileFieldFlowControls`.
- Respecteer de systeemvoorkeur voor minder beweging via `prefers-reduced-motion`.

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
