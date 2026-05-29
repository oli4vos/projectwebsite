# Opeethypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/opeethypotheek.html

## Uit invulblad

Opeethypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/opeethypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel overwaarde via een opeethypotheek kan worden opgenomen en hoe de schuld zich ontwikkelt door rente-bijschrijving.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: maxSchuld = woningwaarde * maxLTV / 100. Stap 2: beschikbareRuimte = maxSchuld - bestaandeHypotheek. Stap 3: bij maandelijkse opname PMT: schuldEindMaand = schuldBegin*(1+r) + PMT, waarbij r = rente/100/12. Stap 4: herhaal tot schuld maxSchuld bereikt of looptijd eindigt. Stap 5: bij gewenste looptijd bereken maandopname zoals krediethypotheek.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Woningwaarde en schuld in euro. LTV in procenten. Looptijd in maanden.
4. Afrondingsregels
    INVUL: Opnames en schuld op 2 decimalen. Looptijd naar beneden op volledige maanden als ruimte opraakt.

Output-contract

1. Primaire outputs
    INVUL: beschikbareOverwaarde, maximaleSchuld, maandelijkseOpname, looptijdMaanden, eindSchuld.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Schuldontwikkeling per maand/jaar; resterende overwaarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, bestaande hypotheek < 0, maxLTV buiten bereik, rente ontbreekt of opname < 0 is ongeldig.
2. Domeinbeperkingen
    INVUL: 0 <= maxLTV <= 100; bestaandeHypotheek <= maxSchuld voor positieve ruimte; rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Er is geen beschikbare overwaarde.” / “Vul een geldige opname of looptijd in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 500.000, maxLTV 50%, bestaande hypotheek € 100.000. Verwacht beschikbare ruimte € 150.000.
2. Edge-case
    INVUL: Bestaande hypotheek gelijk aan maxSchuld. Verwacht ruimte € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Ruimte € 12.000, rente 0%, looptijd 12 maanden. Verwacht maandopname € 1.000.
