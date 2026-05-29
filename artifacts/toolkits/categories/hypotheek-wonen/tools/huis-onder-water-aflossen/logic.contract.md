# Huis onder water aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheek-aflossen-huis-onder-water.html

## Uit invulblad

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
