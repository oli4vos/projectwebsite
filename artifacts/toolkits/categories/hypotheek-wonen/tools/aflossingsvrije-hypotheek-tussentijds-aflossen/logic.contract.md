# Aflossingsvrije hypotheek tussentijds aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/aflossingsvrije-hypotheek-aflossen.html

## Uit invulblad

Aflossingsvrije hypotheek tussentijds aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/aflossingsvrije-hypotheek-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel maandelijkse rente en totale rentelast daalt wanneer tussentijds wordt afgelost op een aflossingsvrije hypotheek.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: oudeSchuld = hypotheekschuld, aflossing = extraAflossing, nieuweSchuld = max(0, oudeSchuld - aflossing). Stap 2: maandrenteOud = oudeSchuld * rentePercentage / 100 / 12. Stap 3: maandrenteNieuw = nieuweSchuld * rentePercentage / 100 / 12. Stap 4: besparingPerMaand = maandrenteOud - maandrenteNieuw. Stap 5: besparingTotEinde = besparingPerMaand * resterendeMaanden, eventueel netto na hypotheekrenteaftrek: nettoBesparing = besparingBruto * (1 - aftrekTarief).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente naar maandrente via / 12. Resterende looptijd in jaren naar maanden via * 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten en besparingen op 2 decimalen. Nieuwe schuld op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nieuweHypotheekschuld, oudeMaandrente, nieuweMaandrente, brutoBesparingPerMaand, brutoBesparingTotEinde, optioneel nettoBesparingPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking vóór/na aflossing; optioneel grafiek rentelast over resterende looptijd.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 4,00%; looptijd in maanden of jaren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekschuld <= 0, rente ontbreekt/niet-numeriek of extra aflossing < 0 is ongeldig. Extra aflossing groter dan schuld wordt begrensd op schuld of als ongeldig gemarkeerd volgens UI-keuze.
2. Domeinbeperkingen
    INVUL: hypotheekschuld > 0; 0 <= extraAflossing <= hypotheekschuld; 0 <= rentePercentage <= 100; resterendeMaanden >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige extra aflossing in.” / “De extra aflossing mag niet hoger zijn dan de hypotheekschuld.”

Testset

1. Basiscase
    INVUL: Schuld € 200.000, rente 4%, aflossing € 20.000, resterend 10 jaar. Verwacht: maandelijkse bruto besparing € 66,67, totale bruto besparing € 8.000.
2. Edge-case
    INVUL: Extra aflossing € 0. Verwacht: besparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 100.000, rente 3%, aflossing € 10.000, resterend 12 maanden. Verwacht: besparing per maand € 25, totaal € 300.
