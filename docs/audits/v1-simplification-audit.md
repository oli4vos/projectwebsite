# Vereenvoudigingsaudit Project Site v1

Datum: 26 juli 2026

Scope: uitsluitend de publieke v1-site op commit `b79ba1128127056733b5b12788f339ba4e6fff21`

Status: analyse en beslisvoorstel; geen productcode, styling, routes, copy, rekenlogica, brondata of tests gewijzigd

## 1. Managementsamenvatting

### Algemene indruk

De basis is inhoudelijk sterk: de site heeft een rustige kleurstelling, duidelijke hoofdresultaten, goede toetsenbord- en mobiele veldbediening, centrale rekenlogica, zichtbare validatie en betrouwbare bronverwijzingen. De grootste drukte komt niet door kleur of animatie, maar door stapeling van tekst, kaarten, metadata en navigatiekeuzes.

De publieke site probeert tegelijk:

- een route van studieschuld naar wonen uit te leggen;
- alle tien tools te presenteren;
- per tool de volledige methodiek en manifestcontext te tonen;
- een uitgebreide kennis- en broncatalogus te zijn;
- gebruikers meteen naar twee of drie volgende tools te sturen.

Daardoor concurreert uitleg geregeld met de eerstvolgende actie. Op de homepage worden tools via het stappenplan, een doelgroepfilter, aanbevolen startpunten en groepskaarten aangeboden. Op toolpagina's komen titel, samenvatting en onderwerpstags vóór een calculator die dezelfde titel en introductie herhaalt. Na een berekening volgen vaak een hoofdresultaat, meerdere resultaatkaarten, een volgende-stapkaart, methodiek, aannames, disclaimer, toolcontext en footerlinks.

### Grootste bronnen van drukte

1. Herhaling tussen paginakop en calculatorintro op alle tien toolroutes.
2. Publieke manifestmetadata: tags, status, type, versie, domeinen en resultaatvorm.
3. Vier parallelle manieren om op homepage en dashboard een tool te kiezen.
4. De kennisbank: 56 koppen, 187 links en circa 22.513 px mobiele paginalengte in de browsermeting.
5. Resultaatpagina's met veel gelijkwaardige kaarten in plaats van één hoofdantwoord met verdiepingslagen.
6. Interne taal zoals “registry”, “centrale engine”, “vraagflow”, datasetversies en “engine-meldingen vertaald”.
7. Een vaste volgende-stapkaart met maximaal drie CTA's vóór de gebruiker alle resultaatdetails heeft geïnterpreteerd.
8. Herhaalde disclaimers en bronuitleg in calculator, toolcontext, footer, kennisbank en de pagina Over.

### Belangrijkste vereenvoudigingskansen

- Maak per tool één paginakop en één korte taakintro; laat daarna direct de invoer beginnen.
- Verwijder tags, onverklaarde beta-labels en de volledige manifestgerichte “Toolcontext en aannames”.
- Kies op de homepage één primaire route en één compacte volledige lijst.
- Beperk resultaatweergaven tot hoofdantwoord, doorslaggevende reden en eerstvolgende actie; klap berekening, bronnen en uitzonderingen in.
- Bouw de kennisbank om tot een korte inhoudsroute met afzonderlijke onderwerpen of disclosures en één centraal bronregister.
- Toon per resultaat standaard één volgende stap; plaats overige routes achter “Andere vervolgstappen”.
- Vervang interne architectuurtaal door concrete gebruikerstekst.

### Wat juist behouden moet blijven

- Alle invoer die nodig is voor een correcte centrale berekening.
- Inline validatie, foutoverzichten, `aria-invalid`, focusherstel en mobiele veldstappen.
- Het kernresultaat met de doorslaggevende regel en de belangrijkste onzekerheid.
- Waarschuwingen die schijnzekerheid of een financieel onveilige interpretatie voorkomen.
- Bronnen als voetnoot of ingeklapte onderbouwing.
- Terugnavigatie, skiplink, herstelacties op foutpagina's en privacyuitleg.
- De itemisering van prestatiebeursdelen in de stoptool.
- De melding dat verplichte maandbedragen altijd betaald moeten worden in de schuldvolgordetool.

## 2. Onderzoeksopzet en bewijs

### Beoordeelde publieke oppervlakken

Er zijn 16 publieke routes daadwerkelijk in Chromium doorlopen:

1. `/`
2. `/apps`
3. `/kennisbank`
4. `/variabelen`
5. `/over`
6. een niet-bestaande route voor de 404-staat
7. `/apps/artifact-hypotheek-wonen-maximale-hypotheek`
8. `/apps/duo-aanvullende-beurs`
9. `/apps/duo-extra-aflossen`
10. `/apps/duo-leenbedrag-impact`
11. `/apps/duo-maandbedrag`
12. `/apps/duo-schuld-bij-starten-lenen`
13. `/apps/duo-stoppen-kosten-prestatiebeurs`
14. `/apps/hypotheek-impact-studieschuld`
15. `/apps/schulden-volgorde`
16. `/apps/toeslagen-scan`

Daarnaast zijn `src/app/error.tsx` en `src/app/global-error.tsx` via code-inspectie beoordeeld. `/profiel` is niet als publiek oppervlak meegeteld, omdat `NEXT_PUBLIC_ENABLE_PROFILE` volgens `FUNCTIONALITY_STATUS.md` standaard uit staat. De gepauzeerde v2-code onder `src/app/_v2-paused` is alleen gecontroleerd op publieke verwijzingen; er zijn geen publieke v2-links gevonden.

### Browser- en scenario-inspectie

- Desktop: 1440 × 1000.
- Mobiel: 390 × 844.
- Per tool: initiële staat, voorbeeldscenario, berekend resultaat, lege invoer en negatieve invoer.
- Aanvullend: twaalfcijferige bedragen, lange statische labels, mobiele veldstappen en horizontale overflow.
- Grensgedrag: leeftijd boven 120, negatieve bedragen, nul/lege bedragen en beschikbare rente-/jaarselecties.
- PDF: zeven beschikbare downloads zijn daadwerkelijk gestart.
- Interne linkcrawl: alle zichtbare interne links op algemene pagina's en berekende toolresultaten gaven HTTP 200.

Er trad bij geen van de 32 desktop- en mobiele routecaptures horizontale pagina-overflow op. Meerdere geldvelden accepteren wel een twaalfcijferig bedrag zonder directe bovengrensmelding; dat is een product- en validatiebesluit, geen kandidaat om informatie zonder onderzoek te verwijderen.

### PDF-controle

Succesvol gedownload:

- Maximale hypotheek.
- Wat doet extra aflossen?
- Impact van mijn leenbedrag.
- Wat wordt mijn DUO-maandbedrag?
- Wat wordt mijn studieschuld?
- Wat kost stoppen met studeren?
- Hypotheek-impact studieschuld.

Niet aangeboden, conform de huidige implementatie:

- Aanvullende beurs berekenen.
- Welke schuld eerst?
- Welke toeslagen passen mogelijk bij mij?

De twee leenfase-tools gebruiken bij download de bestandsnaam `studeren-stoppen-duo-202607.pdf`, ook wanneer het rapport niet over stoppen gaat. Dit is als legacy-copy opgenomen.

### Belangrijkste bewijsplaatsen

- Homepage en stappenplan: `src/app/page.tsx:7`.
- Dashboard, doelgroepfilters en groepskaarten: `src/components/AppDashboard.tsx:30`.
- Toolkaartmetadata: `src/components/AppCard.tsx:5` en `src/components/ToolCard.tsx:35`.
- Toolpaginakop, tags en contextmetadata: `src/app/apps/[slug]/page.tsx:80`.
- Gedeelde calculatorindeling: `src/components/tool/CalculatorShell.tsx:14`.
- Volgende-stapkaart: `src/components/tool/ToolNextSteps.tsx:15`.
- Journeyconfiguratie: `src/lib/tool-journeys.ts:15`.
- Kennisbank: `src/app/kennisbank/page.tsx:37`.
- Aannamespagina: `src/app/variabelen/page.tsx:135`.
- Header en mobiele navigatie: `src/components/SiteHeader.tsx:8`.
- Footer: `src/components/SiteFooter.tsx:5`.
- 404 en foutgrenzen: `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`.
- Browsercaptures en meetdata tijdens de audit: `/tmp/project-v1-simplification-audit/` (tijdelijk, bewust niet gecommit).

## 3. Toplijst: wat kan waarschijnlijk weg of eenvoudiger?

| Rang | Pagina/tool | Exact onderdeel | Categorie | Reden | Gebruikersimpact | Risico | Concreet voorstel |
|---:|---|---|:---:|---|---|---|---|
| 1 | Alle toolroutes | Tags onder de paginatitel | A | Herhalen onderwerp en categorie, maar helpen niet bij invoer of uitkomst | Hoog | Laag | Verwijder de tagrij |
| 2 | Alle toolroutes | “Toolcontext en aannames” met status, type, versie, domeinen en resultaatvorm | A | Manifestmetadata is interne producttaal | Hoog | Laag | Verwijder uit publieke UI; behoud intern |
| 3 | Alle toolroutes | H1 plus vrijwel gelijke calculator-H2 en intro | B | Twee introducties vertragen de eerste invoer | Hoog | Laag | Maak één titel, één zin en start daarna het formulier |
| 4 | Homepage | Kaart “Waarom dit rustig blijft” met 10/DUO/PDF | A | Zelfbeschrijving zonder taakwaarde | Middel | Laag | Verwijder de hele trust-strip |
| 5 | Homepage/dashboard | Stappenplan, doelgroepfilter, startpuntkaarten en groepskaarten naast elkaar | B | Vier keuzemodellen voor dezelfde tien tools | Hoog | Middel | Behoud één primaire route en één volledige lijst |
| 6 | Toolkaarten | “Direct in browser”, Beta/Actief, dubbel categorielabel en “Openen” | A | Metadata verdringt titel en beschrijving | Hoog | Laag | Behoud titel, één zin en één klikoppervlak |
| 7 | Kennisbank | Drie broncatalogi plus bronnen per onderwerp | B | Dezelfde bronnen verschijnen meerdere keren | Hoog | Laag | Eén centraal bronregister; per onderwerp alleen voetnoten |
| 8 | Alle tools | Interne woorden “centrale engine”, “vraagflow”, “rekenlaag” en datasetversies | D | Bezoeker hoeft architectuur niet te begrijpen | Hoog | Laag | Herschrijf naar de concrete regel en betekenis |
| 9 | Aanvullende beurs | “Engine-meldingen vertaald” | A | Pure interne debug-/architectuurframing | Hoog | Laag | Verwijder; verwerk alleen relevante reden in gewone taal |
| 10 | Toeslagenscan | 41/41, rechtstreeks ingevuld, afgeleid, niet gevraagd en niet van toepassing | A/C | Interne vraagflowstatus concurreert met invullen | Hoog | Laag | Toon alleen “Nog X vragen” en verberg technische lijsten |
| 11 | Hypotheek-impact | Kernbedragen in kop, alinea, lijst en slotzin | B | Dezelfde uitkomst wordt drie keer verteld | Hoog | Laag | Eén kernbedrag, één gevolg en één toelichting |
| 12 | Header | Vaste CTA “Begin bij stap 1” op iedere pagina | A | Dupliceert navigatie en leidt op tools weg van de taak | Middel | Laag | Alleen op homepage gebruiken |
| 13 | Footer | Volledige herhaling van headerlinks plus “Direct naar DUO-maandbedrag” | B | Voegt na iedere lange pagina opnieuw keuzes toe | Middel | Laag | Beperk tot Over, bronnen/privacy en één terugroute |
| 14 | Dashboard | Defaultfilter “Start bij DUO” op pagina “Alle tools” | F | Verbergt de toeslagenscan en maakt de titel feitelijk onjuist | Hoog | Middel | Eigenaar kiest: standaard alles tonen of pagina hernoemen |
| 15 | Kennisbank | “Kader”-badges en “Centrale bronlaag” | A | Decoratieve en interne labels | Middel | Laag | Verwijder badges |
| 16 | Maximale hypotheek | Acht gelijkwaardige resultaatkaarten | B | Hoofdantwoord en detail hebben dezelfde visuele zwaarte | Hoog | Middel | Hoofdmaximum bovenaan; impact, tekort en maandlast als compacte verdieping |
| 17 | Schuldvolgorde | Zes schuldsoorten standaard volledig zichtbaar | C | Veel lege velden en kaarten vóór de berekening | Hoog | Middel | Laat relevante schuldsoorten kiezen en toon alleen die velden |
| 18 | Toeslagenscan | Vier volledige resultaatkaarten met technische subwaarden en bronknoppen | B | Resultaat wordt een rapport in plaats van antwoord | Hoog | Middel | Totaal en status eerst; per toeslag één ingeklapte detailsectie |
| 19 | Hypotheek-impact | “Pech gehad met het leenstelsel? Deze tool helpt je niet klagen, maar rekenen.” | A | Onnodig scherp en niet taakgericht | Middel | Laag | Verwijder |
| 20 | 404 | Tweede CTA plus donker blok “Handige routes” | B | Herhaalt dashboard en DUO-route direct onder dezelfde CTA's | Middel | Laag | Eén uitleg, één dashboard-CTA, één tekstlink |
| 21 | Aannames | Acht samenvattingskaarten die in disclosures terugkomen | B | Dubbele informatie op één pagina | Middel | Laag | Behoud alleen een korte DUO-/hypotheeksamenvatting |
| 22 | Alle tools | Maximaal drie volgende-tool-CTA's direct na het resultaat | C | Stuurt weg voordat uitleg is verwerkt | Middel | Laag | Eén primaire CTA; overige routes ingeklapt |
| 23 | DUO-maandbedrag | Kaart “Draagkracht — Niet ingevuld” | C | Toont een leeg secundair resultaat zonder actie door de gebruiker | Middel | Laag | Toon pas na keuze voor draagkracht |
| 24 | Maximale hypotheek | PDF-knop vóór een geldige berekening | C | Disabled actie vraagt aandacht zonder bruikbaar te zijn | Laag | Laag | Toon na eerste geldige uitkomst |
| 25 | Alle toolroutes | Breadcrumb “Rekentools / categorie” naast teruglink en header | A | Drie oriëntatielagen vlak boven elkaar | Middel | Laag | Behoud teruglink; verwijder breadcrumb |

## 4. Audit per algemeen siteonderdeel

### Homepage

Doel: een starter direct naar de passende eerste studieschuldvraag brengen.

Bevindingen:

- De hero is duidelijk en moet blijven.
- “Waarom dit rustig blijft” vertelt hoe het product gebouwd is, maar helpt niet kiezen (`src/app/page.tsx:76`).
- Het stappenplan is bruikbaar, maar dezelfde tools komen daarna terug in `AppDashboard`.
- De dashboardlaag bevat doelgroepknoppen, een vraagkaart, aanbevolen startpunten en daarna toolgroepen (`src/components/AppDashboard.tsx:119`).
- “Controleer aannames” onderaan dupliceert de hoofdnav en footer.

Advies: behoud hero plus drie stappen en voeg daaronder één compacte lijst “Alle tools” toe. Verwijder trust-strip, researchsignalen, dubbele startpuntkaarten en de losse aannames-CTA.

### Header, hoofdnavigatie en mobiele navigatie

Doel: permanente oriëntatie.

Bevindingen:

- De desktopnavigatie bevat vijf items plus een vaste CTA die op toolpagina's concurreert met de calculator.
- Op mobiel worden “Stappenplan”, “Alle tools” en “Kennisbank” afgekort tot “Stappen”, “Tools” en “Kennis” (`src/components/SiteHeader.tsx:8`).
- De mobiele rij blijft zonder overflow bruikbaar, maar vijf items nemen veel verticale en horizontale aandacht.

Advies: behoud logo, Alle tools en Kennisbank. Toon “Begin bij stap 1” alleen op de homepage. Onderzoek of Aannames en Over in een compacte secundaire navigatie of footer passen. Schrijf “Kennisbank” voluit.

### Dashboard en tooloverzicht

Doel: alle actieve tools vindbaar maken.

Bevindingen:

- De route `/apps` heet “Alle tools”, maar start met filter `starter-studieschuld`; “Regelingen en maandruimte” en de toeslagenscan zijn dan verborgen.
- `hypotheek-impact-studieschuld` verschijnt zowel in Studieschuld als Wonen.
- Kaarten tonen categoriepunt, categoriebadge, “Direct in browser”, status en “Openen” naast titel en beschrijving.
- De zichtbare filterset heeft slechts drie opties voor tien tools. Sitebrede zoekfunctie ontbreekt, maar is bij deze omvang niet noodzakelijk.
- Copy op `/apps` noemt “registry”, “concepten” en “hidden tools” (`src/app/apps/page.tsx:23`).

Advies: maak `/apps` werkelijk volledig en laat filteren pas terugkomen als de lijst groter wordt. Gebruik op kaarten alleen titel, korte taakzin en eventueel één categorie.

### Kennisbank

Doel: regels zelf uitleggen en bronnen als onderbouwing aanbieden.

Bevindingen:

- De inhoudelijke onderwerpen zijn relevant en geven zelf antwoord.
- Alle onderwerpkaarten tonen tegelijk samenvatting, relevantie, checklist, fouten, tools en bronnen.
- Daarna volgen “De drie fases”, een volledige broncatalogus, bronnen per kennisdocument en bronhiërarchie.
- Dezelfde bron kan in vier visuele vormen op dezelfde pagina terugkomen.
- “Voor toekomstige artikelen” en “Centrale bronlaag” zijn interne producttaal (`src/app/kennisbank/page.tsx:248`).
- De mobiele browsercapture was circa 22.513 px lang.

Advies: begin met een compacte inhoudsopgave en korte onderwerpintro's. Open één onderwerp tegelijk of gebruik afzonderlijke kennisroutes. Behoud inhoudelijke uitleg en bronvoetnoten; verplaats bronmetadata naar één ingeklapt bronregister. Voeg nu geen complexe zoekfunctie toe voordat deze structuur is vereenvoudigd.

### Journeys en doelgroepteksten

Doel: een logische volgende vraag aanbieden.

Bevindingen:

- De centrale journey-map voorkomt losse routecopy en filtert links naar disabled tools correct (`src/lib/tool-journeys.ts:226`).
- Vrijwel ieder resultaat toont één primaire en maximaal twee secundaire CTA's.
- De formuleringen “De volgende vraag is meestal” worden vaak herhaald.
- `schulden-volgorde` en `toeslagen-scan` vragen een expliciet scopebesluit door de studieschuld-only launchpositionering.

Advies: behoud de centrale mapping en één contextuele hoofdactie. Klap alternatieven in. Laat Olivier beslissen welke niet-studieschuldroute bij v1 hoort.

### Aannames

Doel: controleerbaar maken welke normen de tools gebruiken.

Bevindingen:

- De samenvattingskaarten herhalen waarden uit de disclosures.
- Box 1, Box 3 en “Grafieken en presentatie” zijn niet zichtbaar verbonden aan de huidige studieschuldscope.
- “Bron/aannameset”, bronniveau en status zijn beheertermen.
- De disclosures zelf zijn een goed progressive-disclosurepatroon.

Advies: behoud DUO en hypotheek met bron, geldigheidsjaar en controledatum. Laat Olivier beslissen of Box 1, Box 3 en grafiekdefaults publiek nodig zijn. Vertaal metadata naar “Bron”, “Geldig voor” en “Laatst gecontroleerd”.

### Over

Doel: onafhankelijkheid, privacy en werkwijze uitleggen.

Bevindingen:

- Privacy en onafhankelijkheid zijn relevant.
- “Geen advies” staat in intro, sectie Onafhankelijk en slotkaart Belangrijk.
- Bron- en bijwerkcopy overlapt de aannamespagina.
- “GitHub issues” is ontwikkelaarstaal voor veel bezoekers.

Advies: één korte onafhankelijkheidsparagraaf, één privacyparagraaf, één bronlink en een gewone link “Meld een fout”.

### Footer

Doel: secundaire navigatie en vertrouwen.

Bevindingen:

- De footer herhaalt Alle tools, Kennisbank, Aannames en Over uit de header.
- “Direct naar DUO-maandbedrag” staat op iedere pagina, ook na een andere afgeronde taak.
- De regel “Geen advies” herhaalt disclaimers.

Advies: beperk de footer tot Over, bronnen/aannames, privacy- of foutmeldroute en een teruglink naar het tooloverzicht.

### Foutpagina's en 404

Doel: eenvoudig herstel.

Bevindingen:

- De herstelacties werken en moeten blijven.
- De 404-kop “Deze route geeft nu geen grip” is merktaal waar “Pagina niet gevonden” directer is.
- De 404 toont twee CTA's én een donker blok met drie herhaalde routes.
- `error.tsx` en `global-error.tsx` dupliceren vrijwel dezelfde uitleg.
- “Cmd+Shift+R” is platformgebonden en “oude bestanden van een vorige versie” is een technische diagnose.

Advies: één directe foutboodschap, één primaire herstelactie en één teruglink. Deel de foutcopy technisch waar mogelijk, zonder de noodzakelijke aparte Next.js-grenzen te breken.

### Metadata en paginatitels

Doel: heldere browser- en zoekresultaatcontext.

Bevindingen:

- De metadata van `/apps` zegt nog “toeslagenscan zonder bedragberekening”, terwijl bedragen actief zijn (`src/app/apps/page.tsx:7`).
- De groepsomschrijving van “Regelingen en maandruimte” zegt “zonder bedrag- of rechtclaim”, eveneens verouderd (`src/lib/tool-groups.ts:40`).
- `/variabelen` valt terug op de generieke titel “Financiële rekentools”.
- Tooltitels eindigen op “Project Site”, terwijl andere pagina's “Financiële rekentools” gebruiken.

Advies: corrigeer verouderde beschrijvingen en kies één consistente sitenaam. Dit is copy/SEO en verandert geen functionaliteit.

### Mobiele ervaring

Doel: invoer en resultaat zonder horizontale frictie.

Bevindingen:

- Geen horizontale overflow gevonden op 390 px breedte.
- De mobiele veldstappen bij de twee hypotheektools en eenvoudige DUO-tools zijn waardevol.
- Lange pagina's worden vooral veroorzaakt door opeenvolgende kaarten, niet door slechte wrapping.
- De kennisbank (circa 22.513 px), toeslagenscan met resultaat (circa 11.828 px) en lange footer maken scrollbelasting groot.
- De sticky header kan bij lange formulieren visueel midden in een full-page capture verschijnen; in interactie blijft de oriëntatie nuttig.

Advies: behoud veldstappen en sticky oriëntatie, maar verminder kaartstapeling, footerhoogte en standaard zichtbare details.

## 5. Audit per publieke tool

### 5.1 Maximale hypotheek

Route: `/apps/artifact-hypotheek-wonen-maximale-hypotheek`

Bewijs: `apps/artifact-hypotheek-wonen-maximale-hypotheek/Calculator.tsx`

- Direct weg: tags, breadcrumb, statusmetadata en disabled PDF-knop vóór een uitkomst.
- Samenvoegen: H1 en H2 “Maximale hypotheek”; acht resultaatkaarten tot één hoofdresultaat met drie kernregels.
- Inklappen/later: energielabel, verduurzamingskosten, verbouwing, toetsrente en uitgebreide berekening pas tonen als ze relevant zijn.
- Korter: “Een indicatieve tool voor starters zonder bestaande hypotheek...” naar één taakzin.
- Behouden: inkomen, rente, looptijd, koopprijs/woningwaarde, eigen geld, schulden, NHG, validatie en limiterende norm.
- Grootste quick win: verwijder de dubbele intro en maak van de zwarte resultaatsectie één bedrag plus “waardoor begrensd”.

### 5.2 Aanvullende beurs berekenen

Route: `/apps/duo-aanvullende-beurs`

Bewijs: `apps/duo-aanvullende-beurs/Calculator.tsx:159`

- Direct weg: “Engine-meldingen vertaald”, publieke tags en manifestcontext.
- Samenvoegen: de twee knoppen “Wis invoer” tot één resetactie.
- Inklappen/later: aftrekposten, waarschuwingen en bronnen blijven beschikbaar, maar niet allemaal standaard na het resultaat.
- Korter: “centrale DUO-rekenlaag”, “concrete gegevens” en “Officiële controle: Nee” vertalen naar gewone taal.
- Behouden: concrete ouderinkomens, peiljaar 2024, opleiding, woonsituatie, bijzondere oudersituatie en blokkade op unresolved unknown.
- Grootste quick win: verwijder het blok “Engine-meldingen vertaald” en zet de beurs per maand als eerste antwoord.

### 5.3 Wat doet extra aflossen?

Route: `/apps/duo-extra-aflossen`

Bewijs: `apps/duo-extra-aflossen/Calculator.tsx`

- Direct weg: tags, breadcrumb en manifestcontext.
- Samenvoegen: dubbele titel en dubbele uitleg over wettelijk versus vrijwillig maandbedrag.
- Inklappen/later: afloscurve, volledige aannames en leningdelen alleen na gerichte opening.
- Korter: “Oude einddatum: Onzeker” vervangen door een concrete uitleg waarom geen datum kan worden gegeven.
- Behouden: openstaande schuld, regeling, rentejaar, extra bedrag, strategie, rentebesparing en waarschuwing over herberekening door DUO.
- Grootste quick win: toon “rentebesparing” en “maanden eerder klaar” samen; zet curve en aannames eronder ingeklapt.

### 5.4 Impact van mijn leenbedrag

Route: `/apps/duo-leenbedrag-impact`

Bewijs: `apps/_duo_simple/FocusedDuoTool.tsx` met modus `monthly-impact`

- Direct weg: tags en manifestcontext.
- Samenvoegen: de PDF-knop komt zowel boven als onder het resultaat voor.
- Inklappen/later: huidige schuld, collegegeldkrediet en rentejaar blijven in “Verder specificeren”.
- Korter: resultaatlabels als “Altijd terug te betalen”, “Eindschuld bij start terugbetaling” en “Verschil eindschuld totaal” groeperen tot schuld nu, extra schuld en verwacht totaal.
- Behouden: maandbedragslider, studieduur, huidige DUO-onderdelen, rentejaar en berekende eindschuld.
- Grootste quick win: één PDF-knop na de uitkomst; corrigeer de legacy-bestandsnaam `studeren-stoppen-duo-202607.pdf`.

### 5.5 Wat wordt mijn DUO-maandbedrag?

Route: `/apps/duo-maandbedrag`

Bewijs: `apps/duo-maandbedrag/Calculator.tsx`

- Direct weg: tags, breadcrumb en manifestcontext.
- Samenvoegen: de dubbele H1/H2 en herhaalde uitleg dat het wettelijke bedrag de basis is.
- Inklappen/later: berekeningstabel en aannames na het hoofdantwoord; leningdelen alleen op verzoek.
- Korter: draagkrachtuitleg in één duidelijke keuzezin.
- Behouden: schuld, terugbetalingsregel, rentejaar, optioneel toetsingsinkomen, wettelijke maandtermijn en verschil met draagkracht.
- Grootste quick win: toon de kaart “Draagkracht — Niet ingevuld” pas nadat de gebruiker expliciet draagkracht wil berekenen.

### 5.6 Wat wordt mijn studieschuld?

Route: `/apps/duo-schuld-bij-starten-lenen`

Bewijs: `apps/_duo_simple/FocusedDuoTool.tsx` met modus `start-loan`

- Direct weg: tags en manifestcontext.
- Samenvoegen: paginatitel en calculatorintro.
- Inklappen/later: beurs- en reisproductvelden pas tonen na keuze dat deze prestatiebeursdelen relevant zijn.
- Korter: “Vul alleen deze vraag in” is onjuist naast acht beschikbare velden; maak duidelijk wat minimuminvoer en verdieping is.
- Behouden: berekeningsmaand, studieduur, lening, collegegeldkrediet, prestatiebeursdelen en rentejaar.
- Grootste quick win: verander de eerste instructie in “Begin met leenbedrag en studieduur” en corrigeer de legacy-PDF-bestandsnaam.

### 5.7 Wat kost stoppen met studeren?

Route: `/apps/duo-stoppen-kosten-prestatiebeurs`

Bewijs: `apps/_duo_simple/FocusedDuoTool.tsx` met modus `stop-cost`

- Direct weg: tags en manifestcontext.
- Samenvoegen: totaal betalen, eindschuld bij start terugbetaling en totale schuld bij stoppen hebben zonder hiërarchie te veel gewicht.
- Inklappen/later: renteprojectie en uitgebreide totaaldetails onder het directe antwoord “prestatiebeurs die schuld blijft”.
- Korter: de volgende-stapkop “Van maandbedrag naar woningruimte” past niet bij een stopkostenresultaat.
- Behouden: afzonderlijke basisbeurs, aanvullende beurs en reisproduct; deze itemisering voorkomt een fout totaalbeeld.
- Grootste quick win: zet € 5.200 als hoofdantwoord met de drie onderdelen direct eronder en corrigeer titel en PDF-bestandsnaam.

### 5.8 Hypotheek-impact studieschuld

Route: `/apps/hypotheek-impact-studieschuld`

Bewijs: `apps/hypotheek-impact-studieschuld/Calculator.tsx`

- Direct weg: de zin “Deze tool helpt je niet klagen, maar rekenen”, tags, breadcrumb, historische uitleg “Waarom geen snelle vuistregel meer?” en dubbele controledatum.
- Samenvoegen: intro plus “Wat heb je nodig?”; kernbedragen die in kop, alinea, lijst en slotzin terugkomen.
- Inklappen/later: woningdoel, maximale hypotheek zonder studieschuld en de zeer diepe methodiek pas na de primaire DUO-/hypotheekimpact.
- Korter: annuïtaire DUO-last, brutering, primaire netto last en keuzezone in gewone taal uitleggen.
- Behouden: DUO-situatie, terugbetalingsregel, maandbedragen, resterende schuld, rente, looptijd, inkomen, waarschuwingen en eerlijk-opgevenboodschap.
- Grootste quick win: één resultaatzin “Je studieschuld verlaagt je leencapaciteit indicatief met € X”, gevolgd door één ingeklapte uitleg.

### 5.9 Welke schuld eerst?

Route: `/apps/schulden-volgorde`

Bewijs: `apps/schulden-volgorde/Calculator.tsx`

- Direct weg: tags, breadcrumb en manifestcontext.
- Samenvoegen: drie volgende-tool-CTA's tot één relevante hoofdactie.
- Inklappen/later: toon alleen schuldsoorten die de gebruiker selecteert; laat uitleg per gerangschikte schuld ingeklapt.
- Korter: “Welke schuld eerst?” klinkt als persoonlijk advies terwijl de uitkomst zichzelf routehulp noemt.
- Behouden: rente en bedrag per schuld, extra inzet, contractwaarschuwing en “betaal altijd minimaal verplichte maandbedragen”.
- Grootste quick win: vervang zes standaard open schuldkaarten door “Welke schulden heb je?” met selecties.

Productbesluit: deze tool omvat creditcard, achteraf betalen, persoonlijke lening en hypotheek en botst daarmee mogelijk met de studieschuld-only launchscope. Niet verwijderen zonder expliciet besluit.

### 5.10 Welke toeslagen passen mogelijk bij mij?

Route: `/apps/toeslagen-scan`

Bewijs: `apps/toeslagen-scan/Calculator.tsx`

- Direct weg: 41/41-vraagcount, direct/afgeleid-counts, datasetversies op resultaatkaarten en manifestcontext.
- Samenvoegen: totaal met vier resultaatkaarten; herhaalde officiële links; Afbakening en slotdisclaimer.
- Inklappen/later: niet-gevraagde/niet-van-toepassingvelden en berekeningscomponenten per toeslag.
- Korter: “centrale vraagflow”, “centrale engine”, “beta · toeslagenscan 2026” en betrouwbaarheidsteksten.
- Behouden: voorwaardelijke vragen, blokkades voor complexe situaties, concrete bedragen waar verantwoord, doorslaggevende redenen en officiële aanvraag-/controleactie.
- Grootste quick win: verwijder interne voortgangsrapportage en toon per toeslag alleen bedrag, kernreden en “Details”.

Productbesluiten:

- De tool valt buiten een strikt studieschuld-only publiek verhaal.
- Het voorbeeld kan bedragen tonen terwijl meerdere complexiteitsvragen op “Weet ik niet” staan. Bevestig dat geen essentiële unresolved unknown het centrale rekenpad bereikt, conform `AGENTS.md`.
- Een mobiele een-vraag-per-stapflow kan de lengte sterk verminderen, maar is een structurele UX-keuze.

## 6. Cross-site doublures

| Patroon | Waar zichtbaar | Effect | Voorkeursoplossing |
|---|---|---|---|
| Dubbele tooltitel | H1 in `src/app/apps/[slug]/page.tsx` plus H2 in calculators | Eerste invoer zakt omlaag | Eén gedeelde titel/intro |
| Onderwerpstags | Iedere toolkop en vaak kaartcategorie | Veel kleine pills zonder besliswaarde | Alleen intern/metadata |
| Beta/Actief | Toolkaarten, calculatorlabels, context | Status zonder gebruikersbetekenis | Verwijderen of één keer uitleggen |
| Disclaimer | Hero, calculator, resultaat, Over, footer | Waarschuwing verliest kracht door herhaling | Eén contextuele disclaimer |
| Aannames | Resultaatdetails, `/variabelen`, toolcontext | Dezelfde bron-/normcontext in meerdere vormen | Tool: korte voetnoot; centraal: volledig register |
| Volgende stappen | Alle resultaten | Twee tot drie CTA's concurreren met resultaat | Eén primaire CTA |
| “Voorbeeld invullen” en “Wis invoer” | Vrijwel alle tools | Handig, maar reset soms dubbel zichtbaar | Eén vaste actierij |
| Bronnen | Kennisbankonderwerp, broncatalogus, documentgroepen, hiërarchie | Zeer lange pagina | Eén bronregister |
| Homepage-toolkeuze | Stappen, filters, startpunten, groepen | Keuzestress ondanks slechts tien tools | Route plus volledige lijst |
| Hypotheek-impactkaart | Groep Studieschuld en groep Wonen | Dezelfde tool twee keer op één overzicht | Eén plaats met cross-link |
| PDF-actie | Boven resultaat en soms opnieuw eronder | Dubbele of disabled CTA | Alleen na geldige uitkomst |
| Interne architectuurtaal | Aanvullende beurs, toeslagen, aannames, `/apps` | Bezoeker leest implementatie in plaats van antwoord | Vertaal naar regel en gevolg |

## 7. Volledige kandidatenlijst

Legenda:

- A = direct verwijderen
- B = samenvoegen
- C = inklappen of later tonen
- D = inkorten of herschrijven
- E = behouden
- F = nader productbesluit nodig

| ID | Pagina/tool | Onderdeel | Categorie | Voorstel | Impact | Risico | Inspanning | Prioriteit |
|---|---|---|:---:|---|---|---|---|:---:|
| V1-001 | Alle toolroutes | Onderwerpstags | A | Verwijder publieke tagrij | Hoog | Laag | Klein | 1 |
| V1-002 | Alle toolroutes | Toolcontext/manifestmetadata | A | Verwijder uit publieke UI | Hoog | Laag | Klein | 1 |
| V1-003 | Alle toolroutes | H1 plus calculator-H2/intro | B | Maak één titel en taakzin | Hoog | Laag | Middel | 2 |
| V1-004 | Resultaten | Meerdere volgende-stap-CTA's | C | Eén CTA; rest ingeklapt | Middel | Laag | Klein | 2 |
| V1-005 | Cross-site | Herhaalde disclaimers | B | Eén contextuele disclaimer | Middel | Middel | Middel | 2 |
| V1-006 | Cross-site | Engine/registry/dataset/rekenlaagtaal | D | Schrijf regel en gevolg in gewone taal | Hoog | Laag | Middel | 1 |
| V1-007 | Kaarten en tools | Onverklaard Beta/Actief | A | Verwijder decoratieve status | Middel | Laag | Klein | 1 |
| V1-008 | PDF-tools | Lange PDF-knoptekst | D | Gebruik “Download overzicht” | Laag | Laag | Klein | 1 |
| V1-009 | PDF-tools | Disabled PDF vóór resultaat | C | Toon pas na geldige uitkomst | Middel | Laag | Klein | 1 |
| V1-010 | Meerdere tools | Dubbele reset/PDF-acties | B | Eén actie per functie | Middel | Laag | Klein | 1 |
| V1-011 | Toolroutes | Breadcrumb naast teruglink | A | Behoud alleen teruglink | Middel | Laag | Klein | 1 |
| V1-012 | Header | “Begin bij stap 1” buiten homepage | A | Alleen op homepage tonen | Middel | Laag | Klein | 1 |
| V1-013 | Mobiele header | “Stappen/Tools/Kennis” | D | Duidelijker en minder items | Middel | Laag | Klein | 1 |
| V1-014 | Footer | Herhaalde headerlinks en directe DUO-link | B | Maak compacte secundaire footer | Middel | Laag | Klein | 2 |
| V1-015 | Disclosures | Tekst “Open / sluit” | A | Vervang door één statusicoon/label | Laag | Laag | Klein | 1 |
| V1-016 | Cross-site | Teruglink en skiplink | E | Behouden | Hoog | Laag | Klein | 4 |
| V1-017 | Formulieren | Inline fouten, samenvatting en focus | E | Behouden en centraal houden | Hoog | Hoog | Middel | 4 |
| V1-018 | Resultaten | Hoofdantwoord en doorslaggevende reden | E | Behouden | Hoog | Hoog | Middel | 4 |
| V1-019 | Resultaten/kennisbank | Primaire bronnen als verdieping | E | Behouden als voetnoot/disclosure | Hoog | Middel | Middel | 4 |
| V1-020 | Mobiele tools | Veldstappen en voortgang | E | Behouden | Hoog | Middel | Middel | 4 |
| V1-021 | Meerdere geldvelden | Geen directe bovengrens bij 12 cijfers | F | Stel domeinspecifieke bovengrenzen vast | Middel | Hoog | Middel | 3 |
| V1-022 | Techniek | Gepauzeerde v2/flag- en artifactbranches | F | Geen UX-winst; pas opruimen na architectuurbesluit | Laag | Middel | Groot | 3 |
| V1-023 | Homepage | Stappenplan plus dashboardroutes | B | Eén route en één lijst | Hoog | Middel | Middel | 2 |
| V1-024 | Homepage | Trust-strip 10/DUO/PDF | A | Verwijder | Middel | Laag | Klein | 1 |
| V1-025 | Dashboard | Researchsignal en “Startpunt/Open tool” | A | Verwijder interne routecopy | Middel | Laag | Klein | 1 |
| V1-026 | Dashboard | Drie doelgroepfilters bij tien tools | F | Beslis of filter nog nodig is | Middel | Middel | Middel | 3 |
| V1-027 | `/apps` | Copy over registry/hidden tools | D | Schrijf taakgerichte intro | Middel | Laag | Klein | 1 |
| V1-028 | `/apps` en toolgroep | Verouderde toeslagcopy zonder bedragen | D | Actualiseer metadata en groepscopy | Hoog | Laag | Klein | 1 |
| V1-029 | `/apps` | Defaultfilter verbergt niet-DUO-groep | F | Toon alles of hernoem route | Hoog | Middel | Middel | 3 |
| V1-030 | Dashboard | Hypotheek-impact in twee groepen | B | Toon eenmaal met verwijzing | Middel | Laag | Klein | 1 |
| V1-031 | Toolkaarten | Categorie, status, “Direct in browser”, “Openen” | A | Behoud titel en taakzin | Hoog | Laag | Klein | 1 |
| V1-032 | Dashboard | Los blok “Controleer aannames” | A | Verwijder; nav blijft | Laag | Laag | Klein | 1 |
| V1-033 | Kennisbank | Volledige checklist/fouten/tools/bronnen per topic | B | Maak korte topicintro met detailroute | Hoog | Middel | Groot | 2 |
| V1-034 | Kennisbank | Drie centrale bronoverzichten | B | Eén bronregister | Hoog | Laag | Middel | 2 |
| V1-035 | Kennisbank | “Kader” en “Centrale bronlaag” badges | A | Verwijder | Middel | Laag | Klein | 1 |
| V1-036 | Kennisbank | “De drie fases” na dezelfde homepage-route | B | Verwijs naar stappenplan of verwijder | Middel | Laag | Klein | 1 |
| V1-037 | Kennisbank | Volledige bronmetadata standaard zichtbaar | C | Inklappen per onderwerp/register | Hoog | Laag | Middel | 2 |
| V1-038 | Kennisbank | Eén pagina van 22.513 px mobiel | F | Kies topicroutes, tabs of disclosures | Hoog | Middel | Groot | 3 |
| V1-039 | Aannames | Samenvattingskaarten plus dezelfde disclosurewaarden | B | Eén compacte samenvatting | Middel | Laag | Klein | 1 |
| V1-040 | Aannames | Box 1, Box 3 en grafiekdefaults in v1 | F | Bevestig publieke relevantie | Middel | Middel | Klein | 3 |
| V1-041 | Aannames | Bron/aannameset, niveau en status | D | “Bron”, “geldig voor”, “gecontroleerd op” | Middel | Laag | Middel | 2 |
| V1-042 | Over | Drie varianten van geen-adviescopy | B | Eén duidelijke paragraaf | Middel | Laag | Klein | 1 |
| V1-043 | Over | “GitHub issues” | D | Label als “Meld een fout” | Laag | Laag | Klein | 2 |
| V1-044 | 404 | Twee CTA's plus route-aside | B | Eén CTA en één tekstlink | Middel | Laag | Klein | 1 |
| V1-045 | 404 | “Deze route geeft nu geen grip” | D | “Pagina niet gevonden” | Middel | Laag | Klein | 1 |
| V1-046 | Error | Cmd+Shift+R en oude-chunkdiagnose | D | Platformneutrale herstelcopy | Middel | Laag | Klein | 1 |
| V1-047 | Error/global-error | Dubbele componentcopy | B | Deel copy/presentatie waar veilig | Laag | Middel | Middel | 3 |
| V1-048 | Foutpagina's | Primaire herstelactie | E | Behouden | Hoog | Laag | Klein | 4 |
| V1-049 | Maximale hypotheek | Acht resultaatkaarten | B | Hoofdbedrag plus compacte details | Hoog | Middel | Middel | 2 |
| V1-050 | Maximale hypotheek | Geavanceerde woning- en rentevelden | C | Conditioneel of ingeklapt tonen | Hoog | Middel | Middel | 2 |
| V1-051 | Maximale hypotheek | “Betrouwbaarheid: medium” en breakdowns | C | Uitleg pas in methodiek | Middel | Middel | Klein | 2 |
| V1-052 | Maximale hypotheek | Salarisverhogingsanalyse | F | Bevestig of dit tot hoofdtaak behoort | Middel | Middel | Middel | 3 |
| V1-053 | Aanvullende beurs | “Engine-meldingen vertaald” | A | Verwijder | Hoog | Laag | Klein | 1 |
| V1-054 | Aanvullende beurs | “Officiële controle: Nee” en trustjargon | D | Leg concrete beperking uit | Hoog | Laag | Klein | 1 |
| V1-055 | Aanvullende beurs | Aannames, waarschuwingen en bronnen tegelijk | C | Inklappen na kernresultaat | Middel | Laag | Klein | 2 |
| V1-056 | Aanvullende beurs | Twee keer “Wis invoer” | B | Eén resetknop | Laag | Laag | Klein | 1 |
| V1-057 | Aanvullende beurs | Special cases naar handmatige beoordeling | F | Bepaal welke uitleg de site zelf moet geven | Hoog | Hoog | Groot | 3 |
| V1-058 | Extra aflossen | Curve, effecttabel en aannames standaard | C | Kernresultaat eerst, details ingeklapt | Hoog | Laag | Middel | 2 |
| V1-059 | Extra aflossen | “Oude einddatum: Onzeker” | D | Leg ontbrekende datum concreet uit | Middel | Laag | Klein | 1 |
| V1-060 | Impact leenbedrag | PDF-knop boven en onder resultaat | B | Eén knop na resultaat | Laag | Laag | Klein | 1 |
| V1-061 | Impact leenbedrag | Zes vergelijkbare resultaatlabels | D | Groepeer schuld nu, extra en totaal | Middel | Middel | Middel | 2 |
| V1-062 | Impact leenbedrag | Bestandsnaam `studeren-stoppen-duo` | D | Gebruik tool-specifieke naam | Middel | Laag | Klein | 1 |
| V1-063 | DUO-maandbedrag | Lege draagkrachtkaart | C | Pas tonen na opt-in/invoer | Middel | Laag | Klein | 1 |
| V1-064 | DUO-maandbedrag | Berekeningstabel en aannames | C | Onder hoofdantwoord inklappen | Middel | Laag | Klein | 2 |
| V1-065 | Studieschuld starten | “Vul alleen deze vraag in” naast acht velden | D | Benoem minimuminvoer en verdieping | Middel | Laag | Klein | 1 |
| V1-066 | Studieschuld starten | Bestandsnaam `studeren-stoppen-duo` | D | Gebruik tool-specifieke naam | Middel | Laag | Klein | 1 |
| V1-067 | Stoppen met studeren | Drie totalen met gelijke nadruk | B | Prestatiebeursbedrag eerst; rest detail | Hoog | Middel | Middel | 2 |
| V1-068 | Stoppen met studeren | Journeytitel “Van maandbedrag...” | D | Maak stopkosten-specifiek | Middel | Laag | Klein | 1 |
| V1-069 | Stoppen met studeren | Generieke PDF-bestandsnaam | D | Maak stoptool-specifiek | Laag | Laag | Klein | 1 |
| V1-070 | Stoppen met studeren | Itemisering beurs/reisproduct | E | Behouden | Hoog | Hoog | Klein | 4 |
| V1-071 | Hypotheek-impact | “Niet klagen, maar rekenen” | A | Verwijder | Middel | Laag | Klein | 1 |
| V1-072 | Hypotheek-impact | Intro plus “Wat heb je nodig?” | B | Eén korte startuitleg | Middel | Laag | Klein | 1 |
| V1-073 | Hypotheek-impact | Kernbedragen vier keer verteld | B | Eén antwoord en één toelichting | Hoog | Laag | Klein | 1 |
| V1-074 | Hypotheek-impact | Zeer diepe geneste berekeningspanelen | C | Toon alleen relevante uitleg op verzoek | Hoog | Middel | Groot | 2 |
| V1-075 | Hypotheek-impact | Annuitair/brutering/keuzezonetaal | D | Gewone taal met definitie | Hoog | Middel | Middel | 2 |
| V1-076 | Hypotheek-impact | Woningdoel en maximale hypotheekvelden | C | Pas na primaire impactberekening | Hoog | Hoog | Groot | 2 |
| V1-077 | Hypotheektools | Overlap impacttool en maximale hypotheek | F | Bepaal hoofdtaak en overdrachtsmoment | Hoog | Hoog | Groot | 3 |
| V1-078 | Hypotheek-impact | Controledatum tweemaal | B | Eén bronvoetnoot | Laag | Laag | Klein | 1 |
| V1-079 | Hypotheek-impact | “Waarom geen snelle vuistregel meer?” | A | Verwijder historische interne toelichting | Middel | Laag | Klein | 1 |
| V1-080 | Schuldvolgorde | Hele tool versus studieschuld-only scope | F | Expliciet behouden, herpositioneren of later hiden | Hoog | Hoog | Groot | 3 |
| V1-081 | Schuldvolgorde | Zes schuldkaarten standaard open | C | Selecteer eerst relevante schulden | Hoog | Middel | Middel | 2 |
| V1-082 | Schuldvolgorde | Prescriptieve titel | D | Hernoem naar “Vergelijk mijn schulden” | Hoog | Middel | Klein | 2 |
| V1-083 | Schuldvolgorde | Drie volgende CTA's | B | Eén primaire vervolgactie | Middel | Laag | Klein | 1 |
| V1-084 | Schuldvolgorde | Waarschuwing verplichte betalingen | E | Behouden | Hoog | Hoog | Klein | 4 |
| V1-085 | Toeslagenscan | Hele tool versus studieschuld-only scope | F | Expliciet scopebesluit | Hoog | Hoog | Groot | 3 |
| V1-086 | Toeslagenscan | 41/41, direct en afgeleid | A | Verwijder interne tellingen | Hoog | Laag | Klein | 1 |
| V1-087 | Toeslagenscan | Niet gevraagd/niet van toepassing-lijsten | C | Alleen in technische verdieping | Middel | Laag | Klein | 1 |
| V1-088 | Toeslagenscan | Vraagflow/engine/beta-copy | D | Schrijf concrete gebruikerstekst | Hoog | Laag | Middel | 1 |
| V1-089 | Toeslagenscan | Lange vijfstappenflow op één pagina | F | Beslis over één-vraag-per-stap | Hoog | Middel | Groot | 3 |
| V1-090 | Toeslagenscan | Totaal plus vier gedetailleerde kaarten | B | Samenvatting plus disclosures | Hoog | Middel | Middel | 2 |
| V1-091 | Toeslagenscan | Datasetversies in kaartkoppen | A | Verwijder uit hoofdweergave | Middel | Laag | Klein | 1 |
| V1-092 | Toeslagenscan | Betrouwbaarheidslabels | D | Leg bruikbare onzekerheid uit | Hoog | Middel | Middel | 2 |
| V1-093 | Toeslagenscan | Bedragen naast unresolved unknowns | F | Bevestig blokkerende input en resolutiepad | Hoog | Hoog | Groot | 3 |
| V1-094 | Toeslagenscan | Herhaalde officiële links per kaart | B | Eén bron-/aanvraagblok per toeslagdetail | Middel | Laag | Middel | 2 |
| V1-095 | Toeslagenscan | Afbakening plus slotdisclaimer | B | Eén compacte beperkingen-disclosure | Middel | Laag | Klein | 1 |
| V1-096 | Toeslagenscan | Officiële controle- en aanvraagactie | E | Behouden na eigen uitleg | Hoog | Hoog | Klein | 4 |

### Telling per categorie

| Categorie | Aantal |
|---|---:|
| A — Direct verwijderen | 16 |
| B — Samenvoegen | 24 |
| C — Inklappen of later tonen | 13 |
| D — Inkorten of herschrijven | 21 |
| E — Behouden | 9 |
| F — Nader productbesluit nodig | 13 |
| **Totaal** | **96** |

## 8. Prioriteitenmatrix

### Prioriteit 1 — Quick wins

Hoge of middelhoge vereenvoudiging, laag risico, meestal kleine inspanning:

- V1-001, V1-002, V1-006 t/m V1-013.
- V1-015, V1-024, V1-025, V1-027, V1-028, V1-030 t/m V1-032.
- V1-035, V1-036, V1-039, V1-042, V1-044 t/m V1-046.
- V1-053, V1-054, V1-056, V1-059, V1-060, V1-062, V1-063.
- V1-065, V1-066, V1-068, V1-069, V1-071 t/m V1-073.
- V1-078, V1-079, V1-083, V1-086 t/m V1-088, V1-091, V1-095.

De tien belangrijkste quick wins:

1. Verwijder tags op alle toolroutes.
2. Verwijder publieke toolcontext/manifestmetadata.
3. Verwijder de vaste header-CTA buiten de homepage.
4. Verwijder de homepage trust-strip.
5. Vereenvoudig toolkaarten tot titel en taakzin.
6. Herschrijf alle engine/registry/datasettaal.
7. Corrigeer de verouderde toeslagmetadata.
8. Verwijder “Engine-meldingen vertaald”.
9. Verwijder technische voortgangstellingen uit de toeslagenscan.
10. Corrigeer verkeerde journeytitels en legacy-PDF-bestandsnamen.

### Prioriteit 2 — Belangrijke opschoning

Hoge vereenvoudiging met beheersbaar risico:

- Eén gedeelde toolintro en één disclaimerpatroon.
- Homepage- en dashboardroutes samenvoegen.
- Kennisbankonderwerpen en bronregister herstructureren.
- Resultaatkaarten van maximale hypotheek, stoptool en toeslagenscan hiërarchisch maken.
- Optionele formulierdelen van hypotheek-, schuld- en toeslagtools later tonen.
- Hypotheek-impactmethodiek terugbrengen tot gerichte disclosures.

### Prioriteit 3 — Structurele UX- en productbesluiten

- Blijven `schulden-volgorde` en `toeslagen-scan` publiek binnen de studieschuld-only launchscope?
- Is een doelgroepfilter bij tien tools nog gerechtvaardigd?
- Moet `/apps` standaard werkelijk alle tools tonen?
- Wordt de kennisbank opgesplitst in routes, tabs of disclosures?
- Hoort salarisverhogingsanalyse bij Maximale hypotheek?
- Hoe worden de twee hypotheektools duidelijk van elkaar afgebakend?
- Welke geldige bovengrenzen gelden voor vrije geldvelden?
- Mag de toeslagenscan bedragen tonen zolang essentiële antwoorden onbekend zijn?
- Blijven Box 1, Box 3 en grafiekdefaults publiek op de aannamespagina?

### Prioriteit 4 — Niet verwijderen

Deze elementen kunnen visueel druk zijn, maar zijn inhoudelijk of toegankelijkheidsmatig nodig:

- verplichte en conditioneel noodzakelijke rekenvelden;
- foutteksten en foutfocus;
- kernresultaat en doorslaggevende reden;
- materiële waarschuwingen en uitzonderingen;
- bronnen als onderbouwing;
- mobiele veldstappen;
- terug- en herstelacties;
- itemisering van prestatiebeursdelen;
- waarschuwing over verplichte betalingen.

Advies: verbeter de presentatie via volgorde, witruimte en disclosures; verwijder de inhoud niet.

## 9. Niet-verwijderenlijst

1. Centrale berekeningsvelden die een norm, uitzondering of bedrag beïnvloeden.
2. De blokkade op onbekende essentiële ouderinkomens bij aanvullende beurs.
3. De uitleg waar een persoonlijk gegeven in Mijn DUO of de eigen administratie staat.
4. Inline validatie en foutoverzichten.
5. De hoofdresultaten in euro's en de gekozen regeling/peildatum.
6. Waarschuwingen bij complexe toeslagen-, DUO- en hypotheeksituaties.
7. De bronvoetnoot die de doorslaggevende regel onderbouwt.
8. De privacyuitleg dat invoer lokaal blijft.
9. De expliciete indicatieve status waar deze materieel is voor interpretatie.
10. De teruglink, skiplink, focusringen en mobiele stapbediening.
11. De PDF-functie waar die dezelfde centrale uitkomst gebruikt; alleen plaatsing en label vereenvoudigen.
12. De 404- en errorherstelacties.

## 10. Aanbevolen uitvoeringsvolgorde

### Batch 1 — Copy, labels en metadata

- V1-006 t/m V1-008, V1-013, V1-027, V1-028.
- Tool-specifiek: V1-053, V1-054, V1-059, V1-062, V1-065, V1-066, V1-068, V1-069, V1-071, V1-075, V1-082, V1-088, V1-092.
- Controle: lint, typecheck, copytests, browser-smoke en metadata-inspectie.

### Batch 2 — Toolpagina-shell en globale navigatie

- V1-001 t/m V1-005, V1-009 t/m V1-015.
- Verwijder publieke manifestcontext en maak één titel/intro.
- Controle: alle tien routes, keyboard, mobiel, resultfocus en build.

### Batch 3 — Homepage, dashboard en footer

- V1-023 t/m V1-032 en V1-014.
- Begin pas na besluit over V1-026 en V1-029.
- Controle: registrytest, routecrawl, responsive browser-smoke en build.

### Batch 4 — Formulieren

- V1-050, V1-057, V1-076, V1-081, V1-089 en V1-093.
- Houd centrale adapters en rekenlagen ongewijzigd.
- Controle: empty, invalid, min/max, unknown-resolution, mobile flow, submit en regressietests.

### Batch 5 — Resultaten en PDF-acties

- V1-049, V1-051, V1-055, V1-058, V1-060, V1-061, V1-063, V1-064, V1-067, V1-073, V1-074, V1-078, V1-083, V1-090, V1-094, V1-095.
- Controle: numerieke gelijkheid tussen vóór/na, PDF-download, resultaatfocus, warnings en screenshots.

### Batch 6 — Kennisbank, aannames en journeys

- V1-033 t/m V1-041 en V1-004.
- Begin pas na besluiten over V1-038 en V1-040.
- Controle: bronlinks, inhoudsdekking, routes, metadata en mobiele lengte.

### Batch 7 — Technische legacy-opruiming

- V1-021, V1-022, V1-047, V1-052 en V1-077.
- Alleen uitvoeren na aparte architectuur- en productbesluiten.
- Controle: volledige generate-, lint-, typecheck-, test- en buildreeks.

## 11. Beslispunten voor Olivier

1. Moet `/apps` standaard alle tien tools tonen, of blijft het een DUO-route met een andere titel?
2. Blijft de doelgroepfilter bestaan zolang er maar drie zichtbare filters en tien tools zijn?
3. Past `schulden-volgorde` publiek binnen de studieschuld-only launchscope?
4. Past `toeslagen-scan` publiek binnen diezelfde launchscope?
5. Mag de toeslagenscan bedragen tonen wanneer complexiteitsantwoorden nog “Weet ik niet” zijn, en welke onbekenden zijn hard blokkerend?
6. Wordt de kennisbank opgesplitst in onderwerpstroutes, disclosures of een andere navigatiestructuur?
7. Blijven Box 1, Box 3 en grafiekdefaults publiek zichtbaar in v1?
8. Hoort salarisverhogingsanalyse bij de hoofdtaak van Maximale hypotheek?
9. Welke hypotheektool is leidend voor de gebruiker en wanneer stapt die over naar de andere?
10. Moeten onverklaarde beta-labels volledig verdwijnen of komt er één concrete betekenis en verwachting?
11. Welke realistische bovengrenzen gelden per vrij geldveld?
12. Welke PDF's moeten compact blijven en welke mogen bewust een uitgebreid dossier zijn?

## 12. Conclusie

De v1-site kan merkbaar rustiger worden zonder rekenlogica, brondata of noodzakelijke invoer te verwijderen. De laagste-risicowinst zit in het schrappen van publieke metadata en dubbele copy, het terugbrengen van keuze- en CTA-herhaling en het later tonen van methodiek. De structurele beslissingen gaan vooral over scope: de toeslagenscan, schuldvolgordetool, omvang van de kennisbank en overlap tussen hypotheektools.

Volledige vereenvoudigingsaudit gereed voor besluitvorming
