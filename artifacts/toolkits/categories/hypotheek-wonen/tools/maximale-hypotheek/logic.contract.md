# Maximale hypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-berekenen.html

## Uit invulblad

Maximale hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-hypotheek-berekenen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Indicatief berekenen van de maximale hypotheek op basis van inkomen, toetsrente, looptijd en financieringslastnormen.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal toetsinkomen = inkomenAanvrager + wegingspercentagePartner * inkomenPartner, of volgens jaartabel. Stap 2: bepaal financieringslastPercentage uit normtabel op basis van toetsinkomen en toetsrente. Stap 3: toegestaneJaarlast = toetsinkomen * financieringslastPercentage / 100. Stap 4: toegestaneMaandlast = toegestaneJaarlast / 12. Stap 5: bereken hypotheek uit maandlast: P = A * (1-(1+r)^(-n))/r; bij r=0: P=A*n. Stap 6: pas LTV-grens toe: maxHypotheek = min(inkomensMax, woningwaarde * maxLTV/100) indien woningwaarde bekend.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Inkomen per jaar. Rente per jaar naar maand. Looptijd jaren naar maanden. Normpercentages via jaartabel.
4. Afrondingsregels
    INVUL: Maximale hypotheek naar beneden afronden op hele euro’s. Maandlasten op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleHypotheek, maximaleHypotheekOpInkomen, maximaleHypotheekOpWoningwaarde, toegestaneMaandlast, financieringslastPercentage.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toetsinkomen, normtabelregel, LTV-toets, eventuele schuldenlastcorrectie.
3. Formatregels voor UI
    INVUL: Eurobedragen met hele euro’s of 2 decimalen; percentages met 2 decimalen; resultaat indicatief labelen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Inkomen ontbreekt of < 0 is ongeldig/onvoldoende. Toetsrente ontbreekt is onvoldoende. Ontbrekende normtabel voor jaar maakt berekening onvoldoende.
2. Domeinbeperkingen
    INVUL: toetsinkomen > 0; looptijdMaanden > 0; 0 <= rente <= 100; normtabel beschikbaar.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig inkomen in.” / “Vul een geldige toetsrente in.” / “Voor dit jaar ontbreken de financieringslastnormen.”

Testset

1. Basiscase
    INVUL: Toegestane maandlast direct € 1.500, rente 4%, looptijd 30 jaar. Verwacht inkomensmax circa € 314.193.
2. Edge-case
    INVUL: Inkomen € 0. Verwacht maximale hypotheek € 0 of foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Maandlast € 1.000, rente 0%, looptijd 30 jaar. Verwacht hypotheek € 360.000.
