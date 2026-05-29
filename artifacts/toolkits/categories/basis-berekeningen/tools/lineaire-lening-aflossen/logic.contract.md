# Lineaire lening aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/lineaire-lening-aflossen.html

## Uit invulblad

Lineaire lening aflossen

Bron-URL: https://www.externe-bron.nl/berekenen/lineaire-lening-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het aflosschema, de termijnen en de totale rentekosten van een lineaire lening met vaste aflossing per periode.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = lening. Stap 2: r = rentePerPeriodeDecimal. Stap 3: n = aantalTermijnen. Stap 4: vaste aflossing: aflossing = P / n. Per termijn: renteDeel = restschuldBegin * r; termijnBedrag = aflossing + renteDeel; restschuldEind = restschuldBegin - aflossing. Totale rente: Σ renteDeel. Totaal betaald: P + totaleRente.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Standaard maandtermijnen: r = rentePercentage / 100 / 12; n = looptijdJaren * 12. Bij periodekeuze: maand = 12, kwartaal = 4, jaar = 1.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Aflossing, rente en termijn per periode op centen afronden. Laatste aflossing corrigeren naar resterende restschuld zodat eindschuld € 0,00 wordt.

Output-contract

1. Primaire outputs
    INVUL: vasteAflossing; eersteTermijn; laatsteTermijn; totaalRente; totaalBetaald; aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met termijnnummer, beginSchuld, aflossing, renteDeel, termijnBedrag en eindSchuld. Optioneel grafiek dalende termijn en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; termijnen als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege, niet-numerieke, negatieve of nulwaarde voor lening of looptijd is ongeldig. Rente 0% is geldig. Negatieve rente standaard ongeldig.
2. Domeinbeperkingen
    INVUL: lening > 0; looptijd > 0; 0 <= rentePercentage <= 100; aantalTermijnen <= 1200.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Invoer: lening € 12.000, rente 12%, looptijd 1 jaar, maandtermijnen. Verwacht: vaste aflossing € 1.000, eerste rente € 120, eerste termijn € 1.120.
2. Edge-case
    INVUL: Invoer: lening € 12.000, rente 0%, looptijd 1 jaar, maandtermijnen. Verwacht: elke termijn € 1.000, totaal rente € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: lening € 10.000, rente 6%, looptijd 1 jaar, maandtermijnen. Verwacht: totaal rente € 325,00.
