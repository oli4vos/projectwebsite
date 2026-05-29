# Hoeveel eigen geld heeft u nodig — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/huis-kopen-hoeveel-eigen-geld.html

## Uit invulblad

Hoeveel eigen geld heeft u nodig

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/huis-kopen-hoeveel-eigen-geld.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel eigen geld nodig is om een woning te kopen, rekening houdend met koopprijs, maximale hypotheek en bijkomende kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: totaleAankoopkosten = koopprijs + kostenKoper + verbouwingskosten + overigeKosten. Stap 2: beschikbareFinanciering = maximaleHypotheek + eigenGeldBeschikbaar. Stap 3: benodigdEigenGeld = max(0, totaleAankoopkosten - maximaleHypotheek). Stap 4: tekortOfOverschot = eigenGeldBeschikbaar - benodigdEigenGeld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro. Kosten koper kunnen direct of als percentage van koopprijs worden ingevoerd: kosten = koopprijs * percentage / 100.
4. Afrondingsregels
    INVUL: Alle bedragen op 2 decimalen. Percentages met 2 decimalen. Eigen geld eventueel op hele euro’s afronden.

Output-contract

1. Primaire outputs
    INVUL: benodigdEigenGeld, totaleAankoopkosten, maximaleHypotheek, tekortOfOverschot.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie kosten koper: overdrachtsbelasting, notaris, advies, taxatie, NHG, verbouwing, overige kosten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; tekort negatief/rood of als tekst “tekort”; overschot als positief.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0 is ongeldig. Maximale hypotheek < 0 is ongeldig. Kosten of eigen geld negatief is ongeldig tenzij correctiepost expliciet negatief mag zijn.
2. Domeinbeperkingen
    INVUL: koopprijs > 0; maximaleHypotheek >= 0; kostenpercentages >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Vul een geldige maximale hypotheek in.” / “Kosten mogen niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, kosten koper € 20.000, maximale hypotheek € 400.000. Verwacht: benodigd eigen geld € 20.000.
2. Edge-case
    INVUL: Kosten koper € 0, maximale hypotheek gelijk aan koopprijs. Verwacht: eigen geld € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, kosten 6%, maximale hypotheek € 285.000. Verwacht: totale kosten € 318.000, benodigd eigen geld € 33.000.
