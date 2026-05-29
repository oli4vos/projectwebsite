# Restschuld berekenen & aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/restschuld-eigen-woning.html

## Uit invulblad

Restschuld berekenen & aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek/restschuld-eigen-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van restschuld na verkoop van de eigen woning en eventueel het maandbedrag om deze restschuld af te lossen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nettoVerkoopopbrengst = verkoopprijs - verkoopkosten. Stap 2: restschuld = max(0, hypotheekschuld - nettoVerkoopopbrengst). Stap 3: als aflossen restschuld wordt berekend: A = restschuld * r / (1-(1+r)^(-n)); bij r=0: A = restschuld/n. Stap 4: totaleRente = A*n - restschuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Verkoopbedragen in euro. Rente per jaar naar maand. Looptijd in jaren naar maanden.
4. Afrondingsregels
    INVUL: Restschuld en maandbedrag op 2 decimalen. Looptijd in maanden. Laatste termijn corrigeren.

Output-contract

1. Primaire outputs
    INVUL: restschuld, nettoVerkoopopbrengst, maandbedragAflossen, totaleRente, totaalTerugbetaald.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Aflosschema restschuld; specificatie verkoopkosten.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; status restschuld/geen restschuld.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Verkoopprijs < 0, hypotheekschuld < 0, verkoopkosten < 0, looptijd <= 0 bij aflosberekening is ongeldig.
2. Domeinbeperkingen
    INVUL: hypotheekschuld >= 0; nettoVerkoopopbrengst >= 0 kan negatief worden begrensd afhankelijk UI; rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige verkoopprijs in.” / “Vul een geldige hypotheekschuld in.” / “Vul een positieve looptijd in voor het aflossen.”

Testset

1. Basiscase
    INVUL: Hypotheek € 300.000, verkoopprijs € 280.000, kosten € 5.000. Verwacht restschuld € 25.000.
2. Edge-case
    INVUL: Verkoopopbrengst hoger dan hypotheek. Verwacht restschuld € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Restschuld € 12.000, rente 0%, looptijd 12 maanden. Verwacht maandbedrag € 1.000.
