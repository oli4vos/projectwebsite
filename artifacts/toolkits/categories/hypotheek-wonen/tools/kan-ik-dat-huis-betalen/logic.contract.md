# Kan ik dat huis betalen? — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/kan-ik-dat-huis-betalen.html

## Uit invulblad

Kan ik dat huis betalen?

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/kan-ik-dat-huis-betalen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen of een specifieke woning betaalbaar is op basis van koopprijs, eigen geld, maximale hypotheek, maandlasten en inkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken benodigde financiering: benodigdeHypotheek = koopprijs + aankoopkosten + verbouwing - eigenGeld. Stap 2: controleer benodigdeHypotheek <= maximaleHypotheek. Stap 3: bereken bruto maandlast op benodigde hypotheek. Stap 4: bereken netto maandlast indien fiscale parameters beschikbaar. Stap 5: bereken woonquote: woonquote = maandlast / nettoMaandinkomen * 100. Stap 6: betaalbaar indien hypotheektoets en woonquote binnen grens.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarinkomen naar maandinkomen via /12. Rente per jaar naar maandrente. Kostenpercentages over koopprijs.
4. Afrondingsregels
    INVUL: Hypotheekbedragen op hele euro’s of 2 decimalen. Maandlasten op 2 decimalen. Woonquote op 1 of 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: betaalbaar: boolean; benodigdeHypotheek; maximaleHypotheek; brutoMaandlast; nettoMaandlast; woonquote.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kostenoverzicht, financieringsgat/eigen geld, vergelijking benodigde versus maximale hypotheek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; resultaat als “wel/niet betaalbaar”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, eigen geld < 0, inkomen ontbreekt bij woonquote of maximale hypotheek ontbreekt bij toets is onvoldoende/ongeldig.
2. Domeinbeperkingen
    INVUL: koopprijs > 0; eigenGeld >= 0; maximaleHypotheek >= 0; nettoMaandinkomen > 0 voor woonquote.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Vul een geldig bedrag aan eigen geld in.” / “Vul inkomen of maximale hypotheek in om betaalbaarheid te toetsen.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, kosten € 20.000, eigen geld € 30.000, maximale hypotheek € 400.000. Verwacht benodigde hypotheek € 390.000, betaalbaar op hypotheektoets.
2. Edge-case
    INVUL: Eigen geld hoger dan totale aankoopkosten. Verwacht benodigde hypotheek € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 1.500, netto inkomen € 5.000. Verwacht woonquote 30%.
