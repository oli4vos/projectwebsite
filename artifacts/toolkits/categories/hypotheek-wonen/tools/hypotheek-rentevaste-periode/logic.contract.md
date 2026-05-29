# Hypotheek rentevaste periode — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/rentevaste-periodes-vergelijken.html

## Uit invulblad

Hypotheek rentevaste periode

Bron-URL: https://www.externe-bron.nl/hypotheek/rentevaste-periodes-vergelijken.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van hypotheeklasten bij verschillende rentevaste periodes en bijbehorende rentepercentages.
2. Exacte formules/stappenvolgorde
    INVUL: Voor elke optie: r = rentePercentage / 100 / 12, n = looptijdMaanden. Bereken maandlast volgens hypotheekvorm. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: P*r. Bereken rentekosten gedurende rentevaste periode: som rentecomponenten voor rentevastePeriodeMaanden. Vergelijk maandlasten en cumulatieve kosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentevaste periode in jaren naar maanden. Rente per jaar naar maand. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Totale kosten op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: opties[] met rentevaste periode, rente, maandlast, totale rente binnen periode; goedkoopsteOpMaandlast; goedkoopsteOpTotaleRente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijkingstabel en grafiek maandlast per rentevaste periode.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente als 4,00%; periode als 10 jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen opties is onvoldoende. Hypotheekbedrag <= 0, looptijd <= 0, ontbrekende rente is ongeldig.
2. Domeinbeperkingen
    INVUL: rentevastePeriodeMaanden <= looptijdMaanden; rente >= 0; minimaal één geldige optie.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Voeg minimaal één rentevaste periode toe.” / “Vul een geldig hypotheekbedrag in.” / “De rentevaste periode mag niet langer zijn dan de looptijd.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, looptijd 30 jaar, opties 10 jaar 4%, 20 jaar 4,5%. Verwacht: 10 jaar lagere maandlast.
2. Edge-case
    INVUL: Eén optie. Verwacht: die optie als goedkoopste.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht annuïteit € 536,82.
