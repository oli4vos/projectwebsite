# Looptijd annuïteit berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/looptijd-annuiteit.html

## Uit invulblad

Looptijd annuïteit berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/looptijd-annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel termijnen nodig zijn om een lening volledig af te lossen bij een gegeven annuïtaire termijn en rentepercentage.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = lening. Stap 2: A = termijnBedrag. Stap 3: r = rentePerPeriodeDecimal. Stap 4: bij r = 0: nExact = P / A. Bij r > 0: eerst controleren A > P * r; daarna nExact = -ln(1 - P*r/A) / ln(1 + r). Stap 5: aantalTermijnen = ceil(nExact). Stap 6: laatste termijn eventueel lager door restschuldcorrectie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Standaard maandtermijnen: r = rentePercentage / 100 / 12. Looptijd in jaren: jaren = floor(aantalTermijnen / 12), maanden = aantalTermijnen % 12.
4. Afrondingsregels
    INVUL: Aantal termijnen altijd naar boven afronden. Geldbedragen op 2 decimalen. Laatste termijn berekenen als resterende hoofdsom plus laatste rente, zodat eindschuld nul wordt.

Output-contract

1. Primaire outputs
    INVUL: aantalTermijnen; looptijdJaren; looptijdRestMaanden; laatsteTermijn; totaalBetaald; totaalRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema[] met rente, aflossing en restschuld per termijn. Optionele grafiek restschuld.
3. Formatregels voor UI
    INVUL: Looptijd tonen als x jaar en y maanden; eurobedragen met 2 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lening of termijn leeg, niet-numeriek of <= 0 is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: Bij r > 0 moet termijnBedrag > lening * r; anders wordt de lening nooit afgelost. Maximaal 2400 termijnen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positief termijnbedrag in.” / “De termijn is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Invoer: lening € 10.000, rente 6%, termijn € 860,66, maandtermijnen. Verwacht: 12 termijnen.
2. Edge-case
    INVUL: Invoer: lening € 12.000, rente 0%, termijn € 1.000. Verwacht: 12 termijnen.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: lening € 100.000, rente 5%, termijn € 536,82, maandtermijnen. Verwacht: circa 360 termijnen.
