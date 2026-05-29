# Looptijd aflossing lening — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/looptijd-aflossing-lening.html

## Uit invulblad

Looptijd aflossing lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/looptijd-aflossing-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe lang het duurt om een lening af te lossen met een vast maandbedrag en rentepercentage.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = beginschuld, A = maandbetaling, r = rentePercentage / 100 / 12. Stap 2: bij r = 0: nExact = P / A. Bij r > 0: controleer A > P*r; vervolgens nExact = -ln(1 - P*r/A) / ln(1+r). Stap 3: aantalMaanden = ceil(nExact). Stap 4: bereken schema tot volledige aflossing; laatste betaling corrigeren naar resterende schuld plus rente.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente. Uitkomst in maanden, daarnaast tonen als jaren en maanden: jaren = floor(maanden/12), restMaanden = maanden % 12.
4. Afrondingsregels
    INVUL: Aantal maanden altijd naar boven afronden. Geldbedragen op 2 decimalen. Laatste termijn kan lager zijn dan vast maandbedrag.

Output-contract

1. Primaire outputs
    INVUL: aantalMaanden, looptijdJaren, looptijdRestMaanden, totaalBetaald, totaleRente, laatsteBetaling.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema[]; grafiek restschuld over tijd.
3. Formatregels voor UI
    INVUL: Looptijd als x jaar en y maanden; eurobedragen met 2 decimalen; rente met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Begingschuld <= 0, maandbetaling <= 0, rente leeg/niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: Bij rente > 0 moet maandbetaling > beginschuld * maandrente; maximaal 2400 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve beginschuld in.” / “Vul een positief maandbedrag in.” / “De maandbetaling is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Beginschuld € 10.000, rente 6%, maandbetaling € 860,66. Verwacht: looptijd 12 maanden.
2. Edge-case
    INVUL: Beginschuld € 12.000, rente 0%, maandbetaling € 1.000. Verwacht: looptijd 12 maanden.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 100.000, rente 5%, maandbetaling € 536,82. Verwacht: circa 360 maanden.
