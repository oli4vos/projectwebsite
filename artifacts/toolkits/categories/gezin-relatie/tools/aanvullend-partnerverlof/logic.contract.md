# Aanvullend partnerverlof — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/kinderen/aanvullend-partnerverlof-berekenen.html

## Uit invulblad

Aanvullend partnerverlof

Bron-URL: https://www.externe-bron.nl/kinderen/aanvullend-partnerverlof-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel aanvullend partnerverlof kan worden opgenomen en wat het bruto/netto inkomenseffect is ten opzichte van normaal loon.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal weekloon = brutoMaandloon * 12 / 52 of gebruik direct ingevoerd weekloon. Stap 2: bepaal maxVerlofWeken = 5 * arbeidsduurPerWeek / arbeidsduurPerWeek = 5 weken, tenzij UI verlofuren gebruikt: maxVerlofUren = 5 * arbeidsduurPerWeek. Stap 3: opgenomenVerlofUren = min(gevraagdeVerlofUren, maxVerlofUren). Stap 4: loonPerUur = brutoMaandloon * 12 / (52 * arbeidsduurPerWeek). Stap 5: normaalBrutoLoonVerlofuren = opgenomenVerlofUren * loonPerUur. Stap 6: uitkeringBruto = normaalBrutoLoonVerlofuren * uitkeringspercentage, waarbij uitkeringspercentage parametriseerbaar is, standaard 70%. Stap 7: pas maximumdagloon toe indien actief: uitkeringBruto = min(uitkeringBruto, maxUitkeringOverUren). Stap 8: brutoInkomensverlies = normaalBrutoLoonVerlofuren - uitkeringBruto. Netto-uitkomst alleen berekenen als loonheffingparameters beschikbaar zijn; anders bruto tonen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandloon naar jaarloon via * 12; jaarloon naar weekloon via / 52; weekloon naar uurloon via / arbeidsduurPerWeek. Percentage 70 betekent 70% en intern 0,70. Alle bedragen in euro.
4. Afrondingsregels
    INVUL: Uren afronden op 2 decimalen. Eurobedragen afronden op 2 decimalen. Percentages tonen met 2 decimalen. Netto-berekening pas na alle bruto-stappen afronden.

Output-contract

1. Primaire outputs
    INVUL: maxVerlofUren, opgenomenVerlofUren, normaalBrutoLoon, uitkeringBruto, brutoInkomensverlies, optioneel nettoInkomensverlies.
2. Secundaire outputs/tabellen/grafieken
    INVUL: verlofSchema[] per week met verlofuren, normaal loon, uitkering en verlies. Optioneel grafiek normaal loon versus uitkering.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 70,00%; uren met maximaal 2 decimalen; weken met maximaal 1 decimaal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bruto maandloon leeg/niet-numeriek of < 0 is ongeldig. Arbeidsduur per week <= 0 is ongeldig. Gevraagde verlofuren < 0 is ongeldig. Als bruto maandloon 0 is, is berekening geldig maar uitkering 0.
2. Domeinbeperkingen
    INVUL: arbeidsduurPerWeek > 0; opgenomenVerlofUren <= 5 * arbeidsduurPerWeek; 0 <= uitkeringspercentage <= 100; maximumdagloon en fiscale parameters zijn jaartabelparameters, geen hardcoded logica.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bruto maandloon in.” / “Vul een geldige arbeidsduur per week in.” / “Het aantal verlofuren mag niet negatief zijn.” / “Het aangevraagde verlof is hoger dan het maximum.”

Testset

1. Basiscase
    INVUL: Bruto maandloon € 3.000, arbeidsduur 40 uur, verlof 200 uur, uitkeringspercentage 70%, geen maximumdagloon. Verwacht: normaal bruto loon circa € 3.461,54, uitkering € 2.423,08, bruto verlies € 1.038,46.
2. Edge-case
    INVUL: Bruto maandloon € 3.000, arbeidsduur 40 uur, verlof 0 uur. Verwacht: uitkering € 0, verlies € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto maandloon € 2.600, arbeidsduur 32 uur, verlof 160 uur, uitkeringspercentage 70%. Verwacht: normaal bruto loon € 3.000,00, uitkering € 2.100,00, bruto verlies € 900,00.
