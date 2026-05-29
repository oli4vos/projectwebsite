# Gemiddelde cijfer — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/studeren/gemiddelde-cijfer-berekenen.html

## Uit invulblad

Gemiddelde cijfer

Bron-URL: https://www.externe-bron.nl/studeren/gemiddelde-cijfer-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het gemiddelde cijfer uit meerdere behaalde cijfers, optioneel met wegingen.
2. Exacte formules/stappenvolgorde
    INVUL: Zonder weging: gemiddelde = Σ(cijfer_i) / aantalCijfers. Met weging: gewogenGemiddelde = Σ(cijfer_i * weging_i) / Σ(weging_i). Lege regels negeren als zowel cijfer als weging leeg zijn.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Geen maand/jaar/euroconversie. Wegingen mogen als percentages of punten worden ingevoerd, zolang alle regels dezelfde schaal gebruiken.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Gemiddelde tonen met 2 decimalen, eventueel ook afgerond eindcijfer met 1 decimaal als secundaire output.

Output-contract

1. Primaire outputs
    INVUL: gemiddeldeCijfer: berekend gemiddelde; aantalCijfers: aantal actieve regels; somWegingen: alleen bij gewogen gemiddelde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: regels[] met cijfer, weging en gewogen bijdrage. Geen grafiek nodig.
3. Formatregels voor UI
    INVUL: Cijfers met 1 of 2 decimalen; wegingen met maximaal 2 decimalen; geen valutatekens.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen actieve regels is onvoldoende. Regel met cijfer maar ontbrekende weging bij gewogen modus is ongeldig. Niet-numerieke cijfers of wegingen zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Cijfers standaard tussen 1 en 10. Wegingen moeten > 0 zijn. Σ(weging_i) > 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één cijfer in.” / “Vul geldige cijfers in.” / “Vul geldige positieve wegingen in.”

Testset

1. Basiscase
    INVUL: Invoer: cijfers 6, 7, 8 zonder weging. Verwacht: gemiddelde 7,00.
2. Edge-case
    INVUL: Invoer: geen cijfers. Verwacht: foutmelding “Vul minimaal één cijfer in.”
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: 6 met weging 40, 8 met weging 60. Verwacht: gewogen gemiddelde 7,20.
