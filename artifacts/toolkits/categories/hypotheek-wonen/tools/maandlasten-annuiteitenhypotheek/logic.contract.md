# Maandlasten annuïteitenhypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maandlasten-annuiteitenhypotheek.html

## Uit invulblad

Maandlasten annuïteitenhypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maandlasten-annuiteitenhypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en optioneel netto maandlasten van een annuïteitenhypotheek gedurende de looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = hypotheekbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: annuiteit = P*r/(1-(1+r)^(-n)); bij r=0: P/n. Stap 3: per maand rente en aflossing berekenen. Stap 4: netto maandlast = bruto annuïteit - fiscaal voordeel renteaftrek/12 + EWF-effect/12 indien fiscale parameters beschikbaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente jaarrente naar maandrente. Looptijd jaren naar maanden. Fiscale jaarbedragen naar maand.
4. Afrondingsregels
    INVUL: Bruto maandlast op 2 decimalen. Schema op centen. Netto maandlast op 2 decimalen. Laatste termijn corrigeren.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlastEersteMaand, nettoMaandlastGemiddeld, totaleRente, totaalBetaald.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Maandschema met rente, aflossing, restschuld, fiscaal voordeel en netto last. Grafiek netto/bruto lasten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; maanden als integer.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt is ongeldig. Netto berekening zonder fiscale parameters is onvoldoende; bruto blijft mogelijk.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een positieve looptijd in.” / “Voor netto maandlasten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, rente 4%, looptijd 30 jaar. Verwacht bruto maandlast € 1.432,25.
2. Edge-case
    INVUL: Rente 0%, hypotheek € 120.000, looptijd 10 jaar. Verwacht bruto maandlast € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht € 536,82.
