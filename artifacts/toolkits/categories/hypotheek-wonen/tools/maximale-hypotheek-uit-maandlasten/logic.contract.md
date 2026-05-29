# Maximale hypotheek uit maandlasten — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-uit-maandlasten.html

## Uit invulblad

Maximale hypotheek uit maandlasten

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-uit-maandlasten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk hypotheekbedrag past bij een gewenste of maximaal betaalbare maandlast, rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: A = maandlast, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: hypotheek = A * (1 - (1+r)^(-n)) / r. Bij r = 0: hypotheek = A * n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandlast in euro per maand. Rente per jaar naar maandrente. Looptijd in jaren naar maanden.
4. Afrondingsregels
    INVUL: Hypotheekbedrag naar beneden afronden op hele euro’s of 2 decimalen. Maandlast op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheek, maandlast, rentePercentage, looptijdMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema bij berekende hypotheek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; rente met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Maandlast <= 0, looptijd <= 0, rente ontbreekt/niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: maandlast > 0; looptijdMaanden > 0; 0 <= rente <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief maandbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Maandlast € 1.432,25, rente 4%, looptijd 30 jaar. Verwacht hypotheek circa € 300.000.
2. Edge-case
    INVUL: Maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht € 360.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 536,82, rente 5%, looptijd 30 jaar. Verwacht circa € 100.000.
