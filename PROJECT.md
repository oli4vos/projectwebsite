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
  - primaire navigatie via categorieën en tools per onderwerp
  - doelgroep-/geldroutes zijn centrale configuratie en sturen naar relevante toolgroepen
  - hero is kort en taakgericht, zonder lange uitlegblokken
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
- `src/lib/chart-utils.ts`: centrale format/tick helpers voor grafieken (hele jaren + eurolabels)
- `src/lib/knowledge-base.ts`: centrale kennisbankcontent (horizonbanden, checklists, keuzecontexten, toolkoppelingen)
- `src/lib/number-input.ts`: centrale parser voor numerieke invoer; komma wordt als decimaalpunt behandeld
- `src/lib/copy-glossary.ts`: centrale woordenlijst voor gebruikerstaal bij financiële termen en enumlabels
- `src/components/GlossaryText.tsx`: maakt bekende financiële begrippen klikbaar met korte hover/focus-uitleg
- `src/lib/knowledge-sources.ts`: centrale bronregisters en bronhiërarchie voor kennisbankdocumenten
- `src/lib/duo/`: centrale DUO-domeinlaag met wettelijk maandbedrag, relevant maandbedrag per situatie en scenariofuncties voor extra aflossen
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

- `apps/studieschuld-vs-beleggen`
  - focust op verplichte DUO-betaling (wettelijk + draagkracht) versus vrijwillige extra ruimte
  - wettelijk DUO-maandbedrag wordt annuïtair berekend en niet als vrij invulveld gebruikt
  - vrijwillige ruimte boven het verplichte bedrag wordt vergeleken als keuze: extra aflossen of beleggen
  - beleggingshorizon wordt automatisch gezet tot het verwachte aflosmoment met het gekozen extra maandbedrag (geen losse horizon-input)
  - bevat uitklapbare grafiek met schuldverloop versus beleggingswaarde per heel jaar
  - gebruikt optioneel centrale tax-laag voor een indicatieve box 3-correctie in de verdiepingslaag
  - box 3-effect wordt jaarlijks toegepast; jaarlijkse heffing wordt uit het beleggingsscenario betaald en telt daarna niet mee in verdere compoundgroei
  - als box 3-toggle uit staat, toont de tool expliciet dat de beleggingsuitkomst dan mogelijk te optimistisch is
- `apps/box3-indicatie`
  - aparte box 3-tool met light invoer + beknopte samenvatting + uitklapbare verdieping
  - ondersteunt werkelijk rendement (default) en forfaitair scenario
  - rekent via centrale tax-laag en toont gebruikte tarieven/aannames uit centrale constants
- `apps/box-3-impact`
  - box 3-impact calculator met focus op vrijstelling, belastbare grondslag en effectieve druk
  - toont indicatief effect van spaargeld, beleggingen en schulden via centrale `calculateBox3Tax`
  - ondersteunt optioneel netto rendement na box 3 op basis van ingevulde rendementsverwachtingen
- `apps/jaarruimte-vs-vrij-beleggen`
  - vergelijkt pensioeninleg via jaarruimte met vrij beleggen in box 3
  - gebruiker vult beschikbare jaarruimte zelf in; tool claimt geen officiële jaarruimteberekening
  - gebruikt centrale box 1- en box 3-logica voor indicatief voordeel nu en netto eindwaarde
  - bevat nu jaarlijkse vermogensplanning met jaarlijkse box 3-afboeking, plus clean PDF/Excel-export (CSV)
  - bevat onder het jaarruimteveld een directe “Help mij berekenen”-link naar externe jaarruimte-berekenhulp
  - benadrukt afweging tussen fiscaal voordeel en flexibiliteit (relevant voor FIRE-scenario's)
- `apps/volgende-euro`
  - centrale prioriteitenhulp voor de vraag waar extra geld nu het meest logisch naartoe kan
  - werkt submit-gedreven met expliciete `Bereken`-knop (geen misleidende live-output op halflege invoer)
  - combineert buffer, dure schuld, studieschuld, hypotheek, jaarruimte, beleggen en woningdoel in één educatief stappenplan
  - toont alleen relevante aanbevelingen; ontbrekende gegevens worden als hulp getoond, niet als fout
  - als er geen relevante opties zijn, toont de tool bewust geen nep-aanbeveling maar eerst invoerhints
  - gebruikt centrale profieldefaults plus DUO/constants-context, maar blijft expliciet geen financieel advies
- `apps/fire-na-belasting`
  - indicatieve FIRE-tool met jaarlijkse tijdlijn voor vermogen, inleg, groei, box 3-heffing en FIRE-doel
  - rekent met rendement, inflatie, withdrawal rate en optioneel box 3 via centrale tax-laag
  - educatief hulpmiddel; geen financieel advies of zekerheid over haalbaarheid
- `apps/hypotheek-aflossen-vs-beleggen`
  - vergelijkt extra aflossen op hypotheek met vrij beleggen en buffer aanhouden
  - gebruikt centrale `calculateMortgageInterestDeduction` en `calculateBox3Tax` voor indicatieve netto vergelijking
  - toont netto rentebesparing, gemiste aftrek, beleggingsuitkomst, box 3-correctie en break-even rendement
- `apps/zzp-uurtarief`
  - indicatieve werkvorm-tool voor benodigd ZZP-uurtarief inclusief belastingreservering, buffer, pensioen, AOV en kosten
  - rekent met declarabele uren, actieve werkweken en niet-declarabele ruimte via invoer
  - is expliciet geen volledige ZZP/IB-aangifte en gebruikt box 1 alleen als indicatieve referentie
- `apps/annuitair-lineair`
  - vergelijkt netto/bruto maandlasten en totale rentelast tussen annuïtair en lineair
  - optionele verdieping toont wat maandelijkse netto-verschillen doen als beleggingsinleg/onttrekking
  - in die verdieping is box 3-effect optioneel mee te nemen
  - bevat oudere rekenscripts in `.js` als onderliggende rekenkern
- `apps/hypotheekrenteaftrek-afschaffen`
  - scenariovergelijking van netto rentelasten mét en zonder hypotheekrenteaftrek
  - gebruikt centrale `calculateMortgageInterestDeduction`
  - toont meerjarige tijdlijn en cumulatief verschil als aftrek zou vervallen
- `apps/hypotheek-impact-studieschuld`
  - indicatieve tool voor de impact van een DUO-maandlast op hypotheekruimte
  - v2 rekent primair via relevante DUO-maandlast -> brutering -> annuïtaire hypotheekimpact
  - verwerkt DUO-situaties zoals aanloopfase, draagkrachtverlaging en betaalpauze
  - bevat nu ook indicatie van DUO-verplichting op inkomen (draagkracht) versus vrijwillige extra ruimte
  - bevat checklist voor Mijn DUO, uitleg van SF35/SF15-varianten en een nauwkeuriger aflosscenario
- `apps/compensatie-pechgeneratie`
  - staat als draft in de codebase met `visibility: "hidden"`
  - wordt daardoor niet opgenomen in dashboard/route-registry
- `apps/private-lease-impact-hypotheek`
  - staat als draft in de codebase met `visibility: "hidden"`
  - conceptuele indicatie van private lease-impact op hypotheekruimte
- `apps/koop-vs-huur`
  - staat nu als publieke beta-tool in de bibliotheek
  - conceptuele vergelijking van huren en kopen op maandlast, eigen geld en rente-stresstest
  - gebruikt centrale planninghelper `calculateBuyVsRent`
- `apps/schulden-volgorde`
  - staat nu als publieke beta-tool in de bibliotheek
  - zet achteraf betalen, creditcard, DUO, hypotheek en overige schulden in een extra-aflosvolgorde
  - gebruikt centrale planninghelper `calculateDebtPriority`
- `apps/kind-wordt-18-impact`
  - staat nu als publieke beta-tool in de bibliotheek
  - brengt kinderbijslag, kindgebonden budget, zorgverzekering, zorgtoeslag en studiekosten terug naar maandimpact
  - gebruikt centrale planninghelper `calculateChild18Impact`

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
- Headernavigatie toont altijd de actuele toolcategorieën op basis van `appRegistry`; bij nieuwe categorieën in manifests verschijnen deze automatisch in het menu zonder handmatige header-edit.
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
  - op mobiel staat de samenvatting/resultaatkaart eerst
  - daarna volgt het formulier met mobile field flow
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
- Toekomstige werkvorm-stap: uitgebreidere vergelijking vaste dienst vs ZZP met aanvullende werkgeverslasten, secundaire arbeidsvoorwaarden en ondernemersregelingen.
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
