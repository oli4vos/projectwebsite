# Gewogen gemiddelde rentepercentage — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/gewogen-gemiddelde-rentepercentage.html

## Uit invulblad

Gewogen gemiddelde rentepercentage

Bron-URL: https://www.externe-bron.nl/berekenen/gewogen-gemiddelde-rentepercentage.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van één gemiddeld rentepercentage voor meerdere bedragen met verschillende rentepercentages, gewogen naar de omvang van elk bedrag.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: verzamel actieve regels met bedrag_i en rentePercentage_i. Stap 2: bereken totaalBedrag = Σ(bedrag_i). Stap 3: bereken gewogenSom = Σ(bedrag_i * rentePercentage_i). Stap 4: gewogenGemiddeldeRente = gewogenSom / totaalBedrag.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Bedragen zijn euro’s. Rentepercentages zijn procentpunten per jaar of per dezelfde renteperiode. Er vindt geen maand/jaarconversie plaats; alle rentepercentages moeten dezelfde periodebasis hebben.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Gewogen gemiddelde rente tonen met 2 of 3 decimalen. Bedragen tonen met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: gewogenGemiddeldeRentePercentage; totaalBedrag; aantalRegels.
2. Secundaire outputs/tabellen/grafieken
    INVUL: regels[] met bedrag, rentepercentage en gewogen bijdrage. Optioneel aandeel per bedrag in procenten.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; percentages als 3,50%; aantallen zonder decimalen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen actieve regels is onvoldoende. Regel met alleen bedrag of alleen rente is ongeldig. Niet-numerieke waarden zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Bedragen moeten > 0 zijn. totaalBedrag > 0. Rente mag 0% zijn. Negatieve rente kan worden toegestaan als de UI dat ondersteunt; standaard bereik -100% tot 1000%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één bedrag en rentepercentage in.” / “Bedragen moeten positief zijn.” / “De som van de bedragen moet groter zijn dan 0.”

Testset

1. Basiscase
    INVUL: Invoer: € 1.000 tegen 2% en € 3.000 tegen 4%. Verwacht: gewogen gemiddelde rente 3,50%.
2. Edge-case
    INVUL: Invoer: alle bedragen leeg of 0. Verwacht: foutmelding “De som van de bedragen moet groter zijn dan 0.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: € 200.000 tegen 3% en € 100.000 tegen 6%. Verwacht: 4,00%.
