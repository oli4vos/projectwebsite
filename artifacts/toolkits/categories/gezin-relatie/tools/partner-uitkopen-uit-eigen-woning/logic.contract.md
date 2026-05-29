# Partner uitkopen uit eigen woning — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/partner-uitkopen-woning.html

## Uit invulblad

Partner uitkopen uit eigen woning

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/partner-uitkopen-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk bedrag de blijvende partner moet betalen om de andere partner uit te kopen uit de gezamenlijke woning, rekening houdend met woningwaarde, hypotheekschuld, eigendomsverhouding en eventuele correcties.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nettoOverwaarde = woningwaarde - hypotheekschuld - verkoopOfOverdrachtsKosten + overigeCorrecties. Stap 2: aandeelVertrekkendePartner = nettoOverwaarde * eigendomspercentageVertrekkendePartner / 100. Stap 3: pas persoonlijke vorderingen/vergoedingen toe: uitkoopbedrag = aandeelVertrekkendePartner + vergoedingAanVertrekkende - vergoedingDoorVertrekkende. Stap 4: als nettoOverwaarde negatief is: aandeel is negatieve overwaarde en kan leiden tot vergoeding door vertrekkende partner aan blijvende partner, afhankelijk van gekozen tekenconventie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro op peildatum. Eigendomspercentage in procenten. Geen maand/jaarconversie, tenzij maandlasten als aanvullende informatie worden getoond.
4. Afrondingsregels
    INVUL: Alle geldbedragen op 2 decimalen. Eigendomspercentage met maximaal 4 decimalen accepteren. Eindbedrag eventueel afronden op hele euro’s via UI-parameter.

Output-contract

1. Primaire outputs
    INVUL: nettoOverwaarde, aandeelVertrekkendePartner, correctiesSaldo, uitkoopbedrag, richtingBetaling.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsregels[] met woningwaarde, hypotheek, kosten, eigendomspercentages en correcties. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; richting als “blijvende partner betaalt” of “vertrekkende partner betaalt”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde ontbreekt of < 0 is ongeldig. Hypotheekschuld < 0 is ongeldig. Eigendomspercentage ontbreekt is onvoldoende. Percentages buiten 0-100 zijn ongeldig.
2. Domeinbeperkingen
    INVUL: woningwaarde >= 0; hypotheekschuld >= 0; 0 <= eigendomspercentageVertrekkendePartner <= 100; kosten en correcties mogen positief of negatief zijn afhankelijk van type.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige hypotheekschuld in.” / “Vul een geldig eigendomspercentage in.” / “De eigendomspercentages moeten samen 100% zijn.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 400.000, hypotheek € 300.000, eigendom vertrekkende partner 50%, geen correcties. Verwacht: netto overwaarde € 100.000, uitkoopbedrag € 50.000.
2. Edge-case
    INVUL: Woningwaarde € 300.000, hypotheek € 300.000, eigendom 50%. Verwacht: uitkoopbedrag € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Woningwaarde € 500.000, hypotheek € 350.000, kosten € 10.000, eigendom vertrekkende 40%, vergoeding aan vertrekkende € 5.000. Verwacht: netto overwaarde € 140.000, aandeel € 56.000, uitkoopbedrag € 61.000.
