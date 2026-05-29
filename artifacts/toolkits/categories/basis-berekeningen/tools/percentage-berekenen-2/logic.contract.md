# Percentage berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/percentage-berekenen-uit-percentages.html

## Uit invulblad

Percentage berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/percentage-berekenen-uit-percentages.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het samengestelde effect van twee opeenvolgende percentages, bijvoorbeeld eerst stijging/daling 1 en daarna stijging/daling 2.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: zet percentages om naar factoren: f1 = 1 + percentage1 / 100, f2 = 1 + percentage2 / 100. Stap 2: samengesteldeFactor = f1 * f2. Stap 3: samengesteldPercentage = (samengesteldeFactor - 1) * 100.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaar/euroconversie. Invoer is in procentpunten: 10 betekent 10%. Percentages werken als opeenvolgende vermenigvuldigingsfactoren, niet als optelsom.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Samengesteld percentage tonen met 2 decimalen. Factoren tonen met maximaal 6 decimalen indien zichtbaar.

Output-contract

1. Primaire outputs
    INVUL: samengesteldPercentage; samengesteldeFactor; percentage1; percentage2.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Optioneel somPercentagepunten = percentage1 + percentage2 en verschilDoorSamenstelling = samengesteldPercentage - somPercentagepunten.
3. Formatregels voor UI
    INVUL: Percentages als 32,00%; factoren met 6 decimalen; geen euroformattering.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke percentages zijn ongeldig. 0% is geldig. Percentage -100% is geldig en leidt tot factor 0.
2. Domeinbeperkingen
    INVUL: Percentages lager dan -100% standaard ongeldig, omdat een negatieve groeifactor doorgaans niet zinvol is in deze tool.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul twee geldige percentages in.” / “Een percentage lager dan -100% is niet toegestaan.”

Testset

1. Basiscase
    INVUL: Invoer: 10% en 20%. Verwacht: samengesteld percentage 32,00%.
2. Edge-case
    INVUL: Invoer: 0% en 20%. Verwacht: 20,00%.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: -10% en 10%. Verwacht: -1,00%.
