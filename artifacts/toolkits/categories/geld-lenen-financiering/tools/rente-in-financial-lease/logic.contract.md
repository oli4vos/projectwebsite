# Rente in financial lease — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/rente-financial-lease.html

## Uit invulblad

Rente in financial lease

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/rente-financial-lease.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk rentepercentage in een financial leasecontract besloten ligt op basis van financieringsbedrag, maandtermijn, looptijd en slottermijn.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: financiering = aanschafwaarde - aanbetaling. Stap 2: los maandrente r numeriek op uit: financiering = maandtermijn * (1 - (1+r)^(-n)) / r + slottermijn / (1+r)^n. Bij r = 0: controleformule financiering = maandtermijn * n + slottermijn. Stap 3: jaarRentePercentage = r * 12 * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandtermijn en slottermijn in euro. Looptijd in maanden. Output is nominale jaarrente in procenten, berekend uit maandrente.
4. Afrondingsregels
    INVUL: Numeriek oplossen met tolerantie 1e-10 voor maandrente. Rente tonen met 3 decimalen. Bedragen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: rentePercentagePerJaar, rentePercentagePerMaand, financieringsbedrag, totaalBetaald, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel leaseschema met gevonden rente; controle van contante waarde leasebetalingen.
3. Formatregels voor UI
    INVUL: Rente als 5,000%; eurobedragen met 2 decimalen; looptijd als maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aanschafwaarde <= 0, aanbetaling negatief, slottermijn negatief, maandtermijn <= 0, looptijd <= 0 of niet-numerieke waarden zijn ongeldig. Als financiering niet kan worden verklaard door betalingen bij rente >= 0, is invoer ongeldig of vereist negatieve rente.
2. Domeinbeperkingen
    INVUL: 0 <= aanbetaling <= aanschafwaarde; 0 <= slottermijn <= financiering; maandtermijn * n + slottermijn >= financiering voor rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige aanschafwaarde in.” / “Vul een positief maandtermijnbedrag in.” / “Deze combinatie past niet bij een positieve rente.” / “De slottermijn mag niet hoger zijn dan het financieringsbedrag.”

Testset

1. Basiscase
    INVUL: Aanschafwaarde € 20.000, aanbetaling € 0, slottermijn € 5.000, looptijd 48 maanden, maandtermijn circa € 350,68. Verwacht: rente circa 5,00%.
2. Edge-case
    INVUL: Financiering € 12.000, slottermijn € 0, looptijd 12, maandtermijn € 1.000. Verwacht: rente 0%.
3. Regresstest tegen bekende uitkomst
    INVUL: Aanschafwaarde € 30.000, aanbetaling € 5.000, slottermijn € 5.000, looptijd 60, maandtermijn circa € 406,65. Verwacht: rente circa 6,00%.
