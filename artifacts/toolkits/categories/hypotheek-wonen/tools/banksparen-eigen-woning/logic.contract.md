# Banksparen Eigen Woning — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/wonen-en-hypotheek/banksparen-eigenwoning.html

## Uit invulblad

Banksparen Eigen Woning

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/banksparen-eigenwoning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welke periodieke inleg nodig is om met banksparen voor de eigen woning een doelkapitaal op te bouwen, of welk eindkapitaal ontstaat bij gegeven inleg en rendement.
2. Exacte formules/stappenvolgorde
    INVUL: Bij benodigde inleg: PMT = doelKapitaal * r / ((1+r)^n - 1) bij inleg einde periode en r > 0; bij r = 0: PMT = doelKapitaal / n. Bij toekomstige waarde: FV = beginKapitaal*(1+r)^n + PMT * (((1+r)^n - 1)/r); bij r = 0: FV = beginKapitaal + PMT*n. Fiscale vrijstellingen en bandbreedte-eis alleen via jaartabelparameters toetsen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rendement/rente is jaarrente in procenten naar maandrente via / 12 bij maandelijkse inleg. Looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Inleg, eindkapitaal en rendement op 2 decimalen. Fiscale toetsbedragen op hele euro’s of volgens jaartabel.

Output-contract

1. Primaire outputs
    INVUL: benodigdeMaandinleg of eindKapitaal, doelKapitaal, totaalIngelegd, totaalRendement, looptijdMaanden.
2. Secundaire outputs/tabellen/grafieken
    INVUL: opbouwschema[] met maand, beginwaarde, inleg, rente, eindwaarde. Fiscale toetsing: vrijstelling, bandbreedte, looptijdseis.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Doelkapitaal of looptijd <= 0 is ongeldig bij inlegberekening. Rendement ontbreekt/niet-numeriek is ongeldig. BeginKapitaal of inleg < 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: looptijdMaanden > 0; 1+r > 0; rendement per periode groter dan -100%; fiscale parameters niet hardcoden.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig doelkapitaal in.” / “Vul een positieve looptijd in.” / “Vul een geldig rendement in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Doelkapitaal € 100.000, rente 4%, looptijd 30 jaar, maandelijkse inleg. Verwacht: benodigde inleg circa € 144,08.
2. Edge-case
    INVUL: Doelkapitaal € 12.000, rente 0%, looptijd 1 jaar. Verwacht: maandinleg € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Begin € 0, inleg € 100, rente 0%, looptijd 10 maanden. Verwacht: eindkapitaal € 1.000.
