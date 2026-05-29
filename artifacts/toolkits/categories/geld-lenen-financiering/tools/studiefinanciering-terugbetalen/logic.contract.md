# Studiefinanciering terugbetalen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/lenen-en-krediet/studiefinanciering-terugbetalen.html

## Uit invulblad

Studiefinanciering terugbetalen

Bron-URL: https://www.externe-bron.nl/lenen-en-krediet/studiefinanciering-terugbetalen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen hoe de studieschuld wordt terugbetaald: maandbedrag, looptijd, totale rente en eventuele resterende schuld na afloop. Wettelijke draagkrachtregels kunnen jaarlijks wijzigen en moeten parametriseerbaar zijn.
2. Exacte formules/stappenvolgorde
    INVUL: Generieke kern: schuld = beginschuld, r = rentePercentage / 100 / 12, n = terugbetaalTermijnJaren * 12. Als maandbedrag direct is ingevoerd: simuleer maand voor maand met rente = schuldBegin * r, aflossing = maandbedrag - rente, schuldEind = schuldBegin - aflossing. Als maandbedrag moet worden berekend: annuïtair maandbedrag = schuld * r / (1 - (1+r)^(-n)); bij r = 0: maandbedrag = schuld / n. Als draagkrachtmodule actief is: maandbedrag = min(annuïtairMaandbedrag, draagkrachtMaandbedrag).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente is jaarrente in procenten naar maandrente. Terugbetaaltermijn in jaren naar maanden. Inkomen en draagkrachtbedragen per maand of per jaar consistent omrekenen naar maandbedragen.
4. Afrondingsregels
    INVUL: Maandbedrag op 2 decimalen. Studieschuld en rente op 2 decimalen. Looptijd in hele maanden. Laatste betaling corrigeren naar resterende schuld plus rente.

Output-contract

1. Primaire outputs
    INVUL: maandbedrag, looptijdMaanden, looptijdJaren, totaalTerugbetaald, totaleRente, resterendeSchuldNaTermijn.
2. Secundaire outputs/tabellen/grafieken
    INVUL: terugbetaalschema[] per maand of per jaar; optioneel grafiek schuldontwikkeling. Bij draagkracht: annuïtairMaandbedrag, draagkrachtMaandbedrag, toegepastMaandbedrag.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd als jaren + maanden; duidelijke disclaimer “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, rente leeg/niet-numeriek, terugbetaaltermijn <= 0 of maandbedrag <= 0 bij directe invoer is ongeldig. Als draagkracht wordt berekend maar inkomen ontbreekt, is invoer onvoldoende.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rentePercentage <= 100; terugbetaalTermijnJaren > 0; maximale termijn bijvoorbeeld 35 jaar. Maandbedrag moet bij rente > 0 hoger zijn dan eerste maandrente om schuld te laten dalen, tenzij resterende schuld na termijn expliciet wordt toegestaan.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een positieve studieschuld in.” / “Vul een geldige rente in.” / “Vul een geldige terugbetaaltermijn in.” / “Vul inkomensgegevens in om draagkracht te berekenen.” / “Het maandbedrag is te laag om de schuld af te lossen.”

Testset

1. Basiscase
    INVUL: Schuld € 30.000, rente 2%, termijn 35 jaar, annuïtair. Verwacht: maandbedrag circa € 99,38.
2. Edge-case
    INVUL: Schuld € 12.000, rente 0%, termijn 10 jaar. Verwacht: maandbedrag € 100.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 10.000, rente 6%, termijn 1 jaar. Verwacht: maandbedrag circa € 860,66.
