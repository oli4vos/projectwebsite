# Rente bij lening — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/rente-lening.html

## Uit invulblad

Rente bij lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/rente-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk rentepercentage hoort bij een lening op basis van leenbedrag, maandbedrag en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Los r numeriek op uit de annuïteitsformule: maandbedrag = P * r / (1 - (1+r)^(-n)). Bij benadering: gebruik binaire zoekmethode of Newton-Raphson voor maandrente r. Zoek r tussen 0 en bijvoorbeeld 100% / 12. JaarRenteDecimal = r * 12; jaarRentePercentage = jaarRenteDecimal * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Invoer: leenbedrag in euro, maandbedrag in euro per maand, looptijd in maanden. Output: nominale jaarrente in procenten. Intern wordt maandrente opgelost.
4. Afrondingsregels
    INVUL: Numeriek oplossen tot tolerantie 1e-10 voor maandrente of verschil in maandbedrag kleiner dan € 0,0001. Output rentepercentage met 3 decimalen of 2 decimalen in UI.

Output-contract

1. Primaire outputs
    INVUL: rentePercentagePerJaar, rentePercentagePerMaand, totaalBetaald, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema met gevonden rente; controle-maandbedrag.
3. Formatregels voor UI
    INVUL: Rente als 6,000% of 6,00%; eurobedragen met 2 decimalen; looptijd als maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Leenbedrag <= 0, maandbedrag <= 0, looptijd <= 0 of niet-numerieke waarden zijn ongeldig. Als maandbedrag * looptijd < leenbedrag, is rente negatief nodig; standaard ongeldig of melding dat gegevens niet passen bij positieve rente.
2. Domeinbeperkingen
    INVUL: maandbedrag >= leenbedrag / looptijd voor rente >= 0. Maximaal rentepercentage 100% per jaar tenzij UI anders toestaat.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positief maandbedrag in.” / “Vul een positieve looptijd in.” / “Deze combinatie past niet bij een positieve rente.”

Testset

1. Basiscase
    INVUL: Leenbedrag € 10.000, maandbedrag € 860,66, looptijd 12 maanden. Verwacht: rente circa 6,00% per jaar.
2. Edge-case
    INVUL: Leenbedrag € 12.000, maandbedrag € 1.000, looptijd 12 maanden. Verwacht: rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Leenbedrag € 5.000, maandbedrag circa € 235,37, looptijd 24 maanden. Verwacht: rente circa 12,00%.
