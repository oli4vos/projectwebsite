# Doorlopend krediet vergelijken — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/goedkoper-doorlopend-krediet.html

## Uit invulblad

Doorlopend krediet vergelijken

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/goedkoper-doorlopend-krediet.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken of een nieuw doorlopend krediet goedkoper is dan een bestaand doorlopend krediet, op basis van rente, maandbetaling en resterende schuld.
2. Exacte formules/stappenvolgorde
    INVUL: Bereken voor bestaand en nieuw krediet afzonderlijk een maand-voor-maand aflosschema. Per krediet: r = jaarRentePercentage / 100 / 12; per maand rente = restschuldBegin * r; aflossing = maandbetaling - rente; restschuldEind = restschuldBegin - aflossing. Herhaal tot restschuld 0 is. Totalen: looptijdMaanden, totaalBetaald, totaleRente. Verschil: besparingRente = oudeTotaleRente - nieuweTotaleRente, besparingTotaal = oudTotaalBetaald - nieuwTotaalBetaald.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten en wordt per maand gedeeld door 12. Maandbetaling is euro per maand. Looptijd wordt berekend in maanden.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Maandbedragen en rente per maand op 2 decimalen tonen. Laatste maandbetaling wordt gecorrigeerd naar resterende schuld plus rente. Looptijd altijd naar boven afgerond op hele maanden.

Output-contract

1. Primaire outputs
    INVUL: oudeLooptijdMaanden, nieuweLooptijdMaanden, oudeTotaleRente, nieuweTotaleRente, besparingRente, besparingTotaal, adviesIndicatie.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijkingstabel oud versus nieuw; optioneel twee aflosschema’s; grafiek restschuld oud en nieuw over tijd.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als maanden of jaren + maanden; besparing positief tonen als voordeel.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Restschuld <= 0, maandbetaling <= 0, ontbrekende rente of niet-numerieke waarden zijn ongeldig. Als maandbetaling lager of gelijk is aan de eerste maandrente, wordt de lening niet afgelost en is invoer onvoldoende.
2. Domeinbeperkingen
    INVUL: maandbetaling > restschuld * maandRente; 0 <= rentePercentage <= 100; maximaal 2400 maanden om oneindige simulaties te voorkomen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige restschuld in.” / “De maandbetaling is te laag om de lening af te lossen.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Oud: schuld € 10.000, rente 10%, maandbetaling € 250. Nieuw: schuld € 10.000, rente 6%, maandbetaling € 250. Verwacht: nieuw krediet heeft lagere totale rente en kortere looptijd.
2. Edge-case
    INVUL: Schuld € 10.000, rente 12%, maandbetaling € 100. Eerste maandrente € 100. Verwacht: foutmelding dat maandbetaling te laag is.
3. Regresstest tegen bekende uitkomst
    INVUL: Oud: € 5.000, 9%, € 200; nieuw: € 5.000, 5%, € 200. Verwacht: nieuwe totale rente lager dan oude totale rente.
