# Kopen op afbetaling — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/kopen-op-afbetaling.html

## Uit invulblad

Kopen op afbetaling

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/kopen-op-afbetaling.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat kopen op afbetaling werkelijk kost: maandtermijn, totaal betaald bedrag en meerkosten/rente ten opzichte van directe betaling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal aankoopbedrag, aanbetaling, kredietbedrag = aankoopbedrag - aanbetaling, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: maandtermijn = kredietbedrag * r / (1 - (1 + r)^(-n)). Bij r = 0: maandtermijn = kredietbedrag / n. Stap 3: totaalTermijnen = maandtermijn * n; totaalBetaald = aanbetaling + totaalTermijnen; meerkosten = totaalBetaald - aankoopbedrag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Maandrente = jaarrente / 12. Looptijd in maanden. Alle bedragen in euro.
4. Afrondingsregels
    INVUL: Maandtermijn en totalen op 2 decimalen. Laatste termijn corrigeren indien aflosschema wordt getoond. Meerkosten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kredietbedrag, maandtermijn, totaalBetaald, meerkosten, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel betaalschema per maand; vergelijking “nu betalen” versus “op afbetaling”.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; rente als 5,00%; looptijd als aantal maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aankoopbedrag <= 0, aanbetaling negatief, aanbetaling groter dan aankoopbedrag, looptijd <= 0 of niet-numerieke waarden zijn ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: aankoopbedrag > 0; 0 <= aanbetaling <= aankoopbedrag; looptijdMaanden > 0; 0 <= rentePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief aankoopbedrag in.” / “De aanbetaling mag niet hoger zijn dan het aankoopbedrag.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Aankoopbedrag € 1.200, aanbetaling € 0, rente 12%, looptijd 12 maanden. Verwacht: maandtermijn circa € 106,62, meerkosten circa € 79,46.
2. Edge-case
    INVUL: Aankoopbedrag € 1.200, aanbetaling € 1.200. Verwacht: kredietbedrag € 0, maandtermijn € 0, meerkosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aankoopbedrag € 2.000, aanbetaling € 500, rente 6%, looptijd 24 maanden. Verwacht: maandtermijn circa € 66,48.
