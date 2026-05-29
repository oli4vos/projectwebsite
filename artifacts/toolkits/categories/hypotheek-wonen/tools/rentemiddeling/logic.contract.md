# Rentemiddeling — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/rentemiddeling.html

## Uit invulblad

Rentemiddeling

Bron-URL: https://www.externe-bron.nl/hypotheek/rentemiddeling.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van een nieuwe gemiddelde hypotheekrente bij rentemiddeling en vergelijken met oude rente en actuele marktrente.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken boeterente/contante waarde renteverschil over resterende oude rentevaste periode. Stap 2: smeer boeterente uit over nieuwe rentevaste periode als opslag: eenvoudige methode opslag = boeterente / schuld / nieuwePeriodeJaren * 100; contante-waardevariant via maandelijkse opslag. Stap 3: middelrente = actueleRenteNieuwePeriode + opslag + administratieOpslag. Stap 4: bereken oude en nieuwe maandlast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar. Periodes in maanden/jaren. Opslag als jaarpercentage. Maandlast via maandrente.
4. Afrondingsregels
    INVUL: Rentepercentages met 3 decimalen. Boeterente en maandlasten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: middelrentePercentage, boeterente, renteOpslag, oudeMaandlast, nieuweMaandlast, maandverschil.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie boete, opslag, marktrente, administratieopslag; vergelijking scenario’s.
3. Formatregels voor UI
    INVUL: Rente met 3 decimalen; eurobedragen met 2 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, nieuwe periode <= 0, rente ontbreekt is ongeldig. Als actuele rente >= oude rente, boete/opslag kan 0 zijn.
2. Domeinbeperkingen
    INVUL: schuld > 0; rente >= 0; nieuwePeriodeMaanden > 0; opslag >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul geldige rentepercentages in.” / “Vul een geldige nieuwe rentevaste periode in.”

Testset

1. Basiscase
    INVUL: Schuld € 200.000, boeterente € 6.000, nieuwe periode 10 jaar, actuele rente 3%. Verwacht eenvoudige middelrente 3,300%.
2. Edge-case
    INVUL: Boeterente € 0. Verwacht middelrente = actuele rente + administratieopslag.
3. Regresstest tegen bekende uitkomst
    INVUL: Boeterente € 10.000, schuld € 250.000, periode 5 jaar, marktrente 4%. Verwacht opslag 0,800%, middelrente 4,800%.
