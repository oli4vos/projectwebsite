# Kosten kinderopvang — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/kinderen/kosten-kinderopvang.html

## Uit invulblad

Kosten kinderopvang

Bron-URL: https://www.externe-bron.nl/kinderen/kosten-kinderopvang.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van bruto kosten kinderopvang, kinderopvangtoeslag en netto kosten per maand en per jaar.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: per kind en opvangsoort: brutoKosten = urenPerMaand * uurtarief. Stap 2: vergoedUurtarief = min(uurtarief, maximumUurtariefOpvangsoort). Stap 3: vergoedeKosten = urenPerMaand * vergoedUurtarief. Stap 4: bepaal toeslagPercentage uit jaartabel op basis van toetsingsinkomen, aantal kinderen en rangorde kind. Stap 5: kinderopvangtoeslag = vergoedeKosten * toeslagPercentage. Stap 6: nettoKosten = brutoKosten - kinderopvangtoeslag. Stap 7: sommeer per maand en per jaar.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Uren per maand. Uurtarief in euro per uur. Maandkosten naar jaar via * 12. Toetsingsinkomen is jaarinkomen. Percentages uit tabel delen door 100.
4. Afrondingsregels
    INVUL: Kosten per kind op 2 decimalen. Toeslag per kind op 2 decimalen. Totalen op 2 decimalen. Percentages tonen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: brutoKostenPerMaand, kinderopvangtoeslagPerMaand, nettoKostenPerMaand, brutoKostenPerJaar, toeslagPerJaar, nettoKostenPerJaar.
2. Secundaire outputs/tabellen/grafieken
    INVUL: kinderen[] met opvangsoort, uren, uurtarief, maximumuurtarief, vergoede kosten, toeslagpercentage en netto kosten. Optioneel grafiek bruto versus netto.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; uren met 2 decimalen; uurtarief met 2 decimalen; percentages met 2 decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekend toetsingsinkomen is onvoldoende voor toeslagberekening. Uren < 0, uurtarief < 0 of niet-numerieke invoer is ongeldig. Ontbrekende opvangsoort is onvoldoende. Ontbrekende jaartabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: urenPerMaand >= 0; uurtarief >= 0; maximumuurtarieven en toeslagpercentages moeten bestaan voor gekozen jaar. Toeslagpercentage tussen 0 en 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig toetsingsinkomen in.” / “Vul geldige opvanguren en uurtarieven in.” / “Kies een opvangsoort.” / “Voor dit jaar ontbreken de toeslagpercentages of maximumuurtarieven.”

Testset

1. Basiscase
    INVUL: Uren 100, uurtarief € 9, maximumuurtarief € 8, toeslagpercentage 80%. Verwacht: bruto € 900, toeslag € 640, netto € 260.
2. Edge-case
    INVUL: Uren 0, uurtarief € 9. Verwacht: bruto € 0, toeslag € 0, netto € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Twee kinderen: kind 1 100 uur * € 8, toeslag 80%; kind 2 80 uur * € 8, toeslag 90%; maximumuurtarief € 8. Verwacht: bruto € 1.440, toeslag € 1.216, netto € 224.
