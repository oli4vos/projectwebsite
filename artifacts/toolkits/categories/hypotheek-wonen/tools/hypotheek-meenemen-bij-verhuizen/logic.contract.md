# Hypotheek meenemen bij verhuizen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheek-meenemen-bij-verhuizen.html

## Uit invulblad

Hypotheek meenemen bij verhuizen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheek-meenemen-bij-verhuizen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van het financiële effect van het meenemen van een bestaande hypotheekrente naar een nieuwe woning, vergeleken met volledig nieuwe financiering.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: meeTeNemenSchuld = min(bestaandeHypotheek, benodigdeNieuweHypotheek). Stap 2: nieuwTeFinancierenDeel = benodigdeNieuweHypotheek - meeTeNemenSchuld. Stap 3: bereken maandlast meegenomen deel met oude rente en resterende looptijd. Stap 4: bereken maandlast nieuw deel met actuele rente en looptijd. Stap 5: totaleMaandlastMeenemen = maandlastOudDeel + maandlastNieuwDeel. Stap 6: vergelijk met volledige nieuwe hypotheek: maandlastVolledigNieuw. Stap 7: voordeelPerMaand = maandlastVolledigNieuw - totaleMaandlastMeenemen.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rentes per jaar naar maandrente. Looptijden in jaren naar maanden. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandlasten op 2 decimalen. Hypotheekdelen op 2 decimalen. Voordeel op 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: meeTeNemenHypotheek, nieuwHypotheekdeel, maandlastMetMeenemen, maandlastVolledigNieuw, voordeelPerMaand.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Specificatie per leningdeel; vergelijking oude rente/nieuwe rente.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; rentes met 2 decimalen; looptijden in jaren/maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Benodigde nieuwe hypotheek <= 0, bestaande hypotheek < 0, ontbrekende rente of looptijd is ongeldig. Als verhuisregeling niet toegestaan is, toon niet relevant.
2. Domeinbeperkingen
    INVUL: 0 <= bestaandeHypotheek; benodigdeNieuweHypotheek > 0; meeTeNemenSchuld <= benodigdeNieuweHypotheek.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige nieuwe hypotheek in.” / “Vul geldige gegevens van de bestaande hypotheek in.” / “Meenemen van de hypotheek is in deze situatie niet van toepassing.”

Testset

1. Basiscase
    INVUL: Nodig € 400.000, bestaande € 200.000 tegen 2%, nieuw deel tegen 4%. Verwacht maandlast met meenemen lager dan volledig nieuw.
2. Edge-case
    INVUL: Bestaande hypotheek € 0. Verwacht gelijk aan volledig nieuwe hypotheek.
3. Regresstest tegen bekende uitkomst
    INVUL: Meegenomen aflossingsvrij € 100.000, oude rente 2%, nieuwe rente 4%. Verwacht rentevoordeel € 166,67 per maand bruto.
