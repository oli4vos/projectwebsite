# Familiebank hypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/familiebank-hypotheek-berekenen.html

## Uit invulblad

Familiebank hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/familiebank-hypotheek-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maandlasten, renteaftrek en netto familie-effecten bij een hypotheeklening van familie in plaats van of naast een bank.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken annuïtaire of aflossingsvrije maandlast van familielening. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: maandrente = P*r. Stap 2: bereken betaalde rente per jaar. Stap 3: fiscaalVoordeelLener = aftrekbareRente * aftrekTarief. Stap 4: nettoLastLener = brutoBetaling - fiscaalVoordeel/12. Stap 5: brutoRenteOntvanger = betaaldeRente; optioneel belasting box 3/box 1 buiten kern via parameter. Stap 6: optionele schenking: nettoFamilieLast = nettoLastLener - schenkingPerMaand.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente naar maandrente. Looptijd in jaren naar maanden. Fiscale aftrek als percentage. Bedragen in euro per maand/jaar.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Jaarbedragen op 2 decimalen. Schema op centen, laatste termijn corrigeren.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlastLener, jaarlijkseRenteOntvanger, fiscaalVoordeelLener, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aflosschema; familie-cashflow-overzicht; optionele vergelijking met bankrente.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; fiscale uitkomsten als indicatief labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lening <= 0, rente ontbreekt/niet-numeriek, looptijd <= 0, aftrektarief buiten bereik is ongeldig. Rente 0% is geldig maar kan fiscaal/onzakelijk zijn; toon waarschuwing.
2. Domeinbeperkingen
    INVUL: P > 0; 0 <= rentePercentage <= 100; 0 <= aftrekTarief <= 100; looptijdMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig leenbedrag in.” / “Vul een geldige rente in.” / “Vul een positieve looptijd in.” / “Let op: de rente moet zakelijk zijn.”

Testset

1. Basiscase
    INVUL: Lening € 100.000, rente 4%, looptijd 30 jaar, annuïtair, aftrektarief 37%. Verwacht bruto maandlast circa € 477,42; eerste maandrente € 333,33.
2. Edge-case
    INVUL: Rente 0%, lening € 12.000, looptijd 12 maanden. Verwacht bruto maandlast € 1.000, fiscaal voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij € 100.000, rente 3%, aftrek 40%. Verwacht bruto rente per maand € 250, netto rentelast € 150.
