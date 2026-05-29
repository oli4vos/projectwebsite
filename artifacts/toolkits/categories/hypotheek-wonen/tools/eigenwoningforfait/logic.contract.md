# Eigenwoningforfait — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/wonen-en-hypotheek/eigenwoningforfait.html

## Uit invulblad

Eigenwoningforfait

Bron-URL: https://www.externe-bron.nl/wonen-en-hypotheek/eigenwoningforfait.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het eigenwoningforfait als fiscale bijtelling voor de eigen woning op basis van WOZ-waarde en jaartabel.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal WOZ-waarde. Stap 2: zoek toepasselijke schijf in jaartabel met van, tot, percentage, eventueel vastBedrag. Stap 3: bereken eigenwoningforfait = vastBedrag + WOZWaarde * percentage / 100, of volgens schijfformule uit jaartabel. Stap 4: pas tijdsevenredigheid toe indien woning niet heel jaar eigen woning is: ewfTijdsevenredig = ewf * maandenEigenWoning / 12.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: WOZ-waarde in euro. Percentage per jaar. Maanden eigen woning naar jaarfractie via / 12.
4. Afrondingsregels
    INVUL: Fiscale output op hele euro’s of 2 decimalen via parameter. Standaard 2 decimalen voor tool, hele euro’s voor aangifte-indicatie.

Output-contract

1. Primaire outputs
    INVUL: eigenwoningforfait, wozWaarde, toegepastPercentage, tijdsevenredigEigenwoningforfait.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toegepaste schijf uit jaartabel; eventueel vergelijking bij andere WOZ-waarden.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen of hele euro’s; percentages met 3 decimalen; jaar als viercijferig jaar.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: WOZ-waarde ontbreekt of < 0 is ongeldig. Ontbrekende jaartabel is onvoldoende. Maanden eigen woning buiten 0-12 is ongeldig.
2. Domeinbeperkingen
    INVUL: wozWaarde >= 0; 0 <= maandenEigenWoning <= 12; jaartabel moet alle relevante schijven bevatten.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige WOZ-waarde in.” / “Kies een geldig belastingjaar.” / “Voor dit jaar ontbreken de eigenwoningforfaitpercentages.”

Testset

1. Basiscase
    INVUL: WOZ € 400.000, percentage 0,35%, 12 maanden. Verwacht: EWF € 1.400.
2. Edge-case
    INVUL: WOZ € 0. Verwacht: EWF € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: WOZ € 300.000, percentage 0,5%, 6 maanden. Verwacht: jaar EWF € 1.500, tijdsevenredig € 750.
