# Boeterente in rentemiddeling — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/rentemiddeling-boeterente.html

## Uit invulblad

Boeterente in rentemiddeling

Bron-URL: https://www.externe-bron.nl/hypotheek/rentemiddeling-boeterente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk rente-opslagpercentage nodig is om de boeterente uit te smeren over een nieuwe rentevaste periode bij rentemiddeling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken boeterente volgens boeterenteformule. Stap 2: bepaal nieuwe periode n = nieuweRentevastePeriodeMaanden. Stap 3: bepaal annuïtaire of rente-only opslag. Eenvoudige opslag: opslagPerJaar = boeterente / hypotheekschuld / (n/12) * 100. Contante-waardevariant: los opslagMaand op zodat Σ hypotheekschuld * opslagMaand / (1+nieuweRente/100/12)^m = boeterente. Stap 4: nieuweGemiddeldeRente = marktrente + opslag + eventuele administratieOpslag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Boeterente in euro. Opslag als percentage per jaar. Nieuwe periode in maanden of jaren. Maandopslag naar jaaropslag via * 12 * 100.
4. Afrondingsregels
    INVUL: Boeterente op 2 decimalen. Rente-opslag en nieuwe rente op 3 decimalen. Maandlasten op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: boeterente, renteOpslagPercentage, nieuweGemiddeldeRente, nieuweMaandlast, oudeMaandlast.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie boete, opslag, marktrente, administratieopslag; vergelijking oud/nieuw.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentepercentages met 3 decimalen; looptijd in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekschuld <= 0, nieuwe periode <= 0, ontbrekende marktrente of boeterenteparameters zijn ongeldig. Bij boeterente 0 is opslag 0.
2. Domeinbeperkingen
    INVUL: hypotheekschuld > 0; nieuwePeriodeMaanden > 0; rente >= 0; opslag mag niet negatief zijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige nieuwe rentevaste periode in.” / “Vul geldige rentepercentages in.”

Testset

1. Basiscase
    INVUL: Boeterente € 6.000, schuld € 200.000, nieuwe periode 10 jaar, marktrente 3%. Eenvoudige opslag verwacht 0,300%, nieuwe rente 3,300%.
2. Edge-case
    INVUL: Boeterente € 0. Verwacht: opslag 0%, nieuwe rente = marktrente.
3. Regresstest tegen bekende uitkomst
    INVUL: Boeterente € 10.000, schuld € 250.000, periode 5 jaar. Verwacht eenvoudige opslag 0,800%.
