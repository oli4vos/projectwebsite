Gezin & Relatie — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: gezin-relatie
Aantal tools in dit invulblad: 12

Aanvullend partnerverlof

Bron-URL: https://www.externe-bron.nl/kinderen/aanvullend-partnerverlof-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel aanvullend partnerverlof kan worden opgenomen en wat het bruto/netto inkomenseffect is ten opzichte van normaal loon.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal weekloon = brutoMaandloon * 12 / 52 of gebruik direct ingevoerd weekloon. Stap 2: bepaal maxVerlofWeken = 5 * arbeidsduurPerWeek / arbeidsduurPerWeek = 5 weken, tenzij UI verlofuren gebruikt: maxVerlofUren = 5 * arbeidsduurPerWeek. Stap 3: opgenomenVerlofUren = min(gevraagdeVerlofUren, maxVerlofUren). Stap 4: loonPerUur = brutoMaandloon * 12 / (52 * arbeidsduurPerWeek). Stap 5: normaalBrutoLoonVerlofuren = opgenomenVerlofUren * loonPerUur. Stap 6: uitkeringBruto = normaalBrutoLoonVerlofuren * uitkeringspercentage, waarbij uitkeringspercentage parametriseerbaar is, standaard 70%. Stap 7: pas maximumdagloon toe indien actief: uitkeringBruto = min(uitkeringBruto, maxUitkeringOverUren). Stap 8: brutoInkomensverlies = normaalBrutoLoonVerlofuren - uitkeringBruto. Netto-uitkomst alleen berekenen als loonheffingparameters beschikbaar zijn; anders bruto tonen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon naar jaarloon via * 12; jaarloon naar weekloon via / 52; weekloon naar uurloon via / arbeidsduurPerWeek. Percentage 70 betekent 70% en intern 0,70. Alle bedragen in euro.
4. Afrondingsregels
    INVUL: Uren afronden op 2 decimalen. Eurobedragen afronden op 2 decimalen. Percentages tonen met 2 decimalen. Netto-berekening pas na alle bruto-stappen afronden.

Output-contract

1. Primaire outputs
    INVUL: maxVerlofUren, opgenomenVerlofUren, normaalBrutoLoon, uitkeringBruto, brutoInkomensverlies, optioneel nettoInkomensverlies.
2. Secundaire outputs/tabellen/grafieken
    INVUL: verlofSchema[] per week met verlofuren, normaal loon, uitkering en verlies. Optioneel grafiek normaal loon versus uitkering.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 70,00%; uren met maximaal 2 decimalen; weken met maximaal 1 decimaal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto maandloon leeg/niet-numeriek of < 0 is ongeldig. Arbeidsduur per week <= 0 is ongeldig. Gevraagde verlofuren < 0 is ongeldig. Als bruto maandloon 0 is, is berekening geldig maar uitkering 0.
2. Domeinbeperkingen
    INVUL: arbeidsduurPerWeek > 0; opgenomenVerlofUren <= 5 * arbeidsduurPerWeek; 0 <= uitkeringspercentage <= 100; maximumdagloon en fiscale parameters zijn jaartabelparameters, geen hardcoded logica.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bruto maandloon in.” / “Vul een geldige arbeidsduur per week in.” / “Het aantal verlofuren mag niet negatief zijn.” / “Het aangevraagde verlof is hoger dan het maximum.”

Testset

1. Basiscase
    INVUL: Bruto maandloon € 3.000, arbeidsduur 40 uur, verlof 200 uur, uitkeringspercentage 70%, geen maximumdagloon. Verwacht: normaal bruto loon circa € 3.461,54, uitkering € 2.423,08, bruto verlies € 1.038,46.
2. Edge-case
    INVUL: Bruto maandloon € 3.000, arbeidsduur 40 uur, verlof 0 uur. Verwacht: uitkering € 0, verlies € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto maandloon € 2.600, arbeidsduur 32 uur, verlof 160 uur, uitkeringspercentage 70%. Verwacht: normaal bruto loon € 3.000,00, uitkering € 2.100,00, bruto verlies € 900,00.

Betaald ouderschapsverlof

Bron-URL: https://www.externe-bron.nl/kinderen/betaald-ouderschapsverlof-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel betaald ouderschapsverlof kan worden opgenomen en wat de bruto/netto inkomensgevolgen zijn.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal arbeidsduurPerWeek. Stap 2: bepaal maxBetaaldVerlofUren = betaaldVerlofWeken * arbeidsduurPerWeek, standaard 9 * arbeidsduurPerWeek, maar parametriseerbaar. Stap 3: opgenomenVerlofUren = min(gevraagdeVerlofUren, maxBetaaldVerlofUren). Stap 4: uurloon = brutoMaandloon * 12 / (52 * arbeidsduurPerWeek). Stap 5: normaalBrutoLoonVerlofuren = opgenomenVerlofUren * uurloon. Stap 6: uitkeringBruto = normaalBrutoLoonVerlofuren * uitkeringspercentage, standaard 70%, begrensd door maximumdagloon indien parameter actief. Stap 7: brutoInkomensverlies = normaalBrutoLoonVerlofuren - uitkeringBruto.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon naar jaarloon via * 12; jaarloon naar uurloon via / (52 * urenPerWeek). Percentage-invoer delen door 100. Alle bedragen in euro. Verlof kan in uren of weken; weken naar uren via weken * arbeidsduurPerWeek.
4. Afrondingsregels
    INVUL: Uren op 2 decimalen. Eurobedragen op 2 decimalen. Verlofweken op 2 decimalen. Netto-effecten apart afronden na belastingberekening.

Output-contract

1. Primaire outputs
    INVUL: maxBetaaldVerlofUren, opgenomenVerlofUren, uitkeringBruto, normaalBrutoLoonVerlofuren, brutoInkomensverlies, optioneel nettoInkomensverlies.
2. Secundaire outputs/tabellen/grafieken
    INVUL: verlofSchema[] per week of maand met opgenomen uren, uitkering en verlies. Optioneel resterend betaald verlof.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; uren met 2 decimalen; weken met 1 of 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto maandloon leeg/niet-numeriek of < 0 is ongeldig. Arbeidsduur <= 0 is ongeldig. Verlofuren < 0 is ongeldig. Geboorte-/leeftijdsvoorwaarden zijn alleen valideerbaar als geboortedatum kind is ingevuld; anders “onvoldoende”.
2. Domeinbeperkingen
    INVUL: arbeidsduurPerWeek > 0; opgenomenVerlofUren <= betaaldVerlofWeken * arbeidsduurPerWeek; 0 <= uitkeringspercentage <= 100. Wettelijke leeftijdsgrenzen en maximumdagloon zijn jaartabelparameters.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bruto maandloon in.” / “Vul een geldige arbeidsduur per week in.” / “Het aantal verlofuren mag niet negatief zijn.” / “Er zijn onvoldoende gegevens om te bepalen of het verlof nog binnen de wettelijke termijn valt.”

Testset

1. Basiscase
    INVUL: Bruto maandloon € 3.000, arbeidsduur 40 uur, betaald verlof 9 weken, opgenomen 360 uur, uitkering 70%, geen maximumdagloon. Verwacht: normaal bruto loon € 6.230,77, uitkering € 4.361,54, verlies € 1.869,23.
2. Edge-case
    INVUL: Opgenomen verlof 0 uur. Verwacht: uitkering € 0, verlies € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto maandloon € 2.600, arbeidsduur 32 uur, opgenomen 288 uur, uitkering 70%. Verwacht: normaal bruto loon € 5.400,00, uitkering € 3.780,00, verlies € 1.620,00.

Eigen bijdrage Wmo (ivb)

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/eigen-bijdrage-wmo.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen welke eigen bijdrage voor Wmo-ondersteuning verschuldigd is, op basis van maandtarief, periode, huishoudtype en eventueel inkomen/vermogen indien het gekozen jaarregime dat vereist.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal regime via jaartabel: vast abonnementstarief of inkomens-/vermogensafhankelijke bijdrage. Stap 2 bij vast tarief: eigenBijdragePerMaand = min(wmoTariefPerMaand, kostprijsVoorzieningPerMaand) indien kostprijsbegrenzing actief is. Stap 3 bij inkomensafhankelijk: bijdrageplichtigInkomen = max(0, inkomen + vermogenBijtelling - vrijstelling), jaarbijdrage = basisbedrag + percentage * bijdrageplichtigInkomen, eigenBijdragePerMaand = jaarbijdrage / 12, begrensd op kostprijs. Stap 4: totaalEigenBijdrage = eigenBijdragePerMaand * aantalMaanden.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen en vermogen worden per jaar ingevoerd. Eigen bijdrage wordt per maand getoond. Jaarbedragen naar maandbedragen via / 12. Percentages delen door 100. Alle wettelijke bedragen, vrijstellingen en tarieven komen uit jaartabelparameters.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen. Jaarbedragen op 2 decimalen. Bij wettelijke afronding kan jaartabel roundingMode bepalen; standaard centafronding.

Output-contract

1. Primaire outputs
    INVUL: eigenBijdragePerMaand, totaalEigenBijdrage, regime, kostprijsBegrenzingToegepast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsregels[] met tarief, inkomen, vermogen, vrijstelling, percentage en begrenzingen. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; periode als maanden; regime als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Jaar/regime ontbreekt is onvoldoende. Negatief inkomen of negatief vermogen is ongeldig, tenzij expliciet toegestaan door UI. Aantal maanden <= 0 is ongeldig. Bij inkomensafhankelijk regime zijn inkomen en huishoudtype verplicht; ontbreken daarvan is onvoldoende.
2. Domeinbeperkingen
    INVUL: aantalMaanden > 0; kostprijsVoorziening >= 0; wmoTariefPerMaand >= 0; wettelijke parameters mogen niet ontbreken voor gekozen jaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Kies een geldig berekeningsjaar.” / “Vul een geldige periode in.” / “Vul inkomensgegevens in voor deze berekening.” / “Voor dit jaar ontbreken de wettelijke parameters.”

Testset

1. Basiscase
    INVUL: Vast tarief € 20,00 per maand, periode 12 maanden, kostprijs hoger dan tarief. Verwacht: totaal € 240,00.
2. Edge-case
    INVUL: Vast tarief € 20,00, kostprijs € 10,00 per maand, periode 12. Verwacht: eigen bijdrage € 10,00 per maand, totaal € 120,00.
3. Regresstest tegen bekende uitkomst
    INVUL: Inkomensregime: basisbedrag € 100 per jaar, percentage 10%, inkomen € 30.000, vrijstelling € 25.000, periode 12 maanden. Verwacht: jaarbijdrage € 600, maandbijdrage € 50.

Gesubsidieerde rechtsbijstand

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/gesubsidieerde-rechtsbijstand.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief bepalen of iemand in aanmerking komt voor gesubsidieerde rechtsbijstand en welke eigen bijdragecategorie geldt.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal huishoudtype en toepasselijke jaartabel. Stap 2: bepaal toetsingsinkomen en toetsingsvermogen. Stap 3: vergelijk vermogen met vermogensgrens; als vermogen boven grens: rechtOpToevoeging = false. Stap 4: vergelijk inkomen met inkomensschijven voor huishoudtype. Stap 5: als inkomen boven hoogste grens: geen recht. Stap 6: anders bepaal eigenBijdrage uit de inkomensschijf. Stap 7: eventuele korting/verlaging via diagnose-document of mediation als aparte parameter toepassen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen en vermogen zijn jaarbedragen in euro. Maandinkomen kan naar jaarinkomen via * 12. Alle grenzen en eigen bijdragen worden via jaartabelparameters geladen.
4. Afrondingsregels
    INVUL: Inkomen en vermogen op hele euro’s of 2 decimalen accepteren; voor vergelijking niet afronden tenzij jaartabel dat voorschrijft. Eigen bijdrage als eurobedrag met 2 decimalen tonen.

Output-contract

1. Primaire outputs
    INVUL: rechtOpGesubsidieerdeRechtsbijstand: boolean; eigenBijdrage; inkomensCategorie; redenAfwijzing indien geen recht.
2. Secundaire outputs/tabellen/grafieken
    INVUL: toetsing[] met inkomenstoets, vermogenstoets en toegepaste schijf. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; status als “waarschijnlijk recht” of “waarschijnlijk geen recht”; duidelijke tekst “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Huishoudtype ontbreekt is onvoldoende. Inkomen ontbreekt is onvoldoende. Negatief inkomen of vermogen is ongeldig. Ontbrekende jaartabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: toetsingsinkomen >= 0; toetsingsvermogen >= 0; huishoudtype moet voorkomen in jaartabel; gekozen jaar moet ondersteund zijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Kies een geldig huishoudtype.” / “Vul een geldig toetsingsinkomen in.” / “Vul een geldig vermogen in.” / “Voor dit jaar ontbreken de grenzen voor gesubsidieerde rechtsbijstand.”

Testset

1. Basiscase
    INVUL: Jaartabel: alleenstaand grens € 30.000, vermogen grens € 50.000, eigen bijdrage € 250. Invoer inkomen € 25.000, vermogen € 10.000. Verwacht: recht true, eigen bijdrage € 250.
2. Edge-case
    INVUL: Inkomen onder grens maar vermogen € 60.000 bij vermogensgrens € 50.000. Verwacht: geen recht wegens vermogen.
3. Regresstest tegen bekende uitkomst
    INVUL: Schijven: tot € 20.000 eigen bijdrage € 150, tot € 30.000 eigen bijdrage € 300. Inkomen € 22.000, vermogen binnen grens. Verwacht: eigen bijdrage € 300.

Indexering alimentatie

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/alimentatie-indexering.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het geïndexeerde alimentatiebedrag over één of meerdere jaren op basis van jaarlijkse indexeringspercentages.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: start met bedragStart. Stap 2: voor elk jaar y vanaf eerste indexeringsjaar tot en met eindjaar: bedrag_y = bedrag_(y-1) * (1 + indexPercentage_y / 100). Stap 3: sla per jaar het nieuwe bedrag en de verhoging op. Stap 4: als indexering voor een jaar ontbreekt, markeer invoer als onvoldoende.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alimentatiebedrag is meestal bedrag per maand in euro. Indexering is percentage per jaar. Jaarlijkse indexering wordt toegepast op het maandbedrag. Jaarbedrag optioneel: maandbedrag * 12.
4. Afrondingsregels
    INVUL: Per jaar nieuw maandbedrag afronden op 2 decimalen. Voor meerjarige indexering steeds doorrekenen met het afgeronde bedrag van het vorige jaar als dat aansluit bij UI; alternatief via parameter compoundOnRoundedAmount. Standaard: afronden per jaar.

Output-contract

1. Primaire outputs
    INVUL: geindexeerdMaandbedrag, totaalIndexatiePercentage, verhogingPerMaand, verhogingPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: indexatieSchema[] met jaar, indexpercentage, oud maandbedrag, verhoging, nieuw maandbedrag. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 1 of 2 decimalen; jaren als viercijferig jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Startbedrag leeg/niet-numeriek of < 0 is ongeldig. Startjaar of eindjaar ontbreekt is onvoldoende. Eindjaar vóór startjaar is ongeldig. Ontbrekend indexpercentage voor een vereist jaar is onvoldoende.
2. Domeinbeperkingen
    INVUL: bedragStart >= 0; eindjaar >= startjaar; indexpercentage mag negatief zijn als jaartabel dat bevat, maar standaard groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig alimentatiebedrag in.” / “Kies een geldig start- en eindjaar.” / “Voor één of meer jaren ontbreekt het indexeringspercentage.”

Testset

1. Basiscase
    INVUL: Startbedrag € 500, index 3% voor één jaar. Verwacht: nieuw maandbedrag € 515,00.
2. Edge-case
    INVUL: Startbedrag € 500, index 0%. Verwacht: nieuw maandbedrag € 500,00.
3. Regresstest tegen bekende uitkomst
    INVUL: Startbedrag € 1.000, indexen 2% en 3%. Verwacht: na jaar 1 € 1.020,00, na jaar 2 € 1.050,60.

Kinderalimentatie

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/kinderalimentatie-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen welk bedrag aan kinderalimentatie past bij behoefte van het kind, draagkracht van ouders en zorgkorting.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal behoefteKinderenPerMaand via directe invoer of behoefte-tabelparameter op basis van netto gezinsinkomen vóór scheiding en aantal kinderen. Stap 2: bepaal per ouder draagkrachtOuder = max(0, draagkrachtFormule(nettoBesteedbaarInkomen, noodzakelijkeLasten, jaarParameters)). Simpele standaardformule indien geen wettelijke tabel: draagkracht = max(0, nettoInkomen - draagkrachtloosInkomen) * draagkrachtPercentage. Stap 3: totaleDraagkracht = draagkrachtOuder1 + draagkrachtOuder2. Stap 4: aandeel alimentatieplichtige: aandeel = behoefte * draagkrachtPlichtige / totaleDraagkracht. Stap 5: zorgkorting: zorgkorting = behoefte * zorgkortingPercentage. Stap 6: kinderalimentatie = max(0, aandeel - zorgkorting), tenzij tekort aan draagkracht via tekortverdeling apart wordt toegepast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens, behoefte, draagkracht en alimentatie per maand. Jaarinkomen naar maandinkomen via / 12. Percentages delen door 100. Juridische tabellen, draagkrachtpercentages en zorgkortingpercentages zijn jaartabelparameters.
4. Afrondingsregels
    INVUL: Tussenuitkomsten intern volledig precies. Alimentatie per maand op 2 decimalen of hele euro’s afhankelijk van UI-parameter. Standaard hele euro’s voor eindbedrag, onderliggende waarden 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kinderalimentatiePerMaand, behoefteKinderen, draagkrachtOuder1, draagkrachtOuder2, aandeelPlichtige, zorgkorting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsstappen[] met behoefte, draagkracht, draagkrachtvergelijking en zorgkorting. Optioneel verdeling per kind.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand; eindbedrag eventueel afgerond op hele euro’s; percentages met 2 decimalen; duidelijke tekst “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Behoefte ontbreekt én onvoldoende gegevens voor behoefte-tabel is onvoldoende. Negatieve inkomens of lasten zijn ongeldig. Totale draagkracht 0 maakt verdeling onmogelijk; dan alimentatie 0 of melding onvoldoende draagkracht.
2. Domeinbeperkingen
    INVUL: aantalKinderen >= 1; behoefte >= 0; draagkracht >= 0; 0 <= zorgkortingPercentage <= 100. Jaarparameters moeten beschikbaar zijn voor gekozen jaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul de behoefte van de kinderen in of voldoende gegevens om deze te berekenen.” / “Vul geldige inkomensgegevens in.” / “Er is geen draagkracht om alimentatie te verdelen.” / “Voor dit jaar ontbreken alimentatieparameters.”

Testset

1. Basiscase
    INVUL: Behoefte € 800, draagkracht ouder A € 600, draagkracht ouder B € 400, plichtige A, zorgkorting 25%. Verwacht: aandeel A € 480, zorgkorting € 200, alimentatie € 280.
2. Edge-case
    INVUL: Behoefte € 800, draagkracht beide ouders € 0. Verwacht: alimentatie € 0 of melding geen draagkracht.
3. Regresstest tegen bekende uitkomst
    INVUL: Behoefte € 1.000, draagkracht plichtige € 750, andere ouder € 250, zorgkorting 15%. Verwacht: aandeel € 750, zorgkorting € 150, alimentatie € 600.

Kinderbijslag berekenen

Bron-URL: https://www.externe-bron.nl/kinderen/kinderbijslag-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel kinderbijslag per kwartaal en per jaar wordt ontvangen op basis van aantal kinderen, leeftijden en jaartabelbedragen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal per kind de leeftijd op peildatum. Stap 2: bepaal leeftijdscategorie uit jaartabel, bijvoorbeeld 0-5, 6-11, 12-17. Stap 3: haal bedragPerKwartaal op uit jaartabel. Stap 4: totaalPerKwartaal = Σ bedragPerKind. Stap 5: totaalPerJaar = totaalPerKwartaal * 4. Stap 6: als kind 18 jaar of ouder is, bedrag 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Kinderbijslagbedragen zijn per kwartaal. Jaarbedrag = kwartaalbedrag * 4. Leeftijd wordt bepaald in jaren op peildatum. Bedragen in euro.
4. Afrondingsregels
    INVUL: Bedragen per kind en totalen op 2 decimalen. Leeftijd in hele jaren op peildatum. Geen tussentijdse afronding nodig buiten bedragen.

Output-contract

1. Primaire outputs
    INVUL: totaalKinderbijslagPerKwartaal, totaalKinderbijslagPerJaar, aantalKinderenMetRecht.
2. Secundaire outputs/tabellen/grafieken
    INVUL: kinderen[] met leeftijd, leeftijdscategorie, bedragPerKwartaal en bedragPerJaar. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; leeftijden als gehele jaren; kwartaal en jaar duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen kinderen ingevuld is onvoldoende. Ongeldige geboortedatum is ongeldig. Ontbrekende jaartabel voor gekozen kwartaal/jaar is onvoldoende.
2. Domeinbeperkingen
    INVUL: Leeftijd kind moet >= 0. Kinderen vanaf 18 krijgen standaard € 0. Jaartabel moet alle leeftijdscategorieën bevatten.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één kind in.” / “Vul een geldige geboortedatum in.” / “Voor dit kwartaal ontbreken de kinderbijslagbedragen.”

Testset

1. Basiscase
    INVUL: Jaartabel: 0-5 = € 250, 6-11 = € 300, 12-17 = € 350. Kinderen: 3 jaar en 8 jaar. Verwacht: kwartaal € 550, jaar € 2.200.
2. Edge-case
    INVUL: Kind 18 jaar. Verwacht: bedrag € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaartabel zoals hierboven; kinderen 1, 7 en 13 jaar. Verwacht: kwartaal € 900, jaar € 3.600.

Kosten kinderopvang

Bron-URL: https://www.externe-bron.nl/kinderen/kosten-kinderopvang.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto kosten kinderopvang, kinderopvangtoeslag en netto kosten per maand en per jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: per kind en opvangsoort: brutoKosten = urenPerMaand * uurtarief. Stap 2: vergoedUurtarief = min(uurtarief, maximumUurtariefOpvangsoort). Stap 3: vergoedeKosten = urenPerMaand * vergoedUurtarief. Stap 4: bepaal toeslagPercentage uit jaartabel op basis van toetsingsinkomen, aantal kinderen en rangorde kind. Stap 5: kinderopvangtoeslag = vergoedeKosten * toeslagPercentage. Stap 6: nettoKosten = brutoKosten - kinderopvangtoeslag. Stap 7: sommeer per maand en per jaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Uren per maand. Uurtarief in euro per uur. Maandkosten naar jaar via * 12. Toetsingsinkomen is jaarinkomen. Percentages uit tabel delen door 100.
4. Afrondingsregels
    INVUL: Kosten per kind op 2 decimalen. Toeslag per kind op 2 decimalen. Totalen op 2 decimalen. Percentages tonen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoKostenPerMaand, kinderopvangtoeslagPerMaand, nettoKostenPerMaand, brutoKostenPerJaar, toeslagPerJaar, nettoKostenPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: kinderen[] met opvangsoort, uren, uurtarief, maximumuurtarief, vergoede kosten, toeslagpercentage en netto kosten. Optioneel grafiek bruto versus netto.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; uren met 2 decimalen; uurtarief met 2 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekend toetsingsinkomen is onvoldoende voor toeslagberekening. Uren < 0, uurtarief < 0 of niet-numerieke invoer is ongeldig. Ontbrekende opvangsoort is onvoldoende. Ontbrekende jaartabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: urenPerMaand >= 0; uurtarief >= 0; maximumuurtarieven en toeslagpercentages moeten bestaan voor gekozen jaar. Toeslagpercentage tussen 0 en 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig toetsingsinkomen in.” / “Vul geldige opvanguren en uurtarieven in.” / “Kies een opvangsoort.” / “Voor dit jaar ontbreken de toeslagpercentages of maximumuurtarieven.”

Testset

1. Basiscase
    INVUL: Uren 100, uurtarief € 9, maximumuurtarief € 8, toeslagpercentage 80%. Verwacht: bruto € 900, toeslag € 640, netto € 260.
2. Edge-case
    INVUL: Uren 0, uurtarief € 9. Verwacht: bruto € 0, toeslag € 0, netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Twee kinderen: kind 1 100 uur * € 8, toeslag 80%; kind 2 80 uur * € 8, toeslag 90%; maximumuurtarief € 8. Verwacht: bruto € 1.440, toeslag € 1.216, netto € 224.

Partner uitkopen uit eigen woning

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/partner-uitkopen-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk bedrag de blijvende partner moet betalen om de andere partner uit te kopen uit de gezamenlijke woning, rekening houdend met woningwaarde, hypotheekschuld, eigendomsverhouding en eventuele correcties.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nettoOverwaarde = woningwaarde - hypotheekschuld - verkoopOfOverdrachtsKosten + overigeCorrecties. Stap 2: aandeelVertrekkendePartner = nettoOverwaarde * eigendomspercentageVertrekkendePartner / 100. Stap 3: pas persoonlijke vorderingen/vergoedingen toe: uitkoopbedrag = aandeelVertrekkendePartner + vergoedingAanVertrekkende - vergoedingDoorVertrekkende. Stap 4: als nettoOverwaarde negatief is: aandeel is negatieve overwaarde en kan leiden tot vergoeding door vertrekkende partner aan blijvende partner, afhankelijk van gekozen tekenconventie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro op peildatum. Eigendomspercentage in procenten. Geen maand/jaarconversie, tenzij maandlasten als aanvullende informatie worden getoond.
4. Afrondingsregels
    INVUL: Alle geldbedragen op 2 decimalen. Eigendomspercentage met maximaal 4 decimalen accepteren. Eindbedrag eventueel afronden op hele euro’s via UI-parameter.

Output-contract

1. Primaire outputs
    INVUL: nettoOverwaarde, aandeelVertrekkendePartner, correctiesSaldo, uitkoopbedrag, richtingBetaling.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsregels[] met woningwaarde, hypotheek, kosten, eigendomspercentages en correcties. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; richting als “blijvende partner betaalt” of “vertrekkende partner betaalt”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde ontbreekt of < 0 is ongeldig. Hypotheekschuld < 0 is ongeldig. Eigendomspercentage ontbreekt is onvoldoende. Percentages buiten 0-100 zijn ongeldig.
2. Domeinbeperkingen
    INVUL: woningwaarde >= 0; hypotheekschuld >= 0; 0 <= eigendomspercentageVertrekkendePartner <= 100; kosten en correcties mogen positief of negatief zijn afhankelijk van type.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige hypotheekschuld in.” / “Vul een geldig eigendomspercentage in.” / “De eigendomspercentages moeten samen 100% zijn.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 400.000, hypotheek € 300.000, eigendom vertrekkende partner 50%, geen correcties. Verwacht: netto overwaarde € 100.000, uitkoopbedrag € 50.000.
2. Edge-case
    INVUL: Woningwaarde € 300.000, hypotheek € 300.000, eigendom 50%. Verwacht: uitkoopbedrag € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Woningwaarde € 500.000, hypotheek € 350.000, kosten € 10.000, eigendom vertrekkende 40%, vergoeding aan vertrekkende € 5.000. Verwacht: netto overwaarde € 140.000, aandeel € 56.000, uitkoopbedrag € 61.000.

Partneralimentatie

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/partneralimentatie.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen hoeveel partneralimentatie passend is op basis van behoefte van de alimentatiegerechtigde en draagkracht van de alimentatieplichtige.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal behoefte. Als directe behoefte is ingevuld: gebruik die. Anders: behoefte = behoeftePercentage * nettoGezinsinkomenTijdensRelatie - eigenNettoInkomenGerechtigde, met behoeftePercentage parametriseerbaar, vaak 60% als eenvoudige hofnorm-indicatie. Stap 2: draagkrachtruimtePlichtige = max(0, nettoInkomenPlichtige - noodzakelijkeLastenPlichtige - draagkrachtloosInkomen). Stap 3: beschikbareDraagkracht = draagkrachtruimtePlichtige * draagkrachtPercentage, parameter. Stap 4: partneralimentatie = min(behoefte, beschikbareDraagkracht). Stap 5: bruto/netto conversie alleen als belastingmodule beschikbaar is.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens en alimentatiebedragen standaard per maand. Jaarbedragen naar maand via / 12. Percentages delen door 100. Fiscale parameters per jaar via jaartabel.
4. Afrondingsregels
    INVUL: Tussenuitkomsten intern volledig precies. Eindbedrag partneralimentatie op hele euro’s of 2 decimalen afhankelijk van UI-parameter. Standaard eindbedrag op hele euro’s, details op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: partneralimentatiePerMaand, behoefte, beschikbareDraagkracht, draagkrachtruimte, tekortOfRuimte.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsstappen[] met behoefteberekening, inkomens, lasten, draagkracht en min-beperking. Optioneel bruto/netto specificatie.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand; percentages met 2 decimalen; duidelijke tekst “indicatief, geen Tremarapport”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Behoefte ontbreekt én onvoldoende gegevens voor behoefteberekening is onvoldoende. Negatieve inkomens of lasten zijn ongeldig. Ontbrekende draagkrachtgegevens zijn onvoldoende.
2. Domeinbeperkingen
    INVUL: behoefte >= 0; nettoInkomen >= 0; lasten >= 0; 0 <= draagkrachtPercentage <= 100; 0 <= behoeftePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul de behoefte in of voldoende gegevens om deze te berekenen.” / “Vul geldige inkomensgegevens in.” / “Vul geldige lasten in.” / “Er is geen draagkracht voor partneralimentatie.”

Testset

1. Basiscase
    INVUL: Behoefte € 1.000, beschikbare draagkracht € 700. Verwacht: partneralimentatie € 700.
2. Edge-case
    INVUL: Behoefte € 1.000, beschikbare draagkracht € 0. Verwacht: partneralimentatie € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Netto gezinsinkomen tijdens relatie € 5.000, behoeftepercentage 60%, eigen inkomen gerechtigde € 1.800, draagkracht plichtige € 1.500. Verwacht: behoefte € 1.200, alimentatie € 1.200.

Trouwen en een bruiloft

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/kosten-trouwen-bruiloft-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de totale kosten van trouwen en/of een bruiloft op basis van vaste kostenposten en variabele kosten per gast.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: verzamel vaste kostenposten, bijvoorbeeld gemeente/notaris, kleding, fotografie, ringen, locatie, muziek, decoratie. Stap 2: verzamel variabele kosten per gast, bijvoorbeeld diner, drank, taart, bedankjes. Stap 3: totaleVasteKosten = Σ vasteKosten. Stap 4: totaleVariabeleKosten = aantalGasten * kostenPerGast. Stap 5: totaleKosten = totaleVasteKosten + totaleVariabeleKosten. Stap 6: kostenPerGastGemiddeld = totaleKosten / aantalGasten indien aantalGasten > 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaarconversie. Alle bedragen in euro. Aantal gasten als geheel getal. Eventuele btw is onderdeel van ingevoerde bedragen, tenzij UI aparte btw-optie heeft.
4. Afrondingsregels
    INVUL: Kostenposten en totalen op 2 decimalen. Aantal gasten als integer. Kosten per gast op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleKosten, totaleVasteKosten, totaleVariabeleKosten, kostenPerGastGemiddeld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: kostenposten[] met naam, type vast/variabel, bedrag en subtotaal. Optioneel taartdiagram of categorie-overzicht.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; aantal gasten zonder decimalen; categorieën als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve kosten zijn ongeldig. Aantal gasten < 0 is ongeldig. Als alle kosten leeg zijn, is invoer onvoldoende. Aantal gasten 0 is toegestaan, maar kosten per gast is dan niet relevant.
2. Domeinbeperkingen
    INVUL: aantalGasten >= 0; elke kostenpost >= 0; minimaal één kostenpost of kostenPerGast ingevuld.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één kostenpost in.” / “Kosten mogen niet negatief zijn.” / “Vul een geldig aantal gasten in.”

Testset

1. Basiscase
    INVUL: Vaste kosten € 5.000, aantal gasten 50, kosten per gast € 100. Verwacht: totale kosten € 10.000, kosten per gast gemiddeld € 200.
2. Edge-case
    INVUL: Aantal gasten 0, vaste kosten € 2.000, variabele kosten € 0. Verwacht: totale kosten € 2.000, kosten per gast niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: Vaste kosten € 8.500, gasten 80, kosten per gast € 75. Verwacht: variabel € 6.000, totaal € 14.500, gemiddeld € 181,25.

Vergoedingsrecht binnen een huwelijk

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/vergoedingsrecht-binnen-huwelijk.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk vergoedingsrecht ontstaat wanneer privévermogen is gebruikt voor een gemeenschappelijk goed of gemeenschapsvermogen is gebruikt voor een privégoed, met toepassing van nominale of beleggingsleer afhankelijk van situatie en datum/regime.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal regime: nominaal of beleggingsleer. Stap 2: bepaal inbreng = geïnvesteerdBedrag. Stap 3 bij nominale vergoeding: vergoeding = inbreng. Stap 4 bij beleggingsleer voor goed met waardeontwikkeling: investeringsAandeel = inbreng / waardeGoedTenTijdeVanInvestering; vergoeding = investeringsAandeel * waardeGoedOpPeildatum. Stap 5: als investering deels financiering/aflossing betreft, pas aandeel alleen toe op relevante waardecomponent volgens gekozen rekenoptie. Stap 6: vergoedingsrecht kan positief of negatief zijn afhankelijk van richting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro op relevante datums. Percentages voor eigendoms- of investeringsaandeel in procenten. Geen maand/jaarconversie, behalve datum bepaalt welk juridisch regime/parameter van toepassing is.
4. Afrondingsregels
    INVUL: Geldbedragen op 2 decimalen. Investeringsaandeel intern minimaal 8 decimalen, tonen met 4 decimalen of als percentage met 2 decimalen. Eindvergoeding op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: vergoeding, regime, investeringsAandeel, waardeontwikkelingEffect, richtingVergoeding.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsstappen[] met inbreng, waarde bij investering, waarde peildatum, aandeel en eindvergoeding. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 of 4 decimalen; richting als “privé heeft vordering op gemeenschap” of “gemeenschap heeft vordering op privé”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inbreng leeg/niet-numeriek of < 0 is ongeldig. Bij beleggingsleer ontbrekende waarde bij investering of peildatum is onvoldoende. Waarde bij investering <= 0 is ongeldig. Ontbrekend regime is onvoldoende.
2. Domeinbeperkingen
    INVUL: inbreng >= 0; bij beleggingsleer waardeGoedTenTijdeVanInvestering > 0; waardeGoedOpPeildatum >= 0; investeringsaandeel kan groter dan 100% alleen als expliciet toegestaan, anders waarschuwing.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig geïnvesteerd bedrag in.” / “Vul de waarde bij investering en de waarde op peildatum in.” / “De waarde bij investering moet groter zijn dan 0.” / “Kies of de nominale methode of beleggingsleer moet worden toegepast.”

Testset

1. Basiscase
    INVUL: Beleggingsleer: inbreng € 50.000, waarde bij investering € 250.000, waarde peildatum € 400.000. Verwacht: aandeel 20%, vergoeding € 80.000.
2. Edge-case
    INVUL: Nominale methode: inbreng € 50.000. Verwacht: vergoeding € 50.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Beleggingsleer: inbreng € 30.000, waarde bij investering € 300.000, waarde peildatum € 270.000. Verwacht: aandeel 10%, vergoeding € 27.000.