# Stijging maandlasten annuïteitenhypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/netto-maandlasten-annuiteitenhypotheek.html

## Uit invulblad

Stijging maandlasten annuïteitenhypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/netto-maandlasten-annuiteitenhypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe bruto en netto maandlasten van een annuïteitenhypotheek zich ontwikkelen, inclusief stijging doordat het rentedeel daalt en de renteaftrek afneemt.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken vaste bruto annuïteit. Stap 2: per maand bereken rente, aflossing en restschuld. Stap 3: per jaar bereken renteaftrek: fiscaalVoordeel = max(0, renteJaar - eigenwoningforfait) * aftrekTarief. Stap 4: nettoLastJaar = brutoBetaaldJaar - fiscaalVoordeel. Stap 5: nettoMaandlastGemiddeld = nettoLastJaar/12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Fiscale posten per jaar. Maandlasten aggregeren naar jaar.
4. Afrondingsregels
    INVUL: Maandbedragen op 2 decimalen. Jaarbedragen op 2 decimalen. Schema op centen.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlastStart, nettoMaandlastEinde, stijgingNettoMaandlast, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks overzicht netto maandlast, renteaftrek, restschuld; grafiek stijgende netto maandlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaren als periode.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente/looptijd ontbreekt. Netto stijging zonder fiscale parameters is onvoldoende; bruto schema kan wel.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; fiscale parameters beschikbaar voor netto.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Voor netto maandlasten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar, aftrek 40%, EWF 0. Verwacht netto maandlast stijgt gedurende looptijd doordat rentedeel daalt.
2. Edge-case
    INVUL: Aftrektarief 0%. Verwacht netto maandlast gelijk aan bruto maandlast.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto annuïteit € 536,82, eerste maand rente € 416,67, aftrek 40%. Verwacht fiscaal voordeel eerste maand circa € 166,67, netto eerste maand circa € 370,15.
