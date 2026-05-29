# Hypotheek oversluiten — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-oversluiten.html

## Uit invulblad

Hypotheek oversluiten

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-oversluiten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of oversluiten van een hypotheek financieel voordelig is, rekening houdend met lagere rente, boeterente en oversluitkosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken oude maandlast op bestaande schuld, oude rente en resterende looptijd. Stap 2: bereken nieuwe maandlast op nieuwe schuld, nieuwe rente en looptijd. Stap 3: maandbesparing = oudeMaandlast - nieuweMaandlast. Stap 4: totaleOversluitkosten = boeterente + advieskosten + notariskosten + taxatiekosten + overigeKosten. Stap 5: terugverdientijdMaanden = totaleOversluitkosten / maandbesparing indien maandbesparing > 0. Stap 6: nettoVoordeelOverPeriode = maandbesparing * vergelijkingsMaanden - totaleOversluitkosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar naar maand. Looptijden in maanden. Kosten in euro. Fiscale effecten optioneel per jaar naar maand.
4. Afrondingsregels
    INVUL: Maandlasten en kosten op 2 decimalen. Terugverdientijd op 1 decimaal of hele maanden naar boven. Netto voordeel op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: oudeMaandlast, nieuweMaandlast, maandbesparing, totaleOversluitkosten, terugverdientijdMaanden, nettoVoordeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kostenoverzicht; vergelijking oud/nieuw; cumulatief voordeelgrafiek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; terugverdientijd als maanden en jaren; voordeel positief/groen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, rente ontbreekt, looptijd <= 0, kosten negatief of maandbesparing <= 0 maakt terugverdientijd niet relevant.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rente <= 100; kosten >= 0; vergelijkingsperiode > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Kosten mogen niet negatief zijn.” / “Oversluiten levert geen maandelijkse besparing op.”

Testset

1. Basiscase
    INVUL: Oude maandlast € 1.200, nieuwe € 1.000, kosten € 6.000. Verwacht terugverdientijd 30 maanden.
2. Edge-case
    INVUL: Maandbesparing € 0. Verwacht terugverdientijd niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: Besparing € 100/mnd, kosten € 2.400, periode 60 maanden. Verwacht terugverdientijd 24 maanden, netto voordeel € 3.600.
