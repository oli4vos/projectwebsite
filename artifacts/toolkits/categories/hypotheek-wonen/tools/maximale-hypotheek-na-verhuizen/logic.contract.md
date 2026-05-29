# Maximale hypotheek na verhuizen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-na-verhuizen.html

## Uit invulblad

Maximale hypotheek na verhuizen

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-na-verhuizen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de maximale nieuwe hypotheek na verkoop van de huidige woning, rekening houdend met overwaarde/restschuld, eigenwoningreserve en bestaande lasten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: verkoopopbrengstNetto = verkoopprijsHuidigeWoning - verkoopkosten - bestaandeHypotheek. Stap 2: als positief: overwaarde = verkoopopbrengstNetto; als negatief: restschuld = abs(verkoopopbrengstNetto). Stap 3: bereken inkomensmax zoals maximale hypotheek. Stap 4: bereken benodigde hypotheek voor nieuwe woning: koopprijsNieuw + kosten - eigenGeld - inTeBrengenOverwaarde. Stap 5: maximaleNieuweHypotheek = min(inkomensMax, woningwaardeNieuw * maxLTV/100).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle woningbedragen in euro. Rente per jaar naar maand. Inkomen per jaar. Kostenpercentages over koopprijs/verkoopprijs.
4. Afrondingsregels
    INVUL: Hypotheekbedragen op hele euro’s naar beneden. Overwaarde/restschuld op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: overwaardeOfRestschuld, maximaleNieuweHypotheek, inkomensMax, ltvMax, benodigdeHypotheekNieuweWoning.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Verkoopopbrengstberekening, aankoopberekening, eigenwoningreserve-indicatie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; hypotheekmaximum eventueel hele euro’s; status overwaarde/restschuld.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Verkoopprijs < 0, bestaande hypotheek < 0, nieuwe koopprijs <= 0 of inkomen ontbreekt voor inkomensmax is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: nieuweWoningwaarde > 0; 0 <= maxLTV <= 100; verkoopkosten >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige verkoopprijs in.” / “Vul een geldige bestaande hypotheek in.” / “Vul gegevens van de nieuwe woning in.”

Testset

1. Basiscase
    INVUL: Verkoop € 400.000, hypotheek € 300.000, verkoopkosten € 10.000. Verwacht overwaarde € 90.000.
2. Edge-case
    INVUL: Verkoop gelijk aan hypotheek plus kosten. Verwacht overwaarde/restschuld € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Nieuwe woning € 500.000, maxLTV 100%, inkomensmax € 450.000. Verwacht maximale nieuwe hypotheek € 450.000.
