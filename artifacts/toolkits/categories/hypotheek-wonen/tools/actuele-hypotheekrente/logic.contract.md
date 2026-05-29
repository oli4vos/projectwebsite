# Actuele hypotheekrente — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/actuele-hypotheekrente.html

## Uit invulblad

Actuele hypotheekrente

Bron-URL: https://www.externe-bron.nl/hypotheek/actuele-hypotheekrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Tonen en filteren van actuele hypotheekrentes op basis van rentevaste periode, hypotheekvorm, loan-to-value/risicoklasse, NHG-ja/nee en aanbieder. Dit is primair een datagedreven vergelijking, geen formuletool.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: laad rentetabel met velden aanbieder, rentePercentage, rentevastePeriodeJaren, hypotheekvorm, nhg, ltvVan, ltvTot, peildatum. Stap 2: filter op invoercriteria. Stap 3: sorteer standaard oplopend op rentePercentage. Stap 4: optioneel bereken indicatieve maandlast bij gekozen hypotheekbedrag: bij annuïtair maandlast = P * r / (1 - (1+r)^(-n)); bij aflossingsvrij maandrente = P * r; waarbij r = rentePercentage / 100 / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentepercentages zijn nominale jaarrentes. Voor maandlasten delen door 12. Rentevaste periode in jaren. LTV = hypotheekbedrag / woningwaarde * 100.
4. Afrondingsregels
    INVUL: Rente tonen met 2 of 3 decimalen. Maandlasten op 2 decimalen. LTV op 1 of 2 decimalen. Geen afronding gebruiken voor filterbeslissingen.

Output-contract

1. Primaire outputs
    INVUL: renteResultaten[] met aanbieder, rentePercentage, rentevastePeriodeJaren, hypotheekvorm, NHG, risicoklasse, peildatum; optioneel laagsteRente, gemiddeldeRente, aantalResultaten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Tabel met renteaanbieders; optioneel maandlastindicatie per rente; grafiek rente per rentevaste periode.
3. Formatregels voor UI
    INVUL: Percentages als 4,25%; eurobedragen als € 1.234,56; peildatum als dd-mm-jjjj; sortering oplopend op rente.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekende rentetabel of peildatum is onvoldoende. Onbekende rentevaste periode of hypotheekvorm is ongeldig. Woningwaarde <= 0 is ongeldig wanneer LTV wordt berekend.
2. Domeinbeperkingen
    INVUL: rentePercentage >= 0; rentevastePeriodeJaren > 0; 0 <= LTV <= 200; rentetabel moet actueel of expliciet gedateerd zijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Er zijn geen rentetarieven gevonden voor deze selectie.” / “Vul een geldige woningwaarde en hypotheek in.” / “De rentetabel ontbreekt of is niet actueel.”

Testset

1. Basiscase
    INVUL: Rentetabel met drie rentes 4,20%, 4,00%, 4,50% voor 10 jaar annuïtair NHG. Verwacht: resultaten gesorteerd met 4,00% als laagste rente.
2. Edge-case
    INVUL: Filter op combinatie zonder tarieven. Verwacht: lege resultaten en melding “Er zijn geen rentetarieven gevonden voor deze selectie.”
3. Regresstest tegen bekende uitkomst
    INVUL: Hypotheek € 300.000, rente 4%, looptijd 360 maanden, annuïtair. Verwacht indicatieve maandlast circa € 1.432,25.
