# Betaald ouderschapsverlof — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/kinderen/betaald-ouderschapsverlof-berekenen.html

## Uit invulblad

Betaald ouderschapsverlof

Bron-URL: https://www.externe-bron.nl/kinderen/betaald-ouderschapsverlof-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel betaald ouderschapsverlof kan worden opgenomen en wat de bruto/netto inkomensgevolgen zijn.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal arbeidsduurPerWeek. Stap 2: bepaal maxBetaaldVerlofUren = betaaldVerlofWeken * arbeidsduurPerWeek, standaard 9 * arbeidsduurPerWeek, maar parametriseerbaar. Stap 3: opgenomenVerlofUren = min(gevraagdeVerlofUren, maxBetaaldVerlofUren). Stap 4: uurloon = brutoMaandloon * 12 / (52 * arbeidsduurPerWeek). Stap 5: normaalBrutoLoonVerlofuren = opgenomenVerlofUren * uurloon. Stap 6: uitkeringBruto = normaalBrutoLoonVerlofuren * uitkeringspercentage, standaard 70%, begrensd door maximumdagloon indien parameter actief. Stap 7: brutoInkomensverlies = normaalBrutoLoonVerlofuren - uitkeringBruto.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon naar jaarloon via * 12; jaarloon naar uurloon via / (52 * urenPerWeek). Percentage-invoer delen door 100. Alle bedragen in euro. Verlof kan in uren of weken; weken naar uren via weken * arbeidsduurPerWeek.
4. Afrondingsregels
    INVUL: Uren op 2 decimalen. Eurobedragen op 2 decimalen. Verlofweken op 2 decimalen. Netto-effecten apart afronden na belastingberekening.

Output-contract

1. Primaire outputs
    INVUL: maxBetaaldVerlofUren, opgenomenVerlofUren, uitkeringBruto, normaalBrutoLoonVerlofuren, brutoInkomensverlies, optioneel nettoInkomensverlies.
2. Secundaire outputs/tabellen/grafieken
    INVUL: verlofSchema[] per week of maand met opgenomen uren, uitkering en verlies. Optioneel resterend betaald verlof.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; uren met 2 decimalen; weken met 1 of 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto maandloon leeg/niet-numeriek of < 0 is ongeldig. Arbeidsduur <= 0 is ongeldig. Verlofuren < 0 is ongeldig. Geboorte-/leeftijdsvoorwaarden zijn alleen valideerbaar als geboortedatum kind is ingevuld; anders “onvoldoende”.
2. Domeinbeperkingen
    INVUL: arbeidsduurPerWeek > 0; opgenomenVerlofUren <= betaaldVerlofWeken * arbeidsduurPerWeek; 0 <= uitkeringspercentage <= 100. Wettelijke leeftijdsgrenzen en maximumdagloon zijn jaartabelparameters.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bruto maandloon in.” / “Vul een geldige arbeidsduur per week in.” / “Het aantal verlofuren mag niet negatief zijn.” / “Er zijn onvoldoende gegevens om te bepalen of het verlof nog binnen de wettelijke termijn valt.”

Testset

1. Basiscase
    INVUL: Bruto maandloon € 3.000, arbeidsduur 40 uur, betaald verlof 9 weken, opgenomen 360 uur, uitkering 70%, geen maximumdagloon. Verwacht: normaal bruto loon € 6.230,77, uitkering € 4.361,54, verlies € 1.869,23.
2. Edge-case
    INVUL: Opgenomen verlof 0 uur. Verwacht: uitkering € 0, verlies € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto maandloon € 2.600, arbeidsduur 32 uur, opgenomen 288 uur, uitkering 70%. Verwacht: normaal bruto loon € 5.400,00, uitkering € 3.780,00, verlies € 1.620,00.
