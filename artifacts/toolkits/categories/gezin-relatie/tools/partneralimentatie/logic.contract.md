# Partneralimentatie — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/partneralimentatie.html

## Uit invulblad

Partneralimentatie

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/partneralimentatie.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen hoeveel partneralimentatie passend is op basis van behoefte van de alimentatiegerechtigde en draagkracht van de alimentatieplichtige.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal behoefte. Als directe behoefte is ingevuld: gebruik die. Anders: behoefte = behoeftePercentage * nettoGezinsinkomenTijdensRelatie - eigenNettoInkomenGerechtigde, met behoeftePercentage parametriseerbaar, vaak 60% als eenvoudige hofnorm-indicatie. Stap 2: draagkrachtruimtePlichtige = max(0, nettoInkomenPlichtige - noodzakelijkeLastenPlichtige - draagkrachtloosInkomen). Stap 3: beschikbareDraagkracht = draagkrachtruimtePlichtige * draagkrachtPercentage, parameter. Stap 4: partneralimentatie = min(behoefte, beschikbareDraagkracht). Stap 5: bruto/netto conversie alleen als belastingmodule beschikbaar is.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens en alimentatiebedragen standaard per maand. Jaarbedragen naar maand via / 12. Percentages delen door 100. Fiscale parameters per jaar via jaartabel.
4. Afrondingsregels
    INVUL: Tussenuitkomsten intern volledig precies. Eindbedrag partneralimentatie op hele euro’s of 2 decimalen afhankelijk van UI-parameter. Standaard eindbedrag op hele euro’s, details op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: partneralimentatiePerMaand, behoefte, beschikbareDraagkracht, draagkrachtruimte, tekortOfRuimte.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsstappen[] met behoefteberekening, inkomens, lasten, draagkracht en min-beperking. Optioneel bruto/netto specificatie.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand; percentages met 2 decimalen; duidelijke tekst “indicatief, geen Tremarapport”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Behoefte ontbreekt én onvoldoende gegevens voor behoefteberekening is onvoldoende. Negatieve inkomens of lasten zijn ongeldig. Ontbrekende draagkrachtgegevens zijn onvoldoende.
2. Domeinbeperkingen
    INVUL: behoefte >= 0; nettoInkomen >= 0; lasten >= 0; 0 <= draagkrachtPercentage <= 100; 0 <= behoeftePercentage <= 100.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul de behoefte in of voldoende gegevens om deze te berekenen.” / “Vul geldige inkomensgegevens in.” / “Vul geldige lasten in.” / “Er is geen draagkracht voor partneralimentatie.”

Testset

1. Basiscase
    INVUL: Behoefte € 1.000, beschikbare draagkracht € 700. Verwacht: partneralimentatie € 700.
2. Edge-case
    INVUL: Behoefte € 1.000, beschikbare draagkracht € 0. Verwacht: partneralimentatie € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Netto gezinsinkomen tijdens relatie € 5.000, behoeftepercentage 60%, eigen inkomen gerechtigde € 1.800, draagkracht plichtige € 1.500. Verwacht: behoefte € 1.200, alimentatie € 1.200.
