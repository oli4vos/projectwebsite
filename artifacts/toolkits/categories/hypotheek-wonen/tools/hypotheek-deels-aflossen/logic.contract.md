# Hypotheek deels aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-aflossen-lagere-rente.html

## Uit invulblad

Hypotheek deels aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-aflossen-lagere-rente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of een gedeeltelijke aflossing leidt tot een lagere rente door een lagere risicoklasse, en wat het effect is op maandlasten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken nieuweSchuld = huidigeSchuld - extraAflossing. Stap 2: bereken huidige en nieuwe LTV. Stap 3: bepaal huidige en nieuwe rente uit risicoklassen. Stap 4: bereken maandlast oud en nieuw met hypotheekvorm. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: maandrente = P*r. Stap 5: maandbesparing = oudeMaandlast - nieuweMaandlast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. LTV in procenten. Looptijd in maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten en besparing op 2 decimalen. LTV op 2 decimalen. Rente met 3 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nieuweSchuld, nieuweRente, oudeMaandlast, nieuweMaandlast, maandbesparing, nieuweLTV.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Risicoklassevergelijking en aflosschema voor oude/nieuwe situatie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2/3 decimalen; hypotheekvorm als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, woningwaarde <= 0, extra aflossing < 0, looptijd <= 0, ontbrekende rentetabel is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= extraAflossing <= huidigeSchuld; woningwaarde > 0; rentetabel moet LTV afdekken.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige woningwaarde in.” / “De extra aflossing mag niet hoger zijn dan de hypotheekschuld.”

Testset

1. Basiscase
    INVUL: Schuld € 300.000, woningwaarde € 400.000, aflossing € 20.000, rente daalt van 4% naar 3,8%, aflossingsvrij. Verwacht maandbesparing door schuld- en rentedaling.
2. Edge-case
    INVUL: Extra aflossing € 0, rente gelijk. Verwacht besparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij schuld € 100.000, aflossing € 10.000, rente blijft 3%. Verwacht rentelast van € 250 naar € 225, besparing € 25.
