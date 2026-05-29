# Romeinse cijfers — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/romeinse-cijfers.html

## Uit invulblad

Romeinse cijfers

Bron-URL: https://www.externe-bron.nl/berekenen/romeinse-cijfers.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Omzetten van Arabische getallen naar Romeinse cijfers en Romeinse cijfers naar Arabische getallen.
2. Exacte formules/stappenvolgorde
    INVUL: Arabisch naar Romeins: gebruik aflopende waardetabel 1000 M, 900 CM, 500 D, 400 CD, 100 C, 90 XC, 50 L, 40 XL, 10 X, 9 IX, 5 V, 4 IV, 1 I; trek telkens de hoogste passende waarde af en voeg symbool toe. Romeins naar Arabisch: lees links naar rechts; als waarde huidig symbool kleiner is dan volgende symbool, trek af, anders tel op. Valideer daarna door het resultaat opnieuw canoniek naar Romeins te converteren en te vergelijken met invoer.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Niet relevant; geen maand/jaar/percentage/euroconversie.
4. Afrondingsregels
    INVUL: Niet relevant; alleen gehele getallen toegestaan. Decimalen zijn ongeldig.

Output-contract

1. Primaire outputs
    INVUL: arabischGetal: integer; romeinsCijfer: canonieke Romeinse notatie; richting: arabisch-naar-romeins of romeins-naar-arabisch.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Geen tabellen of grafieken.
3. Formatregels voor UI
    INVUL: Romeinse cijfers altijd in hoofdletters; Arabische getallen zonder decimalen; geen valutatekens.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Lege invoer, nul, negatieve getallen, decimalen, ongeldige letters of niet-canonieke Romeinse notatie zijn ongeldig.
2. Domeinbeperkingen
    INVUL: Ondersteund bereik 1 t/m 3999. Romeinse invoer alleen met tekens I, V, X, L, C, D, M.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een getal van 1 t/m 3999 of een geldig Romeins cijfer in.” / “Dit is geen geldige Romeinse notatie.”

Testset

1. Basiscase
    INVUL: Invoer: 1984. Verwacht: MCMLXXXIV.
2. Edge-case
    INVUL: Invoer: 0. Verwacht: foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: MMXXVI. Verwacht: 2026; invoer 3999 verwacht MMMCMXCIX.
