# Aflossingstermijnen lening — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/geld-lenen-aflossingstermijnen.html

## Uit invulblad

Aflossingstermijnen lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/geld-lenen-aflossingstermijnen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het aflosschema van een lening: per maand de rente, aflossing, termijnbetaling en resterende schuld.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal P = leenbedrag, jaarRenteDecimal = rentePercentage / 100, r = jaarRenteDecimal / 12, n = looptijdJaren * 12 of ingevoerde looptijd in maanden. Stap 2: bij annuïtaire aflossing: maandbedrag = P * r / (1 - (1 + r)^(-n)); bij r = 0: maandbedrag = P / n. Stap 3: per maand: renteDeel = restschuldBegin * r, aflossingDeel = maandbedrag - renteDeel, restschuldEind = restschuldBegin - aflossingDeel. Stap 4: totalen: totaalBetaald = Σ maandbedrag, totaleRente = totaalBetaald - P.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Intern: rente per maand = rentePercentage / 100 / 12. Looptijd in jaren wordt omgerekend naar maanden met jaren * 12. Alle bedragen zijn euro’s.
4. Afrondingsregels
    INVUL: Intern rekenen met volledige precisie. Maandbedrag, rente, aflossing en restschuld tonen op 2 decimalen. Laatste termijn corrigeren: aflossingLaatste = restschuldBegin, termijnLaatste = renteLaatste + aflossingLaatste, zodat eindschuld exact € 0,00 wordt.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag: vaste maandelijkse termijn; totaleRente: totale rentekosten; totaalBetaald: totale som van alle maandtermijnen; aantalTermijnen: aantal maanden; eindRestschuld: moet 0 zijn.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met per maand: maandnummer, beginSchuld, renteDeel, aflossingDeel, termijnBedrag, eindSchuld. Optionele grafiek: daling restschuld en rente/aflossing per maand.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; termijnen als gehele maanden; totalen met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag leeg, niet-numeriek of <= 0 is ongeldig. Looptijd leeg, niet-numeriek of <= 0 is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.” / “De looptijd is te lang voor deze berekening.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, rente 6%, looptijd 12 maanden. Verwacht: maandbedrag circa € 860,66, totale rente circa € 327,97.
2. Edge-case
    INVUL: Leenbedrag € 12.000, rente 0%, looptijd 12 maanden. Verwacht: maandbedrag € 1.000, totale rente € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 100.000, rente 5%, looptijd 360 maanden. Verwacht: maandbedrag circa € 536,82.
