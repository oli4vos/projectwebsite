# Leasetermijn financial lease — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/leasetermijn-financial-lease.html

## Uit invulblad

Leasetermijn financial lease

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/leasetermijn-financial-lease.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maandelijkse leasetermijn bij financial lease op basis van aanschafwaarde, aanbetaling, slottermijn/restwaarde, rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: financiering = aanschafwaarde - aanbetaling. Stap 2: r = rentePercentage / 100 / 12, n = looptijdMaanden, S = slottermijn. Stap 3: contante waarde van slottermijn: PV_slot = S / (1 + r)^n. Stap 4: te annuïtiseren bedrag: basis = financiering - PV_slot. Stap 5: bij r > 0: leasetermijn = basis * r / (1 - (1 + r)^(-n)); bij r = 0: leasetermijn = (financiering - S) / n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is nominale jaarrente in procenten. Maandrente = jaarrente / 12. Looptijd in maanden. Bedragen exclusief of inclusief btw volgen UI-keuze, maar rekenkundig identiek.
4. Afrondingsregels
    INVUL: Leasetermijn op 2 decimalen. Totalen op 2 decimalen. Schema op centen. Laatste termijn corrigeert naar slottermijn/restschuld.

Output-contract

1. Primaire outputs
    INVUL: leasetermijnPerMaand, financieringsbedrag, slottermijn, totaalBetaald, totaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: leaseschema[] met maand, beginSchuld, rente, aflossing, termijn, eindSchuld. EindSchuld na laatste reguliere termijn moet gelijk zijn aan slottermijn.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aanschafwaarde <= 0, aanbetaling negatief, aanbetaling groter dan aanschafwaarde, slottermijn negatief, slottermijn groter dan financiering of looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: aanschafwaarde > 0; 0 <= aanbetaling <= aanschafwaarde; 0 <= slottermijn <= financiering; 0 <= rentePercentage <= 100; looptijdMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige aanschafwaarde in.” / “De aanbetaling mag niet hoger zijn dan de aanschafwaarde.” / “De slottermijn mag niet hoger zijn dan het financieringsbedrag.” / “Vul een positieve looptijd in.”

Testset

1. Basiscase
    INVUL: Aanschafwaarde € 30.000, aanbetaling € 5.000, slottermijn € 5.000, rente 6%, looptijd 60 maanden. Verwacht: maandtermijn circa € 406,65.
2. Edge-case
    INVUL: Aanschafwaarde € 12.000, aanbetaling € 0, slottermijn € 0, rente 0%, looptijd 12 maanden. Verwacht: maandtermijn € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Aanschafwaarde € 20.000, aanbetaling € 0, slottermijn € 5.000, rente 5%, looptijd 48 maanden. Verwacht: maandtermijn circa € 350,68.
