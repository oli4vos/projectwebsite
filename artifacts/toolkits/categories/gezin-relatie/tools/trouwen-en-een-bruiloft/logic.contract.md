# Trouwen en een bruiloft — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/kosten-trouwen-bruiloft-berekenen.html

## Uit invulblad

Trouwen en een bruiloft

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/kosten-trouwen-bruiloft-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de totale kosten van trouwen en/of een bruiloft op basis van vaste kostenposten en variabele kosten per gast.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: verzamel vaste kostenposten, bijvoorbeeld gemeente/notaris, kleding, fotografie, ringen, locatie, muziek, decoratie. Stap 2: verzamel variabele kosten per gast, bijvoorbeeld diner, drank, taart, bedankjes. Stap 3: totaleVasteKosten = Σ vasteKosten. Stap 4: totaleVariabeleKosten = aantalGasten * kostenPerGast. Stap 5: totaleKosten = totaleVasteKosten + totaleVariabeleKosten. Stap 6: kostenPerGastGemiddeld = totaleKosten / aantalGasten indien aantalGasten > 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaarconversie. Alle bedragen in euro. Aantal gasten als geheel getal. Eventuele btw is onderdeel van ingevoerde bedragen, tenzij UI aparte btw-optie heeft.
4. Afrondingsregels
    INVUL: Kostenposten en totalen op 2 decimalen. Aantal gasten als integer. Kosten per gast op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleKosten, totaleVasteKosten, totaleVariabeleKosten, kostenPerGastGemiddeld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: kostenposten[] met naam, type vast/variabel, bedrag en subtotaal. Optioneel taartdiagram of categorie-overzicht.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; aantal gasten zonder decimalen; categorieën als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Negatieve kosten zijn ongeldig. Aantal gasten < 0 is ongeldig. Als alle kosten leeg zijn, is invoer onvoldoende. Aantal gasten 0 is toegestaan, maar kosten per gast is dan niet relevant.
2. Domeinbeperkingen
    INVUL: aantalGasten >= 0; elke kostenpost >= 0; minimaal één kostenpost of kostenPerGast ingevuld.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één kostenpost in.” / “Kosten mogen niet negatief zijn.” / “Vul een geldig aantal gasten in.”

Testset

1. Basiscase
    INVUL: Vaste kosten € 5.000, aantal gasten 50, kosten per gast € 100. Verwacht: totale kosten € 10.000, kosten per gast gemiddeld € 200.
2. Edge-case
    INVUL: Aantal gasten 0, vaste kosten € 2.000, variabele kosten € 0. Verwacht: totale kosten € 2.000, kosten per gast niet relevant.
3. Regresstest tegen bekende uitkomst
    INVUL: Vaste kosten € 8.500, gasten 80, kosten per gast € 75. Verwacht: variabel € 6.000, totaal € 14.500, gemiddeld € 181,25.
