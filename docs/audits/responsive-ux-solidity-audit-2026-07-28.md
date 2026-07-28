# Responsieve UX- en soliditeitsaudit

Datum: 28 juli 2026

Repository: Project website

Geteste branch: `main`

Geteste commit: `4f0ba05ad04e475488ac15f033bcfe46d09e482d`

Status: **nog niet solide genoeg voor alle schermformaten**

## 1. Managementsamenvatting

De site is inhoudelijk veel rustiger en duidelijker geworden. De homepage, foutpagina, over-pagina en de meeste primaire toolflows schalen goed van 320 tot 1920 pixels. De mobiele veldflow van beide hypotheektools voorkomt effectief dat een klein scherm wordt overspoeld met invoervelden. Resultaten zijn meestal herkenbaar opgebouwd, noodzakelijke waarschuwingen blijven zichtbaar en de belangrijkste DUO-uitkomsten zijn begrijpelijker dan in de eerdere audit.

Toch kan de huidige versie nog niet als volledig responsief en robuust worden aangemerkt. Er zijn twee releaseblokkerende problemen:

1. De publieke CTA **“Of start zonder profiel”** verwijst naar de verborgen tool `/apps/volgende-euro`. Rechtstreeks openen geeft HTTP 404. Bij klikken vanuit het tooloverzicht blijft de bezoeker zonder duidelijke reactie op `/apps`.
2. In de aanvullende-beurstool overlappen invoervelden, selecties, labels en hulpcopy aantoonbaar tussen 1024 en 1180 pixels. Dit treedt precies op bij de door de eigenaar genoemde situatie met twee ouders en broers of zussen.

Daarnaast zijn er vijf belangrijke responsieve problemen:

- begrippentooltips vallen op kleine telefoons buiten het scherm;
- een uitgevouwen veld van “Impact van mijn leenbedrag” wordt op 320 pixels rechts afgeknipt;
- de nieuwe profielnavigatie is op 320 en 360 pixels vrijwel of gedeeltelijk buiten beeld;
- acht van de tien toolkaartbeschrijvingen worden op 320 pixels midden in een zin afgekapt;
- kennisbank, hypotheekverdieping en toeslagenflow blijven bij volledige bediening zeer lang en gefragmenteerd.

Advies: los eerst RUX-001 tot en met RUX-006 op en voeg de voorgestelde regressietests toe. Daarna kan de informatiedichtheid worden teruggebracht zonder formules, brondata, waarschuwingen of categorie-E-onderdelen te wijzigen.

## 2. Scope en werkwijze

### 2.1 Publieke oppervlakken

De audit omvatte:

- homepage;
- tooloverzicht;
- kennisbank;
- aannames en vaste variabelen;
- over-pagina;
- profiel;
- 404-pagina;
- alle tien publieke toolroutes:
  - maximale hypotheek;
  - aanvullende beurs;
  - extra aflossen;
  - impact van mijn leenbedrag;
  - DUO-maandbedrag;
  - studieschuld bij starten met lenen;
  - stoppen met studeren;
  - hypotheekimpact van studieschuld;
  - schulden vergelijken;
  - toeslagenscan.

### 2.2 Schermmatrix

Elke hoofdroute is getest op:

| Type | Scherm |
|---|---:|
| Kleine telefoon | 320 × 568 |
| Telefoon | 360 × 800 |
| Moderne telefoon | 390 × 844 |
| Grote telefoon | 430 × 932 |
| Telefoon liggend | 844 × 390 |
| Kleine tablet | 768 × 1024 |
| Tablet | 820 × 1180 |
| Tablet liggend | 1180 × 820 |
| Kleine laptop | 1024 × 768 |
| Laptop | 1280 × 720 |
| Desktop | 1440 × 900 |
| Grote desktop | 1920 × 1080 |

De aanvullende-beurstool is bovendien zonder paginaverversing heen en terug geschaald via:

`1440 → 1280 → 1180 → 1024 → 901 → 900 → 821 → 820 → 769 → 768 → 640 → 430 → 390 → 360 → 320 → 768 → 1024 → 1440`.

### 2.3 Geteste interacties en staten

De controles omvatten:

- verse paginaweergave;
- voorbeeldgegevens invullen;
- resultaten berekenen;
- alle beschikbare details openen;
- twee ouders selecteren;
- broer-/zusvelden openen;
- woningdoelvelden openen;
- profielstappen Inkomen, Studieschuld en Wonen;
- ongeldige profielinvoer en foutfocus;
- profiel zonder waarden opslaan;
- profiel met gegevens wissen;
- mobiele hypotheekflows volledig doorlopen;
- toetsenbordfocus en zichtbare focusstijl;
- alle interne publieke links inventariseren;
- alle zichtbare begrippentooltips op 320 pixels focussen;
- continu vergroten en verkleinen zonder herladen;
- automatische controle op:
  - horizontale overflow;
  - overlappende form controls;
  - elementen buiten de viewport;
  - afgekapte tekst;
  - kleine aanraakdoelen;
  - dubbele `id`-waarden;
  - labels zonder gekoppeld veld.

De hoofdmeting bevat 210 route-/viewportstaten. Aanvullend zijn 36 profielstaten, acht volledige mobiele hypotheekreizen, zeventien begrippentooltips en zeventien unieke interne routebestemmingen gecontroleerd. Er zijn 84 gerichte screenshots gemaakt.

### 2.4 Grenzen van deze audit

De schermen zijn met Chromium en Playwright geëmuleerd. Dit is geschikt voor reproduceerbare layout-, focus-, resize- en interactiecontroles, maar vervangt geen laatste controle op fysieke apparaten.

Nog nodig vóór een definitieve releasekwalificatie:

- echte iPhone met Safari, inclusief softwaretoetsenbord;
- echte kleine Androidtelefoon met Chrome;
- iPad/Safari in beide oriëntaties;
- desktop Firefox;
- desktop Safari;
- controle met browserzoom op 200% en 400%;
- controle met besturingssysteeminstellingen voor grotere tekst;
- handmatige schermlezercontrole met VoiceOver en NVDA.

## 3. Prioriteitenoverzicht

| ID | Prioriteit | Onderdeel | Kernprobleem |
|---|---|---|---|
| RUX-001 | P0 | Tooloverzicht/profielroute | Publieke CTA verwijst naar verborgen 404-route |
| RUX-002 | P0 | Aanvullende beurs | Velden en labels overlappen bij 1024–1180 px |
| RUX-003 | P1 | Begrippentooltips | 11 van 17 tooltips vallen op 320 px buiten beeld |
| RUX-004 | P1 | Impact leenbedrag | Uitgevouwen veld maakt body 332 px breed bij viewport 320 px |
| RUX-005 | P1 | Mobiele header | Profielitem is op 320/360 px niet goed zichtbaar |
| RUX-006 | P1 | Toolkaarten | Acht van tien taakzinnen worden afgekapt |
| RUX-007 | P1 | Profiel wissen | Directe verwijdering zonder bevestiging of herstel |
| RUX-008 | P2 | Kennisbank | Volledig geopende pagina is 18.444 px lang op 320 px |
| RUX-009 | P2 | Hypotheekresultaten | 24 respectievelijk 12 verdiepingsblokken |
| RUX-010 | P2 | Toeslagenscan | Vijf stappen staan mobiel onder elkaar op één pagina |
| RUX-011 | P2 | DUO-maandbedrag | Lege draagkracht als volwaardige resultaatkaart |
| RUX-012 | P2 | Profiel | Leeg opslaan meldt succes terwijl geen profiel actief wordt |
| RUX-013 | P2 | Aanraakdoelen | Losse summaries, begrippen en bronlinks zijn vaak lager dan 44 px |
| RUX-014 | P3 | Donkere componenten | Crème en wit worden niet overal consequent toegepast |
| RUX-015 | P3 | Aannames/bronnen | Lange bron-URL en technische bronmetadata domineren mobiel |
| RUX-016 | P3 | Mobiele grafieken | Grafiekvlak en legenda worden erg klein op 320 px |

## 4. Gedetailleerde bevindingen

### RUX-001: Publieke CTA leidt naar verborgen 404-route

Prioriteit: **P0, releaseblokkerend**

Locatie:

- `src/components/PersonalRoute.tsx`
- `apps/volgende-euro/app.json`
- publieke route `/apps`

Waarneming:

- Op het tooloverzicht staat onder “Heb je een profiel ingevuld?” de CTA “Of start zonder profiel”.
- De link verwijst naar `/apps/volgende-euro`.
- `volgende-euro` heeft `visibility: "hidden"`.
- Rechtstreeks openen geeft HTTP 404 en de kop “Deze pagina is niet gevonden.”
- Klikken vanuit `/apps` leverde in de browser geen zichtbare navigatie op; de bezoeker bleef op `/apps`.
- De crawl van zeventien unieke interne bestemmingen vond verder geen andere 4xx-route.

Impact:

- De bezoeker krijgt een schijnbaar belangrijke keuze die niet werkt.
- De link doorbreekt de vastgelegde launch-scope, omdat de verborgen tool over buffer, pensioen en beleggen gaat.
- Dit is extra verwarrend voor bezoekers met weinig digitale of financiële kennis.

Aanpassing:

- Verwijder de CTA of laat deze naar een bestaand anker in het publieke tooloverzicht wijzen.
- Activeer `volgende-euro` niet als oplossing; de tool moet hidden blijven zolang daar geen apart productbesluit voor is.
- Maak de tekst taakgericht, bijvoorbeeld “Kies hieronder een tool”, als een tweede actie werkelijk nodig is.

Acceptatie:

- Geen publieke link verwijst naar een hidden/draft slug.
- Alle interne links op alle publieke routes geven 2xx of een bedoelde 3xx.
- `volgende-euro` blijft afwezig in publieke navigatie, registry en routeoppervlakken.

### RUX-002: Aanvullende-beursvelden overlappen op laptop- en tabletbreedte

Prioriteit: **P0, releaseblokkerend**

Locatie:

- `apps/duo-aanvullende-beurs/Calculator.tsx`
- `src/components/tool/CalculatorShell.tsx`

Geteste staat:

- voorbeeldgegevens;
- reguliere oudersituatie;
- twee ouders;
- disclosure “Aftrekposten en broers of zussen” open;
- resultaat berekend;
- 1024 en 1180 pixels;
- resize zowel van groot naar klein als terug naar groot.

Gemeten overlap op 1024 pixels:

| Veld 1 | Veld 2 | Overlap |
|---|---|---:|
| Ouderinkomen ouder 1 | Status inkomen ouder 1 | circa 19,9 px |
| Ouderinkomen ouder 2 | Status inkomen ouder 2 | circa 19,9 px |
| DUO-termijnen ouder 1 | Andere kwalificerende kinderen ouder 1 | circa 27,9 px |
| Andere kwalificerende kinderen ouder 2 | Kinderen met aanvullende beurs ouder 2 | circa 8,7 px |

Op 1180 pixels overlapten DUO-termijnen ouder 1 en andere kwalificerende kinderen ouder 1 nog circa 8,4 pixels. Op 1280 pixels was geen harde rechthoekoverlap meer gemeten, maar raakten velden en labels visueel nog bijna aan.

Oorzaak:

- `CalculatorShell` schakelt vanaf `lg` naar een tweekoloms hoofdindeling.
- De linkerkolom wordt daardoor relatief smal.
- Binnen die smalle kolom blijven formulieren vanaf viewportbreedte `sm` eveneens twee kolommen gebruiken.
- De innerlijke grid reageert dus op de viewport en niet op de werkelijk beschikbare containerbreedte.
- `FieldShell` mist een expliciete `min-w-0`.
- De selecties en veldomhulsels zijn niet overal expliciet `w-full min-w-0`.

Cognitief probleem:

De broer-/zusvelden staan in één vlakke lijst. Bij twee kolommen ontstaat deze visuele volgorde:

1. ouder 1, DUO-termijnen;
2. ouder 1, andere kinderen;
3. ouder 1, kinderen met beurs;
4. ouder 2, DUO-termijnen;
5. ouder 2, andere kinderen;
6. ouder 2, kinderen met beurs.

Door de rijverdeling komen velden van ouder 1 en ouder 2 naast elkaar of kruislings te staan. Ook zonder pixeloverlap is daardoor niet direct duidelijk welk veld bij welke ouder hoort.

Aanpassing:

- Groepeer de drie velden per ouder in een eigen `fieldset` met een duidelijke `legend`, bijvoorbeeld “Ouder 1” en “Ouder 2”.
- Toon die oudergroepen in de smalle calculatorhelft onder elkaar.
- Gebruik pas twee kolommen als de container zelf aantoonbaar breed genoeg is; een container query heeft hier de voorkeur boven een viewport-`sm`-breakpoint.
- Voeg `min-w-0` toe aan iedere grid child en `w-full min-w-0` aan de veldomhulsels.
- Gebruik voor flexibele numerieke inputs zo nodig `w-0 flex-1` om browser-intrinsieke minimumbreedtes te neutraliseren.

Acceptatie:

- Nul overlap tussen labels, hints, inputs, selecties en foutmeldingen op 320, 360, 390, 430, 640, 768, 820, 900, 901, 1024, 1180, 1280, 1440 en 1920 pixels.
- Nul overlap na heen-en-weer resizen zonder herladen.
- Focusvolgorde is eerst alle velden van ouder 1 en daarna alle velden van ouder 2.
- Iedere oudergroep is semantisch herkenbaar voor een schermlezer.
- De bestaande rekenlogica, brondata en noodzakelijke velden blijven ongewijzigd.

### RUX-003: Begrippentooltips vallen buiten kleine telefoons

Prioriteit: **P1**

Locatie:

- `src/components/GlossaryText.tsx`
- zichtbaar op `/apps`, `/kennisbank`, DUO-maandbedrag en schulden vergelijken

Waarneming:

- Zeventien zichtbare begrippentriggers zijn op 320 pixels gefocust.
- Elf tooltips vielen deels buiten de viewport.
- De grootste gemeten afwijking was circa 55 pixels links en circa 40 pixels rechts.
- Voorbeelden: eigen geld, indicatief, toeslagen, draagkracht, scenario en maandlast.
- `html` en `body` gebruiken `overflow-x: clip`; het buitenste deel is dus niet betrouwbaar leesbaar.

Oorzaak:

De tooltip staat absoluut op `left: 50%` met `translateX(-50%)` en een vaste mobiele breedte van `80vw`. De positionering wordt niet tegen de viewportranden begrensd.

Aanpassing:

- Gebruik op mobiel een eenvoudige vaste uitleglaag binnen `inset-inline: 1rem`, bijvoorbeeld onderaan het scherm.
- Behoud op grotere schermen een verankerde tooltip, maar begrens de positie tegen beide viewportranden.
- Sluit de uitleg met Escape en bij focusverlies.
- Maak de trigger op touch duidelijk bedienbaar en voorkom uitsluitend hoverafhankelijk gedrag.

Acceptatie:

- Elke tooltip blijft volledig binnen de viewport op 320 pixels.
- De uitleg werkt via tik, Enter, Spatie, focus en Escape.
- Focus blijft logisch en keert na sluiten terug naar het begrip.
- De tooltip bedekt het actieve begrip niet volledig.

### RUX-004: Uitgevouwen leenbedragveld wordt rechts afgeknipt op 320 pixels

Prioriteit: **P1**

Locatie:

- `apps/_duo_simple/FocusedDuoTool.tsx`
- route `/apps/duo-leenbedrag-impact`
- uitgevouwen verdieping met “Maanden tot diploma”

Waarneming:

- Viewportbreedte: 320 pixels.
- `document.body.scrollWidth`: 332 pixels.
- De labelregel, veldomhulling en foutcontainer liepen tot x = 332,3.
- De directe labelcontainer was 212 pixels breed, maar had een interne `scrollWidth` van 278 pixels.
- Op 360 pixels en groter trad dit niet op.

Impact:

Door globale `overflow-x: clip` ontstaat geen bruikbare horizontale scrollbar; de rechterzijde wordt simpelweg afgesneden.

Aanpassing:

- Geef het label, de grid child en de `field-shell` `w-full min-w-0`.
- Gebruik op het numerieke inputelement `w-0 min-w-0 flex-1`.
- Laat suffix “maanden” krimpen of op een eigen regel vallen als de container smaller wordt.

Acceptatie:

- Zowel `html.scrollWidth` als `body.scrollWidth` is maximaal gelijk aan `clientWidth`.
- De verdieping kan volledig worden geopend op 320 pixels zonder afkapping.
- Het veld blijft bruikbaar met een foutmelding en met een lange ingevoerde waarde.

### RUX-005: Profiel is mobiel vrijwel verborgen in de navigatie

Prioriteit: **P1**

Locatie:

- `src/components/SiteHeader.tsx`

Waarneming:

- De mobiele navigatie toont Stappenplan, Alle tools, Kennisbank en daarna Profiel.
- Op 320 pixels begon Profiel rond x = 317,9 en eindigde rond x = 381,4.
- Op 320 pixels is het item dus vrijwel volledig buiten beeld.
- Op 360 pixels is het slechts gedeeltelijk zichtbaar.
- Dit was reproduceerbaar op iedere publieke route, omdat dezelfde header overal staat.
- De rij kan horizontaal scrollen, maar geeft geen visueel signaal dat er meer navigatie buiten beeld staat.

Aanpassing:

- Maak horizontaal scrollen niet de enige manier om een primaire bestemming te vinden.
- Plaats Profiel bijvoorbeeld als compacte, gelabelde actie naast het logo, of gebruik één duidelijke mobiele menuknop met alle bestemmingen.
- Beperk de zichtbare mobiele hoofdrij tot bestemmingen die volledig passen.
- Als een scrollrij behouden blijft, scroll het actieve item automatisch volledig in beeld en toon een rand-/fade-aanwijzing.

Acceptatie:

- Alle primaire mobiele navigatiebestemmingen zijn op 320 pixels direct vindbaar.
- Het actieve item is volledig zichtbaar.
- Er ontstaat geen horizontale body-overflow.
- Toetsenbord- en schermlezergebruikers krijgen dezelfde bestemmingen en actieve status.

### RUX-006: Acht van tien toolkaartbeschrijvingen worden afgekapt

Prioriteit: **P1**

Locatie:

- `src/components/ToolCard.tsx`
- publieke route `/apps`

Waarneming:

- De beschrijving heeft `line-clamp-3`.
- Op 320 pixels waren acht van de tien beschrijvingen vier regels hoog, maar werden zij na drie regels afgeknipt.
- De zichtbare tekst eindigt daardoor onder andere op “gaat…”, “stu…”, “ruimte…”, “studieschuld…” en “indicatie…”.
- De gehele kaart is gelukkig een link; “Open tool” is dus geen te klein zelfstandig klikdoel.

Aanpassing:

- Schrijf iedere taakzin zo kort dat zij zonder afkapping past, of verwijder de line clamp.
- Gebruik geen ellips voor betekenisdragende taakcopy.
- Houd één concrete taak per kaart: wat rekent de tool en voor welke vraag is hij relevant.

Acceptatie:

- Alle tien taakzinnen zijn volledig leesbaar op 320 pixels.
- Geen kaart eindigt midden in een woord of zin.
- Kaarten blijven visueel rustig en hebben geen lege gaten door kunstmatige vaste hoogtes.

### RUX-007: Profiel wissen gebeurt zonder bevestiging of herstel

Prioriteit: **P1**

Locatie:

- `src/app/profiel/page.tsx`

Waarneming:

- Na het opslaan van een waarde wist “Profiel wissen” de browsergegevens direct.
- Er verscheen geen bevestigingsdialoog.
- Er is geen korte undo-mogelijkheid.
- De actie blijft ook zichtbaar als er nog geen opgeslagen profiel is.

Aanpassing:

- Deactiveer “Profiel wissen” wanneer geen profielwaarden bestaan.
- Vraag bij een bestaand profiel om een korte, duidelijke bevestiging, of bied een herstelactie zolang de pagina open blijft.
- Benoem de scope: “Wis profiel van dit apparaat” of “Wis tijdelijk profiel”.

Acceptatie:

- Een toevallige tik verwijdert geen profiel zonder tweede bewuste handeling of herstelmogelijkheid.
- Bevestiging en statusmelding zijn toetsenbord- en schermlezertoegankelijk.

### RUX-008: Kennisbank blijft extreem lang bij volledige verdieping

Prioriteit: **P2**

Gerelateerde eerdere auditpunten: V1-033, V1-037 en V1-038.

Locatie:

- `src/app/kennisbank/page.tsx`
- `src/lib/knowledge-base.ts`
- `src/lib/knowledge-sources.ts`

Waarneming in de stressstaat met alle details open:

| Scherm | Paginahoogte |
|---|---:|
| 320 px | 18.444 px |
| 390 px | 15.836 px |
| 768 px | 9.231 px |
| 1440 px | 7.255 px |

De pagina bevat zes omvangrijke onderwerpartikelen en een groot bronregister. De content is inhoudelijk bruikbaar, maar de gebruiker verliest makkelijk zijn positie en moet veel gelijkvormige kaarten scannen.

Aanpassing:

- Behoud een korte kennisbankindex.
- Geef elk hoofdonderwerp een eigen route of duidelijk deep-linkbaar suboverzicht.
- Toon per onderwerp eerst alleen antwoord, belangrijkste aandachtspunt en relevante tool.
- Houd checklist, veelgemaakte fouten en bronnen in één verdiepingsblok.
- Voeg een compacte inhoudsopgave of onderwerpfilter toe.
- Houd het centrale bronregister doorzoekbaar of filterbaar en standaard ingeklapt.

Acceptatie:

- Een gebruiker bereikt elk hoofdonderwerp binnen twee acties vanaf de kennisbankstart.
- Terug navigeren herstelt onderwerp en scrollpositie.
- Een onderwerp is direct deelbaar met een stabiele URL.
- Categorie-E-bronnen en noodzakelijke officiële controlelinks blijven behouden.

### RUX-009: Hypotheekresultaten hebben te veel afzonderlijke verdiepingsblokken

Prioriteit: **P2**

Gerelateerd eerder auditpunt: V1-074.

Locatie:

- `apps/hypotheek-impact-studieschuld/Calculator.tsx`
- `apps/artifact-hypotheek-wonen-maximale-hypotheek/Calculator.tsx`

Waarneming:

- Hypotheekimpact bevat 24 `details`-elementen in de volledig berekende staat.
- Maximale hypotheek bevat 12 `details`-elementen.
- Met alles open werd hypotheekimpact op 320 pixels circa 17.208 pixels hoog.
- Maximale hypotheek werd in dezelfde mobiele eindstaat circa 8.566 pixels hoog.
- De mobiele veldflows zelf zijn wel stabiel: 15 respectievelijk 7 stappen zijn zonder overlap doorlopen.

Aanpassing:

- Breng verdieping terug tot drie niveaus:
  1. hoofdantwoord;
  2. “Hoe komt dit bedrag tot stand?”;
  3. “Aannames, bronnen en uitzonderingen”.
- Groepeer verwante detailkaarten binnen deze niveaus.
- Laat het hoofdantwoord en de eerstvolgende actie altijd bovenaan staan.
- Verwijder geen inhoudelijke waarschuwingen of noodzakelijke bronverantwoording.

Acceptatie:

- Maximaal drie tot vijf top-level disclosures per resultaat.
- Dezelfde financiële uitkomsten, waarschuwingen en bronverwijzingen blijven beschikbaar.
- Geen geneste disclosure vereist meer dan twee niveaus navigatie.

### RUX-010: Toeslagenscan toont mobiel vijf stappen op één lange pagina

Prioriteit: **P2**

Gerelateerd eerder auditpunt: V1-089.

Locatie:

- `apps/toeslagen-scan/Calculator.tsx`

Waarneming:

- De flow gebruikt de titels Stap 1 tot en met Stap 5, maar toont de stappen op mobiel onder elkaar.
- Met voorbeeldinvoer, resultaat en alle details open is de pagina op 320 pixels circa 12.018 pixels hoog.
- Functionele voorwaardelijkheid werkt, maar de visuele lengte maakt het moeilijk te zien wat nu ingevuld moet worden.

Aanpassing:

- Toon op mobiel één echte stap tegelijk.
- Bewaar ingevoerde waarden bij vooruit en terug navigeren.
- Toon een korte samenvatting van afgeronde stappen.
- Spring bij fouten naar de juiste stap en het juiste veld.
- Laat desktop eventueel meerdere secties tegelijk tonen als dat scanbaar blijft.

Acceptatie:

- Op mobiel is steeds één primaire vraaggroep actief.
- Terug en vooruit verliest geen invoer.
- Onopgeloste noodzakelijke invoer blijft een berekening blokkeren.
- Formules, grensbedragen, brondata en validatiegedrag blijven ongewijzigd.

### RUX-011: “Draagkracht: Niet ingevuld” krijgt te veel resultaatnadruk

Prioriteit: **P2**

Gerelateerd eerder auditpunt: V1-063.

Locatie:

- `apps/duo-maandbedrag/Calculator.tsx`

Waarneming:

Na een geldige voorbeeldberekening verschijnt naast de wettelijke maandtermijn een even prominente resultaatkaart:

> Draagkracht: Niet ingevuld

De toelichting legt correct uit dat toetsingsinkomen nodig is, maar “Niet ingevuld” oogt als een onvolledig eindresultaat.

Aanpassing:

- Toon zonder inkomensopt-in geen volwaardige draagkracht-resultaatkaart.
- Gebruik een compacte vervolgvraag onder het wettelijke maandbedrag, bijvoorbeeld “Wil je ook zien of DUO op basis van inkomen een lager bedrag kan gebruiken?”

Acceptatie:

- Het wettelijke maandbedrag blijft het ondubbelzinnige hoofdantwoord.
- Draagkracht verschijnt pas als berekend resultaat na concrete inkomensinvoer.

### RUX-012: Leeg profiel opslaan geeft een tegenstrijdige succesmelding

Prioriteit: **P2**

Locatie:

- `src/app/profiel/page.tsx`
- `src/hooks/useUserProfile.ts`

Waarneming:

- Met alle velden leeg geeft “Profiel opslaan” de status “Tijdelijk profiel opgeslagen voor deze browsersessie.”
- Tegelijk blijven bovenaan “Laatst bijgewerkt: Nog niet opgeslagen” en “Nog geen opgeslagen profiel” staan.
- Op `/apps` blijft terecht de staat zonder profiel zichtbaar.

Aanpassing:

- Blokkeer leeg opslaan met een vriendelijke melding, of behandel het expliciet als “Er waren geen gegevens om op te slaan.”
- Verplaats focus niet naar een fout als leegte bewust toegestaan is; geef dan een gewone statusmelding.

Acceptatie:

- Statusmelding, laatst-bijgewerkttekst en profielstatus spreken elkaar nooit tegen.
- Er ontstaat geen “opgeslagen” melding zonder werkelijk profielgegeven.

### RUX-013: Meerdere zelfstandige aanraakdoelen zijn te laag

Prioriteit: **P2**

Locatie:

- losse `<summary>`-elementen in de kennisbank;
- inline begrippentriggers in `GlossaryText`;
- afzonderlijke bronlinks in bronkaarten;
- enkele niet-centrale tekstlinks.

Waarneming:

- Kennisbanksummaries “Lees uitleg, checklist en bronnen” waren circa 20,8 pixels hoog.
- Begrippentriggers waren veelal 21,8 tot 24,8 pixels hoog.
- Meerdere zelfstandige bronlinks waren circa 22 pixels hoog.
- Centrale buttons en `ToolDisclosure`-summaries halen wel minimaal 44 pixels.

Aanpassing:

- Geef zelfstandige summaries en kaartlinks minimaal 44 pixels hoogte.
- Maak bij bronkaarten de hele kaart of een duidelijke 44-pixelactie klikbaar.
- Vergroot inline begrippen zorgvuldig zonder de lopende tekst onrustig te maken; combineer dit met de mobiele uitleglaag uit RUX-003.

Acceptatie:

- Alle zelfstandige acties hebben minimaal 44 × 44 CSS-pixels.
- Inline links voldoen minimaal aan WCAG 2.2 target-sizevoorwaarden en hebben voldoende tussenruimte.

### RUX-014: Donkere componenten gebruiken niet overal dezelfde tekstkleur

Prioriteit: **P3**

Locatie:

- `src/components/ui.tsx`
- `src/components/ToolCard.tsx`
- overige losse donkere componentklassen

Waarneming:

- Primaire en blauwe CTA’s gebruiken centraal `--button-text-on-dark: #fffaf0`, een warme crèmekleur.
- Donkere pills en de hoverstatus van “Open tool” gebruiken nog `text-white`.

Aanpassing:

- Gebruik de centrale tekstkleurvariabele op alle donkere interactieve oppervlakken.
- Behoud voldoende contrast in normale, hover-, focus-, active- en visitedstaat.

Acceptatie:

- Geen donkere CTA, pill of interactieve kaartstatus valt terug op een afwijkende witte tekstkleur zonder bewuste uitzondering.

### RUX-015: Bronverantwoording is mobiel visueel te technisch

Prioriteit: **P3**

Locatie:

- `/variabelen`;
- detailkaarten voor DUO- en hypotheekaannames.

Waarneming:

De bronverantwoording is inhoudelijk sterk, maar lange kale URL’s, meerdere metadataregels en termen als “bron type” vragen relatief veel aandacht op 320 pixels.

Aanpassing:

- Toon een begrijpelijk bronlabel als link.
- Houd geldig jaar en controledatum zichtbaar.
- Plaats de volledige URL en aanvullende technische metadata in een verder detailniveau.

Acceptatie:

- De bron blijft controleerbaar en rechtstreeks bereikbaar.
- De hoofdweergave toont bronnaam, geldigheid en controledatum zonder lange URL-regel.

### RUX-016: Grafieken zijn op 320 pixels functioneel maar erg klein

Prioriteit: **P3**

Locatie:

- vooral extra aflossen;
- hypotheekresultaten met grafieken.

Waarneming:

De grafieken veroorzaken geen horizontale overflow en hebben numerieke resultaten als alternatief. Op 320 pixels worden plot, labels en legenda echter klein, zeker wanneer veel detailkaarten zijn geopend.

Aanpassing:

- Geef de grafiek mobiel een iets grotere minimale hoogte.
- Houd één compacte legenda onder de grafiek.
- Behoud altijd de numerieke samenvatting vóór de grafiek.

Acceptatie:

- Assen en legenda zijn zonder zoomen leesbaar.
- De grafiek is aanvullend; geen essentiële conclusie is alleen visueel beschikbaar.

## 5. Route-voor-route beoordeling

| Route | Beoordeling | Belangrijkste actie |
|---|---|---|
| Homepage | Goed | Alleen mobiele profielnavigatie oplossen |
| Alle tools | Onvoldoende | 404-CTA, afgekorte kaartcopy en tooltippositie herstellen |
| Kennisbank | Redelijk | Opsplitsen, tooltips begrenzen en standalone targets vergroten |
| Aannames | Goed/redelijk | Bronpresentatie mobiel vereenvoudigen |
| Over | Goed | Geen structurele aanpassing nodig |
| Profiel | Redelijk | Mobiele vindbaarheid, lege save en wissen herstellen |
| 404 | Goed | Geen structurele aanpassing nodig |
| Maximale hypotheek | Goed/redelijk | Verdieping groeperen; mobiele veldflow behouden |
| Aanvullende beurs | Onvoldoende | Overlap en oudergroepering eerst oplossen |
| Extra aflossen | Goed/redelijk | Grafiek mobiel iets ruimer; kernresultaat behouden |
| Impact leenbedrag | Onvoldoende op 320 px | Afkapping in geopende verdieping oplossen |
| DUO-maandbedrag | Redelijk | Lege draagkrachtkaart vervangen door optionele vervolgvraag |
| Starten met lenen | Goed | Geen responsieve blokkade gevonden |
| Stoppen met studeren | Goed | Geen responsieve blokkade gevonden |
| Hypotheekimpact | Redelijk | 24 verdiepingsblokken groeperen |
| Schulden vergelijken | Goed/redelijk | Tooltippositie en targets herstellen |
| Toeslagenscan | Redelijk | Mobiel echte stapsgewijze flow maken |

## 6. Wat aantoonbaar goed werkt

- Alle hoofdrouteweergaven konden worden geladen.
- Buiten de twee beschreven layoutfouten zijn geen form-controloverlaps gevonden.
- Geen dubbele HTML-`id`-waarden gevonden.
- Geen zichtbare labels zonder gekoppeld veld gevonden.
- De mobiele maximale-hypotheekflow doorliep zeven veldstappen zonder overlap.
- De mobiele hypotheekimpactflow doorliep vijftien veldstappen zonder overlap.
- Beide hypotheekflows werkten op 320, 390 en 430 pixels en liggend formaat.
- Profielvelden overlappen niet op de geteste breedtes.
- Profielvalidatie markeert het veld en focust de foutsummary.
- Invoer blijft staan tijdens normale stapnavigatie.
- De homepage heeft een duidelijke hoofdactie en blijft rustig.
- De 404-pagina biedt één hoofdactie en een rustige terugweg.
- De primaire CTA’s gebruiken de gevraagde warme crèmekleur op donkere achtergronden.
- Verwachte eindschuld en totaal terug te betalen inclusief rente staan in de relevante DUO-resultaten duidelijk bij elkaar.
- Noodzakelijke waarschuwingen, bronverwijzingen en resultaatduiding zijn niet verdwenen.

## 7. Aanbevolen uitvoeringsvolgorde

### Ronde 1: Soliditeit en kapotte paden

1. RUX-001: verwijder de publieke hidden-route-CTA.
2. RUX-002: herstel aanvullende-beurslayout en groepeer per ouder.
3. RUX-003: maak mobiele tooltips viewportveilig.
4. RUX-004: herstel 320-pixeloverflow in de leenbedragverdieping.
5. Voeg de regressietests uit hoofdstuk 8 toe.

### Ronde 2: Navigatie en taakduidelijkheid

1. RUX-005: herontwerp mobiele profielnavigatie.
2. RUX-006: maak alle toolkaarttaakzinnen volledig leesbaar.
3. RUX-007 en RUX-012: maak profielacties voorspelbaar en veilig.
4. RUX-011: maak de optionele draagkrachtverdieping duidelijker.

### Ronde 3: Informatiearchitectuur

1. RUX-008: splits de kennisbank in een korte index en onderwerpverdieping.
2. RUX-009: groepeer hypotheekdetails.
3. RUX-010: maak van de toeslagenscan op mobiel een echte stapflow.
4. RUX-013 tot en met RUX-016: verbeter targets, bronpresentatie, kleurconsistentie en grafieken.

## 8. Vereiste automatische regressietests

### 8.1 Universele responsive invariant

Voor iedere publieke route en de breedtes 320, 360, 390, 430, 640, 768, 820, 900, 901, 1024, 1180, 1280, 1440 en 1920:

- `document.documentElement.scrollWidth <= clientWidth`;
- `document.body.scrollWidth <= clientWidth`;
- geen twee zichtbare form controls hebben een overlappende rechthoek;
- geen zichtbaar veld, label, knop of heading valt buiten de viewport;
- geen dubbele `id`;
- ieder zichtbaar `label[for]` heeft een bestaand doel.

### 8.2 Aanvullende beurs

Test minimaal:

- één ouder;
- twee ouders;
- alle bijzondere oudersituaties;
- broer-/zusdisclosure dicht en open;
- lege optionele velden;
- ingevulde optionele velden;
- foutmeldingen;
- resize heen en terug zonder herladen;
- screenshots op 1024, 1180 en 1280 pixels.

### 8.3 Begrippentooltips

Focus iedere publieke begrippentrigger op 320 pixels en controleer:

- tooltip links ≥ 0;
- tooltip rechts ≤ viewportbreedte;
- Escape sluit;
- focus keert terug;
- tekst is niet afgeknipt.

### 8.4 Interne links

Crawl alle zichtbare interne links uit iedere publieke staat:

- geen 4xx of 5xx;
- geen href naar hidden/draft slugs;
- ieder hashanker bestaat;
- vervolg-CTA’s komen uit op een publieke tool of bestaande pagina.

### 8.5 Mobiele navigatie

- ieder primair item is op 320 pixels volledig zichtbaar of bereikbaar via een expliciete menuknop;
- actieve route heeft `aria-current`;
- actieve route is direct in beeld;
- geen horizontale body-overflow.

### 8.6 Profiel

- leeg opslaan geeft geen onjuiste succesmelding;
- wissen zonder profiel is disabled of verborgen;
- wissen met profiel vraagt bevestiging of biedt undo;
- validatiefocus komt niet onder de sticky header terecht;
- alle drie stappen behouden hun waarden bij heen-en-weer navigeren.

## 9. Niet wijzigen binnen deze verbeteringsronde

Deze audit adviseert geen wijzigingen aan:

- rekenformules;
- brondata;
- grensbedragen;
- centrale financiële engines;
- noodzakelijke formuliervelden;
- validatieregels;
- foutfocus als mechanisme;
- inhoudelijke waarschuwingen;
- toolkoppelingen tussen publieke tools;
- PDF-berekeningen;
- enable/disable-logica buiten het gebroken publieke pad;
- Familiehulp-status;
- v2-pausering;
- categorie-E-onderdelen uit `v1-simplification-audit.md`.

Met name behouden blijven:

- noodzakelijke fout- en herstelacties;
- itemisering van prestatiebeursdelen;
- waarschuwing over verplichte betalingen bij schuldvolgorde;
- officiële controle- en aanvraagactie na eigen uitleg;
- noodzakelijke bron- en betrouwbaarheidswaarschuwingen.

## 10. Controle-uitkomsten

| Controle | Uitkomst |
|---|---|
| 210 route-/viewport- en resizechecks | Uitgevoerd |
| 36 profielstapchecks | Uitgevoerd |
| 8 volledige mobiele hypotheekreizen | Uitgevoerd |
| 17 begrippentooltips op 320 px | Uitgevoerd; 11 buiten beeld |
| 17 unieke interne routes | Uitgevoerd; 1 publieke 404-link |
| 84 screenshots | Visueel beoordeeld |
| Dubbele ids | Geen gevonden |
| Labels zonder veld | Geen gevonden |
| Control-overlap buiten aanvullende beurs | Geen gevonden |
| Horizontale overflow buiten RUX-004 | Geen blijvende productoverflow gevonden |
| Bestaande UX-tests | Groen: 52 geslaagd, 20 bewust overgeslagen |
| Productiebuild | Groen: 18 statische pagina’s gegenereerd |
| Productie-smoke | Alle zestien bedoelde publieke 200-routes groen; onbekende route correct 404 |
| Hidden-routecontrole | `/apps/volgende-euro` correct niet gepubliceerd, maar ten onrechte publiek gelinkt |

## 11. Eindoordeel

De basis is goed genoeg om gericht te verstevigen; een breed redesign is niet nodig. De site kan voor bezoekers met weinig financiële kennis goed werken als de invoervelden visueel betrouwbaar blijven, elke uitleg volledig binnen beeld staat en iedere CTA naar een werkende publieke bestemming leidt.

De eerstvolgende implementatieronde moet daarom klein maar streng zijn: kapotte route verwijderen, aanvullende-beursgrid repareren, tooltips begrenzen, 320-pixeloverflow oplossen en deze gevallen als automatische responsive invarianten vastleggen. Daarna kan de informatiedichtheid worden verminderd zonder inhoudelijke uitleg of financiële zekerheid op te offeren.
