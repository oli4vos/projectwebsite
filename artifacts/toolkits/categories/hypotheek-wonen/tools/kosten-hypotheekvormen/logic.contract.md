# Kosten hypotheekvormen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/kosten-hypotheekvormen.html

## Uit invulblad

Kosten hypotheekvormen

Bron-URL: https://www.externe-bron.nl/hypotheek/kosten-hypotheekvormen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van maandlasten en totale kosten van verschillende hypotheekvormen, zoals annuïtair, lineair en aflossingsvrij.
2. Exacte formules/stappenvolgorde
    INVUL: Voor elke hypotheekvorm: annuïtair A=P*r/(1-(1+r)^(-n)); lineair aflossing=P/n, maandlast = aflossing + restschuld*r; aflossingsvrij maandlast = P*r. Bereken per maand rente, aflossing, restschuld. Totalen: totaalBetaald, totaleRente, eindRestschuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente. Looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten, rente en aflossing per maand op 2 decimalen. Laatste termijn corrigeren. Totalen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: vergelijking[] per hypotheekvorm met eersteMaandlast, laatsteMaandlast, gemiddeldeMaandlast, totaleRente, totaalBetaald, eindRestschuld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aflosschema per vorm; grafiek maandlasten en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; hypotheekvorm als label.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente ontbreekt, looptijd <= 0 of geen hypotheekvorm geselecteerd is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; maximaal 600 maanden of parameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Selecteer minimaal één hypotheekvorm.” / “Vul een geldige looptijd en rente in.”

Testset

1. Basiscase
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht annuïtair circa € 536,82, lineair eerste maand € 694,44.
2. Edge-case
    INVUL: Rente 0%. Verwacht annuïtair en lineair zelfde totale betaling € 100.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij € 100.000, rente 3%. Verwacht maandlast € 250, eindschuld € 100.000.
