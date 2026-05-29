# Contante waarde — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/contante-waarde.html

## Uit invulblad

Contante waarde

Bron-URL: https://www.externe-bron.nl/berekenen/contante-waarde.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat een toekomstig bedrag vandaag waard is bij een gegeven rendement/rente en periode.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal FV = toekomstigeWaarde. Stap 2: bepaal r = rendementPerPeriodeDecimal. Stap 3: bepaal n = aantalPeriodes. Stap 4: contanteWaarde = FV / (1 + r)^n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rendement wordt ingevoerd als percentage per jaar. Standaard jaarlijkse periode: r = rendementPercentage / 100 en n = aantalJaren. Bij maandperioden: r = jaarRendementDecimal / 12 en n = jaren * 12.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Contante waarde afronden op 2 decimalen. Disconteringsfactor tonen met maximaal 6 decimalen.

Output-contract

1. Primaire outputs
    INVUL: contanteWaarde: huidige waarde; toekomstigeWaarde: invoerbedrag; disconteringsfactor: 1 / (1 + r)^n.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel waardePerPeriode[] met periode, disconteringsfactor en contante waarde. Grafiek optioneel.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; factor met 6 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke toekomstige waarde, periode of rendement is ongeldig. toekomstigeWaarde = 0 is geldig. periode <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: periode > 0; 1 + r > 0; rendement per periode moet groter zijn dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige toekomstige waarde in.” / “Vul een positieve periode in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Invoer: toekomstige waarde € 1.000, rendement 5%, periode 1 jaar. Verwacht: contante waarde € 952,38.
2. Edge-case
    INVUL: Invoer: toekomstige waarde € 1.000, rendement 0%, periode 10 jaar. Verwacht: contante waarde € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: toekomstige waarde € 10.000, rendement 4%, periode 5 jaar. Verwacht: contante waarde circa € 8.219,27.
