# Annuïtair geleend bedrag — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/geleend-bedrag-annuiteit.html

## Uit invulblad

Annuïtair geleend bedrag

Bron-URL: https://www.externe-bron.nl/berekenen/geleend-bedrag-annuiteit.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen welk geleend bedrag/hoofdsom past bij een gegeven vaste annuïtaire termijn, rentepercentage en looptijd. De tool rekent dus terug van termijnbedrag naar lening.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal r = rentePerPeriodeDecimal. Stap 2: bepaal n = aantalTermijnen. Stap 3: bij r > 0: geleendBedrag = termijn * (1 - (1 + r)^(-n)) / r. Bij r = 0: geleendBedrag = termijn * n. Stap 4: bereken eventueel schema per termijn met renteDeel = restschuldBegin * r, aflossingDeel = termijn - renteDeel, restschuldEind = restschuldBegin - aflossingDeel.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente-invoer is jaarrente in procenten. Intern: jaarRenteDecimal = rentePercentage / 100. Standaard maandtermijnen: r = jaarRenteDecimal / 12 en n = looptijdJaren * 12. Als termijnfrequentie later wordt toegevoegd: maand = 12, kwartaal = 4, jaar = 1.
4. Afrondingsregels
    INVUL: Intern rekenen met volledige precisie. Geldbedragen in output afronden op 2 decimalen. In een schema rente, aflossing en restschuld per termijn op centen afronden. Laatste termijn corrigeert eventuele afrondingsrest zodat eindschuld exact € 0,00 is.

Output-contract

1. Primaire outputs
    INVUL: geleendBedrag: berekende hoofdsom/lening; termijnBedrag: ingevoerde annuïteit per periode; aantalTermijnen: totale looptijd in termijnen; totaalBetaald: som van alle termijnen; totaalRente: totaal betaalde rente.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema[] met per termijn: termijnNummer, beginSchuld, termijnBedrag, renteDeel, aflossingDeel, eindSchuld. Optionele grafiek: restschuld per termijn en verhouding rente/aflossing.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 5,00%; looptijd als geheel aantal maanden of als jaren + maanden; aantallen zonder decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekend, leeg, niet-numeriek of termijnBedrag <= 0 is ongeldig. looptijd <= 0 is ongeldig. rente < 0 is ongeldig voor deze tool. rente = 0 is geldig.
2. Domeinbeperkingen
    INVUL: termijnBedrag > 0; looptijd > 0; 0 <= rentePercentage <= 100; aantalTermijnen <= 1200. Bij overschrijding is invoer ongeldig of onvoldoende praktisch.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief termijnbedrag in.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.” / “De looptijd is te lang voor deze berekening.”

Testset

1. Basiscase
    INVUL: Invoer: termijn € 536,82, rente 5%, looptijd 30 jaar, maandtermijnen. Verwacht: geleend bedrag circa € 100.000, aantal termijnen 360.
2. Edge-case
    INVUL: Invoer: termijn € 1.000, rente 0%, looptijd 1 jaar, maandtermijnen. Verwacht: geleend bedrag € 12.000, totaal rente € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: termijn € 860,66, rente 6%, looptijd 1 jaar, maandtermijnen. Verwacht: geleend bedrag circa € 10.000.
