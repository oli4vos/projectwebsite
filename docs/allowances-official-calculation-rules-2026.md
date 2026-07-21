# Officiele Rekenregels Toeslagenscan 2026

Datum broncontrole: 2026-07-21.

Dit document specificeert de officiele bronlaag voor de Toeslagenscan 2026. Het activeert geen publieke berekening voor huurtoeslag, kindgebonden budget of kinderopvangtoeslag. De publieke scan blijft pas bedraggevend wanneer de Calculation Guardian de centrale engine en regressietests heeft aangesloten.

## Bronnen

| Toeslag | Primaire bron | Instantie | Publicatie | Geldigheid | Repositorydataset |
|---|---|---|---|---|---|
| Huurtoeslag | Berekening huurtoeslag 2026, `tg0831z62fd` | Dienst Toeslagen, Ministerie van Financien | juni 2026 | 2026-01-01 t/m 2026-12-31 | `allowance-calculation-rules-2026.rent` |
| Huurtoeslag | Huurtoeslag verandert vanaf 2026 | Belastingdienst / Dienst Toeslagen | pagina gecontroleerd 2026-07-21 | 2026 | `allowance-calculation-rules-2026.rent` |
| Kindgebonden budget | Berekening kindgebonden budget 2026, `tg0811z61fd` | Dienst Toeslagen, Ministerie van Financien | januari 2026 | 2026-01-01 t/m 2026-12-31 | `allowance-calculation-rules-2026.childBudget` |
| Kinderopvangtoeslag | Berekening kinderopvangtoeslag 2026, `tg0801z61fd` | Dienst Toeslagen, Ministerie van Financien | januari 2026 | 2026-01-01 t/m 2026-12-31 | `allowance-calculation-rules-2026.childcare` |

## Statusbesluit

| Toeslag | Status | Onderbouwing | Resterende blocker |
|---|---|---|---|
| Huurtoeslag | `amount-ready` | Officiele PDF geeft volledige 7-stappenberekening, basishuren, huurgrenzen, kwaliteitskortingsgrens, aftoppingsgrenzen, inkomensijkpunten, afbouwpercentages, vergoeding per huurschijf en afronding. | Bijzondere uitzonderingen en tijdvaklogica moeten als reason codes worden gemodelleerd voordat publieke koppeling plaatsvindt. |
| Kindgebonden budget | `amount-ready` | Officiele PDF geeft maxima, leeftijdsverhogingen, grensinkomens, afbouwpercentage, vermogenstoets, Nederlandse woonlandfactor en voorbeelden. | Buitenlandse woonlandfactoren, co-ouderschap en leeftijdswijzigingen gedurende het jaar vragen tijdvak-/uitzonderingslogica. |
| Kinderopvangtoeslag | `blocked-pending-formula` | Officiele PDF geeft kostenbasis, eerste-kindregel, volledige vergoedingstabel en voorbeelden. | Rechtgevende activiteit, LRK/eigen bijdrage, meerdere contracten en tijdvakken moeten eerst als blokkerende invoer en berekeningscontract worden uitgewerkt. |

## Huurtoeslag 2026

Rechtvoorwaarden:

- aanvrager huurt een woning en staat op het woonadres ingeschreven;
- zelfstandige woonruimte, behalve expliciet officiele uitzondering;
- aanvrager is normaal 18 jaar of ouder;
- vermogen op 1 januari 2026 blijft binnen de grenzen;
- partner en medebewoners tellen mee volgens toeslagenregels;
- inwonende kinderen jonger dan 23 hebben een inkomensvrijstelling.

Genormaliseerde parameters:

- vermogen: alleenstaande 38.479, partners samen 76.958, per medebewoner 38.479;
- rekenhuur 2026: kale huur; servicekosten tellen niet mee;
- huurgrens jongeren onder 21: 498,20;
- huurgrens overig: 932,93;
- basishuur eenpersoonshuishouden: 202,52;
- basishuur meerpersoonshuishouden: 200,71;
- kwaliteitskortingsgrens: 498,20;
- aftoppingsgrens 1 of 2 personen: 713,02;
- aftoppingsgrens 3 of meer personen: 764,14;
- kindinkomensvrijstelling onder 23: 6.218;
- inkomensijkpunt 1 persoon: 23.425;
- inkomensijkpunt 2+ personen: 31.500;
- afbouwpercentage 1 persoon: 27%;
- afbouwpercentage 2+ personen: 22%;
- vergoeding deel A: 100%;
- vergoeding deel B: 65%;
- vergoeding deel C: 40%;
- maandbedrag naar beneden afronden op hele euro's.

Rekenvolgorde:

1. Controleer harde rechtvoorwaarden en vermogen.
2. Bepaal toepasselijke huurgrens: 498,20 bij jongerenhuishouden onder 21 zonder uitzondering, anders 932,93.
3. Rekenhuur = min(kale huur, toepasselijke huurgrens).
4. Basishuur = 202,52 bij 1 persoon, anders 200,71.
5. Deel A = max(min(rekenhuur, 498,20) - basishuur, 0).
6. Als iedereen jonger dan 21 is zonder uitzondering: deel B en C zijn 0.
7. Kies aftoppingsgrens: 713,02 bij 1 of 2 personen, 764,14 bij 3+ personen.
8. Deel B = max(min(rekenhuur, aftoppingsgrens) - 498,20, 0) x 65%.
9. Deel C = max(rekenhuur - aftoppingsgrens, 0) x 40%.
10. Rekeninkomen = aanvrager + toeslagpartner + medebewoners, met kindvrijstelling en onderhuurderuitsluiting.
11. Correctie = max(rekeninkomen - ijkpunt, 0) x (afbouwpercentage / 12).
12. Maandbedrag = max(deel A + deel B + deel C - correctie, 0), naar beneden afgerond.

## Kindgebonden Budget 2026

Rechtvoorwaarden:

- ten minste 1 rechtgevend kind jonger dan 18;
- kinderbijslag of officiele vergelijkbare kindvoorwaarde;
- woon- en onderhoudssituatie ondersteunt recht;
- partnerstatus bepaalt tabelkolom en grensinkomen;
- vermogen op 1 januari 2026 blokkeert bij overschrijding.

Genormaliseerde parameters:

- vermogen zonder toeslagpartner: 146.011;
- vermogen met toeslagpartner: 184.633;
- 1 kind alleenstaande ouder: 5.996 per jaar;
- 2 kinderen alleenstaande ouder: 8.576 per jaar;
- 1 kind met toeslagpartner: 2.580 per jaar;
- 2 kinderen met toeslagpartner: 5.160 per jaar;
- vanaf 3e kind: +2.580 per jaar per kind;
- leeftijdsverhoging 12 t/m 15 jaar: 724 per jaar;
- leeftijdsverhoging 16 en 17 jaar: 964 per jaar;
- grensinkomen zonder toeslagpartner: 29.736;
- grensinkomen met toeslagpartner: 39.141;
- afbouwpercentage: 7,6%;
- woonlandfactor Nederland: 100%;
- maandbedrag naar beneden afronden op hele euro's.

Interpretatie:

- 29.736 en 39.141 zijn afbouwpunten/grensinkomens, geen absolute inkomensgrenzen.
- De alleenstaande-ouderkop is verwerkt in de officiele maximumtabel voor alleenstaande ouders.
- Buitenlandse woonlandfactoren zijn officieel beschikbaar in de PDF, maar nog niet volledig machineleesbaar genormaliseerd.

Rekenvolgorde:

1. Controleer harde rechtvoorwaarden en vermogen.
2. Bepaal maximum op basis van aantal kinderen en partnerstatus.
3. Tel vanaf derde kind 2.580 per extra kind op.
4. Tel leeftijdsverhogingen op voor kinderen van 12-15 en 16-17.
5. Bepaal toetsingsinkomen en toepasselijk grensinkomen.
6. Vermindering = max(inkomen - grensinkomen, 0) x 7,6%.
7. Jaarbedrag = max(maximum + leeftijdsverhogingen - vermindering, 0).
8. Pas woonlandfactor toe.
9. Maandbedrag = jaarbedrag / 12, naar beneden afgerond.

## Kinderopvangtoeslag 2026

Rechtvoorwaarden:

- betaalde kinderopvang;
- geregistreerde opvang met LRK-registratie;
- eigen bijdrage;
- aanvrager heeft rechtgevende activiteit: werk, opleiding, inburgering of traject naar werk;
- toeslagpartner heeft ook een rechtgevende activiteit, tenzij een officiele uitzondering geldt;
- kind woont bij aanvrager;
- opvanguren en kosten zijn per kind en opvangsoort bekend.

Genormaliseerde parameters:

- maximumuurtarief dagopvang: 11,23;
- maximumuurtarief buitenschoolse opvang: 9,98;
- maximumuurtarief gastouderopvang: 8,49;
- maximaal 230 uur per kind per maand;
- volledige inkomens-/percentage-tabel 2026 is opgenomen in `percentageTable`;
- eerste kind: kind met meeste subsidiabele opvanguren; bij gelijke uren het kind met hoogste subsidiabele opvangkosten;
- totaal maandbedrag naar beneden afronden op hele euro's.

Rekenvolgorde:

1. Controleer rechtvoorwaarden en blokkeer bij ontbrekende LRK/eigen bijdrage/rechtgevende activiteit.
2. Bepaal subsidiabel uurtarief per contract: min(werkelijk tarief, maximum).
3. Bepaal subsidiabele uren: min(werkelijke uren, 230 per maand), met beperking op gewerkte maanden.
4. Bereken subsidiabele kosten per kind en opvangsoort.
5. Bepaal eerste kind op basis van uren en daarna kosten.
6. Zoek inkomensband op; grenzen zijn inclusief.
7. Pas eerste-kindpercentage toe op eerste kind en volgende-kindpercentage op overige kinderen.
8. Tel alle maandbedragen op en rond naar beneden af.

## Testvectorplan

Huurtoeslag:

- alleenstaande 20 jaar, huur 600, inkomen 22.000: verwacht 295 per maand;
- partners met kind, huur 1.200, inkomen 34.000: verwacht 492 per maand;
- alleenstaande AOW-leeftijd, huur 710, inkomen 29.000: verwacht 307 per maand;
- vermogen precies op grens: niet geblokkeerd;
- vermogen 1 boven grens: geblokkeerd;
- servicekosten ingevuld: tellen niet mee in rekenhuur;
- onzelfstandige woning zonder uitzondering: blocker.

Kindgebonden budget:

- partners, 2 kinderen jonger dan 12, inkomen 45.000: verwacht 392 per maand;
- partners, kinderen 13 en 16, inkomen 45.000: verwacht 533 per maand;
- alleenstaande ouder, 1 kind van 8, inkomen 30.000: verwacht 497 per maand;
- inkomen precies op afbouwpunt: geen vermindering;
- vermogen 1 boven grens: geblokkeerd;
- buitenlands woonland anders dan Nederland: blocker tot volledige woonlandtabel is genormaliseerd.

Kinderopvangtoeslag:

- voorbeeld 1 PDF: 1 kind dagopvang, inkomen 60.000, 122 uur, 10,50: verwacht 1.202 per maand;
- voorbeeld 2 PDF: 2 kinderen, inkomen 120.000, dagopvang/BSO met maxuurtarieven: verwacht 1.162 per maand;
- voorbeeld 3 PDF: gastouderopvang 240 uur, 230 uur cap: verwacht 1.821 per maand;
- voorbeeld 4 PDF: gastouderopvang boven maximumuurtarief: verwacht 880 per maand;
- partner zonder rechtgevende activiteit: blocker;
- meer dan 230 uur: cap op 230.

## Geen Publieke Koppeling

Deze sprint wijzigt geen React-component, route, manifest of publieke berekeningsstatus. De publieke Toeslagenscan mag de nieuwe huurtoeslag-, kindgebonden-budget- en kinderopvangtoeslagbedragen pas tonen na een aparte Calculation Guardian-implementatie met regressietests en expliciete activatiecontrole.
