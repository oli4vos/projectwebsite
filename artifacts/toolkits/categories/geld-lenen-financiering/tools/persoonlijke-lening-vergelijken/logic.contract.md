# Persoonlijke lening vergelijken — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/persoonlijke-lening-vergelijken.html

## Uit invulblad

Persoonlijke lening vergelijken

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/persoonlijke-lening-vergelijken.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van twee persoonlijke leningen op maandbedrag, totale rente en totaal te betalen bedrag.
2. Exacte formules/stappenvolgorde
    INVUL: Voor lening A en B afzonderlijk: P = leenbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Bij r > 0: maandbedrag = P * r / (1 - (1+r)^(-n)); bij r = 0: maandbedrag = P / n. Daarna totaalBetaald = maandbedrag * n, totaleRente = totaalBetaald - P. Verschillen: verschilMaandbedrag, verschilTotaleRente, verschilTotaalBetaald.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten naar maandrente. Looptijd in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedragen en totalen op 2 decimalen. Verschillen op 2 decimalen. Goedkoopste lening bepalen op laagste totaalBetaald; bij gelijke totaalbedragen op laagste maandbedrag.

Output-contract

1. Primaire outputs
    INVUL: leningA.maandbedrag, leningA.totaleRente, leningA.totaalBetaald, leningB.maandbedrag, leningB.totaleRente, leningB.totaalBetaald, goedkoopsteOptie, besparing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijkingstabel lening A versus lening B; optioneel aflosschema’s en grafiek cumulatief betaald bedrag.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Voor beide leningen zijn leenbedrag, rente en looptijd nodig. Leenbedrag <= 0, looptijd <= 0, niet-numerieke waarden zijn ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul voor beide leningen een positief leenbedrag in.” / “Vul voor beide leningen een positieve looptijd in.” / “Vul geldige rentepercentages in.”

Testset

1. Basiscase
    INVUL: Lening A: € 10.000, 6%, 60 maanden; lening B: € 10.000, 8%, 60 maanden. Verwacht: lening A goedkoper.
2. Edge-case
    INVUL: Lening A en B zelfde bedrag, rente en looptijd. Verwacht: besparing € 0, geen financieel verschil.
3. Regresstest tegen bekende uitkomst
    INVUL: Lening A: € 5.000, 12%, 24 maanden; lening B: € 5.000, 6%, 24 maanden. Verwacht: B heeft lagere maandtermijn en lagere totale rente.
