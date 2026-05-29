# Aftrekbare hypotheekrente berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/aftrekbare-hypotheekrente.html

## Uit invulblad

Aftrekbare hypotheekrente berekenen

Bron-URL: https://www.externe-bron.nl/hypotheek/aftrekbare-hypotheekrente.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk deel van de betaalde hypotheekrente fiscaal aftrekbaar is, rekening houdend met eigenwoningschuld, niet-aftrekbare delen en eventuele eigenwoningreserve/bijleenregeling.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal totaleBetaaldeRente. Stap 2: bepaal aftrekbareSchuld = min(totaleHypotheekschuld, kwalificerendeEigenwoningschuld). Stap 3: aftrekbaarPercentage = aftrekbareSchuld / totaleHypotheekschuld indien totale schuld > 0. Stap 4: aftrekbareRente = totaleBetaaldeRente * aftrekbaarPercentage. Stap 5: nietAftrekbareRente = totaleBetaaldeRente - aftrekbareRente.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente kan per maand of jaar worden ingevoerd; maandrente naar jaar via * 12. Schuld en rente in euro. Percentages intern als decimalen.
4. Afrondingsregels
    INVUL: Bedragen op 2 decimalen. Aftrekbaar percentage met 4 decimalen intern, tonen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: aftrekbareRente, nietAftrekbareRente, aftrekbaarPercentage, kwalificerendeEigenwoningschuld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per leningdeel met schuld, rente, kwalificatie en aftrekbare rente.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaarbedragen duidelijk als jaar tonen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Totale hypotheekschuld <= 0 is ongeldig. Betaalde rente < 0 is ongeldig. Kwalificerende schuld ontbreekt is onvoldoende als aftrekbaar percentage niet direct wordt ingevoerd.
2. Domeinbeperkingen
    INVUL: totaleHypotheekschuld > 0; 0 <= kwalificerendeEigenwoningschuld <= totaleHypotheekschuld; betaaldeRente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige hypotheekschuld in.” / “Vul een geldige betaalde rente in.” / “Vul het aftrekbare deel van de eigenwoningschuld in.”

Testset

1. Basiscase
    INVUL: Totale schuld € 300.000, eigenwoningschuld € 240.000, betaalde rente € 12.000. Verwacht: aftrekbare rente € 9.600, niet-aftrekbaar € 2.400.
2. Edge-case
    INVUL: Eigenwoningschuld gelijk aan totale schuld. Verwacht: 100% rente aftrekbaar.
3. Regresstest tegen bekende uitkomst
    INVUL: Totale schuld € 200.000, eigenwoningschuld € 100.000, rente € 8.000. Verwacht: aftrekbaar € 4.000.
