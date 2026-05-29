# Netto hypotheek maandlasten — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten.html

## Uit invulblad

Netto hypotheek maandlasten

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto en netto maandlasten van een hypotheek inclusief renteaftrek en eigenwoningforfait.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken bruto maandlast volgens hypotheekvorm. Stap 2: bepaal jaarlijkse rentecomponent uit schema. Stap 3: aftrekbareRente = renteJaar * aftrekbaarPercentage. Stap 4: eigenwoningforfait = wozWaarde * ewfPercentage. Stap 5: fiscaalVoordeel = max(0, aftrekbareRente - eigenwoningforfait) * aftrekTarief, met Hillen-correctie indien positief saldo. Stap 6: nettoMaandlast = brutoMaandlast - fiscaalVoordeel/12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Fiscale bedragen per jaar naar maand. WOZ in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Fiscale bedragen op 2 decimalen. Schema op centen.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, nettoMaandlast, fiscaalVoordeelPerMaand, aftrekbareRentePerJaar, eigenwoningforfait.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaar-/maandschema bruto, rente, aflossing, fiscaal voordeel, netto last.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; fiscale uitkomst indicatief.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, rente/looptijd ontbreekt. Netto berekening zonder WOZ, EWF of aftrektarief is onvoldoende; bruto berekening blijft geldig.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; 0 <= aftrekTarief <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Voor netto maandlasten ontbreken fiscale gegevens.”

Testset

1. Basiscase
    INVUL: Bruto maandlast € 1.000, fiscaal voordeel € 240/jaar. Verwacht netto maandlast € 980.
2. Edge-case
    INVUL: Geen fiscaal voordeel. Verwacht netto = bruto.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 10.000/jaar, EWF € 1.000, aftrek 40%. Verwacht fiscaal voordeel € 3.600/jaar, € 300/maand.
