# Restschuld bij financial lease — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/restschuld-financial-lease.html

## Uit invulblad

Restschuld bij financial lease

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/restschuld-financial-lease.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat de resterende schuld/restwaarde in een financial leasecontract is na een bepaald aantal betaalde maanden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: financiering = aanschafwaarde - aanbetaling. Stap 2: bereken maandtermijn zoals bij financial lease, of gebruik ingevoerde maandtermijn. Stap 3: simuleer k betaalde maanden: rente = restschuldBegin * r, aflossing = maandtermijn - rente, restschuldEind = restschuldBegin - aflossing. Stap 4: na volledige looptijd moet restschuld gelijk zijn aan slottermijn.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente via delen door 12. Looptijd en verstreken periode in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Restschuld, rente en aflossing op 2 decimalen. Laatste reguliere termijn corrigeert zodat eindschuld exact slottermijn is.

Output-contract

1. Primaire outputs
    INVUL: restschuldNaPeriode, betaaldeTermijnen, totaalBetaald, totaleRenteBetaald, totaleAflossing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: leaseschema[] tot opgegeven maand; grafiek restschuld over tijd.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; maanden als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ongeldige aanschafwaarde, aanbetaling, slottermijn, rente, looptijd of verstreken maanden is ongeldig. Verstreken maanden kleiner dan 0 of groter dan looptijd is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= verstrekenMaanden <= looptijdMaanden; 0 <= slottermijn <= financiering; 0 <= rentePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige aanschafwaarde in.” / “De verstreken periode moet binnen de looptijd liggen.” / “De slottermijn mag niet hoger zijn dan het financieringsbedrag.”

Testset

1. Basiscase
    INVUL: Aanschafwaarde € 20.000, aanbetaling € 0, slottermijn € 5.000, rente 5%, looptijd 48, verstreken 24 maanden. Verwacht: restschuld ligt tussen € 5.000 en € 20.000.
2. Edge-case
    INVUL: Verstreken maanden 0. Verwacht: restschuld gelijk aan financieringsbedrag.
3. Regresstest tegen bekende uitkomst
    INVUL: Financiering € 12.000, slottermijn € 0, rente 0%, looptijd 12, verstreken 6. Verwacht: restschuld € 6.000.
