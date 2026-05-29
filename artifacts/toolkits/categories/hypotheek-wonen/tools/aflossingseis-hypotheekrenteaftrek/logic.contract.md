# Aflossingseis hypotheekrenteaftrek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/aflossingseis-hypotheekrenteaftrek.html

## Uit invulblad

Aflossingseis hypotheekrenteaftrek

Bron-URL: https://www.externe-bron.nl/hypotheek/aflossingseis-hypotheekrenteaftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Controleren of een eigenwoningschuld voldoet aan de fiscale aflossingseis voor hypotheekrenteaftrek door de werkelijke restschuld te vergelijken met het maximaal toegestane annuïtaire schuldverloop.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal oorspronkelijke eigenwoningschuld P, contractrente r = rentePercentage / 100 / 12, totale looptijd N = 360 maanden of ingevoerde fiscale looptijd. Stap 2: bereken normannuïteit A = P * r / (1 - (1+r)^(-N)); bij r = 0: A = P / N. Stap 3: bereken na k verstreken maanden de maximaal toegestane schuld via annuïtair schema of formule: normRestschuld = P*(1+r)^k - A*((1+r)^k - 1)/r; bij r = 0: normRestschuld = P - A*k. Stap 4: vergelijk werkelijkeRestschuld <= normRestschuld + tolerantie.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Fiscale looptijd in jaren naar maanden via * 12. Rente is nominale jaarrente naar maandrente. Bedragen in euro.
4. Afrondingsregels
    INVUL: Normrestschuld intern exact berekenen. Vergelijking met tolerantie € 0,01 of instelbaar. Outputbedragen op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: voldoetAanAflossingseis: boolean; normRestschuld; werkelijkeRestschuld; verschil; verstrekenMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Normatief aflosschema; vergelijking werkelijke schuld versus normschuld; optioneel grafiek.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; boolean als “voldoet wel/niet”; maanden als geheel getal.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Oorspronkelijke schuld <= 0, negatieve werkelijke restschuld, ontbrekende rente of looptijd is ongeldig. Verstreken maanden < 0 of > fiscale looptijd is ongeldig.
2. Domeinbeperkingen
    INVUL: P > 0; 0 <= rentePercentage <= 100; 0 <= k <= N; N > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige oorspronkelijke schuld in.” / “Vul een geldige werkelijke restschuld in.” / “De verstreken periode ligt buiten de looptijd.”

Testset

1. Basiscase
    INVUL: Schuld € 100.000, rente 5%, looptijd 360 maanden, verstreken 12 maanden, werkelijke restschuld gelijk aan norm. Verwacht: voldoet true.
2. Edge-case
    INVUL: Verstreken 0 maanden, werkelijke restschuld € 100.000. Verwacht: normrestschuld € 100.000, voldoet true.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 10.000, rente 6%, looptijd 12 maanden, verstreken 6 maanden. Verwacht: normrestschuld circa € 5.076, werkelijke restschuld € 5.000 voldoet.
