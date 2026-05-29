# Maximale boetevrije hypotheekaflossing — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maximale-boetevrije-hypotheekaflossing.html

## Uit invulblad

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
