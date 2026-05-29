# Prijsontwikkeling huizenprijzen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/wonen-en-hypotheek/woning-waarde-huizenprijzen.html

## Uit invulblad

Prijsontwikkeling huizenprijzen

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/woning-waarde-huizenprijzen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de ontwikkeling van een woningwaarde tussen twee datums op basis van prijsindexen of jaarlijkse stijgingspercentages.
2. Exacte formules/stappenvolgorde
    INVUL: Indexmethode: nieuweWaarde = beginWaarde * indexEind / indexBegin. Percentagemethode: waarde_t = beginWaarde * Π(1 + stijgingspercentageJaar_i/100). Verschil: waardeverandering = nieuweWaarde - beginWaarde, percentageTotaal = nieuweWaarde / beginWaarde - 1.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Waarde in euro. Indexen dimensieloos. Percentages per jaar of periode. Maandindexen direct gebruiken indien beschikbaar.
4. Afrondingsregels
    INVUL: Woningwaarde op hele euro’s of 2 decimalen. Percentageverandering met 2 decimalen. Indexratio intern exact.

Output-contract

1. Primaire outputs
    INVUL: geschatteWoningwaarde, waardeverandering, percentageVerandering, indexBegin, indexEind.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Waardeontwikkeling per jaar/maand; grafiek index of woningwaarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met hele euro’s/2 decimalen; percentages met 2 decimalen; datums als maand/jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Beginwaarde <= 0, ontbrekende index voor begin/eindperiode of einddatum vóór begindatum is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: beginWaarde > 0; indexBegin > 0; indexEind > 0; datumbereik moet in dataset vallen.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige beginwaarde in.” / “Voor deze periode ontbreekt de huizenprijsindex.” / “De einddatum mag niet vóór de begindatum liggen.”

Testset

1. Basiscase
    INVUL: Beginwaarde € 300.000, index begin 100, index eind 120. Verwacht waarde € 360.000.
2. Edge-case
    INVUL: Index begin = index eind. Verwacht waarde gelijk aan beginwaarde.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginwaarde € 400.000, stijging 10% en daarna -10%. Verwacht € 396.000.
