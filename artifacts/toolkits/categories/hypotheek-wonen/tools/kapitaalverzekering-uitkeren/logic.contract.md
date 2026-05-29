# Kapitaalverzekering uitkeren — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/kapitaalverzekering-banksparen-uitkeren.html

## Uit invulblad

Kapitaalverzekering uitkeren

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/kapitaalverzekering-banksparen-uitkeren.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen welk deel van een kapitaalverzekering/bankspaarrekening eigen woning belastingvrij kan uitkeren en welk deel belast is, rekening houdend met vrijstelling en eigenwoningschuld.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: uitkering = kapitaalUitkering. Stap 2: bepaal vrijstelling = min(jaartabelVrijstelling, resterendeEigenwoningschuld, uitkering) indien voorwaarden voldaan. Stap 3: belastDeel = max(0, uitkering - vrijstelling). Stap 4: belasting = belastDeel * belastingTarief. Stap 5: nettoUitkering = uitkering - belasting.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Uitkering en vrijstellingen in euro. Belastingtarief in procenten. Polisduur in jaren voor voorwaarden.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Belastingtarief met 2 decimalen. Fiscale vrijstelling eventueel op hele euro’s volgens jaartabel.

Output-contract

1. Primaire outputs
    INVUL: belastingvrijeUitkering, belastDeel, belasting, nettoUitkering, toegepasteVrijstelling.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Voorwaardentoets: looptijd, bandbreedte, eigenwoningschuld, vrijstelling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; status voorwaarden als “voldoet/niet voldoet”; fiscale disclaimer.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Uitkering < 0, eigenwoningschuld < 0, belastingtarief buiten bereik is ongeldig. Ontbrekende jaartabel of voorwaardengegevens maakt fiscale vrijstelling onvoldoende.
2. Domeinbeperkingen
    INVUL: uitkering >= 0; eigenwoningschuld >= 0; 0 <= belastingTarief <= 100; vrijstelling niet hoger dan uitkering.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige uitkering in.” / “Vul een geldige eigenwoningschuld in.” / “Voor dit jaar ontbreken de vrijstellingsbedragen.”

Testset

1. Basiscase
    INVUL: Uitkering € 100.000, vrijstelling € 150.000, eigenwoningschuld € 120.000. Verwacht belast deel € 0.
2. Edge-case
    INVUL: Uitkering € 0. Verwacht netto uitkering € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Uitkering € 200.000, vrijstelling € 150.000, eigenwoningschuld € 300.000, tarief 40%. Verwacht belast € 50.000, belasting € 20.000, netto € 180.000.
