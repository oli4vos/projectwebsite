# Gesubsidieerde rechtsbijstand — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/gesubsidieerde-rechtsbijstand.html

## Uit invulblad

Gesubsidieerde rechtsbijstand

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/gesubsidieerde-rechtsbijstand.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief bepalen of iemand in aanmerking komt voor gesubsidieerde rechtsbijstand en welke eigen bijdragecategorie geldt.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal huishoudtype en toepasselijke jaartabel. Stap 2: bepaal toetsingsinkomen en toetsingsvermogen. Stap 3: vergelijk vermogen met vermogensgrens; als vermogen boven grens: rechtOpToevoeging = false. Stap 4: vergelijk inkomen met inkomensschijven voor huishoudtype. Stap 5: als inkomen boven hoogste grens: geen recht. Stap 6: anders bepaal eigenBijdrage uit de inkomensschijf. Stap 7: eventuele korting/verlaging via diagnose-document of mediation als aparte parameter toepassen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen en vermogen zijn jaarbedragen in euro. Maandinkomen kan naar jaarinkomen via * 12. Alle grenzen en eigen bijdragen worden via jaartabelparameters geladen.
4. Afrondingsregels
    INVUL: Inkomen en vermogen op hele euro’s of 2 decimalen accepteren; voor vergelijking niet afronden tenzij jaartabel dat voorschrijft. Eigen bijdrage als eurobedrag met 2 decimalen tonen.

Output-contract

1. Primaire outputs
    INVUL: rechtOpGesubsidieerdeRechtsbijstand: boolean; eigenBijdrage; inkomensCategorie; redenAfwijzing indien geen recht.
2. Secundaire outputs/tabellen/grafieken
    INVUL: toetsing[] met inkomenstoets, vermogenstoets en toegepaste schijf. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; status als “waarschijnlijk recht” of “waarschijnlijk geen recht”; duidelijke tekst “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Huishoudtype ontbreekt is onvoldoende. Inkomen ontbreekt is onvoldoende. Negatief inkomen of vermogen is ongeldig. Ontbrekende jaartabel is onvoldoende.
2. Domeinbeperkingen
    INVUL: toetsingsinkomen >= 0; toetsingsvermogen >= 0; huishoudtype moet voorkomen in jaartabel; gekozen jaar moet ondersteund zijn.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Kies een geldig huishoudtype.” / “Vul een geldig toetsingsinkomen in.” / “Vul een geldig vermogen in.” / “Voor dit jaar ontbreken de grenzen voor gesubsidieerde rechtsbijstand.”

Testset

1. Basiscase
    INVUL: Jaartabel: alleenstaand grens € 30.000, vermogen grens € 50.000, eigen bijdrage € 250. Invoer inkomen € 25.000, vermogen € 10.000. Verwacht: recht true, eigen bijdrage € 250.
2. Edge-case
    INVUL: Inkomen onder grens maar vermogen € 60.000 bij vermogensgrens € 50.000. Verwacht: geen recht wegens vermogen.
3. Regresstest tegen bekende uitkomst
    INVUL: Schijven: tot € 20.000 eigen bijdrage € 150, tot € 30.000 eigen bijdrage € 300. Inkomen € 22.000, vermogen binnen grens. Verwacht: eigen bijdrage € 300.
