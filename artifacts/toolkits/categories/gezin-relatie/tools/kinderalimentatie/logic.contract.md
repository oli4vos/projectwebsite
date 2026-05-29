# Kinderalimentatie — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/gezin-en-relatie/kinderalimentatie-berekenen.html

## Uit invulblad

Kinderalimentatie

Bron-URL: https://www.externe-bron.nl/gezin-en-relatie/kinderalimentatie-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen welk bedrag aan kinderalimentatie past bij behoefte van het kind, draagkracht van ouders en zorgkorting.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal behoefteKinderenPerMaand via directe invoer of behoefte-tabelparameter op basis van netto gezinsinkomen vóór scheiding en aantal kinderen. Stap 2: bepaal per ouder draagkrachtOuder = max(0, draagkrachtFormule(nettoBesteedbaarInkomen, noodzakelijkeLasten, jaarParameters)). Simpele standaardformule indien geen wettelijke tabel: draagkracht = max(0, nettoInkomen - draagkrachtloosInkomen) * draagkrachtPercentage. Stap 3: totaleDraagkracht = draagkrachtOuder1 + draagkrachtOuder2. Stap 4: aandeel alimentatieplichtige: aandeel = behoefte * draagkrachtPlichtige / totaleDraagkracht. Stap 5: zorgkorting: zorgkorting = behoefte * zorgkortingPercentage. Stap 6: kinderalimentatie = max(0, aandeel - zorgkorting), tenzij tekort aan draagkracht via tekortverdeling apart wordt toegepast.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Alle inkomens, behoefte, draagkracht en alimentatie per maand. Jaarinkomen naar maandinkomen via / 12. Percentages delen door 100. Juridische tabellen, draagkrachtpercentages en zorgkortingpercentages zijn jaartabelparameters.
4. Afrondingsregels
    INVUL: Tussenuitkomsten intern volledig precies. Alimentatie per maand op 2 decimalen of hele euro’s afhankelijk van UI-parameter. Standaard hele euro’s voor eindbedrag, onderliggende waarden 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: kinderalimentatiePerMaand, behoefteKinderen, draagkrachtOuder1, draagkrachtOuder2, aandeelPlichtige, zorgkorting.
2. Secundaire outputs/tabellen/grafieken
    INVUL: berekeningsstappen[] met behoefte, draagkracht, draagkrachtvergelijking en zorgkorting. Optioneel verdeling per kind.
3. Formatregels voor UI
    INVUL: Eurobedragen per maand; eindbedrag eventueel afgerond op hele euro’s; percentages met 2 decimalen; duidelijke tekst “indicatief”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Behoefte ontbreekt én onvoldoende gegevens voor behoefte-tabel is onvoldoende. Negatieve inkomens of lasten zijn ongeldig. Totale draagkracht 0 maakt verdeling onmogelijk; dan alimentatie 0 of melding onvoldoende draagkracht.
2. Domeinbeperkingen
    INVUL: aantalKinderen >= 1; behoefte >= 0; draagkracht >= 0; 0 <= zorgkortingPercentage <= 100. Jaarparameters moeten beschikbaar zijn voor gekozen jaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul de behoefte van de kinderen in of voldoende gegevens om deze te berekenen.” / “Vul geldige inkomensgegevens in.” / “Er is geen draagkracht om alimentatie te verdelen.” / “Voor dit jaar ontbreken alimentatieparameters.”

Testset

1. Basiscase
    INVUL: Behoefte € 800, draagkracht ouder A € 600, draagkracht ouder B € 400, plichtige A, zorgkorting 25%. Verwacht: aandeel A € 480, zorgkorting € 200, alimentatie € 280.
2. Edge-case
    INVUL: Behoefte € 800, draagkracht beide ouders € 0. Verwacht: alimentatie € 0 of melding geen draagkracht.
3. Regresstest tegen bekende uitkomst
    INVUL: Behoefte € 1.000, draagkracht plichtige € 750, andere ouder € 250, zorgkorting 15%. Verwacht: aandeel € 750, zorgkorting € 150, alimentatie € 600.
