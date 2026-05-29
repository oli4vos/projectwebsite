# Maximale lening — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/maximale-lening.html

## Uit invulblad

Maximale lening

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/maximale-lening.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Bepalen welk maximaal leenbedrag past bij de beschikbare maandelijkse leencapaciteit, rentepercentage en looptijd. Dit is een generieke financiële berekening, geen wettelijke krediettoets.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal maandruimte = nettoInkomen - vasteLasten - minimaleLeefruimte of gebruik direct ingevoerd maximaalMaandbedrag. Stap 2: begrens maandruimte op minimaal 0. Stap 3: bepaal r = rentePercentage / 100 / 12, n = looptijdMaanden. Stap 4: bij r > 0: maximaleLening = maandruimte * (1 - (1+r)^(-n)) / r. Bij r = 0: maximaleLening = maandruimte * n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens en lasten worden per maand ingevoerd. Rente is jaarrente in procenten en wordt omgerekend naar maandrente. Looptijd in jaren wordt omgerekend naar maanden.
4. Afrondingsregels
    INVUL: Maandruimte en maximale lening op 2 decimalen. Eventueel maximale lening naar beneden afronden op hele euro’s voor conservatieve UI.

Output-contract

1. Primaire outputs
    INVUL: maximaleLening, maximaalMaandbedrag, maandruimte, looptijdMaanden, rentePercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel aflosschema op basis van maximale lening; toelichting dat uitkomst indicatief is en geen kredietacceptatie of BKR-toets vervangt.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of maximale lening afgerond op hele euro’s; rente met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Als direct maandbedrag ontbreekt én inkomens/lasten onvoldoende zijn ingevuld, is invoer onvoldoende. Negatief inkomen, negatieve lasten of looptijd <= 0 is ongeldig. Rente 0% is geldig.
2. Domeinbeperkingen
    INVUL: maandruimte > 0 vereist voor positieve lening. 0 <= rentePercentage <= 100; looptijdMaanden > 0; maximaal 1200 maanden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positief maandbedrag of voldoende inkomensgegevens in.” / “Er is geen maandelijkse ruimte om te lenen.” / “Vul een positieve looptijd in.” / “Vul een geldig rentepercentage in.”

Testset

1. Basiscase
    INVUL: Maximaal maandbedrag € 250, rente 6%, looptijd 60 maanden. Verwacht: maximale lening circa € 12.931.
2. Edge-case
    INVUL: Maandruimte € 0, rente 6%, looptijd 60 maanden. Verwacht: maximale lening € 0 of melding “Er is geen maandelijkse ruimte om te lenen.”
3. Regresstest tegen bekende uitkomst
    INVUL: Maximaal maandbedrag € 1.000, rente 0%, looptijd 12 maanden. Verwacht: maximale lening € 12.000.
