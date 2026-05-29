Geld lenen & Financiering — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: geld-lenen-financiering
Aantal tools in dit invulblad: 17

Aflossingstermijnen lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/geld-lenen-aflossingstermijnen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het aflosschema van een lening: per maand de rente, aflossing, termijnbetaling en resterende schuld.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal P = leenbedrag, jaarRenteDecimal = rentePercentage / 100, r = jaarRenteDecimal / 12, n = looptijdJaren * 12 of ingevoerde looptijd in maanden. Stap 2: bij annuïtaire aflossing: maandbedrag = P * r / (1 - (1 + r)^(-n)); bij r = 0: maandbedrag = P / n. Stap 3: per maand: renteDeel = restschuldBegin * r, aflossingDeel = maandbedrag - renteDeel, restschuldEind = restschuldBegin - aflossingDeel. Stap 4: totalen: totaalBetaald = Σ maandbedrag, totaleRente = totaalBetaald - P.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Intern: rente per maand = rentePercentage / 100 / 12. Looptijd in jaren wordt omgerekend naar maanden met jaren * 12. Alle bedragen zijn euro’s.
4. Afrondingsregels
    INVUL: Intern rekenen met volledige precisie. Maandbedrag, rente, aflossing en restschuld tonen op 2 decimalen. Laatste termijn corrigeren: aflossingLaatste = restschuldBegin, termijnLaatste = renteLaatste + aflossingLaatste, zodat eindschuld exact € 0,00 wordt.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag: vaste maandelijkse termijn; totaleRente: totale rentekosten; totaalBetaald: totale som van alle maandtermijnen; aantalTermijnen: aantal maanden; eindRestschuld: moet 0 zijn.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met per maand: maandnummer, beginSchuld, renteDeel, aflossingDeel, termijnBedrag, eindSchuld. Optionele grafiek: daling restschuld en rente/aflossing per maand.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; termijnen als gehele maanden; totalen met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag leeg, niet-numeriek of <= 0 is ongeldig. Looptijd leeg, niet-numeriek of <= 0 is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.” / “De looptijd is te lang voor deze berekening.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, rente 6%, looptijd 12 maanden. Verwacht: maandbedrag circa € 860,66, totale rente circa € 327,97.
2. Edge-case
    INVUL: Leenbedrag € 12.000, rente 0%, looptijd 12 maanden. Verwacht: maandbedrag € 1.000, totale rente € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 100.000, rente 5%, looptijd 360 maanden. Verwacht: maandbedrag circa € 536,82.

Doorlopend krediet vergelijken

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/goedkoper-doorlopend-krediet.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken of een nieuw doorlopend krediet goedkoper is dan een bestaand doorlopend krediet, op basis van rente, maandbetaling en resterende schuld.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken voor bestaand en nieuw krediet afzonderlijk een maand-voor-maand aflosschema. Per krediet: r = jaarRentePercentage / 100 / 12; per maand rente = restschuldBegin * r; aflossing = maandbetaling - rente; restschuldEind = restschuldBegin - aflossing. Herhaal tot restschuld 0 is. Totalen: looptijdMaanden, totaalBetaald, totaleRente. Verschil: besparingRente = oudeTotaleRente - nieuweTotaleRente, besparingTotaal = oudTotaalBetaald - nieuwTotaalBetaald.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten en wordt per maand gedeeld door 12. Maandbetaling is euro per maand. Looptijd wordt berekend in maanden.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Maandbedragen en rente per maand op 2 decimalen tonen. Laatste maandbetaling wordt gecorrigeerd naar resterende schuld plus rente. Looptijd altijd naar boven afgerond op hele maanden.

Output-contract

1. Primaire outputs
    INVUL: oudeLooptijdMaanden, nieuweLooptijdMaanden, oudeTotaleRente, nieuweTotaleRente, besparingRente, besparingTotaal, adviesIndicatie.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijkingstabel oud versus nieuw; optioneel twee aflosschema’s; grafiek restschuld oud en nieuw over tijd.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als maanden of jaren + maanden; besparing positief tonen als voordeel.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Restschuld <= 0, maandbetaling <= 0, ontbrekende rente of niet-numerieke waarden zijn ongeldig. Als maandbetaling lager of gelijk is aan de eerste maandrente, wordt de lening niet afgelost en is invoer onvoldoende.
2. Domeinbeperkingen
    INVUL: maandbetaling > restschuld * maandRente; 0 <= rentePercentage <= 100; maximaal 2400 maanden om oneindige simulaties te voorkomen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige restschuld in.” / “De maandbetaling is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Oud: schuld € 10.000, rente 10%, maandbetaling € 250. Nieuw: schuld € 10.000, rente 6%, maandbetaling € 250. Verwacht: nieuw krediet heeft lagere totale rente en kortere looptijd.
2. Edge-case
    INVUL: Schuld € 10.000, rente 12%, maandbetaling € 100. Eerste maandrente € 100. Verwacht: foutmelding dat maandbetaling te laag is.
3. Regresstest tegen bekende uitkomst
    INVUL: Oud: € 5.000, 9%, € 200; nieuw: € 5.000, 5%, € 200. Verwacht: nieuwe totale rente lager dan oude totale rente.

Geld lenen kost geld

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/geld-lenen-kost-geld.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Inzicht geven in de totale kosten van een lening: hoeveel rente wordt betaald bovenop het geleende bedrag.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal P = leenbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bereken bij annuïtaire lening maandbedrag = P * r / (1 - (1 + r)^(-n)); bij r = 0: maandbedrag = P / n. Stap 3: totaalBetaald = maandbedrag * n, met laatste-termijncorrectie bij schema. Stap 4: kostenLening = totaalBetaald - P. Stap 5: kostenPercentageVanLening = kostenLening / P * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente via delen door 12. Looptijd in jaren omrekenen naar maanden via jaren * 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedrag en totalen op 2 decimalen. Kostenpercentage op 2 decimalen. Intern niet tussentijds afronden behalve voor getoonde tabel.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag, totaalBetaald, kostenLening, kostenPercentageVanLening, aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema; optionele grafiek totaal aflossing versus rente.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 12,34%; looptijd als maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag of looptijd leeg, niet-numeriek of <= 0 is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, rente 6%, looptijd 12 maanden. Verwacht: maandbedrag circa € 860,66, kosten lening circa € 327,97.
2. Edge-case
    INVUL: Leenbedrag € 10.000, rente 0%, looptijd 10 maanden. Verwacht: maandbedrag € 1.000, kosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 5.000, rente 12%, looptijd 24 maanden. Verwacht: maandbedrag circa € 235,37, totale kosten circa € 648,81.

Hoogte lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/hoogte-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk leenbedrag past bij een maandbedrag, rentepercentage en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal A = maandbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: leenbedrag = A * (1 - (1 + r)^(-n)) / r. Bij r = 0: leenbedrag = A * n. Stap 3: totaalBetaald = A * n; totaleRente = totaalBetaald - leenbedrag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten naar maandrente via delen door 12. Looptijd in jaren naar maanden via jaren * 12. Maandbedrag in euro per maand.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Leenbedrag en totalen op 2 decimalen. Maandbedrag op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: leenbedrag, maandbedrag, totaleRente, totaalBetaald, aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema op basis van berekende hoofdsom; optioneel grafiek restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Maandbedrag <= 0, looptijd <= 0, ontbrekende of niet-numerieke waarden zijn ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: maandbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief maandbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Maandbedrag € 860,66, rente 6%, looptijd 12 maanden. Verwacht: leenbedrag circa € 10.000.
2. Edge-case
    INVUL: Maandbedrag € 1.000, rente 0%, looptijd 12 maanden. Verwacht: leenbedrag € 12.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandbedrag € 536,82, rente 5%, looptijd 360 maanden. Verwacht: leenbedrag circa € 100.000.

Kopen op afbetaling

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/kopen-op-afbetaling.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat kopen op afbetaling werkelijk kost: maandtermijn, totaal betaald bedrag en meerkosten/rente ten opzichte van directe betaling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal aankoopbedrag, aanbetaling, kredietbedrag = aankoopbedrag - aanbetaling, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: maandtermijn = kredietbedrag * r / (1 - (1 + r)^(-n)). Bij r = 0: maandtermijn = kredietbedrag / n. Stap 3: totaalTermijnen = maandtermijn * n; totaalBetaald = aanbetaling + totaalTermijnen; meerkosten = totaalBetaald - aankoopbedrag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Maandrente = jaarrente / 12. Looptijd in maanden. Alle bedragen in euro.
4. Afrondingsregels
    INVUL: Maandtermijn en totalen op 2 decimalen. Laatste termijn corrigeren indien aflosschema wordt getoond. Meerkosten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kredietbedrag, maandtermijn, totaalBetaald, meerkosten, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel betaalschema per maand; vergelijking “nu betalen” versus “op afbetaling”.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; rente als 5,00%; looptijd als aantal maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aankoopbedrag <= 0, aanbetaling negatief, aanbetaling groter dan aankoopbedrag, looptijd <= 0 of niet-numerieke waarden zijn ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: aankoopbedrag > 0; 0 <= aanbetaling <= aankoopbedrag; looptijdMaanden > 0; 0 <= rentePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief aankoopbedrag in.” / “De aanbetaling mag niet hoger zijn dan het aankoopbedrag.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Aankoopbedrag € 1.200, aanbetaling € 0, rente 12%, looptijd 12 maanden. Verwacht: maandtermijn circa € 106,62, meerkosten circa € 79,46.
2. Edge-case
    INVUL: Aankoopbedrag € 1.200, aanbetaling € 1.200. Verwacht: kredietbedrag € 0, maandtermijn € 0, meerkosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aankoopbedrag € 2.000, aanbetaling € 500, rente 6%, looptijd 24 maanden. Verwacht: maandtermijn circa € 66,48.

Leasetermijn financial lease

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/leasetermijn-financial-lease.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maandelijkse leasetermijn bij financial lease op basis van aanschafwaarde, aanbetaling, slottermijn/restwaarde, rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: financiering = aanschafwaarde - aanbetaling. Stap 2: r = rentePercentage / 100 / 12, n = looptijdMaanden, S = slottermijn. Stap 3: contante waarde van slottermijn: PV_slot = S / (1 + r)^n. Stap 4: te annuïtiseren bedrag: basis = financiering - PV_slot. Stap 5: bij r > 0: leasetermijn = basis * r / (1 - (1 + r)^(-n)); bij r = 0: leasetermijn = (financiering - S) / n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is nominale jaarrente in procenten. Maandrente = jaarrente / 12. Looptijd in maanden. Bedragen exclusief of inclusief btw volgen UI-keuze, maar rekenkundig identiek.
4. Afrondingsregels
    INVUL: Leasetermijn op 2 decimalen. Totalen op 2 decimalen. Schema op centen. Laatste termijn corrigeert naar slottermijn/restschuld.

Output-contract

1. Primaire outputs
    INVUL: leasetermijnPerMaand, financieringsbedrag, slottermijn, totaalBetaald, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: leaseschema[] met maand, beginSchuld, rente, aflossing, termijn, eindSchuld. EindSchuld na laatste reguliere termijn moet gelijk zijn aan slottermijn.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aanschafwaarde <= 0, aanbetaling negatief, aanbetaling groter dan aanschafwaarde, slottermijn negatief, slottermijn groter dan financiering of looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: aanschafwaarde > 0; 0 <= aanbetaling <= aanschafwaarde; 0 <= slottermijn <= financiering; 0 <= rentePercentage <= 100; looptijdMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige aanschafwaarde in.” / “De aanbetaling mag niet hoger zijn dan de aanschafwaarde.” / “De slottermijn mag niet hoger zijn dan het financieringsbedrag.” / “Vul een positieve looptijd in.”

Testset

1. Basiscase
    INVUL: Aanschafwaarde € 30.000, aanbetaling € 5.000, slottermijn € 5.000, rente 6%, looptijd 60 maanden. Verwacht: maandtermijn circa € 406,65.
2. Edge-case
    INVUL: Aanschafwaarde € 12.000, aanbetaling € 0, slottermijn € 0, rente 0%, looptijd 12 maanden. Verwacht: maandtermijn € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Aanschafwaarde € 20.000, aanbetaling € 0, slottermijn € 5.000, rente 5%, looptijd 48 maanden. Verwacht: maandtermijn circa € 350,68.

Lening aflossen

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/lening-aflossen-restschuld.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel restschuld overblijft na een bepaalde periode van maandelijkse betalingen op een lening.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = beginschuld, A = maandbetaling, r = rentePercentage / 100 / 12, k = aantalBetaaldeMaanden. Stap 2: per maand: rente = restschuldBegin * r, aflossing = A - rente, restschuldEind = restschuldBegin - aflossing. Stap 3: herhaal k maanden. Stap 4: als maandbetaling groter is dan resterende schuld plus rente, corrigeer laatste betaling.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente in procenten naar maandrente via delen door 12. Periode wordt gerekend in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Getoonde maandwaarden op 2 decimalen. Restschuld na periode op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: restschuldNaPeriode, totaalBetaald, totaleRenteBetaald, totaalAfgelost, aantalMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] voor de doorgerekende maanden; optioneel grafiek restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; periode als maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Begingschuld <= 0, maandbetaling <= 0, rente leeg/niet-numeriek of periode negatief is ongeldig. Periode 0 is geldig en geeft beginschuld.
2. Domeinbeperkingen
    INVUL: Bij r > 0 moet maandbetaling > beginschuld * r om af te lossen; anders neemt schuld toe of blijft gelijk. Maximaal 2400 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve beginschuld in.” / “Vul een positief maandbedrag in.” / “De maandbetaling is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Beginschuld € 10.000, rente 6%, maandbetaling € 860,66, periode 6 maanden. Verwacht: restschuld circa € 5.076.
2. Edge-case
    INVUL: Beginschuld € 10.000, rente 0%, maandbetaling € 1.000, periode 3 maanden. Verwacht: restschuld € 7.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 12.000, rente 12%, maandbetaling € 1.066,19, periode 12 maanden. Verwacht: restschuld € 0.

Looptijd aflossing lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/looptijd-aflossing-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe lang het duurt om een lening af te lossen met een vast maandbedrag en rentepercentage.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = beginschuld, A = maandbetaling, r = rentePercentage / 100 / 12. Stap 2: bij r = 0: nExact = P / A. Bij r > 0: controleer A > P*r; vervolgens nExact = -ln(1 - P*r/A) / ln(1+r). Stap 3: aantalMaanden = ceil(nExact). Stap 4: bereken schema tot volledige aflossing; laatste betaling corrigeren naar resterende schuld plus rente.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente. Uitkomst in maanden, daarnaast tonen als jaren en maanden: jaren = floor(maanden/12), restMaanden = maanden % 12.
4. Afrondingsregels
    INVUL: Aantal maanden altijd naar boven afronden. Geldbedragen op 2 decimalen. Laatste termijn kan lager zijn dan vast maandbedrag.

Output-contract

1. Primaire outputs
    INVUL: aantalMaanden, looptijdJaren, looptijdRestMaanden, totaalBetaald, totaleRente, laatsteBetaling.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema[]; grafiek restschuld over tijd.
3. Formatregels voor UI
    INVUL: Looptijd als x jaar en y maanden; eurobedragen met 2 decimalen; rente met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Begingschuld <= 0, maandbetaling <= 0, rente leeg/niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: Bij rente > 0 moet maandbetaling > beginschuld * maandrente; maximaal 2400 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve beginschuld in.” / “Vul een positief maandbedrag in.” / “De maandbetaling is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Beginschuld € 10.000, rente 6%, maandbetaling € 860,66. Verwacht: looptijd 12 maanden.
2. Edge-case
    INVUL: Beginschuld € 12.000, rente 0%, maandbetaling € 1.000. Verwacht: looptijd 12 maanden.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 100.000, rente 5%, maandbetaling € 536,82. Verwacht: circa 360 maanden.

Maandbedrag voor aflossing lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/maandbedrag-aflossen-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk vast maandbedrag nodig is om een lening binnen een opgegeven looptijd af te lossen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = leenbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: maandbedrag = P * r / (1 - (1+r)^(-n)). Bij r = 0: maandbedrag = P / n. Stap 3: totaalBetaald = maandbedrag * n, totaleRente = totaalBetaald - P.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente. Looptijd in jaren naar maanden via jaren * 12, of direct aantal maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen. Totalen op 2 decimalen. Schema gebruikt laatste-termijncorrectie naar nul restschuld.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag, totaalBetaald, totaleRente, aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema; grafiek rente/aflossing per maand.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; rente als 5,00%; looptijd in maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag <= 0, looptijd <= 0, ontbrekende of niet-numerieke rente is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, rente 6%, looptijd 12 maanden. Verwacht: maandbedrag circa € 860,66.
2. Edge-case
    INVUL: Leenbedrag € 12.000, rente 0%, looptijd 12 maanden. Verwacht: maandbedrag € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 5.000, rente 12%, looptijd 24 maanden. Verwacht: maandbedrag circa € 235,37.

Maximale lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/maximale-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen welk maximaal leenbedrag past bij de beschikbare maandelijkse leencapaciteit, rentepercentage en looptijd. Dit is een generieke financiële berekening, geen wettelijke krediettoets.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal maandruimte = nettoInkomen - vasteLasten - minimaleLeefruimte of gebruik direct ingevoerd maximaalMaandbedrag. Stap 2: begrens maandruimte op minimaal 0. Stap 3: bepaal r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 4: bij r > 0: maximaleLening = maandruimte * (1 - (1+r)^(-n)) / r. Bij r = 0: maximaleLening = maandruimte * n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens en lasten worden per maand ingevoerd. Rente is jaarrente in procenten en wordt omgerekend naar maandrente. Looptijd in jaren wordt omgerekend naar maanden.
4. Afrondingsregels
    INVUL: Maandruimte en maximale lening op 2 decimalen. Eventueel maximale lening naar beneden afronden op hele euro’s voor conservatieve UI.

Output-contract

1. Primaire outputs
    INVUL: maximaleLening, maximaalMaandbedrag, maandruimte, looptijdMaanden, rentePercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema op basis van maximale lening; toelichting dat uitkomst indicatief is en geen kredietacceptatie of BKR-toets vervangt.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of maximale lening afgerond op hele euro’s; rente met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Als direct maandbedrag ontbreekt én inkomens/lasten onvoldoende zijn ingevuld, is invoer onvoldoende. Negatief inkomen, negatieve lasten of looptijd <= 0 is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: maandruimte > 0 vereist voor positieve lening. 0 <= rentePercentage <= 100; looptijdMaanden > 0; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief maandbedrag of voldoende inkomensgegevens in.” / “Er is geen maandelijkse ruimte om te lenen.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Maximaal maandbedrag € 250, rente 6%, looptijd 60 maanden. Verwacht: maximale lening circa € 12.931.
2. Edge-case
    INVUL: Maandruimte € 0, rente 6%, looptijd 60 maanden. Verwacht: maximale lening € 0 of melding “Er is geen maandelijkse ruimte om te lenen.”
3. Regresstest tegen bekende uitkomst
    INVUL: Maximaal maandbedrag € 1.000, rente 0%, looptijd 12 maanden. Verwacht: maximale lening € 12.000.

Persoonlijke lening vergelijken

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/persoonlijke-lening-vergelijken.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van twee persoonlijke leningen op maandbedrag, totale rente en totaal te betalen bedrag.
2. Exacte formules/stappenvolgorde
    INVUL: Voor lening A en B afzonderlijk: P = leenbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Bij r > 0: maandbedrag = P * r / (1 - (1+r)^(-n)); bij r = 0: maandbedrag = P / n. Daarna totaalBetaald = maandbedrag * n, totaleRente = totaalBetaald - P. Verschillen: verschilMaandbedrag, verschilTotaleRente, verschilTotaalBetaald.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten naar maandrente. Looptijd in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedragen en totalen op 2 decimalen. Verschillen op 2 decimalen. Goedkoopste lening bepalen op laagste totaalBetaald; bij gelijke totaalbedragen op laagste maandbedrag.

Output-contract

1. Primaire outputs
    INVUL: leningA.maandbedrag, leningA.totaleRente, leningA.totaalBetaald, leningB.maandbedrag, leningB.totaleRente, leningB.totaalBetaald, goedkoopsteOptie, besparing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijkingstabel lening A versus lening B; optioneel aflosschema’s en grafiek cumulatief betaald bedrag.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Voor beide leningen zijn leenbedrag, rente en looptijd nodig. Leenbedrag <= 0, looptijd <= 0, niet-numerieke waarden zijn ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul voor beide leningen een positief leenbedrag in.” / “Vul voor beide leningen een positieve looptijd in.” / “Vul geldige rentepercentages in.”

Testset

1. Basiscase
    INVUL: Lening A: € 10.000, 6%, 60 maanden; lening B: € 10.000, 8%, 60 maanden. Verwacht: lening A goedkoper.
2. Edge-case
    INVUL: Lening A en B zelfde bedrag, rente en looptijd. Verwacht: besparing € 0, geen financieel verschil.
3. Regresstest tegen bekende uitkomst
    INVUL: Lening A: € 5.000, 12%, 24 maanden; lening B: € 5.000, 6%, 24 maanden. Verwacht: B heeft lagere maandtermijn en lagere totale rente.

Rente bij lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/rente-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk rentepercentage hoort bij een lening op basis van leenbedrag, maandbedrag en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Los r numeriek op uit de annuïteitsformule: maandbedrag = P * r / (1 - (1+r)^(-n)). Bij benadering: gebruik binaire zoekmethode of Newton-Raphson voor maandrente r. Zoek r tussen 0 en bijvoorbeeld 100% / 12. JaarRenteDecimal = r * 12; jaarRentePercentage = jaarRenteDecimal * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Invoer: leenbedrag in euro, maandbedrag in euro per maand, looptijd in maanden. Output: nominale jaarrente in procenten. Intern wordt maandrente opgelost.
4. Afrondingsregels
    INVUL: Numeriek oplossen tot tolerantie 1e-10 voor maandrente of verschil in maandbedrag kleiner dan € 0,0001. Output rentepercentage met 3 decimalen of 2 decimalen in UI.

Output-contract

1. Primaire outputs
    INVUL: rentePercentagePerJaar, rentePercentagePerMaand, totaalBetaald, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema met gevonden rente; controle-maandbedrag.
3. Formatregels voor UI
    INVUL: Rente als 6,000% of 6,00%; eurobedragen met 2 decimalen; looptijd als maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag <= 0, maandbedrag <= 0, looptijd <= 0 of niet-numerieke waarden zijn ongeldig. Als maandbedrag * looptijd < leenbedrag, is rente negatief nodig; standaard ongeldig of melding dat gegevens niet passen bij positieve rente.
2. Domeinbeperkingen
    INVUL: maandbedrag >= leenbedrag / looptijd voor rente >= 0. Maximaal rentepercentage 100% per jaar tenzij UI anders toestaat.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positief maandbedrag in.” / “Vul een positieve looptijd in.” / “Deze combinatie past niet bij een positieve rente.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, maandbedrag € 860,66, looptijd 12 maanden. Verwacht: rente circa 6,00% per jaar.
2. Edge-case
    INVUL: Leenbedrag € 12.000, maandbedrag € 1.000, looptijd 12 maanden. Verwacht: rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 5.000, maandbedrag circa € 235,37, looptijd 24 maanden. Verwacht: rente circa 12,00%.

Rente in financial lease

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/rente-financial-lease.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk rentepercentage in een financial leasecontract besloten ligt op basis van financieringsbedrag, maandtermijn, looptijd en slottermijn.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: financiering = aanschafwaarde - aanbetaling. Stap 2: los maandrente r numeriek op uit: financiering = maandtermijn * (1 - (1+r)^(-n)) / r + slottermijn / (1+r)^n. Bij r = 0: controleformule financiering = maandtermijn * n + slottermijn. Stap 3: jaarRentePercentage = r * 12 * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandtermijn en slottermijn in euro. Looptijd in maanden. Output is nominale jaarrente in procenten, berekend uit maandrente.
4. Afrondingsregels
    INVUL: Numeriek oplossen met tolerantie 1e-10 voor maandrente. Rente tonen met 3 decimalen. Bedragen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: rentePercentagePerJaar, rentePercentagePerMaand, financieringsbedrag, totaalBetaald, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel leaseschema met gevonden rente; controle van contante waarde leasebetalingen.
3. Formatregels voor UI
    INVUL: Rente als 5,000%; eurobedragen met 2 decimalen; looptijd als maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aanschafwaarde <= 0, aanbetaling negatief, slottermijn negatief, maandtermijn <= 0, looptijd <= 0 of niet-numerieke waarden zijn ongeldig. Als financiering niet kan worden verklaard door betalingen bij rente >= 0, is invoer ongeldig of vereist negatieve rente.
2. Domeinbeperkingen
    INVUL: 0 <= aanbetaling <= aanschafwaarde; 0 <= slottermijn <= financiering; maandtermijn * n + slottermijn >= financiering voor rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige aanschafwaarde in.” / “Vul een positief maandtermijnbedrag in.” / “Deze combinatie past niet bij een positieve rente.” / “De slottermijn mag niet hoger zijn dan het financieringsbedrag.”

Testset

1. Basiscase
    INVUL: Aanschafwaarde € 20.000, aanbetaling € 0, slottermijn € 5.000, looptijd 48 maanden, maandtermijn circa € 350,68. Verwacht: rente circa 5,00%.
2. Edge-case
    INVUL: Financiering € 12.000, slottermijn € 0, looptijd 12, maandtermijn € 1.000. Verwacht: rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Aanschafwaarde € 30.000, aanbetaling € 5.000, slottermijn € 5.000, looptijd 60, maandtermijn circa € 406,65. Verwacht: rente circa 6,00%.

Restschuld bij financial lease

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/restschuld-financial-lease.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat de resterende schuld/restwaarde in een financial leasecontract is na een bepaald aantal betaalde maanden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: financiering = aanschafwaarde - aanbetaling. Stap 2: bereken maandtermijn zoals bij financial lease, of gebruik ingevoerde maandtermijn. Stap 3: simuleer k betaalde maanden: rente = restschuldBegin * r, aflossing = maandtermijn - rente, restschuldEind = restschuldBegin - aflossing. Stap 4: na volledige looptijd moet restschuld gelijk zijn aan slottermijn.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente via delen door 12. Looptijd en verstreken periode in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Restschuld, rente en aflossing op 2 decimalen. Laatste reguliere termijn corrigeert zodat eindschuld exact slottermijn is.

Output-contract

1. Primaire outputs
    INVUL: restschuldNaPeriode, betaaldeTermijnen, totaalBetaald, totaleRenteBetaald, totaleAflossing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: leaseschema[] tot opgegeven maand; grafiek restschuld over tijd.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; maanden als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ongeldige aanschafwaarde, aanbetaling, slottermijn, rente, looptijd of verstreken maanden is ongeldig. Verstreken maanden kleiner dan 0 of groter dan looptijd is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= verstrekenMaanden <= looptijdMaanden; 0 <= slottermijn <= financiering; 0 <= rentePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige aanschafwaarde in.” / “De verstreken periode moet binnen de looptijd liggen.” / “De slottermijn mag niet hoger zijn dan het financieringsbedrag.”

Testset

1. Basiscase
    INVUL: Aanschafwaarde € 20.000, aanbetaling € 0, slottermijn € 5.000, rente 5%, looptijd 48, verstreken 24 maanden. Verwacht: restschuld ligt tussen € 5.000 en € 20.000.
2. Edge-case
    INVUL: Verstreken maanden 0. Verwacht: restschuld gelijk aan financieringsbedrag.
3. Regresstest tegen bekende uitkomst
    INVUL: Financiering € 12.000, slottermijn € 0, rente 0%, looptijd 12, verstreken 6. Verwacht: restschuld € 6.000.

Restschuld lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/restschuld-lening-op-datum.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat de restschuld van een lening is op een specifieke datum of na een opgegeven aantal maanden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal aantal verstreken termijnen tussen startdatum en peildatum, of gebruik direct verstrekenMaanden. Stap 2: P = oorspronkelijkeLening, A = maandbedrag, r = rentePercentage / 100 / 12. Stap 3: simuleer per maand: rente = restschuldBegin * r, aflossing = A - rente, restschuldEind = restschuldBegin - aflossing. Stap 4: stop na verstreken termijnen of bij volledige aflossing.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Startdatum en peildatum worden omgerekend naar hele maandtermijnen. Rente is jaarrente naar maandrente. Bedragen in euro.
4. Afrondingsregels
    INVUL: Peildatum telt alleen volledige verstreken betalingstermijnen mee. Geldbedragen op 2 decimalen. Laatste betaling corrigeren als lening vóór peildatum volledig aflost.

Output-contract

1. Primaire outputs
    INVUL: restschuldOpPeildatum, verstrekenTermijnen, totaalBetaaldTotPeildatum, renteBetaaldTotPeildatum, afgelostTotPeildatum.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] tot peildatum; optioneel grafiek restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; datums als dd-mm-jjjj; rente met 2 decimalen; maanden als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Oorspronkelijke lening <= 0, maandbedrag <= 0, ongeldige datum of peildatum vóór startdatum is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: Peildatum moet op of na startdatum liggen. Maximaal 2400 termijnen. Bij rente > 0 moet maandbedrag groter zijn dan eerste maandrente.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige startdatum en peildatum in.” / “De peildatum mag niet vóór de startdatum liggen.” / “De maandbetaling is te laag om de lening af te lossen.”

Testset

1. Basiscase
    INVUL: Lening € 10.000, rente 6%, maandbedrag € 860,66, verstreken 6 maanden. Verwacht: restschuld circa € 5.076.
2. Edge-case
    INVUL: Peildatum gelijk aan startdatum. Verwacht: restschuld gelijk aan oorspronkelijke lening.
3. Regresstest tegen bekende uitkomst
    INVUL: Lening € 12.000, rente 0%, maandbedrag € 1.000, verstreken 6 maanden. Verwacht: restschuld € 6.000.

Studiefinanciering terugbetalen

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/studiefinanciering-terugbetalen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen hoe de studieschuld wordt terugbetaald: maandbedrag, looptijd, totale rente en eventuele resterende schuld na afloop. Wettelijke draagkrachtregels kunnen jaarlijks wijzigen en moeten parametriseerbaar zijn.
2. Exacte formules/stappenvolgorde
    INVUL: Generieke kern: schuld = beginschuld, r = rentePercentage / 100 / 12, n = terugbetaalTermijnJaren * 12. Als maandbedrag direct is ingevoerd: simuleer maand voor maand met rente = schuldBegin * r, aflossing = maandbedrag - rente, schuldEind = schuldBegin - aflossing. Als maandbedrag moet worden berekend: annuïtair maandbedrag = schuld * r / (1 - (1+r)^(-n)); bij r = 0: maandbedrag = schuld / n. Als draagkrachtmodule actief is: maandbedrag = min(annuïtairMaandbedrag, draagkrachtMaandbedrag).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten naar maandrente. Terugbetaaltermijn in jaren naar maanden. Inkomen en draagkrachtbedragen per maand of per jaar consistent omrekenen naar maandbedragen.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen. Studieschuld en rente op 2 decimalen. Looptijd in hele maanden. Laatste betaling corrigeren naar resterende schuld plus rente.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag, looptijdMaanden, looptijdJaren, totaalTerugbetaald, totaleRente, resterendeSchuldNaTermijn.
2. Secundaire outputs/tabellen/grafieken
    INVUL: terugbetaalschema[] per maand of per jaar; optioneel grafiek schuldontwikkeling. Bij draagkracht: annuïtairMaandbedrag, draagkrachtMaandbedrag, toegepastMaandbedrag.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd als jaren + maanden; duidelijke disclaimer “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, rente leeg/niet-numeriek, terugbetaaltermijn <= 0 of maandbedrag <= 0 bij directe invoer is ongeldig. Als draagkracht wordt berekend maar inkomen ontbreekt, is invoer onvoldoende.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rentePercentage <= 100; terugbetaalTermijnJaren > 0; maximale termijn bijvoorbeeld 35 jaar. Maandbedrag moet bij rente > 0 hoger zijn dan eerste maandrente om schuld te laten dalen, tenzij resterende schuld na termijn expliciet wordt toegestaan.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve studieschuld in.” / “Vul een geldige rente in.” / “Vul een geldige terugbetaaltermijn in.” / “Vul inkomensgegevens in om draagkracht te berekenen.” / “Het maandbedrag is te laag om de schuld af te lossen.”

Testset

1. Basiscase
    INVUL: Schuld € 30.000, rente 2%, termijn 35 jaar, annuïtair. Verwacht: maandbedrag circa € 99,38.
2. Edge-case
    INVUL: Schuld € 12.000, rente 0%, termijn 10 jaar. Verwacht: maandbedrag € 100.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 10.000, rente 6%, termijn 1 jaar. Verwacht: maandbedrag circa € 860,66.

Toename schuld

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/toename-schuld-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe een schuld toeneemt wanneer rente wordt bijgeschreven en er niet of onvoldoende wordt afgelost.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: schuld = beginschuld, r = rentePercentage / 100 / 12, A = maandbetaling, n = aantalMaanden. Stap 2: per maand: rente = schuldBegin * r, schuldNaRente = schuldBegin + rente, schuldEind = schuldNaRente - A. Stap 3: als A = 0: gesloten formule eindschuld = beginschuld * (1+r)^n. Stap 4: totale rente = som rente; schuldtoename = eindschuld - beginschuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente. Periode in maanden. Bedragen in euro. Maandbetaling kan 0 zijn.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Rente en schuld per maand op 2 decimalen tonen. Eindschuld en totale rente op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindschuld, schuldtoename, totaleRente, totaalBetaald, aantalMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: schuldSchema[] met maand, beginSchuld, rente, betaling, eindSchuld. Grafiek schuldontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente als 5,00%; maanden als geheel getal; schuldtoename positief tonen als stijging.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Beginschuld <= 0, rente leeg/niet-numeriek, periode <= 0 of maandbetaling negatief is ongeldig. Maandbetaling 0 is geldig.
2. Domeinbeperkingen
    INVUL: beginschuld > 0; aantalMaanden > 0; 0 <= rentePercentage <= 100; maandbetaling >= 0; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve beginschuld in.” / “Vul een geldig rentepercentage in.” / “Vul een positieve periode in.” / “De maandbetaling mag niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Beginschuld € 10.000, rente 12%, maandbetaling € 0, periode 12 maanden. Verwacht: eindschuld circa € 11.268,25.
2. Edge-case
    INVUL: Beginschuld € 10.000, rente 0%, maandbetaling € 0, periode 12 maanden. Verwacht: eindschuld € 10.000, schuldtoename € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 1.000, rente 12%, maandbetaling € 10, periode 12 maanden. Verwacht: eindschuld circa € 1.006,83.