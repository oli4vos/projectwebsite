# Enkelvoudige rente — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/enkelvoudige-rente.html

## Uit invulblad

Enkelvoudige rente

Bron-URL: https://www.externe-bron.nl/berekenen/enkelvoudige-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van samengestelde rente per periode naar een equivalente enkelvoudige rente per periode over hetzelfde aantal perioden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: r = samengesteldeRentePercentage / 100. Stap 2: bepaal n = periodes. Stap 3: bereken totale groeifactor: factor = (1 + r)^n. Stap 4: totaal rendement: totaalRendement = factor - 1. Stap 5: equivalente enkelvoudige rente per periode: enkelvoudigeRentePerPeriode = totaalRendement / n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen vaste maand/jaarconversie. De opgegeven rente geldt per gekozen periode en periodes is het aantal van diezelfde perioden. Percentage 5 betekent 5%.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Enkelvoudige rente tonen met 3 decimalen. Totaal rendement tonen met 3 decimalen.

Output-contract

1. Primaire outputs
    INVUL: enkelvoudigeRentePerPeriodePercentage; totaalRendementPercentage; aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: eindFactorSamengesteld; optioneel vergelijkingstabel samengesteld versus enkelvoudig.
3. Formatregels voor UI
    INVUL: Percentages met 3 decimalen; factor met 6 decimalen; perioden als getal zonder valutateken.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke rente of perioden zijn ongeldig. periodes <= 0 is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: periodes > 0; 1 + r > 0; rente per periode groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige samengestelde rente in.” / “Het aantal perioden moet groter zijn dan 0.”

Testset

1. Basiscase
    INVUL: Invoer: samengestelde rente 10%, perioden 2. Verwacht: totaal rendement 21%, enkelvoudige rente per periode 10,5%.
2. Edge-case
    INVUL: Invoer: samengestelde rente 0%, perioden 10. Verwacht: enkelvoudige rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: samengestelde rente 5%, perioden 3. Verwacht: totaal rendement 15,7625%, enkelvoudige rente circa 5,254%.
