# Hogere maximale hypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hogere-maximale-hypotheek-met-renteconstructie.html

## Uit invulblad

Hogere maximale hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/hogere-maximale-hypotheek-met-renteconstructie.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of een renteconstructie, bijvoorbeeld rentekorting of rentedepot, leidt tot een hogere maximale hypotheek op basis van lagere toetslast.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal toegestaneMaandlast uit inkomen via financieringslastpercentage of directe invoer. Stap 2: bereken maximale hypotheek zonder constructie met toetsrente r1: P1 = maandlast * (1 - (1+r1)^(-n)) / r1. Stap 3: bereken maximale hypotheek met constructie met lagere toetsrente r2: P2 = maandlast * (1 - (1+r2)^(-n)) / r2. Stap 4: extraHypotheek = P2 - P1. Stap 5: begrens op marktwaarde/LTV indien van toepassing.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse toetsrente naar maandrente via /12. Looptijd in jaren naar maanden. Inkomen per jaar naar maand indien nodig via /12.
4. Afrondingsregels
    INVUL: Hypotheekbedragen op hele euro’s naar beneden afronden. Maandlasten op 2 decimalen. Percentages op 2 of 3 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheekZonderConstructie, maximaleHypotheekMetConstructie, extraHypotheek, toegestaneMaandlast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking rentetarieven, toetslasten en LTV-grens.
3. Formatregels voor UI
    INVUL: Eurobedragen als hele euro’s of 2 decimalen; rentepercentages met 2 decimalen; duidelijke indicatie “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Toegestane maandlast ontbreekt én inkomen/norm ontbreken is onvoldoende. Rente ontbreekt of negatief is ongeldig. Looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: maandlast > 0; 0 <= r2 <= r1 voor hogere-hypotheekscenario; looptijdMaanden > 0; LTV maximaal via parameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige toegestane maandlast of inkomensgegevens in.” / “Vul geldige rentetarieven in.” / “De looptijd moet positief zijn.”

Testset

1. Basiscase
    INVUL: Maandlast € 1.500, looptijd 30 jaar, rente zonder 5%, met 4%. Verwacht: maximale hypotheek met constructie hoger.
2. Edge-case
    INVUL: Rente zonder = rente met. Verwacht: extra hypotheek € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 1.000, looptijd 30 jaar, rente 0%. Verwacht maximale hypotheek € 360.000.
