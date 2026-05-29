# Hypotheek aflossen in plaats van sparen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheek-aflossen-ipv-sparen.html

## Uit invulblad

Hypotheek aflossen in plaats van sparen

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheek-aflossen-ipv-sparen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van extra hypotheekaflossing met sparen tegen spaarrente, inclusief eventueel fiscaal effect.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: nettoHypotheekrente = hypotheekrente * (1 - aftrekTarief). Stap 2: nettoSpaarrente = spaarrente * (1 - belastingdrukSparen) of direct ingevoerd. Stap 3: jaarVoordeelAflossen = bedrag * (nettoHypotheekrente - nettoSpaarrente) / 100. Stap 4: over meerdere jaren: cumulatiefVoordeel = Σ jaarVoordeel, eventueel met samengestelde spaargroei en dalende schuld.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar. Maandvoordeel = jaarvoordeel / 12. Bedragen in euro.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Percentages met 2 decimalen. Cumulatieve uitkomst op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoHypotheekrentePercentage, nettoSpaarrentePercentage, voordeelAflossenPerJaar, voordeelAflossenPerMaand, besteKeuze.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Meerjarenschema en cumulatieve vergelijking sparen/aflossen.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; keuze als tekst.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Bedrag <= 0, rente ontbreekt/niet-numeriek of aftrektarief buiten 0-100 is ongeldig.
2. Domeinbeperkingen
    INVUL: bedrag > 0; bedrag <= hypotheekschuld; 0 <= aftrekTarief <= 100; spaarrente mag negatief zijn maar groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag in.” / “Vul geldige rentepercentages in.” / “De aflossing mag niet hoger zijn dan de hypotheekschuld.”

Testset

1. Basiscase
    INVUL: Bedrag € 10.000, hypotheekrente 4%, aftrek 37%, spaarrente 1%, belastingdruk sparen 0%. Verwacht: netto hypotheekrente 2,52%, voordeel € 152/jaar.
2. Edge-case
    INVUL: Netto spaarrente = netto hypotheekrente. Verwacht: voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Bedrag € 20.000, hypotheekrente 3%, aftrek 0%, spaarrente 0%. Verwacht: voordeel € 600/jaar.
