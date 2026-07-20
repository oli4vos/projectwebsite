# Project Site

PROJECT.md is de canonieke projectbeschrijving van de Project Site. Dit document beschrijft wat het project is, waarom het bestaat, welke architectuurprincipes het volgt en hoe het op hoofdlijnen kan doorgroeien.

Dit document is geen coding guide. De werkwijze voor agents en engineers staat in `AGENTS.md`. De actuele functionele status van tools, routes en flags staat in `FUNCTIONALITY_STATUS.md`.

## 1. Projectvisie

Project Site is een browser-first platform voor financiële hulpmiddelen. Het doel is mensen helpen betere financiële beslissingen te nemen door complexe financiële regels, aannames en scenario's begrijpelijk te maken.

De site is geen adviesbureau, geen bemiddelaar en geen officiële uitvoeringsinstantie. De site geeft gebruikers transparante rekentools, signaleringen, scenario's, bronverwijzingen en uitleg, zodat zij hun eigen situatie beter kunnen begrijpen en gerichter officiële bronnen of professionele hulp kunnen raadplegen.

De inhoudelijke focus ligt op domeinen waar veel mensen onzekerheid ervaren en waar regels, timing en persoonlijke situatie sterk samenhangen:

- studieschuld;
- hypotheek;
- toeslagen;
- familiehulp;
- belasting;
- persoonlijke financiële planning.

De toon is feitelijk, terughoudend en uitlegbaar. De site helpt gebruikers grip krijgen, maar doet geen rechtstoekenning, productadvies of automatische aanvraag namens de gebruiker.

## 2. Architectuur

De Project Site volgt een gelaagde architectuur waarin gebruikerservaring, applicatielogica, domeinregels, brondata en rapportage gescheiden blijven.

De hoofdstructuur is:

```text
Dashboard
↓
Apps
↓
Shared Libraries
↓
Regulations Engine
↓
Financial Data
↓
PDF
↓
UI
```

Het dashboard en de app-overzichten helpen gebruikers een relevante tool vinden. Apps zijn afgebakende hulpmiddelen met een eigen onderwerp, formulierflow, resultaatweergave en manifest. Shared libraries bevatten herbruikbare bouwstenen voor parsing, validatie, presentatie, profieldata, bronverwijzingen, charting en rapportage.

De Regulations Engine en domeinengines vormen de centrale inhoudelijke laag. Zij evalueren regels, onbekende antwoorden, inferenties, confidence, reason codes, aanbevelingen en actieplannen. Financial Data bevat dateerbare normen, bronmetadata, geldigheidsperioden en reviewdata. De PDF-laag gebruikt dezelfde gevalideerde data en resultaten als de schermweergave.

Apps vallen grofweg in twee typen:

- Type A apps zijn browser-first en static-first. Ze gebruiken geen geheimen, geen verplichte backend en geen server-side persoonsgegevensverwerking.
- Type B apps hebben een afgebakende backend of externe runtime nodig. Zij zijn alleen passend wanneer Type A technisch of inhoudelijk onvoldoende is en wanneer security, kosten, dataretentie en rollback expliciet zijn ontworpen.

Static hosting, lage runtimekosten en uitlegbare client-side flows zijn de standaard. Backendcomplexiteit is een uitzondering, geen uitgangspunt.

## 3. Centrale Bouwstenen

De Project Site is opgebouwd rond centrale bouwstenen die meerdere domeinen kunnen dragen zonder formules of beslisregels per app te dupliceren.

Shared calculations bevatten generieke rekenhulpen en domeinspecifieke engines. Financial constants bevatten jaardata, grenzen, percentages, tabellen, normen en metadata. Source data verbindt cijfers en regels aan officiële bronnen, geldigheidsperioden en reviewmomenten.

Unknown Resolution behandelt ontbrekende of onzekere antwoorden als geldige domeinstaat. Een gebruiker hoeft niet altijd alles te weten voordat een tool zinvolle vervolgstappen kan tonen. Inference leidt waarden alleen af wanneer dat uitlegbaar, traceerbaar en overschrijfbaar is.

Evaluation bepaalt welke regels gelden, welke onderdelen onzeker zijn en welke uitkomst verantwoord is. Recommendation vertaalt die evaluatie naar prioriteiten, vervolgstappen en officiële controles. Estimate beschrijft bedragen of bandbreedtes alleen wanneer de brondata en rekenregels daarvoor voldoende betrouwbaar zijn.

Question Flow vertaalt dezelfde centrale definitions, resolved answers, unknown resolutions, inferences, evaluations en recommendations naar voortgang, vervolgvraag en vraagstatussen. Apps gebruiken dit als flowcontext; de financiële signalering of berekening blijft in de bestaande domein- en adapterlagen.

Adapters verbinden formulierinput met domeininput en domeinresultaten met scherm- en rapportmodellen. Definitions beschrijven regels, afhankelijkheden, vragen, bronkoppelingen, reason codes en domeinmetadata machineleesbaar, zodat UI en PDF dezelfde inhoudelijke basis gebruiken.

## 4. Domeinen

De Project Site ondersteunt nu en in de toekomst meerdere financiële domeinen. Elk domein behoudt zijn eigen centrale rekenlaag, brondata en testbare aannames, terwijl gedeelde primitives voor evaluatie, uitleg en rapportage herbruikbaar blijven.

Belangrijke domeinen zijn:

- DUO en studiefinanciering;
- hypotheken en wonen;
- toeslagen;
- familiehulp, schenkingen en leningen;
- belasting;
- box 1;
- box 3;
- pensioen;
- gemeentelijke regelingen;
- studiekeuze;
- werk en salaris;
- subsidies.

Niet elk domein hoeft tegelijk volledig actief te zijn. Sommige domeinen kunnen eerst als signalering, checklist of bronverwijzing bestaan voordat bedragen, scenario's of volledige engines verantwoord zijn.

## 5. Ontwerpprincipes

De belangrijkste ontwerpprincipes zijn:

- één waarheid voor rekenregels, brondata en status;
- geen duplicatie van formules, grenzen, tabellen of business rules;
- pure, deterministische en testbare domeinfuncties;
- immutable dataflows waar dat praktisch is;
- centrale engines voor domeinregels;
- centrale bronverwijzingen en source metadata;
- geen verborgen logica in React, routes, PDF-rendering of presentatielaag;
- expliciete scheiding tussen invoer, validatie, evaluatie, resultaat en uitleg.

Een gebruiker moet kunnen begrijpen waarom een resultaat verschijnt. Een ontwikkelaar of agent moet kunnen herleiden welke brondata, aannames en regels een resultaat hebben veroorzaakt.

## 6. Datafilosofie

Financiële hulpmiddelen zijn alleen bruikbaar wanneer data traceerbaar en actueel genoeg is. Daarom behandelt de Project Site brondata als een productonderdeel, niet als losse constants.

Brondata bevat minimaal waar mogelijk:

- bronnaam;
- bron-URL;
- bronstatus;
- publicatie- of geldigheidsdatum;
- ingangsdatum;
- einddatum wanneer relevant;
- datum waarop de bron is gecontroleerd;
- volgende reviewdatum;
- gebruikte domeinen en tools.

Confidence beschrijft de kwaliteit van de Project Site-inschatting. Het is geen juridische kans op recht, geen beschikking en geen garantie. Confidence wordt beïnvloed door bronfreshness, onbekende antwoorden, inferenties, complexiteit, grensnabijheid en de mate waarin officiële regels volledig zijn gemodelleerd.

Reason codes zijn machineleesbare verklaringen voor uitkomsten. Zij staan los van gebruikerscopy, zodat dezelfde evaluatie veilig kan worden gebruikt in scherm, PDF, tests en toekomstige integraties.

Official verification blijft leidend waar de Project Site geen definitieve beoordeling kan of mag geven. Bij toeslagen, belastingen, hypotheeknormen en andere gereguleerde onderwerpen verwijst de site naar officiële proefberekeningen, uitvoeringsinstanties of bronpagina's wanneer dat nodig is.

## 7. Gebruikerservaring

De gebruikerservaring is ontworpen voor begrip, rust en taakvoltooiing. Complexiteit wordt stap voor stap getoond in plaats van in één groot formulier.

Belangrijke UX-principes zijn:

- progressive disclosure;
- stapsgewijze formulieren;
- begrijpelijke labels en hulpiteksten;
- zichtbare aannames en beperkingen;
- transparante bronverwijzingen;
- resultaatuitleg per onderdeel;
- duidelijke validatie;
- reset- en voorbeeldflows waar passend;
- mobiel eerst;
- toegankelijkheid als basisvoorwaarde.

PDF's zijn bedoeld als uitgebreid overzicht van dezelfde invoer, evaluatie, resultaten, bronnen, aannames en beperkingen die de gebruiker op het scherm ziet. Een PDF mag geen apart berekenpad of eigen bronselectie introduceren.

## 8. Schaalbaarheid

De Project Site moet kunnen groeien zonder dat iedere nieuwe tool eigen infrastructuur, eigen rekenregels of eigen presentatielogica uitvindt.

Schaalbaarheid komt uit:

- modulaire apps;
- manifest-driven registratie;
- auto discovery via gegenereerde registries;
- lazy loading van appcomponenten;
- centrale libraries;
- gedeelde domeinengines;
- herbruikbare formulier- en rapportagepatronen;
- static-first hosting;
- lage runtimekosten;
- beperkte en gemotiveerde dependencies.

Nieuwe tools mogen eigen vorm en flow hebben, maar moeten aansluiten op dezelfde centrale principes voor data, evaluatie, bronverwijzing, privacy, testen en publicatie.

## 9. Roadmap

De roadmap beweegt van een betrouwbare set browser-first tools naar een breder financieel platform met meer domeinen en sterkere centrale evaluatie.

De globale fasen zijn:

- MVP: stabiele publieke tools voor studieschuld, hypotheek, toeslagen, familiehulp en maandruimte.
- Regulations Engine: centrale primitives voor definitions, unknown answers, inference, evaluation, confidence, reason codes en action plans.
- Estimate Engine: verantwoord omgaan met bedragen en bandbreedtes wanneer brondata, regels en onzekerheden dat toelaten.
- UI-integratie: formulieren en resultaten die domeinoutput renderen in plaats van beslisregels lokaal te dupliceren.
- PDF-integratie: rapporten die dezelfde data en bronverwijzingen gebruiken als de webinterface.
- Extra financiële domeinen: uitbreiding naar belasting, pensioen, gemeentelijke regelingen, subsidies, werk en salaris.
- Monitoring: privacy-first signalering van technische fouten en releasekwaliteit zonder inhoudelijke gebruikersinvoer te loggen.
- Eventuele API's: alleen wanneer er een duidelijke productnoodzaak, securitymodel, kostenkader en beheerproces is.

De roadmap is incrementeel. Signal-only kan een geldige tussenfase zijn wanneer volledige bedragen of juridische conclusies nog niet verantwoord zijn.

## 10. Niet-Doelen

De Project Site is bewust niet:

- juridisch advies;
- financieel advies;
- hypotheekadvies;
- belastingadvies;
- een automatische aanvraagservice;
- een officiële beschikking;
- een vervanger van DUO, Dienst Toeslagen, Belastingdienst, hypotheekverstrekker of gemeente;
- een platform voor verborgen AI-beslissingen;
- een plek voor onverklaarbare scoremodellen;
- een codebase met hardcoded bedragen verspreid door apps;
- een verzameling losse calculators met ieder een eigen waarheid.

De site kan richting geven aan wat een gebruiker kan controleren, verzamelen of doorrekenen. De uiteindelijke beslissing, aanvraag of officiële beoordeling blijft buiten de Project Site.

## 11. Relatie Met AGENTS.md

PROJECT.md beschrijft wat het project is: visie, domeinen, architectuur, datafilosofie, gebruikerservaring, roadmap en niet-doelen.

AGENTS.md beschrijft hoe Codex-agents en engineers in deze repository werken: rollen, eigenaarschap, guardrails, blueprint-checks, testverwachtingen en wijzigingsregels.

Deze scheiding maakt toekomstige prompts korter. Een agent kan PROJECT.md lezen om het product en de richting te begrijpen, AGENTS.md lezen om veilig te werken, en FUNCTIONALITY_STATUS.md raadplegen voor actuele zichtbaarheid en functionele status.

## 12. Toekomstige Uitbreidingen

Mogelijke uitbreidingen zijn:

- internationale ondersteuning voor grenssituaties, verblijf en bronlandregels;
- een plugin- of modulemodel voor nieuwe domeinen;
- extra regelgeving rond zorg, wonen, werk, studie en subsidies;
- meertaligheid;
- uitgebreidere source governance;
- opt-in analytics zonder inhoudelijke invoer;
- gebruikersaccounts of synchronisatie, alleen met expliciet privacy- en securityontwerp;
- bredere PDF- en dossierfunctionaliteit;
- koppelingen naar officiële portalen zonder automatische aanvraag namens de gebruiker.

Elke uitbreiding moet de kernprincipes behouden: centrale waarheid, traceerbare bronnen, uitlegbare evaluatie, minimale infrastructuur, privacy-first ontwerp en geen schijnzekerheid.
