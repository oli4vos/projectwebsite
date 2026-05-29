# Effectieve rente — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/effectieve-rente.html

## Uit invulblad

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
