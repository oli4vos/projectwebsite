# Contante waarde voor een reeks betalingen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/contante-waarde-reeks-betalingen.html

## Uit invulblad

Contante waarde voor een reeks betalingen

Bron-URL: https://www.externe-bron.nl/berekenen/contante-waarde-reeks-betalingen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de huidige waarde van een reeks gelijke toekomstige betalingen bij een gegeven rendement/rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal PMT = betalingPerPeriode. Stap 2: bepaal r = rendementPerPeriodeDecimal. Stap 3: bepaal n = aantalBetalingen. Stap 4: betalingen aan einde periode. Bij r > 0: contanteWaarde = PMT * (1 - (1 + r)^(-n)) / r. Bij r = 0: contanteWaarde = PMT * n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rendement is jaarrendement in procenten. Standaard jaarlijkse betalingen. Bij maandelijkse betalingen: r = jaarRendementDecimal / 12; n = jaren * 12.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Totale contante waarde afronden op 2 decimalen. Contante waarde per betaling in tabel op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: contanteWaarde: huidige waarde van de reeks; betalingPerPeriode; aantalBetalingen; rendementPerPeriode.
2. Secundaire outputs/tabellen/grafieken
    INVUL: betalingsschema[] met periode, betaling, disconteringsfactor en contante waarde betaling. Optioneel grafiek contante waarde per betaling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; factoren met 6 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke betaling, periode of rendement is ongeldig. betaling = 0 is geldig en geeft contante waarde 0. periode <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: aantalBetalingen > 0; 1 + r > 0; maximaal 1200 betalingen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig betalingsbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Invoer: betaling € 1.000, rendement 5%, periode 5 jaar. Verwacht: contante waarde circa € 4.329,48.
2. Edge-case
    INVUL: Invoer: betaling € 1.000, rendement 0%, periode 5 jaar. Verwacht: contante waarde € 5.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: betaling € 100, rendement 1%, periode 12. Verwacht: contante waarde circa € 1.125,51.
