# Regelingen & Toeslagen Engine — architectuur en ontwerp

Peildatum: 2026-07-20. Scope: product- en architectuurontwerp voor een nieuw platformonderdeel. Dit document beschrijft ontwerpkeuzes en vervolgwerk. Er is geen code, manifest, route, test, brondata of generator gewijzigd.

Status: geaccepteerde architectuurrichting voor toekomstige implementatie. De bindende repo-regels staan in `AGENTS.md`; dit document licht de product- en ontwerpkeuzes toe. Waar dit document ontwerpvrijheid laat, blijven `AGENTS.md`, `FUNCTIONALITY_STATUS.md`, `docs/source-data-architecture.md` en de centrale domeinlagen leidend.

## 1. Visie

De Regelingen & Toeslagen Engine begeleidt burgers van "ik weet niet waar ik recht op kan hebben" naar "ik weet welke regelingen mogelijk relevant zijn, welke gegevens ontbreken, hoe zeker de schatting is en wat mijn volgende stap is".

De engine is geen beschikkingsmachine en geen vervanging van Dienst Toeslagen, DUO, gemeenten, SVB, UWV of andere uitvoerders. De engine is een begeleide verkenning:

- burgers helpen ontbrekende kennis te achterhalen;
- begrippen uitleggen op het moment dat ze nodig zijn;
- onzekerheden expliciet tonen;
- schattingen en bandbreedtes geven waar officiële rekenregels voldoende zijn gemodelleerd;
- altijd verwijzen naar officiële aanvraag- of controlekanalen.

Verboden framing:

- "Je hebt recht op..."
- "Je ontvangt..."
- "Dit is jouw toeslag."
- "Vraag dit direct aan zonder officiële controle."

Voorkeursframing:

- "Op basis van jouw antwoorden schatten wij..."
- "Deze regeling lijkt mogelijk relevant."
- "Deze uitkomst heeft beperkte zekerheid omdat..."
- "Controleer dit met de officiële aanvraag of proefberekening."

## 2. Doelgroep

Primaire doelgroepen:

- burgers met studieschuld of financiële veranderingen die willen weten welke regelingen mogelijk relevant zijn;
- starters, huurders, ouders, studenten, jonge gezinnen en mensen met wisselend inkomen;
- gebruikers die niet weten welke begrippen zoals toetsingsinkomen, toeslagpartner, medebewoner of vermogen betekenen;
- gebruikers die hun financiële toekomst willen inschatten zonder direct adviesgesprek.

Secundaire doelgroepen:

- gebruikers van hypotheektools die willen weten of toeslagen relevant zijn voor maandbudget;
- gebruikers van DUO-tools die hun maandlasten en betaalruimte willen begrijpen;
- gebruikers die familiehulp, wonen, kind, werk of inkomen als levensgebeurtenis onderzoeken.

Ontwerpeis: de engine moet werken voor gebruikers die veel velden niet weten. "Weet ik niet" is een normaal antwoord, geen fout.

## 3. Scope

De engine omvat:

- centrale brondata en bronmetadata;
- centraal domeinmodel voor regelingen;
- beslisregels voor harde uitsluitingen, mogelijke relevantie en complexiteit;
- schattingsmodel met bandbreedtes wanneer regels voldoende gemodelleerd zijn;
- confidence model met uitleg;
- onzekerheidsmodel;
- "weet ik niet"-flow;
- afgeleide gegevens uit bestaande Project Site-input;
- vraagboom met progressive disclosure;
- actieplan per uitkomst;
- officiële doorverwijzingen;
- koppelingen met andere Project Site-tools;
- onderhouds- en updatebeleid.

Startdomeinen:

- zorgtoeslag;
- huurtoeslag;
- kindgebonden budget;
- kinderopvangtoeslag.

Toekomstige domeinen:

- gemeentelijke regelingen;
- kwijtscheldingen;
- energieregelingen;
- studiefinanciering en DUO-gerelateerde regelingen;
- kinderbijslag/SVB-context;
- huur, wonen en verduurzaming;
- inkomensondersteuning bij werk, ziekte of werkloosheid.

## 4. Niet-scope

Niet in scope:

- rechtstoekenning;
- automatische aanvraag;
- concreet advies;
- server-side persoonlijke dossiers;
- scraping;
- externe API-calls vanuit de browser voor officiële beoordeling;
- claimen dat een regeling definitief van toepassing is;
- bedragen tonen zonder volledig gemodelleerde officiële rekenregels;
- bedragen zonder bandbreedte;
- schattingen zonder confidence score;
- verborgen formulepaden in UI of PDF;
- parallelle berekenlogica naast de centrale domeinlaag.

## 5. Juridische uitgangspunten

Juridische uitgangspunten:

- De engine geeft informatie, signalen en schattingen, geen juridisch bindende beoordeling.
- Iedere uitkomst vermeldt dat officiële instanties de definitieve beoordeling doen.
- Harde uitsluitingen worden alleen gebruikt wanneer een officiële bron de voorwaarde duidelijk ondersteunt en de engine voldoende context heeft.
- Bij uitzonderingen, deeljaarregels, internationale situaties of onvolledige modellering wordt de uitkomst nooit zekerder gepresenteerd dan de bronbasis toelaat.
- De engine mag geen commerciële vuistregel als wettelijke regel presenteren.
- Iedere regel heeft bron, geldigheidsperiode, publicatie- of controledatum, bronstatus en reviewdatum.
- Iedere regeling krijgt onderscheid tussen wettelijke verplichting, uitvoeringsbeleid, marktpraktijk, projectkeuze en interpretatie.

Juridische copyregel:

- "Op basis van jouw antwoorden schatten wij..." is toegestaan.
- "Je hebt recht op..." is niet toegestaan.

## 6. Bronbeleid

Bronhiërarchie:

1. wet- en regelgeving;
2. officiële bekendmakingen;
3. Rijksoverheid;
4. Belastingdienst / Dienst Toeslagen;
5. DUO, SVB, UWV, gemeenten en andere bevoegde uitvoerders;
6. officiële uitvoeringsdocumentatie;
7. betrouwbare secundaire bronnen, alleen voor uitleg of vergelijking.

Brondataregels:

- `src/lib/financial-constants` blijft de SSOT voor wijziglijke brondata.
- Regelingen krijgen eigen datasetfamilies of scenario's, maar geen tweede data-runtime.
- Brondata voor schattingen is dateerbaar, versieerbaar en testbaar.
- UI leest geen losse JSON en kiest niet zelfstandig een jaar.
- Inactieve of incomplete datasets mogen niet stil in publieke berekeningen vallen.
- Vanaf een nieuw kalenderjaar is geen stille fallback naar het vorige jaar toegestaan.
- Iedere bronlink krijgt een fallbackbeleid.

## 7. Confidence Model

Iedere uitkomst krijgt een confidence score met uitleg. De score is geen kans op juridisch recht, maar een kwaliteitsscore van de Project Site-inschatting.

Voorgestelde schaal:

| Score | Label | Betekenis |
|---:|---|---|
| 0-24 | Zeer laag | Essentiële gegevens ontbreken of situatie is complex. Alleen actieplan en officiële controle. |
| 25-49 | Laag | Enkele voorwaarden bekend, maar veel onzekerheden of ontbrekende officiële rekenregels. |
| 50-74 | Middel | Belangrijke harde voorwaarden bekend, schatting mogelijk met brede bandbreedte. |
| 75-89 | Hoog | Harde voorwaarden en kerngegevens bekend, beperkte onzekerheden. |
| 90-100 | Zeer hoog | Alleen voor volledig gemodelleerde regels met actuele brondata en complete invoer; nog steeds geen rechtstoekenning. |

Scorefactoren:

- bronactualiteit;
- volledigheid van invoer;
- aanwezigheid van "weet ik niet";
- complexiteitsvlaggen;
- gemodelleerde versus niet-gemodelleerde regels;
- hoeveelheid afgeleide gegevens;
- afstand tot harde grenswaarden;
- stabiliteit van inkomens- en huishoudsituatie;
- officiële datasetstatus.

Iedere confidence score krijgt uitleg in gewone taal, bijvoorbeeld:

"Zekerheid: middel. We kennen je inkomen, vermogen en partnerstatus, maar je huurtoeslagsituatie bevat medebewoners. Daarom verwijzen we voor het bedrag naar de officiële proefberekening."

## 8. Onzekerheidsmodel

Onzekerheden zijn first-class output, niet alleen foutmeldingen.

Typen onzekerheid:

- ontbrekende gegevens;
- door gebruiker gemarkeerd als "weet ik niet";
- afgeleide gegevens met lage betrouwbaarheid;
- complexe officiële uitzonderingen;
- brondata niet volledig gemodelleerd;
- grensnabijheid;
- wisselende inkomenssituatie;
- huishoudsituatie of partnerstatus verandert binnen het jaar;
- externe officiële bron vereist.

Onzekerheden worden per regeling opgeslagen als codes met zichtbare uitleg. Voorbeelden:

- `unknown-assessment-income`;
- `derived-income-estimate`;
- `near-income-threshold`;
- `part-year-partner`;
- `co-parenting`;
- `foreign-or-residence-status`;
- `official-amount-rules-not-modeled`;
- `stale-source-data`.

Complex betekent niet stoppen. Complex betekent:

- meer gerichte vervolgvragen;
- expliciete onzekerheid;
- lagere confidence;
- ruimere bandbreedte;
- concrete officiële vervolgstap.

## 9. Signalering

Signalering bepaalt welke regelingen relevant kunnen zijn voordat er bedragen worden geschat.

Implementatiebesluit 2026: `evaluateAllowanceSignals` is de blijvende centrale hard-check- en eligibilitylaag voor de Toeslagenscan. Deze laag bewaakt bekende harde voorwaarden, ontbrekende gegevens, bijzondere situaties, reason codes en officiële bronlinks. `evaluateAllowanceRegulations` is de adapter- en verrijkingslaag daarboven: hij zet dezelfde signaleringsuitkomst om naar Regulation Definitions, Unknown Resolution, Inference, Evaluation, Recommendations, Estimate-contracten en Question Flow-context. De officiële calculation engine hergebruikt deze assessments en voegt alleen bedragindicaties toe waar de officiële bedragregels volledig genoeg centraal zijn genormaliseerd. Dit voorkomt dubbele eligibilityregels en houdt onvolledige bedraglogica expliciet gescheiden.

Statussen:

- `possibly-relevant`: harde voorwaarden sluiten de regeling niet uit.
- `probably-not-relevant`: alleen bij duidelijke harde uitsluiting.
- `insufficient-information`: essentiële gegevens ontbreken en kunnen nog niet worden afgeleid.
- `official-check-needed`: situatie is complex of officiële berekening is nodig.
- `not-modeled`: regeling bestaat, maar valt buiten huidige engine.

Signalering mag niet:

- "recht" claimen;
- bedragen suggereren zonder schattingsmodel;
- commerciële of niet-officiële bronnen als beslisbron gebruiken.

## 10. Schattingen

Schattingen zijn toegestaan wanneer:

- officiële rekenregels volledig genoeg centraal zijn gemodelleerd;
- brondata actueel is;
- invoer of afleiding voldoende is;
- bandbreedte verplicht wordt getoond;
- confidence score met uitleg aanwezig is.

Alle bedragen zijn schattingen. Geen schatting zonder:

- laagste bedrag;
- hoogste bedrag;
- eventueel middenschatting;
- bronjaar;
- confidence;
- onzekerheden;
- officiële vervolgstap.

Een schatting mag exact `0` tonen als harde voorwaarden voldoende duidelijk ontbreken, maar ook dan blijft copy: "waarschijnlijk niet relevant" in plaats van "geen recht".

## 11. Bandbreedtes

Bandbreedtes zijn verplicht bij iedere financiële uitkomst.

Bandbreedtebronnen:

- onzeker inkomen;
- onbekende partnerstatus;
- onbekend vermogen;
- medebewoners;
- variabele opvanguren;
- jaarinkomen versus maandinkomen;
- deeljaarregels;
- afronding en peildatum;
- onvolledig gemodelleerde uitzonderingen.

Presentatie:

- "Geschatte bandbreedte: EUR X tot EUR Y per maand."
- "Waarom zo breed?" met de belangrijkste onzekerheidsfactoren.
- "Wat verkleint de bandbreedte?" met concrete ontbrekende gegevens.

Geen bandbreedte betekent geen bedrag tonen.

## 12. Complexe Situaties

Complexe situaties stoppen de tool niet automatisch.

Voorbeelden:

- co-ouderschap;
- samengesteld gezin;
- toeslagpartner voor deel van het jaar;
- wisselend inkomen;
- medebewoners;
- buitenlandsituatie;
- verblijfstatus;
- bijzondere woning;
- bijzondere zorgverzekering;
- meerdere opvangvormen;
- meerdere regelingen tegelijk;
- schulden of vermogen met bijzondere behandeling.

Enginegedrag:

1. vraag gerichte verduidelijking;
2. probeer gegevens af te leiden;
3. toon onzekerheid;
4. verlaag confidence;
5. geef bandbreedte indien veilig;
6. verwijs naar officiële berekening of aanvraagkanaal;
7. eindig met actieplan.

## 13. Weet Ik Niet-Flow

"Weet ik niet" is nooit een eindpunt.

Bij "weet ik niet":

- leg uit waar de gebruiker het gegeven kan vinden;
- bied een ruwe schattingsroute als dat veilig is;
- probeer afleiding uit andere antwoorden;
- vraag een eenvoudiger alternatief;
- laat de gebruiker doorgaan met lagere confidence;
- benoem welke uitkomst daardoor onzeker blijft.

Voorbeelden:

- Toetsingsinkomen onbekend: vraag bruto jaarinkomen, maandloon, uitkering, partnerinkomen of verwijs naar Belastingdienst-uitleg.
- Vermogen onbekend: vraag grove categorie op 1 januari.
- Toeslagpartner onbekend: toon officiële definitie en stel beslisvragen, maar label als onzeker.
- Kinderopvanguren onbekend: vraag contracturen, gemiddelde weekuren of "wisselend".
- Huur onbekend: vraag kale huur uit contract of bankafschrijving met waarschuwing.

## 14. Afgeleide Gegevens

De engine probeert ontbrekende informatie eerst af te leiden.

Bronnen voor afleiding binnen Project Site:

- hypotheektool-invoer;
- DUO-maandbedrag;
- studieschuldscenario;
- maandbudget;
- familiehulp;
- profieldata wanneer expliciet ingeschakeld;
- eerdere lokale toolinvoer alleen met expliciete toestemming.

Afgeleide gegevens krijgen metadata:

- bron;
- afgeleid op datum;
- betrouwbaarheidsniveau;
- gebruikt voor welke regel;
- overschrijfbaar door gebruiker;
- zichtbaar in resultaat en actieplan.

Afgeleide gegevens mogen nooit stil leidend worden. De gebruiker moet ze kunnen zien en aanpassen.

## 15. Vraagboom

De vraagboom werkt in lagen.

Laag 1: brede oriëntatie

- leeftijd;
- huishouden;
- partnerstatus;
- inkomen bekend/onbekend;
- vermogen bekend/onbekend;
- huur/koop/thuiswonend;
- kinderen;
- kinderopvang;
- studie/werk/uitkering;
- relevante levensgebeurtenis.

Laag 2: regeling-specifieke vragen

- zorgverzekering;
- huurdetails;
- medebewoners;
- kinderbijslag;
- kindverblijf;
- LRK/opvangregistratie;
- activiteit ouder/partner.

Laag 3: schattingsvragen

- jaarinkomen of inkomensband;
- maandbedragen;
- opvanguren;
- huurcomponenten;
- peildatumvermogen;
- deeljaarperiodes.

Laag 4: complexiteitsvragen

- co-ouderschap;
- buitenland;
- bijzonder vermogen;
- aangepaste woning;
- wisselende inkomsten;
- samengestelde gezinnen.

De vraagboom toont geen irrelevante vragen. Gebruikers kunnen altijd "weet ik niet" kiezen en doorgaan.

## 16. Actieplan

Iedere uitkomst eindigt met een persoonlijk actieplan.

Actieplan bevat:

- relevante regelingen;
- prioriteit;
- waarom deze regeling relevant of onzeker is;
- ontbrekende gegevens;
- waar de gegevens te vinden zijn;
- officiële link;
- voorbereidende stappen;
- deadline of kalenderjaar waar relevant;
- waarschuwing bij verlopen brondata;
- koppeling naar Project Site-tools.

Actietypen:

- `collect-data`;
- `verify-officially`;
- `run-project-tool`;
- `apply-officially`;
- `monitor-year-change`;
- `review-later`;
- `not-relevant-now`.

Voorbeeld:

"Controleer je toetsingsinkomen voor 2026. Gebruik daarna de officiële proefberekening zorgtoeslag. Je schatting heeft confidence 62 omdat je partnerstatus bekend is, maar je inkomen als grove schatting is ingevuld."

## 17. Doorverwijzing Belastingdienst

Belastingdienst / Dienst Toeslagen blijft het primaire kanaal voor toeslagen.

Doorverwijzingen:

- officiële proefberekening;
- aanvraagpagina;
- voorwaardenpagina;
- begrippenpagina's zoals toetsingsinkomen, toeslagpartner en vermogen.

Regels:

- geen trackingparameters;
- officiële bronlabels;
- bronjaar en laatst gecontroleerd tonen;
- externe link opent duidelijk als officiële controle;
- geen "direct aanvragen" push voordat onzekerheden zijn getoond.

## 18. Doorverwijzing Naar Andere Project Site Tools

De engine kan de gebruiker naar andere tools sturen wanneer dat helpt om invoer of context te bepalen.

Koppelingen:

- Hypotheektools: effect van toeslagen op maandbudget of betaalbaarheid, nooit op wettelijke leennorm zonder aparte bronbasis.
- DUO-tools: maandbedrag en studieschuldcontext voor budgetruimte.
- Studieschuld: invloed op financiële ruimte en keuzes.
- Maandbudget: toeslagen als mogelijke inkomenscomponent, altijd als schatting.
- Financiële toekomst: scenario's met en zonder regelingen, met bandbreedtes.
- Toeslagen: verdiepende regelinganalyse.
- Familiehulp: effect op eigen maandlasten en mogelijke toeslagen, met waarschuwing voor vermogen/schenkingen.

Koppelingen gebruiken geen verborgen data-overdracht zonder toestemming.

## 19. Onderhoudsbeleid

Onderhoudsprincipes:

- iedere regeling heeft eigenaar;
- brondata heeft reviewdatum;
- datasets verlopen niet stil;
- bij verlopen brondata geen actuele publieke schatting;
- bij nieuwe jaargang geen fallback naar oude jaargang;
- bronupdates krijgen regressietests;
- wijzigingen in officiële uitzonderingen worden apart beoordeeld.

Onderhoudsniveaus:

- kritieke update: grenswaarde, percentage, wettelijke voorwaarde, aanvraagtermijn;
- reguliere update: bronlink, copy, uitleg;
- review-update: herbevestiging zonder waardeaanpassing;
- deprecatie: regeling buiten gebruik of dataset verlopen.

## 20. Jaarlijkse Bronupdates

Jaarlijkse updateflow:

1. inventariseer nieuwe officiële bronnen;
2. leg publicatiedatum en effectiveFrom/effectiveTo vast;
3. update centrale dataset;
4. update bronoverzicht;
5. update tests voor grenzen en uitzonderingen;
6. controleer copy op jaartal;
7. controleer action plan deadlines;
8. voer source-data, unit, integration, UX en buildchecks uit;
9. laat QA releasebesluit geven.

Belangrijke momenten:

- Prinsjesdag;
- publicatie voorlopige grenzen;
- publicatie definitieve grenzen;
- 1 januari;
- tussentijdse wetswijzigingen;
- wijziging officiële URL's.

## 21. Architectuurprincipes

Architectuurprincipes:

- centrale domeinlaag eerst;
- geen formules in React;
- geen parallelle toeslagenengine naast `src/lib/allowances`;
- brondata via `src/lib/financial-constants`;
- presentatie krijgt viewmodels, geen ruwe rekenregels;
- PDF gebruikt hetzelfde resultaatmodel als scherm;
- schattingen en confidence zijn domeinoutput;
- actieplan is domein-/adapteroutput, geen losse UI-interpretatie;
- alle uitvoer is deterministisch en testbaar;
- Type A/static blijft default;
- geen backend tenzij expliciet nodig en apart onderbouwd.

Voorgestelde lagen:

```text
source datasets
  -> regeling definitions
  -> eligibility signals
  -> estimate model
  -> uncertainty model
  -> confidence model
  -> action plan model
  -> app adapter
  -> UI/PDF
```

## 22. Beslisregels

Beslisregels worden getypeerd:

- harde uitsluiting;
- zachte uitsluiting;
- mogelijke relevantie;
- officiële check vereist;
- bedrag schatbaar;
- bedrag niet schatbaar;
- complexiteitsvlag;
- ontbrekende informatie;
- afleidbare informatie.

Iedere beslisregel heeft:

- id;
- regeling;
- bron;
- geldigheidsperiode;
- invoervelden;
- outputstatus;
- confidence-impact;
- bandbreedte-impact;
- actieplan-impact;
- tests.

## 23. Logging

Logging is minimaal.

Niet loggen:

- antwoorden;
- inkomen;
- vermogen;
- kinderen;
- partnerstatus;
- huur;
- zorgverzekering;
- opvanggegevens;
- reason codes als die gevoelige situatie kunnen onthullen;
- officiële aanvraagkeuzes.

Wel mogelijk:

- generieke page/tool events;
- technische fout zonder input;
- performance metrics;
- brondata-versie;
- feature availability.

Analytics mag niet nodig zijn om de tool functioneel te gebruiken.

## 24. Privacy

Privacyprincipes:

- local-first;
- geen backend in eerste platformfase;
- geen BSN;
- geen naam/adres;
- geen exacte geboortedatum wanneer leeftijd volstaat;
- geen persoonlijke data in URL;
- geen autosave zonder expliciete toestemming;
- geen externe API met persoonlijke gegevens;
- duidelijke wissen/reset-actie;
- gegevens zichtbaar en aanpasbaar voor gebruiker.

Gevoelige dataklassen:

- inkomen;
- vermogen;
- gezin en kinderen;
- partnerstatus;
- verblijfstatus;
- zorgverzekering;
- huur;
- opvang;
- schulden;
- studieschuld;
- maandbudget.

## 25. Toekomstige Uitbreiding Naar Andere Regelingen

Uitbreidingskandidaten:

- kinderbijslagcontext;
- gemeentelijke minimaregelingen;
- bijzondere bijstand;
- kwijtschelding gemeentelijke belastingen;
- zorgkostenregelingen;
- energietoeslag of lokale energieregelingen wanneer actief;
- studiefinanciering en DUO-regelingen;
- huur- en woonregelingen;
- werkloosheid/ziekte/arbeidsongeschiktheid-context;
- pensioen- en AOW-gerelateerde regelingen.

Uitbreidingscriteria:

- officiële bron beschikbaar;
- regels dateerbaar;
- doelgroep duidelijk;
- privacyrisico beheersbaar;
- signalering mogelijk zonder rechtstoekenning;
- schatting alleen bij volledige rekenbasis;
- jaarlijkse onderhoudslast acceptabel.

## 26. Koppelingen Met Financiële Project Site-Domeinen

Hypotheektools:

- toeslagschattingen mogen maandbudgetscenario's verrijken;
- geen hypotheeknorm wijzigen zonder officiële bronbasis;
- toon toeslagen als onzekere cashflow, niet als gegarandeerd inkomen.

DUO-tools:

- DUO-maandbedrag kan maandbudget beïnvloeden;
- studieschuld kan financiële ruimte beïnvloeden;
- DUO-data mag niet automatisch naar regelingenengine zonder toestemming.

Studieschuld:

- studieschuldcontext helpt bij budget- en toekomstscenario's;
- toeslagen worden niet als aflosadvies gebruikt.

Maandbudget:

- regelingen kunnen als bandbreedte in inkomsten verschijnen;
- scenario's tonen met en zonder mogelijke regeling.

Financiële toekomst:

- lange termijn scenario's tonen onzekerheid en jaarupdate-risico;
- geen garantie over toekomstige wetgeving.

Familiehulp:

- familiehulp kan vermogen of maandbudget beïnvloeden;
- schenkingen/leningen kunnen regelingcontext raken en vereisen aparte bronbasis.

## 27. Vervolgfasering

Fase 1: architectuuracceptatie

- dit document reviewen;
- productbeslissingen vastleggen;
- statusmodel en confidence-model accepteren.

Fase 2: domeinontwerp

- centrale types ontwerpen;
- rule definitions ontwerpen;
- confidence en action plan modellen testen;
- geen UI.

Fase 3: brondata

- officiële datasets uitbreiden;
- schattingsregels alleen waar volledig;
- source overview bijwerken.

Fase 4: UX prototype hidden

- vraagboom;
- weet-ik-niet-flow;
- actieplan;
- toegankelijkheid.

Fase 5: releasecontrole

- browseraudit;
- privacycheck;
- broncheck;
- QA-releasebesluit.

## 28. Implementatiegrens Na Architectuuracceptatie

De eerstvolgende technische implementatie mag uitsluitend:

- een technische ontwerpnotitie voor `src/lib/regulations` toevoegen;
- minimale centrale TypeScript-primitives toevoegen;
- pure generieke helperfuncties toevoegen;
- unit tests voor generiek gedrag toevoegen.

De eerstvolgende technische implementatie mag nog niet:

- de publieke toeslagenscan aanpassen;
- bedragen berekenen;
- officiële toeslagformules invoeren;
- allowance-adapters koppelen;
- React wijzigen;
- manifests, routes of dashboard wijzigen;
- PDF wijzigen;
- gegevensoverdracht tussen tools activeren;
- backend, opslag of analytics toevoegen.

De beoogde adapterstrategie blijft: generieke primitives mogen later domeinoutput standaardiseren, maar regeling-specifieke regels blijven in bestaande of nieuwe centrale domeinmodules. Voor toeslagen is `src/lib/allowances` leidend; een toekomstige `src/lib/regulations`-laag mag die engine niet vervangen.
