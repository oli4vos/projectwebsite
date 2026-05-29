# Hypotheekrenteaftrek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheekrenteaftrek.html

## Uit invulblad

Hypotheekrenteaftrek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/hypotheekrenteaftrek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het fiscale voordeel van hypotheekrenteaftrek, rekening houdend met aftrekbare rente, eigenwoningforfait en belastingtarief.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: aftrekbareRente = betaaldeRente * aftrekbaarPercentage. Stap 2: eigenwoningforfait = wozWaarde * ewfPercentage. Stap 3: saldoEigenWoning = eigenwoningforfait - aftrekbareRente. Stap 4: fiscaal voordeel bij negatief saldo: voordeel = max(0, -saldoEigenWoning) * aftrekTarief. Stap 5: bij positief saldo belastingnadeel: nadeel = max(0, saldoEigenWoning) * belastingTarief, met eventuele Hillen-correctie via parameter.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente en EWF zijn jaarbedragen. Maandvoordeel = jaarvoordeel / 12. Percentages delen door 100.
4. Afrondingsregels
    INVUL: Jaarbedragen op 2 decimalen. Maandbedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: aftrekbareRente, eigenwoningforfait, saldoEigenWoning, fiscaalVoordeelPerJaar, fiscaalVoordeelPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie renteaftrek, EWF, Hillen-correctie en netto maandlast.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; fiscale uitkomst indicatief labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Betaalde rente < 0, WOZ < 0, aftrektarief ontbreekt/buiten bereik is ongeldig. Ontbrekende EWF-tabel maakt berekening onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekbaarPercentage <= 100; 0 <= aftrekTarief <= maxAftrekTariefJaartabel; wozWaarde >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige betaalde rente in.” / “Vul een geldige WOZ-waarde in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Rente € 10.000, WOZ € 400.000, EWF 0,35%, aftrektarief 37%. Verwacht EWF € 1.400, voordeel (10.000-1.400)*37% = € 3.182.
2. Edge-case
    INVUL: Rente € 0, EWF € 1.400. Verwacht geen renteaftrekvoordeel; mogelijk belastingnadeel afhankelijk Hillen.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 5.000, EWF € 1.000, tarief 40%. Verwacht voordeel € 1.600.
