# Maandbedrag voor aflossing lening — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/maandbedrag-aflossen-lening.html

## Uit invulblad

Maandbedrag voor aflossing lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/maandbedrag-aflossen-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk vast maandbedrag nodig is om een lening binnen een opgegeven looptijd af te lossen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = leenbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: maandbedrag = P * r / (1 - (1+r)^(-n)). Bij r = 0: maandbedrag = P / n. Stap 3: totaalBetaald = maandbedrag * n, totaleRente = totaalBetaald - P.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente. Looptijd in jaren naar maanden via jaren * 12, of direct aantal maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen. Totalen op 2 decimalen. Schema gebruikt laatste-termijncorrectie naar nul restschuld.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag, totaalBetaald, totaleRente, aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema; grafiek rente/aflossing per maand.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; rente als 5,00%; looptijd in maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag <= 0, looptijd <= 0, ontbrekende of niet-numerieke rente is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, rente 6%, looptijd 12 maanden. Verwacht: maandbedrag circa € 860,66.
2. Edge-case
    INVUL: Leenbedrag € 12.000, rente 0%, looptijd 12 maanden. Verwacht: maandbedrag € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 5.000, rente 12%, looptijd 24 maanden. Verwacht: maandbedrag circa € 235,37.
