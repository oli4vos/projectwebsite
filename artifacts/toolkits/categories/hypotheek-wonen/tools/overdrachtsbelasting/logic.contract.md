# Overdrachtsbelasting — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/wonen-en-hypotheek/overdrachtsbelasting-berekenen.html

## Uit invulblad

Overdrachtsbelasting

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/overdrachtsbelasting-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel overdrachtsbelasting verschuldigd is bij aankoop van een woning of ander vastgoed, rekening houdend met tarief en vrijstelling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal grondslag = koopprijs of hogere waarde indien parameter marktwaarde wordt gebruikt. Stap 2: bepaal tarief uit jaartabel op basis van gebruikstype, leeftijd, startersvrijstelling en waardegrens. Stap 3: als vrijstelling van toepassing: overdrachtsbelasting = 0. Anders: overdrachtsbelasting = grondslag * tarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Koopprijs/waarde in euro. Tarief in procenten. Geen maand/jaarconversie behalve gekozen belastingjaar.
4. Afrondingsregels
    INVUL: Overdrachtsbelasting op 2 decimalen of hele euro’s volgens fiscale parameter. Tarief met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: overdrachtsbelasting, toegepastTarief, grondslag, vrijstellingToegepast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Voorwaardentoets startersvrijstelling/verlaagd tarief/beleggerstarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; vrijstelling als ja/nee.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, ontbrekend gebruikstype of ontbrekende jaartabel is ongeldig/onvoldoende. Leeftijd ontbreekt bij startersvrijstellingstoets is onvoldoende.
2. Domeinbeperkingen
    INVUL: grondslag > 0; 0 <= tarief <= 100; jaarparameters beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Kies het gebruik van de woning.” / “Voor dit jaar ontbreekt het tarief overdrachtsbelasting.”

Testset

1. Basiscase
    INVUL: Koopprijs € 400.000, tarief 2%. Verwacht belasting € 8.000.
2. Edge-case
    INVUL: Vrijstelling van toepassing. Verwacht € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, tarief 10%. Verwacht € 30.000.
