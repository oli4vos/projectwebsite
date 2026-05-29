Hypotheek & wonen — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: hypotheek-wonen
Aantal tools in dit invulblad: 56

Actuele hypotheekrente

Bron-URL: https://www.externe-bron.nl/hypotheek/actuele-hypotheekrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Tonen en filteren van actuele hypotheekrentes op basis van rentevaste periode, hypotheekvorm, loan-to-value/risicoklasse, NHG-ja/nee en aanbieder. Dit is primair een datagedreven vergelijking, geen formuletool.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: laad rentetabel met velden aanbieder, rentePercentage, rentevastePeriodeJaren, hypotheekvorm, nhg, ltvVan, ltvTot, peildatum. Stap 2: filter op invoercriteria. Stap 3: sorteer standaard oplopend op rentePercentage. Stap 4: optioneel bereken indicatieve maandlast bij gekozen hypotheekbedrag: bij annuïtair maandlast = P * r / (1 - (1+r)^(-n)); bij aflossingsvrij maandrente = P * r; waarbij r = rentePercentage / 100 / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentepercentages zijn nominale jaarrentes. Voor maandlasten delen door 12. Rentevaste periode in jaren. LTV = hypotheekbedrag / woningwaarde * 100.
4. Afrondingsregels
    INVUL: Rente tonen met 2 of 3 decimalen. Maandlasten op 2 decimalen. LTV op 1 of 2 decimalen. Geen afronding gebruiken voor filterbeslissingen.

Output-contract

1. Primaire outputs
    INVUL: renteResultaten[] met aanbieder, rentePercentage, rentevastePeriodeJaren, hypotheekvorm, NHG, risicoklasse, peildatum; optioneel laagsteRente, gemiddeldeRente, aantalResultaten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel met renteaanbieders; optioneel maandlastindicatie per rente; grafiek rente per rentevaste periode.
3. Formatregels voor UI
    INVUL: Percentages als 4,25%; eurobedragen als € 1.234,56; peildatum als dd-mm-jjjj; sortering oplopend op rente.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende rentetabel of peildatum is onvoldoende. Onbekende rentevaste periode of hypotheekvorm is ongeldig. Woningwaarde <= 0 is ongeldig wanneer LTV wordt berekend.
2. Domeinbeperkingen
    INVUL: rentePercentage >= 0; rentevastePeriodeJaren > 0; 0 <= LTV <= 200; rentetabel moet actueel of expliciet gedateerd zijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Er zijn geen rentetarieven gevonden voor deze selectie.” / “Vul een geldige woningwaarde en hypotheek in.” / “De rentetabel ontbreekt of is niet actueel.”

Testset

1. Basiscase
    INVUL: Rentetabel met drie rentes 4,20%, 4,00%, 4,50% voor 10 jaar annuïtair NHG. Verwacht: resultaten gesorteerd met 4,00% als laagste rente.
2. Edge-case
    INVUL: Filter op combinatie zonder tarieven. Verwacht: lege resultaten en melding “Er zijn geen rentetarieven gevonden voor deze selectie.”
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 300.000, rente 4%, looptijd 360 maanden, annuïtair. Verwacht indicatieve maandlast circa € 1.432,25.

Aflosboete Wet Hillen

Bron-URL: https://www.externe-bron.nl/hypotheek/aflosboete-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel extra inkomstenbelasting ontstaat doordat de aftrek wegens geen of geringe eigenwoningschuld, bekend als Wet Hillen, wordt afgebouwd wanneer de eigenwoningschuld laag of nihil is.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken eigenwoningforfait = woningwaarde * ewfPercentage volgens jaartabel. Stap 2: bepaal aftrekbareRente = betaaldeHypotheekrente. Stap 3: positiefSaldoEigenWoning = max(0, eigenwoningforfait - aftrekbareRente). Stap 4: hillenAftrek = positiefSaldoEigenWoning * hillenAftrekPercentage uit jaartabel. Stap 5: belastbaarSaldoEigenWoning = positiefSaldoEigenWoning - hillenAftrek. Stap 6: belastingEffect = belastbaarSaldoEigenWoning * marginaalBelastingtariefEigenWoning.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Woningwaarde en rente zijn jaarbedragen in euro. Maandrente naar jaar via * 12. Percentages uit jaartabel delen door 100. Belastingtarief is jaarpercentage.
4. Afrondingsregels
    INVUL: Eigenwoningforfait, Hillen-aftrek en belastbaar saldo op hele euro’s of 2 decimalen afhankelijk van fiscale UI; standaard 2 decimalen. Belastingeffect op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eigenwoningforfait, aftrekbareRente, positiefSaldoEigenWoning, hillenAftrek, belastbaarSaldoEigenWoning, belastingEffect.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na afbouw Hillen; schema per jaar indien meerdere jaren worden gekozen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaar als viercijferig jaartal; duidelijke tekst “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde ontbreekt of < 0 is ongeldig. Ontbrekende jaartabel is onvoldoende. Betaalde rente < 0 is ongeldig. Belastingtarief ontbreekt is onvoldoende als belastingeffect wordt berekend.
2. Domeinbeperkingen
    INVUL: woningwaarde >= 0; aftrekbareRente >= 0; 0 <= hillenAftrekPercentage <= 100; 0 <= marginaalBelastingtarief <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige betaalde hypotheekrente in.” / “Voor dit jaar ontbreken de fiscale parameters.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 400.000, EWF 0,35%, rente € 0, Hillen-aftrek 80%, tarief 37%. Verwacht: EWF € 1.400, belastbaar saldo € 280, belastingeffect € 103,60.
2. Edge-case
    INVUL: Woningwaarde € 400.000, EWF € 1.400, rente € 2.000. Verwacht: positief saldo € 0, belastingeffect € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Woningwaarde € 300.000, EWF 0,5%, rente € 500, Hillen-aftrek 60%, tarief 40%. Verwacht: EWF € 1.500, positief saldo € 1.000, belastbaar € 400, belasting € 160.

Aflossingseis hypotheekrenteaftrek

Bron-URL: https://www.externe-bron.nl/hypotheek/aflossingseis-hypotheekrenteaftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Controleren of een eigenwoningschuld voldoet aan de fiscale aflossingseis voor hypotheekrenteaftrek door de werkelijke restschuld te vergelijken met het maximaal toegestane annuïtaire schuldverloop.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal oorspronkelijke eigenwoningschuld P, contractrente r = rentePercentage / 100 / 12, totale looptijd N = 360 maanden of ingevoerde fiscale looptijd. Stap 2: bereken normannuïteit A = P * r / (1 - (1+r)^(-N)); bij r = 0: A = P / N. Stap 3: bereken na k verstreken maanden de maximaal toegestane schuld via annuïtair schema of formule: normRestschuld = P*(1+r)^k - A*((1+r)^k - 1)/r; bij r = 0: normRestschuld = P - A*k. Stap 4: vergelijk werkelijkeRestschuld <= normRestschuld + tolerantie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Fiscale looptijd in jaren naar maanden via * 12. Rente is nominale jaarrente naar maandrente. Bedragen in euro.
4. Afrondingsregels
    INVUL: Normrestschuld intern exact berekenen. Vergelijking met tolerantie € 0,01 of instelbaar. Outputbedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: voldoetAanAflossingseis: boolean; normRestschuld; werkelijkeRestschuld; verschil; verstrekenMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Normatief aflosschema; vergelijking werkelijke schuld versus normschuld; optioneel grafiek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; boolean als “voldoet wel/niet”; maanden als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Oorspronkelijke schuld <= 0, negatieve werkelijke restschuld, ontbrekende rente of looptijd is ongeldig. Verstreken maanden < 0 of > fiscale looptijd is ongeldig.
2. Domeinbeperkingen
    INVUL: P > 0; 0 <= rentePercentage <= 100; 0 <= k <= N; N > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige oorspronkelijke schuld in.” / “Vul een geldige werkelijke restschuld in.” / “De verstreken periode ligt buiten de looptijd.”

Testset

1. Basiscase
    INVUL: Schuld € 100.000, rente 5%, looptijd 360 maanden, verstreken 12 maanden, werkelijke restschuld gelijk aan norm. Verwacht: voldoet true.
2. Edge-case
    INVUL: Verstreken 0 maanden, werkelijke restschuld € 100.000. Verwacht: normrestschuld € 100.000, voldoet true.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 10.000, rente 6%, looptijd 12 maanden, verstreken 6 maanden. Verwacht: normrestschuld circa € 5.076, werkelijke restschuld € 5.000 voldoet.

Aflossingsvrije hypotheek tussentijds aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/aflossingsvrije-hypotheek-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel maandelijkse rente en totale rentelast daalt wanneer tussentijds wordt afgelost op een aflossingsvrije hypotheek.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: oudeSchuld = hypotheekschuld, aflossing = extraAflossing, nieuweSchuld = max(0, oudeSchuld - aflossing). Stap 2: maandrenteOud = oudeSchuld * rentePercentage / 100 / 12. Stap 3: maandrenteNieuw = nieuweSchuld * rentePercentage / 100 / 12. Stap 4: besparingPerMaand = maandrenteOud - maandrenteNieuw. Stap 5: besparingTotEinde = besparingPerMaand * resterendeMaanden, eventueel netto na hypotheekrenteaftrek: nettoBesparing = besparingBruto * (1 - aftrekTarief).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente naar maandrente via / 12. Resterende looptijd in jaren naar maanden via * 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten en besparingen op 2 decimalen. Nieuwe schuld op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nieuweHypotheekschuld, oudeMaandrente, nieuweMaandrente, brutoBesparingPerMaand, brutoBesparingTotEinde, optioneel nettoBesparingPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na aflossing; optioneel grafiek rentelast over resterende looptijd.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 4,00%; looptijd in maanden of jaren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekschuld <= 0, rente ontbreekt/niet-numeriek of extra aflossing < 0 is ongeldig. Extra aflossing groter dan schuld wordt begrensd op schuld of als ongeldig gemarkeerd volgens UI-keuze.
2. Domeinbeperkingen
    INVUL: hypotheekschuld > 0; 0 <= extraAflossing <= hypotheekschuld; 0 <= rentePercentage <= 100; resterendeMaanden >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige extra aflossing in.” / “De extra aflossing mag niet hoger zijn dan de hypotheekschuld.”

Testset

1. Basiscase
    INVUL: Schuld € 200.000, rente 4%, aflossing € 20.000, resterend 10 jaar. Verwacht: maandelijkse bruto besparing € 66,67, totale bruto besparing € 8.000.
2. Edge-case
    INVUL: Extra aflossing € 0. Verwacht: besparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 100.000, rente 3%, aflossing € 10.000, resterend 12 maanden. Verwacht: besparing per maand € 25, totaal € 300.

Aftrekbare hypotheekrente berekenen

Bron-URL: https://www.externe-bron.nl/hypotheek/aftrekbare-hypotheekrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk deel van de betaalde hypotheekrente fiscaal aftrekbaar is, rekening houdend met eigenwoningschuld, niet-aftrekbare delen en eventuele eigenwoningreserve/bijleenregeling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal totaleBetaaldeRente. Stap 2: bepaal aftrekbareSchuld = min(totaleHypotheekschuld, kwalificerendeEigenwoningschuld). Stap 3: aftrekbaarPercentage = aftrekbareSchuld / totaleHypotheekschuld indien totale schuld > 0. Stap 4: aftrekbareRente = totaleBetaaldeRente * aftrekbaarPercentage. Stap 5: nietAftrekbareRente = totaleBetaaldeRente - aftrekbareRente.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente kan per maand of jaar worden ingevoerd; maandrente naar jaar via * 12. Schuld en rente in euro. Percentages intern als decimalen.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Aftrekbaar percentage met 4 decimalen intern, tonen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: aftrekbareRente, nietAftrekbareRente, aftrekbaarPercentage, kwalificerendeEigenwoningschuld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per leningdeel met schuld, rente, kwalificatie en aftrekbare rente.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaarbedragen duidelijk als jaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Totale hypotheekschuld <= 0 is ongeldig. Betaalde rente < 0 is ongeldig. Kwalificerende schuld ontbreekt is onvoldoende als aftrekbaar percentage niet direct wordt ingevoerd.
2. Domeinbeperkingen
    INVUL: totaleHypotheekschuld > 0; 0 <= kwalificerendeEigenwoningschuld <= totaleHypotheekschuld; betaaldeRente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige betaalde rente in.” / “Vul het aftrekbare deel van de eigenwoningschuld in.”

Testset

1. Basiscase
    INVUL: Totale schuld € 300.000, eigenwoningschuld € 240.000, betaalde rente € 12.000. Verwacht: aftrekbare rente € 9.600, niet-aftrekbaar € 2.400.
2. Edge-case
    INVUL: Eigenwoningschuld gelijk aan totale schuld. Verwacht: 100% rente aftrekbaar.
3. Regresstest tegen bekende uitkomst
    INVUL: Totale schuld € 200.000, eigenwoningschuld € 100.000, rente € 8.000. Verwacht: aftrekbaar € 4.000.

Annuïteit berekenen

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de vaste bruto maandlast van een annuïteitenhypotheek op basis van hypotheekbedrag, rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = hypotheekbedrag, r = rentePercentage / 100 / 12, n = looptijdJaren * 12. Stap 2: bij r > 0: annuiteit = P * r / (1 - (1+r)^(-n)). Bij r = 0: annuiteit = P / n. Stap 3: per maand: rente = restschuldBegin * r, aflossing = annuiteit - rente, restschuldEind = restschuldBegin - aflossing.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is nominale jaarrente; maandrente = jaarrente / 12. Looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen. Schema op centen. Laatste maand corrigeren naar restschuld nul.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, totaalBetaald, totaleRente, aantalMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met maand, rente, aflossing, restschuld. Grafiek rente/aflossing en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in jaren en maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: hypotheekbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 600 maanden of UI-parameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, rente 4%, looptijd 30 jaar. Verwacht: bruto maandlast circa € 1.432,25.
2. Edge-case
    INVUL: Hypotheek € 120.000, rente 0%, looptijd 10 jaar. Verwacht: maandlast € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht: maandlast circa € 536,82.

Banksparen Eigen Woning

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/banksparen-eigenwoning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke periodieke inleg nodig is om met banksparen voor de eigen woning een doelkapitaal op te bouwen, of welk eindkapitaal ontstaat bij gegeven inleg en rendement.
2. Exacte formules/stappenvolgorde
    INVUL: Bij benodigde inleg: PMT = doelKapitaal * r / ((1+r)^n - 1) bij inleg einde periode en r > 0; bij r = 0: PMT = doelKapitaal / n. Bij toekomstige waarde: FV = beginKapitaal*(1+r)^n + PMT * (((1+r)^n - 1)/r); bij r = 0: FV = beginKapitaal + PMT*n. Fiscale vrijstellingen en bandbreedte-eis alleen via jaartabelparameters toetsen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rendement/rente is jaarrente in procenten naar maandrente via / 12 bij maandelijkse inleg. Looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Inleg, eindkapitaal en rendement op 2 decimalen. Fiscale toetsbedragen op hele euro’s of volgens jaartabel.

Output-contract

1. Primaire outputs
    INVUL: benodigdeMaandinleg of eindKapitaal, doelKapitaal, totaalIngelegd, totaalRendement, looptijdMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: opbouwschema[] met maand, beginwaarde, inleg, rente, eindwaarde. Fiscale toetsing: vrijstelling, bandbreedte, looptijdseis.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Doelkapitaal of looptijd <= 0 is ongeldig bij inlegberekening. Rendement ontbreekt/niet-numeriek is ongeldig. BeginKapitaal of inleg < 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: looptijdMaanden > 0; 1+r > 0; rendement per periode groter dan -100%; fiscale parameters niet hardcoden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig doelkapitaal in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Doelkapitaal € 100.000, rente 4%, looptijd 30 jaar, maandelijkse inleg. Verwacht: benodigde inleg circa € 144,08.
2. Edge-case
    INVUL: Doelkapitaal € 12.000, rente 0%, looptijd 1 jaar. Verwacht: maandinleg € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Begin € 0, inleg € 100, rente 0%, looptijd 10 maanden. Verwacht: eindkapitaal € 1.000.

Boeterente berekenen

Bron-URL: https://www.externe-bron.nl/hypotheek/boeterente-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de vergoeding/boeterente bij vervroegd aflossen of oversluiten van een hypotheek tijdens de rentevaste periode.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: boetegrondslag = max(0, aflosBedrag - boetevrijBedrag). Stap 2: renteverschil = max(0, contractRente - vergelijkingsRente) / 100. Stap 3: bereken gemiste rente per maand: maandNadeel = boetegrondslag * renteverschil / 12. Stap 4: contante waarde over resterende rentevaste periode: boeterente = Σ maandNadeel / (1 + vergelijkingsRente/100/12)^m voor m = 1..resterendeMaanden.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentepercentages zijn jaarrentes. Resterende rentevaste periode in maanden. Boetevrij percentage van oorspronkelijke of actuele schuld volgens parameter: boetevrijBedrag = basisSchuld * boetevrijPercentage / 100.
4. Afrondingsregels
    INVUL: Boeterente op 2 decimalen. Renteverschil intern minimaal 8 decimalen. Per maand contant maken met volledige precisie.

Output-contract

1. Primaire outputs
    INVUL: boeterente, boetegrondslag, boetevrijBedrag, renteverschilPercentage, resterendeMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: boeteSchema[] met maand, renteverlies en contante waarde. Specificatie vrij aflosbaar bedrag.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; maanden als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aflosbedrag <= 0, contractrente ontbreekt, vergelijkingsrente ontbreekt of resterende maanden < 0 is ongeldig. Als vergelijkingsrente >= contractrente, boete € 0.
2. Domeinbeperkingen
    INVUL: 0 <= vergelijkingsRente; 0 <= contractRente; 0 <= boetevrijPercentage <= 100; resterendeMaanden >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig aflosbedrag in.” / “Vul geldige rentepercentages in.” / “Vul een geldige resterende rentevaste periode in.”

Testset

1. Basiscase
    INVUL: Aflosbedrag € 100.000, boetevrij € 0, contractrente 5%, vergelijkingsrente 3%, resterend 24 maanden. Verwacht: boete circa contante waarde van € 166,67 per maand tegen 3%.
2. Edge-case
    INVUL: Contractrente 3%, vergelijkingsrente 5%. Verwacht: boeterente € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Boetegrondslag € 100.000, renteverschil 2%, resterend 12 maanden, disconto 0%. Verwacht: boete € 2.000.

Boeterente in rentemiddeling

Bron-URL: https://www.externe-bron.nl/hypotheek/rentemiddeling-boeterente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk rente-opslagpercentage nodig is om de boeterente uit te smeren over een nieuwe rentevaste periode bij rentemiddeling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken boeterente volgens boeterenteformule. Stap 2: bepaal nieuwe periode n = nieuweRentevastePeriodeMaanden. Stap 3: bepaal annuïtaire of rente-only opslag. Eenvoudige opslag: opslagPerJaar = boeterente / hypotheekschuld / (n/12) * 100. Contante-waardevariant: los opslagMaand op zodat Σ hypotheekschuld * opslagMaand / (1+nieuweRente/100/12)^m = boeterente. Stap 4: nieuweGemiddeldeRente = marktrente + opslag + eventuele administratieOpslag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Boeterente in euro. Opslag als percentage per jaar. Nieuwe periode in maanden of jaren. Maandopslag naar jaaropslag via * 12 * 100.
4. Afrondingsregels
    INVUL: Boeterente op 2 decimalen. Rente-opslag en nieuwe rente op 3 decimalen. Maandlasten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: boeterente, renteOpslagPercentage, nieuweGemiddeldeRente, nieuweMaandlast, oudeMaandlast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie boete, opslag, marktrente, administratieopslag; vergelijking oud/nieuw.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentepercentages met 3 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekschuld <= 0, nieuwe periode <= 0, ontbrekende marktrente of boeterenteparameters zijn ongeldig. Bij boeterente 0 is opslag 0.
2. Domeinbeperkingen
    INVUL: hypotheekschuld > 0; nieuwePeriodeMaanden > 0; rente >= 0; opslag mag niet negatief zijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige nieuwe rentevaste periode in.” / “Vul geldige rentepercentages in.”

Testset

1. Basiscase
    INVUL: Boeterente € 6.000, schuld € 200.000, nieuwe periode 10 jaar, marktrente 3%. Eenvoudige opslag verwacht 0,300%, nieuwe rente 3,300%.
2. Edge-case
    INVUL: Boeterente € 0. Verwacht: opslag 0%, nieuwe rente = marktrente.
3. Regresstest tegen bekende uitkomst
    INVUL: Boeterente € 10.000, schuld € 250.000, periode 5 jaar. Verwacht eenvoudige opslag 0,800%.

Dalende risico opslag

Bron-URL: https://www.externe-bron.nl/hypotheek/risico-opslag-hypotheekrente-bij-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of extra aflossen of waardestijging leidt tot een lagere risicoklasse en rente-opslag, en wat de maandelijkse rentebesparing is.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken huidige LTV: huidigeLTV = huidigeHypotheekschuld / woningwaarde * 100. Stap 2: bepaal huidige risicoklasse uit tabel. Stap 3: bereken nieuwe schuld: nieuweSchuld = huidigeHypotheekschuld - extraAflossing. Stap 4: nieuweLTV = nieuweSchuld / woningwaarde * 100. Stap 5: bepaal nieuwe risicoklasse en rente-opslag. Stap 6: rentebesparingPerJaar = nieuweSchuld * (oudeRente - nieuweRente) / 100, of bij zelfde schuld zonder aflossing huidigeSchuld * renteverschil. Stap 7: maandbesparing = jaarbesparing / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: LTV in procenten. Rente/opslag als percentage per jaar. Maandbesparing = jaarbesparing / 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: LTV op 2 decimalen. Rente op 3 decimalen. Eurobedragen op 2 decimalen. Risicoklasse bepalen zonder afgeronde LTV.

Output-contract

1. Primaire outputs
    INVUL: huidigeLTV, nieuweLTV, huidigeRisicoklasse, nieuweRisicoklasse, oudeRente, nieuweRente, besparingPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Risicoklassen-tabel met grenzen en opslag; vergelijking vóór/na aflossing.
3. Formatregels voor UI
    INVUL: Percentages met 2 of 3 decimalen; eurobedragen met 2 decimalen; risicoklasse als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, hypotheekschuld < 0, extra aflossing < 0 of ontbrekende risicotabel is ongeldig/onvoldoende. Extra aflossing groter dan schuld is ongeldig.
2. Domeinbeperkingen
    INVUL: woningwaarde > 0; 0 <= hypotheekschuld; 0 <= extraAflossing <= hypotheekschuld; risicotabel moet de LTV-range afdekken.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige hypotheekschuld in.” / “De extra aflossing mag niet hoger zijn dan de hypotheekschuld.” / “Voor deze LTV ontbreekt een risicoklasse.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 400.000, schuld € 340.000, extra aflossing € 50.000, tabel: >80% opslag 0,4%, ≤80% opslag 0,1%. Verwacht: LTV van 85% naar 72,5%, opslag daalt met 0,3%.
2. Edge-case
    INVUL: Extra aflossing € 0, zelfde klasse. Verwacht: besparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 300.000, renteverschil 0,2%. Verwacht bruto jaarbesparing € 600, maand € 50.

Effectieve hypotheekrente

Bron-URL: https://www.externe-bron.nl/modules/wonen/effectievehypotheekrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de effectieve hypotheekrente op jaarbasis op basis van nominale rente en betalingsfrequentie.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nominaleRenteDecimal = nominaleRentePercentage / 100. Stap 2: m = betalingenPerJaar, standaard 12. Stap 3: effectieveRenteDecimal = (1 + nominaleRenteDecimal / m)^m - 1. Stap 4: effectieveRentePercentage = effectieveRenteDecimal * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Nominale rente is jaarrente in procenten. Betalingsfrequentie: maand = 12, kwartaal = 4, jaar = 1. Geen euroconversie.
4. Afrondingsregels
    INVUL: Effectieve rente tonen met 3 decimalen. Periode-rente met 4 decimalen. Intern volledige precisie.

Output-contract

1. Primaire outputs
    INVUL: effectieveHypotheekrentePercentage, nominaleHypotheekrentePercentage, betalingenPerJaar, rentePerPeriodePercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Geen tabel nodig; optioneel vergelijking nominale versus effectieve rente.
3. Formatregels voor UI
    INVUL: Percentages als 4,074%; frequentie als tekst of geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Rente leeg/niet-numeriek is ongeldig. Betalingen per jaar <= 0 is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: betalingenPerJaar >= 1; 1 + nominaleRenteDecimal / m > 0; standaard rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekrente in.” / “Vul een geldige betalingsfrequentie in.”

Testset

1. Basiscase
    INVUL: Nominale rente 4%, maandbetaling m=12. Verwacht: effectieve rente circa 4,074%.
2. Edge-case
    INVUL: Nominale rente 0%. Verwacht: effectief 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Nominale rente 6%, kwartaal m=4. Verwacht: effectief circa 6,136%.

Eigenwoningforfait

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/eigenwoningforfait.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het eigenwoningforfait als fiscale bijtelling voor de eigen woning op basis van WOZ-waarde en jaartabel.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal WOZ-waarde. Stap 2: zoek toepasselijke schijf in jaartabel met van, tot, percentage, eventueel vastBedrag. Stap 3: bereken eigenwoningforfait = vastBedrag + WOZWaarde * percentage / 100, of volgens schijfformule uit jaartabel. Stap 4: pas tijdsevenredigheid toe indien woning niet heel jaar eigen woning is: ewfTijdsevenredig = ewf * maandenEigenWoning / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: WOZ-waarde in euro. Percentage per jaar. Maanden eigen woning naar jaarfractie via / 12.
4. Afrondingsregels
    INVUL: Fiscale output op hele euro’s of 2 decimalen via parameter. Standaard 2 decimalen voor tool, hele euro’s voor aangifte-indicatie.

Output-contract

1. Primaire outputs
    INVUL: eigenwoningforfait, wozWaarde, toegepastPercentage, tijdsevenredigEigenwoningforfait.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toegepaste schijf uit jaartabel; eventueel vergelijking bij andere WOZ-waarden.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; percentages met 3 decimalen; jaar als viercijferig jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: WOZ-waarde ontbreekt of < 0 is ongeldig. Ontbrekende jaartabel is onvoldoende. Maanden eigen woning buiten 0-12 is ongeldig.
2. Domeinbeperkingen
    INVUL: wozWaarde >= 0; 0 <= maandenEigenWoning <= 12; jaartabel moet alle relevante schijven bevatten.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige WOZ-waarde in.” / “Kies een geldig belastingjaar.” / “Voor dit jaar ontbreken de eigenwoningforfaitpercentages.”

Testset

1. Basiscase
    INVUL: WOZ € 400.000, percentage 0,35%, 12 maanden. Verwacht: EWF € 1.400.
2. Edge-case
    INVUL: WOZ € 0. Verwacht: EWF € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: WOZ € 300.000, percentage 0,5%, 6 maanden. Verwacht: jaar EWF € 1.500, tijdsevenredig € 750.

Familiebank hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/familiebank-hypotheek-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maandlasten, renteaftrek en netto familie-effecten bij een hypotheeklening van familie in plaats van of naast een bank.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken annuïtaire of aflossingsvrije maandlast van familielening. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: maandrente = P*r. Stap 2: bereken betaalde rente per jaar. Stap 3: fiscaalVoordeelLener = aftrekbareRente * aftrekTarief. Stap 4: nettoLastLener = brutoBetaling - fiscaalVoordeel/12. Stap 5: brutoRenteOntvanger = betaaldeRente; optioneel belasting box 3/box 1 buiten kern via parameter. Stap 6: optionele schenking: nettoFamilieLast = nettoLastLener - schenkingPerMaand.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente naar maandrente. Looptijd in jaren naar maanden. Fiscale aftrek als percentage. Bedragen in euro per maand/jaar.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Jaarbedragen op 2 decimalen. Schema op centen, laatste termijn corrigeren.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlastLener, jaarlijkseRenteOntvanger, fiscaalVoordeelLener, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aflosschema; familie-cashflow-overzicht; optionele vergelijking met bankrente.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; fiscale uitkomsten als indicatief labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lening <= 0, rente ontbreekt/niet-numeriek, looptijd <= 0, aftrektarief buiten bereik is ongeldig. Rente 0% is geldig maar kan fiscaal/onzakelijk zijn; toon waarschuwing.
2. Domeinbeperkingen
    INVUL: P > 0; 0 <= rentePercentage <= 100; 0 <= aftrekTarief <= 100; looptijdMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig leenbedrag in.” / “Vul een geldige rente in.” / “Vul een positieve looptijd in.” / “Let op: de rente moet zakelijk zijn.”

Testset

1. Basiscase
    INVUL: Lening € 100.000, rente 4%, looptijd 30 jaar, annuïtair, aftrektarief 37%. Verwacht bruto maandlast circa € 477,42; eerste maandrente € 333,33.
2. Edge-case
    INVUL: Rente 0%, lening € 12.000, looptijd 12 maanden. Verwacht bruto maandlast € 1.000, fiscaal voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij € 100.000, rente 3%, aftrek 40%. Verwacht bruto rente per maand € 250, netto rentelast € 150.

Hoeveel eigen geld heeft u nodig

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/huis-kopen-hoeveel-eigen-geld.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel eigen geld nodig is om een woning te kopen, rekening houdend met koopprijs, maximale hypotheek en bijkomende kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: totaleAankoopkosten = koopprijs + kostenKoper + verbouwingskosten + overigeKosten. Stap 2: beschikbareFinanciering = maximaleHypotheek + eigenGeldBeschikbaar. Stap 3: benodigdEigenGeld = max(0, totaleAankoopkosten - maximaleHypotheek). Stap 4: tekortOfOverschot = eigenGeldBeschikbaar - benodigdEigenGeld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro. Kosten koper kunnen direct of als percentage van koopprijs worden ingevoerd: kosten = koopprijs * percentage / 100.
4. Afrondingsregels
    INVUL: Alle bedragen op 2 decimalen. Percentages met 2 decimalen. Eigen geld eventueel op hele euro’s afronden.

Output-contract

1. Primaire outputs
    INVUL: benodigdEigenGeld, totaleAankoopkosten, maximaleHypotheek, tekortOfOverschot.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie kosten koper: overdrachtsbelasting, notaris, advies, taxatie, NHG, verbouwing, overige kosten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; tekort negatief/rood of als tekst “tekort”; overschot als positief.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0 is ongeldig. Maximale hypotheek < 0 is ongeldig. Kosten of eigen geld negatief is ongeldig tenzij correctiepost expliciet negatief mag zijn.
2. Domeinbeperkingen
    INVUL: koopprijs > 0; maximaleHypotheek >= 0; kostenpercentages >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Vul een geldige maximale hypotheek in.” / “Kosten mogen niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, kosten koper € 20.000, maximale hypotheek € 400.000. Verwacht: benodigd eigen geld € 20.000.
2. Edge-case
    INVUL: Kosten koper € 0, maximale hypotheek gelijk aan koopprijs. Verwacht: eigen geld € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, kosten 6%, maximale hypotheek € 285.000. Verwacht: totale kosten € 318.000, benodigd eigen geld € 33.000.

Hogere maximale hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/hogere-maximale-hypotheek-met-renteconstructie.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of een renteconstructie, bijvoorbeeld rentekorting of rentedepot, leidt tot een hogere maximale hypotheek op basis van lagere toetslast.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal toegestaneMaandlast uit inkomen via financieringslastpercentage of directe invoer. Stap 2: bereken maximale hypotheek zonder constructie met toetsrente r1: P1 = maandlast * (1 - (1+r1)^(-n)) / r1. Stap 3: bereken maximale hypotheek met constructie met lagere toetsrente r2: P2 = maandlast * (1 - (1+r2)^(-n)) / r2. Stap 4: extraHypotheek = P2 - P1. Stap 5: begrens op marktwaarde/LTV indien van toepassing.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse toetsrente naar maandrente via /12. Looptijd in jaren naar maanden. Inkomen per jaar naar maand indien nodig via /12.
4. Afrondingsregels
    INVUL: Hypotheekbedragen op hele euro’s naar beneden afronden. Maandlasten op 2 decimalen. Percentages op 2 of 3 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheekZonderConstructie, maximaleHypotheekMetConstructie, extraHypotheek, toegestaneMaandlast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking rentetarieven, toetslasten en LTV-grens.
3. Formatregels voor UI
    INVUL: Eurobedragen als hele euro’s of 2 decimalen; rentepercentages met 2 decimalen; duidelijke indicatie “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Toegestane maandlast ontbreekt én inkomen/norm ontbreken is onvoldoende. Rente ontbreekt of negatief is ongeldig. Looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: maandlast > 0; 0 <= r2 <= r1 voor hogere-hypotheekscenario; looptijdMaanden > 0; LTV maximaal via parameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige toegestane maandlast of inkomensgegevens in.” / “Vul geldige rentetarieven in.” / “De looptijd moet positief zijn.”

Testset

1. Basiscase
    INVUL: Maandlast € 1.500, looptijd 30 jaar, rente zonder 5%, met 4%. Verwacht: maximale hypotheek met constructie hoger.
2. Edge-case
    INVUL: Rente zonder = rente met. Verwacht: extra hypotheek € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 1.000, looptijd 30 jaar, rente 0%. Verwacht maximale hypotheek € 360.000.

Huis onder water aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheek-aflossen-huis-onder-water.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe ver een woning onder water staat en welk effect extra aflossen heeft op restschuld, LTV en maandlasten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: onderWaterBedrag = max(0, hypotheekschuld - woningwaarde). Stap 2: huidigeLTV = hypotheekschuld / woningwaarde * 100. Stap 3: nieuweSchuld = hypotheekschuld - extraAflossing. Stap 4: nieuwOnderWaterBedrag = max(0, nieuweSchuld - woningwaarde). Stap 5: nieuweLTV = nieuweSchuld / woningwaarde * 100. Stap 6: rentebesparing aflossingsvrij: extraAflossing * rente / 100 / 12; annuïtair: herbereken maandlast op nieuwe schuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Woningwaarde en schuld in euro. LTV in procenten. Jaarlijkse rente naar maandrente via /12.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. LTV op 2 decimalen. Maandlasten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: onderWaterBedrag, nieuweOnderWaterBedrag, huidigeLTV, nieuweLTV, maandelijkseRentebesparing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na aflossing; optionele grafiek LTV-daling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; LTV als percentage; status “onder water” of “overwaarde”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, hypotheekschuld < 0, extra aflossing < 0 is ongeldig. Extra aflossing groter dan schuld ongeldig of begrenzen op schuld.
2. Domeinbeperkingen
    INVUL: woningwaarde > 0; hypotheekschuld >= 0; 0 <= extraAflossing <= hypotheekschuld.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige hypotheekschuld in.” / “De extra aflossing mag niet hoger zijn dan de hypotheekschuld.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 250.000, schuld € 300.000, extra aflossing € 20.000. Verwacht: onder water van € 50.000 naar € 30.000.
2. Edge-case
    INVUL: Woningwaarde € 300.000, schuld € 250.000. Verwacht: onder water € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 200.000, rente 3%, extra aflossing € 10.000, aflossingsvrij. Verwacht maandelijkse rentebesparing € 25.

Huren of kopen

Bron-URL: https://www.externe-bron.nl/modules/wonen/huren-of-kopen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van de financiële uitkomst van huren versus kopen over een gekozen periode.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1 huur: bereken per jaar huurkosten met stijging: huur_t = huur_0 * (1 + huurstijging)^t; totaal huur = som maandhuur * 12. Stap 2 koop: bereken hypotheeklasten, onderhoud, belastingen, verzekeringen, kosten koper en netto fiscale effecten per jaar. Stap 3 waarde woning: woningwaarde_t = koopprijs * (1 + waardestijging)^t. Stap 4 restschuld via hypotheekaflosschema. Stap 5 netto vermogenspositie kopen = woningwaarde - restschuld - verkoopkosten. Stap 6 vergelijk met huurvariant inclusief eventueel rendement op niet-gebruikt eigen geld: eindverschil = nettoVermogenKopen - nettoVermogenHuren.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandhuur naar jaar via *12. Jaarlijkse stijgingen als percentage. Hypotheekrente jaarrente naar maandrente. Periode in jaren.
4. Afrondingsregels
    INVUL: Jaarbedragen en eindvermogen op 2 decimalen. Schema jaarlijks. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleKostenHuren, totaleNettoKostenKopen, eindvermogenKopen, eindvermogenHuren, voordeelKopenOfHuren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse tabel huur/kopen; grafiek cumulatieve kosten en vermogenspositie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; eindadvies als “kopen voordeliger” of “huren voordeliger”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, huur < 0, periode <= 0, rente ontbreekt of negatieve kosten waar niet toegestaan zijn ongeldig. Ontbrekende fiscale parameters maken netto koopvariant onvoldoende.
2. Domeinbeperkingen
    INVUL: periodeJaren > 0; koopprijs > 0; huur >= 0; rendement/stijgingspercentages groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Vul een geldige huur in.” / “Vul een positieve vergelijkingsperiode in.” / “Voor netto berekening ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Huur € 1.000/mnd, periode 1 jaar, geen stijging. Verwacht huurkosten € 12.000.
2. Edge-case
    INVUL: Periode 0 jaar. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, waardestijging 0%, verkoopkosten 0, aflossingsvrij schuld € 300.000 na 1 jaar. Verwacht netto woningvermogen € 0 vóór kosten.

Hypotheek aflossen

Bron-URL: https://www.externe-bron.nl/modules/wonen/hypotheek-aflossen-of-niet.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken of extra aflossen op de hypotheek financieel gunstiger is dan het geld aanhouden of alternatief gebruiken.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken bruto rentebesparing: brutoBesparingPerJaar = extraAflossing * hypotheekrente / 100. Stap 2: netto besparing na hypotheekrenteaftrek: nettoBesparing = brutoBesparing * (1 - aftrekTarief). Stap 3: bereken alternatief rendement na belasting: nettoAlternatief = extraAflossing * alternatiefRendementNaBelasting / 100. Stap 4: voordeelAflossen = nettoBesparing - nettoAlternatief. Stap 5: optioneel effect box 3: vermogensrendementsheffingbesparing toevoegen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Percentages per jaar. Maandbesparing = jaarbesparing / 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Percentages met 2 decimalen. Vergelijking op jaarbasis.

Output-contract

1. Primaire outputs
    INVUL: nettoBesparingAflossenPerJaar, nettoAlternatiefRendementPerJaar, verschilPerJaar, verschilPerMaand, adviesIndicatie.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Scenariovergelijking over meerdere jaren; grafiek cumulatief voordeel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; advies als “aflossen voordeliger” of “alternatief voordeliger”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Extra aflossing <= 0, hypotheekrente ontbreekt/niet-numeriek, aftrektarief buiten bereik of alternatief rendement ontbreekt is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekTarief <= 100; extraAflossing <= hypotheekschuld; rendement groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige extra aflossing in.” / “Vul een geldige hypotheekrente in.” / “Vul een geldig alternatief rendement in.”

Testset

1. Basiscase
    INVUL: Aflossing € 10.000, hypotheekrente 4%, aftrek 37%, alternatief 1%. Verwacht netto aflosbesparing € 252, alternatief € 100, voordeel € 152/jaar.
2. Edge-case
    INVUL: Alternatief rendement gelijk aan netto hypotheekrente. Verwacht verschil € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossing € 20.000, rente 3%, aftrek 0%, alternatief 0%. Verwacht voordeel € 600/jaar.

Hypotheek aflossen in plaats van sparen

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheek-aflossen-ipv-sparen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van extra hypotheekaflossing met sparen tegen spaarrente, inclusief eventueel fiscaal effect.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nettoHypotheekrente = hypotheekrente * (1 - aftrekTarief). Stap 2: nettoSpaarrente = spaarrente * (1 - belastingdrukSparen) of direct ingevoerd. Stap 3: jaarVoordeelAflossen = bedrag * (nettoHypotheekrente - nettoSpaarrente) / 100. Stap 4: over meerdere jaren: cumulatiefVoordeel = Σ jaarVoordeel, eventueel met samengestelde spaargroei en dalende schuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar. Maandvoordeel = jaarvoordeel / 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Percentages met 2 decimalen. Cumulatieve uitkomst op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoHypotheekrentePercentage, nettoSpaarrentePercentage, voordeelAflossenPerJaar, voordeelAflossenPerMaand, besteKeuze.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Meerjarenschema en cumulatieve vergelijking sparen/aflossen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; keuze als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bedrag <= 0, rente ontbreekt/niet-numeriek of aftrektarief buiten 0-100 is ongeldig.
2. Domeinbeperkingen
    INVUL: bedrag > 0; bedrag <= hypotheekschuld; 0 <= aftrekTarief <= 100; spaarrente mag negatief zijn maar groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag in.” / “Vul geldige rentepercentages in.” / “De aflossing mag niet hoger zijn dan de hypotheekschuld.”

Testset

1. Basiscase
    INVUL: Bedrag € 10.000, hypotheekrente 4%, aftrek 37%, spaarrente 1%, belastingdruk sparen 0%. Verwacht: netto hypotheekrente 2,52%, voordeel € 152/jaar.
2. Edge-case
    INVUL: Netto spaarrente = netto hypotheekrente. Verwacht: voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bedrag € 20.000, hypotheekrente 3%, aftrek 0%, spaarrente 0%. Verwacht: voordeel € 600/jaar.

Hypotheek deels aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-aflossen-lagere-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of een gedeeltelijke aflossing leidt tot een lagere rente door een lagere risicoklasse, en wat het effect is op maandlasten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken nieuweSchuld = huidigeSchuld - extraAflossing. Stap 2: bereken huidige en nieuwe LTV. Stap 3: bepaal huidige en nieuwe rente uit risicoklassen. Stap 4: bereken maandlast oud en nieuw met hypotheekvorm. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: maandrente = P*r. Stap 5: maandbesparing = oudeMaandlast - nieuweMaandlast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. LTV in procenten. Looptijd in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten en besparing op 2 decimalen. LTV op 2 decimalen. Rente met 3 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nieuweSchuld, nieuweRente, oudeMaandlast, nieuweMaandlast, maandbesparing, nieuweLTV.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Risicoklassevergelijking en aflosschema voor oude/nieuwe situatie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2/3 decimalen; hypotheekvorm als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, woningwaarde <= 0, extra aflossing < 0, looptijd <= 0, ontbrekende rentetabel is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= extraAflossing <= huidigeSchuld; woningwaarde > 0; rentetabel moet LTV afdekken.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige woningwaarde in.” / “De extra aflossing mag niet hoger zijn dan de hypotheekschuld.”

Testset

1. Basiscase
    INVUL: Schuld € 300.000, woningwaarde € 400.000, aflossing € 20.000, rente daalt van 4% naar 3,8%, aflossingsvrij. Verwacht maandbesparing door schuld- en rentedaling.
2. Edge-case
    INVUL: Extra aflossing € 0, rente gelijk. Verwacht besparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij schuld € 100.000, aflossing € 10.000, rente blijft 3%. Verwacht rentelast van € 250 naar € 225, besparing € 25.

Hypotheek extra aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-aflossen-lagere-maandlasten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel de maandlast daalt door een extra aflossing, bij gelijkblijvende resterende looptijd en rente.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: oudeSchuld = huidigeSchuld; nieuweSchuld = huidigeSchuld - extraAflossing. Stap 2: bereken oude maandlast en nieuwe maandlast met resterende looptijd. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: maandrente = P*r. Stap 3: maandbesparing = oudeMaandlast - nieuweMaandlast. Stap 4: totaleBesparing = maandbesparing * resterendeMaanden of op basis van schema.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente. Resterende looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Besparingen op 2 decimalen. Laatste termijn in schema corrigeren.

Output-contract

1. Primaire outputs
    INVUL: nieuweHypotheekschuld, oudeMaandlast, nieuweMaandlast, maandbesparing, totaleBesparing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking oud/nieuw; optioneel aflosschema na extra aflossing.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden/jaren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, extra aflossing < 0, extra aflossing groter dan schuld, rente ontbreekt of looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= extraAflossing <= huidigeSchuld; rentePercentage >= 0; resterendeMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige extra aflossing in.” / “Vul een positieve resterende looptijd in.”

Testset

1. Basiscase
    INVUL: Annuïtair schuld € 300.000, rente 4%, resterend 30 jaar, aflossing € 30.000. Verwacht: nieuwe maandlast circa 90% van oude maandlast.
2. Edge-case
    INVUL: Extra aflossing € 0. Verwacht: maandbesparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij schuld € 100.000, rente 3%, aflossing € 10.000. Verwacht maandbesparing € 25.

Hypotheek maandlasten bij nieuwbouw

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-maandlasten-tijdens-bouw.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maandlasten tijdens de bouwperiode van een nieuwbouwwoning, rekening houdend met opgenomen bouwdepot, depotvergoeding en eventueel dubbele lasten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: per maand bepaal opgenomenHypotheek = somReedsBetaaldeTermijnen. Stap 2: bouwdepotRestant = totaleHypotheek - opgenomenHypotheek. Stap 3: teBetalenRente = opgenomenHypotheek * hypotheekrente / 100 / 12. Stap 4: depotRente = bouwdepotRestant * depotrente / 100 / 12. Stap 5: nettoBouwrenteLast = teBetalenRente - depotRente. Stap 6: tel eventueel huidige woonlasten op: totaleMaandlast = nettoBouwrenteLast + huidigeWoonlast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes zijn jaarrentes naar maandrente. Bouwschema per maand. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedragen op 2 decimalen. Cumulatieve kosten op 2 decimalen. Opnameschema zonder tussentijdse afronding voor berekening.

Output-contract

1. Primaire outputs
    INVUL: totaleKostenTijdensBouw, gemiddeldeMaandlast, hoogsteMaandlast, laatsteBouwmaandLast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: bouwSchema[] met maand, opgenomen hypotheek, bouwdepot, hypotheekrente, depotrente, netto last, totale woonlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentes met 2 decimalen; maandnummer of datum als periode.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente ontbreekt, bouwperiode <= 0, negatieve opnamebedragen of opname groter dan hypotheek is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= opgenomenHypotheek <= totaleHypotheek; 0 <= depotrente <= hypotheekrente meestal, maar niet verplicht; bouwperiode maximaal bijvoorbeeld 60 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een geldig bouwschema in.” / “Opnames uit het bouwdepot mogen niet hoger zijn dan de hypotheek.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, opgenomen maand 1 € 100.000, rente 4%, depotrente 2%, restant € 200.000. Verwacht netto bouwrente maand 1: € 333,33 - € 333,33 = € 0.
2. Edge-case
    INVUL: Hele hypotheek nog in depot, niets opgenomen. Verwacht te betalen rente € 0, depotvergoeding positief of netto negatieve last.
3. Regresstest tegen bekende uitkomst
    INVUL: Volledig opgenomen € 300.000, rente 4%, geen depot. Verwacht maandrente € 1.000.

Hypotheek maandlasten na rentewijziging

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten-rentewijziging.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe bruto en netto maandlasten veranderen wanneer de hypotheekrente wijzigt.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken oude bruto maandlast met oude rente en resterende looptijd. Stap 2: bereken nieuwe bruto maandlast met nieuwe rente en dezelfde resterende looptijd. Stap 3: bereken oude en nieuwe rentecomponent per jaar/maand. Stap 4: bereken fiscale aftrek: aftrek = aftrekbareRente * aftrekTarief. Stap 5: nettoMaandlast = brutoMaandlast - aftrek/12 + eigenwoningforfaitEffect/12. Stap 6: verschilNetto = nieuwNetto - oudNetto.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rentes naar maandrentes. Jaarlijkse fiscale bedragen naar maand via /12. Looptijd in maanden.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Fiscale jaarbedragen op 2 decimalen. Verschillen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: oudeBrutoMaandlast, nieuweBrutoMaandlast, oudeNettoMaandlast, nieuweNettoMaandlast, verschilBruto, verschilNetto.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Rente/aflossingsspecificatie vóór/na; optioneel grafiek maandlastontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentes met 2 decimalen; stijging positief tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, resterende looptijd <= 0, oude of nieuwe rente ontbreekt/niet-numeriek is ongeldig. Fiscale parameters ontbreken: netto is onvoldoende, bruto kan wel.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rente <= 100; resterendeMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul geldige rentepercentages in.” / “Voor netto maandlasten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Schuld € 300.000, looptijd 30 jaar, oude rente 3%, nieuwe rente 4%. Verwacht: nieuwe bruto maandlast hoger.
2. Edge-case
    INVUL: Oude rente gelijk aan nieuwe rente. Verwacht verschil € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 100.000, looptijd 30 jaar, rente 5%. Verwacht bruto maandlast circa € 536,82.

Hypotheek meenemen bij verhuizen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-meenemen-bij-verhuizen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het financiële effect van het meenemen van een bestaande hypotheekrente naar een nieuwe woning, vergeleken met volledig nieuwe financiering.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: meeTeNemenSchuld = min(bestaandeHypotheek, benodigdeNieuweHypotheek). Stap 2: nieuwTeFinancierenDeel = benodigdeNieuweHypotheek - meeTeNemenSchuld. Stap 3: bereken maandlast meegenomen deel met oude rente en resterende looptijd. Stap 4: bereken maandlast nieuw deel met actuele rente en looptijd. Stap 5: totaleMaandlastMeenemen = maandlastOudDeel + maandlastNieuwDeel. Stap 6: vergelijk met volledige nieuwe hypotheek: maandlastVolledigNieuw. Stap 7: voordeelPerMaand = maandlastVolledigNieuw - totaleMaandlastMeenemen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar naar maandrente. Looptijden in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Hypotheekdelen op 2 decimalen. Voordeel op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: meeTeNemenHypotheek, nieuwHypotheekdeel, maandlastMetMeenemen, maandlastVolledigNieuw, voordeelPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per leningdeel; vergelijking oude rente/nieuwe rente.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentes met 2 decimalen; looptijden in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Benodigde nieuwe hypotheek <= 0, bestaande hypotheek < 0, ontbrekende rente of looptijd is ongeldig. Als verhuisregeling niet toegestaan is, toon niet relevant.
2. Domeinbeperkingen
    INVUL: 0 <= bestaandeHypotheek; benodigdeNieuweHypotheek > 0; meeTeNemenSchuld <= benodigdeNieuweHypotheek.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige nieuwe hypotheek in.” / “Vul geldige gegevens van de bestaande hypotheek in.” / “Meenemen van de hypotheek is in deze situatie niet van toepassing.”

Testset

1. Basiscase
    INVUL: Nodig € 400.000, bestaande € 200.000 tegen 2%, nieuw deel tegen 4%. Verwacht maandlast met meenemen lager dan volledig nieuw.
2. Edge-case
    INVUL: Bestaande hypotheek € 0. Verwacht gelijk aan volledig nieuwe hypotheek.
3. Regresstest tegen bekende uitkomst
    INVUL: Meegenomen aflossingsvrij € 100.000, oude rente 2%, nieuwe rente 4%. Verwacht rentevoordeel € 166,67 per maand bruto.

Hypotheek oversluiten

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-oversluiten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of oversluiten van een hypotheek financieel voordelig is, rekening houdend met lagere rente, boeterente en oversluitkosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken oude maandlast op bestaande schuld, oude rente en resterende looptijd. Stap 2: bereken nieuwe maandlast op nieuwe schuld, nieuwe rente en looptijd. Stap 3: maandbesparing = oudeMaandlast - nieuweMaandlast. Stap 4: totaleOversluitkosten = boeterente + advieskosten + notariskosten + taxatiekosten + overigeKosten. Stap 5: terugverdientijdMaanden = totaleOversluitkosten / maandbesparing indien maandbesparing > 0. Stap 6: nettoVoordeelOverPeriode = maandbesparing * vergelijkingsMaanden - totaleOversluitkosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar naar maand. Looptijden in maanden. Kosten in euro. Fiscale effecten optioneel per jaar naar maand.
4. Afrondingsregels
    INVUL: Maandlasten en kosten op 2 decimalen. Terugverdientijd op 1 decimaal of hele maanden naar boven. Netto voordeel op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: oudeMaandlast, nieuweMaandlast, maandbesparing, totaleOversluitkosten, terugverdientijdMaanden, nettoVoordeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kostenoverzicht; vergelijking oud/nieuw; cumulatief voordeelgrafiek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; terugverdientijd als maanden en jaren; voordeel positief/groen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, rente ontbreekt, looptijd <= 0, kosten negatief of maandbesparing <= 0 maakt terugverdientijd niet relevant.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rente <= 100; kosten >= 0; vergelijkingsperiode > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Kosten mogen niet negatief zijn.” / “Oversluiten levert geen maandelijkse besparing op.”

Testset

1. Basiscase
    INVUL: Oude maandlast € 1.200, nieuwe € 1.000, kosten € 6.000. Verwacht terugverdientijd 30 maanden.
2. Edge-case
    INVUL: Maandbesparing € 0. Verwacht terugverdientijd niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: Besparing € 100/mnd, kosten € 2.400, periode 60 maanden. Verwacht terugverdientijd 24 maanden, netto voordeel € 3.600.

Hypotheek rentevaste periode

Bron-URL: https://www.externe-bron.nl/hypotheek/rentevaste-periodes-vergelijken.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van hypotheeklasten bij verschillende rentevaste periodes en bijbehorende rentepercentages.
2. Exacte formules/stappenvolgorde
    INVUL: Voor elke optie: r = rentePercentage / 100 / 12, n = looptijdMaanden. Bereken maandlast volgens hypotheekvorm. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: P*r. Bereken rentekosten gedurende rentevaste periode: som rentecomponenten voor rentevastePeriodeMaanden. Vergelijk maandlasten en cumulatieve kosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentevaste periode in jaren naar maanden. Rente per jaar naar maand. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Totale kosten op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: opties[] met rentevaste periode, rente, maandlast, totale rente binnen periode; goedkoopsteOpMaandlast; goedkoopsteOpTotaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijkingstabel en grafiek maandlast per rentevaste periode.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente als 4,00%; periode als 10 jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen opties is onvoldoende. Hypotheekbedrag <= 0, looptijd <= 0, ontbrekende rente is ongeldig.
2. Domeinbeperkingen
    INVUL: rentevastePeriodeMaanden <= looptijdMaanden; rente >= 0; minimaal één geldige optie.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Voeg minimaal één rentevaste periode toe.” / “Vul een geldig hypotheekbedrag in.” / “De rentevaste periode mag niet langer zijn dan de looptijd.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, looptijd 30 jaar, opties 10 jaar 4%, 20 jaar 4,5%. Verwacht: 10 jaar lagere maandlast.
2. Edge-case
    INVUL: Eén optie. Verwacht: die optie als goedkoopste.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht annuïteit € 536,82.

Hypotheek uit eigen bv

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-bv-bank-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van een hypotheek bij de eigen bv met een bankhypotheek, inclusief renteontvangst in de bv, renteaftrek privé en eventueel VPB/box 2-effect.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken privé hypotheeklast en renteaftrek: fiscaalVoordeelPrivé = aftrekbareRente * aftrekTarief. Stap 2: bereken rente-inkomsten bv: renteBv = schuld * renteBvPercentage / 100. Stap 3: vpbOverRente = max(0, renteBv - kostenBv) * vpbTarief. Stap 4: netto in bv = renteBv - vpb. Stap 5: vergelijk met bankrente of alternatief rendement van bv-geld. Stap 6: familie/bv totaalvoordeel = privévoordeel + bvNetto - alternatief.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentepercentages per jaar. Maandlasten via maandrente. VPB/box 2 tarieven via jaartabelparameters. Bedragen in euro per jaar en maand.
4. Afrondingsregels
    INVUL: Maandlasten en fiscale bedragen op 2 decimalen. Percentages met 2 decimalen. Eindvergelijking op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoPrivéLast, nettoResultaatBv, totaalFamilieVoordeel, vergelijkingMetBank, jaarlijkseRenteBv.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Privé/bv-specificatie; vergelijking bank versus bv; optioneel meerjarenschema.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; label “indicatief/fiscaal complex”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, rente ontbreekt, looptijd <= 0, fiscale tarieven ontbreken bij netto vergelijking is onvoldoende. Rente 0% mogelijk onzakelijk; waarschuwing.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rente <= 100; 0 <= belastingtarieven <= 100; rente moet zakelijk zijn als fiscale aftrek wordt verondersteld.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul geldige rentepercentages in.” / “Voor netto vergelijking ontbreken fiscale parameters.” / “Let op: de rente moet zakelijk zijn.”

Testset

1. Basiscase
    INVUL: Schuld € 100.000, rente bv 4%, aftrek 37%, VPB 20%, geen kosten. Verwacht privé voordeel € 1.480, bv netto rente € 3.200.
2. Edge-case
    INVUL: Rente 0%. Verwacht renteaftrek en bv-rente € 0, waarschuwing zakelijkheid.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 200.000, rente 3%, VPB 25%. Verwacht rente bv € 6.000, VPB € 1.500, netto bv € 4.500.

Hypotheekrente vooruit betalen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheekrente-vooruit-betalen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of het fiscaal voordelig is om hypotheekrente vooruit te betalen, door aftrek te verschuiven naar een jaar met een ander belastingtarief.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal vooruitbetaalde rente: vooruitbetaaldeRente = maandrente * aantalMaandenVooruit of direct invoer. Stap 2: fiscaalVoordeelHuidigJaar = vooruitbetaaldeRente * aftrekTariefHuidigJaar. Stap 3: fiscaalVoordeelVolgendJaar = vooruitbetaaldeRente * aftrekTariefVolgendJaar. Stap 4: belastingVoordeelVerschuiving = fiscaalVoordeelHuidigJaar - fiscaalVoordeelVolgendJaar. Stap 5: corrigeer eventueel liquiditeitsnadeel: nettoVoordeel = belastingVoordeelVerschuiving - gemistRendement.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandrente in euro of schuld * rente / 12. Aftrektarieven per jaar in procenten. Aantal maanden vooruit als integer.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Percentages met 2 decimalen. Maanden als geheel getal.

Output-contract

1. Primaire outputs
    INVUL: vooruitbetaaldeRente, fiscaalVoordeelHuidigJaar, fiscaalVoordeelVolgendJaar, belastingVoordeelVerschuiving, nettoVoordeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking aftrekjaar nu versus later; liquiditeitseffect.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; duidelijke fiscale disclaimer.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vooruitbetaalde rente < 0, aantal maanden < 0, aftrektarieven ontbreken of buiten bereik zijn ongeldig/onvoldoende. Als aantal maanden 0, voordeel 0.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekTarief <= 100; aantalMaandenVooruit >= 0; wettelijke maxima/voorwaarden via jaartabelparameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag aan vooruitbetaalde rente in.” / “Vul geldige aftrektarieven in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Vooruitbetaalde rente € 3.000, aftrek huidig 49%, volgend 37%. Verwacht voordeel € 360.
2. Edge-case
    INVUL: Aftrektarief huidig gelijk aan volgend. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 1.000, tarief huidig 40%, volgend 30%, gemist rendement € 20. Verwacht netto voordeel € 80.

Hypotheekrenteaftrek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheekrenteaftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het fiscale voordeel van hypotheekrenteaftrek, rekening houdend met aftrekbare rente, eigenwoningforfait en belastingtarief.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: aftrekbareRente = betaaldeRente * aftrekbaarPercentage. Stap 2: eigenwoningforfait = wozWaarde * ewfPercentage. Stap 3: saldoEigenWoning = eigenwoningforfait - aftrekbareRente. Stap 4: fiscaal voordeel bij negatief saldo: voordeel = max(0, -saldoEigenWoning) * aftrekTarief. Stap 5: bij positief saldo belastingnadeel: nadeel = max(0, saldoEigenWoning) * belastingTarief, met eventuele Hillen-correctie via parameter.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente en EWF zijn jaarbedragen. Maandvoordeel = jaarvoordeel / 12. Percentages delen door 100.
4. Afrondingsregels
    INVUL: Jaarbedragen op 2 decimalen. Maandbedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: aftrekbareRente, eigenwoningforfait, saldoEigenWoning, fiscaalVoordeelPerJaar, fiscaalVoordeelPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie renteaftrek, EWF, Hillen-correctie en netto maandlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; fiscale uitkomst indicatief labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Betaalde rente < 0, WOZ < 0, aftrektarief ontbreekt/buiten bereik is ongeldig. Ontbrekende EWF-tabel maakt berekening onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekbaarPercentage <= 100; 0 <= aftrekTarief <= maxAftrekTariefJaartabel; wozWaarde >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige betaalde rente in.” / “Vul een geldige WOZ-waarde in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Rente € 10.000, WOZ € 400.000, EWF 0,35%, aftrektarief 37%. Verwacht EWF € 1.400, voordeel (10.000-1.400)*37% = € 3.182.
2. Edge-case
    INVUL: Rente € 0, EWF € 1.400. Verwacht geen renteaftrekvoordeel; mogelijk belastingnadeel afhankelijk Hillen.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 5.000, EWF € 1.000, tarief 40%. Verwacht voordeel € 1.600.

Kan ik dat huis betalen?

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/kan-ik-dat-huis-betalen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen of een specifieke woning betaalbaar is op basis van koopprijs, eigen geld, maximale hypotheek, maandlasten en inkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken benodigde financiering: benodigdeHypotheek = koopprijs + aankoopkosten + verbouwing - eigenGeld. Stap 2: controleer benodigdeHypotheek <= maximaleHypotheek. Stap 3: bereken bruto maandlast op benodigde hypotheek. Stap 4: bereken netto maandlast indien fiscale parameters beschikbaar. Stap 5: bereken woonquote: woonquote = maandlast / nettoMaandinkomen * 100. Stap 6: betaalbaar indien hypotheektoets en woonquote binnen grens.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarinkomen naar maandinkomen via /12. Rente per jaar naar maandrente. Kostenpercentages over koopprijs.
4. Afrondingsregels
    INVUL: Hypotheekbedragen op hele euro’s of 2 decimalen. Maandlasten op 2 decimalen. Woonquote op 1 of 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: betaalbaar: boolean; benodigdeHypotheek; maximaleHypotheek; brutoMaandlast; nettoMaandlast; woonquote.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kostenoverzicht, financieringsgat/eigen geld, vergelijking benodigde versus maximale hypotheek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; resultaat als “wel/niet betaalbaar”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, eigen geld < 0, inkomen ontbreekt bij woonquote of maximale hypotheek ontbreekt bij toets is onvoldoende/ongeldig.
2. Domeinbeperkingen
    INVUL: koopprijs > 0; eigenGeld >= 0; maximaleHypotheek >= 0; nettoMaandinkomen > 0 voor woonquote.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Vul een geldig bedrag aan eigen geld in.” / “Vul inkomen of maximale hypotheek in om betaalbaarheid te toetsen.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, kosten € 20.000, eigen geld € 30.000, maximale hypotheek € 400.000. Verwacht benodigde hypotheek € 390.000, betaalbaar op hypotheektoets.
2. Edge-case
    INVUL: Eigen geld hoger dan totale aankoopkosten. Verwacht benodigde hypotheek € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 1.500, netto inkomen € 5.000. Verwacht woonquote 30%.

Kapitaalverzekering uitkeren

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/kapitaalverzekering-banksparen-uitkeren.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk deel van een kapitaalverzekering/bankspaarrekening eigen woning belastingvrij kan uitkeren en welk deel belast is, rekening houdend met vrijstelling en eigenwoningschuld.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: uitkering = kapitaalUitkering. Stap 2: bepaal vrijstelling = min(jaartabelVrijstelling, resterendeEigenwoningschuld, uitkering) indien voorwaarden voldaan. Stap 3: belastDeel = max(0, uitkering - vrijstelling). Stap 4: belasting = belastDeel * belastingTarief. Stap 5: nettoUitkering = uitkering - belasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Uitkering en vrijstellingen in euro. Belastingtarief in procenten. Polisduur in jaren voor voorwaarden.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Belastingtarief met 2 decimalen. Fiscale vrijstelling eventueel op hele euro’s volgens jaartabel.

Output-contract

1. Primaire outputs
    INVUL: belastingvrijeUitkering, belastDeel, belasting, nettoUitkering, toegepasteVrijstelling.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Voorwaardentoets: looptijd, bandbreedte, eigenwoningschuld, vrijstelling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; status voorwaarden als “voldoet/niet voldoet”; fiscale disclaimer.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitkering < 0, eigenwoningschuld < 0, belastingtarief buiten bereik is ongeldig. Ontbrekende jaartabel of voorwaardengegevens maakt fiscale vrijstelling onvoldoende.
2. Domeinbeperkingen
    INVUL: uitkering >= 0; eigenwoningschuld >= 0; 0 <= belastingTarief <= 100; vrijstelling niet hoger dan uitkering.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige uitkering in.” / “Vul een geldige eigenwoningschuld in.” / “Voor dit jaar ontbreken de vrijstellingsbedragen.”

Testset

1. Basiscase
    INVUL: Uitkering € 100.000, vrijstelling € 150.000, eigenwoningschuld € 120.000. Verwacht belast deel € 0.
2. Edge-case
    INVUL: Uitkering € 0. Verwacht netto uitkering € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Uitkering € 200.000, vrijstelling € 150.000, eigenwoningschuld € 300.000, tarief 40%. Verwacht belast € 50.000, belasting € 20.000, netto € 180.000.

Kosten hypotheekvormen

Bron-URL: https://www.externe-bron.nl/hypotheek/kosten-hypotheekvormen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van maandlasten en totale kosten van verschillende hypotheekvormen, zoals annuïtair, lineair en aflossingsvrij.
2. Exacte formules/stappenvolgorde
    INVUL: Voor elke hypotheekvorm: annuïtair A=P*r/(1-(1+r)^(-n)); lineair aflossing=P/n, maandlast = aflossing + restschuld*r; aflossingsvrij maandlast = P*r. Bereken per maand rente, aflossing, restschuld. Totalen: totaalBetaald, totaleRente, eindRestschuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente. Looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten, rente en aflossing per maand op 2 decimalen. Laatste termijn corrigeren. Totalen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: vergelijking[] per hypotheekvorm met eersteMaandlast, laatsteMaandlast, gemiddeldeMaandlast, totaleRente, totaalBetaald, eindRestschuld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aflosschema per vorm; grafiek maandlasten en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; hypotheekvorm als label.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente ontbreekt, looptijd <= 0 of geen hypotheekvorm geselecteerd is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; maximaal 600 maanden of parameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Selecteer minimaal één hypotheekvorm.” / “Vul een geldige looptijd en rente in.”

Testset

1. Basiscase
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht annuïtair circa € 536,82, lineair eerste maand € 694,44.
2. Edge-case
    INVUL: Rente 0%. Verwacht annuïtair en lineair zelfde totale betaling € 100.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij € 100.000, rente 3%. Verwacht maandlast € 250, eindschuld € 100.000.

Kosten koper

Bron-URL: https://www.externe-bron.nl/hypotheek/huis-kopen-kosten-koper.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de bijkomende kosten bij aankoop van een woning, inclusief overdrachtsbelasting, notaris, advies, taxatie, NHG en overige kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: overdrachtsbelasting = koopprijs * overdrachtsbelastingPercentage / 100, tenzij vrijstelling van toepassing. Stap 2: som vaste kosten: notaris + hypotheekadvies + taxatie + bouwkundigeKeuring + nhgKosten + makelaar + overigeKosten. Stap 3: kostenKoper = overdrachtsbelasting + vasteKosten. Stap 4: totaleBenodigd = koopprijs + kostenKoper.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Koopprijs en kosten in euro. Percentages over koopprijs of hypotheekbedrag volgens kostenpost. Geen maand/jaarconversie.
4. Afrondingsregels
    INVUL: Kostenposten en totalen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kostenKoper, totaleAankoopkosten, overdrachtsbelasting, vasteKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kostenpostentabel per categorie; optioneel percentage van koopprijs.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; vrijstelling als ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, kosten negatief of overdrachtsbelastingpercentage buiten bereik is ongeldig. Ontbrekende jaartabel voor overdrachtsbelasting is onvoldoende als percentage niet direct is ingevoerd.
2. Domeinbeperkingen
    INVUL: koopprijs > 0; kosten >= 0; 0 <= overdrachtsbelastingPercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Kosten mogen niet negatief zijn.” / “Voor dit jaar ontbreekt het tarief overdrachtsbelasting.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, overdrachtsbelasting 2%, vaste kosten € 5.000. Verwacht kosten koper € 13.000.
2. Edge-case
    INVUL: Overdrachtsbelastingvrijstelling, vaste kosten € 5.000. Verwacht kosten koper € 5.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, overdrachtsbelasting 10%, vaste kosten € 0. Verwacht € 30.000.

Krediethypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/krediethypotheek-uitkeringen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel periodiek uit een krediethypotheek kan worden opgenomen of hoe lang een beschikbare kredietruimte meegaat.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: maximaleKredietruimte = woningwaarde * maxLTV / 100 - bestaandeHypotheek. Stap 2: bij gewenste maandopname PMT en rente r: simuleer per maand schuldEind = schuldBegin*(1+r) + PMT. Stap 3: stop wanneer schuld >= maximaleKredietruimte. Stap 4: bij gewenste looptijd n, bereken maximale maandopname: PMT = (maxSchuld - beginschuld*(1+r)^n) * r / ((1+r)^n - 1); bij r=0: PMT = (maxSchuld - beginschuld)/n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente naar maandrente. Looptijd in jaren naar maanden. LTV in procenten. Bedragen in euro.
4. Afrondingsregels
    INVUL: Kredietruimte, schuld en opname op 2 decimalen. Looptijd naar beneden afronden op volledige maanden zolang kredietruimte niet wordt overschreden.

Output-contract

1. Primaire outputs
    INVUL: maximaleKredietruimte, maandelijkseOpname of looptijdMaanden, eindSchuld, resterendeOverwaarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: opnameSchema[] met maand, opname, rente, schuld, resterende kredietruimte. Grafiek schuldontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, bestaande hypotheek < 0, maxLTV buiten bereik, rente ontbreekt of gewenste opname < 0 is ongeldig. Als kredietruimte <= 0, geen opname mogelijk.
2. Domeinbeperkingen
    INVUL: 0 <= maxLTV <= 100 of productparameter; bestaandeHypotheek <= woningwaarde * maxLTV/100; rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Er is geen beschikbare kredietruimte.” / “Vul een geldige maandelijkse opname in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 500.000, maxLTV 50%, bestaande hypotheek € 100.000. Verwacht kredietruimte € 150.000.
2. Edge-case
    INVUL: Bestaande hypotheek gelijk aan maximale kredietruimte. Verwacht beschikbare ruimte € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 0, maxSchuld € 12.000, rente 0%, looptijd 12 maanden. Verwacht maandopname € 1.000.

Looptijdrente

Bron-URL: https://www.externe-bron.nl/hypotheek/looptijdrente-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het gewogen gemiddelde rentepercentage over de looptijd of rentevaste perioden van één of meerdere leningdelen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: per periode/leningdeel bepaal bedrag, rentePercentage, duurMaanden. Stap 2: bereken gewogen rente: looptijdrente = Σ(bedrag_i * rente_i * duur_i) / Σ(bedrag_i * duur_i). Stap 3: optioneel bereken totale rente in euro via maandelijkse schema’s.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Duur in jaren naar maanden. Rente als jaarpercentage. Bedragen in euro.
4. Afrondingsregels
    INVUL: Looptijdrente met 3 decimalen. Bedragen op 2 decimalen. Duur in maanden als integer.

Output-contract

1. Primaire outputs
    INVUL: looptijdrentePercentage, gewogenRenteSom, totaalGewicht, aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel per leningdeel/periode met bedrag, rente, duur en bijdrage.
3. Formatregels voor UI
    INVUL: Percentages met 3 decimalen; eurobedragen met 2 decimalen; looptijden in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen geldige regels is onvoldoende. Bedrag <= 0, duur <= 0 of rente ontbreekt is ongeldig.
2. Domeinbeperkingen
    INVUL: bedrag > 0; duurMaanden > 0; rente >= 0; som gewichten > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één geldige periode in.” / “Vul geldige bedragen, rentes en looptijden in.”

Testset

1. Basiscase
    INVUL: € 100.000 tegen 3% voor 60 maanden, € 100.000 tegen 5% voor 60 maanden. Verwacht looptijdrente 4%.
2. Edge-case
    INVUL: Eén periode. Verwacht looptijdrente gelijk aan ingevoerde rente.
3. Regresstest tegen bekende uitkomst
    INVUL: € 200.000 tegen 3% en € 100.000 tegen 6%, zelfde duur. Verwacht 4%.

Maandlasten annuïteitenhypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maandlasten-annuiteitenhypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en optioneel netto maandlasten van een annuïteitenhypotheek gedurende de looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = hypotheekbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: annuiteit = P*r/(1-(1+r)^(-n)); bij r=0: P/n. Stap 3: per maand rente en aflossing berekenen. Stap 4: netto maandlast = bruto annuïteit - fiscaal voordeel renteaftrek/12 + EWF-effect/12 indien fiscale parameters beschikbaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente jaarrente naar maandrente. Looptijd jaren naar maanden. Fiscale jaarbedragen naar maand.
4. Afrondingsregels
    INVUL: Bruto maandlast op 2 decimalen. Schema op centen. Netto maandlast op 2 decimalen. Laatste termijn corrigeren.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlastEersteMaand, nettoMaandlastGemiddeld, totaleRente, totaalBetaald.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Maandschema met rente, aflossing, restschuld, fiscaal voordeel en netto last. Grafiek netto/bruto lasten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; maanden als integer.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt is ongeldig. Netto berekening zonder fiscale parameters is onvoldoende; bruto blijft mogelijk.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een positieve looptijd in.” / “Voor netto maandlasten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, rente 4%, looptijd 30 jaar. Verwacht bruto maandlast € 1.432,25.
2. Edge-case
    INVUL: Rente 0%, hypotheek € 120.000, looptijd 10 jaar. Verwacht bruto maandlast € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht € 536,82.

Maandlasten lineaire hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maandlasten-lineaire-hypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en optioneel netto maandlasten van een lineaire hypotheek met vaste aflossing.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: vasteAflossing = P / n. Stap 2: per maand rente = restschuldBegin * rentePercentage / 100 / 12. Stap 3: brutoMaandlast = vasteAflossing + rente. Stap 4: netto = bruto - fiscale renteaftrek/maand + EWF-effect/maand indien parameters beschikbaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Looptijd in jaren naar maanden. Jaarlijkse fiscale bedragen naar maandbedragen.
4. Afrondingsregels
    INVUL: Aflossing, rente en maandlast op 2 decimalen. Laatste aflossing corrigeren naar resterende schuld. Netto lasten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eersteBrutoMaandlast, laatsteBrutoMaandlast, vasteAflossing, totaleRente, totaalBetaald.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Maandschema met restschuld, rente, aflossing, bruto en netto maandlast. Grafiek dalende maandlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd als jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Hypotheek € 120.000, rente 6%, looptijd 10 jaar. Verwacht vaste aflossing € 1.000, eerste rente € 600, eerste maandlast € 1.600.
2. Edge-case
    INVUL: Rente 0%. Verwacht alle maandlasten gelijk aan vaste aflossing.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 10.000, rente 6%, looptijd 12 maanden. Verwacht totale rente € 325.

Maximale boetevrije hypotheekaflossing

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-boetevrije-hypotheekaflossing.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel in een jaar boetevrij extra mag worden afgelost op een hypotheek.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal grondslag grondslagSchuld, meestal oorspronkelijke hoofdsom of actuele schuld volgens hypotheekvoorwaarden. Stap 2: jaarlijksBoetevrij = grondslagSchuld * boetevrijPercentage / 100. Stap 3: resterendBoetevrij = max(0, jaarlijksBoetevrij - reedsExtraAfgelostDitJaar). Stap 4: boeteplichtigDeel = max(0, gewensteAflossing - resterendBoetevrij).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Boetevrij percentage per kalenderjaar. Bedragen in euro. Geen maandconversie behalve pro-rata indien productvoorwaarden dat vereisen.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Percentage met 2 decimalen. Eventueel naar beneden afronden op hele euro’s voor conservatieve uitkomst.

Output-contract

1. Primaire outputs
    INVUL: jaarlijksBoetevrijBedrag, resterendBoetevrijBedrag, boeteplichtigDeel, gewensteAflossing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie grondslag, reeds afgelost en resterende ruimte.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaar als kalenderjaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuldgrondslag <= 0, percentage < 0, reeds afgelost < 0 of gewenste aflossing < 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= boetevrijPercentage <= 100; reedsAfgelost >= 0; gewensteAflossing >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldig boetevrij percentage in.” / “Aflossingsbedragen mogen niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Grondslag € 300.000, boetevrij 10%, reeds afgelost € 5.000, gewenst € 40.000. Verwacht jaarlijks € 30.000, resterend € 25.000, boeteplichtig € 15.000.
2. Edge-case
    INVUL: Gewenste aflossing € 0. Verwacht boeteplichtig € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Grondslag € 100.000, percentage 20%, reeds € 0. Verwacht boetevrij € 20.000.

Maximale erfpacht hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-erfpacht-hypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel hypotheek mogelijk is wanneer naast hypotheeklasten ook erfpachtcanon moet worden betaald.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal toegestane bruto maandlast uit inkomen of directe invoer. Stap 2: bereken maandelijkse canon: canonPerMaand = canonPerJaar / 12. Stap 3: beschikbareHypotheekMaandlast = toegestaneMaandlast - canonPerMaand. Stap 4: bereken maximale hypotheek uit maandlast: P = A * (1-(1+r)^(-n))/r; bij r=0: P=A*n. Stap 5: indien canon fiscaal aftrekbaar is, pas netto-toetsvariant via parameter toe.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Canon per jaar naar maand via /12. Rente per jaar naar maand. Looptijd in jaren naar maanden.
4. Afrondingsregels
    INVUL: Maximale hypotheek naar beneden afronden op hele euro’s. Maandlast en canon op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheekMetErfpacht, canonPerMaand, beschikbareHypotheekMaandlast, verlagingDoorErfpacht.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking maximale hypotheek zonder en met erfpacht.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s voor hypotheek; rente met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Canon < 0, toegestane maandlast <= 0, rente ontbreekt of looptijd <= 0 is ongeldig. Als canon hoger is dan toegestane maandlast, maximale hypotheek 0.
2. Domeinbeperkingen
    INVUL: canonPerJaar >= 0; toegestaneMaandlast > 0; beschikbareHypotheekMaandlast >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige erfpachtcanon in.” / “De erfpachtcanon is hoger dan de beschikbare maandlast.” / “Vul een geldige rente en looptijd in.”

Testset

1. Basiscase
    INVUL: Toegestane maandlast € 1.500, canon € 3.600/jaar, rente 4%, looptijd 30 jaar. Verwacht beschikbare hypotheeklast € 1.200.
2. Edge-case
    INVUL: Canon € 0. Verwacht maximale hypotheek gelijk aan zonder erfpacht.
3. Regresstest tegen bekende uitkomst
    INVUL: Beschikbare maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht maximale hypotheek € 360.000.

Maximale huizenprijs

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/maximale-huizenprijs.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke maximale koopprijs mogelijk is op basis van maximale hypotheek, eigen geld en aankoopkosten.
2. Exacte formules/stappenvolgorde
    INVUL: Als kosten koper percentage k over koopprijs zijn: maxKoopprijs = (maxHypotheek + eigenGeld - vasteKosten) / (1 + k/100). Als kosten direct zijn: maxKoopprijs = maxHypotheek + eigenGeld - kostenKoper. Begrens op >= 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro. Kostenpercentage over koopprijs. Geen maand/jaarconversie.
4. Afrondingsregels
    INVUL: Maximale huizenprijs naar beneden op hele euro’s afronden. Kosten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleKoopprijs, maximaleHypotheek, eigenGeld, geschatteKostenKoper, totaleBeschikbareMiddelen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie kostenposten en financiering.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Maximale hypotheek < 0, eigen geld < 0, kostenpercentage < 0 of ontbrekende financieringsgegevens zijn ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: maxHypotheek + eigenGeld > vasteKosten; kostenPercentage >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige maximale hypotheek in.” / “Vul een geldig bedrag aan eigen geld in.” / “De kosten zijn hoger dan de beschikbare middelen.”

Testset

1. Basiscase
    INVUL: Max hypotheek € 400.000, eigen geld € 20.000, kostenpercentage 5%. Verwacht max koopprijs € 400.000.
2. Edge-case
    INVUL: Geen kosten, eigen geld € 0. Verwacht max koopprijs = max hypotheek.
3. Regresstest tegen bekende uitkomst
    INVUL: Max hypotheek € 300.000, eigen geld € 30.000, vaste kosten € 10.000. Verwacht max koopprijs € 320.000.

Maximale hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen van de maximale hypotheek op basis van inkomen, toetsrente, looptijd en financieringslastnormen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal toetsinkomen = inkomenAanvrager + wegingspercentagePartner * inkomenPartner, of volgens jaartabel. Stap 2: bepaal financieringslastPercentage uit normtabel op basis van toetsinkomen en toetsrente. Stap 3: toegestaneJaarlast = toetsinkomen * financieringslastPercentage / 100. Stap 4: toegestaneMaandlast = toegestaneJaarlast / 12. Stap 5: bereken hypotheek uit maandlast: P = A * (1-(1+r)^(-n))/r; bij r=0: P=A*n. Stap 6: pas LTV-grens toe: maxHypotheek = min(inkomensMax, woningwaarde * maxLTV/100) indien woningwaarde bekend.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen per jaar. Rente per jaar naar maand. Looptijd jaren naar maanden. Normpercentages via jaartabel.
4. Afrondingsregels
    INVUL: Maximale hypotheek naar beneden afronden op hele euro’s. Maandlasten op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheek, maximaleHypotheekOpInkomen, maximaleHypotheekOpWoningwaarde, toegestaneMaandlast, financieringslastPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toetsinkomen, normtabelregel, LTV-toets, eventuele schuldenlastcorrectie.
3. Formatregels voor UI
    INVUL: Eurobedragen met hele euro’s of 2 decimalen; percentages met 2 decimalen; resultaat indicatief labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen ontbreekt of < 0 is ongeldig/onvoldoende. Toetsrente ontbreekt is onvoldoende. Ontbrekende normtabel voor jaar maakt berekening onvoldoende.
2. Domeinbeperkingen
    INVUL: toetsinkomen > 0; looptijdMaanden > 0; 0 <= rente <= 100; normtabel beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Vul een geldige toetsrente in.” / “Voor dit jaar ontbreken de financieringslastnormen.”

Testset

1. Basiscase
    INVUL: Toegestane maandlast direct € 1.500, rente 4%, looptijd 30 jaar. Verwacht inkomensmax circa € 314.193.
2. Edge-case
    INVUL: Inkomen € 0. Verwacht maximale hypotheek € 0 of foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht hypotheek € 360.000.

Maximale hypotheek na verhuizen

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-na-verhuizen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maximale nieuwe hypotheek na verkoop van de huidige woning, rekening houdend met overwaarde/restschuld, eigenwoningreserve en bestaande lasten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: verkoopopbrengstNetto = verkoopprijsHuidigeWoning - verkoopkosten - bestaandeHypotheek. Stap 2: als positief: overwaarde = verkoopopbrengstNetto; als negatief: restschuld = abs(verkoopopbrengstNetto). Stap 3: bereken inkomensmax zoals maximale hypotheek. Stap 4: bereken benodigde hypotheek voor nieuwe woning: koopprijsNieuw + kosten - eigenGeld - inTeBrengenOverwaarde. Stap 5: maximaleNieuweHypotheek = min(inkomensMax, woningwaardeNieuw * maxLTV/100).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle woningbedragen in euro. Rente per jaar naar maand. Inkomen per jaar. Kostenpercentages over koopprijs/verkoopprijs.
4. Afrondingsregels
    INVUL: Hypotheekbedragen op hele euro’s naar beneden. Overwaarde/restschuld op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: overwaardeOfRestschuld, maximaleNieuweHypotheek, inkomensMax, ltvMax, benodigdeHypotheekNieuweWoning.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Verkoopopbrengstberekening, aankoopberekening, eigenwoningreserve-indicatie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; hypotheekmaximum eventueel hele euro’s; status overwaarde/restschuld.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Verkoopprijs < 0, bestaande hypotheek < 0, nieuwe koopprijs <= 0 of inkomen ontbreekt voor inkomensmax is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: nieuweWoningwaarde > 0; 0 <= maxLTV <= 100; verkoopkosten >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige verkoopprijs in.” / “Vul een geldige bestaande hypotheek in.” / “Vul gegevens van de nieuwe woning in.”

Testset

1. Basiscase
    INVUL: Verkoop € 400.000, hypotheek € 300.000, verkoopkosten € 10.000. Verwacht overwaarde € 90.000.
2. Edge-case
    INVUL: Verkoop gelijk aan hypotheek plus kosten. Verwacht overwaarde/restschuld € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Nieuwe woning € 500.000, maxLTV 100%, inkomensmax € 450.000. Verwacht maximale nieuwe hypotheek € 450.000.

Maximale hypotheek ondernemer

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-ondernemer.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen van maximale hypotheek voor een ondernemer op basis van gemiddeld of toetsbaar ondernemersinkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken toetsinkomen ondernemer, bijvoorbeeld gemiddeldeWinst = gemiddelde(winstJaar1, winstJaar2, winstJaar3) en toetsinkomen = min(gemiddeldeWinst, laatsteJaarWinst) indien conservatieve methode actief. Stap 2: tel eventueel partnerinkomen mee. Stap 3: bepaal financieringslastpercentage uit normtabel. Stap 4: bereken toegestane maandlast en maximale hypotheek via annuïteits-inverse. Stap 5: pas LTV-grens toe.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Winst/inkomen per jaar in euro. Rente per jaar naar maand. Looptijd jaren naar maanden.
4. Afrondingsregels
    INVUL: Toetsinkomen op hele euro’s. Maximale hypotheek naar beneden op hele euro’s. Maandlast op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: toetsinkomenOndernemer, maximaleHypotheek, toegestaneMaandlast, financieringslastPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Winsthistorie, gemiddelde winst, correcties, normtabelregel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; percentages met 2 decimalen; indicatief label.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen winstjaren ingevuld is onvoldoende. Negatieve winst kan toegestaan zijn in gemiddelde maar moet expliciet worden verwerkt; niet-numerieke waarden ongeldig. Normtabel ontbreekt is onvoldoende.
2. Domeinbeperkingen
    INVUL: Minimaal één geldig winstjaar; voor standaardtoets bij voorkeur drie jaren. toetsinkomen > 0 voor positieve hypotheek.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één geldig ondernemersinkomen in.” / “Voor een volledige berekening zijn meerdere winstjaren nodig.” / “Voor dit jaar ontbreken financieringslastnormen.”

Testset

1. Basiscase
    INVUL: Winsten € 60.000, € 70.000, € 80.000, conservatief min gemiddelde/laatste. Verwacht toetsinkomen € 70.000.
2. Edge-case
    INVUL: Alle winsten € 0. Verwacht maximale hypotheek € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Direct toegestane maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht hypotheek € 360.000.

Maximale hypotheek uit maandlasten

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-uit-maandlasten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk hypotheekbedrag past bij een gewenste of maximaal betaalbare maandlast, rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: A = maandlast, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: hypotheek = A * (1 - (1+r)^(-n)) / r. Bij r = 0: hypotheek = A * n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandlast in euro per maand. Rente per jaar naar maandrente. Looptijd in jaren naar maanden.
4. Afrondingsregels
    INVUL: Hypotheekbedrag naar beneden afronden op hele euro’s of 2 decimalen. Maandlast op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheek, maandlast, rentePercentage, looptijdMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema bij berekende hypotheek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; rente met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Maandlast <= 0, looptijd <= 0, rente ontbreekt/niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: maandlast > 0; looptijdMaanden > 0; 0 <= rente <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief maandbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Maandlast € 1.432,25, rente 4%, looptijd 30 jaar. Verwacht hypotheek circa € 300.000.
2. Edge-case
    INVUL: Maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht € 360.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 536,82, rente 5%, looptijd 30 jaar. Verwacht circa € 100.000.

Maximale verhuurhypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-verhuurhypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel verhuurhypotheek mogelijk is op basis van woningwaarde, huurinkomsten, rente, looptijd en verhuur-LTV/norm.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken LTV-maximum: maxOpWaarde = woningwaarde * maxLTV / 100. Stap 2: bereken toetsbare huur: toetsHuur = maandhuur * huurWegingspercentage / 100. Stap 3: bereken maximale lening op huurdekking: maandlast mag maximaal toetsHuur / dekkingsfactor zijn, of rente-only toets maxOpHuur = toetsHuur * 12 / toetsRente. Stap 4: maximaleVerhuurhypotheek = min(maxOpWaarde, maxOpHuur).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandhuur naar jaar via * 12. Rente per jaar. LTV in procenten. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maximale hypotheek naar beneden op hele euro’s. Maandbedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleVerhuurhypotheek, maxOpWoningwaarde, maxOpHuurinkomsten, toetsHuur, ltv.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toetsing waarde versus huurinkomsten; gebruikte verhuurparameters.
3. Formatregels voor UI
    INVUL: Eurobedragen met hele euro’s/2 decimalen; percentages met 2 decimalen; indicatief label.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, huur < 0, maxLTV buiten bereik, toetsrente ontbreekt is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= maxLTV <= 100; maandhuur >= 0; toetsRente > 0; huurWegingspercentage >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige maandhuur in.” / “Vul geldige verhuurhypotheekparameters in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 300.000, maxLTV 70%, maandhuur € 1.500, huurweging 80%, toetsrente 6%, rente-only. Verwacht max waarde € 210.000, max huur € 240.000, hypotheek € 210.000.
2. Edge-case
    INVUL: Maandhuur € 0. Verwacht max op huur € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Woningwaarde € 500.000, maxLTV 60%. Verwacht max op waarde € 300.000.

Netto hypotheek maandlasten

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en netto maandlasten van een hypotheek inclusief renteaftrek en eigenwoningforfait.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken bruto maandlast volgens hypotheekvorm. Stap 2: bepaal jaarlijkse rentecomponent uit schema. Stap 3: aftrekbareRente = renteJaar * aftrekbaarPercentage. Stap 4: eigenwoningforfait = wozWaarde * ewfPercentage. Stap 5: fiscaalVoordeel = max(0, aftrekbareRente - eigenwoningforfait) * aftrekTarief, met Hillen-correctie indien positief saldo. Stap 6: nettoMaandlast = brutoMaandlast - fiscaalVoordeel/12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Fiscale bedragen per jaar naar maand. WOZ in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Fiscale bedragen op 2 decimalen. Schema op centen.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlast, fiscaalVoordeelPerMaand, aftrekbareRentePerJaar, eigenwoningforfait.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaar-/maandschema bruto, rente, aflossing, fiscaal voordeel, netto last.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; fiscale uitkomst indicatief.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente/looptijd ontbreekt. Netto berekening zonder WOZ, EWF of aftrektarief is onvoldoende; bruto berekening blijft geldig.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; 0 <= aftrekTarief <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Voor netto maandlasten ontbreken fiscale gegevens.”

Testset

1. Basiscase
    INVUL: Bruto maandlast € 1.000, fiscaal voordeel € 240/jaar. Verwacht netto maandlast € 980.
2. Edge-case
    INVUL: Geen fiscaal voordeel. Verwacht netto = bruto.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 10.000/jaar, EWF € 1.000, aftrek 40%. Verwacht fiscaal voordeel € 3.600/jaar, € 300/maand.

Netto voordeel hypotheekrenteaftrek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/netto-voordeel-hypotheekrenteaftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel netto voordeel de hypotheekrenteaftrek oplevert per jaar en per maand.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: aftrekbareRente = betaaldeRente * aftrekbaarPercentage / 100. Stap 2: eigenwoningforfait = wozWaarde * ewfPercentage / 100. Stap 3: nettoAftrekpost = max(0, aftrekbareRente - eigenwoningforfait). Stap 4: voordeel = nettoAftrekpost * aftrekTarief / 100. Stap 5: voordeelPerMaand = voordeel / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Betaalde rente en EWF op jaarbasis. Maandvoordeel via /12. Percentages delen door 100.
4. Afrondingsregels
    INVUL: Jaarvoordeel en maandvoordeel op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoVoordeelPerJaar, nettoVoordeelPerMaand, aftrekbareRente, eigenwoningforfait, nettoAftrekpost.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie renteaftrek en EWF; eventueel vergelijking verschillende tarieven.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; indicatief.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Betaalde rente < 0, WOZ < 0, aftrektarief buiten bereik is ongeldig. Ontbrekende EWF-tabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekbaarPercentage <= 100; 0 <= aftrekTarief <= 100; wozWaarde >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige betaalde rente in.” / “Vul een geldige WOZ-waarde in.” / “Vul een geldig belastingtarief in.”

Testset

1. Basiscase
    INVUL: Rente € 10.000, EWF € 1.000, tarief 40%. Verwacht voordeel € 3.600/jaar, € 300/maand.
2. Edge-case
    INVUL: Rente lager dan EWF. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 5.000, EWF € 0, tarief 37%. Verwacht € 1.850/jaar.

Opeethypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/opeethypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel overwaarde via een opeethypotheek kan worden opgenomen en hoe de schuld zich ontwikkelt door rente-bijschrijving.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: maxSchuld = woningwaarde * maxLTV / 100. Stap 2: beschikbareRuimte = maxSchuld - bestaandeHypotheek. Stap 3: bij maandelijkse opname PMT: schuldEindMaand = schuldBegin*(1+r) + PMT, waarbij r = rente/100/12. Stap 4: herhaal tot schuld maxSchuld bereikt of looptijd eindigt. Stap 5: bij gewenste looptijd bereken maandopname zoals krediethypotheek.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Woningwaarde en schuld in euro. LTV in procenten. Looptijd in maanden.
4. Afrondingsregels
    INVUL: Opnames en schuld op 2 decimalen. Looptijd naar beneden op volledige maanden als ruimte opraakt.

Output-contract

1. Primaire outputs
    INVUL: beschikbareOverwaarde, maximaleSchuld, maandelijkseOpname, looptijdMaanden, eindSchuld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schuldontwikkeling per maand/jaar; resterende overwaarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, bestaande hypotheek < 0, maxLTV buiten bereik, rente ontbreekt of opname < 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= maxLTV <= 100; bestaandeHypotheek <= maxSchuld voor positieve ruimte; rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Er is geen beschikbare overwaarde.” / “Vul een geldige opname of looptijd in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 500.000, maxLTV 50%, bestaande hypotheek € 100.000. Verwacht beschikbare ruimte € 150.000.
2. Edge-case
    INVUL: Bestaande hypotheek gelijk aan maxSchuld. Verwacht ruimte € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Ruimte € 12.000, rente 0%, looptijd 12 maanden. Verwacht maandopname € 1.000.

Overdrachtsbelasting

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/overdrachtsbelasting-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel overdrachtsbelasting verschuldigd is bij aankoop van een woning of ander vastgoed, rekening houdend met tarief en vrijstelling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal grondslag = koopprijs of hogere waarde indien parameter marktwaarde wordt gebruikt. Stap 2: bepaal tarief uit jaartabel op basis van gebruikstype, leeftijd, startersvrijstelling en waardegrens. Stap 3: als vrijstelling van toepassing: overdrachtsbelasting = 0. Anders: overdrachtsbelasting = grondslag * tarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Koopprijs/waarde in euro. Tarief in procenten. Geen maand/jaarconversie behalve gekozen belastingjaar.
4. Afrondingsregels
    INVUL: Overdrachtsbelasting op 2 decimalen of hele euro’s volgens fiscale parameter. Tarief met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: overdrachtsbelasting, toegepastTarief, grondslag, vrijstellingToegepast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Voorwaardentoets startersvrijstelling/verlaagd tarief/beleggerstarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; vrijstelling als ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, ontbrekend gebruikstype of ontbrekende jaartabel is ongeldig/onvoldoende. Leeftijd ontbreekt bij startersvrijstellingstoets is onvoldoende.
2. Domeinbeperkingen
    INVUL: grondslag > 0; 0 <= tarief <= 100; jaarparameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Kies het gebruik van de woning.” / “Voor dit jaar ontbreekt het tarief overdrachtsbelasting.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, tarief 2%. Verwacht belasting € 8.000.
2. Edge-case
    INVUL: Vrijstelling van toepassing. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, tarief 10%. Verwacht € 30.000.

Overwaarde huis opeten

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/overwaarde-huis-opeten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe lang een beschikbare overwaarde meegaat bij periodieke opname, rekening houdend met rente op de oplopende schuld.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: beschikbareOverwaarde = woningwaarde * maxLTV / 100 - hypotheekschuld. Stap 2: per maand: schuldEind = schuldBegin*(1+r) + maandOpname. Stap 3: stop wanneer schuldEind >= woningwaarde * maxLTV/100. Stap 4: als looptijd gegeven is, bereken maximale opname met annuïteit voor groeiende schuld: PMT = (maxSchuld - schuldBegin*(1+r)^n) * r / ((1+r)^n - 1); bij r=0: PMT = (maxSchuld - schuldBegin)/n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente. LTV in procenten. Opname per maand. Looptijd in maanden.
4. Afrondingsregels
    INVUL: Maandopname en schuld op 2 decimalen. Looptijd naar beneden afronden op volledige maanden.

Output-contract

1. Primaire outputs
    INVUL: beschikbareOverwaarde, maandelijkseOpname, looptijdMaanden, eindSchuld, resterendeOverwaarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaar-/maandschema schuldontwikkeling; grafiek opeten overwaarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, hypotheekschuld < 0, maxLTV buiten bereik, maandopname < 0 is ongeldig. Geen beschikbare overwaarde maakt opname niet mogelijk.
2. Domeinbeperkingen
    INVUL: woningwaarde > 0; 0 <= maxLTV <= 100; hypotheekschuld <= maxSchuld.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Er is geen beschikbare overwaarde.” / “Vul een geldige maandelijkse opname in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 500.000, maxLTV 60%, schuld € 200.000. Verwacht beschikbare overwaarde € 100.000.
2. Edge-case
    INVUL: Beschikbare overwaarde € 0. Verwacht geen opname mogelijk.
3. Regresstest tegen bekende uitkomst
    INVUL: Beschikbare ruimte € 12.000, rente 0%, opname € 1.000/mnd. Verwacht looptijd 12 maanden.

Prijsontwikkeling huizenprijzen

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/woning-waarde-huizenprijzen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de ontwikkeling van een woningwaarde tussen twee datums op basis van prijsindexen of jaarlijkse stijgingspercentages.
2. Exacte formules/stappenvolgorde
    INVUL: Indexmethode: nieuweWaarde = beginWaarde * indexEind / indexBegin. Percentagemethode: waarde_t = beginWaarde * Π(1 + stijgingspercentageJaar_i/100). Verschil: waardeverandering = nieuweWaarde - beginWaarde, percentageTotaal = nieuweWaarde / beginWaarde - 1.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Waarde in euro. Indexen dimensieloos. Percentages per jaar of periode. Maandindexen direct gebruiken indien beschikbaar.
4. Afrondingsregels
    INVUL: Woningwaarde op hele euro’s of 2 decimalen. Percentageverandering met 2 decimalen. Indexratio intern exact.

Output-contract

1. Primaire outputs
    INVUL: geschatteWoningwaarde, waardeverandering, percentageVerandering, indexBegin, indexEind.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Waardeontwikkeling per jaar/maand; grafiek index of woningwaarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met hele euro’s/2 decimalen; percentages met 2 decimalen; datums als maand/jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Beginwaarde <= 0, ontbrekende index voor begin/eindperiode of einddatum vóór begindatum is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: beginWaarde > 0; indexBegin > 0; indexEind > 0; datumbereik moet in dataset vallen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige beginwaarde in.” / “Voor deze periode ontbreekt de huizenprijsindex.” / “De einddatum mag niet vóór de begindatum liggen.”

Testset

1. Basiscase
    INVUL: Beginwaarde € 300.000, index begin 100, index eind 120. Verwacht waarde € 360.000.
2. Edge-case
    INVUL: Index begin = index eind. Verwacht waarde gelijk aan beginwaarde.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginwaarde € 400.000, stijging 10% en daarna -10%. Verwacht € 396.000.

Rentemiddeling

Bron-URL: https://www.externe-bron.nl/hypotheek/rentemiddeling.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van een nieuwe gemiddelde hypotheekrente bij rentemiddeling en vergelijken met oude rente en actuele marktrente.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken boeterente/contante waarde renteverschil over resterende oude rentevaste periode. Stap 2: smeer boeterente uit over nieuwe rentevaste periode als opslag: eenvoudige methode opslag = boeterente / schuld / nieuwePeriodeJaren * 100; contante-waardevariant via maandelijkse opslag. Stap 3: middelrente = actueleRenteNieuwePeriode + opslag + administratieOpslag. Stap 4: bereken oude en nieuwe maandlast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar. Periodes in maanden/jaren. Opslag als jaarpercentage. Maandlast via maandrente.
4. Afrondingsregels
    INVUL: Rentepercentages met 3 decimalen. Boeterente en maandlasten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: middelrentePercentage, boeterente, renteOpslag, oudeMaandlast, nieuweMaandlast, maandverschil.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie boete, opslag, marktrente, administratieopslag; vergelijking scenario’s.
3. Formatregels voor UI
    INVUL: Rente met 3 decimalen; eurobedragen met 2 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, nieuwe periode <= 0, rente ontbreekt is ongeldig. Als actuele rente >= oude rente, boete/opslag kan 0 zijn.
2. Domeinbeperkingen
    INVUL: schuld > 0; rente >= 0; nieuwePeriodeMaanden > 0; opslag >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul geldige rentepercentages in.” / “Vul een geldige nieuwe rentevaste periode in.”

Testset

1. Basiscase
    INVUL: Schuld € 200.000, boeterente € 6.000, nieuwe periode 10 jaar, actuele rente 3%. Verwacht eenvoudige middelrente 3,300%.
2. Edge-case
    INVUL: Boeterente € 0. Verwacht middelrente = actuele rente + administratieopslag.
3. Regresstest tegen bekende uitkomst
    INVUL: Boeterente € 10.000, schuld € 250.000, periode 5 jaar, marktrente 4%. Verwacht opslag 0,800%, middelrente 4,800%.

Restschuld berekenen & aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek/restschuld-eigen-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van restschuld na verkoop van de eigen woning en eventueel het maandbedrag om deze restschuld af te lossen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nettoVerkoopopbrengst = verkoopprijs - verkoopkosten. Stap 2: restschuld = max(0, hypotheekschuld - nettoVerkoopopbrengst). Stap 3: als aflossen restschuld wordt berekend: A = restschuld * r / (1-(1+r)^(-n)); bij r=0: A = restschuld/n. Stap 4: totaleRente = A*n - restschuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Verkoopbedragen in euro. Rente per jaar naar maand. Looptijd in jaren naar maanden.
4. Afrondingsregels
    INVUL: Restschuld en maandbedrag op 2 decimalen. Looptijd in maanden. Laatste termijn corrigeren.

Output-contract

1. Primaire outputs
    INVUL: restschuld, nettoVerkoopopbrengst, maandbedragAflossen, totaleRente, totaalTerugbetaald.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aflosschema restschuld; specificatie verkoopkosten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; status restschuld/geen restschuld.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Verkoopprijs < 0, hypotheekschuld < 0, verkoopkosten < 0, looptijd <= 0 bij aflosberekening is ongeldig.
2. Domeinbeperkingen
    INVUL: hypotheekschuld >= 0; nettoVerkoopopbrengst >= 0 kan negatief worden begrensd afhankelijk UI; rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige verkoopprijs in.” / “Vul een geldige hypotheekschuld in.” / “Vul een positieve looptijd in voor het aflossen.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, verkoopprijs € 280.000, kosten € 5.000. Verwacht restschuld € 25.000.
2. Edge-case
    INVUL: Verkoopopbrengst hoger dan hypotheek. Verwacht restschuld € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Restschuld € 12.000, rente 0%, looptijd 12 maanden. Verwacht maandbedrag € 1.000.

Stijging maandlasten annuïteitenhypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/netto-maandlasten-annuiteitenhypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe bruto en netto maandlasten van een annuïteitenhypotheek zich ontwikkelen, inclusief stijging doordat het rentedeel daalt en de renteaftrek afneemt.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken vaste bruto annuïteit. Stap 2: per maand bereken rente, aflossing en restschuld. Stap 3: per jaar bereken renteaftrek: fiscaalVoordeel = max(0, renteJaar - eigenwoningforfait) * aftrekTarief. Stap 4: nettoLastJaar = brutoBetaaldJaar - fiscaalVoordeel. Stap 5: nettoMaandlastGemiddeld = nettoLastJaar/12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Fiscale posten per jaar. Maandlasten aggregeren naar jaar.
4. Afrondingsregels
    INVUL: Maandbedragen op 2 decimalen. Jaarbedragen op 2 decimalen. Schema op centen.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlastStart, nettoMaandlastEinde, stijgingNettoMaandlast, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks overzicht netto maandlast, renteaftrek, restschuld; grafiek stijgende netto maandlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaren als periode.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente/looptijd ontbreekt. Netto stijging zonder fiscale parameters is onvoldoende; bruto schema kan wel.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; fiscale parameters beschikbaar voor netto.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Voor netto maandlasten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar, aftrek 40%, EWF 0. Verwacht netto maandlast stijgt gedurende looptijd doordat rentedeel daalt.
2. Edge-case
    INVUL: Aftrektarief 0%. Verwacht netto maandlast gelijk aan bruto maandlast.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto annuïteit € 536,82, eerste maand rente € 416,67, aftrek 40%. Verwacht fiscaal voordeel eerste maand circa € 166,67, netto eerste maand circa € 370,15.

Tariefsaanpassing aftrek kosten eigen woning

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/tariefsaanpassing-aftrek-kosten-eigen-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de beperking van de aftrek van kosten eigen woning wanneer het maximale aftrektarief lager is dan het marginale belastingtarief.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal aftrekbareKostenEigenWoning, meestal hypotheekrente minus eigenwoningforfait-effect volgens fiscale regels. Stap 2: bepaal marginaalTarief en maxAftrekTarief uit jaartabel. Stap 3: tariefsaanpassingPercentage = max(0, marginaalTarief - maxAftrekTarief). Stap 4: tariefsaanpassing = aftrekbareKostenEigenWoning * tariefsaanpassingPercentage / 100. Stap 5: nettoAftrekVoordeel = aftrekbareKosten * maxAftrekTarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Kosten op jaarbasis. Maandeffect = jaarbedrag / 12. Percentages uit jaartabel.
4. Afrondingsregels
    INVUL: Jaarbedragen op 2 decimalen. Maandbedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: tariefsaanpassing, nettoAftrekVoordeel, aftrekbareKostenEigenWoning, maxAftrekTarief, marginaalTarief.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie verschil tussen marginaal tarief en maximaal aftrektarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaar als belastingjaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aftrekbare kosten < 0, ontbrekende belastingtarieven of jaartabel is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= marginaalTarief <= 100; 0 <= maxAftrekTarief <= 100; aftrekbareKosten >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige aftrekbare kosten in.” / “Voor dit jaar ontbreken de aftrektarieven.”

Testset

1. Basiscase
    INVUL: Aftrekbare kosten € 10.000, marginaal 49%, max aftrek 37%. Verwacht tariefsaanpassing € 1.200, netto voordeel € 3.700.
2. Edge-case
    INVUL: Marginaal 37%, max 37%. Verwacht tariefsaanpassing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Kosten € 5.000, verschil 10%. Verwacht tariefsaanpassing € 500.

Totale netto kosten van een hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/totale-kosten-hypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de totale bruto en netto kosten van een hypotheek over de volledige looptijd, inclusief rente, aflossing, fiscale effecten en eventuele afsluitkosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: genereer maandelijk hypotheekschema volgens hypotheekvorm. Stap 2: bereken per jaar betaalde rente, aflossing en restschuld. Stap 3: bereken jaarlijks fiscaal voordeel: max(0, aftrekbareRente - eigenwoningforfait) * aftrekTarief, met Hillen/tariefsaanpassing via parameters. Stap 4: nettoKostenJaar = brutoBetalingenJaar - fiscaalVoordeel + nietFinancierbareKosten. Stap 5: sommeer over looptijd: totaleNettoKosten = Σ nettoKostenJaar + eenmaligeKosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Fiscale posten per jaar. Maandbetalingen aggregeren naar jaar. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandregels op centen. Jaar- en totaalbedragen op 2 decimalen. Laatste termijn corrigeert restschuld naar nul.

Output-contract

1. Primaire outputs
    INVUL: totaleBrutoKosten, totaleNettoKosten, totaleRente, totaleAflossing, totaalFiscaalVoordeel, eenmaligeKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks kostenoverzicht; maand-/jaarschema; grafiek bruto versus netto kosten en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; totalen duidelijk over volledige looptijd.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt is ongeldig. Netto berekening zonder fiscale parameters is onvoldoende; bruto totaal kan wel.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; kosten >= 0; fiscale jaartabellen beschikbaar voor netto.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Kosten mogen niet negatief zijn.” / “Voor totale netto kosten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar, annuïtair, geen fiscaal voordeel. Verwacht bruto maandlast circa € 536,82, totale bruto betaling circa € 193.255.
2. Edge-case
    INVUL: Rente 0%, hypotheek € 120.000, looptijd 10 jaar. Verwacht totale bruto kosten € 120.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto kosten € 200.000, fiscaal voordeel € 30.000, eenmalige kosten € 5.000. Verwacht totale netto kosten € 175.000.