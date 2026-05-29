# Netto voordeel hypotheekrenteaftrek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/netto-voordeel-hypotheekrenteaftrek.html

## Uit invulblad

Netto voordeel hypotheekrenteaftrek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/netto-voordeel-hypotheekrenteaftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel netto voordeel de hypotheekrenteaftrek oplevert per jaar en per maand.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: aftrekbareRente = betaaldeRente * aftrekbaarPercentage / 100. Stap 2: eigenwoningforfait = wozWaarde * ewfPercentage / 100. Stap 3: nettoAftrekpost = max(0, aftrekbareRente - eigenwoningforfait). Stap 4: voordeel = nettoAftrekpost * aftrekTarief / 100. Stap 5: voordeelPerMaand = voordeel / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Betaalde rente en EWF op jaarbasis. Maandvoordeel via /12. Percentages delen door 100.
4. Afrondingsregels
    INVUL: Jaarvoordeel en maandvoordeel op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoVoordeelPerJaar, nettoVoordeelPerMaand, aftrekbareRente, eigenwoningforfait, nettoAftrekpost.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie renteaftrek en EWF; eventueel vergelijking verschillende tarieven.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; indicatief.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Betaalde rente < 0, WOZ < 0, aftrektarief buiten bereik is ongeldig. Ontbrekende EWF-tabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekbaarPercentage <= 100; 0 <= aftrekTarief <= 100; wozWaarde >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige betaalde rente in.” / “Vul een geldige WOZ-waarde in.” / “Vul een geldig belastingtarief in.”

Testset

1. Basiscase
    INVUL: Rente € 10.000, EWF € 1.000, tarief 40%. Verwacht voordeel € 3.600/jaar, € 300/maand.
2. Edge-case
    INVUL: Rente lager dan EWF. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 5.000, EWF € 0, tarief 37%. Verwacht € 1.850/jaar.
