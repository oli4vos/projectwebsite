# Samengestelde rente — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/samengestelde-rente.html

## Uit invulblad

Samengestelde rente

Bron-URL: https://www.externe-bron.nl/berekenen/samengestelde-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omrekenen van enkelvoudige rente per periode naar een equivalente samengestelde rente per periode over hetzelfde aantal perioden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: s = enkelvoudigeRentePercentage / 100. Stap 2: bepaal n = periodes. Stap 3: totale enkelvoudige factor: factor = 1 + s * n. Stap 4: samengestelde rente per periode: samengesteldeRentePerPeriode = factor^(1/n) - 1. Stap 5: outputpercentage: samengesteldeRentePerPeriode * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen vaste maand/jaarconversie. De ingevoerde enkelvoudige rente geldt per gekozen periode en periodes gebruikt dezelfde periodebasis. Percentage 5 betekent 5%.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Samengestelde rente tonen met 3 decimalen. Eindfactor tonen met 6 decimalen.

Output-contract

1. Primaire outputs
    INVUL: samengesteldeRentePerPeriodePercentage; totaalRendementPercentage; eindFactor; aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel vergelijkingstabel enkelvoudige groei versus samengestelde groei.
3. Formatregels voor UI
    INVUL: Percentages met 3 decimalen; factoren met 6 decimalen; perioden zonder decimalen als invoer integer is.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke rente of perioden zijn ongeldig. periodes <= 0 is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: 1 + s * n > 0; periodes > 0. Als factor <= 0, is machtsverheffing niet geldig voor algemene decimale perioden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige enkelvoudige rente in.” / “Het aantal perioden moet groter zijn dan 0.” / “Deze combinatie van rente en perioden is niet geldig.”

Testset

1. Basiscase
    INVUL: Invoer: enkelvoudige rente 10%, perioden 2. Verwacht: eindfactor 1,20, samengestelde rente per periode circa 9,545%.
2. Edge-case
    INVUL: Invoer: enkelvoudige rente 0%, perioden 10. Verwacht: samengestelde rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: enkelvoudige rente 5%, perioden 3. Verwacht: eindfactor 1,15, samengestelde rente per periode circa 4,769%.
