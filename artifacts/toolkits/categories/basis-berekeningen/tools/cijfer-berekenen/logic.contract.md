# Cijfer berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/studeren/benodigde-cijfer-berekenen.html

## Uit invulblad

Cijfer berekenen

Bron-URL: https://www.externe-bron.nl/studeren/benodigde-cijfer-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk cijfer nog nodig is op een toets/opdracht om een gewenst eindcijfer te behalen, rekening houdend met reeds behaalde cijfers en wegingen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken reeds behaalde gewogen punten: behaaldePunten = Σ(cijfer_i * weging_i). Stap 2: bereken reeds gebruikte weging: gebruikteWeging = Σ(weging_i). Stap 3: bepaal resterende weging: resterendeWeging = totaalWeging - gebruikteWeging. Stap 4: benodigd cijfer: benodigdCijfer = (gewenstEindcijfer * totaalWeging - behaaldePunten) / resterendeWeging.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaar/euroconversie. Wegingen mogen als punten of percentages worden ingevoerd, zolang alle wegingen dezelfde schaal gebruiken. Standaard totaalWeging = 100 bij percentages.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Benodigd cijfer tonen met 1 of 2 decimalen. Voor haalbaarheid niet afronden vóór vergelijking met minimum/maximumcijfer.

Output-contract

1. Primaire outputs
    INVUL: benodigdCijfer: cijfer dat nodig is voor het resterende onderdeel; haalbaar: boolean of benodigd cijfer binnen toegestane schaal valt; gewenstEindcijfer.
2. Secundaire outputs/tabellen/grafieken
    INVUL: behaaldePunten, gebruikteWeging, resterendeWeging, huidigGewogenGemiddelde. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Cijfers met 1 decimaal of 2 decimalen; wegingen als percentage met maximaal 2 decimalen; haalbaarheid als tekst: “haalbaar” of “niet haalbaar”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Ontbrekend gewenst eindcijfer, lege cijfers, niet-numerieke cijfers of wegingen zijn ongeldig. Als resterende weging <= 0, is invoer onvoldoende omdat er geen onderdeel over is om mee te rekenen.
2. Domeinbeperkingen
    INVUL: Cijfers standaard tussen 1 en 10. Wegingen moeten > 0 zijn. gebruikteWeging < totaalWeging. Gewenst eindcijfer tussen 1 en 10.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig gewenst eindcijfer in.” / “Vul geldige cijfers en wegingen in.” / “Er moet nog een resterende weging zijn.” / “Het benodigde cijfer ligt buiten de mogelijke cijferschaal.”

Testset

1. Basiscase
    INVUL: Invoer: gewenst eindcijfer 6, totaalweging 100, reeds 5 met weging 50, resterende weging 50. Verwacht: benodigd cijfer 7.
2. Edge-case
    INVUL: Invoer: gebruikte weging 100, resterende weging 0. Verwacht: foutmelding “Er moet nog een resterende weging zijn.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: gewenst 7, cijfers 6 met weging 40 en 8 met weging 30, resterend 30. Verwacht: benodigd cijfer (7*100 - 6*40 - 8*30)/30 = 7,3333.
