# Bedrag/getal berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/getal-uit-percentage-berekenen.html

## Uit invulblad

Bedrag/getal berekenen

Bron-URL: https://www.externe-bron.nl/berekenen/getal-uit-percentage-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het totale bedrag/getal waarvan een gegeven bedrag/getal een bepaald percentage is.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees percentage en bedragOfGetal. Stap 2: zet percentage om naar factor: factor = percentage / 100. Stap 3: bereken totaal = bedragOfGetal / factor.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen periodeconversie. Percentage wordt ingevoerd als percentagepunt, bijvoorbeeld 20 betekent 20%. Eurobedragen worden als gewone getallen verwerkt.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Output totaal afronden op 2 decimalen. Percentage tonen met maximaal 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaalBedragOfGetal: berekend totaal waarvan de invoer het opgegeven percentage vormt; percentageFactor: percentage gedeeld door 100.
2. Secundaire outputs/tabellen/grafieken
    INVUL: controleBedrag = totaalBedragOfGetal * percentageFactor. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Bedrag/getal met 2 decimalen; percentage als 12,50%; geen valutateken tenzij de UI expliciet om bedrag vraagt.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege of niet-numerieke invoer is ongeldig. percentage = 0 is ongeldig, omdat deling door nul ontstaat. bedragOfGetal = 0 is geldig en geeft totaal 0.
2. Domeinbeperkingen
    INVUL: abs(percentage) >= 1e-12. Negatieve percentages en bedragen zijn rekenkundig toegestaan, maar kunnen in consumenten-UI eventueel als ongeldig worden gemarkeerd.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig percentage in.” / “Het percentage mag niet 0 zijn.” / “Vul een geldig bedrag of getal in.”

Testset

1. Basiscase
    INVUL: Invoer: percentage 20%, bedrag/getal 50. Verwacht: totaal 250.
2. Edge-case
    INVUL: Invoer: percentage 0%, bedrag/getal 50. Verwacht: foutmelding “Het percentage mag niet 0 zijn.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: percentage 12,5%, bedrag/getal 80. Verwacht: totaal 640.
