# Aflosboete Wet Hillen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/aflosboete-berekenen.html

## Uit invulblad

Aflosboete Wet Hillen

Bron-URL: https://www.externe-bron.nl/hypotheek/aflosboete-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel extra inkomstenbelasting ontstaat doordat de aftrek wegens geen of geringe eigenwoningschuld, bekend als Wet Hillen, wordt afgebouwd wanneer de eigenwoningschuld laag of nihil is.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken eigenwoningforfait = woningwaarde * ewfPercentage volgens jaartabel. Stap 2: bepaal aftrekbareRente = betaaldeHypotheekrente. Stap 3: positiefSaldoEigenWoning = max(0, eigenwoningforfait - aftrekbareRente). Stap 4: hillenAftrek = positiefSaldoEigenWoning * hillenAftrekPercentage uit jaartabel. Stap 5: belastbaarSaldoEigenWoning = positiefSaldoEigenWoning - hillenAftrek. Stap 6: belastingEffect = belastbaarSaldoEigenWoning * marginaalBelastingtariefEigenWoning.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Woningwaarde en rente zijn jaarbedragen in euro. Maandrente naar jaar via * 12. Percentages uit jaartabel delen door 100. Belastingtarief is jaarpercentage.
4. Afrondingsregels
    INVUL: Eigenwoningforfait, Hillen-aftrek en belastbaar saldo op hele euro’s of 2 decimalen afhankelijk van fiscale UI; standaard 2 decimalen. Belastingeffect op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: eigenwoningforfait, aftrekbareRente, positiefSaldoEigenWoning, hillenAftrek, belastbaarSaldoEigenWoning, belastingEffect.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na afbouw Hillen; schema per jaar indien meerdere jaren worden gekozen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaar als viercijferig jaartal; duidelijke tekst “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde ontbreekt of < 0 is ongeldig. Ontbrekende jaartabel is onvoldoende. Betaalde rente < 0 is ongeldig. Belastingtarief ontbreekt is onvoldoende als belastingeffect wordt berekend.
2. Domeinbeperkingen
    INVUL: woningwaarde >= 0; aftrekbareRente >= 0; 0 <= hillenAftrekPercentage <= 100; 0 <= marginaalBelastingtarief <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige betaalde hypotheekrente in.” / “Voor dit jaar ontbreken de fiscale parameters.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 400.000, EWF 0,35%, rente € 0, Hillen-aftrek 80%, tarief 37%. Verwacht: EWF € 1.400, belastbaar saldo € 280, belastingeffect € 103,60.
2. Edge-case
    INVUL: Woningwaarde € 400.000, EWF € 1.400, rente € 2.000. Verwacht: positief saldo € 0, belastingeffect € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Woningwaarde € 300.000, EWF 0,5%, rente € 500, Hillen-aftrek 60%, tarief 40%. Verwacht: EWF € 1.500, positief saldo € 1.000, belastbaar € 400, belasting € 160.
