# Officiele bron- en regelspecificatie toeslagen 2026

Peildatum: 2026-07-20. Scope: voorbereidende bron- en regelspecificatie voor toekomstige euro-indicaties in de Toeslagenscan. Deze wijziging activeert geen bedragberekening in de publieke UI.

Machineleesbare data: `src/lib/financial-constants/allowance-calculation-rules-2026.ts`, geregistreerd als `allowance-calculation-rules-2026` met scenario `official-2026-prepared`.

## Bronbeleid

Alle waarden in deze specificatie komen uit primaire officiele Nederlandse bronnen:

| Bron | URL | Gewijzigd/gepubliceerd | Geldigheid | Gebruik |
|---|---|---:|---:|---|
| Dienst Toeslagen - proefberekening | https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen | HTML geraadpleegd 2026-07-20 | 2026 | Officiele controle- en fallbackroute |
| Dienst Toeslagen - zorgtoeslag voorwaarden | https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/kan-ik-zorgtoeslag-krijgen | HTML `DCTERMS.modified` 2026-07-16 | 2026 | Leeftijd, verzekering, inkomen, vermogen |
| Dienst Toeslagen - zorgtoeslag bedragen | https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/hoeveel-zorgtoeslag | HTML `DCTERMS.modified` 2026-07-16 | 2026 | Maandtabel zorgtoeslag |
| Dienst Toeslagen - huurtoeslag voorwaarden | https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen | HTML `DCTERMS.modified` 2026-07-16 | 2026 | Huurder, zelfstandige woning, vermogen |
| Dienst Toeslagen - huurtoeslag verandert 2026 | https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/huurtoeslag-verandert-vanaf-2026 | HTML `DCTERMS.modified` 2026-07-16 | Vanaf 2026 | Geen harde maximale huurgrens, berekeningsgrenzen |
| Dienst Toeslagen - kindgebonden budget voorwaarden | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kindgebonden-budget/voorwaarden/voorwaarden-kindgebonden-budget | HTML geraadpleegd 2026-07-20 | 2026 | Kinderen, kinderbijslag, inkomen, vermogen |
| Dienst Toeslagen - kindgebonden budget vermogen | https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-vermogen-kindgebonden-budget | HTML `DCTERMS.modified` 2026-07-16 | 2026 | Vermogensgrenzen |
| Dienst Toeslagen - veranderingen toeslagen 2026 | https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen-2026/topics/veranderingen-toeslagen-2026 | HTML `DCTERMS.modified` 2026-07-16 | 2026 | Wijzigingsgrenzen kindgebonden budget |
| Dienst Toeslagen - kinderopvangtoeslag voorwaarden | https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/kan-ik-kinderopvangtoeslag-krijgen | HTML geraadpleegd 2026-07-20 | 2026 | Registratie, arbeid/traject, uren |
| Dienst Toeslagen - maximale uurprijs kinderopvangtoeslag | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/maximaal-uurtarief-voor-de-kinderopvang | HTML `DCTERMS.modified` 2026-07-16 | 2026 | Maximaal uurtarief |
| Dienst Toeslagen - berekening kindgebonden budget 2026 | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/themaoverstijgend/brochures_en_publicaties/berekening-kindgebonden-budget-2026 | HTML/PDF-link geraadpleegd 2026-07-20 | 2026 | Nog te normaliseren volledige formule |
| Dienst Toeslagen - berekening kinderopvangtoeslag | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/themaoverstijgend/brochures_en_publicaties/berekening-kinderopvangtoeslag | HTML/PDF-link geraadpleegd 2026-07-20 | 2026 | Nog te normaliseren vergoedingstabel |

Geen secundaire bronnen, commerciele calculators, banken, Nibud, nieuwsmedia, blogs of fora zijn gebruikt.

## Zorgtoeslag

### Recht en uitsluitingen

Wettelijke/uitvoeringsregel, officiele bron: Dienst Toeslagen, voorwaarden zorgtoeslag.

| Regel | Waarde 2026 | Ingang | Einde | Doelgroep | Uitzonderingen/overgang | Implementatie-impact |
|---|---:|---:|---:|---|---|---|
| Minimumleeftijd | 18 jaar | 2026-01-01 | 2026-12-31 | Aanvrager zorgtoeslag | Start rond 18e verjaardag en verzekeringsstart zijn maandregels | Hard exclusion als jonger dan 18; maand-start apart testen |
| Nederlandse zorgverzekering | verplicht | 2026-01-01 | 2026-12-31 | Aanvrager | Buitenland/residentie en verdragsgevallen blijven complex | Blocking input; geen veilige afleiding zonder bevestiging |
| Maximaal toetsingsinkomen zonder partner | EUR 40.857 | 2026-01-01 | 2026-12-31 | Geen toeslagpartner | Toetsingsinkomen wordt officieel vastgesteld | Hard exclusion boven grens; grenswaarden testen |
| Maximaal gezamenlijk toetsingsinkomen met partner | EUR 51.142 | 2026-01-01 | 2026-12-31 | Met toeslagpartner | Partnerstatus/deeljaarpartner kan bedrag wijzigen | Hard exclusion boven grens; partnerstatus blocking |
| Maximaal vermogen zonder partner | EUR 146.011 op 2026-01-01 | 2026-01-01 | 2026-12-31 | Geen toeslagpartner | Bijzonder vermogen en kindervermogen kunnen meetellen | Hard exclusion boven grens |
| Maximaal gezamenlijk vermogen met partner | EUR 184.633 op 2026-01-01 | 2026-01-01 | 2026-12-31 | Met toeslagpartner | Bijzonder vermogen blijft complex | Hard exclusion boven grens |

### Officiele berekening

Dienst Toeslagen publiceert voor 2026 maandtabellen. De dataset bevat de volledige publieke tabel:

- zonder toeslagpartner: EUR 129 per maand bij toetsingsinkomen tot EUR 29.500, aflopend naar EUR 6 bij EUR 40.500 en EUR 0 vanaf tabelrij EUR 41.000 en meer;
- met toeslagpartner: EUR 246 per maand bij gezamenlijk toetsingsinkomen tot EUR 29.500, aflopend naar EUR 3 bij EUR 51.000 en EUR 0 vanaf tabelrij EUR 51.500 en meer.

Implementatiebesluit voor de Calculation Guardian: gebruik de tabel alleen als `official-table-lookup` wanneer het invoerinkomen exact past binnen de tabeldefinitie `toetsingsinkomen tot`. Als later de wettelijke formule wordt toegevoegd, moet een regressietest aantonen dat formule en tabel bij tabelgrenzen dezelfde maandbedragen geven.

### Minimale invoer

Verplicht voor euro-indicatie: berekeningsjaar, leeftijd/geboortedatum, Nederlandse zorgverzekering, toeslagpartnerstatus, toetsingsinkomen of gezamenlijk toetsingsinkomen, vermogen op 1 januari 2026 of gezamenlijk vermogen.

Optioneel: maandstart na 18e verjaardag, deeljaarpartner, buitenland/residentie, bijzonder vermogen.

Blocking: onbekende partnerstatus, onbekend toetsingsinkomen, onbekend vermogen rond grens, onbekende verzekering.

Veilig inferable: geen. Alleen kinderaanwezigheid of partneractiviteit uit andere domeinen is elders beperkt inferable; zorgverzekering en toetsingsinkomen niet.

### Testvectors

| ID | Input | Verwachte uitkomst | Bron |
|---|---|---|---|
| `healthcare-single-income-29500` | Geen partner, inkomen EUR 29.500, vermogen 0, 18+, verzekerd | EUR 129 per maand, EUR 1.548 per jaar | Zorgtoeslagtabel 2026 |
| `healthcare-partners-income-51000` | Partner, gezamenlijk inkomen EUR 51.000, vermogen 0, 18+, verzekerd | EUR 3 per maand, EUR 36 per jaar | Zorgtoeslagtabel 2026 |
| `healthcare-single-income-41000` | Geen partner, inkomen EUR 41.000 | EUR 0, hard exclusion op inkomensgrens | Inkomensgrens en tabel |

## Huurtoeslag

### Recht en uitsluitingen

| Regel | Waarde 2026 | Ingang | Einde | Doelgroep | Uitzonderingen/overgang | Implementatie-impact |
|---|---:|---:|---:|---|---|---|
| Aanvrager huurt woning | ja | 2026-01-01 | 2026-12-31 | Huurders | Onderhuur en bijzondere woonvormen complex | Hard exclusion bij eigenaar/niet-huur |
| Zelfstandige woning | ja | 2026-01-01 | 2026-12-31 | Huurders | Aangewezen/onzelfstandige woonruimte complex | Blocking input |
| Vermogen per bewoner | EUR 38.479 op 2026-01-01 | 2026-01-01 | 2026-12-31 | Iedere bewoner | Minderjarig thuiswonend kind telt mee bij vermogen | Hard exclusion per bewoner |
| Vermogen partners samen | EUR 76.958 op 2026-01-01 | 2026-01-01 | 2026-12-31 | Toeslagpartners | Echtgenoot/geregistreerd partner niet op adres telt anders voor huurtoeslag dan andere toeslagen | Partner/medebewonerregels apart modelleren |
| Geen harde maximale huurgrens voor recht | vanaf 2026 | 2026-01-01 | onbekend | Huurders | Hoogte wordt wel begrensd in berekening | UI mag huur niet blokkeren boven grens |
| Berekeningsgrens huur | EUR 932,93 per maand | 2026-01-01 | 2026-12-31 | Berekening huurtoeslag | Bij lagere huur wordt werkelijke huur gebruikt | Cap in bedragengine, niet als rechtgrens |
| Berekeningsgrens jongeren tot 21 | EUR 498,20 per maand | 2026-01-01 | 2026-12-31 | Jongeren < 21 | Jongeren 21/22 vallen vanaf 2026 niet meer onder lagere grens | Leeftijdsgrens testen |

### Officiele berekening

De publieke Dienst Toeslagen-uitleg meldt dat het maximale inkomen niet eenduidig is en afhangt van huurprijs, aantal personen in huishouden en leeftijd. De volledige formule moet daarom niet uit losse tekst worden gereconstrueerd.

Blockers voor euro-indicatie:

- basishuur/minimumbasishuur 2026;
- kwaliteitskorting;
- aftoppingsgrenzen;
- rekenhuurdefinitie inclusief subsidiabele servicekosten en maxima;
- medebewonerinkomen en -vermogen;
- bijzondere situaties zoals aangepaste woning, onderhuur en overlijden.

Totdat deze waarden uit officiele berekeningsdocumentatie zijn genormaliseerd, mag huurtoeslag alleen signal-only of met brede bandbreedte op basis van volledig gemodelleerde deelregels worden getoond.

### Minimale invoer

Verplicht voor euro-indicatie: leeftijd, huurstatus, zelfstandige woning, kale huur, subsidiabele servicekosten, rekenhuur, toeslagpartnerstatus, medebewoners, huishoudinkomen, huishoudvermogen op 1 januari 2026.

Blocking: zelfstandige woonruimte onbekend, alleen totaalhuur zonder specificatie, medebewoners onbekend, huishoudinkomen onbekend, vermogen rond harde grens.

## Kindgebonden Budget

### Recht en uitsluitingen

| Regel | Waarde 2026 | Ingang | Einde | Doelgroep | Uitzonderingen/overgang | Implementatie-impact |
|---|---:|---:|---:|---|---|---|
| Kind jonger dan 18 | verplicht | 2026-01-01 | 2026-12-31 | Ouders/verzorgers | 16/17 zonder kinderbijslag kan uitzondering hebben | Leeftijdsarray per kind nodig |
| Kinderbijslag of uitzondering | verplicht | 2026-01-01 | 2026-12-31 | Ouders/verzorgers | Bijdrage in onderhoud, co-ouderschap, kind woont elders | Blocking/complex bij onbekend |
| Inkomen niet te hoog | situationeel | 2026-01-01 | 2026-12-31 | Huishouden | Hoogte hangt af van gezinssamenstelling | Geen harde algemene inkomensgrens uit publieke tekst |
| Maximaal vermogen zonder partner | EUR 146.011 | 2026-01-01 | 2026-12-31 | Geen toeslagpartner | Vermogen minderjarige kinderen telt mee | Hard exclusion |
| Maximaal vermogen met partner | EUR 184.633 | 2026-01-01 | 2026-12-31 | Met toeslagpartner | Partnerstatus complex | Hard exclusion |
| Wijzigingsgrens alleenstaande ouder | EUR 29.736 | 2026-01-01 | 2026-12-31 | Alleenstaande ouder | Dit is geen rechtgrens | Alleen toelichting, niet hard blokkeren |
| Wijzigingsgrens stellen | EUR 39.141 | 2026-01-01 | 2026-12-31 | Stellen | Dit is geen rechtgrens | Alleen toelichting, niet hard blokkeren |

### Officiele berekening

De officiele uitleg bevestigt afhankelijkheid van inkomen, gezinssituatie, aantal kinderen, leeftijden vanaf 12 en 16 jaar, en alleenstaande-ouderkop. Voor concrete bedragen is de berekening kindgebonden budget 2026 nodig. Die moet door de Calculation Guardian nog volledig worden genormaliseerd voordat euro-indicaties publiek verantwoord zijn.

Blockers:

- maximumbedragen per aantal kinderen;
- alleenstaande-ouderkop;
- leeftijdsverhogingen 12/16;
- afbouwpercentage en drempelinkomens;
- co-ouderschap, samengesteld gezin, pleeg-/stief-/adoptiekind en buitenlandse kinderen.

### Minimale invoer

Verplicht voor euro-indicatie: partnerstatus, toetsingsinkomen, vermogen op 1 januari 2026, aantal kinderen, leeftijd per kind, kinderbijslagstatus of uitzondering, woon-/zorgsituatie kind, alleenstaande ouder, co-ouderschap.

## Kinderopvangtoeslag

### Recht en uitsluitingen

| Regel | Waarde 2026 | Ingang | Einde | Doelgroep | Uitzonderingen/overgang | Implementatie-impact |
|---|---:|---:|---:|---|---|---|
| Geregistreerde kinderopvang | verplicht | 2026-01-01 | 2026-12-31 | Ouders met opvangkosten | LRK-registratie/startdatum controleren | Blocking zonder LRK/registratie |
| Eigen bijdrage/kosten betaald | verplicht | 2026-01-01 | 2026-12-31 | Ouders | Factuur/contract nodig | Blocking als onbekend |
| Kwalificerende activiteit aanvrager en partner | verplicht | 2026-01-01 | 2026-12-31 | Werk, studie, traject of inburgering volgens officiele regels | Erkenning traject/opleiding complex | Complex, niet stil afleiden |
| Maximaal aantal uren | 230 uur per kind per maand | 2026-01-01 | 2026-12-31 | Per kind | Werkurenkoppeling is afgeschaft in eerdere jaren, maar uurmaximum blijft | Cap per kind/per maand |
| Maximaal uurtarief dagopvang | EUR 11,23 | 2026-01-01 | 2026-12-31 | Dagopvang kindercentrum | Kosten boven cap tellen niet mee | Cap per contractregel |
| Maximaal uurtarief BSO | EUR 9,98 | 2026-01-01 | 2026-12-31 | Buitenschoolse opvang | Kosten boven cap tellen niet mee | Cap per contractregel |
| Maximaal uurtarief gastouderopvang | EUR 8,49 | 2026-01-01 | 2026-12-31 | Gastouderopvang | Kosten boven cap tellen niet mee | Cap per contractregel |

### Officiele berekening

Formuleconcept voor overdracht, nog niet activeren:

1. Bepaal per kind en opvangsoort de subsidiabele kosten: `min(betaald uurtarief, maximaal uurtarief opvangsoort) * min(uren, 230 per maand)`.
2. Sorteer kinderen volgens officiele eerste-kind/volgende-kindregels.
3. Pas het officiele vergoedingspercentage per toetsingsinkomen toe op eerste kind en volgende kinderen.
4. Sommeer maandbedragen en rond volgens officiele afrondingsregels.

Blocker: de 2026-vergoedingstabel per inkomen/eerste kind/volgende kinderen moet nog volledig uit de officiele berekening kinderopvangtoeslag worden genormaliseerd.

### Minimale invoer

Verplicht voor euro-indicatie: partnerstatus, toetsingsinkomen, kinderen met opvang, opvangsoort per kind, LRK/registratie, contract/factuururen per maand, betaald uurtarief, eigen bijdrage, kwalificerende activiteit aanvrager en partner.

## Weet Ik Niet-Routes

| Gegeven | Vervolgvragen | Veilig afleidbaar | Bevestiging nodig | Blocking wanneer |
|---|---|---|---|---|
| Toeslagpartner | Gehuwd/geregistreerd partner; samen kind; samen woning; pensioenregeling; vorig jaar toeslagpartner | Alleen als alle officiele triggers expliciet ontkend zijn | Altijd | Triggers onbekend blijven |
| Toetsingsinkomen | Jaarinkomen; loonstrook/uitkering; aangifte/voorlopige aanslag; wijzigingen dit jaar | Alleen als gebruiker maandbedragen en jaarcomponenten bevestigt | Altijd | Wisselend inkomen zonder bandbreedte |
| Vermogen | Saldo 2026-01-01; spaargeld/beleggingen; schulden; vermogen minderjarige kinderen | Niet veilig zonder peildatum | Altijd | Rond harde grens onbekend |
| Zelfstandige woonruimte | Eigen voordeur; eigen keuken; eigen toilet; gedeelde voorzieningen | Soms via alle kenmerken samen | Altijd | Kernkenmerken onbekend |
| Kale huur/rekenhuur | Huurcontract; kale huur; subsidiabele servicekosten; totaalhuur | Alleen uit gesplitste bedragen | Altijd | Alleen totaalhuur bekend |
| Medebewoners | Ingeschreven personen; onderhuurder; kind; partner | Niet volledig veilig uit adresaantal | Altijd | Inkomen/vermogen medebewoner onbekend |
| Geregistreerde kinderopvang | LRK-nummer; contract; factuur; opvangsoort | Niet uit factuurbedrag alleen | Altijd | LRK/registratie onbekend |
| Opvanguren/uurtarief | Contracturen; factuururen; uurtarief per soort; wijzigingen per maand | Alleen uit bevestigde contract/factuur | Altijd | Uren of tarief ontbreken |
| Eerste en volgende kind | Kinderen met opvang; kosten per kind; officiele volgorderegel | Pas na alle kinderen en kosten bekend | Altijd | Meerdere kinderen zonder kosten/uren per kind |

## Vraag Naar Regel Naar Berekening Naar Bron Naar Uitleg

| Vraag | Regel | Berekening | Bron | Uitleg voor gebruiker |
|---|---|---|---|---|
| Heb je een toeslagpartner? | Gezamenlijke inkomens- en vermogensgrenzen | Kies single/partner-pad | Dienst Toeslagen partneruitleg en toeslagpagina's | Een toeslagpartner telt mee voor inkomen en vermogen. Dit kan je bedrag verhogen, verlagen of uitsluiten. |
| Wat is je toetsingsinkomen? | Inkomen bepaalt afbouw/uitsluiting | Zorgtoeslagtabel of latere formule | Dienst Toeslagen bedragen/inkomen | Gebruik je verwachte inkomen over heel 2026, niet alleen je maandloon. |
| Wat was je vermogen op 1 januari 2026? | Harde vermogenstoets | Vergelijk met grens per toeslag | Dienst Toeslagen vermogenpagina's | Het gaat om bezittingen min schulden op 1 januari. |
| Huur je een zelfstandige woning? | Huurtoeslagvoorwaarde | Hard exclusion of vervolgvragen | Dienst Toeslagen huurtoeslagvoorwaarden | Zelfstandig betekent meestal eigen toegang, keuken en toilet. |
| Wat is je kale huur en servicekosten? | Rekenhuur | Nog te normaliseren huurtoeslagformule | Dienst Toeslagen huurtoeslag 2026 | De berekening gebruikt niet altijd je totale betaling; servicekosten moeten gesplitst worden. |
| Ontvang je kinderbijslag? | Kindgebonden budgetvoorwaarde | Hard exclusion of uitzondering | Dienst Toeslagen kindgebonden budget | Meestal is kinderbijslag nodig, maar sommige 16/17-situaties vragen officiele controle. |
| Is de opvang geregistreerd? | Kinderopvangtoeslagvoorwaarde | Hard exclusion of blocking | Dienst Toeslagen kinderopvangtoeslag | Controleer het LRK-nummer op contract of factuur. |
| Wat zijn uren en uurtarief? | Kinderopvangkosten en caps | Uren * min(tarief, maximum) * percentage | Dienst Toeslagen maximale uurprijs en berekening | Kosten boven het maximumuurtarief tellen niet mee. |

## Onzekerheden En Blockers

- Huurtoeslag: volledige 2026-formule en tabellen zijn nog niet machineleesbaar genormaliseerd.
- Kindgebonden budget: volledige 2026-bedragen, afbouw en leeftijdsverhogingen zijn nog niet machineleesbaar genormaliseerd.
- Kinderopvangtoeslag: vergoedingstabel 2026 per inkomen/eerste kind/volgende kinderen is nog niet machineleesbaar genormaliseerd.
- Deeljaarregels, start-/eindmaanden, verhuizing, geboorte, 18e verjaardag, wijzigende partnerstatus en wisselende opvanguren vereisen aparte tijdvakmodellering.
- Buitenland, verblijfstitel, co-ouderschap, samengesteld gezin, bijzondere woonvormen, onderhuur en afwijkende vermogenssituaties blijven officiele-controlegevallen totdat de uitzonderingsregels volledig zijn vastgelegd.

## Benodigde Tests Voor Calculation Guardian

- Schema: iedere bronwaarde heeft `regulationId`, `calculationYear`, `value`, `unit`, `validFrom`, `validUntil`, `reviewedAt`, `officialSourceTitle`, `officialSourceUrl`, `sourceSection`, `verificationStatus` en interpretatietoelichting.
- Registry: `allowance-calculation-rules-2026` selecteert alleen in 2026 en overlapt niet met andere calculation-rules-scenario's.
- Zorgtoeslag: tabelgrenzen zonder partner en met partner, inkomen net onder/op/boven grens, vermogen net onder/op/boven grens, leeftijd 17/18.
- Huurtoeslag: vermogen per bewoner, partnervermogen, jongerengrens <21 versus 21/22, huur boven EUR 932,93 mag niet als rechtgrens blokkeren.
- Kindgebonden budget: vermogen single/partner, kind 17 versus 18, geen kinderbijslag met en zonder uitzondering, co-ouderschap als complex.
- Kinderopvangtoeslag: maximumuurtarieven per opvangsoort, 230 uur cap, meerdere kinderen, tarief boven cap, ontbrekend LRK als blocking.
- Official vectors: minimaal de vier vectors in `ALLOWANCE_CALCULATION_RULES_2026.officialTestVectors` reproduceren.

## Implementatie-impact

Technische wijziging hoort bij de Financial Domain & Calculation Guardian:

- bouw een centrale pure allowance amount engine onder `src/lib/allowances` of een kleine adapter op de bestaande Regulations/Estimate Engine;
- gebruik `src/lib/financial-constants` als enige bron voor 2026-waarden;
- geef iedere euro-uitkomst als typed estimate met minimum/likely/maximum, confidence, bronjaar en action plan;
- laat React, PDF en app-logic geen berekeningen dupliceren;
- activeer publieke bedragen pas na volledige formule-normalisatie, regressietests en blueprint-check.
