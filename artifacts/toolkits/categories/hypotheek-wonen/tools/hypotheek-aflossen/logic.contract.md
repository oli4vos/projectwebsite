# Hypotheek aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/modules/wonen/hypotheek-aflossen-of-niet.html

## Uit invulblad

Hypotheek aflossen

Bron-URL: https://www.externe-bron.nl/modules/wonen/hypotheek-aflossen-of-niet.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken of extra aflossen op de hypotheek financieel gunstiger is dan het geld aanhouden of alternatief gebruiken.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken bruto rentebesparing: brutoBesparingPerJaar = extraAflossing * hypotheekrente / 100. Stap 2: netto besparing na hypotheekrenteaftrek: nettoBesparing = brutoBesparing * (1 - aftrekTarief). Stap 3: bereken alternatief rendement na belasting: nettoAlternatief = extraAflossing * alternatiefRendementNaBelasting / 100. Stap 4: voordeelAflossen = nettoBesparing - nettoAlternatief. Stap 5: optioneel effect box 3: vermogensrendementsheffingbesparing toevoegen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Percentages per jaar. Maandbesparing = jaarbesparing / 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Percentages met 2 decimalen. Vergelijking op jaarbasis.

Output-contract

1. Primaire outputs
    INVUL: nettoBesparingAflossenPerJaar, nettoAlternatiefRendementPerJaar, verschilPerJaar, verschilPerMaand, adviesIndicatie.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Scenariovergelijking over meerdere jaren; grafiek cumulatief voordeel.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; advies als “aflossen voordeliger” of “alternatief voordeliger”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Extra aflossing <= 0, hypotheekrente ontbreekt/niet-numeriek, aftrektarief buiten bereik of alternatief rendement ontbreekt is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekTarief <= 100; extraAflossing <= hypotheekschuld; rendement groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige extra aflossing in.” / “Vul een geldige hypotheekrente in.” / “Vul een geldig alternatief rendement in.”

Testset

1. Basiscase
    INVUL: Aflossing € 10.000, hypotheekrente 4%, aftrek 37%, alternatief 1%. Verwacht netto aflosbesparing € 252, alternatief € 100, voordeel € 152/jaar.
2. Edge-case
    INVUL: Alternatief rendement gelijk aan netto hypotheekrente. Verwacht verschil € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossing € 20.000, rente 3%, aftrek 0%, alternatief 0%. Verwacht voordeel € 600/jaar.
