# Hypotheek maandlasten bij nieuwbouw — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-maandlasten-tijdens-bouw.html

## Uit invulblad

Hypotheek maandlasten bij nieuwbouw

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-maandlasten-tijdens-bouw.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maandlasten tijdens de bouwperiode van een nieuwbouwwoning, rekening houdend met opgenomen bouwdepot, depotvergoeding en eventueel dubbele lasten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: per maand bepaal opgenomenHypotheek = somReedsBetaaldeTermijnen. Stap 2: bouwdepotRestant = totaleHypotheek - opgenomenHypotheek. Stap 3: teBetalenRente = opgenomenHypotheek * hypotheekrente / 100 / 12. Stap 4: depotRente = bouwdepotRestant * depotrente / 100 / 12. Stap 5: nettoBouwrenteLast = teBetalenRente - depotRente. Stap 6: tel eventueel huidige woonlasten op: totaleMaandlast = nettoBouwrenteLast + huidigeWoonlast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes zijn jaarrentes naar maandrente. Bouwschema per maand. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedragen op 2 decimalen. Cumulatieve kosten op 2 decimalen. Opnameschema zonder tussentijdse afronding voor berekening.

Output-contract

1. Primaire outputs
    INVUL: totaleKostenTijdensBouw, gemiddeldeMaandlast, hoogsteMaandlast, laatsteBouwmaandLast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: bouwSchema[] met maand, opgenomen hypotheek, bouwdepot, hypotheekrente, depotrente, netto last, totale woonlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentes met 2 decimalen; maandnummer of datum als periode.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente ontbreekt, bouwperiode <= 0, negatieve opnamebedragen of opname groter dan hypotheek is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= opgenomenHypotheek <= totaleHypotheek; 0 <= depotrente <= hypotheekrente meestal, maar niet verplicht; bouwperiode maximaal bijvoorbeeld 60 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een geldig bouwschema in.” / “Opnames uit het bouwdepot mogen niet hoger zijn dan de hypotheek.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, opgenomen maand 1 € 100.000, rente 4%, depotrente 2%, restant € 200.000. Verwacht netto bouwrente maand 1: € 333,33 - € 333,33 = € 0.
2. Edge-case
    INVUL: Hele hypotheek nog in depot, niets opgenomen. Verwacht te betalen rente € 0, depotvergoeding positief of netto negatieve last.
3. Regresstest tegen bekende uitkomst
    INVUL: Volledig opgenomen € 300.000, rente 4%, geen depot. Verwacht maandrente € 1.000.
