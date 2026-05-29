# Indexering alimentatie — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/alimentatie-indexering.html

## Uit invulblad

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
