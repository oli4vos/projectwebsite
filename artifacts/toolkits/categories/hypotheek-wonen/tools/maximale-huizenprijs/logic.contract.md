# Maximale huizenprijs — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/maximale-huizenprijs.html

## Uit invulblad

Maximale huizenprijs

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/maximale-huizenprijs.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke maximale koopprijs mogelijk is op basis van maximale hypotheek, eigen geld en aankoopkosten.
2. Exacte formules/stappenvolgorde
    INVUL: Als kosten koper percentage k over koopprijs zijn: maxKoopprijs = (maxHypotheek + eigenGeld - vasteKosten) / (1 + k/100). Als kosten direct zijn: maxKoopprijs = maxHypotheek + eigenGeld - kostenKoper. Begrens op >= 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle bedragen in euro. Kostenpercentage over koopprijs. Geen maand/jaarconversie.
4. Afrondingsregels
    INVUL: Maximale huizenprijs naar beneden op hele euro’s afronden. Kosten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleKoopprijs, maximaleHypotheek, eigenGeld, geschatteKostenKoper, totaleBeschikbareMiddelen.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie kostenposten en financiering.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Maximale hypotheek < 0, eigen geld < 0, kostenpercentage < 0 of ontbrekende financieringsgegevens zijn ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: maxHypotheek + eigenGeld > vasteKosten; kostenPercentage >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige maximale hypotheek in.” / “Vul een geldig bedrag aan eigen geld in.” / “De kosten zijn hoger dan de beschikbare middelen.”

Testset

1. Basiscase
    INVUL: Max hypotheek € 400.000, eigen geld € 20.000, kostenpercentage 5%. Verwacht max koopprijs € 400.000.
2. Edge-case
    INVUL: Geen kosten, eigen geld € 0. Verwacht max koopprijs = max hypotheek.
3. Regresstest tegen bekende uitkomst
    INVUL: Max hypotheek € 300.000, eigen geld € 30.000, vaste kosten € 10.000. Verwacht max koopprijs € 320.000.
