# Agent Instructions

Dit bestand is de operationele bron voor AI-agents en engineers die in deze repository werken.
Lees dit eerst voordat je berekeningen, manifests of routing aanpast.

## Hoofdregel

**Nieuwe of aangepaste berekeningslogica mag nooit verspreid worden toegevoegd. Controleer altijd eerst of er bestaande centrale logica is. Hergebruik of breid de centrale rekenlaag uit. Duplicatie van formules, parameters of business rules is niet toegestaan.**

De zichtbare site is in de huidige launch-scope puur informatief over studieschuld. Publieke UI-copy bevat geen beleggen-framing, geen aflossen-vs-beleggen-route en geen persoonlijk advies. `FUNCTIONALITY_STATUS.md` is leidend voor welke tools en flows publiek zichtbaar, hidden, voorbereid of uitgeschakeld zijn.
Alles wat niet meer actief aangeroepen wordt in de zichtbare site blijft wel in de codebase, maar wordt hidden/draft gehouden en uit de publieke registry, navigatie en route-oppervlakken gehouden totdat er expliciet een heractivatiebesluit is.

## Projectdoel

Project Site is een browser-first, modulair platform voor financiele hulpmiddelen. Het project helpt gebruikers hun situatie te begrijpen met rekentools, signaleringen, scenario's, bronverwijzingen en uitleg, zonder juridisch, financieel, fiscaal of hypotheekadvies te geven.

De vaste projectrichting:

- browser-first en static-first waar mogelijk;
- modulair via apps onder `apps/<slug>` met manifestgedreven discovery;
- Type A-apps blijven pure frontend/static tools zonder geheimen, backend of verplichte externe runtime;
- Type B-apps krijgen alleen een backend wanneer een expliciet architectuur-, security-, kosten- en rollbackbesluit dat rechtvaardigt;
- centrale domeinengines en gedeelde rekenlagen blijven leidend;
- de centrale Regulations Engine-primitives ondersteunen definitions, unknown answers, inference, evaluation, confidence, reason codes, recommendations, estimates en action plans;
- `src/lib/financial-constants` blijft de SSOT voor brondata, metadata, geldigheid, freshness en bronverwijzingen;
- hosting blijft goedkoop, simpel en reproduceerbaar;
- toekomstige schaalbaarheid komt uit centrale primitives, adapters, source governance, tests en duidelijke publicatiechecks, niet uit losse calculatorframeworks.

## Documentatiehierarchie

Gebruik deze volgorde wanneer documenten of prompts elkaar overlappen:

1. `AGENTS.md`: bindende werkwijze, scope-, git-, architectuur-, test- en releaseguardrails voor agents.
2. `PROJECT.md`: canonieke projectvisie, productrichting, hoofdarchitectuur, domeinen, roadmap en niet-doelen.
3. `FUNCTIONALITY_STATUS.md`: single source of truth voor zichtbaarheid, flags, publieke/hidden status en functionele status.
4. Gerichte documenten in `docs/`, zoals `docs/calculator-architecture.md`, `docs/source-data-architecture.md`, `docs/regulations-engine-technical-design.md`, `docs/regelingen-toeslagen-engine-architecture.md` en brondocumenten.
5. `CONTRIBUTING.md`, `README.md` en inline comments voor aanvullende lokale conventies.

Verwijs waar mogelijk naar bestaande documenten in plaats van dezelfde regels opnieuw te beschrijven. Als een prompt afwijkt van deze hierarchie, volg de hoogste geldige bron en benoem de afwijking in de overdracht.

## Standaard werkwijze

Iedere Codex-agent volgt standaard deze workflow, ook als een prompt kort is:

1. Lees `AGENTS.md`.
2. Lees `PROJECT.md`.
3. Lees relevante architectuur-, status-, bron- of domeindocumenten voor de gevraagde scope.
4. Controleer repositorypad, branch, HEAD, origin en werkboom.
5. Bepaal doel, scope, out-of-scope en geraakte eigenaarschappen.
6. Inventariseer bestaande centrale logica, adapters, tests en documentatie voordat je iets wijzigt.
7. Wijzig alleen noodzakelijke bestanden binnen scope.
8. Houd gebruikers- en andere agentwijzigingen intact.
9. Voer passende controles uit: gericht bij documentatie, volledig bij code, manifest, registry, rekenlogica, UI, PDF of release-impact.
10. Stage alleen eigen bestanden.
11. Commit met een gerichte conventionele commitmessage wanneer de opdracht dat vraagt of de wijziging afgerond is.
12. Push naar `main` wanneer controles groen zijn en het gitbeleid dat toestaat.
13. Sluit af met een compacte overdracht met status, wijzigingen, controles, commit en resterende punten.

## Gitbeleid

- Werk standaard op `main`, tenzij de gebruiker expliciet anders vraagt.
- Commit en push uitsluitend vanuit de vaste repositorydirectory.
- Force-push is verboden.
- Destructieve commando's zoals `git reset --hard`, `git clean -fd`, `git checkout -- .` en `git restore .` zijn verboden zonder expliciete opdracht.
- `ideetjes.txt` is gebruikersruimte: nooit wijzigen, stage, committen, resetten, restoren of overschrijven tenzij de gebruiker dat expliciet en ondubbelzinnig vraagt.
- Neem geen unrelated wijzigingen mee.
- Stage alleen bestanden die je zelf doelgericht hebt gewijzigd.
- Als bestaande user- of agentwijzigingen dezelfde bestanden raken, lees ze zorgvuldig en werk ermee; overschrijf ze niet.
- Lever de werkboom zo schoon mogelijk op. Als bestaande gebruikerswijzigingen blijven staan, benoem exact welke dat zijn.

## Scopebeleid

- Werk alleen binnen de gevraagde scope.
- Doe geen opportunistische refactors, cleanup, redesigns, dependency-upgrades of documentatieherschrijvingen buiten scope.
- Voeg geen dependency toe zonder aantoonbare noodzaak, bestaande alternatieven te controleren en impact te documenteren.
- Activeer geen hidden/draft tools zonder expliciet activatieverzoek en volledige blueprint-check.
- Verander geen publieke routes, manifests, registry, PDF, brondata, formulelogica of UX-copy wanneer de opdracht documentatie-only is.
- Bij twijfel: kies de kleinste wijziging die het doel volledig bereikt.

## Test- en controlebeleid

Standaard beschikbare controles:

- `npm run generate:apps`
- `npm run validate:source-data`
- `npm run generate:source-overview`
- `npm run check:source-freshness`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `git diff --check`

Controlekeuze:

- Documentatie-only: minimaal relevante diffinspectie, `git diff --check` voor geraakte bestanden of staged diff, en `git status --short`.
- Brondatawijziging: source-data validatie, source-overview generatie, freshnesscheck en relevante domeintests.
- Manifest/registrywijziging: `generate:apps`, generated-file diff-check, relevante registrytests en build wanneer publiek zichtbaar.
- Rekenlogica: gerichte unit/regressietests plus volledige tests, typecheck en build.
- UI/form/PDF: lint, typecheck, relevante unit/integratietests, build en waar passend browser/UX-checks.
- Release of publieke activatie: volledige generate-, lint-, typecheck-, test- en buildreeks.

Een globale `git diff --check` kan falen op bestaande gebruikerswijzigingen buiten scope. Controleer dan expliciet de staged diff of de geraakte bestanden en benoem de bestaande afwijking.

## Stopcriteria

Stop zonder commit en rapporteer wanneer:

- de branch niet `main` is terwijl `main` vereist is;
- HEAD en `origin/main` onverwacht afwijken en veilig pushen niet kan;
- `ideetjes.txt` of andere gebruikerswijzigingen geraakt of staged zouden worden;
- benodigde tests, typecheck of build rood zijn;
- een publieke regressie, routewijziging, manifestwijziging of registrywijziging buiten scope ontstaat;
- de opdracht een centrale architectuurregel zou schenden;
- een wijziging een hidden tool zichtbaar maakt zonder blueprint-check;
- een dependency, backend, opslag, analytics of secret nodig lijkt maar niet expliciet in scope staat;
- er onvoldoende bronbasis is voor een financiële formule, bedrag, rechtclaim of actuele waarde.

## Promptminimalisatie

Toekomstige prompts mogen kort zijn wanneer `AGENTS.md`, `PROJECT.md`, `FUNCTIONALITY_STATUS.md` en de relevante `docs/`-bestanden voldoende context bevatten. Een prompt hoeft dan vaak alleen nog te bevatten:

- doel;
- scope;
- relevante documenten of bestanden;
- gewenste commitomschrijving;
- expliciete uitzonderingen.

De agent volgt daarna zelfstandig de vaste workflow uit dit bestand, controleert de repository, leest relevante documentatie, bewaakt scope, draait passende controles, commit/pusht waar toegestaan en levert een overdracht.

## Standaard overdracht

Gebruik standaard deze compacte structuur, tenzij de prompt een specifieker format vraagt:

```text
# Overdracht

## 1. Repositorystatus
- Branch:
- HEAD voor/na:
- Origin voor/na:
- Werkboom voor/na:
- Bewaarde gebruikerswijzigingen:

## 2. Scope en besluit
- Doel:
- Binnen scope:
- Buiten scope:
- Belangrijkste beslissing:

## 3. Wijzigingen
- Bestanden:
- Gedrag/functionele impact:
- Architectuurimpact:
- Backwards compatibility:

## 4. Controles
- Uitgevoerd:
- Resultaat:
- Niet uitgevoerd en waarom:

## 5. Git
- Commit:
- Push:
- Resterende lokale wijzigingen:

## 6. Volgende stap
- Aanbevolen agent of actie:
- Open punten:
```

## Vaste repositoryregel

Alle Codex-agents en engineers werken voor de Project Site uitsluitend in deze repository:

```text
/Users/oliviervos/Library/Mobile Documents/com~apple~CloudDocs/AA Ondernemen/Project website
```

Iedere agent navigeert bij aanvang naar deze directory en controleert minimaal:

```bash
pwd
git rev-parse --show-toplevel
git status --short
```

Wijzigingen, tests, commits en pushes vinden uitsluitend vanuit deze repository plaats. Gebruik geen alternatieve clones, tijdelijke kopieen, bovenliggende directories of nieuw aangemaakte repositories. Bestaande wijzigingen van andere agents of gebruikers worden niet verwijderd, overschreven of teruggedraaid. Destructieve Git-commando's zoals `git reset --hard`, `git clean -fd`, `git checkout -- .` en `git restore .` zijn niet toegestaan zonder expliciete opdracht; force-push is niet toegestaan.

## Agentrollen en eigenaarschap

### Project Orchestrator

De Project Orchestrator bewaakt planning, scope, overdrachten en rolroutering, maar neemt specialistisch werk niet inhoudelijk over.

- Controleert bij start de repositorystatus en benoemt actieve wijzigingen, blokkades en risico's.
- Splitst werk in afgebakende opdrachten voor de juiste guardian of Feature Integrator.
- Bewaakt dat agents alleen hun eigen scope wijzigen en bestaande gebruikers- of agentwijzigingen behouden.
- Houdt een compacte overdracht bij met open punten, volgende aanbevolen agent, benodigde checks en releaseblokkades.
- Laat het definitieve releasebesluit bij de QA & Release Guardian.

### Feature Integrator

De Feature Integrator is de primaire uitvoerende agent voor nieuwe gebruikersfunctionaliteit en uitbreidingen van bestaande actieve tools.

- Bouwt nieuwe tools, routes, manifests, dashboardintegratie, formulierflows, applicatie-adapters, resultaatweergave, PDF-koppelingen, tests en statusdocumentatie integraal af.
- Inventariseert eerst bestaande functionaliteit, centrale domeinlagen, gedeelde formuliercomponenten, PDF-componenten, registry/discoverycode en tests.
- Kopieert geen centrale financiële formules, parameters, DUO-, hypotheek-, fiscale of andere domeinlogica.
- Past de volledige blueprint-check toe op iedere nieuwe, geactiveerde of publiek zichtbare tool.
- Beperkt wijzigingen in `src/lib/duo`, `src/lib/mortgage`, andere centrale financiële domeinlagen, `apps/_artifact_shared`, centrale PDF-infrastructuur, deployment-infrastructuur en securitybeleid tot noodzakelijke integratie.
- Legt inhoudelijke rekenwijzigingen voor aan de Financial Domain & Calculation Guardian.
- Legt structurele framework- of blueprintwijzigingen voor aan de Architecture & Blueprint Guardian.
- Legt releasekritische wijzigingen voor aan de QA & Release Guardian.
- Voert relevante tests uit, minimaal de beschikbare generate-, lint-, typecheck-, test- en buildcommando's voor de geraakte wijziging.
- Commit en pusht alleen wanneer de opdracht dat verlangt, controles groen zijn en uitsluitend eigen afgebakende wijzigingen worden meegenomen.

### Financial Domain & Calculation Guardian

De Financial Domain & Calculation Guardian bewaakt de inhoudelijke juistheid, centralisatie en testbaarheid van financiële rekenlogica.

- Is inhoudelijk eigenaar van centrale rekenlagen zoals `src/lib/duo`, `src/lib/mortgage`, fiscale modules, toeslagenmodules, leen- en aflosmodellen, scenariofuncties, afrondingsregels, domeintypes, fixtures en regressietests.
- Plaatst financiële formules uitsluitend in centrale, pure, deterministische, type-safe domeinmodules.
- Houdt React, formulieren, routes, manifests en PDF-rendering vrij van formules en parallelle berekenpaden.
- Zorgt dat wettelijke aannames, brondata, percentages, normen en geldigheidsdata traceerbaar en versioneerbaar zijn.
- Voegt bij iedere rekenwijziging regressietests toe voor normale invoer, grensgevallen, nulwaarden, ongeldige waarden, afronding en relevante regelregimes.
- Controleert dat scherm en PDF hetzelfde rekenresultaat of viewmodel gebruiken.
- Levert duidelijke interfaces en integratie-instructies aan feature- en applicatielagen, zonder React-code in domeinmodules te plaatsen.
- Voorkomt dat andere agents centrale formules kopieren of stilzwijgend wijzigen.

### QA & Release Guardian

De QA & Release Guardian controleert onafhankelijk of wijzigingen veilig, volledig en productiegeschikt zijn voordat ze worden gepubliceerd.

- Controleert codekwaliteit, typeveiligheid, regressies, app-discovery, registry, statusvelden, dashboardzichtbaarheid, directe routes, browser-refresh, formulieren, validatie, resultaten, PDF-uitvoer, foutafhandeling, toegankelijkheid op hoofdlijnen, productiebuild en deploygereedheid.
- Voert voor releasecontrole minimaal de beschikbare `generate:apps`, lint-, typecheck-, test- en buildcommando's uit.
- Controleert dat actieve tools de blueprint-check hebben doorlopen voordat ze gepubliceerd worden.
- Controleert dat inactieve of hidden tools niet onbedoeld zichtbaar worden.
- Controleert dat directe URLs en browser-refresh werken voor nieuwe of geactiveerde tools.
- Controleert dat scherm en PDF dezelfde data gebruiken en dat er geen afzonderlijke PDF-formules zijn.
- Beoordeelt functionele wijzigingen, architectuurwijzigingen en formulewijzigingen gescheiden.
- Accepteert bekende fouten niet stilzwijgend; releasebevindingen eindigen met `GO`, `GO MET BEKENDE NIET-BLOKKERENDE PUNTEN` of `NO-GO`.
- Corrigeert alleen kleine releaseblokkerende type-, test- of regressiefouten zelfstandig en legt grotere problemen terug bij de verantwoordelijke guardian.

### DevOps, Security & Performance Guardian

De DevOps, Security & Performance Guardian bewaakt dat de Project Site goedkoop, veilig, snel, observeerbaar en betrouwbaar gebouwd en gedeployd kan worden.

- Houdt static hosting de default. Serverless, edge, databases, queues, cronjobs en externe runtimes worden alleen toegevoegd wanneer de tool dat aantoonbaar nodig heeft.
- Bewaakt minimale infrastructuur, minimale runtime dependencies, pinning of bewuste versiekeuzes, reproduceerbare `npm ci`-installaties en CI die registry-generatie, lint, typecheck, tests en build afdwingt.
- Controleert dat secrets nooit in broncode, manifests, generated files, logs, clientbundles of publieke environment variables belanden. Secrets horen uitsluitend in environment variables zonder `NEXT_PUBLIC_` wanneer ze niet browser-safe zijn.
- Beoordeelt Type A-tools als pure frontend/static tools: geen geheime serverdata, geen onnodige backend, geen willekeurige externe scripts, veilige lokale opslag, lazy-loading waar passend en geen onnodige externe API-afhankelijkheid.
- Beoordeelt Type B-tools als backendtools: afgebakende API, server-side inputvalidatie, passende auth/autorisatie, rate limiting waar misbruik mogelijk is, veilige CORS, time-outs, minimale rechten, observeerbaarheid en foutmeldingen zonder gevoelige details.
- Controleert securityrisico's rond XSS, injectie, open redirects, SSRF, file uploads, server-side uitvoering, logging, dataretentie, externe APIs, dependencies en foutafhandeling.
- Controleert performance op initial bundle size, lazy-loading, onnodige client components, zware of dubbele dependencies, caching, static generation, assets, buildtijd, onnodige API-calls en grote client-side datasets.
- Voert geen micro-optimalisaties of deploymentcomplexiteit door zonder meetbaar voordeel, kosteninschatting, rollbackpad en expliciete motivatie.
- Rapporteert bij oplevering infrastructuurwijzigingen, kostenimpact, security- en performancebevindingen, gewijzigde environment variables, CI-resultaten, deployrisico's, rollbackinstructies en resterende punten.
- Migreert inactieve tools niet proactief. Een inactieve Type B-tool moet vóór activatie volledig aan de actuele security- en deploymentblueprint voldoen.

### Form UX & PDF Guardian

De Form UX & PDF Guardian bewaakt consistente, begrijpelijke, toegankelijke en overzichtelijke invoerflows en hoogwaardige PDF-uitvoer voor actieve tools.

- Controleert formulierstructuur, stapsgewijze invoer, progressive disclosure, labels, hulpiteksten, foutmeldingen, defaults, voorbeeldwaarden, resetgedrag, resultaatpresentatie, responsiviteit en toetsenbordbediening.
- Controleert dat formulieren alleen noodzakelijke vragen tonen, details pas openen wanneer relevant, waarden niet onverwacht verliezen en belangrijke aannames vóór submit of in de directe context zichtbaar zijn.
- Controleert dat relevante DUO-velden verwijzen naar Mijn DUO of andere primaire gegevensbronnen en dat eenheden voor euro's, percentages en looptijden consistent zijn.
- Hergebruikt gedeelde formuliercomponenten en centrale format-/parsinghelpers; plaatst geen tool-specifieke uitzonderingen in generieke componenten wanneer configuratie of een kleine adapter volstaat.
- Controleert dat iedere relevante actieve tool een duidelijke PDF-actie heeft en dat PDF-output dezelfde gevalideerde invoer, domeinberekening, resultaatmodellen, toelichtingen en bronmetadata gebruikt als het scherm.
- Houdt PDF-rendering vrij van nieuwe berekeningen en controleert titel, datum, samenvatting, invoer, scenario's, resultaten, toelichting, aannames, waarschuwingen, bronverwijzingen, disclaimer en paginering.
- Test of beoordeelt bij formulier- en PDF-wijzigingen minimaal veldweergave, conditionele velden, validatie, submit, reset, voorbeeldwaarden, profiel-prefill, mobiele layout, PDF-inhoud, scherm/PDF-gelijkheid, lange teksten en grote getallen.
- Wijzigt geen financiële formules; inhoudelijke rekenwijzigingen gaan naar de Financial Domain & Calculation Guardian.

### Sources & Regulations Guardian

De Sources & Regulations Guardian bewaakt primaire bronnen, regelgeving, uitvoeringspraktijk en geldigheidsdata voor actieve tools en geplande activaties.

- Controleert bij wijziglijke waarden altijd primaire bronnen: wet- en regelgeving, officiële bekendmakingen, DUO, Belastingdienst, Rijksoverheid, AFM, NHG of andere bevoegde instanties.
- Legt per regel vast: bron, publicatie- of geldigheidsdatum, ingangsdatum, eventuele einddatum, doelgroep, uitzonderingen, overgangsrecht, onzekerheden, implementatie-impact en benodigde tests.
- Maakt expliciet onderscheid tussen wettelijke verplichting, uitvoeringsbeleid, marktpraktijk, vuistregel, projectkeuze en interpretatie of aanname.
- Markeert jaarlijkse of periodiek wijziglijke waarden zoals DUO-rente, draagkrachtnormen, hypotheeknormen, AFM-toetsrente, NHG-grenzen, fiscale percentages en toeslaggrenzen als dateerbaar en bronbaar.
- Past geen complexe centrale formule aan; genormaliseerde regels, grensgevallen en bronverwijzingen gaan naar de Financial Domain & Calculation Guardian.
- Levert bronlabels, gebruikersuitleg, waarschuwingen, benodigde invoervelden en PDF-bronvermelding aan de Feature Integrator en Form UX & PDF Guardian.
- Gebruikt commerciële calculators alleen als vergelijkingsmateriaal voor UX of marktpraktijk, nooit als primaire juridische of rekenkundige bron.

## Architectuurregels

- Alle financiële en domeinberekeningen horen in centrale domeinlagen of in een dunne tool-façade, nooit in React-componenten, routes of presentatiecode.
- UI-code mag alleen:
  - invoer verzamelen;
  - valideren op vorm en veiligheid;
  - waarden parsen;
  - centrale berekeningsfuncties aanroepen;
  - resultaten renderen.
- Gedeelde logica hoort waar mogelijk in:
  - `src/lib/duo/`
  - `src/lib/mortgage/`
  - `src/lib/basis-calculations.ts`
  - `src/lib/financial-constants/`
  - `src/lib/tax/`
  - `src/lib/pension/`
  - `src/lib/planning/`
- Tool-specifieke `apps/<slug>/logic.ts`-bestanden mogen orchestration bevatten, maar geen berekeningen dupliceren die al centraal bestaan.
- `Calculator.tsx`-bestanden zijn presentatie; daar staan geen business rules, renteformules, leencapaciteitberekeningen of tabelopzoekingen in.
- Wijzigbare normen, tabellen, parameters en percentages moeten centraal, versieerbaar en testbaar zijn opgeslagen.
- Domeinmodellen zijn waar praktisch immutable: functies retourneren nieuwe waarden en muteren geen gedeelde globale state.
- Pure functies zijn de standaard voor reken-, evaluatie-, inference-, recommendation- en estimate-logica.
- Composition gaat boven duplicatie: hergebruik bestaande engines, adapters en helpers voordat je nieuwe lagen toevoegt.
- Verborgen side effects zijn niet toegestaan in domeinlagen; opslag, URL-state, analytics, logging en browsergedrag blijven buiten centrale reken- en regelsmodules.
- `src/lib/financial-constants` is de single source of truth voor wijziglijke brondata die rekentools gebruiken. Nieuwe tools hardcoden geen jaarlijkse waarden, banktarieven, toeslaggrenzen, DUO-percentages, hypotheeknormen of fiscale parameters lokaal.
- Iedere actieve dataset heeft minimaal bron-URL, geldigheidsperiode, status, `lastVerifiedAt` en `nextReviewAt`; verlopen brondata wordt niet stil geselecteerd.
- Officiële bronnen hebben voorrang. Providerdata zoals banktarieven blijft gescheiden van officiële normdata, wordt handmatig gereviewd en niet tijdens gebruikersbezoek gescrapet.
- Projectaannames zijn expliciet als projectaanname of indicatieve benadering gemarkeerd en krijgen regressietests wanneer ze rekenuitkomsten beïnvloeden.
- Scherm en PDF gebruiken dezelfde datasetmetadata of hetzelfde centrale source-reference model; PDF's mogen geen eigen brondata of peildatum kiezen.
- Toeslagendata wordt pas actief wanneer bronregels volledig genormaliseerd, gevalideerd en getest zijn.
- Als een tool of flow niet meer actief aangeroepen wordt, zet dan de zichtbare manifest-/route-exposure uit en leg de status vast in `FUNCTIONALITY_STATUS.md`; laat de code alleen bestaan als verborgen heractiveringsbron.

## Domeinregels

- Unknown is metadata: onbekende antwoorden zijn expliciete domeinstatussen met reason codes, confidence-impact en mogelijke vervolgstappen.
- Inference is expliciet: iedere afleiding heeft broninputs, methode, evidence, confidence en overschrijfbaarheid.
- Evaluation bepaalt status: domeinevaluatie beslist over harde uitsluitingen, mogelijke relevantie, complexiteit, ontbrekende informatie en officiële controle.
- Recommendation bepaalt acties: aanbevelingen en actieplannen komen uit domeinoutput of adapters, niet uit losse UI-copy.
- Estimate bepaalt bedragen: bedragen verschijnen alleen via getypte estimates met bandbreedte, periode, eenheid, bronjaar, aannames, onzekerheden en bronverwijzingen.
- Definitions zijn declaratief: regels, dependencies, requiredness, skip-reasons, reason codes en bronkoppelingen worden machineleesbaar beschreven waar dat praktisch is.
- UI-copy is presentatie: zichtbare tekst mag reason codes toelichten, maar mag machineleesbare domeinbeslissingen niet vervangen.

## Regelingen & Toeslagen Engine

Deze guardrails gelden voor de geplande Regelingen & Toeslagen Engine en voor iedere toekomstige uitbreiding naar toeslagen, gemeentelijke regelingen, studiefinanciering, energieregelingen, belastingvoordelen, pensioen, zorg, wonen of vergelijkbare regelingen.

### Centrale architectuur

- Toekomstige generieke primitives horen in een centrale pure TypeScript-laag, bij voorkeur onder `src/lib/regulations`, mits implementatieonderzoek bevestigt dat dit past bij de bestaande structuur.
- Regeling-specifieke rekenregels blijven in hun eigen domeinmodule, zoals `src/lib/allowances`, `src/lib/duo`, `src/lib/mortgage`, `src/lib/tax` of `src/lib/family-financing`.
- De generieke laag orkestreert hooguit confidence, unknown answers, dependencies, inferenties, evidence, aanbevelingen en actieplannen.
- De generieke laag vervangt geen bestaande DUO-, hypotheek-, tax-, allowance- of family-financing-engine.
- Er komt geen tweede parallel calculatorframework en geen generieke runtime die bestaande domeinengines omzeilt.
- Domeinfuncties zijn deterministisch, unit-testbaar en hebben geen browser-, React-, route-, storage-, analytics- of PDF-afhankelijkheden.

### Confidence

- Confidence is de kwaliteit van de Project Site-inschatting, geen kans dat iemand juridisch recht heeft.
- Confidence moet verklaarbaar en testbaar zijn; willekeurige percentages zonder gedocumenteerde factoren zijn niet toegestaan.
- Confidencefactoren zijn machineleesbaar en staan los van zichtbare UI-copy.
- Bronfreshness, onbekende antwoorden, inferenties, grensnabijheid, bronstatus en complexiteit wegen expliciet mee.
- UI-copy mag confidence nooit presenteren als juridische kans, beschikking, rechtstoekenning of aanvraagzekerheid.

### Schattingen en bedragen

- Geen financieel bedrag zonder typed estimate range met minimaal minimum, likely en maximum.
- Iedere estimate bevat eenheid, periode, bronjaar, bronverwijzingen, confidence, aannames, onzekerheden en een persoonlijk actieplan.
- Als officiële bedraglogica onvoldoende centraal is gemodelleerd, blijft de output signal-only en volgt een officiële controleactie.
- Exact ogende bedragen zijn verboden wanneer alleen een ruwe indicatie verantwoord is.
- Brondata voor schattingen komt uit `src/lib/financial-constants`; React of appdirectories hardcoden geen bronjaren, grenzen, bedragen of afbouwregels.

### Unknown answers en inferenties

- `unknown` is een geldige domeinstatus en mag niet automatisch de volledige flow beëindigen.
- De domeinlaag bepaalt mogelijke vervolgvragen, vereenvoudigde vragen en afleidingsmogelijkheden.
- Doorgaan met lagere confidence moet mogelijk blijven wanneer dat inhoudelijk verantwoord is.
- Afgeleide waarden zijn zichtbaar, traceerbaar, overschrijfbaar en voorzien van broninputs, methode, confidence en evidence.
- Inferenties mogen niet stil als rechtstreeks gebruikersantwoord worden opgeslagen.
- Gegevensoverdracht uit andere tools vereist zichtbare toestemming; geen persoonsgegevens of financiële invoer in URL's, logs of analytics.

### Vraagdependencies en complexe situaties

- Businessafhankelijkheden horen niet in React. Zichtbaarheid, requiredness, skip-reasons en vervolgvragen komen uit centrale definities of adapters.
- De UI rendert domeinoutput en beheert alleen presentatiestate; stale hidden velden mogen niet blijven doorwerken.
- Complexiteit is een domeinclassificatie en betekent niet automatisch stoppen.
- Alleen het niet-betrouwbaar te beoordelen onderdeel wordt beperkt; andere regelingen of onderdelen blijven beoordeelbaar wanneer dat verantwoord is.
- Internationale, juridische, deeljaar- en uitzonderingssituaties mogen nooit met schijnzekerheid worden berekend.

### Evidence, reason codes en actieplannen

- Iedere signalering, schatting en aanbeveling verwijst machineleesbaar naar gebruikte regels, brondata, inputs, inferenties, aannames, uitgesloten regels, ontbrekende velden, onzekerheden en geldigheidsperiode.
- Machineleesbare reason codes staan los van UI-copy en mogen niet als volledige gebruikersboodschap worden behandeld.
- Iedere afgeronde evaluatie bevat een geprioriteerd actieplan.
- Actietypen bevatten minimaal `collect-data`, `verify-officially`, `run-project-tool`, `apply-officially`, `monitor-year-change`, `review-later` en `not-relevant-now`.
- Officiële aanvraag, proefberekening of beschikking blijft eindverantwoordelijk waar nodig; officiële links worden centraal en veilig beheerd.

### Privacy, hosting en tests

- Static-first blijft verplicht. Geen backend, opslag, analytics op inhoudelijke invoer, secrets of runtimekosten zonder expliciet architectuurbesluit.
- Generieke primitives krijgen pure unit tests; adapters krijgen domeinspecifieke tests.
- Confidencefactoren, unknown-answerflows, inference provenance, dependencygedrag, stale hidden fields, source-year- en freshnessgedrag worden afzonderlijk getest.
- Reacttests mogen domeintests niet vervangen; regressietests voor bestaande publieke tools blijven verplicht.

### Eerste implementatiegrens

- De eerstvolgende technische implementatie mag alleen een technische ontwerpnotitie voor `src/lib/regulations`, minimale centrale TypeScript-primitives, pure generieke helpers en unit tests voor generiek gedrag toevoegen.
- De eerstvolgende technische implementatie mag nog geen publieke toeslagenscan aanpassen, bedragen berekenen, officiële toeslagformules invoeren, allowance-adapters koppelen, React wijzigen, manifests/routes/dashboard/PDF wijzigen, gegevensoverdracht activeren, backend of opslag toevoegen.

## Nieuwe berekeningen toevoegen

1. Zoek eerst bestaande centrale helpers, constants en tests.
2. Plaats nieuwe formulelogica in de meest centrale passende laag.
3. Voeg alleen een dunne façade toe in de tool als de UI die nodig heeft.
4. Voeg unit tests toe voor normale input, grenswaarden, nulwaarden, ongeldige input en regressie.
5. Bewaar uitvoer- en foutteksten in de laag waar de gebruiker ze ziet, maar houd formules zelf buiten de presentatie.

## Blueprint-check voor nieuwe en geactiveerde tools

Deze check is verplicht bij een nieuwe tool, gekopieerde tool, experimentele tool die actief wordt, inactieve tool die opnieuw wordt geactiveerd, dashboardzichtbaarheid, publieke publicatie, statuswijziging naar actief of een nieuwe route waarmee bezoekers de tool kunnen gebruiken. Een tool mag niet actief of publiek worden gemaakt voordat de volledige blueprint-check is afgerond.

Controleer minimaal:

- De tool staat in een eigen directory onder `apps/<slug>`.
- Het manifest is aanwezig en geldig.
- De toolstatus is expliciet vastgelegd.
- Registry, auto-discovery en dashboardzichtbaarheid zijn correct.
- De `Calculator.tsx` is een dunne façade.
- React-componenten bevatten geen financiële formules.
- De tool gebruikt de bestaande centrale domeinlagen.
- Er is geen gekopieerde DUO-, hypotheek-, fiscale of andere centrale rekenlogica.
- Formulierinput wordt expliciet gemapt naar domeininput.
- Parsing, validatie, berekening en resultaatframing zijn gescheiden.
- Bestaande gedeelde formuliercomponenten worden gebruikt waar dat passend is.
- Er wordt geen parallelle utility- of calculatorlaag toegevoegd.
- Tool-specifieke uitzonderingen staan niet in generieke renderers.
- Progressive disclosure en de centrale formulier-UX-regels worden gevolgd.
- Validatiefouten en foutmeldingen zijn duidelijk.
- Scherm en PDF gebruiken hetzelfde berekenpad.
- PDF-output gebruikt dezelfde resultaatdata of hetzelfde viewmodel als het scherm.
- Er bestaan geen afzonderlijke PDF-formules.
- Relevante bronnen en toelichtingen worden centraal en consistent gebruikt.
- Bronafhankelijkheden staan in de centrale source-datasetregistry of zijn bewust buiten de rekenscope gehouden.
- Brondatawijzigingen hebben regressietests en slagen voor `npm run validate:source-data`; gegenereerde broninventaris is bijgewerkt wanneer de registry wijzigt.
- De tool heeft relevante unit- en regressietests.
- De tool werkt via het dashboard.
- De tool werkt via de directe URL.
- Browser-refresh op de directe URL werkt.
- De productiebuild werkt.
- Inactieve tools worden niet onbedoeld zichtbaar.
- Secrets staan niet in broncode of manifests.
- Er is geen ongecontroleerde server-side code execution.
- Inputvalidatie en eventuele rate limiting zijn passend geregeld.
- Logging en foutafhandeling voldoen aan de repositoryregels.
- Type A-tools blijven statisch exporteerbaar en krijgen geen backend, secret of externe API-afhankelijkheid zonder aantoonbare noodzaak.
- Type B-tools hebben een afgebakende API, schema- en servervalidatie, auth/autorisatie waar nodig, veilige CORS, rate limiting bij misbruikrisico, request-sizebeperkingen, time-outs, minimale rechten en basislogging zonder gevoelige data.
- Type B-tools documenteren vóór activatie hun dataretentie, upload- en dependencybeleid, abuse- en kostenlimieten, monitoring en rollbackpad.
- Nieuwe dependencies, externe scripts en grote datasets zijn gemotiveerd, clientbundel-impact is beoordeeld en lazy-loading is toegepast waar passend.
- CI/deploy blijft goedkoop en simpel: `npm run generate:apps`, generated-file diff-check waar relevant, lint, typecheck, tests en build blijven groen voordat een tool publiek wordt.
- Hostingwijzigingen beschrijven noodzaak, kostenimpact, securityrisico's, benodigde environment variables en rollbackpad.
- `FUNCTIONALITY_STATUS.md` of de bestaande statusdocumentatie is bijgewerkt.
- De blueprint-check is uitgevoerd vóór activatie of publicatie.

Een inactieve of experimentele tool hoeft niet direct volledig naar de actuele blueprint te worden gemigreerd. Zodra deze tool wordt geactiveerd, gepubliceerd of zichtbaar gemaakt, is de volledige blueprint-check verplicht en moeten alle relevante afwijkingen vóór activatie worden opgelost.

Toekomstige Codex-agents controleren bij het invoeren of activeren van een tool niet alleen of de tool technisch werkt, maar ook of deze architectonisch aan de blueprint voldoet.

## Correct versus fout

- Correct: een app-logicmodule roept `calculateAnnuityPayment(...)` of `calculateWeightedAverageRate(...)` aan en rendert alleen de uitkomst.
- Fout: een `Calculator.tsx` berekent zelf rente, maandlast, LTV, LTI, schuldweging of aflossingsschema.
- Fout: dezelfde formule staat in meerdere modules met kleine varianten.
- Fout: hardcoded percentages of tabellen verspreid door componenten.

## Checklist voor wijzigingen

- Is er al een centrale functie voor deze berekening?
- Staat de formule niet al in een component of route?
- Zijn waarden, tabellen en aannames centraal opgeslagen?
- Zijn edge cases getest?
- Blijft de bestaande output exact gelijk of expliciet gemotiveerd gewijzigd?
- Is de wijziging backward-compatible voor bestaande URL's en tools?

## Invoer- en formulier-UX

- Maak invoer in live tools overzichtelijk, rustig en stapsgewijs.
- Vermijd lange lijsten met velden op één scherm; splits complexe flows op in duidelijke secties of stappen.
- Toon alleen velden die relevant zijn voor de gemaakte keuzes.
- Gebruik progressive disclosure voor verdiepende velden en scenario's.
- Geef elk complex veld een korte toelichting, met waar nuttig een voorbeeld.
- Gebruik begrijpelijke labels en geen interne DUO-termen zonder uitleg.
- Vermeld per relevant veld waar de gebruiker het bedrag of de datum in Mijn DUO kan vinden.
- Toon vóór de berekening een overzichtsscherm met alle ingevulde gegevens.
- Maak duidelijk welke waarden uit Mijn DUO moeten worden overgenomen.
- Geef duidelijke foutmeldingen naast het betreffende veld.
- Laat gebruikers altijd teruggaan zonder invoer te verliezen.
- Bewaar invoer lokaal volgens het bestaande profiel- en opslagmodel.
- Maak bedragen, perioden en scenario's visueel goed onderscheidbaar.
- Zorg dat formulieren goed werken op mobiel en desktop.
- Gebruik waar mogelijk bestaande centrale formuliercomponenten in plaats van per tool afwijkende formulieren.
- Houd labels, toetsenbordbediening, focus en foutmeldingen toegankelijk en semantisch correct.

## PDF-functionaliteit

- Voeg op iedere live calculator en relevante resultatenpagina een duidelijke knop toe: `Download uitgebreid PDF-overzicht`.
- Gebruik één centrale PDF-laag en gedeelde PDF-componenten; bouw niet per tool een losse PDF-implementatie.
- Laat de PDF dezelfde gevalideerde resultaatdata gebruiken als de webinterface en herbereken niets apart.
- Houd PDF-data gescheiden van React-UI-componenten.
- Genereer PDF's bij voorkeur client-side als dat betrouwbaar kan; gebruik alleen server- of serverlessverwerking wanneer dat aantoonbaar nodig is.
- Voeg geen persoonlijke invoer toe aan logging of externe PDF-diensten.
- De PDF bevat minimaal een voorblad, gegroepeerde invoer, uitgebreide resultaten, scenariovergelijking, tijdlijn, toelichting per uitkomst, regels en bronnen, aannames en beperkingen, en praktische actiepunten.
- Zorg voor professioneel A4-ontwerp met duidelijke hoofdstukken, vaste kop- en voettekst, paginanummers, goede witruimte en correcte pagina-afbrekingen.
- Vermeld per regel of bron de officiële bron, brontitel, URL, geldigheidsdatum en geraadpleegde datum wanneer dat relevant is voor de berekening.
- Test PDF-data, verplichte secties, consistente uitkomsten, correcte bestandsnaam en de afstemming met de webinterface.

## UX- en frontendregels

- Gebruikersbegrip en taakvoltooiing gaan voor technische voorkeur of visuele vernieuwing.
- Ontwerp en test mobile-first. Controleer minimaal 390 px mobiel en 1440 px desktop.
- Introduceer geen nieuw interactiepatroon wanneer een bestaand gedeeld component hetzelfde probleem oplost.
- Hergebruik `CalculatorShell`, `ToolActionButton`, `MobileFieldFlowControls`, `FieldError`, `DisclosureSection` en de centrale UI-componenten waar passend.
- Een calculator toont op mobiel eerst de invoer. Na berekenen mag de flow naar het resultaat scrollen.
- Knoppen en primaire links hebben waar mogelijk een aanraakvlak van minimaal 44 px hoog.
- Elk invoerveld heeft een zichtbaar label of een gelijkwaardige programmatische naam. Een placeholder is geen label.
- Fouten verschijnen bij het betreffende veld, worden begrijpelijk beschreven en zijn voor hulptechnologie waarneembaar.
- Focusstates, toetsenbordbediening, semantische HTML en voldoende contrast zijn verplicht.
- Respecteer `prefers-reduced-motion`. Voeg geen essentiële informatie toe die alleen via animatie zichtbaar is.
- Nieuwe schermen bevatten ook relevante loading-, empty-, error- en disabled states.
- Verander bestaande gebruikersstromen alleen met een expliciete motivatie en regressietest.
- Nieuwe of aangepaste formulier- en PDF-flows volgen altijd de centrale componenten en gedeelde data- en formatlaag.
- Werk bij UX-wijzigingen ook `UX_GUIDELINES.md`, `DESIGN_SYSTEM.md` of `docs/UX_AUDIT_2026-06-13.md` bij wanneer de standaard of status verandert.

## UX-check voor oplevering

- Werkt de primaire taak zonder horizontale scroll op 390 px?
- Is er precies één paginabrede `h1`?
- Is de tabvolgorde logisch en blijft focus zichtbaar?
- Zijn CTA, validatie en resultaatstatus begrijpelijk zonder vakkennis?
- Zijn mobiele vervolgstappen en de uiteindelijke berekenactie bereikbaar?
- Blijft dezelfde flow op desktop efficiënt en scanbaar?
