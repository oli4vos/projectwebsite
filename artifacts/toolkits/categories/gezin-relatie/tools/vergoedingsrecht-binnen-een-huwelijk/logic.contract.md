# Vergoedingsrecht binnen een huwelijk — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/vergoedingsrecht-binnen-huwelijk.html

## Uit invulblad

Vergoedingsrecht binnen een huwelijk

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/vergoedingsrecht-binnen-huwelijk.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk vergoedingsrecht ontstaat wanneer privévermogen is gebruikt voor een gemeenschappelijk goed of gemeenschapsvermogen is gebruikt voor een privégoed, met toepassing van nominale of beleggingsleer afhankelijk van situatie en datum/regime.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal regime: nominaal of beleggingsleer. Stap 2: bepaal inbreng = geïnvesteerdBedrag. Stap 3 bij nominale vergoeding: vergoeding = inbreng. Stap 4 bij beleggingsleer voor goed met waardeontwikkeling: investeringsAandeel = inbreng / waardeGoedTenTijdeVanInvestering; vergoeding = investeringsAandeel * waardeGoedOpPeildatum. Stap 5: als investering deels financiering/aflossing betreft, pas aandeel alleen toe op relevante waardecomponent volgens gekozen rekenoptie. Stap 6: vergoedingsrecht kan positief of negatief zijn afhankelijk van richting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro op relevante datums. Percentages voor eigendoms- of investeringsaandeel in procenten. Geen maand/jaarconversie, behalve datum bepaalt welk juridisch regime/parameter van toepassing is.
4. Afrondingsregels
    INVUL: Geldbedragen op 2 decimalen. Investeringsaandeel intern minimaal 8 decimalen, tonen met 4 decimalen of als percentage met 2 decimalen. Eindvergoeding op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: vergoeding, regime, investeringsAandeel, waardeontwikkelingEffect, richtingVergoeding.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsstappen[] met inbreng, waarde bij investering, waarde peildatum, aandeel en eindvergoeding. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 of 4 decimalen; richting als “privé heeft vordering op gemeenschap” of “gemeenschap heeft vordering op privé”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inbreng leeg/niet-numeriek of < 0 is ongeldig. Bij beleggingsleer ontbrekende waarde bij investering of peildatum is onvoldoende. Waarde bij investering <= 0 is ongeldig. Ontbrekend regime is onvoldoende.
2. Domeinbeperkingen
    INVUL: inbreng >= 0; bij beleggingsleer waardeGoedTenTijdeVanInvestering > 0; waardeGoedOpPeildatum >= 0; investeringsaandeel kan groter dan 100% alleen als expliciet toegestaan, anders waarschuwing.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig geïnvesteerd bedrag in.” / “Vul de waarde bij investering en de waarde op peildatum in.” / “De waarde bij investering moet groter zijn dan 0.” / “Kies of de nominale methode of beleggingsleer moet worden toegepast.”

Testset

1. Basiscase
    INVUL: Beleggingsleer: inbreng € 50.000, waarde bij investering € 250.000, waarde peildatum € 400.000. Verwacht: aandeel 20%, vergoeding € 80.000.
2. Edge-case
    INVUL: Nominale methode: inbreng € 50.000. Verwacht: vergoeding € 50.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Beleggingsleer: inbreng € 30.000, waarde bij investering € 300.000, waarde peildatum € 270.000. Verwacht: aandeel 10%, vergoeding € 27.000.
