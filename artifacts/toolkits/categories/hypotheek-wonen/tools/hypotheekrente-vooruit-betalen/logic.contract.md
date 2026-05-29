# Hypotheekrente vooruit betalen — Logic Contract

- Status: `ready`
- Ingevuld: `13/13` (100%)
- Bron: https://www.externe-bron.nl/hypotheek/hypotheekrente-vooruit-betalen.html

## Uit invulblad

Hypotheekrente vooruit betalen

Bron-URL: https://www.externe-bron.nl/hypotheek/hypotheekrente-vooruit-betalen.html

Kernlogica

1. Hoofddoel van de berekening
    INVUL: Berekenen of het fiscaal voordelig is om hypotheekrente vooruit te betalen, door aftrek te verschuiven naar een jaar met een ander belastingtarief.
2. Exacte formules/stappenvolgorde
    INVUL: Stap 1: bepaal vooruitbetaalde rente: vooruitbetaaldeRente = maandrente * aantalMaandenVooruit of direct invoer. Stap 2: fiscaalVoordeelHuidigJaar = vooruitbetaaldeRente * aftrekTariefHuidigJaar. Stap 3: fiscaalVoordeelVolgendJaar = vooruitbetaaldeRente * aftrekTariefVolgendJaar. Stap 4: belastingVoordeelVerschuiving = fiscaalVoordeelHuidigJaar - fiscaalVoordeelVolgendJaar. Stap 5: corrigeer eventueel liquiditeitsnadeel: nettoVoordeel = belastingVoordeelVerschuiving - gemistRendement.
3. Periode-/eenheidsconversies (maand/jaar, %, euro)
    INVUL: Maandrente in euro of schuld * rente / 12. Aftrektarieven per jaar in procenten. Aantal maanden vooruit als integer.
4. Afrondingsregels
    INVUL: Eurobedragen op 2 decimalen. Percentages met 2 decimalen. Maanden als geheel getal.

Output-contract

1. Primaire outputs
    INVUL: vooruitbetaaldeRente, fiscaalVoordeelHuidigJaar, fiscaalVoordeelVolgendJaar, belastingVoordeelVerschuiving, nettoVoordeel.
2. Secundaire outputs/tabellen/grafieken
    INVUL: Vergelijking aftrekjaar nu versus later; liquiditeitseffect.
3. Formatregels voor UI
    INVUL: Eurobedragen met 2 decimalen; percentages met 2 decimalen; duidelijke fiscale disclaimer.

Randgevallen & validatie

1. Ongeldige of ontbrekende invoer
    INVUL: Vooruitbetaalde rente < 0, aantal maanden < 0, aftrektarieven ontbreken of buiten bereik zijn ongeldig/onvoldoende. Als aantal maanden 0, voordeel 0.
2. Domeinbeperkingen
    INVUL: 0 <= aftrekTarief <= 100; aantalMaandenVooruit >= 0; wettelijke maxima/voorwaarden via jaartabelparameter.
3. Foutmeldingsteksten (Nederlands)
    INVUL: “Vul een geldig bedrag aan vooruitbetaalde rente in.” / “Vul geldige aftrektarieven in.” / “Voor dit jaar ontbreken fiscale parameters.”

Testset

1. Basiscase
    INVUL: Vooruitbetaalde rente € 3.000, aftrek huidig 49%, volgend 37%. Verwacht voordeel € 360.
2. Edge-case
    INVUL: Aftrektarief huidig gelijk aan volgend. Verwacht voordeel € 0.
3. Regresstest tegen bekende uitkomst
    INVUL: Rente € 1.000, tarief huidig 40%, volgend 30%, gemist rendement € 20. Verwacht netto voordeel € 80.
