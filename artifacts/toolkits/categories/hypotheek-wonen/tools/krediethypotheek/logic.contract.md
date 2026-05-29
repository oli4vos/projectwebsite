# Krediethypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/krediethypotheek-uitkeringen.html

## Uit invulblad

Krediethypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/krediethypotheek-uitkeringen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoeveel periodiek uit een krediethypotheek kan worden opgenomen of hoe lang een beschikbare kredietruimte meegaat.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: maximaleKredietruimte = woningwaarde * maxLTV / 100 - bestaandeHypotheek. Stap 2: bij gewenste maandopname PMT en rente r: simuleer per maand schuldEind = schuldBegin*(1+r) + PMT. Stap 3: stop wanneer schuld >= maximaleKredietruimte. Stap 4: bij gewenste looptijd n, bereken maximale maandopname: PMT = (maxSchuld - beginschuld*(1+r)^n) * r / ((1+r)^n - 1); bij r=0: PMT = (maxSchuld - beginschuld)/n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarrente naar maandrente. Looptijd in jaren naar maanden. LTV in procenten. Bedragen in euro.
4. Afrondingsregels
    INVUL: Kredietruimte, schuld en opname op 2 decimalen. Looptijd naar beneden afronden op volledige maanden zolang kredietruimte niet wordt overschreden.

Output-contract

1. Primaire outputs
    INVUL: maximaleKredietruimte, maandelijkseOpname of looptijdMaanden, eindSchuld, resterendeOverwaarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: opnameSchema[] met maand, opname, rente, schuld, resterende kredietruimte. Grafiek schuldontwikkeling.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, bestaande hypotheek < 0, maxLTV buiten bereik, rente ontbreekt of gewenste opname < 0 is ongeldig. Als kredietruimte <= 0, geen opname mogelijk.
2. Domeinbeperkingen
    INVUL: 0 <= maxLTV <= 100 of productparameter; bestaandeHypotheek <= woningwaarde * maxLTV/100; rente >= 0.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Er is geen beschikbare kredietruimte.” / “Vul een geldige maandelijkse opname in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 500.000, maxLTV 50%, bestaande hypotheek € 100.000. Verwacht kredietruimte € 150.000.
2. Edge-case
    INVUL: Bestaande hypotheek gelijk aan maximale kredietruimte. Verwacht beschikbare ruimte € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Beginschuld € 0, maxSchuld € 12.000, rente 0%, looptijd 12 maanden. Verwacht maandopname € 1.000.
