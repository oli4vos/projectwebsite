# Geld lenen kost geld — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/geld-lenen-kost-geld.html

## Uit invulblad

Geld lenen kost geld

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/geld-lenen-kost-geld.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Inzicht geven in de totale kosten van een lening: hoeveel rente wordt betaald bovenop het geleende bedrag.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal P = leenbedrag, r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 2: bereken bij annuïtaire lening maandbedrag = P * r / (1 - (1 + r)^(-n)); bij r = 0: maandbedrag = P / n. Stap 3: totaalBetaald = maandbedrag * n, met laatste-termijncorrectie bij schema. Stap 4: kostenLening = totaalBetaald - P. Stap 5: kostenPercentageVanLening = kostenLening / P * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente via delen door 12. Looptijd in jaren omrekenen naar maanden via jaren * 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedrag en totalen op 2 decimalen. Kostenpercentage op 2 decimalen. Intern niet tussentijds afronden behalve voor getoonde tabel.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag, totaalBetaald, kostenLening, kostenPercentageVanLening, aantalTermijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema; optionele grafiek totaal aflossing versus rente.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 12,34%; looptijd als maanden of jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag of looptijd leeg, niet-numeriek of <= 0 is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: leenbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, rente 6%, looptijd 12 maanden. Verwacht: maandbedrag circa € 860,66, kosten lening circa € 327,97.
2. Edge-case
    INVUL: Leenbedrag € 10.000, rente 0%, looptijd 10 maanden. Verwacht: maandbedrag € 1.000, kosten € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 5.000, rente 12%, looptijd 24 maanden. Verwacht: maandbedrag circa € 235,37, totale kosten circa € 648,81.
