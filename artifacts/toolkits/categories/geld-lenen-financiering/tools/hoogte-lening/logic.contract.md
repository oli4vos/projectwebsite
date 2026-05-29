# Hoogte lening — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/hoogte-lening.html

## Uit invulblad

Hoogte lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/hoogte-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk leenbedrag past bij een maandbedrag, rentepercentage en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal A = maandbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bij r > 0: leenbedrag = A * (1 - (1 + r)^(-n)) / r. Bij r = 0: leenbedrag = A * n. Stap 3: totaalBetaald = A * n; totaleRente = totaalBetaald - leenbedrag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten naar maandrente via delen door 12. Looptijd in jaren naar maanden via jaren * 12. Maandbedrag in euro per maand.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Leenbedrag en totalen op 2 decimalen. Maandbedrag op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: leenbedrag, maandbedrag, totaleRente, totaalBetaald, aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema op basis van berekende hoofdsom; optioneel grafiek restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Maandbedrag <= 0, looptijd <= 0, ontbrekende of niet-numerieke waarden zijn ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: maandbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief maandbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Maandbedrag € 860,66, rente 6%, looptijd 12 maanden. Verwacht: leenbedrag circa € 10.000.
2. Edge-case
    INVUL: Maandbedrag € 1.000, rente 0%, looptijd 12 maanden. Verwacht: leenbedrag € 12.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandbedrag € 536,82, rente 5%, looptijd 360 maanden. Verwacht: leenbedrag circa € 100.000.
