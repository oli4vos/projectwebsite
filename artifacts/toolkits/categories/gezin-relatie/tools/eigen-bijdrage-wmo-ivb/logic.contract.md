# Eigen bijdrage Wmo (ivb) — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/eigen-bijdrage-wmo.html

## Uit invulblad

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
