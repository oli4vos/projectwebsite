# Annuïteit berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/annuiteit.html

## Uit invulblad

Annuïteit berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het vaste termijnbedrag bij een annuïtaire lening, op basis van geleend bedrag, rentepercentage en looptijd.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal P = lening. Stap 2: bepaal r = rentePerPeriodeDecimal. Stap 3: bepaal n = aantalTermijnen. Stap 4: bij r > 0: annuiteit = P * r / (1 - (1 + r)^(-n)). Bij r = 0: annuiteit = P / n. Stap 5: genereer eventueel aflosschema met renteDeel = restschuldBegin * r, aflossingDeel = annuiteit - renteDeel, restschuldEind = restschuldBegin - aflossingDeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten. Intern: jaarRenteDecimal = rentePercentage / 100. Standaard maandtermijn: r = jaarRenteDecimal / 12; n = looptijdJaren * 12. Bij periodekeuze: maand = 12, kwartaal = 4, jaar = 1.
4. Afrondingsregels
    INVUL: Annuïteit output afronden op 2 decimalen. Schema op centen afronden. Laatste termijn wordt herberekend als restschuldBegin + renteLaatsteTermijn zodat eindschuld exact nul wordt.

Output-contract

1. Primaire outputs
    INVUL: annuiteit: vast termijnbedrag per periode; totaalBetaald: totaal van alle termijnen; totaalRente: totaal betaalde rente; aantalTermijnen: looptijd in termijnen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] met termijnnummer, beginSchuld, renteDeel, aflossingDeel, termijnBedrag en eindSchuld. Optioneel grafiek restschuld en rente/aflossing per termijn.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; termijnen als gehele getallen; negatieve uitkomsten worden niet verwacht.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege, niet-numerieke, negatieve of nulwaarde voor lening of looptijd is ongeldig. Rente leeg of niet-numeriek is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: lening > 0; looptijd > 0; 0 <= rentePercentage <= 100; aantalTermijnen <= 1200.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief leenbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Invoer: lening € 100.000, rente 5%, looptijd 30 jaar, maandtermijnen. Verwacht: annuïteit circa € 536,82.
2. Edge-case
    INVUL: Invoer: lening € 12.000, rente 0%, looptijd 1 jaar, maandtermijnen. Verwacht: annuïteit € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: lening € 10.000, rente 6%, looptijd 1 jaar, maandtermijnen. Verwacht: annuïteit circa € 860,66.
