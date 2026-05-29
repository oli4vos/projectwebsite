# Percentage berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/percentage-berekenen.html

## Uit invulblad

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
