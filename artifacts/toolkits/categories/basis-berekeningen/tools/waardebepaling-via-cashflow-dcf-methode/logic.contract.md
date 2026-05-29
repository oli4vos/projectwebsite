# Waardebepaling via cashflow, DCF-methode — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/berekenen/waardebepaling-via-cashflow.html

## Uit invulblad

Waardebepaling via cashflow, DCF-methode

Bron-URL: https://www.externe-bron.nl/berekenen/waardebepaling-via-cashflow.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen van de waarde van een onderneming/project/investering door toekomstige kasstromen en een eventuele eindwaarde contant te maken met de WACC/disconteringsvoet.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: lees WACCPercentage, kasstromen[] en optioneel eindwaarde. Stap 2: wacc = WACCPercentage / 100. Stap 3: voor elke kasstroom in jaar t: contanteWaardeKasstroom_t = kasstroom_t / (1 + wacc)^t. Stap 4: contanteWaardeKasstromen = Σ contanteWaardeKasstroom_t. Stap 5: als eindwaarde is ingevuld: contanteWaardeEindwaarde = eindwaarde / (1 + wacc)^n. Stap 6: dcfWaarde = contanteWaardeKasstromen + contanteWaardeEindwaarde.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: WACC is percentage per jaar. Kasstromen zijn eurobedragen per jaar. Horizon n is het aantal jaren/kasstromen. Er is geen maandconversie in de standaardversie.
4. Afrondingsregels
    INVUL: Intern volledige precisie. Contante waarden en DCF-waarde afronden op 2 decimalen. Disconteringsfactoren tonen met 6 decimalen.

Output-contract

1. Primaire outputs
    INVUL: dcfWaarde: totale contante waarde; contanteWaardeKasstromen; contanteWaardeEindwaarde; waccPercentage; horizonJaren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: dcfSchema[] met jaar, kasstroom, disconteringsfactor, contante waarde kasstroom. Optioneel grafiek nominale kasstromen versus contante waarden.
3. Formatregels voor UI
    INVUL: Eurobedragen als € 1.234,56; WACC als 8,00%; factoren met 6 decimalen; jaren als gehele getallen.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Geen kasstromen is onvoldoende. Niet-numerieke kasstromen of WACC zijn ongeldig. WACC 0% is geldig. Eindwaarde is optioneel; leeg betekent 0.
2. Domeinbeperkingen
    INVUL: wacc > -100%; maximaal 100 kasstroomjaren. Kasstromen en eindwaarde mogen positief, nul of negatief zijn. Als later Gordon Growth wordt toegevoegd, moet groeipercentage lager zijn dan WACC.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul minimaal één kasstroom in.” / “Vul een geldige WACC in.” / “De WACC moet hoger zijn dan -100%.” / “De horizon is te lang voor deze berekening.”

Testset

1. Basiscase
    INVUL: Invoer: WACC 10%, kasstromen [100, 100, 100], eindwaarde 1000. Verwacht: contante waarde kasstromen circa € 248,69, contante waarde eindwaarde circa € 751,31, DCF-waarde circa € 1.000,00.
2. Edge-case
    INVUL: Invoer: WACC 0%, kasstromen [100, 200, 300], eindwaarde 400. Verwacht: DCF-waarde € 1.000.
3. Regresstest tegen bekende uitkomst
    INVUL: Invoer: WACC 8%, kasstromen [1000, 1100, 1200], eindwaarde 5000. Verwacht: DCF-waarde circa € 6.071,59.
