# DUO Aanvullende-beursscan 2026 - bron- en regelspecificatie

Peildatum: 2026-07-20. Scope: centrale bronnen, regels, functioneel ontwerp, typed contracten en testscenario's voor een toekomstige `Aanvullende-beursscan`. Er is geen React UI, route, manifest, dashboardkaart, PDF-rendering of volledige calculatorimplementatie toegevoegd.

Machineleesbare brondata: `src/lib/financial-constants/duo-additional-grant-rules-2026.ts`, geregistreerd als `duo-additional-grant-rules-2026` met scenario `official-2026-prepared`.

## Officiele Bronnen

| Bron | URL | Datum | Geldigheid | Gebruik |
|---|---|---:|---:|---|
| DUO - Aanvullende beurs | https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/ | Geraadpleegd 2026-07-20 | 2026 | Recht, hoelang recht, gift/prestatiebeurs |
| DUO - Hoeveel is het? | https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/hoeveel-is-het.jsp | DUO-pagina actueel 2026, geraadpleegd 2026-07-20 | 2026 | Maxima mbo, hbo/wo, peiljaar 2024, maximale-beursgrens |
| DUO - Inkomen ouders | https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/inkomen-ouders.jsp | Geraadpleegd 2026-07-20 | 2026 | Verlegging peiljaar, inkomensschatting, terugbetalingsrisico |
| DUO - Bedragen studiefinanciering | https://www.duo.nl/particulier/studiefinanciering/bedragen.jsp | Geraadpleegd 2026-07-20 | 2026 | Mbo-bedragen, lagere aanvullende beurs bij geen lesgeldplicht, bijleenruimte |
| DUO - Rekenhulp studiefinanciering | https://duo.nl/particulier/rekenhulpen/rekenhulp-studiefinanciering.jsp | Geraadpleegd 2026-07-20 | 2026 | Verzamelinkomen/belastbaar loon en schattingskarakter |
| DUO - Aanvragen studiefinanciering | https://www.duo.nl/particulier/studiefinanciering/aanvragen.jsp | Geraadpleegd 2026-07-20 | 2026 | Aanvragen via Mijn DUO, aanvullende beurs altijd aanvragen |
| DUO - Gift of terugbetalen | https://duo.nl/particulier/studiefinanciering/gift-of-terugbetalen.jsp | Geraadpleegd 2026-07-20 | 2026 | Gift mbo 1/2, prestatiebeurs mbo 3/4 hbo wo |
| DUO PDF - Berekening aanvullende beurs mbo 2026 | https://duo.nl/images/folder-berekening-aanvullende-beurs-mbo-2026.pdf | PDF metadata gewijzigd 2026-01-27 | 2026 | Ouderbijdrageformule en PDF-formulierwaarden, nog Calculation Guardian-review nodig |
| DUO PDF - Berekening aanvullende beurs hbo universiteit 2026 | https://duo.nl/images/folder-berekening-aanvullende-beurs-hbo-universiteit-2026.pdf | PDF metadata gewijzigd 2026-01-27 | 2026 | Ouderbijdrageformule en PDF-formulierwaarden, nog Calculation Guardian-review nodig |

Niet gebruikt: commerciele calculators, blogs, nieuwsmedia, Nibud, banken of afgeleide formules.

## MVP-Scope

Ondersteund in eerste versie:

- mbo bol-studenten niveau 1/2 en 3/4, met bekende woonsituatie;
- hbo- en wo-studenten met bekende ouderinkomens;
- student met een of twee bekende ouders;
- standaardpeiljaar 2024 voor berekeningsjaar 2026;
- indicatieve vergelijking met alternatief peiljaar 2025 of 2026;
- signalering of inkomensdaling minimaal 15 procent lijkt;
- inschatting maand-/jaarvoordeel zolang geen special case speelt.

Typed `special-case` in eerste versie:

- ouder overleden;
- ouder onbekend;
- ouder in het buitenland of buitenlands inkomen;
- ouder buiten beschouwing laten;
- geen contact of ernstig conflict met ouder;
- scheiding met onduidelijke oudergegevens;
- ouders met DUO-studieschuld;
- broers/zussen met aanvullende beurs of andere schoolgaande kinderen;
- inkomen nog geschat;
- mbo-student zonder lesgeldplicht;
- mismatch tussen opleidingsniveau, leeftijd en recht op studiefinanciering.

Complexe situaties stoppen de flow niet automatisch. De scan toont wat wel bekend is, verlaagt confidence en eindigt met DUO-stappen.

## Officiele Regels En Bedragen

| Regel | Waarde 2026 | Type | Bron | Ingang/einde | Implementatie-impact |
|---|---:|---|---|---|---|
| Standaardpeiljaar aanvullende beurs 2026 | 2024 | Uitvoeringsbeleid | DUO Hoeveel is het / Inkomen ouders | 2026-01-01 t/m 2026-12-31 | Centrale mapping `calculationYear -> referenceYear` |
| Verlegging vanaf peiljaar 2024 | 2025 of 2026 | Uitvoeringsbeleid | DUO Inkomen ouders | 2026 | Alternatief jaar alleen uit allowlist |
| Vereiste inkomensdaling | minimaal 15% gezamenlijk inkomen | Uitvoeringsbeleid | DUO Inkomen ouders | 2026 | Test onder/op/boven drempel |
| Mbo max aanvullende beurs thuiswonend | EUR 438,08 p/m | Officieel bedrag | DUO Hoeveel is het | jan-jul 2026 volgens DUO-pagina | Bedragengine moet periodebewust zijn |
| Mbo max aanvullende beurs uitwonend | EUR 466,40 p/m | Officieel bedrag | DUO Hoeveel is het | jan-jul 2026 volgens DUO-pagina | Woonsituatie-input verplicht |
| Mbo lagere beurs zonder lesgeldplicht | EUR 125,92 lager p/m | Officieel bedrag | DUO Bedragen | 2026 | Special-case tot lesgeldperiode expliciet is gemodelleerd |
| Hbo/wo max aanvullende beurs | EUR 491,08 p/m | Officieel bedrag | DUO Hoeveel is het | jan-dec 2026 | Zelfde bedrag thuis/uitwonend voor dit onderdeel |
| Hbo/wo maximale beurs bij ouderinkomen samen lager dan | EUR 41.500,60 p/j | Officieel bedrag | DUO Hoeveel is het | 2026 | Grens voor maximale beurs, geen algemene eindgrens |
| Hbo/wo ouderbijdrage-afbouw | 13,6% | Officiele PDF-formulierlogica | DUO PDF hbo/universiteit 2026 | 2026 | Review vereist vóór publieke formule |
| Mbo ouderbijdrage-afbouw | 26% | Officiele PDF-formulierlogica | DUO PDF mbo 2026 | 2026 | Review vereist vóór publieke formule |
| Ouder DUO-schuld aftrekfactor | 363 p/j | Officiele PDF-formulierlogica | DUO PDF mbo en hbo/universiteit 2026 | 2026 | Alleen modelleren met volledige veldsemantiek |

Gift/prestatiebeurs:

- mbo niveau 1/2: aanvullende beurs is automatisch gift;
- mbo niveau 3/4, hbo en universiteit: aanvullende beurs valt onder prestatiebeurs en wordt gift bij diploma binnen 10 jaar.

## Peiljaarverlegging

DUO gebruikt voor aanvullende beurs in 2026 in beginsel ouderinkomen 2024. Als het peiljaar 2024 is, kan het volgens DUO worden verlegd naar 2025 of 2026. De voorwaarde voor mbo, hbo en universiteit is dat het gezamenlijk inkomen minimaal 15 procent is gedaald ten opzichte van het peiljaar.

Aanvrager: de ouders vragen verlegging peiljaar aan in Mijn DUO. De scan mag de student informeren en voorbereiden, maar niet doen alsof de student dit zelfstandig namens ouders kan regelen.

Inkomen nog onbekend: ouders kunnen een schatting doorgeven. Zodra DUO het definitieve inkomen van de Belastingdienst ontvangt, neemt DUO met terugwerkende kracht een nieuwe beslissing. Als het inkomen hoger blijkt dan geschat, kan terugbetaling ontstaan.

Niet verwarren met:

- peiljaarverlegging bij terugbetalen studieschuld;
- tegemoetkoming scholieren;
- andere DUO-regelingen met afwijkende aanvrager, drempel of doorwerking.

Testregels:

- `dropPercent = (standardJointIncome - alternativeJointIncome) / standardJointIncome * 100`;
- lager dan 15%: `referenceYearChangeLikelihood = unlikely`;
- exact 15% of hoger: `possible`, tenzij special-case;
- standaardpeiljaar gunstiger als alternatief inkomen hoger is of beurs lager uitvalt.

## Vraagmatrix

| Veld | Verplicht | Blocking | Afleidbaar | Waar vindt gebruiker dit? |
|---|---|---|---|---|
| `calculationYear` | ja | ja bij mismatch | default 2026 in MVP | Toolcontext |
| `educationType` | ja | ja | nee | Inschrijving/Mijn DUO |
| `educationLevel` | ja voor mbo | ja | soms uit opleidingstype | Schoolinschrijving |
| `studyStartDate` | ja voor startrecht | soms | nee | Mijn DUO / opleiding |
| `age` | ja voor mbo/jonger dan 18 | soms | uit geboortedatum | Identiteitsgegevens |
| `residence` | ja | ja voor mbo-bedrag | nee | BRP/adres en Mijn DUO |
| `tuitionDue` | ja voor mbo-bedrag | special-case als onbekend | nee | DUO/lesgeldbericht |
| `parent1ReferenceYearIncome` | ja | ja | nee | Aangifte 2024, aanslag, jaaropgave |
| `parent2ReferenceYearIncome` | situationeel | ja bij twee ouders | nee | Aangifte 2024, aanslag, jaaropgave |
| `parent1AlternativeYearIncome` | nee | nee | schatting toegestaan met waarschuwing | Jaaropgave/loonstrook/uitkering/ondernemersschatting |
| `parent2AlternativeYearIncome` | nee | nee | schatting toegestaan met waarschuwing | Idem |
| `alternativeReferenceYear` | nee | nee | voorstel 2025/2026 | DUO peiljaarverlegging |
| `siblings` | nee in MVP | non-blocking special-case | deels via aantal | Gezinssituatie ouders |
| `parentSpecialSituation` | nee | special-case | nee | DUO-situaties ouder onbekend/overleden/contactproblemen |

## Weet Ik Niet-Matrix

| Gegeven | Vervolgvragen | Conclusie veilig afleidbaar wanneer | Bevestiging nodig | Geen betrouwbare conclusie |
|---|---|---|---|---|
| Opleidingstype | Doe je mbo, hbo of universiteit? Welk mbo-niveau? | Alleen als opleiding en niveau expliciet gekozen zijn | Ja | Onbekend blijft `incomplete` |
| Woonsituatie | Woon je bij ouder(s) of uitwonend volgens DUO? | Niet uit adres alleen | Ja | Mbo-bedrag blijft bandbreedte |
| Ouderinkomen 2024 | Verzamelinkomen? Belastbaar loon? Schatting? | Niet veilig zonder ouderinput | Ja | Alleen aanvraagadvies |
| Huidig/alternatief inkomen | Jaaropgave, loonstrook, ontslag/pensioen/arbeidsongeschiktheid? | Alleen als ouders jaarschating bevestigen | Ja plus risicowaarschuwing | Peiljaarvoordeel niet tonen |
| Aantal ouders | Een ouder, twee ouders, overleden/onbekend/buiten beschouwing? | Alleen na expliciete keuze | Ja | `special-case` |
| Broers/zussen | Aantal, studerend, aanvullende beurs, schoolgaand? | Alleen na gezinsoverzicht | Ja | Bedrag kan te laag/hoog zijn |
| Ouder werkt niet mee | Is er geen contact, conflict of weigering? | Nee | Ja | Handmatige DUO-beoordeling |

## Resultaatcontract

Statussen:

- `eligible-estimate`
- `possibly-eligible`
- `ineligible`
- `incomplete`
- `special-case`
- `unavailable`

Bedragen:

- `estimatedMonthlyGrant`
- `estimatedAnnualGrant`
- `standardReferenceYearAmount`
- `alternativeReferenceYearAmount`
- `estimatedMonthlyBenefit`
- `estimatedAnnualBenefit`
- `extraBorrowingIfNoGrant`

Peiljaar:

- `standardReferenceYear`
- `alternativeReferenceYear`
- `incomeDropPerParent`
- `incomeDropPercent`
- `referenceYearChangeLikelihood`
- `referenceYearChangeReason`

Trace/uitleg:

- `decisiveInputs`
- `inferredInputs`
- `missingInputs`
- `reasonCodes`
- `calculationTrace`
- `confidence`
- `sourceReferences`
- `officialVerificationRequired`
- `studentNextSteps`
- `parentNextSteps`
- `officialApplicationUrl`

Confidence is kwaliteit van de Project Site-inschatting, geen kans op juridisch recht. Iedere bedragoutput moet later als typed estimate met bandbreedte worden teruggegeven.

## Gebruikersuitkomsten

- Maximale aanvullende beurs: ouderinkomen onder maximale-beursgrens en geen special cases.
- Gedeeltelijke aanvullende beurs: ouderbijdrage verlaagt maximum, maar bedrag blijft positief.
- Waarschijnlijk geen aanvullende beurs: berekende ouderbijdrage >= maximum, mits volledige formule gemodelleerd.
- Te weinig informatie: ontbrekend opleidingstype, ouderinkomen of peiljaar.
- Standaardpeiljaar waarschijnlijk gunstiger: alternatief inkomen is niet lager of leidt niet tot hoger bedrag.
- Later peiljaar waarschijnlijk gunstiger: 15%-daling gehaald en indicatief bedrag hoger.
- Inkomensdaling onvoldoende: daling <15%.
- Inkomen huidig jaar onzeker: schatting mogelijk, maar terugbetalingsrisico tonen.
- Ouder werkt niet mee: `special-case`, verwijs naar DUO.
- Ouder buiten beschouwing laten mogelijk: `special-case`, geen stille formule.
- Overleden ouder: `special-case`, aparte DUO-regel.
- Buitenlandse ouder: `special-case`, officiële beoordeling nodig.

## Testvectors

De machineleesbare dataset bevat minimaal:

- hbo/wo maximale aanvullende beurs bij ouderinkomen onder EUR 41.500,60;
- mbo uitwonend maximum;
- mbo zonder lesgeldplicht met EUR 125,92 verlaging;
- peiljaarverlegging met daling onder 15%;
- peiljaarverlegging exact op 15%;
- overleden ouder als special-case.

Aanvullende tests voor de Calculation Guardian:

- mbo thuiswonend en uitwonend;
- mbo 1/2 gift versus mbo 3/4 prestatiebeurs;
- hbo/wo thuiswonend en uitwonend;
- inkomen net onder/op/boven relevante grens;
- een ouder en twee ouders;
- meerdere broers/zussen;
- beide ouders gedaald versus een ouder gedaald;
- inkomen nog geschat;
- ouder buitenland, geen contact, ouder buiten beschouwing;
- incomplete invoer;
- `calculationYear` mismatch;
- determinisme en afronding.

## Samenhang Met Bestaande Tools

Later te delen input:

- opleidingstype, opleidingsniveau, startdatum en woonsituatie met `duo-schuld-bij-starten-lenen`;
- verwachte beurs per maand als verlaging van benodigd leenbedrag in `duo-leenbedrag-impact`;
- lagere toekomstige schuld naar `duo-maandbedrag` en `duo-extra-aflossen`;
- prestatiebeursstatus naar stoppen-met-studeren/prestatiebeurs-tool.

Geen automatische gegevensoverdracht zonder zichtbare toestemming. Geen persoonlijke ouderinkomens in URL, logs of analytics.

## Implementatieadvies

Volgende agent: `Financial Domain & Calculation Guardian`.

Werkvolgorde:

1. Normaliseer DUO PDF-formules volledig naar pure centrale functies in `src/lib/duo`.
2. Voeg typed input/result-modellen toe, gescheiden van React.
3. Gebruik uitsluitend `duo-additional-grant-rules-2026` als bron voor bedragen en peiljaarregels.
4. Test eerst deterministische voorbeelden en grenswaarden.
5. Laat UI/PDF later alleen het centrale resultcontract renderen.

Niet activeren voordat PDF-formules, broer-/zusfactoren, ouder-studieschuld, afronding en special cases volledig zijn getest.
