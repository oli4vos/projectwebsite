# Kinderbijslag berekenen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/kinderen/kinderbijslag-berekenen.html

## Uit invulblad

Kinderbijslag berekenen

Bron-URL: https://www.externe-bron.nl/kinderen/kinderbijslag-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel kinderbijslag per kwartaal en per jaar wordt ontvangen op basis van aantal kinderen, leeftijden en jaartabelbedragen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal per kind de leeftijd op peildatum. Stap 2: bepaal leeftijdscategorie uit jaartabel, bijvoorbeeld 0-5, 6-11, 12-17. Stap 3: haal bedragPerKwartaal op uit jaartabel. Stap 4: totaalPerKwartaal = Σ bedragPerKind. Stap 5: totaalPerJaar = totaalPerKwartaal * 4. Stap 6: als kind 18 jaar of ouder is, bedrag 0.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Kinderbijslagbedragen zijn per kwartaal. Jaarbedrag = kwartaalbedrag * 4. Leeftijd wordt bepaald in jaren op peildatum. Bedragen in euro.
4. Afrondingsregels
    INVUL: Bedragen per kind en totalen op 2 decimalen. Leeftijd in hele jaren op peildatum. Geen tussentijdse afronding nodig buiten bedragen.

Output-contract

1. Primaire outputs
    INVUL: totaalKinderbijslagPerKwartaal, totaalKinderbijslagPerJaar, aantalKinderenMetRecht.
2. Secundaire outputs/tabellen/grafieken
    INVUL: kinderen[] met leeftijd, leeftijdscategorie, bedragPerKwartaal en bedragPerJaar. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; leeftijden als gehele jaren; kwartaal en jaar duidelijk labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen kinderen ingevuld is onvoldoende. Ongeldige geboortedatum is ongeldig. Ontbrekende jaartabel voor gekozen kwartaal/jaar is onvoldoende.
2. Domeinbeperkingen
    INVUL: Leeftijd kind moet >= 0. Kinderen vanaf 18 krijgen standaard € 0. Jaartabel moet alle leeftijdscategorieën bevatten.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één kind in.” / “Vul een geldige geboortedatum in.” / “Voor dit kwartaal ontbreken de kinderbijslagbedragen.”

Testset

1. Basiscase
    INVUL: Jaartabel: 0-5 = € 250, 6-11 = € 300, 12-17 = € 350. Kinderen: 3 jaar en 8 jaar. Verwacht: kwartaal € 550, jaar € 2.200.
2. Edge-case
    INVUL: Kind 18 jaar. Verwacht: bedrag € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Jaartabel zoals hierboven; kinderen 1, 7 en 13 jaar. Verwacht: kwartaal € 900, jaar € 3.600.
