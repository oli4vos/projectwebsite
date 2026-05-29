# Totale netto kosten van een hypotheek — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/totale-kosten-hypotheek.html

## Uit invulblad

Totale netto kosten van een hypotheek

Bron-URL: https://www.externe-bron.nl/hypotheek/totale-kosten-hypotheek.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de totale bruto en netto kosten van een hypotheek over de volledige looptijd, inclusief rente, aflossing, fiscale effecten en eventuele afsluitkosten.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: genereer maandelijk hypotheekschema volgens hypotheekvorm. Stap 2: bereken per jaar betaalde rente, aflossing en restschuld. Stap 3: bereken jaarlijks fiscaal voordeel: max(0, aftrekbareRente - eigenwoningforfait) * aftrekTarief, met Hillen/tariefsaanpassing via parameters. Stap 4: nettoKostenJaar = brutoBetalingenJaar - fiscaalVoordeel + nietFinancierbareKosten. Stap 5: sommeer over looptijd: totaleNettoKosten = Σ nettoKostenJaar + eenmaligeKosten.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Rente per jaar naar maand. Fiscale posten per jaar. Maandbetalingen aggregeren naar jaar. Bedragen in euro.
4. Afrondingsregels
    INVUL: Maandregels op centen. Jaar- en totaalbedragen op 2 decimalen. Laatste termijn corrigeert restschuld naar nul.

Output-contract

1. Primaire outputs
    INVUL: totaleBrutoKosten, totaleNettoKosten, totaleRente, totaleAflossing, totaalFiscaalVoordeel, eenmaligeKosten.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijks kostenoverzicht; maand-/jaarschema; grafiek bruto versus netto kosten en restschuld.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; totalen duidelijk over volledige looptijd.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Hypotheekbedrag <= 0, looptijd <= 0, rente ontbreekt is ongeldig. Netto berekening zonder fiscale parameters is onvoldoende; bruto totaal kan wel.
2. Domeinbeperkingen
    INVUL: P > 0; n > 0; 0 <= rente <= 100; kosten >= 0; fiscale jaartabellen beschikbaar voor netto.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul geldige hypotheekgegevens in.” / “Kosten mogen niet negatief zijn.” / “Voor totale netto kosten ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Hypotheek € 100.000, rente 5%, looptijd 30 jaar, annuïtair, geen fiscaal voordeel. Verwacht bruto maandlast circa € 536,82, totale bruto betaling circa € 193.255.
2. Edge-case
    INVUL: Rente 0%, hypotheek € 120.000, looptijd 10 jaar. Verwacht totale bruto kosten € 120.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Bruto kosten € 200.000, fiscaal voordeel € 30.000, eenmalige kosten € 5.000. Verwacht totale netto kosten € 175.000.
