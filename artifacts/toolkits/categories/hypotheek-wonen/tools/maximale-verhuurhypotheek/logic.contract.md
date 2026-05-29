# Maximale verhuurhypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/maximale-verhuurhypotheek.html

## Uit invulblad

Maximale verhuurhypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/maximale-verhuurhypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel verhuurhypotheek mogelijk is op basis van woningwaarde, huurinkomsten, rente, looptijd en verhuur-LTV/norm.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bereken LTV-maximum: maxOpWaarde = woningwaarde * maxLTV / 100. Stap 2: bereken toetsbare huur: toetsHuur = maandhuur * huurWegingspercentage / 100. Stap 3: bereken maximale lening op huurdekking: maandlast mag maximaal toetsHuur / dekkingsfactor zijn, of rente-only toets maxOpHuur = toetsHuur * 12 / toetsRente. Stap 4: maximaleVerhuurhypotheek = min(maxOpWaarde, maxOpHuur).
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandhuur naar jaar via * 12. Rente per jaar. LTV in procenten. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maximale hypotheek naar beneden op hele euro’s. Maandbedragen op 2 decimalen. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: maximaleVerhuurhypotheek, maxOpWoningwaarde, maxOpHuurinkomsten, toetsHuur, ltv.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Toetsing waarde versus huurinkomsten; gebruikte verhuurparameters.
3. Formatregels voor UI
    INVUL: Eurobedragen met hele euro’s/2 decimalen; percentages met 2 decimalen; indicatief label.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, huur < 0, maxLTV buiten bereik, toetsrente ontbreekt is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= maxLTV <= 100; maandhuur >= 0; toetsRente > 0; huurWegingspercentage >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Vul een geldige maandhuur in.” / “Vul geldige verhuurhypotheekparameters in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 300.000, maxLTV 70%, maandhuur € 1.500, huurweging 80%, toetsrente 6%, rente-only. Verwacht max waarde € 210.000, max huur € 240.000, hypotheek € 210.000.
2. Edge-case
    INVUL: Maandhuur € 0. Verwacht max op huur € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Woningwaarde € 500.000, maxLTV 60%. Verwacht max op waarde € 300.000.
