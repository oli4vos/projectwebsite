# Domeinfase Hypotheek, DUO, Toeslagen en Bronbeheer

Peildatum: 2026-07-19.

## Gewijzigde centrale domeinlaag

- `src/lib/mortgage/provider-rates.ts` bevat een pure referentiefunctie voor het gemiddelde van vergelijkbare grootbankrentes: 10 jaar vast, annuitair, 100 procent marktwaarde, zonder NHG en zonder tijdelijke, huisbank-, duurzaamheids- of persoonlijke kortingen.
- `src/lib/mortgage/salary-borrowing-power.ts` bevat een pure scenariofunctie voor extra leenruimte door salarisverhoging. De functie gebruikt de bestaande centrale maximale-hypotheekengine.
- `src/lib/duo/mortgage-assessment.ts` bevat een pure beslisfunctie voor het DUO-maandbedrag dat hypotheekadapters als beoordelingsbedrag moeten tonen.
- `src/lib/allowances/signaling.ts` bevat signal-only toeslagenfuncties. Deze functies berekenen geen toeslagbedragen.
- `src/lib/financial-constants/input-limits.ts` bevat centrale inputlimietvalidatie voor normatieve grenzen, productgrenzen en praktische slidergrenzen.

## Bronstatus

Provider-rentes zijn bewust niet als actieve productiedataset geregistreerd. Voor bruikbaar gebruik is handmatig genormaliseerde providerdata nodig met minimaal providernaam, scenario, rente, bron-URL, opgehaaldatum, verificatiedatum, reviewdatum, status en uitsluiting van kortingen. Scraping tijdens gebruikersbezoek is uitgesloten.

Toeslagen zijn bewust signal-only. `allowance-signal-rules-2026` is actief geregistreerd voor harde voorwaarden en officiele bronlinks. Toeslagbedragen, staffels, afbouwformules en complexe huishoudregels worden pas actief wanneer de regels volledig genormaliseerd, dateerbaar, gevalideerd en regressiegetest zijn. Tot die tijd verwijzen adapters naar de officiele proefberekening voor bedrag en definitieve beoordeling.

Ondersteund per 2026:

- Zorgtoeslag: leeftijd, Nederlandse zorgverzekering, partnerafhankelijke inkomensgrens en partnerafhankelijke vermogensgrens.
- Huurtoeslag: huur/koop, zelfstandige woonruimte en partner-/huishoudafhankelijke vermogenssignalering; kale huur wordt niet als harde uitsluiting gebruikt.
- Kindgebonden budget: kinderen, kind jonger dan 18, kinderbijslagstatus, kind woont bij aanvrager en partnerafhankelijke vermogensgrens.
- Kinderopvangtoeslag: kinderen, opvanggebruik, LRK-registratie, kind woont bij aanvrager, eigen bijdrage, aanvrageractiviteit en partneractiviteit.

Statusprioriteit:

1. ontbrekende of technisch ongeldige kerninformatie -> `insufficient-information`;
2. bekende harde uitsluiting -> `probably-not`;
3. complexe situatie of beperkte MVP-dekking -> `official-calculation-recommended`;
4. alleen bij zorgtoeslag kan volledige basisinformatie zonder uitsluiting -> `possible`.

## Integratie-instructie

Applicatie-adapters mogen invoer parsen, valideren en mappen naar deze domeinfuncties. React-componenten, formulieren en PDF-rendering mogen geen eigen rente-, DUO-, toeslagen- of salaris-leenruimteformules bevatten. Scherm en PDF moeten hetzelfde resultaatobject of viewmodel gebruiken.

Sliders mogen `FinancialInputLimit` gebruiken voor bereik en stapgrootte, maar mogen normatieve waarden niet stil clampen. Een grensoverschrijding moet via het centrale validatieresultaat zichtbaar blijven.

## Jaarlijkse updatepunten

- Hypotheeknormen en AFM-toetsrente: bij nieuwe kwartaal- of jaarnormen.
- DUO-rentes en leengrenzen: bij nieuw studiejaar of rentebesluit.
- Provider-rentes: alleen na handmatige verificatie, met korte reviewtermijn.
- Toeslagensignalen: bij nieuwe Belastingdienst-grenzen en wanneer een volledige bedragenengine wordt overwogen.
