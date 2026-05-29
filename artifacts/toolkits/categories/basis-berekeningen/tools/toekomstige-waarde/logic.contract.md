# Toekomstige waarde — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/toekomstige-waarde.html

## Uit invulblad

Toekomstige waarde

Bron-URL: https://www.externe-bron.nl/berekenen/toekomstige-waarde.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel een huidige waarde plus eventuele periodieke inleg in de toekomst waard is bij samengestelde rente/rendement.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal PV = huidigeWaarde, PMT = periodiekeInleg, r = rentePerPeriodeDecimal, n = aantalPerioden. Stap 2: eindwaarde startkapitaal: FV_start = PV * (1 + r)^n. Stap 3: bij inleg einde periode en r > 0: FV_inleg = PMT * (((1 + r)^n - 1) / r). Bij r = 0: FV_inleg = PMT * n. Stap 4: toekomstigeWaarde = FV_start + FV_inleg.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente/rendement is jaarrendement in procenten. Bij jaarlijkse perioden: r = rentePercentage / 100, n = jaren. Bij maandelijkse inleg: r = rentePercentage / 100 / 12, n = jaren * 12.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Toekomstige waarde, totaal ingelegd en rendement op 2 decimalen afronden. Tabelwaarden per periode op centen tonen.

Output-contract

1. Primaire outputs
    INVUL: toekomstigeWaarde; totaalIngelegd; rendementBedrag; aantalPerioden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: opbouwschema[] met periode, beginwaarde, inleg, rendement, eindwaarde. Optioneel grafiek vermogensopbouw.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; looptijd als jaren/maanden afhankelijk van periodekeuze.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke huidige waarde, inleg, looptijd of rente is ongeldig. huidigeWaarde = 0 is geldig. inleg = 0 is geldig. looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: looptijd > 0; 1 + r > 0; rendement per periode groter dan -100%; maximaal 1200 perioden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige huidige waarde in.” / “Vul een geldige periodieke inleg in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.”

Testset

1. Basiscase
    INVUL: Invoer: huidige waarde € 1.000, inleg € 100, rente 5%, looptijd 1 jaar, jaarlijkse periode. Verwacht: toekomstige waarde € 1.150.
2. Edge-case
    INVUL: Invoer: huidige waarde € 1.000, inleg € 100, rente 0%, looptijd 5 perioden. Verwacht: toekomstige waarde € 1.500.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: huidige waarde € 10.000, inleg € 0, rente 4%, looptijd 5 jaar. Verwacht: toekomstige waarde circa € 12.166,53.
