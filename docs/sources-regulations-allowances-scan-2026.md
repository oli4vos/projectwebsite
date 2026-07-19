# Bron- en regelspecificatie toeslagenscan 2026

Peildatum: 2026-07-19. Scope: zelfstandige toeslagenscan als signaleringsscan. Geen React-app, geen route, geen manifest, geen PDF, geen concrete toeslagbedragen en geen publieke activatie.

## 1. Repositorystatus

- Branch: `main`.
- Laatste commit voor werk: `2b3b10b fix(pdf): hide stale mortgage impact pdf`.
- Werkboom voor werk: alleen `ideetjes.txt` lokaal gewijzigd.
- Bewaarde gebruikerswijzigingen: `ideetjes.txt` niet gelezen voor edits, niet aangepast, niet gestaged.
- Bronarchitectuur: `src/lib/financial-constants` blijft SSOT; `allowance-signal-rules` is al gereserveerd als signal-only familie.

## 2. Bestaande allowances-laag

| Onderdeel | Bevinding |
|---|---|
| Centrale module | `src/lib/allowances/signaling.ts`. |
| Inputtype | `AllowanceSignalInput` met `year`, `age`, `hasAllowancePartner`, `assessmentIncome`, `assets`, `hasDutchHealthInsurance`, `housing`, `children`, `childcare`. |
| Datasettype | `AllowanceSignalDataset` bundelt nu alle vier toeslagen in een dataset: `healthcare`, `rent`, `childBudget`, `childcare`. |
| Statussen | `possible`, `probably-not`, `insufficient-information`, `official-calculation-recommended`. |
| Reason codes | O.a. `age-under-18`, `missing-income`, `missing-assets`, `missing-partner-status`, `no-dutch-health-insurance`, `income-above-hard-threshold`, `assets-above-hard-threshold`, `not-renting`, `not-independent-home`, `no-child-under-18`, `no-registered-childcare`, `missing-qualifying-activity`, `complex-rules-official-calculation`, `hard-conditions-pass`. |
| Tests | `src/lib/allowances/signaling.test.ts` dekt basispaden, maar gebruikt deels testwaarden die niet overeenkomen met 2026-bronnen. |
| Herbruikbaar | Statusmodel, resultmodel, officialCalculationUrl, freshness/sourceReferences-contract en signal-only benadering. |
| Aanpassing nodig | Reason codes specifieker maken per ontbrekend veld; partnerstatus niet versimpelen; huurtoeslag medebewoners/vermogen corrigeren; kindgebonden budget kinderbijslagstatus toevoegen; kinderopvang kind woont bij aanvrager, eigen bijdrage en opvangregistratie explicieter maken. |
| Ontbrekende datasets | Geen actieve `allowance-signal-rules`-dataset in `SOURCE_DATASET_REGISTRY`. |
| Overlap tax/profile | `src/lib/tax` bevat box 1/box 3 indicaties, maar is geen toeslagenengine. Gebruik niet om toeslagbedragen of toetsingsinkomen volledig te reconstrueren. |

## 3. Gemeenschappelijke begrippen

| Begrip | Definitie | Bron | Invoer | MVP-ondersteuning | Onzekerheden |
|---|---|---|---|---|---|
| Aanvrager | Persoon die toeslag aanvraagt via Mijn toeslagen. | Belastingdienst aanvragen: https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/aanvragen/ik-wil-een-toeslag-aanvragen | Leeftijd/woon- en gezinssituatie zonder naam of BSN. | Ja. | Buitenlandsituaties blijven complex. |
| Toeslagpartner | Persoon die meetelt voor toeslagen; inkomen en vermogen tellen mee; kan echtgenoot/geregistreerd partner zijn of iemand anders op hetzelfde adres; maximaal 1. | https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/toeslagpartner | Vraag niet "woon je samen?", maar "heb je volgens Dienst Toeslagen een toeslagpartner?" met link/disclosure. | Ja als zelfrapportage. | Partner voor deel van jaar en partner op ander adres kunnen verschillen per toeslag. |
| Medebewoner | Voor huurtoeslag: iedereen die op hetzelfde woonadres staat ingeschreven, behalve toeslagpartner. | https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/wie-telt-als-medebewoner | Aantal medebewoners en of hun inkomen/vermogen bekend is. | Beperkt. | Inkomen/vermogen medebewoners en uitzonderingen maken officiële berekening nodig. |
| Toetsingsinkomen | Inkomen voor toeslagen; voor huurtoeslag ook medebewonerinkomen. Studiefinanciering telt volgens zorgtoeslaguitleg niet mee. | https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/wat-is-mijn-toetsingsinkomen en zorgtoeslag inkomenspagina | Geschat jaarinkomen aanvrager, partner en bij huur eventueel medebewoners. | Ja als door gebruiker ingevulde schatting. | Precieze berekening blijft officieel hulpmiddel. |
| Gezamenlijk toetsingsinkomen | Toetsingsinkomen van aanvrager plus toeslagpartner; voor huurtoeslag kunnen medebewoners meetellen. | Belastingdienst toeslagpartner en toetsingsinkomen. | Partnerstatus, partnerinkomen, medebewonerinkomen conditioneel. | Ja voor signalering. | Deeljaarpartners/medebewoners. |
| Vermogen | Bezittingen minus schulden; telt op 1 januari van het toeslagjaar. | https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/hoe_werken_toeslagen/kan_ik_toeslag_krijgen/vermogen/vermogen | Vermogen op 1 januari; partnervermogen; bij huur medebewoners; minderjarig kindvermogen waar relevant. | Ja als globale grenscheck. | Bijzonder vermogen telt soms niet mee; groene beleggingen tellen voor toeslagen wel mee. |
| Peildatum vermogen | Voor vermogen wordt gekeken naar 1 januari van het kalenderjaar. | Kindgebonden budget vermogen en huurtoeslag vermogen. | Vermogen op 2026-01-01. | Ja. | Deeljaarpartner/medebewoner kan afwijken. |
| Leeftijd | Relevant voor zorgtoeslag 18+, huurtoeslag jongerenregels en kindleeftijd. | Belastingdienst zorgtoeslag, huurtoeslag 2026-wijzigingen, kindgebonden budgetvoorwaarden. | Leeftijd of geboortejaar; geen exacte geboortedatum nodig. | Ja. | Huurtoeslag jonger dan 18 kent uitzonderingen. |
| Nederlandse zorgverzekering | Voorwaarde voor zorgtoeslag. | https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/kan-ik-zorgtoeslag-krijgen | Ja/nee. | Ja. | Buitenland/verdragsverzekering buiten MVP. |
| Huurwoning | Huurtoeslag is voor huurhuis, niet koopwoning. | https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen | Huur/koop/anders. | Ja. | Onderhuur, woonboot, recreatiewoning, bijzondere woonvormen. |
| Zelfstandige woonruimte | Eigen afsluitbare toegang, keuken en wc; sinds 2024 ook eigen wasgelegenheid met douche of bad. | Huurtoeslag voorwaardenpagina. | Ja/nee/onbekend met disclosure. | Ja als zelfrapportage. | Sommige onzelfstandige woningen of woonvormen kennen uitzonderingen. |
| Kale huur | Vanaf 2026 telt Dienst Toeslagen voor huurtoeslag met kale huur; servicekosten tellen niet meer mee. | https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/huurtoeslag-verandert-vanaf-2026 | Kale huur per maand. | Ja als invoer, niet voor bedrag. | Subsidiabele huurhistoriek en uitzonderingen buiten MVP. |
| Kind | Voor kindgebonden budget: 1 of meer kinderen jonger dan 18. | Kindgebonden budget voorwaarden. | Aantal kinderen en leeftijden. | Ja. | Stief-, pleeg-, adoptie-, co-ouder- en buitenlandregels. |
| Kind ten laste/kinderbijslag | Kindgebonden budget hangt samen met kinderbijslag door SVB; ouder met kinderbijslag op naam heeft recht. | Kindgebonden budget voorwaarden. | Ontvang je kinderbijslag voor dit kind? ja/nee/onbekend. | Ja als signaleringsvraag. | 16/17-jarigen kennen uitzonderingen. |
| Geregistreerde kinderopvang | Kinderopvang moet in LRK staan en LRK-nummer hebben. | Kinderopvangtoeslag voorwaarden. | Ja/nee/onbekend; geen LRK-nummer opslaan in MVP. | Ja als harde uitsluiting bij nee. | Controle LRK zelf buiten MVP. |
| Opvanguren | Kinderopvangtoeslag kent max 230 uur per maand per kind. | Max-uurtarief/uurregels Belastingdienst. | Uren per maand per opvangsoort/kind. | Alleen waarschuwing/signaal. | Geen bedragberekening. |
| Kwalificerende activiteit | Aanvrager en partner werken, volgen opleiding, inburgering of traject naar werk. | Kinderopvangtoeslag voorwaarden. | Activiteit aanvrager en partner conditioneel. | Ja als globale ja/nee. | Erkende opleiding, traject, buitenland en ziekte/zwangerschap blijven complex. |

## 4. Zorgtoeslag

- Harde voorwaarden: 18 jaar of ouder; Nederlandse zorgverzekering; 2026 toetsingsinkomen maximaal EUR 40.857 zonder toeslagpartner en EUR 51.142 met toeslagpartner; vermogen op 2026-01-01 maximaal EUR 146.011 zonder partner en EUR 184.633 met partner.
- Benodigde invoer: leeftijd, toeslagpartnerstatus, toetsingsinkomen, vermogen op 1 januari, Nederlandse zorgverzekering.
- Mogelijk-rechtregels: alle harde voorwaarden bekend en niet uitgesloten.
- Waarschijnlijk-geen-rechtregels: `age-under-18`, `no-dutch-health-insurance`, `income-above-hard-threshold`, `assets-above-hard-threshold`.
- Onvoldoende informatie: ontbrekende leeftijd, partnerstatus, inkomen, vermogen of verzekering.
- Officiële berekening aanbevolen: altijd voor bedrag; ook bij buitenland, verblijfsstatus, bijzonder vermogen of twijfel over toetsingsinkomen.
- Officiële links: voorwaarden `https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/kan-ik-zorgtoeslag-krijgen`; inkomen `https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag`; proefberekening `https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen`; aanvraag via Mijn toeslagen.
- Geldigheidsjaar: 2026, effectiveFrom `2026-01-01`, effectiveTo `2026-12-31`, lastVerifiedAt `2026-07-19`, nextReviewAt uiterlijk `2026-11-15`.
- Buiten MVP: buitenland/verblijfsrecht, bijzonder vermogen, precieze toetsingsinkomenberekening, maandafhankelijke start na 18e verjaardag.

## 5. Huurtoeslag

- Harde voorwaarden: huurwoning; zelfstandige woonruimte; inkomen niet te hoog; vermogen niet te hoog; woningtype niet uitgesloten. In 2026 geen harde maximale huurgrens meer, maar berekening wordt gemaximeerd op EUR 932,93 en bij jongeren tot 21 jaar op EUR 498,20.
- Benodigde invoer: huur/koop, zelfstandige woonruimte, kale huur, leeftijd oudste bewoner, toeslagpartnerstatus, medebewoners, inkomen aanvrager/partner/medebewoners, vermogen aanvrager/partner/medebewoners, thuiswonend minderjarig kindvermogen.
- Mogelijk-rechtregels: in MVP liever `official-calculation-recommended` zodra harde uitsluitingen niet gelden, omdat inkomen/huren/huishouden te sterk samenhangen.
- Waarschijnlijk-geen-rechtregels: `not-renting`, `not-independent-home`, `assets-above-hard-threshold` wanneer vermogen boven officiele grens ligt; koopwoning hard uitsluiten.
- Onvoldoende informatie: ontbrekende huurstatus, zelfstandigheid, kale huur, leeftijd, partnerstatus, medebewoners, inkomen of vermogen.
- Officiële berekening aanbevolen: standaard na basischeck; zeker bij handicap/aangepaste woning, bijzondere woonvorm, buitenland, onzelfstandige woning met uitzondering, bijzonder inkomen, bijzonder vermogen of huishoudlid tijdelijk afwezig.
- Officiële links: voorwaarden `https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen`; 2026-wijzigingen `https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/huurtoeslag-verandert-vanaf-2026`; vermogen `https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/maximaal-vermogen-huurtoeslag`; medebewoner `https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/wie-telt-als-medebewoner`; proefberekening.
- Geldigheidsjaar: 2026, effectiveFrom `2026-01-01`, effectiveTo `2026-12-31`, lastVerifiedAt `2026-07-19`, nextReviewAt uiterlijk `2026-11-15`.
- Buiten MVP: bedrag, volledige inkomensafbouw, uitzonderingen voor aangepaste woningen, woonboten/recreatiewoningen, bijzondere onzelfstandige woningen, deeljaarbewoning.

## 6. Kindgebonden budget

- Harde voorwaarden: 1 of meer kinderen jonger dan 18; meestal kinderbijslag via SVB; inkomen niet te hoog afhankelijk van gezinssamenstelling; vermogen 2026 maximaal EUR 146.011 zonder toeslagpartner en EUR 184.633 met toeslagpartner; minderjarig kindvermogen telt mee.
- Benodigde invoer: kinderen/leeftijden, kinderbijslagstatus per kind of globaal, toeslagpartnerstatus, toetsingsinkomen, vermogen inclusief minderjarig kindvermogen, alleenstaande-ouderstatus afgeleid uit geen toeslagpartner.
- Mogelijk-rechtregels: kind onder 18 aanwezig, kinderbijslagstatus niet negatief, vermogen niet boven harde grens; geef status bij voorkeur `official-calculation-recommended` omdat inkomensgrens gezinssamenstellingafhankelijk is.
- Waarschijnlijk-geen-rechtregels: `no-child-under-18`; `assets-above-hard-threshold`; `no-child-benefit` alleen als gebruiker zeker aangeeft geen kinderbijslag/relevante kindvoorwaarde en geen 16/17-uitzondering.
- Onvoldoende informatie: ontbrekende kinderen/leeftijden, kinderbijslagstatus, partnerstatus, inkomen of vermogen.
- Officiële berekening aanbevolen: altijd voor definitieve beoordeling/bedrag; bij co-ouderschap, samengesteld gezin, stief-/pleeg-/adoptiekind, buitenland of 16/17-jarigen zonder gewone kinderbijslag.
- Officiële links: voorwaarden `https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kindgebonden-budget/voorwaarden/voorwaarden-kindgebonden-budget`; vermogen `https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-vermogen-kindgebonden-budget`; inkomen `https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-inkomen-kindgebonden-budget`; proefberekening.
- Geldigheidsjaar: 2026, effectiveFrom `2026-01-01`, effectiveTo `2026-12-31`, lastVerifiedAt `2026-07-19`, nextReviewAt uiterlijk `2026-11-15`.
- Buiten MVP: bedragen, inkomensafbouwtabel, SVB-detailregels, co-ouderschap, buitenland, samengestelde gezinnen.

## 7. Kinderopvangtoeslag

- Harde voorwaarden: kind en opvang; geregistreerde opvang in LRK met LRK-nummer; kind woont en staat ingeschreven op adres van aanvrager; aanvrager en toeslagpartner werken of volgen kwalificerende opleiding/inburgering/traject naar werk; aanvrager betaalt eigen bijdrage; aanvraag pas na geboorte en BSN; aanvraag uiterlijk binnen 3 maanden na start opvang voor volledige periode.
- Benodigde invoer: kinderen/leeftijden, opvang ja/nee, geregistreerde opvang ja/nee/onbekend, opvangsoort, uren per maand, activiteit aanvrager, partnerstatus, activiteit partner conditioneel, kind woont bij aanvrager, eigen bijdrage betaald ja/nee/onbekend.
- Mogelijk-rechtregels: MVP moet ook hier meestal `official-calculation-recommended` tonen nadat harde uitsluitingen niet gelden.
- Waarschijnlijk-geen-rechtregels: geen kinderen, geen opvang, opvang niet geregistreerd, kind woont niet bij aanvrager, geen kwalificerende activiteit bij aanvrager of partner, geen eigen bijdrage.
- Onvoldoende informatie: ontbrekende kindgegevens, opvangregistratie, uren, activiteit, partneractiviteit, woonadres/inschrijving, eigen bijdrage.
- Officiële berekening aanbevolen: standaard voor bedrag en bij opleiding/traject/inburgering, partner in buitenland, co-ouderschap, stief-/pleegkind, wisselende opvang, ziek/zwanger/werkloos.
- Officiële links: voorwaarden `https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/kan-ik-kinderopvangtoeslag-krijgen`; aanvraag `https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/hoe-moet-ik-kinderopvangtoeslag-aanvragen`; max uurtarief `https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/maximaal-uurtarief-voor-de-kinderopvang`; 2026-wijzigingen `https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen-2026/topics/veranderingen-toeslagen-2026`; proefberekening.
- Geldigheidsjaar: 2026, effectiveFrom `2026-01-01`, effectiveTo `2026-12-31`, lastVerifiedAt `2026-07-19`, nextReviewAt uiterlijk `2026-11-15`.
- Buiten MVP: bedrag, percentagevergoeding, uurtariefberekening, contractvalidatie, LRK-lookup, aanvraagtermijnberekening.

## 8. Beslismatrix

| Toeslag | Reason codes | Hard exclusions | Missing fields | Uncertainty codes | Statusselectie | Uitzonderingen |
|---|---|---|---|---|---|---|
| Zorgtoeslag | `age-under-18`, `no-dutch-health-insurance`, `income-above-hard-threshold`, `assets-above-hard-threshold`, `hard-conditions-pass` | Leeftijd < 18, geen Nederlandse zorgverzekering, inkomen/vermogen boven 2026-grens. | `age`, `hasAllowancePartner`, `assessmentIncome`, `assets`, `hasDutchHealthInsurance` | `foreign-or-residence-status`, `special-assets`, `assessment-income-uncertain` | `possible` alleen als harde voorwaarden slagen; bedrag altijd officieel. | Buitenland, verdragsverzekering, bijzonder vermogen. |
| Huurtoeslag | `not-renting`, `not-independent-home`, `assets-above-hard-threshold`, `complex-rules-official-calculation` | Koop/geen huur, niet-zelfstandige woonruimte zonder bekende uitzondering, vermogen boven grens. | `housing.tenure`, `housing.independentHome`, `housing.basicRent`, `age`, `hasAllowancePartner`, `householdMembers`, `assessmentIncome`, `assets` | `rent-income-table-not-implemented`, `special-housing`, `special-income`, `disabled-household-member` | Na harde checks meestal `official-calculation-recommended`, niet `possible` als inkomen/huren niet volledig genormaliseerd zijn. | Woonboot, recreatiewoning, aangepaste woning, bijzondere onzelfstandige woning. |
| Kindgebonden budget | `no-child-under-18`, `missing-child-benefit-status`, `no-child-benefit`, `assets-above-hard-threshold`, `complex-rules-official-calculation` | Geen kind < 18, vermogen boven grens, zeker geen kinderbijslag/relevante kindvoorwaarde. | `children`, `childAges`, `childBenefitStatus`, `hasAllowancePartner`, `assessmentIncome`, `assets` | `income-table-not-implemented`, `co-parenting`, `composite-family`, `foreign-child-or-parent` | Na harde checks `official-calculation-recommended`; `possible` pas na volledige inkomensregels. | 16/17-jarigen, co-ouderschap, stief/pleeg/adoptie, buitenland. |
| Kinderopvangtoeslag | `no-child-under-18`, `no-childcare`, `no-registered-childcare`, `child-not-living-with-applicant`, `missing-qualifying-activity`, `no-own-contribution`, `complex-rules-official-calculation` | Geen kind/opvang, opvang niet LRK-geregistreerd, kind woont niet bij aanvrager, geen kwalificerende activiteit, geen eigen bijdrage. | `children`, `childAges`, `childcare.registeredChildcare`, `childcare.hoursPerMonth`, `childcare.parentHasQualifyingActivity`, `childcare.partnerHasQualifyingActivity`, `childLivesWithApplicant`, `paysOwnContribution` | `childcare-amount-engine-not-implemented`, `education-recognition-uncertain`, `trajectory-uncertain`, `co-parenting` | Na harde checks altijd `official-calculation-recommended`. | Buitenland, co-ouderschap, wisselende opvang, opleiding/trajectdetails. |

## 9. Progressive disclosure

- Gemeenschappelijke startvragen: leeftijd of geboortejaar; toeslagpartner volgens Dienst Toeslagen ja/nee/onbekend; geschat toetsingsinkomen; vermogen op 1 januari; Nederlandse zorgverzekering; huur/koop/anders; kinderen ja/nee; kinderopvang ja/nee.
- Zorgvervolgvragen: alleen als leeftijd >= 18 of onbekend; Nederlandse zorgverzekering; partnerinkomen/vermogen als partner ja; link naar toetsingsinkomenhulp.
- Huurvervolgvragen: alleen bij huur; zelfstandige woonruimte; kale huur; oudste bewoner onder 21; aantal medebewoners; inkomen/vermogen medebewoners; bijzondere woning/handicap als waarschuwing.
- Kindvragen: alleen bij kinderen; aantal kinderen; leeftijden; kinderbijslagstatus; minderjarig kindvermogen; co-ouderschap/samengesteld gezin als complex-vlag.
- Kinderopvangvragen: alleen bij kinderen en opvang; geregistreerde opvang; opvanguren; opvangsoort; kind woont bij aanvrager; eigen bijdrage; activiteit aanvrager; partneractiviteit bij partner.
- Overgeslagen vragen: geen huurdetails bij koop; geen kinderopvangdetails zonder opvang; geen medebewoners buiten huurtoeslag; geen LRK-nummer, BSN, naam, adres of exacte geboortedatum.
- Flowrisico's: te vroeg "geen recht" bij ontbrekende info; partnerbegrip versimpelen; huurtoeslag 2026-huurgrens als harde uitsluiting behandelen; bedragen suggereren.

## 10. Resultaatcopy

- Mogelijk recht: "Op basis van je antwoorden kan deze toeslag relevant zijn. Controleer het bedrag en de definitieve voorwaarden met de officiële proefberekening."
- Waarschijnlijk geen recht: "Op basis van een harde voorwaarde lijkt deze toeslag niet van toepassing. Controleer bij twijfel de officiële informatie van Dienst Toeslagen."
- Onvoldoende informatie: "Er ontbreken gegevens om een betrouwbaar signaal te geven. Vul de ontbrekende gegevens aan of gebruik de officiële proefberekening."
- Officiële proefberekening: "Deze situatie bevat aanvullende regels of uitzonderingen. Gebruik de officiële proefberekening voor een betrouwbare beoordeling."
- Algemene hoofdboodschap: "Je hebt mogelijk recht op een toeslag die je nog niet ontvangt. Controleer dit met de officiële proefberekening."
- Disclaimers: "Deze scan geeft alleen een signaal en berekent geen toeslagbedragen. Je hebt pas zekerheid na controle via Dienst Toeslagen of een officiële beschikking."

## 11. Brondata

- Voorgestelde datasets: houd repositoryconventie aan en gebruik voor MVP eerst een gecombineerde family `allowance-signal-rules` met scenario `healthcare-rent-child-budget-childcare-2026`, omdat de bestaande `AllowanceSignalDataset` de vier secties bundelt. Splitsing per toeslag kan later pas nadat `SourceDatasetFamily` en selectiehelpers daarop zijn aangepast.
- Actief: pas registreren als 2026-waarden in tests zijn gecorrigeerd en alle harde reason codes zijn toegevoegd.
- Draft/incomplete: documenteer concept-id `allowance-signal-rules-2026`; niet `active` totdat missing fields, links en reason codes compleet zijn.
- Metadata: `year: 2026`, `version: 1.0.0`, `effectiveFrom: 2026-01-01`, `effectiveTo: 2026-12-31`, `retrievedAt/lastVerifiedAt: 2026-07-19`, `nextReviewAt: 2026-11-15`, `sourceName: Dienst Toeslagen / Belastingdienst`, `sourceType: official-execution`, `methodologyType: official-norm`, `usedBy: ["toeslagenscan"]`.
- Data: grenswaarden zorgtoeslag, huurtoeslag vermogen en huurcaps, kindgebonden budget vermogen, kinderopvang max uren/uurtariefcontext, officialCalculationUrl en per-toeslag informatie/aanvraaglinks.
- Freshness: jaarlijkse review uiterlijk 15 november; extra review bij Belastingdienst 2027-publicatie of tussentijdse wetswijziging.
- Build failures: actief jaar ontbreekt, verlopen active dataset, ongeldige URL, negatieve grens, ontbrekende officialCalculationUrl, datasetfamilie/scenario dubbel actief.
- Warnings: `nextReviewAt` nadert/verlopen, methodologie te kort, optionele bronlinks ontbreken, officiële pagina verplaatst.
- Source references: UI/resultaat moet per toeslag bronnaam, link, peildatum, jaar en "officiële proefberekening aanbevolen" tonen.

## 12. Privacy

- Gevoelige velden: inkomen, vermogen, partnerstatus, medebewoners, kinderen/leeftijden, kinderopvang, activiteit/werk/opleiding, zorgverzekering, huur.
- Opslag: standaard geen opslag; alleen optionele lokale opslag na expliciete keuze; geen autosave naar backend.
- URL: geen antwoorden, inkomens, vermogens, reason codes of scanstatus in querystring.
- Analytics: alleen generieke events zoals `scan_started`, `allowance_section_completed`, `scan_completed`; geen antwoorden, bedragen, reason codes of toeslagstatussen.
- Logging: geen persoonlijke invoer; foutlogs zonder formulierdata.
- Backend: niet nodig voor MVP; Type A/static tool.
- PDF: niet in MVP; later alleen lokaal en met dezelfde resultdata, geen herberekening.
- Openstaande punten: privacycopy, opt-in opslagcopy, analytics eventnamen door DevOps/Security controleren.

## 13. Testspecificatie

- Unit: ontbrekende leeftijd/partner/inkomen/vermogen; statusselectie; stable reason codes; geen bedragen; officiële links aanwezig; 2026-grenzen exact.
- Integratie: datasetselectie via `getActiveDataset("allowance-signal-rules")`; freshness/sourceReferences naar resultmodel; geen overlap met `src/lib/tax` voor toeslagbedragen.
- End-to-end: toekomstige app toont alleen relevante vervolgvragen, links naar proefberekening, geen bedrag en geen hard negatief signaal bij ontbrekende info.
- Dataset/freshness: verlopen dataset blokkeert activatie; future dataset niet vóór effectiveFrom; missing official link faalt; stale geeft warning of activatieblokkade volgens releasebeleid.
- Accessibility: labels zichtbaar, disclosures toetsenbordbedienbaar, foutmeldingen per veld, geen horizontale scroll op 390 px.
- Privacy: geen URL-state met antwoorden; geen storage zonder opt-in; analytics zonder values/status/reason codes.

## 14. Implementatiepakket

- Controleer rekenlogica: pas `AllowanceSignalInput`, `AllowanceSignalReasonCode` en beslisfuncties aan; corrigeer 2026-testwaarden; voeg kinderbijslag, kind woont bij aanvrager, eigen bijdrage en medebewonergrenzen toe; registreer dataset pas na tests.
- Add feature integrator guide: bouw later `apps/toeslagenscan` als hidden-draft; gebruik centrale allowances-laag; geen bedragen; progressive disclosure; officiële links; statuscopy uit dit document.
- Update form- en PDF-regels: vraagvolgorde, disclosures voor toeslagpartner/toetsingsinkomen/vermogen/zelfstandige woonruimte; PDF niet verplicht in MVP.
- Update DevOps- en securitychecks: local-only, geen backend, geen externe API, geen persoonsgegevens in analytics/logging, geen URL-antwoorden, externe links zonder trackingparameters.

## 15. Niet veilig implementeerbare punten

- Ontbrekende bronnen: geen volledige officiële tabellen voor alle bedragberekeningen in centrale dataset; geen LRK-lookup in repo.
- Complexe uitzonderingen: buitenland, verblijfsstatus, co-ouderschap, samengestelde gezinnen, stief/pleeg/adoptiekinderen, bijzondere woningen, bijzondere inkomens/vermogens.
- Onvolledige regels: huurtoeslag inkomensafbouw, kindgebonden budget inkomensafbouw, kinderopvang vergoedingstabellen en aanvraagtermijnen.
- Productbeslissingen: of resultaatstatus na harde checks `possible` of `official-calculation-recommended` moet zijn per toeslag; advies hier is terughoudend.
- Handmatige verificatie: officiële links en 2027-grenzen vóór activatie opnieuw controleren.

## 16. Git

- Gewijzigde documenten: `docs/sources-regulations-allowances-scan-2026.md`.
- Commit: `docs(sources): specify allowances scan rules`.
- Commit-hash: zie oplevering of `git log -1 --oneline`.
- Gepusht: zie oplevering.
- Branch: `main`.

## 17. Aanbevolen volgende agent

Exacte chatnaam: `Controleer rekenlogica`.

Doel:

- centrale allowances-signaleringslaag aanpassen en vullen;
- officiële regels en reason codes implementeren;
- dataset `allowance-signal-rules-2026` pas actief registreren wanneer compleet;
- tests toevoegen;
- nog geen UI of publieke app bouwen.

Binnen scope:

- `src/lib/allowances/signaling.ts`;
- `src/lib/allowances/signaling.test.ts`;
- `src/lib/financial-constants/types.ts` en `source-datasets.ts` alleen indien nodig voor de dataset;
- `docs/source-data-overview.md` alleen regenereren als dataset werkelijk geregistreerd wordt.

Buiten scope:

- geen React-app;
- geen manifest;
- geen publieke activatie;
- geen toeslagbedragenengine;
- geen backend;
- geen PDF.

Benodigde commit en documentatie:

- commit bij voorkeur `feat(domain): complete allowance signaling rules`;
- update source overview alleen bij geregistreerde dataset;
- verwijs naar dit document in de overdracht.

## 18. Samenvatting voor de centrale projectchat

Sources & Regulations heeft de bron- en beslisspecificatie voor een zelfstandige toeslagenscan 2026 opgesteld. De scan blijft signal-only: statussen zijn mogelijk recht, waarschijnlijk geen recht, onvoldoende informatie en officiële proefberekening aanbevolen. Er worden geen concrete toeslagbedragen berekend.

De bestaande `src/lib/allowances/signaling.ts` is bruikbaar als basis, maar moet vóór publieke activatie worden aangescherpt: 2026-testwaarden corrigeren, reason codes specifieker maken, kinderbijslagstatus toevoegen, kinderopvangvoorwaarden uitbreiden met kind woont bij aanvrager/eigen bijdrage, en huurtoeslag terughoudender behandelen vanwege 2026-wijzigingen en huishoudcomplexiteit.

Primaire bronnen zijn Dienst Toeslagen/Belastingdienst-pagina's voor zorgtoeslag, huurtoeslag, kindgebonden budget, kinderopvangtoeslag, toetsingsinkomen, toeslagpartner, vermogen en de officiële proefberekening. Zorgtoeslag heeft de meest harde MVP-checks. Huurtoeslag, kindgebonden budget en kinderopvangtoeslag moeten na basisuitsluitingen meestal naar de officiële proefberekening verwijzen.

Advies: laat de volgende agent `Controleer rekenlogica` de centrale allowances-laag en tests aanpassen en pas daarna een `allowance-signal-rules-2026` dataset registreren. Daarna kan `Add feature integrator guide` een hidden-draft app bouwen met progressive disclosure, officiële links, privacy-first local-only gedrag en geen bedragen.
