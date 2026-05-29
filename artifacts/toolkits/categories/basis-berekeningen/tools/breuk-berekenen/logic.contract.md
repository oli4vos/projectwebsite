# Breuk berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/breuk-berekenen.html

## Uit invulblad

Breuk berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/breuk-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omzetten van een percentage of decimaal getal naar een vereenvoudigde breuk.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal of invoer als percentage of decimaal wordt gebruikt. Bij percentage: waarde = percentage / 100. Bij decimaal: waarde = invoer. Stap 2: zet decimale waarde om naar teller/noemer op basis van aantal decimalen. Stap 3: reduceer met gcd(abs(teller), noemer). Stap 4: output teller/noemer.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen periode- of euroconversie. Percentage 25% wordt eerst 0,25. Decimaal 0,25 blijft 0,25.
4. Afrondingsregels
    INVUL: Exact converteren tot maximaal 10 decimalen. Als de noemer groter is dan 1.000.000, gebruik beste benadering met maximale noemer 1.000.000.

Output-contract

1. Primaire outputs
    INVUL: breuk: tekstuele breuk zoals 1/4; teller: integer; noemer: positieve integer; decimaleWaarde: numerieke waarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: percentageWeergave en controleWaarde = teller / noemer. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Breuk als teller/noemer; negatieve breuk met minteken voor de teller, bijvoorbeeld -1/4; decimaal met maximaal 10 significante decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke invoer is ongeldig. 0 is geldig en geeft 0/1. Oneindige of NaN-waarden zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Absolute invoer maximaal 1e12. Noemer maximaal 1.000.000 voor praktische output.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig percentage of decimaal getal in.” / “De waarde is te groot om als praktische breuk weer te geven.”

Testset

1. Basiscase
    INVUL: Invoer: 25%. Verwacht: 1/4.
2. Edge-case
    INVUL: Invoer: 0%. Verwacht: 0/1.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: 12,5%. Verwacht: 1/8.
