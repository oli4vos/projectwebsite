# Overwaarde huis opeten — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek-en-wonen/overwaarde-huis-opeten.html

## Uit invulblad

Overwaarde huis opeten

Bron-URL: https://www.externe-bron.nl/hypotheek-en-wonen/overwaarde-huis-opeten.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen hoe lang een beschikbare overwaarde meegaat bij periodieke opname, rekening houdend met rente op de oplopende schuld.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: beschikbareOverwaarde = woningwaarde * maxLTV / 100 - hypotheekschuld. Stap 2: per maand: schuldEind = schuldBegin*(1+r) + maandOpname. Stap 3: stop wanneer schuldEind >= woningwaarde * maxLTV/100. Stap 4: als looptijd gegeven is, bereken maximale opname met annuïteit voor groeiende schuld: PMT = (maxSchuld - schuldBegin*(1+r)^n) * r / ((1+r)^n - 1); bij r=0: PMT = (maxSchuld - schuldBegin)/n.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Jaarlijkse rente naar maandrente. LTV in procenten. Opname per maand. Looptijd in maanden.
4. Afrondingsregels
    INVUL: Maandopname en schuld op 2 decimalen. Looptijd naar beneden afronden op volledige maanden.

Output-contract

1. Primaire outputs
    INVUL: beschikbareOverwaarde, maandelijkseOpname, looptijdMaanden, eindSchuld, resterendeOverwaarde.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaar-/maandschema schuldontwikkeling; grafiek opeten overwaarde.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; looptijd als jaren + maanden.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Woningwaarde <= 0, hypotheekschuld < 0, maxLTV buiten bereik, maandopname < 0 is ongeldig. Geen beschikbare overwaarde maakt opname niet mogelijk.
2. Domeinbeperkingen
    INVUL: woningwaarde > 0; 0 <= maxLTV <= 100; hypotheekschuld <= maxSchuld.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige woningwaarde in.” / “Er is geen beschikbare overwaarde.” / “Vul een geldige maandelijkse opname in.”

Testset

1. Basiscase
    INVUL: Woningwaarde € 500.000, maxLTV 60%, schuld € 200.000. Verwacht beschikbare overwaarde € 100.000.
2. Edge-case
    INVUL: Beschikbare overwaarde € 0. Verwacht geen opname mogelijk.
3. Regresstest tegen bekende uitkomst
    INVUL: Beschikbare ruimte € 12.000, rente 0%, opname € 1.000/mnd. Verwacht looptijd 12 maanden.
