# Maandlasten lineaire hypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maandlasten-lineaire-hypotheek.html

## Uit invulblad

Maandlasten lineaire hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maandlasten-lineaire-hypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en optioneel netto maandlasten van een lineaire hypotheek met vaste aflossing.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: vasteAflossing = P / n. Stap 2: per maand rente = restschuldBegin * rentePercentage / 100 / 12. Stap 3: brutoMaandlast = vasteAflossing + rente. Stap 4: netto = bruto - fiscale renteaftrek/maand + EWF-effect/maand indien parameters beschikbaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Looptijd in jaren naar maanden. Jaarlijkse fiscale bedragen naar maandbedragen.
4. Afrondingsregels
    INVUL: Aflossing, rente en maandlast op 2 decimalen. Laatste aflossing corrigeren naar resterende schuld. Netto lasten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eersteBrutoMaandlast, laatsteBrutoMaandlast, vasteAflossing, totaleRente, totaalBetaald.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Maandschema met restschuld, rente, aflossing, bruto en netto maandlast. Grafiek dalende maandlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd als jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Hypotheek € 120.000, rente 6%, looptijd 10 jaar. Verwacht vaste aflossing € 1.000, eerste rente € 600, eerste maandlast € 1.600.
2. Edge-case
    INVUL: Rente 0%. Verwacht alle maandlasten gelijk aan vaste aflossing.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 10.000, rente 6%, looptijd 12 maanden. Verwacht totale rente € 325.
