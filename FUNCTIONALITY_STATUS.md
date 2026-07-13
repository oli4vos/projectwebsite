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
| Publieke calculators (app-registry) | actief | `visibility: "public"` | aan | 7 publieke tools in de huidige registry | n.v.t. |
| Draft tools (concept) | hidden-draft | `visibility: "hidden"` | uit | Alle tools en flows die niet meer actief aangeroepen worden blijven hier verborgen totdat er expliciet heractivatie is | zet manifest op `public` + checks draaien |
| Studieschuld-vs-beleggen | hidden-draft | `visibility: "hidden"` | uit | Bewust uit zichtbare positionering; code behouden voor mogelijke latere heractivatie | alleen heractiveren met nieuwe productbeslissing + copycheck |
| Volgende euro | hidden-draft | `visibility: "hidden"` | uit | Bewust uit zichtbare positionering; route niet meer gelinkt vanuit publieke UI | alleen heractiveren met nieuwe productbeslissing + copycheck |
| DUO-maandbedrag | experimenteel | `visibility: "public"` | aan | Nieuwe fase-2-tool voor wettelijke maandtermijn en optionele draagkrachtindicatie | n.v.t. |
| DUO-extra-aflossen | experimenteel | `visibility: "public"` | aan | Nieuwe fase-2-tool voor extra DUO-aflossing, looptijd/maandbedrag en afloscurve | n.v.t. |
| Centrale tax/DUO/pension/constants lagen | actief | n.v.t. | aan | Hergebruikt door meerdere tools | n.v.t. |
| Submit-driven calculatorflow | actief | n.v.t. | aan | Patroon beschikbaar via `CalculatorShell` + submitlogica | n.v.t. |
| DUO-impact in maximale-hypotheektool | actief | n.v.t. | aan | Kernuitkomst toont rechtsboven de indicatieve daling van de leencapaciteit | n.v.t. |
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
