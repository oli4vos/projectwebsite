Basis berekeningen — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: basis-berekeningen
Aantal tools in dit invulblad: 20

Annuïtair geleend bedrag

Bron-URL: https://www.externe-bron.nl/berekenen/geleend-bedrag-annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen welk geleend bedrag/hoofdsom past bij een gegeven vaste annuïtaire termijn, rentepercentage en looptijd. De tool rekent dus terug van termijnbedrag naar lening.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal r = rentePerPeriodeDecimal. Stap 2: bepaal n = aantalTermijnen. Stap 3: bij r > 0: geleendBedrag = termijn * (1 - (1 + r)^(-n)) / r. Bij r = 0: geleendBedrag = termijn * n. Stap 4: bereken eventueel schema per termijn met renteDeel = restschuldBegin * r, aflossingDeel = termijn - renteDeel, restschuldEind = restschuldBegin - aflossingDeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente-invoer is jaarrente in procenten. Intern: jaarRenteDecimal = rentePercentage / 100. Standaard maandtermijnen: r = jaarRenteDecimal / 12 en n = looptijdJaren * 12. Als termijnfrequentie later wordt toegevoegd: maand = 12, kwartaal = 4, jaar = 1.
4. Afrondingsregels
    INVUL: Intern rekenen met volledige precisie. Geldbedragen in output afronden op 2 decimalen. In een schema rente, aflossing en restschuld per termijn op centen afronden. Laatste termijn corrigeert eventuele afrondingsrest zodat eindschuld exact € 0,00 is.

Output-contract

1. Primaire outputs
    INVUL: geleendBedrag: berekende hoofdsom/lening; termijnBedrag: ingevoerde annuïteit per periode; aantalTermijnen: totale looptijd in termijnen; totaalBetaald: som van alle termijnen; totaalRente: totaal betaalde rente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema[] met per termijn: termijnNummer, beginSchuld, termijnBedrag, renteDeel, aflossingDeel, eindSchuld. Optionele grafiek: restschuld per termijn en verhouding rente/aflossing.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; looptijd als geheel aantal maanden of als jaren + maanden; aantallen zonder decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekend, leeg, niet-numeriek of termijnBedrag <= 0 is ongeldig. looptijd <= 0 is ongeldig. rente < 0 is ongeldig voor deze tool. rente = 0 is geldig.
2. Domeinbeperkingen
    INVUL: termijnBedrag > 0; looptijd > 0; 0 <= rentePercentage <= 100; aantalTermijnen <= 1200. Bij overschrijding is invoer ongeldig of onvoldoende praktisch.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief termijnbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.” / “De looptijd is te lang voor deze berekening.”

Testset

1. Basiscase
    INVUL: Invoer: termijn € 536,82, rente 5%, looptijd 30 jaar, maandtermijnen. Verwacht: geleend bedrag circa € 100.000, aantal termijnen 360.
2. Edge-case
    INVUL: Invoer: termijn € 1.000, rente 0%, looptijd 1 jaar, maandtermijnen. Verwacht: geleend bedrag € 12.000, totaal rente € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: termijn € 860,66, rente 6%, looptijd 1 jaar, maandtermijnen. Verwacht: geleend bedrag circa € 10.000.

Annuïteit berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het vaste termijnbedrag bij een annuïtaire lening, op basis van geleend bedrag, rentepercentage en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal P = lening. Stap 2: bepaal r = rentePerPeriodeDecimal. Stap 3: bepaal n = aantalTermijnen. Stap 4: bij r > 0: annuiteit = P * r / (1 - (1 + r)^(-n)). Bij r = 0: annuiteit = P / n. Stap 5: genereer eventueel aflosschema met renteDeel = restschuldBegin * r, aflossingDeel = annuiteit - renteDeel, restschuldEind = restschuldBegin - aflossingDeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Intern: jaarRenteDecimal = rentePercentage / 100. Standaard maandtermijn: r = jaarRenteDecimal / 12; n = looptijdJaren * 12. Bij periodekeuze: maand = 12, kwartaal = 4, jaar = 1.
4. Afrondingsregels
    INVUL: Annuïteit output afronden op 2 decimalen. Schema op centen afronden. Laatste termijn wordt herberekend als restschuldBegin + renteLaatsteTermijn zodat eindschuld exact nul wordt.

Output-contract

1. Primaire outputs
    INVUL: annuiteit: vast termijnbedrag per periode; totaalBetaald: totaal van alle termijnen; totaalRente: totaal betaalde rente; aantalTermijnen: looptijd in termijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met termijnnummer, beginSchuld, renteDeel, aflossingDeel, termijnBedrag en eindSchuld. Optioneel grafiek restschuld en rente/aflossing per termijn.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; termijnen als gehele getallen; negatieve uitkomsten worden niet verwacht.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege, niet-numerieke, negatieve of nulwaarde voor lening of looptijd is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: lening > 0; looptijd > 0; 0 <= rentePercentage <= 100; aantalTermijnen <= 1200.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Invoer: lening € 100.000, rente 5%, looptijd 30 jaar, maandtermijnen. Verwacht: annuïteit circa € 536,82.
2. Edge-case
    INVUL: Invoer: lening € 12.000, rente 0%, looptijd 1 jaar, maandtermijnen. Verwacht: annuïteit € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: lening € 10.000, rente 6%, looptijd 1 jaar, maandtermijnen. Verwacht: annuïteit circa € 860,66.

Bedrag/getal berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/getal-uit-percentage-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het totale bedrag/getal waarvan een gegeven bedrag/getal een bepaald percentage is.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees percentage en bedragOfGetal. Stap 2: zet percentage om naar factor: factor = percentage / 100. Stap 3: bereken totaal = bedragOfGetal / factor.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen periodeconversie. Percentage wordt ingevoerd als percentagepunt, bijvoorbeeld 20 betekent 20%. Eurobedragen worden als gewone getallen verwerkt.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Output totaal afronden op 2 decimalen. Percentage tonen met maximaal 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaalBedragOfGetal: berekend totaal waarvan de invoer het opgegeven percentage vormt; percentageFactor: percentage gedeeld door 100.
2. Secundaire outputs/tabellen/grafieken
    INVUL: controleBedrag = totaalBedragOfGetal * percentageFactor. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Bedrag/getal met 2 decimalen; percentage als 12,50%; geen valutateken tenzij de UI expliciet om bedrag vraagt.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke invoer is ongeldig. percentage = 0 is ongeldig, omdat deling door nul ontstaat. bedragOfGetal = 0 is geldig en geeft totaal 0.
2. Domeinbeperkingen
    INVUL: abs(percentage) >= 1e-12. Negatieve percentages en bedragen zijn rekenkundig toegestaan, maar kunnen in consumenten-UI eventueel als ongeldig worden gemarkeerd.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig percentage in.” / “Het percentage mag niet 0 zijn.” / “Vul een geldig bedrag of getal in.”

Testset

1. Basiscase
    INVUL: Invoer: percentage 20%, bedrag/getal 50. Verwacht: totaal 250.
2. Edge-case
    INVUL: Invoer: percentage 0%, bedrag/getal 50. Verwacht: foutmelding “Het percentage mag niet 0 zijn.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: percentage 12,5%, bedrag/getal 80. Verwacht: totaal 640.

Breuk berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/breuk-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omzetten van een percentage of decimaal getal naar een vereenvoudigde breuk.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal of invoer als percentage of decimaal wordt gebruikt. Bij percentage: waarde = percentage / 100. Bij decimaal: waarde = invoer. Stap 2: zet decimale waarde om naar teller/noemer op basis van aantal decimalen. Stap 3: reduceer met gcd(abs(teller), noemer). Stap 4: output teller/noemer.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen periode- of euroconversie. Percentage 25% wordt eerst 0,25. Decimaal 0,25 blijft 0,25.
4. Afrondingsregels
    INVUL: Exact converteren tot maximaal 10 decimalen. Als de noemer groter is dan 1.000.000, gebruik beste benadering met maximale noemer 1.000.000.

Output-contract

1. Primaire outputs
    INVUL: breuk: tekstuele breuk zoals 1/4; teller: integer; noemer: positieve integer; decimaleWaarde: numerieke waarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: percentageWeergave en controleWaarde = teller / noemer. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Breuk als teller/noemer; negatieve breuk met minteken voor de teller, bijvoorbeeld -1/4; decimaal met maximaal 10 significante decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke invoer is ongeldig. 0 is geldig en geeft 0/1. Oneindige of NaN-waarden zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Absolute invoer maximaal 1e12. Noemer maximaal 1.000.000 voor praktische output.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig percentage of decimaal getal in.” / “De waarde is te groot om als praktische breuk weer te geven.”

Testset

1. Basiscase
    INVUL: Invoer: 25%. Verwacht: 1/4.
2. Edge-case
    INVUL: Invoer: 0%. Verwacht: 0/1.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: 12,5%. Verwacht: 1/8.

Cijfer berekenen

Bron-URL: https://www.externe-bron.nl/studeren/benodigde-cijfer-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk cijfer nog nodig is op een toets/opdracht om een gewenst eindcijfer te behalen, rekening houdend met reeds behaalde cijfers en wegingen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken reeds behaalde gewogen punten: behaaldePunten = Σ(cijfer_i * weging_i). Stap 2: bereken reeds gebruikte weging: gebruikteWeging = Σ(weging_i). Stap 3: bepaal resterende weging: resterendeWeging = totaalWeging - gebruikteWeging. Stap 4: benodigd cijfer: benodigdCijfer = (gewenstEindcijfer * totaalWeging - behaaldePunten) / resterendeWeging.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaar/euroconversie. Wegingen mogen als punten of percentages worden ingevoerd, zolang alle wegingen dezelfde schaal gebruiken. Standaard totaalWeging = 100 bij percentages.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Benodigd cijfer tonen met 1 of 2 decimalen. Voor haalbaarheid niet afronden vóór vergelijking met minimum/maximumcijfer.

Output-contract

1. Primaire outputs
    INVUL: benodigdCijfer: cijfer dat nodig is voor het resterende onderdeel; haalbaar: boolean of benodigd cijfer binnen toegestane schaal valt; gewenstEindcijfer.
2. Secundaire outputs/tabellen/grafieken
    INVUL: behaaldePunten, gebruikteWeging, resterendeWeging, huidigGewogenGemiddelde. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Cijfers met 1 decimaal of 2 decimalen; wegingen als percentage met maximaal 2 decimalen; haalbaarheid als tekst: “haalbaar” of “niet haalbaar”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekend gewenst eindcijfer, lege cijfers, niet-numerieke cijfers of wegingen zijn ongeldig. Als resterende weging <= 0, is invoer onvoldoende omdat er geen onderdeel over is om mee te rekenen.
2. Domeinbeperkingen
    INVUL: Cijfers standaard tussen 1 en 10. Wegingen moeten > 0 zijn. gebruikteWeging < totaalWeging. Gewenst eindcijfer tussen 1 en 10.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig gewenst eindcijfer in.” / “Vul geldige cijfers en wegingen in.” / “Er moet nog een resterende weging zijn.” / “Het benodigde cijfer ligt buiten de mogelijke cijferschaal.”

Testset

1. Basiscase
    INVUL: Invoer: gewenst eindcijfer 6, totaalweging 100, reeds 5 met weging 50, resterende weging 50. Verwacht: benodigd cijfer 7.
2. Edge-case
    INVUL: Invoer: gebruikte weging 100, resterende weging 0. Verwacht: foutmelding “Er moet nog een resterende weging zijn.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: gewenst 7, cijfers 6 met weging 40 en 8 met weging 30, resterend 30. Verwacht: benodigd cijfer (7*100 - 6*40 - 8*30)/30 = 7,3333.

Contante waarde

Bron-URL: https://www.externe-bron.nl/berekenen/contante-waarde.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat een toekomstig bedrag vandaag waard is bij een gegeven rendement/rente en periode.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal FV = toekomstigeWaarde. Stap 2: bepaal r = rendementPerPeriodeDecimal. Stap 3: bepaal n = aantalPeriodes. Stap 4: contanteWaarde = FV / (1 + r)^n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rendement wordt ingevoerd als percentage per jaar. Standaard jaarlijkse periode: r = rendementPercentage / 100 en n = aantalJaren. Bij maandperioden: r = jaarRendementDecimal / 12 en n = jaren * 12.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Contante waarde afronden op 2 decimalen. Disconteringsfactor tonen met maximaal 6 decimalen.

Output-contract

1. Primaire outputs
    INVUL: contanteWaarde: huidige waarde; toekomstigeWaarde: invoerbedrag; disconteringsfactor: 1 / (1 + r)^n.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel waardePerPeriode[] met periode, disconteringsfactor en contante waarde. Grafiek optioneel.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; factor met 6 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke toekomstige waarde, periode of rendement is ongeldig. toekomstigeWaarde = 0 is geldig. periode <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: periode > 0; 1 + r > 0; rendement per periode moet groter zijn dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige toekomstige waarde in.” / “Vul een positieve periode in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Invoer: toekomstige waarde € 1.000, rendement 5%, periode 1 jaar. Verwacht: contante waarde € 952,38.
2. Edge-case
    INVUL: Invoer: toekomstige waarde € 1.000, rendement 0%, periode 10 jaar. Verwacht: contante waarde € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: toekomstige waarde € 10.000, rendement 4%, periode 5 jaar. Verwacht: contante waarde circa € 8.219,27.

Contante waarde voor een reeks betalingen

Bron-URL: https://www.externe-bron.nl/berekenen/contante-waarde-reeks-betalingen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de huidige waarde van een reeks gelijke toekomstige betalingen bij een gegeven rendement/rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal PMT = betalingPerPeriode. Stap 2: bepaal r = rendementPerPeriodeDecimal. Stap 3: bepaal n = aantalBetalingen. Stap 4: betalingen aan einde periode. Bij r > 0: contanteWaarde = PMT * (1 - (1 + r)^(-n)) / r. Bij r = 0: contanteWaarde = PMT * n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rendement is jaarrendement in procenten. Standaard jaarlijkse betalingen. Bij maandelijkse betalingen: r = jaarRendementDecimal / 12; n = jaren * 12.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Totale contante waarde afronden op 2 decimalen. Contante waarde per betaling in tabel op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: contanteWaarde: huidige waarde van de reeks; betalingPerPeriode; aantalBetalingen; rendementPerPeriode.
2. Secundaire outputs/tabellen/grafieken
    INVUL: betalingsschema[] met periode, betaling, disconteringsfactor en contante waarde betaling. Optioneel grafiek contante waarde per betaling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; factoren met 6 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke betaling, periode of rendement is ongeldig. betaling = 0 is geldig en geeft contante waarde 0. periode <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: aantalBetalingen > 0; 1 + r > 0; maximaal 1200 betalingen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig betalingsbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Invoer: betaling € 1.000, rendement 5%, periode 5 jaar. Verwacht: contante waarde circa € 4.329,48.
2. Edge-case
    INVUL: Invoer: betaling € 1.000, rendement 0%, periode 5 jaar. Verwacht: contante waarde € 5.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: betaling € 100, rendement 1%, periode 12. Verwacht: contante waarde circa € 1.125,51.

Effectieve rente

Bron-URL: https://www.externe-bron.nl/berekenen/effectieve-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van nominale rente naar effectieve rente op jaarbasis, rekening houdend met het aantal renteperioden per jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nominaleRenteDecimal = nominaleRentePercentage / 100. Stap 2: bepaal m = periodesPerJaar. Stap 3: effectieveRenteDecimal = (1 + nominaleRenteDecimal / m)^m - 1. Stap 4: effectieveRentePercentage = effectieveRenteDecimal * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Nominale rente wordt ingevoerd als jaarpercentage. periodesPerJaar: jaar = 1, halfjaar = 2, kwartaal = 4, maand = 12, week = 52, dag = 365.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Effectieve rente tonen met 3 decimalen. Periode-rente tonen met 4 decimalen indien zichtbaar.

Output-contract

1. Primaire outputs
    INVUL: effectieveRentePercentage: effectieve rente per jaar; nominaleRentePercentage: ingevoerde nominale rente; periodesPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: rentePerPeriodePercentage = nominaleRentePercentage / periodesPerJaar. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Percentages als 12,683%; periodesPerJaar als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke nominale rente is ongeldig. periodesPerJaar <= 0 is ongeldig. nominaleRente = 0 is geldig.
2. Domeinbeperkingen
    INVUL: periodesPerJaar geheel getal tussen 1 en 365; 1 + nominaleRenteDecimal / periodesPerJaar > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige nominale rente in.” / “Het aantal perioden per jaar moet positief zijn.” / “Deze rente is niet geldig bij dit aantal perioden.”

Testset

1. Basiscase
    INVUL: Invoer: nominale rente 12%, perioden per jaar 12. Verwacht: effectieve rente circa 12,683%.
2. Edge-case
    INVUL: Invoer: nominale rente 0%, perioden per jaar 12. Verwacht: effectieve rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: nominale rente 6%, perioden per jaar 4. Verwacht: effectieve rente circa 6,136%.

Enkelvoudige rente

Bron-URL: https://www.externe-bron.nl/berekenen/enkelvoudige-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van samengestelde rente per periode naar een equivalente enkelvoudige rente per periode over hetzelfde aantal perioden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: r = samengesteldeRentePercentage / 100. Stap 2: bepaal n = periodes. Stap 3: bereken totale groeifactor: factor = (1 + r)^n. Stap 4: totaal rendement: totaalRendement = factor - 1. Stap 5: equivalente enkelvoudige rente per periode: enkelvoudigeRentePerPeriode = totaalRendement / n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen vaste maand/jaarconversie. De opgegeven rente geldt per gekozen periode en periodes is het aantal van diezelfde perioden. Percentage 5 betekent 5%.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Enkelvoudige rente tonen met 3 decimalen. Totaal rendement tonen met 3 decimalen.

Output-contract

1. Primaire outputs
    INVUL: enkelvoudigeRentePerPeriodePercentage; totaalRendementPercentage; aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: eindFactorSamengesteld; optioneel vergelijkingstabel samengesteld versus enkelvoudig.
3. Formatregels voor UI
    INVUL: Percentages met 3 decimalen; factor met 6 decimalen; perioden als getal zonder valutateken.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke rente of perioden zijn ongeldig. periodes <= 0 is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: periodes > 0; 1 + r > 0; rente per periode groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige samengestelde rente in.” / “Het aantal perioden moet groter zijn dan 0.”

Testset

1. Basiscase
    INVUL: Invoer: samengestelde rente 10%, perioden 2. Verwacht: totaal rendement 21%, enkelvoudige rente per periode 10,5%.
2. Edge-case
    INVUL: Invoer: samengestelde rente 0%, perioden 10. Verwacht: enkelvoudige rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: samengestelde rente 5%, perioden 3. Verwacht: totaal rendement 15,7625%, enkelvoudige rente circa 5,254%.

Gemiddelde cijfer

Bron-URL: https://www.externe-bron.nl/studeren/gemiddelde-cijfer-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het gemiddelde cijfer uit meerdere behaalde cijfers, optioneel met wegingen.
2. Exacte formules/stappenvolgorde
    INVUL: Zonder weging: gemiddelde = Σ(cijfer_i) / aantalCijfers. Met weging: gewogenGemiddelde = Σ(cijfer_i * weging_i) / Σ(weging_i). Lege regels negeren als zowel cijfer als weging leeg zijn.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaar/euroconversie. Wegingen mogen als percentages of punten worden ingevoerd, zolang alle regels dezelfde schaal gebruiken.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Gemiddelde tonen met 2 decimalen, eventueel ook afgerond eindcijfer met 1 decimaal als secundaire output.

Output-contract

1. Primaire outputs
    INVUL: gemiddeldeCijfer: berekend gemiddelde; aantalCijfers: aantal actieve regels; somWegingen: alleen bij gewogen gemiddelde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: regels[] met cijfer, weging en gewogen bijdrage. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Cijfers met 1 of 2 decimalen; wegingen met maximaal 2 decimalen; geen valutatekens.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen actieve regels is onvoldoende. Regel met cijfer maar ontbrekende weging bij gewogen modus is ongeldig. Niet-numerieke cijfers of wegingen zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Cijfers standaard tussen 1 en 10. Wegingen moeten > 0 zijn. Σ(weging_i) > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één cijfer in.” / “Vul geldige cijfers in.” / “Vul geldige positieve wegingen in.”

Testset

1. Basiscase
    INVUL: Invoer: cijfers 6, 7, 8 zonder weging. Verwacht: gemiddelde 7,00.
2. Edge-case
    INVUL: Invoer: geen cijfers. Verwacht: foutmelding “Vul minimaal één cijfer in.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: 6 met weging 40, 8 met weging 60. Verwacht: gewogen gemiddelde 7,20.

Gewogen gemiddelde rentepercentage

Bron-URL: https://www.externe-bron.nl/berekenen/gewogen-gemiddelde-rentepercentage.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van één gemiddeld rentepercentage voor meerdere bedragen met verschillende rentepercentages, gewogen naar de omvang van elk bedrag.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: verzamel actieve regels met bedrag_i en rentePercentage_i. Stap 2: bereken totaalBedrag = Σ(bedrag_i). Stap 3: bereken gewogenSom = Σ(bedrag_i * rentePercentage_i). Stap 4: gewogenGemiddeldeRente = gewogenSom / totaalBedrag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bedragen zijn euro’s. Rentepercentages zijn procentpunten per jaar of per dezelfde renteperiode. Er vindt geen maand/jaarconversie plaats; alle rentepercentages moeten dezelfde periodebasis hebben.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Gewogen gemiddelde rente tonen met 2 of 3 decimalen. Bedragen tonen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: gewogenGemiddeldeRentePercentage; totaalBedrag; aantalRegels.
2. Secundaire outputs/tabellen/grafieken
    INVUL: regels[] met bedrag, rentepercentage en gewogen bijdrage. Optioneel aandeel per bedrag in procenten.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 3,50%; aantallen zonder decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen actieve regels is onvoldoende. Regel met alleen bedrag of alleen rente is ongeldig. Niet-numerieke waarden zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen moeten > 0 zijn. totaalBedrag > 0. Rente mag 0% zijn. Negatieve rente kan worden toegestaan als de UI dat ondersteunt; standaard bereik -100% tot 1000%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één bedrag en rentepercentage in.” / “Bedragen moeten positief zijn.” / “De som van de bedragen moet groter zijn dan 0.”

Testset

1. Basiscase
    INVUL: Invoer: € 1.000 tegen 2% en € 3.000 tegen 4%. Verwacht: gewogen gemiddelde rente 3,50%.
2. Edge-case
    INVUL: Invoer: alle bedragen leeg of 0. Verwacht: foutmelding “De som van de bedragen moet groter zijn dan 0.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: € 200.000 tegen 3% en € 100.000 tegen 6%. Verwacht: 4,00%.

Lineaire lening aflossen

Bron-URL: https://www.externe-bron.nl/berekenen/lineaire-lening-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het aflosschema, de termijnen en de totale rentekosten van een lineaire lening met vaste aflossing per periode.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = lening. Stap 2: r = rentePerPeriodeDecimal. Stap 3: n = aantalTermijnen. Stap 4: vaste aflossing: aflossing = P / n. Per termijn: renteDeel = restschuldBegin * r; termijnBedrag = aflossing + renteDeel; restschuldEind = restschuldBegin - aflossing. Totale rente: Σ renteDeel. Totaal betaald: P + totaleRente.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Standaard maandtermijnen: r = rentePercentage / 100 / 12; n = looptijdJaren * 12. Bij periodekeuze: maand = 12, kwartaal = 4, jaar = 1.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Aflossing, rente en termijn per periode op centen afronden. Laatste aflossing corrigeren naar resterende restschuld zodat eindschuld € 0,00 wordt.

Output-contract

1. Primaire outputs
    INVUL: vasteAflossing; eersteTermijn; laatsteTermijn; totaalRente; totaalBetaald; aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met termijnnummer, beginSchuld, aflossing, renteDeel, termijnBedrag en eindSchuld. Optioneel grafiek dalende termijn en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; termijnen als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege, niet-numerieke, negatieve of nulwaarde voor lening of looptijd is ongeldig. Rente 0% is geldig. Negatieve rente standaard ongeldig.
2. Domeinbeperkingen
    INVUL: lening > 0; looptijd > 0; 0 <= rentePercentage <= 100; aantalTermijnen <= 1200.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Invoer: lening € 12.000, rente 12%, looptijd 1 jaar, maandtermijnen. Verwacht: vaste aflossing € 1.000, eerste rente € 120, eerste termijn € 1.120.
2. Edge-case
    INVUL: Invoer: lening € 12.000, rente 0%, looptijd 1 jaar, maandtermijnen. Verwacht: elke termijn € 1.000, totaal rente € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: lening € 10.000, rente 6%, looptijd 1 jaar, maandtermijnen. Verwacht: totaal rente € 325,00.

Looptijd annuïteit berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/looptijd-annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel termijnen nodig zijn om een lening volledig af te lossen bij een gegeven annuïtaire termijn en rentepercentage.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = lening. Stap 2: A = termijnBedrag. Stap 3: r = rentePerPeriodeDecimal. Stap 4: bij r = 0: nExact = P / A. Bij r > 0: eerst controleren A > P * r; daarna nExact = -ln(1 - P*r/A) / ln(1 + r). Stap 5: aantalTermijnen = ceil(nExact). Stap 6: laatste termijn eventueel lager door restschuldcorrectie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Standaard maandtermijnen: r = rentePercentage / 100 / 12. Looptijd in jaren: jaren = floor(aantalTermijnen / 12), maanden = aantalTermijnen % 12.
4. Afrondingsregels
    INVUL: Aantal termijnen altijd naar boven afronden. Geldbedragen op 2 decimalen. Laatste termijn berekenen als resterende hoofdsom plus laatste rente, zodat eindschuld nul wordt.

Output-contract

1. Primaire outputs
    INVUL: aantalTermijnen; looptijdJaren; looptijdRestMaanden; laatsteTermijn; totaalBetaald; totaalRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema[] met rente, aflossing en restschuld per termijn. Optionele grafiek restschuld.
3. Formatregels voor UI
    INVUL: Looptijd tonen als x jaar en y maanden; eurobedragen met 2 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lening of termijn leeg, niet-numeriek of <= 0 is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: Bij r > 0 moet termijnBedrag > lening * r; anders wordt de lening nooit afgelost. Maximaal 2400 termijnen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positief termijnbedrag in.” / “De termijn is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Invoer: lening € 10.000, rente 6%, termijn € 860,66, maandtermijnen. Verwacht: 12 termijnen.
2. Edge-case
    INVUL: Invoer: lening € 12.000, rente 0%, termijn € 1.000. Verwacht: 12 termijnen.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: lening € 100.000, rente 5%, termijn € 536,82, maandtermijnen. Verwacht: circa 360 termijnen.

Nominale rente

Bron-URL: https://www.externe-bron.nl/berekenen/nominale-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van effectieve rente op jaarbasis naar nominale rente op jaarbasis bij een gegeven aantal renteperioden per jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: effectieveRenteDecimal = effectieveRentePercentage / 100. Stap 2: bepaal m = periodesPerJaar. Stap 3: nominaleRenteDecimal = m * ((1 + effectieveRenteDecimal)^(1/m) - 1). Stap 4: nominaleRentePercentage = nominaleRenteDecimal * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Effectieve rente is rente per jaar in procenten. periodesPerJaar: jaar = 1, halfjaar = 2, kwartaal = 4, maand = 12, week = 52, dag = 365.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Nominale rente tonen met 3 decimalen. Periode-rente tonen met 4 decimalen indien weergegeven.

Output-contract

1. Primaire outputs
    INVUL: nominaleRentePercentage; effectieveRentePercentage; periodesPerJaar; rentePerPeriodePercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Geen tabel nodig. Optioneel controle: effectieve rente opnieuw berekend uit nominale rente.
3. Formatregels voor UI
    INVUL: Percentages als 12,000%; perioden per jaar als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke effectieve rente of perioden per jaar is ongeldig. periodesPerJaar <= 0 is ongeldig. Effectieve rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: effectieveRente > -100%; periodesPerJaar integer tussen 1 en 365.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige effectieve rente in.” / “Het aantal perioden per jaar moet positief zijn.” / “De effectieve rente moet hoger zijn dan -100%.”

Testset

1. Basiscase
    INVUL: Invoer: effectieve rente 12,683%, perioden per jaar 12. Verwacht: nominale rente circa 12,000%.
2. Edge-case
    INVUL: Invoer: effectieve rente 0%, perioden per jaar 12. Verwacht: nominale rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: effectieve rente 6,136%, perioden per jaar 4. Verwacht: nominale rente circa 6,000%.

Percentage berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/percentage-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel procent het eerste bedrag/getal is van het tweede bedrag/getal.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees getal1 en getal2. Stap 2: controleer dat getal2 niet nul is. Stap 3: percentage = (getal1 / getal2) * 100. Stap 4: factor = getal1 / getal2.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen periodeconversie. Bedragen en getallen worden als gewone numerieke waarden verwerkt. Output is percentage.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Percentage tonen met 2 decimalen. Factor tonen met maximaal 6 decimalen indien zichtbaar.

Output-contract

1. Primaire outputs
    INVUL: percentage: hoeveel procent getal1 van getal2 is; factor: getal1 gedeeld door getal2.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Geen tabel of grafiek nodig.
3. Formatregels voor UI
    INVUL: Percentage als 12,50%; getallen met maximaal 2 decimalen in bedragcontext.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke invoer is ongeldig. getal1 = 0 is geldig en geeft 0%. getal2 = 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: abs(getal2) >= 1e-12. Negatieve waarden zijn rekenkundig toegestaan, tenzij UI specifiek om positieve bedragen vraagt.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul twee geldige getallen in.” / “Het tweede getal mag niet 0 zijn.”

Testset

1. Basiscase
    INVUL: Invoer: getal1 25, getal2 200. Verwacht: 12,50%.
2. Edge-case
    INVUL: Invoer: getal1 0, getal2 200. Verwacht: 0,00%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: getal1 1, getal2 3. Verwacht: 33,33%.

Percentage berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/percentage-berekenen-uit-percentages.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het samengestelde effect van twee opeenvolgende percentages, bijvoorbeeld eerst stijging/daling 1 en daarna stijging/daling 2.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: zet percentages om naar factoren: f1 = 1 + percentage1 / 100, f2 = 1 + percentage2 / 100. Stap 2: samengesteldeFactor = f1 * f2. Stap 3: samengesteldPercentage = (samengesteldeFactor - 1) * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaar/euroconversie. Invoer is in procentpunten: 10 betekent 10%. Percentages werken als opeenvolgende vermenigvuldigingsfactoren, niet als optelsom.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Samengesteld percentage tonen met 2 decimalen. Factoren tonen met maximaal 6 decimalen indien zichtbaar.

Output-contract

1. Primaire outputs
    INVUL: samengesteldPercentage; samengesteldeFactor; percentage1; percentage2.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel somPercentagepunten = percentage1 + percentage2 en verschilDoorSamenstelling = samengesteldPercentage - somPercentagepunten.
3. Formatregels voor UI
    INVUL: Percentages als 32,00%; factoren met 6 decimalen; geen euroformattering.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke percentages zijn ongeldig. 0% is geldig. Percentage -100% is geldig en leidt tot factor 0.
2. Domeinbeperkingen
    INVUL: Percentages lager dan -100% standaard ongeldig, omdat een negatieve groeifactor doorgaans niet zinvol is in deze tool.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul twee geldige percentages in.” / “Een percentage lager dan -100% is niet toegestaan.”

Testset

1. Basiscase
    INVUL: Invoer: 10% en 20%. Verwacht: samengesteld percentage 32,00%.
2. Edge-case
    INVUL: Invoer: 0% en 20%. Verwacht: 20,00%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: -10% en 10%. Verwacht: -1,00%.

Romeinse cijfers

Bron-URL: https://www.externe-bron.nl/berekenen/romeinse-cijfers.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omzetten van Arabische getallen naar Romeinse cijfers en Romeinse cijfers naar Arabische getallen.
2. Exacte formules/stappenvolgorde
    INVUL: Arabisch naar Romeins: gebruik aflopende waardetabel 1000 M, 900 CM, 500 D, 400 CD, 100 C, 90 XC, 50 L, 40 XL, 10 X, 9 IX, 5 V, 4 IV, 1 I; trek telkens de hoogste passende waarde af en voeg symbool toe. Romeins naar Arabisch: lees links naar rechts; als waarde huidig symbool kleiner is dan volgende symbool, trek af, anders tel op. Valideer daarna door het resultaat opnieuw canoniek naar Romeins te converteren en te vergelijken met invoer.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Niet relevant; geen maand/jaar/percentage/euroconversie.
4. Afrondingsregels
    INVUL: Niet relevant; alleen gehele getallen toegestaan. Decimalen zijn ongeldig.

Output-contract

1. Primaire outputs
    INVUL: arabischGetal: integer; romeinsCijfer: canonieke Romeinse notatie; richting: arabisch-naar-romeins of romeins-naar-arabisch.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Geen tabellen of grafieken.
3. Formatregels voor UI
    INVUL: Romeinse cijfers altijd in hoofdletters; Arabische getallen zonder decimalen; geen valutatekens.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege invoer, nul, negatieve getallen, decimalen, ongeldige letters of niet-canonieke Romeinse notatie zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Ondersteund bereik 1 t/m 3999. Romeinse invoer alleen met tekens I, V, X, L, C, D, M.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een getal van 1 t/m 3999 of een geldig Romeins cijfer in.” / “Dit is geen geldige Romeinse notatie.”

Testset

1. Basiscase
    INVUL: Invoer: 1984. Verwacht: MCMLXXXIV.
2. Edge-case
    INVUL: Invoer: 0. Verwacht: foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: MMXXVI. Verwacht: 2026; invoer 3999 verwacht MMMCMXCIX.

Samengestelde rente

Bron-URL: https://www.externe-bron.nl/berekenen/samengestelde-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van enkelvoudige rente per periode naar een equivalente samengestelde rente per periode over hetzelfde aantal perioden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: s = enkelvoudigeRentePercentage / 100. Stap 2: bepaal n = periodes. Stap 3: totale enkelvoudige factor: factor = 1 + s * n. Stap 4: samengestelde rente per periode: samengesteldeRentePerPeriode = factor^(1/n) - 1. Stap 5: outputpercentage: samengesteldeRentePerPeriode * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen vaste maand/jaarconversie. De ingevoerde enkelvoudige rente geldt per gekozen periode en periodes gebruikt dezelfde periodebasis. Percentage 5 betekent 5%.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Samengestelde rente tonen met 3 decimalen. Eindfactor tonen met 6 decimalen.

Output-contract

1. Primaire outputs
    INVUL: samengesteldeRentePerPeriodePercentage; totaalRendementPercentage; eindFactor; aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel vergelijkingstabel enkelvoudige groei versus samengestelde groei.
3. Formatregels voor UI
    INVUL: Percentages met 3 decimalen; factoren met 6 decimalen; perioden zonder decimalen als invoer integer is.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke rente of perioden zijn ongeldig. periodes <= 0 is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: 1 + s * n > 0; periodes > 0. Als factor <= 0, is machtsverheffing niet geldig voor algemene decimale perioden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige enkelvoudige rente in.” / “Het aantal perioden moet groter zijn dan 0.” / “Deze combinatie van rente en perioden is niet geldig.”

Testset

1. Basiscase
    INVUL: Invoer: enkelvoudige rente 10%, perioden 2. Verwacht: eindfactor 1,20, samengestelde rente per periode circa 9,545%.
2. Edge-case
    INVUL: Invoer: enkelvoudige rente 0%, perioden 10. Verwacht: samengestelde rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: enkelvoudige rente 5%, perioden 3. Verwacht: eindfactor 1,15, samengestelde rente per periode circa 4,769%.

Toekomstige waarde

Bron-URL: https://www.externe-bron.nl/berekenen/toekomstige-waarde.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel een huidige waarde plus eventuele periodieke inleg in de toekomst waard is bij samengestelde rente/rendement.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal PV = huidigeWaarde, PMT = periodiekeInleg, r = rentePerPeriodeDecimal, n = aantalPerioden. Stap 2: eindwaarde startkapitaal: FV_start = PV * (1 + r)^n. Stap 3: bij inleg einde periode en r > 0: FV_inleg = PMT * (((1 + r)^n - 1) / r). Bij r = 0: FV_inleg = PMT * n. Stap 4: toekomstigeWaarde = FV_start + FV_inleg.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente/rendement is jaarrendement in procenten. Bij jaarlijkse perioden: r = rentePercentage / 100, n = jaren. Bij maandelijkse inleg: r = rentePercentage / 100 / 12, n = jaren * 12.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Toekomstige waarde, totaal ingelegd en rendement op 2 decimalen afronden. Tabelwaarden per periode op centen tonen.

Output-contract

1. Primaire outputs
    INVUL: toekomstigeWaarde; totaalIngelegd; rendementBedrag; aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: opbouwschema[] met periode, beginwaarde, inleg, rendement, eindwaarde. Optioneel grafiek vermogensopbouw.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; looptijd als jaren/maanden afhankelijk van periodekeuze.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke huidige waarde, inleg, looptijd of rente is ongeldig. huidigeWaarde = 0 is geldig. inleg = 0 is geldig. looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: looptijd > 0; 1 + r > 0; rendement per periode groter dan -100%; maximaal 1200 perioden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige huidige waarde in.” / “Vul een geldige periodieke inleg in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Invoer: huidige waarde € 1.000, inleg € 100, rente 5%, looptijd 1 jaar, jaarlijkse periode. Verwacht: toekomstige waarde € 1.150.
2. Edge-case
    INVUL: Invoer: huidige waarde € 1.000, inleg € 100, rente 0%, looptijd 5 perioden. Verwacht: toekomstige waarde € 1.500.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: huidige waarde € 10.000, inleg € 0, rente 4%, looptijd 5 jaar. Verwacht: toekomstige waarde circa € 12.166,53.

Waardebepaling via cashflow, DCF-methode

Bron-URL: https://www.externe-bron.nl/berekenen/waardebepaling-via-cashflow.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de waarde van een onderneming/project/investering door toekomstige kasstromen en een eventuele eindwaarde contant te maken met de WACC/disconteringsvoet.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees WACCPercentage, kasstromen[] en optioneel eindwaarde. Stap 2: wacc = WACCPercentage / 100. Stap 3: voor elke kasstroom in jaar t: contanteWaardeKasstroom_t = kasstroom_t / (1 + wacc)^t. Stap 4: contanteWaardeKasstromen = Σ contanteWaardeKasstroom_t. Stap 5: als eindwaarde is ingevuld: contanteWaardeEindwaarde = eindwaarde / (1 + wacc)^n. Stap 6: dcfWaarde = contanteWaardeKasstromen + contanteWaardeEindwaarde.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: WACC is percentage per jaar. Kasstromen zijn eurobedragen per jaar. Horizon n is het aantal jaren/kasstromen. Er is geen maandconversie in de standaardversie.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Contante waarden en DCF-waarde afronden op 2 decimalen. Disconteringsfactoren tonen met 6 decimalen.

Output-contract

1. Primaire outputs
    INVUL: dcfWaarde: totale contante waarde; contanteWaardeKasstromen; contanteWaardeEindwaarde; waccPercentage; horizonJaren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: dcfSchema[] met jaar, kasstroom, disconteringsfactor, contante waarde kasstroom. Optioneel grafiek nominale kasstromen versus contante waarden.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; WACC als 8,00%; factoren met 6 decimalen; jaren als gehele getallen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen kasstromen is onvoldoende. Niet-numerieke kasstromen of WACC zijn ongeldig. WACC 0% is geldig. Eindwaarde is optioneel; leeg betekent 0.
2. Domeinbeperkingen
    INVUL: wacc > -100%; maximaal 100 kasstroomjaren. Kasstromen en eindwaarde mogen positief, nul of negatief zijn. Als later Gordon Growth wordt toegevoegd, moet groeipercentage lager zijn dan WACC.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één kasstroom in.” / “Vul een geldige WACC in.” / “De WACC moet hoger zijn dan -100%.” / “De horizon is te lang voor deze berekening.”

Testset

1. Basiscase
    INVUL: Invoer: WACC 10%, kasstromen [100, 100, 100], eindwaarde 1000. Verwacht: contante waarde kasstromen circa € 248,69, contante waarde eindwaarde circa € 751,31, DCF-waarde circa € 1.000,00.
2. Edge-case
    INVUL: Invoer: WACC 0%, kasstromen [100, 200, 300], eindwaarde 400. Verwacht: DCF-waarde € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: WACC 8%, kasstromen [1000, 1100, 1200], eindwaarde 5000. Verwacht: DCF-waarde circa € 6.071,59.