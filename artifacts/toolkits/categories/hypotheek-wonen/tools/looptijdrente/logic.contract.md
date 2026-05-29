# Looptijdrente — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/looptijdrente-berekenen.html

## Uit invulblad

Looptijdrente

Bron-URL: https://www.externe-bron.nl/hypotheek/looptijdrente-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het gewogen gemiddelde rentepercentage over de looptijd of rentevaste perioden van één of meerdere leningdelen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: per periode/leningdeel bepaal bedrag, rentePercentage, duurMaanden. Stap 2: bereken gewogen rente: looptijdrente = Σ(bedrag_i * rente_i * duur_i) / Σ(bedrag_i * duur_i). Stap 3: optioneel bereken totale rente in euro via maandelijkse schema’s.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Duur in jaren naar maanden. Rente als jaarpercentage. Bedragen in euro.
4. Afrondingsregels
    INVUL: Looptijdrente met 3 decimalen. Bedragen op 2 decimalen. Duur in maanden als integer.

Output-contract

1. Primaire outputs
    INVUL: looptijdrentePercentage, gewogenRenteSom, totaalGewicht, aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel per leningdeel/periode met bedrag, rente, duur en bijdrage.
3. Formatregels voor UI
    INVUL: Percentages met 3 decimalen; eurobedragen met 2 decimalen; looptijden in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen geldige regels is onvoldoende. Bedrag <= 0, duur <= 0 of rente ontbreekt is ongeldig.
2. Domeinbeperkingen
    INVUL: bedrag > 0; duurMaanden > 0; rente >= 0; som gewichten > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één geldige periode in.” / “Vul geldige bedragen, rentes en looptijden in.”

Testset

1. Basiscase
    INVUL: € 100.000 tegen 3% voor 60 maanden, € 100.000 tegen 5% voor 60 maanden. Verwacht looptijdrente 4%.
2. Edge-case
    INVUL: Eén periode. Verwacht looptijdrente gelijk aan ingevoerde rente.
3. Regresstest tegen bekende uitkomst
    INVUL: € 200.000 tegen 3% en € 100.000 tegen 6%, zelfde duur. Verwacht 4%.
