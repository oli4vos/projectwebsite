# Hypotheek uit eigen bv — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-bv-bank-aflossen.html

## Uit invulblad

Hypotheek uit eigen bv

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-bv-bank-aflossen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van een hypotheek bij de eigen bv met een bankhypotheek, inclusief renteontvangst in de bv, renteaftrek privé en eventueel VPB/box 2-effect.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken privé hypotheeklast en renteaftrek: fiscaalVoordeelPrivé = aftrekbareRente * aftrekTarief. Stap 2: bereken rente-inkomsten bv: renteBv = schuld * renteBvPercentage / 100. Stap 3: vpbOverRente = max(0, renteBv - kostenBv) * vpbTarief. Stap 4: netto in bv = renteBv - vpb. Stap 5: vergelijk met bankrente of alternatief rendement van bv-geld. Stap 6: familie/bv totaalvoordeel = privévoordeel + bvNetto - alternatief.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentepercentages per jaar. Maandlasten via maandrente. VPB/box 2 tarieven via jaartabelparameters. Bedragen in euro per jaar en maand.
4. Afrondingsregels
    INVUL: Maandlasten en fiscale bedragen op 2 decimalen. Percentages met 2 decimalen. Eindvergelijking op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: nettoPrivéLast, nettoResultaatBv, totaalFamilieVoordeel, vergelijkingMetBank, jaarlijkseRenteBv.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Privé/bv-specificatie; vergelijking bank versus bv; optioneel meerjarenschema.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; label “indicatief/fiscaal complex”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Schuld <= 0, rente ontbreekt, looptijd <= 0, fiscale tarieven ontbreken bij netto vergelijking is onvoldoende. Rente 0% mogelijk onzakelijk; waarschuwing.
2. Domeinbeperkingen
    INVUL: schuld > 0; 0 <= rente <= 100; 0 <= belastingtarieven <= 100; rente moet zakelijk zijn als fiscale aftrek wordt verondersteld.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig hypotheekbedrag in.” / “Vul geldige rentepercentages in.” / “Voor netto vergelijking ontbreken fiscale parameters.” / “Let op: de rente moet zakelijk zijn.”

Testset

1. Basiscase
    INVUL: Schuld € 100.000, rente bv 4%, aftrek 37%, VPB 20%, geen kosten. Verwacht privé voordeel € 1.480, bv netto rente € 3.200.
2. Edge-case
    INVUL: Rente 0%. Verwacht renteaftrek en bv-rente € 0, waarschuwing zakelijkheid.
3. Regresstest tegen bekende uitkomst
    INVUL: Schuld € 200.000, rente 3%, VPB 25%. Verwacht rente bv € 6.000, VPB € 1.500, netto bv € 4.500.
