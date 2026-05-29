Kalender & Vrije tijd — Logica Invulblad

Hoe vul je dit bestand in?

1. Vul per tool alleen de regels achter INVUL: in en laat de structuur staan.
2. Beschrijf formules expliciet, inclusief eenheden (%, euro, maand/jaar) en afrondingen.
3. Leg vast wanneer invoer niet relevant, onvoldoende, of ongeldig is.
4. Voeg per tool minimaal 3 tests toe: basiscase, edge-case en regresstest.
5. Gebruik dezelfde termen als in de tool-UI, zodat implementatie 1-op-1 kan volgen.

Categorie-slug: kalender-vrije-tijd
Aantal tools in dit invulblad: 8

Aantal werkdagen

Bron-URL: https://www.externe-bron.nl/kalender/aantal-werkdagen-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel werkdagen in een periode vallen, met keuze om weekenden en feestdagen wel of niet uit te sluiten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees begindatum, einddatum, werkdagenPatroon en feestdagenMeerekenen. Stap 2: bepaal of de einddatum inclusief of exclusief is; standaard inclusief. Stap 3: loop per kalenderdag van begindatum t/m einddatum. Stap 4: een dag telt als werkdag als de weekdag in werkdagenPatroon zit, standaard maandag t/m vrijdag. Stap 5: als feestdagenUitsluiten = true, tel de dag niet mee wanneer de datum voorkomt in de feestdagentabel voor het gekozen land/regio. Stap 6: tel aantalWerkdagen, aantalWeekenddagen, aantalFeestdagenOpWerkdag en aantalKalenderdagen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Datums worden verwerkt als lokale kalenderdatums zonder tijdzone/tijdstip. Geen euro- of percentageconversie. Periode wordt uitgedrukt in kalenderdagen en werkdagen.
4. Afrondingsregels
    INVUL: Niet relevant; output bestaat uit gehele aantallen dagen. Er wordt niet afgerond.

Output-contract

1. Primaire outputs
    INVUL: aantalWerkdagen: aantal getelde werkdagen; aantalKalenderdagen: totaal aantal dagen in de periode; aantalWeekenddagen: uitgesloten weekenddagen; aantalFeestdagenOpWerkdag: uitgesloten feestdagen die normaal werkdag zouden zijn.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel dagen[] met datum, weekdag, type dag en wel/niet meegeteld. Optioneel samenvatting per maand.
3. Formatregels voor UI
    INVUL: Datums als dd-mm-jjjj; aantallen als gehele getallen; weekdagen in Nederlands, bijvoorbeeld maandag, dinsdag.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende of ongeldige begindatum/einddatum is ongeldig. Einddatum vóór begindatum is ongeldig, tenzij UI expliciet negatieve periode ondersteunt; standaard niet ondersteunen. Ontbrekende feestdagentabel is onvoldoende als feestdagen moeten worden uitgesloten.
2. Domeinbeperkingen
    INVUL: begindatum <= einddatum; periode maximaal bijvoorbeeld 100 jaar om performanceproblemen te voorkomen; werkdagenPatroon moet minimaal één weekdag bevatten.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige begindatum in.” / “Vul een geldige einddatum in.” / “De einddatum mag niet vóór de begindatum liggen.” / “Selecteer minimaal één werkdag.”

Testset

1. Basiscase
    INVUL: Begindatum maandag 01-01-2024, einddatum zondag 07-01-2024, werkdagen maandag t/m vrijdag, geen feestdagen. Verwacht: 5 werkdagen, 7 kalenderdagen.
2. Edge-case
    INVUL: Begindatum zaterdag 06-01-2024, einddatum zondag 07-01-2024, werkdagen maandag t/m vrijdag. Verwacht: 0 werkdagen.
3. Regresstest tegen bekende uitkomst
    INVUL: Begindatum maandag 01-01-2024, einddatum maandag 01-01-2024, maandag is werkdag, feestdagen niet uitsluiten. Verwacht: 1 werkdag. Met feestdagen uitsluiten en 01-01-2024 als feestdag: 0 werkdagen.

Begin- of einddatum

Bron-URL: https://www.externe-bron.nl/kalender/begindatum-einddatum.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van een begindatum of einddatum op basis van een bekende datum en een duur in dagen, weken, maanden of jaren.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal modus: berekenEinddatum of berekenBegindatum. Stap 2: lees bekende datum en periodecomponenten: dagen, weken, maanden, jaren. Stap 3: zet weken om naar dagen: extraDagen = weken * 7 + dagen. Stap 4: bij einddatum: tel eerst jaren en maanden kalenderkundig op bij bekende datum, daarna extra dagen. Bij begindatum: trek eerst jaren en maanden kalenderkundig af, daarna extra dagen. Stap 5: maandcorrectie: als doeldag niet bestaat in doelmaand, gebruik laatste dag van doelmaand, bijvoorbeeld 31 januari + 1 maand = 29 februari in schrikkeljaar of 28 februari in normaal jaar. Stap 6: optioneel werkdagenmodus: tel alleen dagen die in werkdagenPatroon vallen en sla weekenden/feestdagen over.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Weken naar dagen via * 7. Maanden en jaren kalenderkundig, niet als vast aantal dagen. Geen euro- of percentageconversie.
4. Afrondingsregels
    INVUL: Niet relevant; periodecomponenten moeten gehele getallen zijn. Datumuitkomst is een kalenderdatum.

Output-contract

1. Primaire outputs
    INVUL: berekendeDatum: begin- of einddatum; richting: berekeningsrichting; periodeInKalenderdagen: verschil in kalenderdagen tussen begin- en einddatum; optioneel aantalWerkdagen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel overzicht van gebruikte periodecomponenten en eventuele overgeslagen niet-werkdagen.
3. Formatregels voor UI
    INVUL: Datum als dd-mm-jjjj; periode als x jaar, y maanden, z weken, q dagen; aantallen als gehele getallen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bekende datum ontbreekt of is ongeldig. Alle periodecomponenten leeg of 0 is geldig en geeft dezelfde datum, maar kan als “geen periode ingevuld” worden gewaarschuwd. Negatieve periodecomponenten zijn ongeldig, tenzij richting expliciet via modus wordt bepaald.
2. Domeinbeperkingen
    INVUL: Periodecomponenten moeten gehele getallen >= 0 zijn. Resultaatdatum moet binnen ondersteund datumbereik van de applicatie vallen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige datum in.” / “Vul een geldige periode in.” / “Periodewaarden mogen niet negatief zijn.” / “De berekende datum valt buiten het ondersteunde bereik.”

Testset

1. Basiscase
    INVUL: Bekende begindatum 01-01-2024, periode 10 dagen, bereken einddatum. Verwacht: 11-01-2024 als kalenderdagen inclusief start niet als dag 1 wordt geteld; als UI inclusief telt, expliciet parameteriseren. Standaard: datum + 10 dagen = 11-01-2024.
2. Edge-case
    INVUL: Datum 31-01-2024, periode 1 maand. Verwacht: 29-02-2024 vanwege schrikkeljaar en maandcorrectie.
3. Regresstest tegen bekende uitkomst
    INVUL: Datum 01-03-2024, bereken begindatum met periode 1 maand. Verwacht: 01-02-2024.

Dag van de week

Bron-URL: https://www.externe-bron.nl/kalender/weekdag-datum.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen op welke weekdag een opgegeven datum valt.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees datum als lokale kalenderdatum. Stap 2: bepaal weekdag volgens Gregoriaanse kalender. Stap 3: map numerieke weekdag naar Nederlandse naam: maandag = 1, dinsdag = 2, woensdag = 3, donderdag = 4, vrijdag = 5, zaterdag = 6, zondag = 7. Stap 4: bepaal optioneel ISO-weeknummer en dagnummer in het jaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Niet relevant. Geen euro-, percentage- of periodeconversie buiten datuminterpretatie.
4. Afrondingsregels
    INVUL: Niet relevant; output is tekst en gehele kalendernummers.

Output-contract

1. Primaire outputs
    INVUL: weekdagNaam: Nederlandse naam van de weekdag; weekdagNummerISO: maandag 1 t/m zondag 7; datum.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel isoWeeknummer, jaar, dagVanHetJaar.
3. Formatregels voor UI
    INVUL: Datum als dd-mm-jjjj; weekdag met kleine letter of hoofdletter volgens UI-keuze, bijvoorbeeld “maandag”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende, ongeldige of niet-bestaande datum is ongeldig, bijvoorbeeld 31-02-2024.
2. Domeinbeperkingen
    INVUL: Datum moet binnen ondersteund Gregoriaans bereik liggen. Historische kalenderwijzigingen vóór invoering Gregoriaanse kalender worden niet apart ondersteund, tenzij expliciet gekozen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige datum in.” / “Deze datum valt buiten het ondersteunde bereik.”

Testset

1. Basiscase
    INVUL: Datum 29-05-2026. Verwacht: vrijdag.
2. Edge-case
    INVUL: Ongeldige datum 31-02-2024. Verwacht: foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Datum 01-01-2000. Verwacht: zaterdag.

Eerstvolgende of vorige weekdag

Bron-URL: https://www.externe-bron.nl/kalender/eerstvolgende-vorige-weekdag.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat de eerstvolgende of vorige datum is waarop een gekozen weekdag valt, gerekend vanaf een opgegeven datum.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees startdatum, gewensteWeekdag en richting (volgende of vorige). Stap 2: bepaal startWeekdagISO en doelWeekdagISO. Stap 3 bij volgende: delta = (doel - start + 7) % 7; als inclusiefVandaag = false en delta = 0, zet delta = 7. Resultaat = startdatum + delta dagen. Stap 4 bij vorige: delta = (start - doel + 7) % 7; als inclusiefVandaag = false en delta = 0, zet delta = 7. Resultaat = startdatum - delta dagen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Niet relevant. Berekening gebeurt in kalenderdagen.
4. Afrondingsregels
    INVUL: Niet relevant; delta is een geheel aantal dagen tussen 0 en 7.

Output-contract

1. Primaire outputs
    INVUL: berekendeDatum; weekdagNaam; aantalDagenVerschil; richting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel melding of startdatum zelf is meegeteld bij inclusiefVandaag = true.
3. Formatregels voor UI
    INVUL: Datum als dd-mm-jjjj; weekdag in Nederlands; aantal dagen als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Startdatum ontbreekt of ongeldig is ongeldig. Gewenste weekdag ontbreekt of niet in maandag-zondag valt is ongeldig. Richting ontbreekt is onvoldoende.
2. Domeinbeperkingen
    INVUL: Weekdag moet ISO-nummer 1..7 hebben. Richting moet volgende of vorige zijn. Resultaatdatum moet binnen ondersteund bereik liggen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige startdatum in.” / “Kies een geldige weekdag.” / “Kies of u de vorige of eerstvolgende weekdag wilt berekenen.”

Testset

1. Basiscase
    INVUL: Startdatum vrijdag 29-05-2026, gewenste weekdag maandag, richting volgende, inclusiefVandaag false. Verwacht: 01-06-2026, verschil 3 dagen.
2. Edge-case
    INVUL: Startdatum maandag 01-06-2026, gewenste weekdag maandag, richting volgende, inclusiefVandaag false. Verwacht: 08-06-2026. Met inclusiefVandaag true: 01-06-2026.
3. Regresstest tegen bekende uitkomst
    INVUL: Startdatum maandag 01-06-2026, gewenste weekdag vrijdag, richting vorige, inclusiefVandaag false. Verwacht: 29-05-2026.

Feestdagen

Bron-URL: https://www.externe-bron.nl/modules/vakantie/feestdagen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Tonen of berekenen van feestdagen voor een gekozen jaar, land en eventueel regio, inclusief vaste en beweeglijke feestdagen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees jaar, land, optioneel regio. Stap 2: laad feestdagentabel voor land/regio en jaar, of bereken feestdagen via regels. Stap 3: vaste feestdagen: datum = vaste dag/maand, bijvoorbeeld 01-01. Stap 4: beweeglijke feestdagen op basis van Pasen: bereken paaszondag met Gregoriaans algoritme, daarna bijvoorbeeld Goede Vrijdag = Pasen - 2 dagen, Paasmaandag = Pasen + 1, Hemelvaart = Pasen + 39, Pinksteren = Pasen + 49/50. Stap 5: sorteer alle feestdagen op datum. Stap 6: markeer per feestdag of deze op een weekend valt.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Niet relevant. Jaar is een kalenderjaar. Feestdagen zijn kalenderdatums.
4. Afrondingsregels
    INVUL: Niet relevant; datums en aantallen zijn exact.

Output-contract

1. Primaire outputs
    INVUL: feestdagen[] met naam, datum, weekdag, type (vast of beweeglijk), land/regio; aantalFeestdagen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aantal feestdagen op werkdagen, aantal in weekend, optioneel per maand gegroepeerd.
3. Formatregels voor UI
    INVUL: Datums als dd-mm-jjjj; feestdagnamen in Nederlands; weekdag in Nederlands; sortering chronologisch.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Jaar ontbreekt of niet-numeriek is ongeldig. Land ontbreekt is onvoldoende. Geen feestdagentabel/regels voor land/regio is onvoldoende.
2. Domeinbeperkingen
    INVUL: Jaar moet binnen ondersteund bereik liggen, bijvoorbeeld 1900..2100. Land/regio moet ondersteund zijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig jaar in.” / “Kies een land of regio.” / “Voor dit land of jaar zijn geen feestdagen beschikbaar.”

Testset

1. Basiscase
    INVUL: Jaar 2024, land Nederland. Verwacht: Nieuwjaarsdag 01-01-2024; Koningsdag 27-04-2024; Kerst 25-12-2024 en 26-12-2024.
2. Edge-case
    INVUL: Niet-ondersteund land. Verwacht: foutmelding “Voor dit land of jaar zijn geen feestdagen beschikbaar.”
3. Regresstest tegen bekende uitkomst
    INVUL: Jaar 2024, bereken Pasen. Verwacht: paaszondag 31-03-2024, paasmaandag 01-04-2024, hemelvaart 09-05-2024, pinksterzondag 19-05-2024.

Periode duur

Bron-URL: https://www.externe-bron.nl/modules/vakantie/periode-tussen-twee-datums.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoelang de periode tussen twee datums duurt, uitgedrukt in kalenderdagen en optioneel jaren, maanden, weken en dagen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees begindatum, einddatum en inclusiefEinddatum. Stap 2: bereken aantalDagen = verschilInDagen(einddatum - begindatum), en tel +1 als inclusief beide datums wordt gekozen. Stap 3: bereken aantalWeken = floor(aantalDagen / 7) en restDagen = aantalDagen % 7. Stap 4: bereken kalendercomponenten jaren/maanden/dagen door vanaf begindatum zoveel mogelijk volledige jaren en maanden toe te voegen zonder einddatum te overschrijden. Stap 5: optioneel bereken werkdagen via werkdagenlogica.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Weken = 7 kalenderdagen. Jaren en maanden kalenderkundig, niet als vaste dagenaantallen. Geen euro- of percentageconversie.
4. Afrondingsregels
    INVUL: Niet afronden; output in gehele dagen, weken, maanden en jaren. Kalendercomponenten zijn exact volgens gekozen inclusiviteit.

Output-contract

1. Primaire outputs
    INVUL: aantalKalenderdagen; aantalWeken; restDagen; periodeTekst als jaren/maanden/dagen; optioneel aantalWerkdagen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel uitsplitsing per maand of jaar; geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Datums als dd-mm-jjjj; aantallen als gehele getallen; periode als bijvoorbeeld 1 jaar, 2 maanden en 3 dagen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende of ongeldige datums zijn ongeldig. Einddatum vóór begindatum is ongeldig, tenzij negatieve duur expliciet wordt ondersteund; standaard niet.
2. Domeinbeperkingen
    INVUL: begindatum <= einddatum; datum binnen ondersteund bereik; periode maximaal bijvoorbeeld 1000 jaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige begindatum in.” / “Vul een geldige einddatum in.” / “De einddatum mag niet vóór de begindatum liggen.”

Testset

1. Basiscase
    INVUL: Begindatum 01-01-2024, einddatum 08-01-2024, exclusief einddatum. Verwacht: 7 kalenderdagen, 1 week, 0 restdagen.
2. Edge-case
    INVUL: Begindatum gelijk aan einddatum, exclusief einddatum. Verwacht: 0 dagen. Inclusief beide datums: 1 dag.
3. Regresstest tegen bekende uitkomst
    INVUL: Begindatum 01-01-2024, einddatum 01-01-2025, exclusief einddatum. Verwacht: 366 dagen vanwege schrikkeljaar 2024.

Schoolvakanties

Bron-URL: https://www.externe-bron.nl/modules/vakantie/schoolvakanties.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Tonen van schoolvakanties voor een gekozen schooljaar, regio en onderwijstype op basis van een vakantietabel.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees schooljaar, regio en optioneel onderwijstype. Stap 2: laad vakantietabel met vakantieperioden: naam, startdatum, einddatum, regio, verplicht/advies. Stap 3: filter op regio en schooljaar. Stap 4: sorteer op startdatum. Stap 5: bereken per vakantie duurKalenderdagen inclusief start- en einddatum: einddatum - startdatum + 1. Stap 6: optioneel bereken aantal vrije werkdagen/schooldagen door weekenden en feestdagen uit te sluiten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Schooljaar loopt over twee kalenderjaren, bijvoorbeeld 2025-2026. Datums zijn kalenderdatums. Geen euro- of percentageconversie.
4. Afrondingsregels
    INVUL: Niet relevant; vakantieduur in gehele dagen. Geen afronding.

Output-contract

1. Primaire outputs
    INVUL: vakanties[] met naam, regio, startdatum, einddatum, duurKalenderdagen, verplichtOfAdvies; aantalVakanties.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel kalenderweergave; duur per vakantie; eerstvolgende vakantie vanaf peildatum.
3. Formatregels voor UI
    INVUL: Datums als dd-mm-jjjj; regio als Noord, Midden, Zuid; vakantienaam in Nederlands; sortering chronologisch.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schooljaar ontbreekt of heeft ongeldig formaat is ongeldig. Regio ontbreekt is onvoldoende. Ontbrekende vakantietabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: Regio moet ondersteund zijn. Schooljaar moet in dataset vallen. Einddatum vakantie moet op of na startdatum liggen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Kies een geldig schooljaar.” / “Kies een geldige regio.” / “Voor dit schooljaar zijn geen schoolvakanties beschikbaar.”

Testset

1. Basiscase
    INVUL: Vakantietabel bevat voor regio Noord: meivakantie 27-04-2024 t/m 05-05-2024. Verwacht: duur 9 kalenderdagen.
2. Edge-case
    INVUL: Regio niet ondersteund. Verwacht foutmelding “Kies een geldige regio.”
3. Regresstest tegen bekende uitkomst
    INVUL: Periode 21-12-2024 t/m 05-01-2025. Verwacht duur 16 kalenderdagen.

Wisselkoers valuta

Bron-URL: https://www.externe-bron.nl/modules/vakantie/wisselkoers.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van een bedrag van de ene valuta naar een andere valuta op basis van een wisselkoers, inclusief optionele opslag of transactiekosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees bedrag, vanValuta, naarValuta, wisselkoers en optioneel opslagPercentage/vasteKosten. Stap 2: definieer koers als 1 vanValuta = wisselkoers naarValuta. Stap 3: brutoOmrekening = bedrag * wisselkoers. Stap 4: bij procentuele opslag/kosten: koersKosten = brutoOmrekening * opslagPercentage / 100. Stap 5: nettoOntvangen = brutoOmrekening - koersKosten - vasteKosten als kosten in doelvaluta worden ingehouden. Bij kosten in bronvaluta: trek eerst kosten af van bedrag en reken daarna om.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaarconversie. Valutabedragen gebruiken decimalen volgens valuta, meestal 2 decimalen. Percentage 2 betekent 2%.
4. Afrondingsregels
    INVUL: Interne berekening met minimaal 6 decimalen voor wisselkoers. Eindbedrag afronden volgens valuta-decimalen, standaard 2 decimalen. Wisselkoers tonen met 4 tot 6 decimalen.

Output-contract

1. Primaire outputs
    INVUL: omgerekendBedrag; nettoOntvangen; wisselkoers; totaleKosten; vanValuta; naarValuta.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie bruto omrekening, procentuele kosten, vaste kosten en effectieve koers. Optioneel historie als dataset beschikbaar is.
3. Formatregels voor UI
    INVUL: Valutabedragen met valutacode, bijvoorbeeld EUR 1.234,56 of USD 1,234.56 afhankelijk locale; wisselkoers met maximaal 6 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bedrag leeg/niet-numeriek of < 0 is ongeldig. Valutacode ontbreekt of is onbekend is ongeldig. Wisselkoers ontbreekt of <= 0 is ongeldig. Kosten < 0 zijn ongeldig.
2. Domeinbeperkingen
    INVUL: bedrag >= 0; wisselkoers > 0; valutacodes volgens ISO 4217; 0 <= opslagPercentage <= 100; vaste kosten mogen nettoOntvangen niet onder 0 brengen, tenzij negatieve uitkomst expliciet toegestaan.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag in.” / “Kies geldige valuta.” / “Vul een geldige wisselkoers in.” / “Kosten mogen niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Bedrag EUR 100, koers 1 EUR = 1,10 USD, geen kosten. Verwacht: USD 110,00.
2. Edge-case
    INVUL: Bedrag 0, koers 1,10. Verwacht: 0,00.
3. Regresstest tegen bekende uitkomst
    INVUL: Bedrag EUR 100, koers 1,20, opslag 2%, vaste kosten USD 1. Verwacht bruto USD 120,00, procentuele kosten USD 2,40, netto USD 116,60.