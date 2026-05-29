# Hypotheek extra aflossen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-aflossen-lagere-maandlasten.html

## Uit invulblad

Hypotheek extra aflossen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-aflossen-lagere-maandlasten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel de maandlast daalt door een extra aflossing, bij gelijkblijvende resterende looptijd en rente.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: oudeSchuld = huidigeSchuld; nieuweSchuld = huidigeSchuld - extraAflossing. Stap 2: bereken oude maandlast en nieuwe maandlast met resterende looptijd. Annuïtair: A = P*r/(1-(1+r)^(-n)); aflossingsvrij: maandrente = P*r. Stap 3: maandbesparing = oudeMaandlast - nieuweMaandlast. Stap 4: totaleBesparing = maandbesparing * resterendeMaanden of op basis van schema.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente. Resterende looptijd in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Besparingen op 2 decimalen. Laatste termijn in schema corrigeren.

Output-contract

1. Primaire outputs
    INVUL: nieuweHypotheekschuld, oudeMaandlast, nieuweMaandlast, maandbesparing, totaleBesparing.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking oud/nieuw; optioneel aflosschema na extra aflossing.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rente met 2 decimalen; looptijd in maanden/jaren.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, extra aflossing < 0, extra aflossing groter dan schuld, rente ontbreekt of looptijd <= 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= extraAflossing <= huidigeSchuld; rentePercentage >= 0; resterendeMaanden > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige extra aflossing in.” / “Vul een positieve resterende looptijd in.”

Testset

1. Basiscase
    INVUL: Annuïtair schuld € 300.000, rente 4%, resterend 30 jaar, aflossing € 30.000. Verwacht: nieuwe maandlast circa 90% van oude maandlast.
2. Edge-case
    INVUL: Extra aflossing € 0. Verwacht: maandbesparing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Aflossingsvrij schuld € 100.000, rente 3%, aflossing € 10.000. Verwacht maandbesparing € 25.
