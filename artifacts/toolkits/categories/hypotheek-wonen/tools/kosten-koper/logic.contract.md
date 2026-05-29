# Kosten koper — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/huis-kopen-kosten-koper.html

## Uit invulblad

Kosten koper

Bron-URL: https://www.externe-bron.nl/hypotheek/huis-kopen-kosten-koper.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de bijkomende kosten bij aankoop van een woning, inclusief overdrachtsbelasting, notaris, advies, taxatie, NHG en overige kosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: overdrachtsbelasting = koopprijs * overdrachtsbelastingPercentage / 100, tenzij vrijstelling van toepassing. Stap 2: som vaste kosten: notaris + hypotheekadvies + taxatie + bouwkundigeKeuring + nhgKosten + makelaar + overigeKosten. Stap 3: kostenKoper = overdrachtsbelasting + vasteKosten. Stap 4: totaleBenodigd = koopprijs + kostenKoper.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Koopprijs en kosten in euro. Percentages over koopprijs of hypotheekbedrag volgens kostenpost. Geen maand/jaarconversie.
4. Afrondingsregels
    INVUL: Kostenposten en totalen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kostenKoper, totaleAankoopkosten, overdrachtsbelasting, vasteKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Kostenpostentabel per categorie; optioneel percentage van koopprijs.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; vrijstelling als ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, kosten negatief of overdrachtsbelastingpercentage buiten bereik is ongeldig. Ontbrekende jaartabel voor overdrachtsbelasting is onvoldoende als percentage niet direct is ingevoerd.
2. Domeinbeperkingen
    INVUL: koopprijs > 0; kosten >= 0; 0 <= overdrachtsbelastingPercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Kosten mogen niet negatief zijn.” / “Voor dit jaar ontbreekt het tarief overdrachtsbelasting.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, overdrachtsbelasting 2%, vaste kosten € 5.000. Verwacht kosten koper € 13.000.
2. Edge-case
    INVUL: Overdrachtsbelastingvrijstelling, vaste kosten € 5.000. Verwacht kosten koper € 5.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, overdrachtsbelasting 10%, vaste kosten € 0. Verwacht € 30.000.
