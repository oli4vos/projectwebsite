# Restschuld lening — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/restschuld-lening-op-datum.html

## Uit invulblad

Restschuld lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/restschuld-lening-op-datum.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen wat de restschuld van een lening is op een specifieke datum of na een opgegeven aantal maanden.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal aantal verstreken termijnen tussen startdatum en peildatum, of gebruik direct verstrekenMaanden. Stap 2: P = oorspronkelijkeLening, A = maandbedrag, r = rentePercentage / 100 / 12. Stap 3: simuleer per maand: rente = restschuldBegin * r, aflossing = A - rente, restschuldEind = restschuldBegin - aflossing. Stap 4: stop na verstreken termijnen of bij volledige aflossing.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Startdatum en peildatum worden omgerekend naar hele maandtermijnen. Rente is jaarrente naar maandrente. Bedragen in euro.
4. Afrondingsregels
    INVUL: Peildatum telt alleen volledige verstreken betalingstermijnen mee. Geldbedragen op 2 decimalen. Laatste betaling corrigeren als lening vóór peildatum volledig aflost.

Output-contract

1. Primaire outputs
    INVUL: restschuldOpPeildatum, verstrekenTermijnen, totaalBetaaldTotPeildatum, renteBetaaldTotPeildatum, afgelostTotPeildatum.
2. Secundaire outputs/tabellen/grafieken
    INVUL: aflosschema[] tot peildatum; optioneel grafiek restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; datums als dd-mm-jjjj; rente met 2 decimalen; maanden als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Oorspronkelijke lening <= 0, maandbedrag <= 0, ongeldige datum of peildatum vóór startdatum is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: Peildatum moet op of na startdatum liggen. Maximaal 2400 termijnen. Bij rente > 0 moet maandbedrag groter zijn dan eerste maandrente.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige startdatum en peildatum in.” / “De peildatum mag niet vóór de startdatum liggen.” / “De maandbetaling is te laag om de lening af te lossen.”

Testset

1. Basiscase
    INVUL: Lening € 10.000, rente 6%, maandbedrag € 860,66, verstreken 6 maanden. Verwacht: restschuld circa € 5.076.
2. Edge-case
    INVUL: Peildatum gelijk aan startdatum. Verwacht: restschuld gelijk aan oorspronkelijke lening.
3. Regresstest tegen bekende uitkomst
    INVUL: Lening € 12.000, rente 0%, maandbedrag € 1.000, verstreken 6 maanden. Verwacht: restschuld € 6.000.
