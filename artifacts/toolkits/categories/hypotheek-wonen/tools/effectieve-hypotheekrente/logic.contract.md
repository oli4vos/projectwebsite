# Effectieve hypotheekrente — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/modules/wonen/effectievehypotheekrente.html

## Uit invulblad

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
