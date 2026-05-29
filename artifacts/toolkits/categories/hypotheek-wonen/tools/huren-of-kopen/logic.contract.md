# Huren of kopen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/modules/wonen/huren-of-kopen.html

## Uit invulblad

Huren of kopen

Bron-URL: https://www.externe-bron.nl/modules/wonen/huren-of-kopen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Vergelijken van de financiële uitkomst van huren versus kopen over een gekozen periode.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1 huur: bereken per jaar huurkosten met stijging: huur_t = huur_0 * (1 + huurstijging)^t; totaal huur = som maandhuur * 12. Stap 2 koop: bereken hypotheeklasten, onderhoud, belastingen, verzekeringen, kosten koper en netto fiscale effecten per jaar. Stap 3 waarde woning: woningwaarde_t = koopprijs * (1 + waardestijging)^t. Stap 4 restschuld via hypotheekaflosschema. Stap 5 netto vermogenspositie kopen = woningwaarde - restschuld - verkoopkosten. Stap 6 vergelijk met huurvariant inclusief eventueel rendement op niet-gebruikt eigen geld: eindverschil = nettoVermogenKopen - nettoVermogenHuren.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandhuur naar jaar via *12. Jaarlijkse stijgingen als percentage. Hypotheekrente jaarrente naar maandrente. Periode in jaren.
4. Afrondingsregels
    INVUL: Jaarbedragen en eindvermogen op 2 decimalen. Schema jaarlijks. Percentages met 2 decimalen.

Output-contract

1. Primaire outputs
    INVUL: totaleKostenHuren, totaleNettoKostenKopen, eindvermogenKopen, eindvermogenHuren, voordeelKopenOfHuren.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Jaarlijkse tabel huur/kopen; grafiek cumulatieve kosten en vermogenspositie.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; eindadvies als “kopen voordeliger” of “huren voordeliger”.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Koopprijs <= 0, huur < 0, periode <= 0, rente ontbreekt of negatieve kosten waar niet toegestaan zijn ongeldig. Ontbrekende fiscale parameters maken netto koopvariant onvoldoende.
2. Domeinbeperkingen
    INVUL: periodeJaren > 0; koopprijs > 0; huur >= 0; rendement/stijgingspercentages groter dan -100%.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldige koopprijs in.” / “Vul een geldige huur in.” / “Vul een positieve vergelijkingsperiode in.” / “Voor netto berekening ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Huur € 1.000/mnd, periode 1 jaar, geen stijging. Verwacht huurkosten € 12.000.
2. Edge-case
    INVUL: Periode 0 jaar. Verwacht foutmelding.
3. Regresstest tegen bekende uitkomst
    INVUL: Koopprijs € 300.000, waardestijging 0%, verkoopkosten 0, aflossingsvrij schuld € 300.000 na 1 jaar. Verwacht netto woningvermogen € 0 vóór kosten.
