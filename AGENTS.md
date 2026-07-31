# Agent Instructions

Dit bestand is de operationele bron voor AI-agents en engineers die in deze repository werken.
Lees dit eerst voordat je berekeningen, manifests, routing, formulieren, uitleg of bronverwijzingen aanpast.

## Hoofdregel

**Nieuwe of aangepaste berekeningslogica mag nooit verspreid worden toegevoegd. Controleer altijd eerst of er bestaande centrale logica is. Hergebruik of breid de centrale rekenlaag uit. Duplicatie van formules, parameters of business rules is niet toegestaan.**

**De Project Site geeft de gebruiker zelf een helder en bruikbaar antwoord. De gebruiker wordt niet naar een primaire bron gestuurd om een regel, bedrag, grens of conclusie zelf te achterhalen. Primaire bronnen dienen voor onderbouwing, controle en verdieping en worden als voetnoot of bronverwijzing aangeboden.**

**`Weet ik niet` is nooit geldige eindinvoer voor een berekening. Het mag alleen een tijdelijke status in de intake zijn. De applicatie helpt de gebruiker vervolgens om het gegeven te vinden, te begrijpen of verantwoord af te leiden voordat het centrale rekenpad wordt aangeroepen.**

De zichtbare site is in de huidige launch-scope puur informatief over studieschuld. Publieke UI-copy bevat geen beleggen-framing, geen aflossen-vs-beleggen-route en geen persoonlijk advies. `FUNCTIONALITY_STATUS.md` is leidend voor welke tools en flows publiek zichtbaar, hidden, voorbereid of uitgeschakeld zijn.

Alles wat niet meer actief aangeroepen wordt in de zichtbare site blijft wel in de codebase, maar wordt hidden/draft gehouden en uit de publieke registry, navigatie en route-oppervlakken gehouden totdat er expliciet een heractivatiebesluit is.

## Projectdoel

Project Site is een browser-first, modulair platform voor financiële hulpmiddelen. Het project helpt gebruikers hun situatie te begrijpen met rekentools, signaleringen, scenario's, bronverwijzingen en uitleg, zonder juridisch, financieel, fiscaal of hypotheekadvies te geven.

De gebruikerservaring is:

- helder en begrijpelijk zonder vakkennis;
- lean: alleen noodzakelijke informatie en invoer is direct zichtbaar;
- antwoordgericht: de tool geeft zelf de conclusie, berekening en toelichting;
- controleerbaar: gebruikte gegevens, regels, aannames en bronnen zijn bij verdieping na te gaan;
- gelaagd: de hoofdboodschap is kort, aanvullende details zijn beschikbaar via progressive disclosure;
- actiegericht: de gebruiker begrijpt na afloop wat de uitkomst betekent en wat een logische vervolgstap is.

De vaste projectrichting:

- browser-first en static-first waar mogelijk;
- modulair via apps onder `apps/<slug>` met manifestgedreven discovery;
- Type A-apps blijven pure frontend/static tools zonder geheimen, backend of verplichte externe runtime;
- Type B-apps krijgen alleen een backend wanneer een expliciet architectuur-, security-, kosten- en rollbackbesluit dat rechtvaardigt;
- centrale domeinengines en gedeelde rekenlagen blijven leidend;
- de centrale Regulations Engine-primitives ondersteunen definitions, tijdelijke unknown answers, resolution, inference, evaluation, confidence, reason codes, recommendations, estimates en action plans;
- `src/lib/financial-constants` blijft de SSOT voor brondata, metadata, geldigheid, freshness en bronverwijzingen;
- hosting blijft goedkoop, simpel en reproduceerbaar;
- toekomstige schaalbaarheid komt uit centrale primitives, adapters, source governance, tests en duidelijke publicatiechecks, niet uit losse calculatorframeworks.

## Product- en uitlegprincipes

### De applicatie geeft het antwoord

De gebruiker hoeft niet zelf wetgeving, tabellen, uitvoeringsregels of overheidspagina's te interpreteren.

De applicatie:

- geeft zelf het relevante antwoord in begrijpelijke taal;
- past officiële regels en brondata intern toe;
- licht toe welke regel doorslaggevend is;
- toont de primaire bron als voetnoot, bronlabel of verdiepingslink;
- verwijst alleen voor een officiële aanvraag, beschikking of persoonlijke administratie naar een externe omgeving.

Een externe bron mag nooit de plaats innemen van ontbrekende uitleg in de applicatie.

Fout:

> Bekijk de website van DUO om te bepalen welk peiljaar geldt.

Correct:

> Voor studiefinanciering in 2026 gebruikt DUO normaal het inkomen van je ouders uit 2024.¹

Waarbij voetnoot `1` naar de relevante primaire DUO-bron verwijst.

### Lean hoofdflow, volledige verdieping

De primaire gebruikersflow toont alleen:

- noodzakelijke vragen;
- de belangrijkste uitkomst;
- de belangrijkste toelichting;
- relevante waarschuwingen;
- concrete vervolgstappen.

Technische details, tussenberekeningen, definities, aannames, bronmetadata en juridische context worden beschikbaar gemaakt via:

- uitklapbare toelichtingen;
- voetnoten;
- bronoverzichten;
- een berekeningsverantwoording;
- een uitgebreid PDF-overzicht waar van toepassing.

Lean betekent niet dat informatie wordt weggelaten die nodig is voor een correcte beslissing. Het betekent dat informatie gelaagd wordt gepresenteerd.

### Onbekende invoer oplossen

`Weet ik niet` mag in een intake worden aangeboden wanneer dit voorkomt dat een gebruiker vastloopt, maar is geen geldige waarde voor een definitieve berekening.

Na `Weet ik niet` doet de applicatie minimaal één van de volgende dingen:

- legt het begrip eenvoudiger uit;
- geeft een herkenbaar voorbeeld;
- vraagt een eenvoudigere vervolgvraag;
- toont waar het persoonlijke gegeven in de eigen administratie te vinden is;
- leidt de waarde verantwoord af uit andere antwoorden;
- vraagt de gebruiker een afgeleide waarde te bevestigen;
- geeft een concrete praktische instructie om het gegeven te achterhalen.

Voor algemene regels, bedragen, percentages, grenzen en definities geeft de Project Site zelf het antwoord. De gebruiker wordt daarvoor niet naar een primaire bron gestuurd.

Voor persoonlijke gegevens mag de tool aangeven waar deze te vinden zijn, bijvoorbeeld in Mijn DUO, een loonstrook, belastingaangifte, huurovereenkomst of beschikking. Ook dan legt de tool uit welk exact gegeven nodig is en hoe het herkend moet worden.

Essentiële onopgeloste invoer wordt nooit stil vervangen door `0`, een gemiddelde of een standaardwaarde.

## Documentatiehiërarchie

Gebruik deze volgorde wanneer documenten of prompts elkaar overlappen:

1. `AGENTS.md`: bindende werkwijze, scope-, git-, architectuur-, test-, UX-, bronnen- en releaseguardrails voor agents.
2. `PROJECT.md`: canonieke projectvisie, productrichting, hoofdarchitectuur, domeinen, roadmap en niet-doelen.
3. `FUNCTIONALITY_STATUS.md`: single source of truth voor zichtbaarheid, flags, publieke/hidden status en functionele status.
4. Gerichte documenten in `docs/`, zoals `docs/calculator-architecture.md`, `docs/source-data-architecture.md`, `docs/regulations-engine-technical-design.md`, `docs/regelingen-toeslagen-engine-architecture.md` en brondocumenten.
5. `CONTRIBUTING.md`, `README.md` en inline comments voor aanvullende lokale conventies.

Verwijs waar mogelijk naar bestaande documenten in plaats van dezelfde regels opnieuw te beschrijven. Als een prompt afwijkt van deze hiërarchie, volg de hoogste geldige bron en benoem de afwijking in de overdracht.

## Standaard werkwijze

Iedere Codex-agent volgt standaard deze workflow, ook als een prompt kort is:

1. Lees `AGENTS.md`.
2. Lees `PROJECT.md`.
3. Lees relevante architectuur-, status-, bron-, UX- of domeindocumenten voor de gevraagde scope.
4. Controleer repositorypad, branch, HEAD, origin en werkboom.
5. Bepaal doel, scope, out-of-scope en geraakte eigenaarschappen.
6. Inventariseer bestaande centrale logica, adapters, tests, componenten, brondata en documentatie voordat je iets wijzigt.
7. Bepaal welke informatie de gebruiker werkelijk nodig heeft en voorkom onnodige invoer of uitleg in de hoofdflow.
8. Wijzig alleen noodzakelijke bestanden binnen scope.
9. Houd gebruikers- en andere agentwijzigingen intact.
10. Voer passende controles uit: gericht bij documentatie, volledig bij code, manifest, registry, rekenlogica, UI, PDF of release-impact.
11. Stage alleen eigen bestanden.
12. Commit met een gerichte conventionele commitmessage wanneer de opdracht dat vraagt of de wijziging afgerond is.
13. Push naar `main` wanneer controles groen zijn en het gitbeleid dat toestaat.
14. Sluit af met een compacte overdracht met status, wijzigingen, controles, commit en resterende punten.

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
- Voeg geen extra invoervelden toe zonder vast te stellen dat deze noodzakelijk zijn voor berekening, verklaring of veilige uitzonderingsafhandeling.
- Bij twijfel: kies de kleinste wijziging die het doel volledig bereikt.

## Test- en controlebeleid

Standaard beschikbare controles:

- `npm run process:check`
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
- Intake-, unknown-resolution- of inferencewijziging: gerichte tests voor tijdelijke unknown-status, vervolgvragen, afleiding, bevestiging en mapping naar concrete calculation input.
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
- er onvoldoende bronbasis is voor een financiële formule, bedrag, rechtclaim of actuele waarde;
- een essentiële berekeningsinput alleen als unresolved `unknown` beschikbaar is;
- een publieke flow de gebruiker naar een primaire bron verwijst om een regel of conclusie zelf uit te zoeken die de applicatie behoort te geven;
- een resultaat alleen met schijnzekerheid kan worden berekend.

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

## Procesdocumentatie van publieke tools

Iedere actieve publieke tool heeft een gecontroleerde `apps/<slug>/PROCESS.md`. Bij functionele wijzigingen aan formuliervelden, veldzichtbaarheid, validatie, berekeningen, datasets of financiële constants, profielprefill, sessieherstel, toolhandoffs, resultaten, waarschuwingen, PDF-uitvoer, vervolgstappen, route of activatiestatus moet dit procesdocument inhoudelijk worden gecontroleerd.

- Pas `PROCESS.md` in dezelfde wijziging aan wanneer het beschreven gedrag verandert.
- Vernieuw `sourceHash` nooit alleen om een controle groen te maken. Gebruik pas na inhoudelijke controle `npm run process:update -- --tool <tool-id> --reviewed`.
- Een toolwijziging is niet afgerond zolang `npm run process:check` niet slaagt.
- De centrale, gegenereerde inventaris staat in `docs/processes/README.md`; onderhoud geen tweede handmatige lijst van actieve procesdocumenten.
