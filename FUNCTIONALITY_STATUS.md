# Functionaliteit Status (SSOT)

Dit is de **single source of truth** voor functionele status in de app.

Het doel van dit bestand:

- vastleggen wat actief is;
- vastleggen wat bewust uit staat;
- vastleggen wat hidden/draft is;
- heractivatie voorspelbaar maken;
- per wijziging traceerbaar houden wat er aan/uit is gezet.

Standaardregel: als een tool, route of flow niet meer actief aangeroepen wordt in de zichtbare site, hoort die niet publiek zichtbaar te blijven. Houd de code dan wel in de codebase, maar zet de manifest- en route-exposure op `hidden-draft` of `uitgeschakeld` en leg de wijziging hier vast.

## Verplichte werkwijze voor agents

Bij **elke** functionele wijziging (nieuwe feature, flag-toggle, hidden/public wijziging, UX-pad aan/uit):

1. Update de statusmatrix hieronder.
2. Voeg een regel toe aan `Mutatielog (append-only)`.
3. Update `PROJECT.md` als architectuur/flow is veranderd.
4. Benoem in commit wat functioneel is toegevoegd, uitgezet of geheractiveerd.

Als een commit functionaliteit wijzigt maar dit bestand niet bijwerkt, is de wijziging niet afgerond.

## Statuswaarden

- `actief`: standaard zichtbaar/bruikbaar.
- `experimenteel`: beschikbaar, maar bewust beperkt of beta.
- `uitgeschakeld`: code aanwezig, functioneel uit via flag.
- `hidden-draft`: in code aanwezig, niet publiek in registry/dashboard.
- `voorbereid`: technische laag aanwezig, nog niet actief in gebruikersflow.

## Statusmatrix

| Onderdeel | Status | Schakelaar | Default | Opmerking | Heractivatie |
|---|---|---|---|---|---|
| Toolbibliotheek + categorie-navigatie | actief | n.v.t. | aan | Homepage en routes draaien publiek | n.v.t. |
| Financiële kennisbank (`/kennisbank`) | actief | n.v.t. | aan | Centrale studieschuld-kennislaag met DUO-bronnen, hidden oude horizon-/beleggingskaders | n.v.t. |
| Publieke calculators (app-registry) | actief | `enabled: true` + `visibility: "public"` | aan | 10 publieke tools in de huidige registry; disabled tools tellen niet mee | n.v.t. |
| Draft tools (concept) | hidden-draft | `enabled: true` + `visibility: "hidden"` | uit | Alle tools en flows die niet meer actief aangeroepen worden blijven hier verborgen totdat er expliciet heractivatie is | zet manifest op `public` + checks draaien |
| Disabled tools | uitgeschakeld | `enabled: false` | uit | Manifestgestuurde technische uitschakeling; tool komt niet in registry, routes, dashboard, lazy bundle of publieke lijsten | zet `enabled` op `true`, genereer registry opnieuw en draai checks |
| Studieschuld-vs-beleggen | hidden-draft | `visibility: "hidden"` | uit | Bewust uit zichtbare positionering; code behouden voor mogelijke latere heractivatie | alleen heractiveren met nieuwe productbeslissing + copycheck |
| Volgende euro | hidden-draft | `visibility: "hidden"` | uit | Bewust uit zichtbare positionering; route niet meer gelinkt vanuit publieke UI | alleen heractiveren met nieuwe productbeslissing + copycheck |
| DUO-doorlenen-of-stoppen | hidden-draft | `visibility: "hidden"` | uit | Stopscenario-tool technisch aanwezig, maar niet in huidige publieke registry | zet manifest op `public` + volledige blueprint-check |
| DUO-leenbedrag-impact | experimenteel | `visibility: "public"` | aan | Eenvoudige leenfase-tool voor impact van nieuw leenbedrag op eindschuld | n.v.t. |
| DUO-stoppen-kosten-prestatiebeurs | experimenteel | `visibility: "public"` | aan | Eenvoudige tool voor prestatiebeursbedragen die schuld blijven bij stoppen zonder diploma | n.v.t. |
| DUO-maandbedrag | experimenteel | `visibility: "public"` | aan | Nieuwe fase-2-tool voor wettelijke maandtermijn, optionele draagkrachtindicatie en uitgebreide PDF | n.v.t. |
| DUO-extra-aflossen | experimenteel | `visibility: "public"` | aan | Nieuwe fase-2-tool voor extra DUO-aflossing, looptijd/maandbedrag, afloscurve en uitgebreide PDF | n.v.t. |
| DUO-aanvullende-beurs | experimenteel | `visibility: "public"` | aan | Publieke 2026-tool bovenop `src/lib/duo/additional-grant`; berekent reguliere aanvullende-beursindicatie met concrete ouderinkomens, toont special cases zonder aparte UI-formules en heeft nog geen PDF | n.v.t. |
| Centrale tax/DUO/pension/constants lagen | actief | n.v.t. | aan | Hergebruikt door meerdere tools | n.v.t. |
| Submit-driven calculatorflow | actief | n.v.t. | aan | Patroon beschikbaar via `CalculatorShell` + submitlogica | n.v.t. |
| Volgende-stap navigatie tussen publieke tools | actief | `ToolNextSteps` + journey-map | aan | Compacte vervolgstap per publieke tool, afgestemd op de meest waarschijnlijke vervolgvraag | n.v.t. |
| DUO-impact in maximale-hypotheektool | actief | n.v.t. | aan | Kernuitkomst toont rechtsboven de indicatieve daling van de leencapaciteit | n.v.t. |
| Hypotheekrentelink en salarisverhogingsanalyse | actief | centrale linkconfig + salarisadapter | aan | Maximale-hypotheekflow toont externe inspiratielink bij renteveld en vervolganalyse voor extra leenruimte via centrale hypotheekengine; PDF-uitbreiding blijft vervolgwerk | n.v.t. |
| Familiehulp eerste woning | uitgeschakeld | `apps/familiehulp-eerste-woning/app.json -> enabled: false` | uit | Bewust buiten eerste-livegangscope; code blijft bestaan, maar publieke registry, routes, dashboard, zoekresultaten, lazy loading en journey-links sluiten de tool uit | zet alleen na scopebesluit `enabled: true` en draai volledige blueprint-/releasechecks |
| Hypotheek Regulations-integratieadapter | voorbereid | centrale adapter | uit in UI | Centrale adapterlaag voor hypotheektools richting Regulations-architectuur; nog niet gekoppeld aan calculators en wijzigt geen publieke uitkomsten | koppel per tool pas na UX/PDF- en regressiecontrole |
| DUO-maandbedrag-returnflow naar hypotheektools | actief | sessionStorage-transfer | aan | `hypotheek-impact-studieschuld` en `artifact-hypotheek-wonen-maximale-hypotheek` kunnen een concept bewaren, `duo-maandbedrag` laten rekenen en een bevestigbaar wettelijk DUO-bedrag teruggeven zonder financiële data in de URL | n.v.t. |
| Centrale toeslagen-hard-checks | actief | n.v.t. | aan via publieke beta | `evaluateAllowanceSignals` is de blijvende centrale eligibility- en hard-checklaag voor 2026-voorwaarden; officiële bedraglogica blijft apart in de calculation engine | 2027-dataset vereist vóór gebruik in 2027 |
| Toeslagenscan publieke beta | experimenteel | `visibility: "public"` | aan | `apps/toeslagen-scan` gebruikt centrale allowances-engines; zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag tonen voor ondersteunde 2026-standaardscenario's een euro-indicatie. Geen opslag/backend/analytics | 2027-dataset vereist vóór gebruik in 2027 |
| Doorstap vanaf DUO-doorlenen-of-stoppen | actief | n.v.t. | aan | Resultaat toont scenariovergelijking, schuldenvrije datum en uitgebreide PDF | n.v.t. |
| Chart-standaardisatie (jaar/euro/tooltips) | actief | n.v.t. | aan | Centrale charthelpers/componenten | n.v.t. |
| Profielfunctie (`/profiel`, prefillpad) | uitgeschakeld | `NEXT_PUBLIC_ENABLE_PROFILE` | `false` | UI/CTA's verborgen, code blijft intact | zet op `1` en valideer profiel + tools |
| Kennisniveaufunctionaliteit | uitgeschakeld | `NEXT_PUBLIC_ENABLE_KNOWLEDGE_LEVEL` | `false` | Bewust niet zichtbaar in productieflow | zet op `1` en valideer homepage/toolhints |
| Handmatige profielsync-panel | uitgeschakeld | `NEXT_PUBLIC_ENABLE_PROFILE_SYNC_PANEL` | `false` | Alleen zinvol in hybrid/remote traject | zet op `1` en valideer `/profiel` |
| Saved calculations MVP (opslaan/lijst/heropen) | uitgeschakeld | `NEXT_PUBLIC_ENABLE_SAVED_CALCULATIONS` | `false` | Feature-flagged local-first MVP | zet op `true` en valideer `volgende-euro` + `/profiel` |
| Profile storage mode: `local` | actief | `NEXT_PUBLIC_PROFILE_STORAGE_MODE` | `local` | Huidige runtime-opslag | n.v.t. |
| Profile storage mode: `hybrid`/`remote` | voorbereid | `NEXT_PUBLIC_PROFILE_STORAGE_MODE` | `local` | Fallback/no-op zonder remote activering | latere database/auth activatiestap nodig |
| Supabase/auth/session-contract | voorbereid | env/config | uit | Client-safe voorbereiding zonder verplichte login | alleen activeren met aparte rollout |

## Mutatielog (append-only)

| Datum | Commit | Wijziging | Impact |
|---|---|---|---|
| 2026-07-24 | `pending` | Manifestgestuurde `enabled`-laag toegevoegd voor tools; alle manifests hebben expliciet `enabled`, en `familiehulp-eerste-woning` is centraal uitgeschakeld voor de eerste livegang | Architectuur / registry / routes |
| 2026-07-24 | `pending` | Kinderopvangtoeslag is voor ondersteunde standaardscenario's bedraggevend aangesloten op een centrale 2026-engine met LRK/eigen-bijdrage/activiteit-blockers, officiële uurtarief- en urencaps en regressietests tegen officiële voorbeelden | Toeslagen / publieke beta / kinderopvangtoeslag |
| 2026-07-24 | `pending` | DUO-maandbedrag-returnflow uitgebreid naar maximale-hypotheektool, inclusief sessieherstel, automatisch invullen van wettelijk DUO-maandbedrag en uitleg over banktoetsing versus actuele DUO-incasso | Hypotheek / DUO / toolkoppeling |
| 2026-07-21 | `pending` | Huurtoeslag en kindgebonden budget publiek geïntegreerd in de Toeslagenscan via centrale adapters bovenop `calculateRentBenefit2026` en `calculateChildBudget2026`; kinderopvangtoeslag blijft zonder totaalbedrag | Toeslagen / publieke beta / bedragindicatie |
| 2026-07-21 | `pending` | Compacte volgende-stap navigatie toegevoegd op alle publieke tools via een centrale journey-map en `ToolNextSteps`-component | UX / conversie / publieke tools |
| 2026-07-20 | `pending` | Centrale hypotheekadapter richting Regulations-architectuur toegevoegd met inventarisatie, definitions, answer mapping, evaluation/recommendation/estimate-context en regressietests; niet gekoppeld aan publieke UI | Hypotheek / Regulations / voorbereid |
| 2026-07-21 | `pending` | Publieke `duo-aanvullende-beurs` calculator toegevoegd bovenop de centrale aanvullende-beursengine, met manifest, dashboardregistratie, formulieradapter, resultaatweergave en regressietests | DUO / aanvullende beurs / publieke beta |
| 2026-07-20 | `pending` | Release-reviewbevindingen Toeslagenscan verwerkt: publieke statuscopy afgestemd op zorgtoeslag-bedragindicatie, machinecodes vervangen door Nederlandse labels, reportmodel gevuld vanuit relevante invoer en `evaluateAllowanceSignals` expliciet vastgelegd als centrale hard-checklaag | Toeslagen / releasefix / publieke beta |
| 2026-07-19 | `pending` | Toeslagenscan gecontroleerd geactiveerd als publieke beta-tool; 10 publieke tools, destijds zonder publieke bedragindicatie/PDF/opslag/backend/analytics | Toeslagen / publieke beta / registry |
| 2026-07-20 | `pending` | Toeslagenscan gebruikt de centrale Regulation Question Flow voor voortgang, vervolgvraag en inferred/skipped/not-applicable-statussen zonder publieke signaleringsuitkomsten of berekeningen te wijzigen | Toeslagen / question flow / publieke beta |
| 2026-07-19 | `pending` | Eerste hidden-draft toeslagenscan toegevoegd op basis van centrale allowances-signalering; geen bedragen, geen PDF, geen opslag en niet publiek zichtbaar | Toeslagen / hidden draft / UI |
| 2026-07-19 | `pending` | Veilige DUO-maandbedrag-returnflow toegevoegd tussen hypotheek-impact en DUO-maandbedrag via allowlisted sessionStorage-transfer en expliciete gebruikerbevestiging | DUO / studieschuld / hypotheek-impact |
| 2026-07-19 | `pending` | Centrale 2026 toeslagen-hard-checks toegevoegd voor zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag; bedraglogica bleef toen nog buiten de publieke UI | Toeslagen / domeinlaag / brondata |
| 2026-07-19 | `pending` | Externe hypotheekrentelink toegevoegd bij publieke rentevelden en salarisverhogingsanalyse geïntegreerd in maximale-hypotheekflow via centrale hypotheekengine | Maximale hypotheek / hypotheekrente / salaris |
| 2026-07-18 | `pending` | Calculatorarchitectuur en blueprint-check gedocumenteerd; statusmatrix afgestemd op huidige publieke registry zonder manifestwijzigingen | Architectuur / statusdocumentatie |
| 2026-07-13 | `pending` | DUO-maandbedrag en DUO-extra-aflossen krijgen uitgebreide PDF-overzichten vanuit dezelfde centrale DUO-rekendata | DUO / studieschuld / PDF |
| 2026-07-13 | `pending` | DUO-doorlenen-of-stoppen omgebouwd naar stopscenario-tool met prestatiebeurs, diplomatermijn, schuldenvrij-datum en uitgebreide PDF-export | DUO / studieschuld / scenario's |
| 2026-07-13 | `pending` | DUO-doorlenen-of-stoppen hypotheekhint opgeschoond: irrelevante copy vervangen door relevante hypotheekvoorwaarden | DUO / studieschuld / copy |
| 2026-07-13 | `pending` | DUO-doorlenen-of-stoppen toont directe vervolgstap naar hypotheekimpact en maximale hypotheek | DUO / studieschuld / woonroute |
| 2026-07-13 | `cc39fb9` | DUO-renteselectie op laatste 5 jaar, debt-parts editor en hypotheek-prefill op historisch DUO-rentejaar toegevoegd | DUO / studieschuld / hypotheek-impact |
| 2026-07-05 | `pending` | Nieuwe publieke beta-tool `DUO doorlenen of stoppen` toegevoegd met centrale leenfaseprojectie | DUO / studieschuld / leenfase |
| 2026-07-05 | `pending` | Site herpositioneerd naar “studieschuld begrijpen” met drie fases: opbouw, maandbedrag, wonen | Homepage / kennisbank / navigatie |
| 2026-07-05 | `pending` | Nieuwe publieke beta-tools `duo-maandbedrag` en `duo-extra-aflossen` toegevoegd | DUO / studieschuld / terugbetalen |
| 2026-07-05 | `pending` | `studieschuld-vs-beleggen` en `volgende-euro` verborgen gehouden; links uit zichtbare UI verwijderd | Toolzichtbaarheid / positionering |
| 2026-06-14 | `pending` | DUO-impact centraal berekend en rechtsboven in de maximale-hypotheekuitkomst geplaatst | Maximale hypotheek / studieschuld |
| 2026-06-13 | `pending` | Mobiele calculatorflow, invoersemantiek en projectbrede UX-richtlijnen aangescherpt | Publieke calculatorflow en toegankelijkheid |
| 2026-05-28 | `36c6b0e` | Saved scenario’s direct heropenen in oorspronkelijke tool toegevoegd (deep-linkflow) | Saved calculations MVP |
| 2026-05-28 | `pending` | Financiële kennisbankpagina + centrale kennislaag toegevoegd | Kennislaag / navigatie |
| 2026-05-28 | `85d5864` | Nieuwe doelgroeptools live gezet + glossary-dekking verbreed | Toolzichtbaarheid + copy |
| 2026-05-27 | `9075395` | “Mijn opgeslagen scenario’s” op profielpagina toegevoegd | Saved calculations MVP |
| 2026-05-27 | `ec9f015` t/m `8857ac8` | Profile sync policy/orchestrator/events/documentatie voorbereid | Profile storage voorbereiding |

## Open functionele punten

- Private-lease impacttool inhoudelijk valideren voordat deze publiek wordt.
- Begrippen-uitleg verder uitrollen naar losse vrije calculatorcopy buiten gedeelde componenten.
- Scenario-heropenflow uitbreiden naar extra tools zodra scenario-opslag daar wordt geactiveerd.
- Salarisverhogingsanalyse opnemen in het maximale-hypotheek-PDF-rapport zodra er een gedeeld report-viewmodel is, zonder aparte PDF-berekening.
