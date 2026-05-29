# Hypotheek maandlasten na rentewijziging — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten-rentewijziging.html

## Uit invulblad

Hypotheek maandlasten na rentewijziging

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-netto-maandlasten-rentewijziging.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe bruto en netto maandlasten veranderen wanneer de hypotheekrente wijzigt.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken oude bruto maandlast met oude rente en resterende looptijd. Stap 2: bereken nieuwe bruto maandlast met nieuwe rente en dezelfde resterende looptijd. Stap 3: bereken oude en nieuwe rentecomponent per jaar/maand. Stap 4: bereken fiscale aftrek: aftrek = aftrekbareRente * aftrekTarief. Stap 5: nettoMaandlast = brutoMaandlast - aftrek/12 + eigenwoningforfaitEffect/12. Stap 6: verschilNetto = nieuwNetto - oudNetto.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rentes naar maandrentes. Jaarlijkse fiscale bedragen naar maand via /12. Looptijd in maanden.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Fiscale jaarbedragen op 2 decimalen. Verschillen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: oudeBrutoMaandlast, nieuweBrutoMaandlast, oudeNettoMaandlast, nieuweNettoMaandlast, verschilBruto, verschilNetto.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Rente/aflossingsspecificatie vóór/na; optioneel grafiek maandlastontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentes met 2 decimalen; stijging positief tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, resterende looptijd <= 0, oude of nieuwe rente ontbreekt/niet-numeriek is ongeldig. Fiscale parameters ontbreken: netto is onvoldoende, bruto kan wel.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rente <= 100; resterendeMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul geldige rentepercentages in.” / “Voor netto maandlasten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Schuld € 300.000, looptijd 30 jaar, oude rente 3%, nieuwe rente 4%. Verwacht: nieuwe bruto maandlast hoger.
2. Edge-case
    INVUL: Oude rente gelijk aan nieuwe rente. Verwacht verschil € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 100.000, looptijd 30 jaar, rente 5%. Verwacht bruto maandlast circa € 536,82.
