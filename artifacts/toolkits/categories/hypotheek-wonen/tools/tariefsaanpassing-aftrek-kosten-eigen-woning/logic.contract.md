# Tariefsaanpassing aftrek kosten eigen woning — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/wonen-en-hypotheek/tariefsaanpassing-aftrek-kosten-eigen-woning.html

## Uit invulblad

Tariefsaanpassing aftrek kosten eigen woning

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/tariefsaanpassing-aftrek-kosten-eigen-woning.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de beperking van de aftrek van kosten eigen woning wanneer het maximale aftrektarief lager is dan het marginale belastingtarief.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal aftrekbareKostenEigenWoning, meestal hypotheekrente minus eigenwoningforfait-effect volgens fiscale regels. Stap 2: bepaal marginaalTarief en maxAftrekTarief uit jaartabel. Stap 3: tariefsaanpassingPercentage = max(0, marginaalTarief - maxAftrekTarief). Stap 4: tariefsaanpassing = aftrekbareKostenEigenWoning * tariefsaanpassingPercentage / 100. Stap 5: nettoAftrekVoordeel = aftrekbareKosten * maxAftrekTarief / 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Kosten op jaarbasis. Maandeffect = jaarbedrag / 12. Percentages uit jaartabel.
4. Afrondingsregels
    INVUL: Jaarbedragen op 2 decimalen. Maandbedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: tariefsaanpassing, nettoAftrekVoordeel, aftrekbareKostenEigenWoning, maxAftrekTarief, marginaalTarief.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie verschil tussen marginaal tarief en maximaal aftrektarief.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; jaar als belastingjaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Aftrekbare kosten < 0, ontbrekende belastingtarieven of jaartabel is ongeldig/onvoldoende.
2. Domeinbeperkingen
    INVUL: 0 <= marginaalTarief <= 100; 0 <= maxAftrekTarief <= 100; aftrekbareKosten >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige aftrekbare kosten in.” / “Voor dit jaar ontbreken de aftrektarieven.”

Testset

1. Basiscase
    INVUL: Aftrekbare kosten € 10.000, marginaal 49%, max aftrek 37%. Verwacht tariefsaanpassing € 1.200, netto voordeel € 3.700.
2. Edge-case
    INVUL: Marginaal 37%, max 37%. Verwacht tariefsaanpassing € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Kosten € 5.000, verschil 10%. Verwacht tariefsaanpassing € 500.
