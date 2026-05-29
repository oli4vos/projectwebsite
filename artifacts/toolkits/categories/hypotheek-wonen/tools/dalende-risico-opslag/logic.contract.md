# Dalende risico opslag — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/risico-opslag-hypotheekrente-bij-aflossen.html

## Uit invulblad

Dalende risico opslag

Bron-URL: https://www.externe-bron.nl/hypotheek/risico-opslag-hypotheekrente-bij-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of extra aflossen of waardestijging leidt tot een lagere risicoklasse en rente-opslag, en wat de maandelijkse rentebesparing is.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken huidige LTV: huidigeLTV = huidigeHypotheekschuld / woningwaarde * 100. Stap 2: bepaal huidige risicoklasse uit tabel. Stap 3: bereken nieuwe schuld: nieuweSchuld = huidigeHypotheekschuld - extraAflossing. Stap 4: nieuweLTV = nieuweSchuld / woningwaarde * 100. Stap 5: bepaal nieuwe risicoklasse en rente-opslag. Stap 6: rentebesparingPerJaar = nieuweSchuld * (oudeRente - nieuweRente) / 100, of bij zelfde schuld zonder aflossing huidigeSchuld * renteverschil. Stap 7: maandbesparing = jaarbesparing / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: LTV in procenten. Rente/opslag als percentage per jaar. Maandbesparing = jaarbesparing / 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: LTV op 2 decimalen. Rente op 3 decimalen. Eurobedragen op 2 decimalen. Risicoklasse bepalen zonder afgeronde LTV.

Output-contract

1. Primaire outputs
    INVUL: huidigeLTV, nieuweLTV, huidigeRisicoklasse, nieuweRisicoklasse, oudeRente, nieuweRente, besparingPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Risicoklassen-tabel met grenzen en opslag; vergelijking vóór/na aflossing.
3. Formatregels voor UI
    INVUL: Percentages met 2 of 3 decimalen; eurobedragen met 2 decimalen; risicoklasse als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, hypotheekschuld < 0, extra aflossing < 0 of ontbrekende risicotabel is ongeldig/onvoldoende. Extra aflossing groter dan schuld is ongeldig.
2. Domeinbeperkingen
    INVUL: woningwaarde > 0; 0 <= hypotheekschuld; 0 <= extraAflossing <= hypotheekschuld; risicotabel moet de LTV-range afdekken.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige hypotheekschuld in.” / “De extra aflossing mag niet hoger zijn dan de hypotheekschuld.” / “Voor deze LTV ontbreekt een risicoklasse.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 400.000, schuld € 340.000, extra aflossing € 50.000, tabel: >80% opslag 0,4%, ≤80% opslag 0,1%. Verwacht: LTV van 85% naar 72,5%, opslag daalt met 0,3%.
2. Edge-case
    INVUL: Extra aflossing € 0, zelfde klasse. Verwacht: besparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 300.000, renteverschil 0,2%. Verwacht bruto jaarbesparing € 600, maand € 50.
