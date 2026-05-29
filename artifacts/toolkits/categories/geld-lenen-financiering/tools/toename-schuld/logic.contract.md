# Toename schuld — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/toename-schuld-lening.html

## Uit invulblad

Toename schuld

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/toename-schuld-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe een schuld toeneemt wanneer rente wordt bijgeschreven en er niet of onvoldoende wordt afgelost.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: schuld = beginschuld, r = rentePercentage / 100 / 12, A = maandbetaling, n = aantalMaanden. Stap 2: per maand: rente = schuldBegin * r, schuldNaRente = schuldBegin + rente, schuldEind = schuldNaRente - A. Stap 3: als A = 0: gesloten formule eindschuld = beginschuld * (1+r)^n. Stap 4: totale rente = som rente; schuldtoename = eindschuld - beginschuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente in procenten naar maandrente. Periode in maanden. Bedragen in euro. Maandbetaling kan 0 zijn.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Rente en schuld per maand op 2 decimalen tonen. Eindschuld en totale rente op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eindschuld, schuldtoename, totaleRente, totaalBetaald, aantalMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: schuldSchema[] met maand, beginSchuld, rente, betaling, eindSchuld. Grafiek schuldontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente als 5,00%; maanden als geheel getal; schuldtoename positief tonen als stijging.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Beginschuld <= 0, rente leeg/niet-numeriek, periode <= 0 of maandbetaling negatief is ongeldig. Maandbetaling 0 is geldig.
2. Domeinbeperkingen
    INVUL: beginschuld > 0; aantalMaanden > 0; 0 <= rentePercentage <= 100; maandbetaling >= 0; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve beginschuld in.” / “Vul een geldig rentepercentage in.” / “Vul een positieve periode in.” / “De maandbetaling mag niet negatief zijn.”

Testset

1. Basiscase
    INVUL: Beginschuld € 10.000, rente 12%, maandbetaling € 0, periode 12 maanden. Verwacht: eindschuld circa € 11.268,25.
2. Edge-case
    INVUL: Beginschuld € 10.000, rente 0%, maandbetaling € 0, periode 12 maanden. Verwacht: eindschuld € 10.000, schuldtoename € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 1.000, rente 12%, maandbetaling € 10, periode 12 maanden. Verwacht: eindschuld circa € 1.006,83.
