# Boeterente berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/boeterente-berekenen.html

## Uit invulblad

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
