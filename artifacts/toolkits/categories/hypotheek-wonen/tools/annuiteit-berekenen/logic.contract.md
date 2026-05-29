# Annuïteit berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/wonen-en-hypotheek/annuiteit.html

## Uit invulblad

Annuïteit berekenen

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de vaste bruto maandlast van een annuïteitenhypotheek op basis van hypotheekbedrag, rente en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: P = hypotheekbedrag, r = rentePercentage / 100 / 12, n = looptijdJaren * 12. Stap 2: bij r > 0: annuiteit = P * r / (1 - (1+r)^(-n)). Bij r = 0: annuiteit = P / n. Stap 3: per maand: rente = restschuldBegin * r, aflossing = annuiteit - rente, restschuldEind = restschuldBegin - aflossing.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is nominale jaarrente; maandrente = jaarrente / 12. Looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen. Schema op centen. Laatste maand corrigeren naar restschuld nul.

Output-contract

1. Primaire outputs
    INVUL: brutoMaandlast, totaalBetaald, totaleRente, aantalMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met maand, rente, aflossing, restschuld. Grafiek rente/aflossing en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in jaren en maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: hypotheekbedrag > 0; looptijdMaanden > 0; 0 <= rentePercentage <= 100; maximaal 600 maanden of UI-parameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, rente 4%, looptijd 30 jaar. Verwacht: bruto maandlast circa € 1.432,25.
2. Edge-case
    INVUL: Hypotheek € 120.000, rente 0%, looptijd 10 jaar. Verwacht: maandlast € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar. Verwacht: maandlast circa € 536,82.
