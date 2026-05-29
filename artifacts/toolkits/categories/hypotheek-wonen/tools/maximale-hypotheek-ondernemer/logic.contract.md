# Maximale hypotheek ondernemer — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-ondernemer.html

## Uit invulblad

Maximale hypotheek ondernemer

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-ondernemer.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen van maximale hypotheek voor een ondernemer op basis van gemiddeld of toetsbaar ondernemersinkomen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken toetsinkomen ondernemer, bijvoorbeeld gemiddeldeWinst = gemiddelde(winstJaar1, winstJaar2, winstJaar3) en toetsinkomen = min(gemiddeldeWinst, laatsteJaarWinst) indien conservatieve methode actief. Stap 2: tel eventueel partnerinkomen mee. Stap 3: bepaal financieringslastpercentage uit normtabel. Stap 4: bereken toegestane maandlast en maximale hypotheek via annuïteits-inverse. Stap 5: pas LTV-grens toe.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Winst/inkomen per jaar in euro. Rente per jaar naar maand. Looptijd jaren naar maanden.
4. Afrondingsregels
    INVUL: Toetsinkomen op hele euro’s. Maximale hypotheek naar beneden op hele euro’s. Maandlast op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: toetsinkomenOndernemer, maximaleHypotheek, toegestaneMaandlast, financieringslastPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Winsthistorie, gemiddelde winst, correcties, normtabelregel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; percentages met 2 decimalen; indicatief label.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen winstjaren ingevuld is onvoldoende. Negatieve winst kan toegestaan zijn in gemiddelde maar moet expliciet worden verwerkt; niet-numerieke waarden ongeldig. Normtabel ontbreekt is onvoldoende.
2. Domeinbeperkingen
    INVUL: Minimaal één geldig winstjaar; voor standaardtoets bij voorkeur drie jaren. toetsinkomen > 0 voor positieve hypotheek.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één geldig ondernemersinkomen in.” / “Voor een volledige berekening zijn meerdere winstjaren nodig.” / “Voor dit jaar ontbreken financieringslastnormen.”

Testset

1. Basiscase
    INVUL: Winsten € 60.000, € 70.000, € 80.000, conservatief min gemiddelde/laatste. Verwacht toetsinkomen € 70.000.
2. Edge-case
    INVUL: Alle winsten € 0. Verwacht maximale hypotheek € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Direct toegestane maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht hypotheek € 360.000.
