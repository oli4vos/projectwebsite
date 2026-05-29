# Lening aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/lening-aflossen-restschuld.html

## Uit invulblad

Lening aflossen

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/lening-aflossen-restschuld.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel restschuld overblijft na een bepaalde periode van maandelijkse betalingen op een lening.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = beginschuld, A = maandbetaling, r = rentePercentage / 100 / 12, k = aantalBetaaldeMaanden. Stap 2: per maand: rente = restschuldBegin * r, aflossing = A - rente, restschuldEind = restschuldBegin - aflossing. Stap 3: herhaal k maanden. Stap 4: als maandbetaling groter is dan resterende schuld plus rente, corrigeer laatste betaling.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente in procenten naar maandrente via delen door 12. Periode wordt gerekend in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Getoonde maandwaarden op 2 decimalen. Restschuld na periode op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: restschuldNaPeriode, totaalBetaald, totaleRenteBetaald, totaalAfgelost, aantalMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] voor de doorgerekende maanden; optioneel grafiek restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; periode als maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Begingschuld <= 0, maandbetaling <= 0, rente leeg/niet-numeriek of periode negatief is ongeldig. Periode 0 is geldig en geeft beginschuld.
2. Domeinbeperkingen
    INVUL: Bij r > 0 moet maandbetaling > beginschuld * r om af te lossen; anders neemt schuld toe of blijft gelijk. Maximaal 2400 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve beginschuld in.” / “Vul een positief maandbedrag in.” / “De maandbetaling is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Beginschuld € 10.000, rente 6%, maandbetaling € 860,66, periode 6 maanden. Verwacht: restschuld circa € 5.076.
2. Edge-case
    INVUL: Beginschuld € 10.000, rente 0%, maandbetaling € 1.000, periode 3 maanden. Verwacht: restschuld € 7.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 12.000, rente 12%, maandbetaling € 1.066,19, periode 12 maanden. Verwacht: restschuld € 0.
