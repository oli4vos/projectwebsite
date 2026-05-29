# Nominale rente — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/nominale-rente.html

## Uit invulblad

Nominale rente

Bron-URL: https://www.externe-bron.nl/berekenen/nominale-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van effectieve rente op jaarbasis naar nominale rente op jaarbasis bij een gegeven aantal renteperioden per jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: effectieveRenteDecimal = effectieveRentePercentage / 100. Stap 2: bepaal m = periodesPerJaar. Stap 3: nominaleRenteDecimal = m * ((1 + effectieveRenteDecimal)^(1/m) - 1). Stap 4: nominaleRentePercentage = nominaleRenteDecimal * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Effectieve rente is rente per jaar in procenten. periodesPerJaar: jaar = 1, halfjaar = 2, kwartaal = 4, maand = 12, week = 52, dag = 365.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Nominale rente tonen met 3 decimalen. Periode-rente tonen met 4 decimalen indien weergegeven.

Output-contract

1. Primaire outputs
    INVUL: nominaleRentePercentage; effectieveRentePercentage; periodesPerJaar; rentePerPeriodePercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Geen tabel nodig. Optioneel controle: effectieve rente opnieuw berekend uit nominale rente.
3. Formatregels voor UI
    INVUL: Percentages als 12,000%; perioden per jaar als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke effectieve rente of perioden per jaar is ongeldig. periodesPerJaar <= 0 is ongeldig. Effectieve rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: effectieveRente > -100%; periodesPerJaar integer tussen 1 en 365.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige effectieve rente in.” / “Het aantal perioden per jaar moet positief zijn.” / “De effectieve rente moet hoger zijn dan -100%.”

Testset

1. Basiscase
    INVUL: Invoer: effectieve rente 12,683%, perioden per jaar 12. Verwacht: nominale rente circa 12,000%.
2. Edge-case
    INVUL: Invoer: effectieve rente 0%, perioden per jaar 12. Verwacht: nominale rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: effectieve rente 6,136%, perioden per jaar 4. Verwacht: nominale rente circa 6,000%.
