# Toeslagenscan Integratiegids Huurtoeslag en Kindgebonden Budget

Datum: 2026-07-21.

Scope: deze gids beschrijft hoe `calculateRentBenefit2026` en `calculateChildBudget2026` veilig op de publieke Toeslagenscan worden aangesloten. De gids activeert geen publieke bedragweergave, wijzigt geen UI en voegt geen berekeningen toe.

## 1. Huidige Architectuur

### Publieke componenten

De publieke tool staat in `apps/toeslagen-scan`.

| Bestand | Rol |
|---|---|
| `app.json` | Manifest voor publieke registratie van de Toeslagenscan. |
| `Calculator.tsx` | Clientcomponent met formulier, progressive disclosure, voortgang, resultaatkaarten en volgende stappen. |
| `logic.ts` | Formuliervalidatie, mapping naar centrale scan-input, result-viewmodel, question-flow-view en rapportdata. |
| `types.ts` | UI-state, viewmodels, resultstatussen en question-flow-viewtypes. |
| `copy.ts` | Nederlandse labels voor statussen, reason codes, missing fields en onzekerheden. |
| `logic.test.ts` | Regressietests voor mapping, vraagflow, resultaatvolgorde en huidige publieke bedragondersteuning. |

### Huidige lokale state

`AllowanceScanFormState` bevat nu platte string- en keuzevelden:

| Domein | State-keys |
|---|---|
| Algemeen | `age`, `partnerStatus`, `assessmentIncome`, `jointAssessmentIncome`, `assets`, `jointAssets`, `complexSituation`, `foreignOrResidenceSituation`, `specialAssets`, `partYearPartner` |
| Zorgtoeslag | `hasDutchHealthInsurance` |
| Huurtoeslag | `tenure`, `independentHome`, `basicRent`, `hasCoResidents`, `householdIncome`, `householdAssets`, `complexHousing`, `adaptedHomeOrDisability`, `uncertainSubsidiableRent` |
| Kindgebonden budget | `hasChildren`, `childCount`, `childAges`, `receivesChildBenefit`, `childLivesWithApplicant`, `complexFamily` |
| Kinderopvangtoeslag | `usesChildcare`, `registeredChildcare`, `paysOwnContribution`, `childcareHoursPerMonth`, `applicantActivity`, `partnerActivity`, `complexChildcare` |

`Calculator.tsx` houdt deze state alleen lokaal via `useSubmittedCalculation`. Er worden geen bedragen naar de URL geschreven.

### Huidige logica

`logic.ts` doet drie dingen:

1. `validateAllowanceScanForm` controleert technische invoerfouten zoals ongeldige getallen, negatieve bedragen en leeftijd buiten 0-120.
2. `mapFormToAllowanceScanInput` vertaalt UI-state naar `AllowanceScanInput` uit `src/lib/allowances/signaling`.
3. `createAllowanceScanView` roept `calculateOfficialAllowanceScan2026` aan en vertaalt centrale resultaten naar publieke kaarten.

Daarnaast bouwt `createAllowanceQuestionFlowView` de voortgang via `buildQuestionFlow` en `evaluateAllowanceRegulations`. Die voortgang stuurt momenteel alleen de voortgangsweergave, niet de publieke bedragberekening.

### Huidige output

De volgorde van resultaatkaarten is vast:

1. zorgtoeslag;
2. huurtoeslag;
3. kindgebonden budget;
4. kinderopvangtoeslag.

Zorgtoeslag kan nu een bedrag tonen via `calculateOfficialAllowanceScan2026`. Huurtoeslag, kindgebonden budget en kinderopvangtoeslag tonen signalering, reason codes, ontbrekende gegevens, onzekerheden en bronlinks. Zij tonen nog geen publiek bedrag in de scan.

### Bestaande brondata

De centrale brondata voor de nieuwe bedragengines staat in `src/lib/financial-constants/allowance-calculation-rules-2026`. De engines gebruiken dataset-id `allowance-calculation-rules-2026`.

De berekeningsregels en bronstatus zijn beschreven in `docs/allowances-official-calculation-rules-2026.md`.

### Bestaande PDF-koppeling

De Toeslagenscan bouwt in `logic.ts` een `AllowanceAdvisorReportModel` met dezelfde centrale resultaten als het scherm. De huidige publieke `Calculator.tsx` toont geen PDF-knop. Een latere PDF-integratie moet dit bestaande reportmodel gebruiken en mag niet opnieuw rekenen.

### Status per toeslag

| Toeslag | Huidige publieke status | Centrale engine-status |
|---|---|---|
| Zorgtoeslag | Publieke indicatie met bedrag. | Via `calculateOfficialAllowanceScan2026`. |
| Huurtoeslag | Publieke signalering zonder bedrag. | `calculateRentBenefit2026` is beschikbaar voor standaard 2026-jaarscenario's. |
| Kindgebonden budget | Publieke signalering zonder bedrag. | `calculateChildBudget2026` is beschikbaar voor standaard 2026-jaarscenario's. |
| Kinderopvangtoeslag | Publieke signalering zonder bedrag. | Alleen helpers in `childcare-helpers.ts`; nog geen totaalengine. |

### Tijdelijk behouden en later verwijderen

Tijdelijk behouden:

- de bestaande `AllowanceScanFormState`;
- de bestaande signalingkaart voor huurtoeslag en kindgebonden budget zolang de nieuwe adapters niet publiek actief zijn;
- `calculateOfficialAllowanceScan2026` als centrale scan-entrypoint voor zorgtoeslag en bestaande kaartopbouw;
- huidige reason-codecopy voor bestaande signalen.

Bij implementatie verwijderen of vervangen:

- publieke huurtoeslagstatus `unavailable` wanneer `calculateRentBenefit2026` succesvol een concreet resultaat geeft;
- publieke KGB-status `unavailable` wanneer `calculateChildBudget2026` succesvol een concreet resultaat geeft;
- onzekerheidscopy `rent-income-table-not-implemented` en `income-table-not-implemented` uit actieve huur/KGB-uitkomsten zodra de engines via de adapter leidend zijn;
- tests die expliciet verwachten dat huurtoeslag en KGB geen bedrag tonen.

## 2. Canoniek Invoermodel

Gebruik een centraal typed model voor de publieke scanadapter. Plaats dit bij implementatie in `apps/toeslagen-scan/logic.ts` als het alleen app-adapter is, of in `src/lib/allowances/scan-integration.ts` wanneer meerdere callers het nodig hebben. Zet het niet in React.

```ts
export type PublicAllowanceScanInput = {
  calculationYear: 2026;
  calculationPeriod: {
    kind: "full-year" | "partial-year";
    months?: readonly number[];
  };
  household: {
    hasPartner: boolean;
    partnerStatusKnown: boolean;
    coResidents: readonly PublicAllowanceHouseholdMember[];
  };
  applicant: {
    age: number;
    assessmentIncome: number;
    assets: number;
    hasDutchHealthInsurance?: boolean;
    hasAowAge?: boolean;
  };
  partner?: {
    age?: number;
    assessmentIncome?: number;
    assets: number;
    hasAowAge?: boolean;
  };
  children: readonly PublicAllowanceChild[];
  householdIncome?: number;
  assets: {
    applicant: number;
    partner?: number;
    coResidents: readonly { memberId: string; assets: number }[];
  };
  residence: {
    tenure: "rent" | "owner" | "other";
    residenceCountry: "NL" | "other";
  };
  rent?: {
    isIndependentHome: boolean;
    basicRent: number;
    serviceCosts?: number;
    specialSituations: readonly PublicRentSpecialSituation[];
  };
  childcare: {
    usesChildcare: boolean;
    contracts: readonly PublicChildcareContract[];
    applicantHasQualifyingActivity?: boolean;
    partnerHasQualifyingActivity?: boolean | "not-applicable";
  };
  unsupportedSituations: readonly PublicAllowanceUnsupportedSituation[];
};
```

Aanvullende types:

```ts
export type PublicAllowanceHouseholdMember = {
  id: string;
  age: number;
  income?: number;
  assets: number;
  isChildOfApplicantOrPartner?: boolean;
  excludedAsSubtenant?: boolean;
};

export type PublicAllowanceChild = {
  id: string;
  age: number;
  birthDate?: string;
  receivesChildBenefitOrMeetsMaintenanceCondition: boolean;
  livesWithApplicant: boolean;
  coParenting?: boolean;
  compositeFamily?: boolean;
};

export type PublicChildcareContract = {
  childId: string;
  careType: "daycare" | "after-school" | "childminder";
  hoursPerMonth: number;
  hourlyRate: number;
  isLrkRegistered: boolean;
  paysOwnContribution: boolean;
  period: { kind: "full-year" | "partial-year"; months?: readonly number[] };
};

export type PublicRentSpecialSituation =
  | "special-housing-situation"
  | "partial-year"
  | "moving-household"
  | "subtenant";

export type PublicAllowanceUnsupportedSituation =
  | "foreign-residence-factor"
  | "co-parenting"
  | "composite-family"
  | "partial-year"
  | "manual-review-required";
```

### Zorgtoeslag

Behoud de bestaande zorgtoeslaginvoer:

- `age`;
- `partnerStatus`;
- `assessmentIncome`;
- `jointAssessmentIncome` wanneer partner;
- `assets`;
- `jointAssets` wanneer partner;
- `hasDutchHealthInsurance`;
- algemene uitzonderingsvelden.

De zorgtoeslagroute blijft via `calculateOfficialAllowanceScan2026` totdat er een aparte zorgtoeslagengine komt. De nieuwe huur/KGB-adapters mogen deze uitkomst niet veranderen.

### Huurtoeslag

Map naar `RentBenefitInput`:

- `calculationYear` uit vaste scancontext 2026;
- leeftijd aanvrager uit `applicant.age`;
- partnerstatus naar `hasPartner`;
- partnerleeftijd naar `partnerAge` zodra UI dit vraagt;
- medebewoners naar `coResidents`;
- AOW-status blijft voorlopig alleen reportingcontext, tenzij de centrale engine later onderscheid vereist;
- kale huur naar `basicRent`;
- servicekosten naar `serviceCosts`, met expliciete uitleg dat de 2026-engine servicekosten negeert;
- zelfstandige woonruimte naar `isIndependentHome`;
- huishoudinkomen naar `householdIncome`, of uitsplitsing naar applicant/partner/co-resident incomes;
- vermogen per relevant persoon naar `applicantAssets`, `partnerAssets`, `coResidents[].assets`;
- bijzondere woonvorm naar `specialSituations`;
- volledig jaar of deeljaar naar `specialSituations: ["partial-year"]` zolang tijdvaklogica niet ondersteund is.

### Kindgebonden budget

Map naar `ChildBudgetInput`:

- `calculationYear`;
- `hasPartner`;
- `assessmentIncome`, bij partner als gezamenlijk toetsingsinkomen;
- `applicantAssets`;
- `partnerAssets`;
- `children[]` met leeftijd en recht op kinderbijslag of onderhoudsvoorwaarde;
- `residenceCountry`;
- `specialSituations` voor buitenlandse woonlandfactor, co-ouderschap, samengesteld gezin, deeljaar en leeftijdswijziging gedurende het jaar.

### Kinderopvangtoeslag

Ontwerp alleen de toekomstige structuur. Gebruik deze velden nog niet publiek voor bedrag:

- `childId`;
- opvangcontract;
- opvangsoort;
- aantal uren;
- uurtarief;
- LRK-status;
- eigen bijdrage;
- rechtgevende activiteit aanvrager;
- rechtgevende activiteit partner;
- periode;
- meerdere contracten.

Zolang er geen volledige totaalengine is, blijft kinderopvangtoeslag bij signalering en blockers.

## 3. Mappingtabellen

### Algemene huishoudgegevens

| Huidig veld | State-key | Doeltype | Doelveld | Transformatie | Validatie | Default toegestaan | Blocker bij ontbrekend | Uitleg voor gebruiker |
|---|---|---|---|---|---|---|---|---|
| Leeftijd | `age` | `number` | `applicant.age`, `RentBenefitInput.applicantAge` | integer parse | 0-120, verplicht voor bedrag | Nee | Ja | Leeftijd bepaalt leeftijdsgrenzen en huurtoeslagregels. |
| Toeslagpartner | `partnerStatus` | `boolean` plus known flag | `household.hasPartner`, `RentBenefitInput.hasPartner`, `ChildBudgetInput.hasPartner` | `yes` true, `no` false, `unknown` unresolved | verplicht voor bedrag | Nee | Ja | Partnerstatus bepaalt inkomens- en vermogensgrenzen. |
| Geschat toetsingsinkomen | `assessmentIncome` | `number` | `applicant.assessmentIncome`, `ChildBudgetInput.assessmentIncome` zonder partner | parse money | >= 0, verplicht | Nee | Ja | Gebruik het verwachte toetsingsinkomen van het kalenderjaar. |
| Gezamenlijk toetsingsinkomen | `jointAssessmentIncome` | `number` | `householdIncome`, `ChildBudgetInput.assessmentIncome` met partner | parse money wanneer partner | >= 0, verplicht bij partner | Nee | Ja | Bij partner gebruikt de engine het gezamenlijke toetsingsinkomen. |
| Vermogen aanvrager | `assets` | `number` | `applicant.assets`, `RentBenefitInput.applicantAssets`, `ChildBudgetInput.applicantAssets` | parse money | >= 0, verplicht | Nee | Ja | Vermogen op 1 januari kan recht blokkeren. |
| Gezamenlijk vermogen | `jointAssets` | split of totaal | `partner.assets` of tijdelijke totaalbron | parse money wanneer partner | >= 0, verplicht bij partner | Nee | Ja | Voor bedragintegratie is partnervermogen apart nodig of aantoonbaar als gezamenlijke grensinput. |
| Complexe situatie | `complexSituation` | reason flag | `unsupportedSituations` | `yes` naar manual review | geen bedrag bij `yes` | Nee | Ja bij `yes` | Uitzonderingen vragen officiele controle. |
| Buitenland/verblijf | `foreignOrResidenceSituation` | reason flag | `residence.residenceCountry`, `unsupportedSituations` | `yes` naar unsupported | geen bedrag bij `yes` | Nee | Ja bij `yes` | Buitenland kan woonlandfactor of recht veranderen. |
| Bijzonder vermogen | `specialAssets` | reason flag | `unsupportedSituations` | `yes` naar manual review | geen bedrag bij `yes` | Nee | Ja bij `yes` | Bijzonder vermogen kan anders meetellen. |
| Deeljaar partner | `partYearPartner` | reason flag | `calculationPeriod`, `unsupportedSituations` | `yes` naar partial-year | geen bedrag bij `yes` | Nee | Ja bij `yes` | Deeljaar vraagt tijdvaklogica. |

### Huurtoeslag

| Huidig veld | State-key | Doeltype | Doelveld in centrale engine-input | Transformatie | Validatie | Default toegestaan | Blocker bij ontbrekend | Uitleg voor gebruiker |
|---|---|---|---|---|---|---|---|---|
| Woonsituatie | `tenure` | enum | adapter guard voor `RentBenefitInput` | alleen `rent` rekent | verplicht | Nee | Ja | Huurtoeslag is alleen relevant bij huur. |
| Zelfstandige woonruimte | `independentHome` | boolean | `isIndependentHome` | yes/no naar boolean | verplicht bij huur | Nee | Ja | De engine blokkeert onzelfstandige woonruimte als unsupported. |
| Kale huur | `basicRent` | number | `basicRent` | parse money | >= 0, verplicht bij huur | Nee | Ja | Gebruik kale huur zonder servicekosten. |
| Servicekosten | nieuw | number | `serviceCosts` | parse money | >= 0, optioneel | Ja, undefined | Nee | Servicekosten worden in 2026 niet in rekenhuur meegenomen; toon waarschuwing bij invulling. |
| Medebewoners | `hasCoResidents` | boolean | `coResidents` | bij nee lege array | verplicht bij huur | Nee | Ja | Medebewoners kunnen inkomen en vermogen laten meetellen. |
| Huishoudinkomen | `householdIncome` | number | `householdIncome` | parse money | >= 0, verplicht zolang inkomens niet per persoon worden gevraagd | Nee | Ja | Totaal inkomen voor huurtoeslaghuishouden. |
| Huishoudvermogen | `householdAssets` | number | verdelen naar co-resident assets of blocker | parse money | >= 0 | Nee | Ja als medebewoners | De nieuwe engine heeft vermogen per persoon nodig; totaal is onvoldoende voor de medebewonersgrens. |
| Partnerleeftijd | nieuw | number | `partnerAge` | integer parse | 0-120 bij partner | Nee | Ja bij partner en huur | Nodig voor jongerenhuishouden onder 21. |
| Medebewonerleeftijden | nieuw | number[] | `coResidents[].age` | lijst parse | 0-120 | Nee | Ja bij medebewoners | Nodig voor jongerenhuishouden en kindvrijstelling. |
| Medebewonerinkomens | nieuw | number[] | `coResidents[].income` | lijst parse of per persoon | >= 0 | Nee | Ja wanneer `householdIncome` niet wordt gebruikt | Nodig voor kindvrijstelling onder 23 als de tool per persoon rekent. |
| Medebewonervermogen | nieuw | number[] | `coResidents[].assets` | lijst parse of per persoon | >= 0 | Nee | Ja bij medebewoners | Per medebewoner geldt een eigen vermogensgrens. |
| Kind van aanvrager/partner | nieuw | boolean[] | `coResidents[].isChildOfApplicantOrPartner` | yes/no per relevante medebewoner | verplicht voor kindvrijstelling | Nee | Ja bij medebewoners onder 23 | Bepaalt of inkomensvrijstelling geldt. |
| Onderhuurder | nieuw | boolean[] | `coResidents[].excludedAsSubtenant` | yes/no | optioneel, default false na expliciete vraag | Nee | Ja bij onzekerheid | Onderhuurders kunnen buiten huishouden vallen. |
| Bijzondere woonvorm | `complexHousing` | special situation | `specialSituations` | `yes` naar `special-housing-situation` | geen bedrag | Nee | Ja bij `yes` | Bijzondere woonvormen vragen handmatige beoordeling. |
| Aangepaste woning/beperking | `adaptedHomeOrDisability` | exception flag | `hasChildOrDisabilityExceptionWhenUnder21` of unsupported | alleen gebruiken als leeftijdsregel relevant is | geen impliciete default | Nee | Ja als nodig | Kan jongerenhuurgrens beinvloeden. |
| Twijfel huur/servicekosten | `uncertainSubsidiableRent` | warning/blocker | reason code | `yes` blokkeert bedrag | Nee | Ja bij `yes` | De tool moet voorkomen dat servicekosten als kale huur meetellen. |
| Deeljaar | nieuw of `partYearPartner` | special situation | `specialSituations` | `partial-year` | geen bedrag | Nee | Ja bij deeljaar | De engine ondersteunt standaard volledig jaar. |

### Kindgebonden budget

| Huidig veld | State-key | Doeltype | Doelveld in centrale engine-input | Transformatie | Validatie | Default toegestaan | Blocker bij ontbrekend | Uitleg voor gebruiker |
|---|---|---|---|---|---|---|---|---|
| Kinderen | `hasChildren` | boolean | adapter guard | yes/no naar boolean | verplicht | Nee | Ja | Zonder kinderen geen KGB. |
| Aantal kinderen | `childCount` | number | controle op `children.length` | integer parse | >= 0 | Nee | Ja bij kinderen | Moet aansluiten op ingevulde leeftijden. |
| Leeftijden kinderen | `childAges` | `ChildBudgetChildInput[]` | `children[].age` | comma-separated naar array | integer 0-30; voor engine < 18 relevant | Nee | Ja bij kinderen | Leeftijd bepaalt recht en leeftijdsverhoging. |
| Kinderbijslag/onderhoud | `receivesChildBenefit` | boolean | `children[].receivesChildBenefitOrMeetsMaintenanceCondition` | huidige algemene waarde toepassen op alle kinderen tot per-kind vraag bestaat | verplicht | Nee | Ja | Nodig voor rechtgevend kind. |
| Kind woont bij jou | `childLivesWithApplicant` | boolean/special | special guard | `partial` naar `co-parenting` unsupported | verplicht | Nee | Ja | Niet-inwonend of co-ouderschap kan recht veranderen. |
| Complex gezin | `complexFamily` | special situation | `specialSituations` | `yes` naar `composite-family` of manual review | geen bedrag | Nee | Ja bij `yes` | Samengestelde gezinnen vragen officiele controle. |
| Partnerstatus | `partnerStatus` | boolean | `hasPartner` | yes/no | verplicht | Nee | Ja | Bepaalt tabel en alleenstaande-ouderbedrag. |
| Toetsingsinkomen | `assessmentIncome`/`jointAssessmentIncome` | number | `assessmentIncome` | zonder partner individueel, met partner gezamenlijk | >= 0, verplicht | Nee | Ja | Bepaalt afbouw. |
| Vermogen aanvrager | `assets` | number | `applicantAssets` | parse money | >= 0, verplicht | Nee | Ja | Vermogenstoets. |
| Vermogen partner | `jointAssets` of nieuw `partnerAssets` | number | `partnerAssets` | bij huidig gezamenlijk vermogen eerst splitsing vragen of als totaal behandelen met expliciete adapterregel | >= 0 bij partner | Nee | Ja | Engine verwacht partnervermogen naast aanvragervermogen. |
| Woonland | nieuw | enum | `residenceCountry` | default alleen na expliciete NL-vraag | verplicht | Nee | Ja | Alleen Nederland is bedrag-ready; anders unsupported. |
| Co-ouderschap | `childLivesWithApplicant=partial` | special situation | `specialSituations` | naar `co-parenting` | geen bedrag | Nee | Ja | Centrale engine blokkeert dit. |
| Deeljaar | nieuw | special situation | `specialSituations` | naar `partial-year` | geen bedrag | Nee | Ja | Deeljaar is unsupported. |
| Leeftijd wijzigt in jaar | nieuw | special situation | `specialSituations` | naar `age-change-during-year` | geen bedrag | Nee | Ja | Geboortedatum of maandlogica nodig voor exacte jaarstatus. |

### Kinderopvangtoeslag

| Huidig veld | State-key | Doeltype | Doelveld toekomstig | Transformatie | Validatie | Default toegestaan | Blocker bij ontbrekend | Uitleg voor gebruiker |
|---|---|---|---|---|---|---|---|---|
| Betaalde opvang | `usesChildcare` | boolean | `childcare.usesChildcare` | yes/no | verplicht voor signalering | Nee | Ja | Zonder opvang geen kinderopvangtoeslag. |
| LRK-registratie | `registeredChildcare` | boolean | `contracts[].isLrkRegistered` | huidige algemene waarde toepassen tot contracten bestaan | verplicht | Nee | Ja | Alleen geregistreerde opvang telt. |
| Eigen bijdrage | `paysOwnContribution` | boolean | `contracts[].paysOwnContribution` | yes/no | verplicht | Nee | Ja | Eigen bijdrage is harde voorwaarde. |
| Uren per maand | `childcareHoursPerMonth` | number | `contracts[].hoursPerMonth` | parse money | >= 0 | Nee | Ja | Nodig voor kostenbasis. |
| Opvangsoort | nieuw | enum | `contracts[].careType` | select | verplicht voor bedrag | Nee | Ja | Maximumuurtarief verschilt per opvangsoort. |
| Uurtarief | nieuw | number | `contracts[].hourlyRate` | parse money | >= 0 | Nee | Ja | Nodig voor subsidiabele kosten. |
| Contract per kind | nieuw | relation | `contracts[].childId` | select kind | verplicht | Nee | Ja | Meerdere contracten moeten per kind worden gekoppeld. |
| Activiteit aanvrager | `applicantActivity` | boolean | `applicantHasQualifyingActivity` | work/study/trajectory true, none false | verplicht | Nee | Ja | Rechtgevende activiteit is harde voorwaarde. |
| Activiteit partner | `partnerActivity` | boolean/not-applicable | `partnerHasQualifyingActivity` | niet van toepassing zonder partner | verplicht bij partner | Nee | Ja | Partner moet ook kwalificeren. |
| Complexe opvang | `complexChildcare` | special flag | unsupported/manual review | yes naar blocker | geen bedrag | Nee | Ja | Wisselende uren of meerdere vormen vragen volledige engine. |

### Bestaande zorgtoeslag

| Huidig veld | State-key | Doeltype | Doelveld | Transformatie | Validatie | Default toegestaan | Blocker bij ontbrekend | Uitleg voor gebruiker |
|---|---|---|---|---|---|---|---|---|
| Leeftijd | `age` | number | bestaande scan-input `age` | integer parse | 0-120 | Nee | Ja | Zorgtoeslag meestal vanaf 18. |
| Toeslagpartner | `partnerStatus` | enum | bestaande scan-input `partnerStatus` | onveranderd | verplicht voor bedrag | Nee | Ja | Partner bepaalt grenzen. |
| Toetsingsinkomen | `assessmentIncome` | number | bestaande scan-input `assessmentIncome` | parse money | >= 0 | Nee | Ja | Bestaande zorgtoeslagberekening gebruikt dit veld. |
| Gezamenlijk inkomen | `jointAssessmentIncome` | number | bestaande scan-input `jointAssessmentIncome` | parse money bij partner | >= 0 | Nee | Ja bij partner | Alleen zichtbaar bij partner. |
| Vermogen | `assets` | number | bestaande scan-input `assets` | parse money | >= 0 | Nee | Ja | Vermogenstoets. |
| Gezamenlijk vermogen | `jointAssets` | number | bestaande scan-input `jointAssets` | parse money bij partner | >= 0 | Nee | Ja bij partner | Alleen zichtbaar bij partner. |
| Nederlandse zorgverzekering | `hasDutchHealthInsurance` | boolean/unknown | `healthcare.hasDutchHealthInsurance` | yes/no/unknown | verplicht voor bedrag | Nee | Ja | Zonder Nederlandse zorgverzekering normaal geen recht. |

## 4. Benodigde Intake-uitbreidingen

Vraag alleen extra gegevens wanneer de relevante route actief is.

| Vraagtekst | Waarom nodig | Antwoordtype | Zichtbaar wanneer | Hoe te achterhalen | Veilig afleidbaar | Validatie | Engine-input | Blocker/reason code |
|---|---|---|---|---|---|---|---|---|
| Wat is je servicekostenbedrag per maand? | Uitleg dat servicekosten niet meetellen en waarschuwing bij verwarring. | Geldbedrag | `tenure=rent` en `uncertainSubsidiableRent=no` of verdieping | Huurspecificatie | Nee | >= 0 | `RentBenefitInput.serviceCosts` | `rent-service-costs-ignored-2026` als warning |
| Hoe oud is je toeslagpartner? | Jongerenhuurgrens onder 21. | Integer | partner en huurwoning | Geboortedatum partner | Ja, als geboortedatum later komt | 0-120 | `partnerAge` | `rent-missing-partner-age` |
| Hoeveel medebewoners wonen op je adres? | Huishoudgrootte en per-persoonsvermogen. | Integer | `hasCoResidents=yes` | BRP/huishouden | Nee | >= 0 | `coResidents.length` | `rent-missing-co-resident-count` |
| Wat zijn leeftijd, inkomen en vermogen per medebewoner? | Jongerenregel, kindvrijstelling en vermogensgrens per medebewoner. | Repeater | medebewoners > 0 | eigen administratie/huishouden | Nee | leeftijd 0-120, bedragen >= 0 | `coResidents[]` | `missing-household-assets` of nieuwe per-member codes |
| Is een medebewoner je kind of het kind van je partner? | Kindinkomensvrijstelling onder 23. | Ja/nee per medebewoner | medebewoner jonger dan 23 | huishoudrelatie | Soms uit child list, bevestiging vereist | required | `isChildOfApplicantOrPartner` | `rent-missing-co-resident-relation` |
| Is er sprake van onderhuur? | Onderhuurder kan worden uitgesloten. | Ja/nee | medebewoners | huurcontract | Nee | required | `excludedAsSubtenant` | `unsupported-special-housing-situation` bij onzeker |
| Geldt de scan voor het hele jaar? | Engines ondersteunen standaard volledig jaar. | Ja/nee | altijd in bedragmodus | eigen situatie | Nee | required | `calculationPeriod` | `partial-year-not-supported` |
| Wonen jij en je kinderen in Nederland? | KGB-engine ondersteunt alleen NL woonlandfactor. | Ja/nee | `hasChildren=yes` | woonadres/beschikking | Nee | required | `residenceCountry` | `unsupported-foreign-residence-factor` |
| Heeft ieder kind recht op kinderbijslag of voldoe je aan de onderhoudsvoorwaarde? | Rechtgevend kind per kind. | Ja/nee per kind | kinderen > 0 | SVB/Mijn SVB | Huidig algemeen antwoord tijdelijk toepasbaar na bevestiging | required | `children[].receivesChildBenefitOrMeetsMaintenanceCondition` | `child-budget-no-qualifying-children` |
| Is er co-ouderschap? | Huidige engine blokkeert co-ouderschap. | Ja/nee | kinderen > 0 | ouderschapsafspraak/beschikking | Nee | required | `specialSituations` | `unsupported-co-parenting` |
| Verandert een kind in het jaar van leeftijdscategorie 12 of 16, of wordt het 18? | Jaarbedrag kan tijdvak nodig hebben. | Ja/nee of geboortedatum | kinderen > 0 | geboortedatum kind | Ja uit geboortedatum | required voor bedrag | `specialSituations` | `partial-year-not-supported` of `age-change-during-year` |
| Is er een samengesteld gezin of bijzondere kinderbijslagsituatie? | Huidige KGB-engine ondersteunt standaardhuishoudens. | Ja/nee | kinderen > 0 | gezinssituatie | Nee | required | `specialSituations` | `manual-review-required` |
| Wat is de opvangsoort per contract? | Nodig voor max uurtarief, maar nog niet publiek bedraggevend. | Enum | toekomstige KOT-bedragfase | opvangcontract | Nee | required later | `contracts[].careType` | `childcare-amount-engine-not-implemented` tot engine gereed |
| Wat is het uurtarief per contract? | Nodig voor KOT-kostenbasis, maar nog niet actief. | Geldbedrag | toekomstige KOT-bedragfase | factuur/contract | Nee | >= 0 | `contracts[].hourlyRate` | `childcare-amount-engine-not-implemented` |

## 5. Reason-codecontract

Gebruik een centrale UI-classificatie voor zowel bestaande signalingcodes als nieuwe enginecodes.

| Code | Classificatie | Betekenis | Gebruikerstaal | UI-behandeling | Bedrag tonen | PDF opnemen | Vervolgstap |
|---|---|---|---|---|---|---|---|
| `missing-age` | blocking | Leeftijd ontbreekt. | Vul je leeftijd in. | Inline melding en vraagflow actief. | Nee | Alleen als ontbrekend gegeven. | Vraag leeftijd. |
| `missing-partner-status` | blocking | Partnerstatus ontbreekt. | Geef aan of je een toeslagpartner hebt. | Inline melding. | Nee | Ja, als ontbrekend. | Partneruitleg tonen. |
| `missing-income` | blocking | Inkomen ontbreekt. | Vul je geschatte toetsingsinkomen in. | Inline melding. | Nee | Ja. | Uitleg toetsingsinkomen. |
| `missing-joint-income` | blocking | Gezamenlijk inkomen ontbreekt. | Vul het gezamenlijke toetsingsinkomen in. | Inline melding. | Nee | Ja. | Partnerinkomen vragen. |
| `missing-assets` | blocking | Vermogen ontbreekt. | Vul je vermogen op 1 januari in. | Inline melding. | Nee | Ja. | Vermogensuitleg. |
| `missing-joint-assets` | blocking | Partnervermogen ontbreekt. | Vul het gezamenlijke of partnervermogen in. | Inline melding. | Nee | Ja. | Splitsing vragen bij nieuwe adapter. |
| `missing-household-income` | blocking | Huurhuishoudinkomen ontbreekt. | Vul het inkomen van het huurtoeslaghuishouden in. | Inline melding. | Nee | Ja. | Huishoudleden toelichten. |
| `missing-household-assets` | blocking | Huishoudvermogen ontbreekt. | Vul vermogen van relevante medebewoners in. | Inline melding. | Nee | Ja. | Per medebewoner vragen. |
| `missing-child-ages` | blocking | Leeftijd kinderen ontbreekt. | Vul de leeftijden van je kinderen in. | Inline melding. | Nee | Ja. | Leeftijd/geboortedatum vragen. |
| `invalid-rule-year` | unsupported | Verkeerd regeljaar. | Deze scan ondersteunt alleen 2026. | Algemene fout. | Nee | Nee | Geen publieke activatie. |
| `invalid-negative-input` | blocking | Negatief getal. | Gebruik 0 of hoger. | Inline fout. | Nee | Nee | Invoer corrigeren. |
| `invalid-non-finite-input` | blocking | Ongeldig getal. | Gebruik een geldig getal. | Inline fout. | Nee | Nee | Invoer corrigeren. |
| `complex-exception` | manual-review | Algemene uitzondering. | Je situatie vraagt officiele controle. | Waarschuwingskaart. | Nee | Ja. | Mijn Toeslagen/proefberekening. |
| `official-calculation-required` | manual-review | Officiele proefberekening vereist. | Gebruik de officiele proefberekening. | Callout. | Nee | Ja. | Link naar bron. |
| `unsupported-special-housing-situation` | unsupported | Huurwoninguitzondering. | Deze woonsituatie kan de tool niet veilig berekenen. | Blockerkaart. | Nee | Ja. | Officiele proefberekening. |
| `partial-year-not-supported` | unsupported | Deeljaar/tijdvak. | Deeljaar wordt nog niet berekend. | Blockerkaart. | Nee | Ja. | Officiele proefberekening. |
| `unsupported-foreign-residence-factor` | unsupported | Buitenlandse woonlandfactor. | Wonen buiten Nederland vraagt aparte woonlandfactor. | Blockerkaart. | Nee | Ja. | Officiele controle. |
| `unsupported-co-parenting` | unsupported | Co-ouderschap. | Co-ouderschap kan de verdeling veranderen. | Blockerkaart. | Nee | Ja. | Officiele controle. |
| `manual-review-required` | manual-review | Handmatige beoordeling. | Laat je situatie officieel controleren. | Waarschuwingslabel. | Nee, tenzij naast berekende standaarduitkomst alleen informatief | Ja. | Aanvraag/proefberekening. |
| `unsupported-non-independent-home` | unsupported | Geen zelfstandige woning. | Voor deze woning kan de tool geen bedrag berekenen. | Blockerkaart. | Nee | Ja. | Controleer uitzonderingen officieel. |
| `rent-assets-above-limit` | informational | Vermogen boven huurtoeslaggrens. | Je vermogen lijkt te hoog voor huurtoeslag. | Geen-rechtkaart. | Ja, als `0` met status geen recht | Ja. | Vermogen controleren. |
| `rent-co-resident-assets-above-limit` | informational | Medebewoner boven vermogensgrens. | Vermogen van een medebewoner lijkt te hoog. | Geen-rechtkaart. | Ja, als `0` met status geen recht | Ja. | Medebewonervermogen controleren. |
| `rent-benefit-calculated` | informational | Huurtoeslag berekend. | De huurtoeslag is indicatief berekend. | Bedragkaart. | Ja | Ja. | Controleer in Mijn Toeslagen. |
| `rent-benefit-zero-after-income-correction` | informational | Huurtoeslag valt naar nul. | Door het inkomen blijft geen huurtoeslag over. | Geen-rechtkaart. | Ja, `0` | Ja. | Inkomen controleren. |
| `rent-calculation-rent-capped` | warning | Huur is afgetopt op grens. | De rekenhuur is begrensd volgens de 2026-regel. | Detailregel. | Ja | Ja. | Toon componenten. |
| `rent-service-costs-ignored-2026` | warning | Servicekosten niet meegenomen. | Servicekosten tellen in deze 2026-berekening niet mee. | Waarschuwing. | Ja | Ja. | Kale huur controleren. |
| `rent-under-21-cap-applied` | warning | Jongerenhuurgrens toegepast. | De jongerenhuurgrens is toegepast. | Detailregel. | Ja | Ja. | Leeftijd huishouden tonen. |
| `child-budget-no-qualifying-children` | informational | Geen rechtgevend kind. | Er is geen kind dat aan de basisvoorwaarde voldoet. | Geen-rechtkaart. | Ja, `0` | Ja. | Kinderbijslag/onderhoud controleren. |
| `child-budget-assets-above-limit` | informational | Vermogen boven KGB-grens. | Je vermogen lijkt te hoog voor kindgebonden budget. | Geen-rechtkaart. | Ja, `0` | Ja. | Vermogen controleren. |
| `child-budget-calculated` | informational | KGB berekend. | Het kindgebonden budget is indicatief berekend. | Bedragkaart. | Ja | Ja. | Controleer in Mijn Toeslagen. |
| `child-budget-zero-after-income-reduction` | informational | KGB valt naar nul. | Door het inkomen blijft geen kindgebonden budget over. | Geen-rechtkaart. | Ja, `0` | Ja. | Inkomen controleren. |
| `child-budget-income-reduction-applied` | warning | Inkomensafbouw toegepast. | Het bedrag is verlaagd door het inkomen. | Detailregel. | Ja | Ja. | Toon componenten. |
| `child-budget-domestic-residence-factor-applied` | informational | NL woonlandfactor toegepast. | De Nederlandse woonlandfactor is toegepast. | Detailregel. | Ja | Ja. | Geen. |

Regel: de UI mag alleen `0` tonen wanneer een centrale engine `eligibilityStatus: "ineligible"` met `monthlyAmount: 0` of `yearlyAmount: 0` teruggeeft. Bij `unsupported`, `incomplete` of ontbrekende input staat er geen eurobedrag.

## 6. Resultaatmodel

Gebruik een centraal publieke-resultaatmodel voor elke toeslagkaart:

```ts
export type PublicAllowanceBenefitStatus =
  | "calculated"
  | "ineligible"
  | "incomplete"
  | "unsupported"
  | "manual-review"
  | "signal-only";

export type PublicAllowanceBenefitResult = {
  allowanceKind: "healthcare" | "rent" | "child-budget" | "childcare";
  status: PublicAllowanceBenefitStatus;
  monthlyAmount?: number;
  yearlyAmount?: number;
  reliability: "official-standard-scenario" | "strong-indication" | "reasonable-indication" | "preliminary" | "blocked";
  reasonCodes: readonly string[];
  warnings: readonly string[];
  sourceDatasetId: string;
  calculationYear: number;
  components: Record<string, number | string | boolean>;
  explanation: readonly string[];
  nextStep: string;
};
```

Statusbetekenis:

| Status | Betekenis | Bedrag |
|---|---|---|
| `calculated` | Concrete euro-indicatie uit centrale engine. | Maand en jaar tonen. |
| `ineligible` | Centrale engine concludeert geen recht of nulbedrag. | Alleen `0` tonen als engine dit expliciet levert. |
| `incomplete` | Onvoldoende of ongeldige invoer. | Geen bedrag. |
| `unsupported` | Situatie valt buiten ondersteunde engine-scope. | Geen bedrag. |
| `manual-review` | Handmatige/officiele beoordeling nodig. | Geen bedrag, tenzij een standaardberekening naast een niet-blokkerende waarschuwing bestaat. |
| `signal-only` | Alleen signalering zonder bedragengine. | Geen bedrag. |

De gezamenlijke samenvatting mag alleen bedragen optellen met status `calculated` of expliciet `ineligible` met enginebedrag `0`. Onbevestigde, incomplete of unsupported resultaten tellen niet mee in een totaal.

## 7. Integratievolgorde

### Fase A - interne mapping

- Voeg pure adapterfuncties toe.
- Bouw types voor `PublicAllowanceScanInput` of houd deze lokaal in de adapter.
- Schrijf karakterisatietests op huidige `createAllowanceScanView`-output.
- Sluit nog geen publieke UI-bedragen aan.

### Fase B - huurtoeslag

- Breid intake alleen uit met ontbrekende huurvelden.
- Map naar `RentBenefitInput`.
- Toon reason codes en componenten uit `calculateRentBenefit2026`.
- Vervang de huurtoeslagkaart alleen wanneer adapterstatus `calculated` of `ineligible` is.
- Gebruik feature flag of expliciete activatiecommit.

### Fase C - kindgebonden budget

- Breid intake uit met per-kind of bevestigde kindgegevens.
- Map naar `ChildBudgetInput`.
- Blokkeer co-ouderschap, deeljaar, buitenlandse woonlandfactor en samengestelde gezinnen.
- Vervang de KGB-kaart alleen bij concrete engine-uitkomst.
- Gebruik feature flag of expliciete activatiecommit.

### Fase D - gezamenlijke samenvatting

- Toon totaal mogelijke toeslagen alleen voor concrete bedragen.
- Toon status per toeslag.
- Tel incomplete, unsupported of signal-only kaarten niet op.
- Toon bronverwijzingen en aanvraaglinks.

### Fase E - PDF

- Pas na correcte UI-integratie.
- Gebruik `AllowanceAdvisorReportModel` of een afgeleide reportadapter.
- Geen herberekening in PDF.

### Fase F - kinderopvangtoeslag

- Alleen na volledige totaalengine en domeinvalidatie.
- De huidige `childcare-helpers.ts` zijn onvoldoende voor publieke totaalbedragen.

## 8. Adapterontwerp

Plaats adapters niet in `Calculator.tsx`. Geschikte locatie:

- eerste implementatie: `apps/toeslagen-scan/engine-adapters.ts`;
- bij hergebruik: `src/lib/allowances/scan-integration.ts`.

Voorgestelde functies:

```ts
export function mapScanInputToRentBenefitInput(
  input: PublicAllowanceScanInput,
): { ok: true; value: RentBenefitInput } | { ok: false; reasonCodes: readonly string[] };

export function mapScanInputToChildBudgetInput(
  input: PublicAllowanceScanInput,
): { ok: true; value: ChildBudgetInput } | { ok: false; reasonCodes: readonly string[] };

export function mapRentBenefitResultToPublicResult(
  result: RentBenefitResult,
): PublicAllowanceBenefitResult;

export function mapChildBudgetResultToPublicResult(
  result: ChildBudgetResult,
): PublicAllowanceBenefitResult;

export function mapAllowanceResultToPublicResult(
  result: RentBenefitResult | ChildBudgetResult | OfficialAllowanceCalculationResult,
): PublicAllowanceBenefitResult;
```

Adapterregels:

- Vul nooit ontbrekende leeftijd, inkomen, vermogen, partnerstatus of woonland stil in.
- Gebruik geen `0` als fallback voor onbekend inkomen, vermogen, huur of opvanguren.
- Zet unsupported situaties om naar reason codes voordat een engine wordt aangeroepen als de engine een concreet type vereist.
- Roep `calculateRentBenefit2026` alleen aan met volledig concrete `RentBenefitInput`.
- Roep `calculateChildBudget2026` alleen aan met volledig concrete `ChildBudgetInput`.
- Bewaar bestaande zorgtoeslagoutput ongewijzigd.
- Bewaar engine-resultaten immutable; muteer centrale resultaten niet in viewmodelconversie.

## 9. Oude Logica en Migratie

Te vervangen:

- huurtoeslagkaart met status `unavailable` zodra `RentBenefitResult` concreet is;
- KGB-kaart met status `unavailable` zodra `ChildBudgetResult` concreet is;
- teksten die melden dat huur/KGB-bedragregels niet geimplementeerd zijn;
- tests die afdwingen dat `rent.monthlyAmountLabel` en `child-budget.monthlyAmountLabel` leeg blijven.

Voorlopig naast elkaar:

- bestaande `evaluateAllowanceSignals` voor signalering en hard checks;
- bestaande `calculateOfficialAllowanceScan2026` voor zorgtoeslag;
- bestaande question-flow-progress;
- bestaande advisor-reportstructuur.

Dubbel rekenen voorkomen:

- Kies per toeslag exact een bedragbron.
- Huurtoeslagbedrag komt alleen uit `calculateRentBenefit2026`.
- KGB-bedrag komt alleen uit `calculateChildBudget2026`.
- Signalingresultaten mogen alleen context, missing fields en reason-codecopy leveren.

Delete-later-lijst:

- actieve onzekerheid `rent-income-table-not-implemented` voor huurtoeslagbedragen;
- actieve onzekerheid `income-table-not-implemented` voor KGB-bedragen;
- tijdelijke adapterfallbacks die oude signalering tonen na succesvolle activatie;
- copy die suggereert dat huurtoeslag/KGB geen bedragen ondersteunen;
- karakterisatietests voor "nog geen bedrag" na vervanging door bedragregressies.

Zorgtoeslag blijft onaangetast: geen wijziging aan bestaande inputmapping, bedragen, reason codes of tests behalve regressieasserties dat de output identiek blijft.

## 10. Testplan

### Unit tests

- `mapScanInputToRentBenefitInput` met volledig standaardhuishouden.
- `mapScanInputToRentBenefitInput` met lege leeftijd, huur, partnerstatus, inkomen en vermogen.
- `mapScanInputToRentBenefitInput` met medebewoners en per-persoonsvermogen.
- `mapScanInputToRentBenefitInput` blokkeert deeljaar en bijzondere woonvorm.
- `mapScanInputToChildBudgetInput` met alleenstaande ouder.
- `mapScanInputToChildBudgetInput` met partnerhuishouden.
- `mapScanInputToChildBudgetInput` met kind van 12 en kind van 16.
- `mapScanInputToChildBudgetInput` blokkeert co-ouderschap, buitenland en deeljaar.
- Reason-code mapping voor alle codes in deze gids.
- Geen impliciete defaults voor bedragen, leeftijden of statusvelden.
- Bedragen zijn exact afkomstig uit centrale engines.
- Adapterresultaten en viewmodels zijn immutable of worden niet gemuteerd.

### Componenttests

- Progressive disclosure toont huurvragen alleen bij huurwoning.
- Extra medebewonervragen verschijnen alleen bij medebewoners.
- KGB-kindvragen verschijnen alleen bij kinderen.
- Foutmeldingen verschijnen inline en in de foutsummary.
- Focusmanagement blijft werken na submit.
- Blockers tonen geen foutief eurobedrag.
- Concrete huurtoeslaguitkomst toont maand- en jaarbedrag.
- Concrete KGB-uitkomst toont maand- en jaarbedrag.
- Zorgtoeslagregressie: bestaande voorbeeldoutput blijft gelijk.

### Integratietests

- Volledig standaardhuishouden.
- Huurder zonder kinderen.
- Huurder met kinderen.
- Alleenstaande ouder.
- Partnerhuishouden.
- Vermogen precies op grens en 1 euro boven grens.
- Bijzondere woonvorm.
- Co-ouderschap.
- Deeljaar.
- Kind van 12.
- Kind van 16.

### E2E/smoke

- Desktoproute `/apps/toeslagen-scan`.
- Mobiele route `/apps/toeslagen-scan`.
- Browser-refresh na routeopen.
- Toetsenbordnavigatie door nieuwe velden.
- PDF-knop alleen zichtbaar wanneer passend en gevuld met dezelfde data.
- Bronnen en aanvraaglinks openen extern en veilig.

## 11. Releasecriteria

Huurtoeslag mag alleen publiek aan wanneer:

- alle verplichte velden concreet beschikbaar zijn;
- standaardscenario's een officieel gevalideerde uitkomst geven;
- blockers geen misleidend bedrag tonen;
- servicekosten niet meetellen in de rekenhuur;
- zorgtoeslag niet regressief verandert;
- lint, typecheck, tests en build groen zijn.

Kindgebonden budget mag alleen publiek aan wanneer:

- partnerstatus en kinderen correct gemodelleerd zijn;
- leeftijden correct worden verwerkt;
- alleenstaande-ouderbedrag correct werkt;
- vermogenstoets correct werkt;
- niet-ondersteunde co-ouderschap- en deeljaarsituaties expliciet worden geblokkeerd;
- lint, typecheck, tests en build groen zijn.

Kinderopvangtoeslag mag niet publiek worden geactiveerd in deze integratiefase.

NO-GO bij:

- publieke UI toont `0` voor niet-berekend of unsupported;
- een adapter vult onbekende bedragen met `0`;
- zorgtoeslagbedragen wijzigen zonder expliciete opdracht;
- routes, manifests of PDF-output wijzigen in een interne mappingfase;
- nieuwe formules of constants buiten centrale engines verschijnen;
- source-data of wettelijke aannames worden gedupliceerd in React.

## 12. Bestandsplan

Nieuwe bestanden voor de implementatie-agent:

| Bestand | Functie |
|---|---|
| `apps/toeslagen-scan/engine-adapters.ts` | Pure mapping van publieke scaninput naar `RentBenefitInput` en `ChildBudgetInput`, plus publieke resultmapping. |
| `apps/toeslagen-scan/engine-adapters.test.ts` | Unit- en regressietests voor mapping, blockers, reason-codeclassificatie en immutable output. |

Te wijzigen bestanden in implementatiefase:

| Bestand | Functie |
|---|---|
| `apps/toeslagen-scan/types.ts` | Toevoegen van publieke scan- en resultaattypes als deze app-lokaal blijven. |
| `apps/toeslagen-scan/logic.ts` | Adapterresultaten samenvoegen met bestaande scanview zonder React-formules. |
| `apps/toeslagen-scan/logic.test.ts` | Karakterisatietests vervangen of uitbreiden met concrete huur/KGB-regressies. |
| `apps/toeslagen-scan/copy.ts` | Nederlandse copy toevoegen voor nieuwe engine-reason-codes. |
| `apps/toeslagen-scan/copy.test.ts` | Copy coverage uitbreiden. |
| `apps/toeslagen-scan/Calculator.tsx` | Alleen in fase B/C extra intakevelden en resultaatweergave aansluiten. |
| `FUNCTIONALITY_STATUS.md` | Status bijwerken bij expliciete publieke activatie. |

Bewust niet wijzigen in fase A:

| Bestand | Reden |
|---|---|
| `apps/toeslagen-scan/app.json` | Geen manifest- of publieke statuswijziging voor interne mapping. |
| `src/lib/allowances/rent-benefit.ts` | Centrale engine is al aanwezig; geen formulewijziging door Feature Integrator. |
| `src/lib/allowances/child-budget.ts` | Centrale engine is al aanwezig; geen formulewijziging door Feature Integrator. |
| `src/lib/allowances/childcare-helpers.ts` | Geen kinderopvangtotaalengine in deze integratiefase. |
| Centrale PDF-laag | PDF pas na correcte UI-integratie en gedeelde data. |
| Routes en dashboardregistry | Geen nieuwe route of activatie nodig. |

## 13. Form UX-beoordeling van deze gids

Beoordeling na Form UX- en PDF-controle:

| Onderwerp | Bevinding | Aanpassing in deze gids |
|---|---|---|
| Progressive disclosure | De technische mapping is volledig, maar de eindgebruiker mag niet met alle huur-, kind- en opvangvragen tegelijk starten. | Sectie 14 definieert een stapsgewijze publieke intake met conditionele zichtbaarheid. |
| Vraagvolgorde | De bestaande mappingtabellen beschrijven velden per domein, niet de volgorde waarin een gebruiker ze logisch invult. | Sectie 14 ordent de vragen van algemene situatie naar alleen relevante domeindetails. |
| Minimale invoerlast | Voor huur en kindgebonden budget zijn extra velden nodig, maar die mogen pas verschijnen wanneer de toeslag relevant is. | Sectie 14 en 15 markeren iedere vraag met zichtbaarheidsregels. |
| Ontbrekende noodzakelijke vragen | Partnerleeftijd, geboortedata kinderen, servicekosten, hele-jaarstatus, woonland, co-ouderschap en per-medebewonergegevens zijn nog niet volledig formulierklaar. | Sectie 15 maakt deze vragen concreet. |
| Onnodig vroege vragen | Kinderopvangcontractdetails zijn nodig voor een toekomstige bedragengine, maar nog niet voor publieke bedragweergave. | Sectie 15 markeert kinderopvangbedragvragen als voorbereid en niet actief voor bedragberekening. |
| Toegankelijke foutafhandeling | De gids noemt validatie, maar nog niet per veld welke fouttekst, focus en ARIA-koppeling nodig zijn. | Sectie 17 beschrijft het validatie- en foutcontract. |
| Blockers | De reason-codeclassificatie bestaat, maar de gebruikersbehandeling van blockers moet eenduidig zijn. | Sectie 17 en 18 bepalen dat blockers nooit als EUR 0 worden getoond. |
| EUR 0 versus niet berekend | De bestaande gids bevat de kernregel, maar de samenvatting en PDF hadden nog een expliciete optelregel nodig. | Sectie 18 en 20 borgen dat alleen concrete enginebedragen optellen. |
| Scherm/PDF-gelijkheid | De gids noemt het reportmodel, maar nog geen veldmatrix. | Sectie 20 legt bron van waarheid, zichtbaarheid en privacy per onderdeel vast. |
| PDF-rekenpad | De gids verbiedt herberekening, maar specificeerde nog onvoldoende welke data de PDF gebruikt. | Sectie 19 maakt de PDF afhankelijk van canonieke input, centrale resultaten en resultmapper. |

Besluit: deze opdracht blijft documentatie-only. Een typed configuratielaag is pas zinvol in Fase A van de implementatie, zodat tests dan direct tegen executable mapping en schema's kunnen draaien. Deze gids vormt daarvoor het implementatiecontract.

## 14. Definitieve publieke formulierflow

De publieke Toeslagenscan wordt een stapsgewijze intake. `Weet ik niet` is alleen een tijdelijke intakekeuze; de gebruiker krijgt uitleg, vervolgvraag of vindplaats voordat een bedragadapter de centrale engine mag aanroepen. Eerder ingevulde waarden blijven in lokale formstate staan wanneer een stap tijdelijk verborgen wordt, maar hidden stale values worden niet naar engine-input gemapt.

### Stap 1 - Persoonlijke situatie

Doel: bepalen voor welke toeslagen de basisroute relevant kan zijn.

| Eigenschap | Contract |
|---|---|
| Titel | `Over jou` |
| Korte uitleg | `We starten met gegevens die voor meerdere toeslagen bepalen of de scan iets kan berekenen.` |
| Zichtbare velden | berekeningsjaar 2026 als vaste context, leeftijd, woonland Nederland/anders, Nederlandse zorgverzekering |
| Conditioneel zichtbaar | woonlandfactor-uitleg wanneer woonland anders dan Nederland; zorgverzekeringuitleg wanneer `Weet ik niet` |
| Validatie | leeftijd integer 0-120; woonland required; zorgverzekering yes/no vereist voor zorgtoeslagbedrag |
| Doorgaan mogelijk | leeftijd en woonland zijn concreet; zorgverzekering mag tijdelijk unknown blijven, maar blokkeert zorgtoeslagbedrag totdat opgelost |
| Foutfocus | eerste fout in stap, met summarylink naar het veld |
| Terugnavigatie | niet van toepassing vanaf eerste stap |
| Waardebehoud | alle ingevulde waarden blijven staan bij heen-en-weer navigeren |

### Stap 2 - Partner en huishouden

Doel: bepalen welke inkomens, vermogens en huishoudleden meetellen.

| Eigenschap | Contract |
|---|---|
| Titel | `Partner en huishouden` |
| Korte uitleg | `Toeslagen kijken naar je huishouden. Daarom vragen we alleen wie meetelt voor de berekening.` |
| Zichtbare velden | toeslagpartner ja/nee/weet ik niet, geldt situatie hele kalenderjaar, medebewoners ja/nee wanneer huurwoning later relevant is of de gebruiker huurtoeslag wil meenemen |
| Conditioneel zichtbaar | partnerleeftijd bij partner en huurwoning; gezamenlijke partnergegevens bij partner; per-medebewonerrepeater alleen bij medebewoners |
| Validatie | partnerstatus required; deeljaar `nee, niet hele jaar` is blocker tot tijdvaklogica; partnerleeftijd 0-120 wanneer nodig |
| Doorgaan mogelijk | partnerstatus concreet of opgelost via unknown-resolution; deeljaar mag doorgaan naar resultaten maar blokkeert bedragkaarten die tijdvaklogica nodig hebben |
| Foutfocus | partnerstatus voor ontbrekende partnergegevens; eerste medebewonerregel bij repeaterfout |
| Terugnavigatie | terug naar persoonlijke situatie zonder reset |
| Waardebehoud | partner- en medebewonerwaarden blijven bewaard, maar worden niet gebruikt wanneer partner/medebewoners later naar `nee` gaan |

### Stap 3 - Kinderen

Doel: kindgebonden budget en toekomstige kinderopvangvragen alleen openen wanneer er kinderen zijn.

| Eigenschap | Contract |
|---|---|
| Titel | `Kinderen` |
| Korte uitleg | `Kindgegevens zijn alleen nodig voor kindgebonden budget en kinderopvangtoeslag.` |
| Zichtbare velden | kinderen ja/nee, aantal kinderen, geboortedatum per kind, kinderbijslag/onderhoudsvoorwaarde per kind, wonen kinderen in Nederland |
| Conditioneel zichtbaar | co-ouderschap, samengesteld gezin, situatie hele kalenderjaar, kind woont bij jou |
| Validatie | aantal kinderen integer >= 0; geboortedatum geen toekomst; ten minste evenveel kindregels als aantal kinderen; kinderbijslag/onderhoud per kind required |
| Doorgaan mogelijk | zonder kinderen direct door; met kinderen moeten aantal en geboortedata concreet zijn; co-ouderschap of samengesteld gezin mag naar resultaten maar blokkeert KGB-bedrag |
| Foutfocus | eerste kindregel met ontbrekende of toekomstige geboortedatum |
| Terugnavigatie | terug naar partner/huishouden zonder verlies van kindregels |
| Waardebehoud | kindregels blijven bewaard wanneer `kinderen` tijdelijk naar `nee` gaat, maar worden dan niet gemapt |

Leeftijdsverhogingen voor kindgebonden budget worden nooit rechtstreeks gevraagd. De adapter leidt leeftijd en leeftijdscategorie af uit geboortedatum en berekeningsjaar.

### Stap 4 - Inkomen en vermogen

Doel: de verplichte rekenwaarden verzamelen zonder defaults.

| Eigenschap | Contract |
|---|---|
| Titel | `Inkomen en vermogen` |
| Korte uitleg | `Gebruik je verwachte toetsingsinkomen over 2026 en je vermogen op 1 januari 2026.` |
| Zichtbare velden | toetsingsinkomen aanvrager of gezamenlijk toetsingsinkomen bij partner; vermogen aanvrager; partnervermogen bij partner; per-medebewonervermogen bij huur en medebewoners |
| Conditioneel zichtbaar | huishoudinkomen of per-persooninkomen bij huur; uitleg bijzondere vermogensbestanddelen |
| Validatie | geldbedragen >= 0, maximaal twee decimalen in invoer, geen lege verplichte bedragen, partnergegevens required bij partner |
| Doorgaan mogelijk | alle voor relevante toeslagen vereiste bedragen concreet; unknown activeert help/vindplaats/vraagverfijning en niet de engine |
| Foutfocus | eerste ontbrekende of negatieve geldinvoer |
| Terugnavigatie | terug naar kinderen zonder reset |
| Waardebehoud | bedragen blijven bewaard bij dependencywijzigingen, maar hidden stale values worden uitgesloten |

### Stap 5 - Huurwoning

Doel: huurtoeslag alleen berekenen voor standaard 2026-jaarscenario's.

| Eigenschap | Contract |
|---|---|
| Titel | `Huurwoning` |
| Korte uitleg | `Voor huurtoeslag telt in 2026 de kale huur. Servicekosten tellen niet mee in de rekenhuur.` |
| Zichtbare velden | huur/koop/anders, zelfstandige woning, kale huur per maand, servicekosten ja/nee en bedrag, hele kalenderjaar in deze woning |
| Conditioneel zichtbaar | bijzondere woonvorm, aangepaste woning/beperking bij jongerenhuishouden, onderhuur bij medebewoners |
| Validatie | kale huur >= 0; servicekosten >= 0; servicekosten worden nooit bij kale huur opgeteld; zelfstandige woning required bij huur |
| Doorgaan mogelijk | geen huur: stap overslaan; huur: kale huur, zelfstandigheid en hele-jaarstatus concreet; bijzondere woonvorm/deeljaar blokkeert bedrag |
| Foutfocus | kale huur of zelfstandige woning |
| Terugnavigatie | terug naar inkomen/vermogen zonder reset |
| Waardebehoud | huurvelden blijven bewaard bij tijdelijk wisselen naar koop, maar worden niet gemapt zolang `tenure` geen huur is |

### Stap 6 - Kinderopvang

Doel: signalering en toekomstige bedragvoorbereiding scheiden.

| Eigenschap | Contract |
|---|---|
| Titel | `Kinderopvang` |
| Korte uitleg | `Deze scan kan kinderopvangtoeslag nu signaleren. Bedragen worden pas geactiveerd als de volledige centrale engine gereed is.` |
| Zichtbare velden | betaalde opvang, LRK-registratie, eigen bijdrage, rechtgevende activiteit aanvrager, rechtgevende activiteit partner bij partner |
| Conditioneel zichtbaar | opvangsoort, contract per kind, periode, uren, uurtarief en meerdere contracten alleen in toekomstige bedragfase of verborgen voorbereidingsconfig |
| Validatie | ja/nee required voor signalering; uren/uurtarief >= 0 wanneer bedragfase later actief wordt |
| Doorgaan mogelijk | signaleringsvelden concreet of als incomplete signalering; bedragvelden activeren nog geen bedrag |
| Foutfocus | LRK of eigen bijdrage bij ontbrekende harde voorwaarde |
| Terugnavigatie | terug naar huurwoning zonder reset |
| Waardebehoud | contractregels blijven lokaal bewaard wanneer opvang later naar `nee` gaat, maar worden niet gemapt |

### Stap 7 - Controle en berekening

Doel: aannames, blockers en engine-input zichtbaar maken voordat berekening draait.

| Eigenschap | Contract |
|---|---|
| Titel | `Controleer je gegevens` |
| Korte uitleg | `We rekenen alleen met gegevens die concreet genoeg zijn. Onopgeloste of niet-ondersteunde situaties worden als blocker getoond.` |
| Zichtbare velden | samenvatting per stap, afgeleide waarden, nog te bevestigen waarden, blockers, aanvraag-/controlecontext |
| Conditioneel zichtbaar | knop `Bereken indicatie` alleen wanneer minimaal een toeslag concrete engine-input heeft of signalering verantwoord is |
| Validatie | alle stapvalidaties opnieuw; focus naar eerste blocker of fout |
| Doorgaan mogelijk | voor concrete bedragen: alle essentiële inputs opgelost; voor signalering: incomplete status toegestaan zonder bedrag |
| Foutfocus | foutsummary bovenaan met links naar stap en veld |
| Terugnavigatie | iedere stap blijft bewerkbaar |
| Waardebehoud | geen reset bij berekenen; resetknop vraagt expliciete bevestiging en zet terug naar `defaultValues` |

## 15. Centrale vraagconfiguratie en concrete vraagteksten

Implementeer deze vragen later als centrale `questions`/config-laag of typed contract buiten React. Iedere vraag krijgt minimaal `id`, `stepId`, `label`, `shortHelp`, `detailHelp`, `example`, `whereToFind`, `sourceIds`, `visibleWhen`, `requiredWhen`, `blocksCalculationWhenUnknown`, `ariaDescriptionId` en `validation`.

### Huurtoeslag

| Vraag-id | Vraagtekst | Zichtbaar wanneer | Required voor bedrag | Contract |
|---|---|---|---|---|
| `rent.basicRent` | `Wat is uw kale huur per maand?` | `tenure=rent` | Ja | Geldbedrag. Leg expliciet uit: kale huur is de huur zonder servicekosten, voorschotten, energie of gemeentelijke lasten. |
| `rent.hasServiceCosts` | `Betaalt u servicekosten?` | `tenure=rent` | Nee, maar tonen voor uitleg | Ja/nee. Bij ja verschijnt servicekostenbedrag; servicekosten tellen niet mee in engine-input als kale huur. |
| `rent.serviceCosts` | `Welk bedrag aan servicekosten betaalt u per maand?` | `hasServiceCosts=yes` | Nee | Geldbedrag >= 0. Alleen toelichting/waarschuwing; niet optellen bij kale huur. |
| `rent.isIndependentHome` | `Gaat het om een zelfstandige woning?` | `tenure=rent` | Ja | Ja/nee/weet ik niet. Nee of unresolved unknown blokkeert bedrag, tenzij latere uitzondering expliciet wordt ondersteund. |
| `rent.fullYearResidence` | `Woont u het hele kalenderjaar in deze woning?` | `tenure=rent` | Ja | Ja/nee. Nee geeft `partial-year-not-supported`. |
| `household.hasPartner` | `Woont er een toeslagpartner bij u?` | altijd | Ja | Centrale partnerstatus. Unknown-resolution verplicht. |
| `rent.hasCoResidents` | `Wonen er andere personen op het adres?` | `tenure=rent` | Ja | Ja/nee. Bij ja verschijnt medebewonerrepeater. |
| `rent.householdIncome` | `Wat is het gezamenlijke toetsingsinkomen van het huurtoeslaghuishouden?` | `tenure=rent` | Ja zolang per-persooninkomen niet actief is | Geldbedrag >= 0; later vervangen door per-persoonmapping waar nodig. |
| `rent.memberAssets` | `Wat is het vermogen per relevante persoon op 1 januari 2026?` | `tenure=rent` | Ja | Per aanvrager, partner en medebewoner concreet; geen totaaldefault. |
| `rent.specialHousing` | `Is sprake van een bijzondere woonvorm?` | `tenure=rent` | Ja als controle | Ja/nee. Ja geeft manual-review/unsupported. |

### Kindgebonden budget

| Vraag-id | Vraagtekst | Zichtbaar wanneer | Required voor bedrag | Contract |
|---|---|---|---|---|
| `children.qualifyingCount` | `Voor hoeveel kinderen bestaat recht op kinderbijslag of voldoet u aan de onderhoudsvoorwaarde?` | `hasChildren=yes` | Ja | Integer >= 0 of per-kind ja/nee. Geen bedrag wanneer 0. |
| `children.birthDate` | `Wat is de geboortedatum van ieder kind?` | `hasChildren=yes` | Ja | Datum niet in toekomst. Leeftijd en leeftijdsverhogingen worden afgeleid. PDF gebruikt alleen leeftijd/geboortejaar tenzij volledige datum nodig is voor uitleg. |
| `household.hasPartner` | `Heeft u een toeslagpartner?` | altijd | Ja | Hergebruik centrale partnerstatus. |
| `children.coParenting` | `Is sprake van co-ouderschap?` | `hasChildren=yes` | Ja | Ja blokkeert KGB-bedrag met `unsupported-co-parenting`. |
| `children.compositeFamily` | `Is sprake van een samengesteld gezin?` | `hasChildren=yes` | Ja | Ja blokkeert of vraagt handmatige beoordeling. |
| `children.residenceCountry` | `Wonen de kinderen in Nederland?` | `hasChildren=yes` | Ja | Alleen `ja` is amount-ready. Nee geeft `unsupported-foreign-residence-factor`. |
| `children.fullYearSituation` | `Geldt de situatie het hele kalenderjaar?` | `hasChildren=yes` | Ja | Nee geeft `partial-year-not-supported`. |
| `income.assessmentIncome` | `Wat is het gezamenlijke toetsingsinkomen?` | altijd, label past aan op partnerstatus | Ja | Zonder partner individueel, met partner gezamenlijk. Geldbedrag >= 0. |
| `assets.relevantPersons` | `Wat is het vermogen?` | altijd | Ja | Aanvrager en partner apart waar partner bestaat. |

Vraag geen leeftijdsverhogingen rechtstreeks. De resultmapper toont later welke leeftijdscategorie uit geboortedatum is afgeleid.

### Kinderopvangtoeslag

Deze vragen zijn voorbereid, maar niet te activeren voor bedragberekening totdat de volledige centrale kinderopvangtotaalengine gereed is.

| Vraag-id | Vraagtekst | Zichtbaar wanneer | Status |
|---|---|---|---|
| `childcare.organization` | `Bij welke opvangorganisatie heeft u opvang afgenomen?` | toekomstige bedragfase | Voorbereid, niet bedragactief. |
| `childcare.lrkRegistered` | `Staat de opvang geregistreerd in het Landelijk Register Kinderopvang (LRK)?` | `usesChildcare=yes` | Actief voor signalering; required voor toekomstige bedragfase. |
| `childcare.careType` | `Om welke opvangsoort gaat het?` | toekomstige bedragfase | Voorbereid. |
| `childcare.childId` | `Voor welk kind is dit contract?` | toekomstige bedragfase | Voorbereid. |
| `childcare.period` | `Voor welke periode geldt dit contract?` | toekomstige bedragfase | Voorbereid; deeljaar blijft blocker zonder tijdvaklogica. |
| `childcare.hoursPerMonth` | `Hoeveel opvanguren per maand betaalt u?` | toekomstige bedragfase | Voorbereid; huidige signalering mag uren tonen zonder bedrag. |
| `childcare.hourlyRate` | `Wat is het uurtarief?` | toekomstige bedragfase | Voorbereid. |
| `childcare.ownContribution` | `Betaalt u zelf een deel van de opvangkosten?` | `usesChildcare=yes` | Actief voor signalering. |
| `childcare.applicantActivity` | `Heeft u een rechtgevende activiteit?` | `usesChildcare=yes` | Actief voor signalering. |
| `childcare.partnerActivity` | `Heeft uw toeslagpartner een rechtgevende activiteit?` | `usesChildcare=yes` en partner | Actief voor signalering. |
| `childcare.multipleContracts` | `Heeft u meerdere opvangcontracten?` | toekomstige bedragfase | Voorbereid; voorlopig manual-review/blocker. |

## 16. Helptekstcontract

Elke helptekst heeft korte inline copy, verdiepende copy, voorbeeld, vindplaats en bronverwijzing. De primaire bron is onderbouwing; de gebruiker hoeft de bron niet te openen om de term te begrijpen.

| Begrip | Korte uitleg | Waarom nodig | Waar vindt de gebruiker dit? | Voorbeeld |
|---|---|---|---|---|
| Toetsingsinkomen | `Dit is je verwachte jaarinkomen waar Dienst Toeslagen mee rekent.` | Het bepaalt of en hoeveel toeslag afbouwt. | Loonstrook, jaaropgave, aangifte inkomstenbelasting of Mijn Toeslagen. | `Verwacht je in 2026 EUR 32.000 bruto loon en geen ander inkomen, gebruik dan dat verwachte jaarbedrag als startpunt.` |
| Vermogen | `Dit is je vermogen op 1 januari van het berekeningsjaar.` | Te veel vermogen kan een toeslag blokkeren. | Bank- en beleggingssaldi rond 1 januari, belastingaangifte, administratie van spaargeld en schulden die mogen meetellen. | `Spaargeld en beleggingen tellen meestal mee; gewone maandelijkse uitgaven later in januari veranderen de peildatum niet.` |
| Kale huur | `Dit is de huur voor de woning zelf, zonder servicekosten.` | Huurtoeslag gebruikt in 2026 de kale huur als rekenhuur in deze engine. | Huurovereenkomst, huurspecificatie of huurverhogingsbrief. | `Betaal je EUR 820 huur en EUR 45 servicekosten, dan is de kale huur EUR 820.` |
| Zelfstandige woning | `Een woning met eigen toegang, eigen keuken en eigen toilet.` | Huurtoeslagbedrag kan alleen veilig worden berekend voor zelfstandige woningen of ondersteunde uitzonderingen. | Huurovereenkomst, woningbeschrijving of verhuurder. | `Een studio met eigen voordeur, keuken en toilet is meestal zelfstandig; een kamer met gedeelde keuken meestal niet.` |
| Toeslagpartner | `Een persoon die voor toeslagen als partner meetelt, bijvoorbeeld door huwelijk, geregistreerd partnerschap of bepaalde woonsituaties.` | Partnerinkomen en partnervermogen bepalen grenzen en bedragen. | Mijn Toeslagen, persoonlijke situatie, partnercheck binnen de tool. | `Woon je samen met je echtgenoot, dan is die persoon normaal je toeslagpartner.` |
| Medebewoner | `Iemand anders die op hetzelfde adres woont en voor huurtoeslag kan meetellen.` | Inkomen en vermogen van medebewoners kunnen huurtoeslag beinvloeden. | BRP-inschrijving, huishouden, huuradres. | `Een volwassen huisgenoot kan meetellen; een onderhuurder kan anders behandeld worden.` |
| Kinderbijslag/onderhoudsvoorwaarde | `Een kind telt meestal mee als je kinderbijslag krijgt of voldoende bijdraagt aan onderhoud.` | Zonder rechtgevend kind is er geen kindgebonden budget. | SVB/Mijn SVB, beschikking kinderbijslag, eigen administratie van onderhoud. | `Krijg je kinderbijslag voor je kind van 8, dan voldoet dat kind meestal aan deze basisvoorwaarde.` |
| Co-ouderschap | `Een kind woont of wordt verzorgd door beide ouders volgens een verdeling.` | Co-ouderschap kan het recht of de verdeling wijzigen en is nog geen bedrag-ready scenario. | Ouderschapsplan, afspraken met andere ouder, beschikking. | `Een kind woont afwisselend bij beide ouders; de tool toont dan een blocker in plaats van een bedrag.` |
| Samengesteld gezin | `Een gezin waarin kinderen of partners uit verschillende eerdere gezinssituaties samenkomen.` | Dit kan partner-, kind- en onderhoudsregels complex maken. | Eigen gezinssituatie, beschikking of Mijn Toeslagen. | `Je woont met je partner en kinderen uit eerdere relaties samen.` |
| Woonlandfactor | `Een factor die kan gelden wanneer een kind buiten Nederland woont.` | De huidige KGB-bedragengine ondersteunt alleen Nederland. | Woonadres van het kind en officiele beschikking. | `Woont het kind in Nederland, dan gebruikt de engine de Nederlandse factor.` |
| LRK | `Het Landelijk Register Kinderopvang is het register voor erkende opvanglocaties.` | Kinderopvangtoeslag vereist geregistreerde opvang. | Opvangcontract, factuur of LRK-nummer van de opvang. | `Een LRK-nummer op de factuur wijst op geregistreerde opvang.` |
| Rechtgevende activiteit | `Werk, opleiding, inburgering of traject naar werk waardoor kinderopvangtoeslag mogelijk kan zijn.` | Aanvrager en meestal partner moeten een activiteit hebben die meetelt. | Arbeidscontract, opleiding, trajectdocumenten, administratie. | `Betaald werk of een erkende opleiding kan een rechtgevende activiteit zijn.` |

## 17. Validatie- en foutcontract

Alle velden koppelen inline hulp en fouttekst via `aria-describedby`. Bij een fout krijgt het veld `aria-invalid="true"`. Na submit focust de foutsummary; de eerste link verplaatst focus naar het eerste foutveld. Statusinformatie wordt nooit alleen met kleur weergegeven.

| Veld | Required | Type en grenzen | Cross-fieldvalidatie | Fouttekst | ARIA-contract |
|---|---|---|---|---|---|
| Leeftijd | Ja voor bedrag | Integer 0-120 | Huurjongerenregels gebruiken ook partner/medebewonerleeftijd | `Gebruik een leeftijd tussen 0 en 120 jaar.` | `age-help age-error` |
| Partnerstatus | Ja | `yes/no`, unknown alleen tijdelijk | Partnergegevens required bij `yes` | `Geef aan of je een toeslagpartner hebt of beantwoord de vervolgvraag.` | `partnerStatus-help partnerStatus-error` |
| Toetsingsinkomen | Ja | Geldbedrag >= 0, max 2 decimalen | Bij partner gebruikt de scan gezamenlijk inkomen | `Vul een bedrag van 0 of hoger in voor het toetsingsinkomen.` | `assessmentIncome-help assessmentIncome-error` |
| Partner/gezamenlijk inkomen | Conditioneel | Geldbedrag >= 0 | Required bij partner | `Vul het gezamenlijke toetsingsinkomen in, of ga terug naar partnerstatus.` | `jointAssessmentIncome-help jointAssessmentIncome-error` |
| Vermogen aanvrager | Ja | Geldbedrag >= 0 | Peildatum 1 januari | `Vul het vermogen op 1 januari in als bedrag van 0 of hoger.` | `assets-help assets-error` |
| Partnervermogen | Conditioneel | Geldbedrag >= 0 | Required bij partner; geen stil totaal naar partner splitten | `Vul het partnervermogen in; gebruik geen onbekende standaardwaarde.` | `partnerAssets-help partnerAssets-error` |
| Kale huur | Bij huur | Geldbedrag >= 0 | Servicekosten verhogen de engine-input niet | `Vul de kale huur in zonder servicekosten.` | `basicRent-help basicRent-error` |
| Servicekosten | Optioneel bij huur | Geldbedrag >= 0 | Nooit optellen bij kale huur | `Gebruik 0 of hoger voor servicekosten.` | `serviceCosts-help serviceCosts-error` |
| Zelfstandige woning | Bij huur | `yes/no`, unknown tijdelijk | Nee of unresolved unknown blokkeert bedrag | `Geef aan of de woning zelfstandig is, of beantwoord de uitlegvragen.` | `independentHome-help independentHome-error` |
| Hele kalenderjaar | Ja voor huur/KGB-bedrag | `yes/no` | Nee blokkeert zolang tijdvaklogica ontbreekt | `Deze engine kan alleen een heel kalenderjaar berekenen; kies nee als dit niet zo is.` | `fullYear-help fullYear-error` |
| Medebewoner aantal | Bij medebewoners | Integer >= 0 | Aantal bepaalt repeaterregels | `Vul het aantal medebewoners in als heel getal.` | `coResidents-help coResidents-error` |
| Medebewoner vermogen | Bij medebewoners | Geldbedrag >= 0 per persoon | Per-persoonsgrens, geen totaaldefault | `Vul vermogen per medebewoner in; een totaalbedrag is niet genoeg voor een bedragindicatie.` | `coResidentAssets-help coResidentAssets-error` |
| Geboortedatum kind | Bij kinderen | Datum, niet in toekomst | Aantal regels moet passen bij aantal kinderen | `Gebruik een geboortedatum die niet in de toekomst ligt.` | `childBirthDate-help childBirthDate-error` |
| Kinderbijslag/onderhoud | Per kind | `yes/no`, unknown tijdelijk | Ten minste een kwalificerend kind nodig | `Geef per kind aan of kinderbijslag of onderhoud geldt.` | `childQualification-help childQualification-error` |
| Co-ouderschap | Bij kinderen | `yes/no` | Ja blokkeert KGB-bedrag | `Co-ouderschap wordt nog niet berekend; de scan toont hiervoor een vervolgstap.` | `coParenting-help coParenting-error` |
| Samengesteld gezin | Bij kinderen | `yes/no` | Ja geeft manual review/blocker | `Deze gezinssituatie vraagt een officiele controle.` | `compositeFamily-help compositeFamily-error` |
| LRK | Bij opvang | `yes/no`, unknown tijdelijk | Nee sluit kinderopvangtoeslag normaal uit; unknown blijft signalering | `Geef aan of de opvang een LRK-registratie heeft.` | `lrk-help lrk-error` |
| Opvanguren | Toekomstige bedragfase | Getal >= 0, max 230 subsidiabel per maand in engine | Uren boven cap worden begrensd door engine, niet door UI verborgen | `Gebruik een aantal uren van 0 of hoger.` | `childcareHours-help childcareHours-error` |
| Uurtarief | Toekomstige bedragfase | Geldbedrag >= 0 | Engine past maxuurtarief toe | `Vul het uurtarief in als bedrag van 0 of hoger.` | `hourlyRate-help hourlyRate-error` |

Geen impliciete defaults:

- onbekend inkomen, vermogen, huur, geboortedatum, partnerstatus, woonland of LRK wordt nooit `0`, `nee` of Nederland;
- hidden stale values blijven bewaard voor de gebruiker, maar worden niet gemapt naar engine-input;
- een blocker is een status met reden en vervolgstap, geen validatieclamp.

## 18. Resultaatpresentatie

Iedere toeslagkaart gebruikt hetzelfde publieke resultcontract uit sectie 6. De kaart toont status, bedrag alleen waar verantwoord, belangrijkste redenen, aannames, waarschuwingen, bronjaar, bronnen en vervolgstap.

| Resultaatsoort | Schermpresentatie | Bedragregel | Vervolgstap |
|---|---|---|---|
| Concrete indicatie | Maandbedrag prominent, jaarbedrag secundair, status `Berekend voor standaardscenario`. | Alleen centrale enginebedragen tonen. | `Controleer of vraag aan in Mijn Toeslagen.` |
| Waarschijnlijk geen recht | Uitleg welke harde voorwaarde of nuluitkomst doorslaggevend is. | Alleen EUR 0 tonen als centrale engine expliciet `monthlyAmount: 0` of `yearlyAmount: 0` levert. | `Controleer de doorslaggevende invoer.` |
| Niet berekend door incomplete invoer | Blockerkaart met ontbrekend gegeven, waarom nodig en eerstvolgende vraag. | Geen bedrag, niet optellen. | `Vul dit gegeven aan.` |
| Niet ondersteunde situatie | Status `Niet ondersteund in deze scan`, reason code in Nederlandse uitleg. | Geen bedrag, niet optellen. | `Gebruik Mijn Toeslagen of officiele proefberekening voor deze situatie.` |
| Handmatige beoordeling nodig | Waarschuwingskaart met uitleg waarom standaardregels onvoldoende zijn. | Geen bedrag tenzij een centrale standaardberekening naast niet-blokkerende waarschuwing expliciet bestaat. | `Laat de situatie officieel controleren.` |
| Alleen signalering | Compacte kaart met waarschijnlijk relevant/niet relevant en ontbrekende gegevens. | Geen bedrag. | `Verzamel de genoemde gegevens; bedrag volgt pas na engineactivatie.` |

Gezamenlijke samenvatting:

- `Totaal per maand` telt alleen kaarten met concrete centrale bedragen en status `calculated`.
- `Totaal per jaar` gebruikt dezelfde kaarten en dezelfde afgeronde jaarbedragen als de resultmapper.
- `Niet meegerekend` toont incomplete, unsupported, manual-review en signal-only toeslagen apart.
- Ineligible met expliciet enginebedrag `0` mag als `EUR 0` zichtbaar zijn, maar verhoogt het totaal niet en wordt niet verward met `niet berekend`.
- De samenvatting toont geen totaal als geen enkele toeslag een concrete enginebedragkaart heeft.
- Alle bronjaren en reliabilitylabels komen uit centrale resultaten of resultmapper.

## 19. PDF-contract volledige Toeslagenscan

De PDF gebruikt exact dezelfde data als het scherm:

1. canonieke scaninput na validatie en unknown-resolution;
2. centrale engineresultaten per toeslag;
3. centrale resultmapper voor bedragen, status, rounding, warnings en reason codes;
4. centrale bronmetadata;
5. hetzelfde report/viewmodel dat `Calculator.tsx` rendert of een pure afgeleide daarvan.

De PDF-laag mag geen:

- engine opnieuw aanroepen;
- bedrag afronden met eigen logica;
- bronjaar kiezen;
- hidden stale formvalues gebruiken;
- unsupported of incomplete resultaat als EUR 0 presenteren.

Minimale PDF-structuur:

| Sectie | Inhoud | Bron van waarheid |
|---|---|---|
| Titel en datum | `Toeslagenadvies 2026`, berekeningsdatum | Reportmodel `title`, `generatedAt`, `calculationYear` |
| Samenvatting | totaal maand/jaar voor concrete bedragen, niet-berekende toeslagen apart | Centrale resultmapper |
| Indicatie per toeslag | status, maandbedrag, jaarbedrag, reliability, belangrijkste redenen | `PublicAllowanceBenefitResult` of `AllowanceAdvisorReportResult` |
| Gebruikte invoer | alleen relevante, niet-stale antwoorden | Canonieke scaninput/report `answeredInputs` |
| Afgeleide invoer | afgeleide waarden met bevestigingsstatus | Inference/reportregels |
| Ontbrekende invoer | blockers met reden en vervolgstap | Reason codes en missing inputs |
| Aannames en waarschuwingen | grens, aftopping, servicekosten genegeerd, unsupported situaties | Centrale result warnings/reason codes |
| Officiele bronnen | bronlabels, dataset, versie, URL | Source metadata |
| Vervolgstappen | aanvraag-/wijzigingsstappen en aanvraaglinks | Advisor application guidance |
| Disclaimer | indicatie, geen beschikking, Mijn Toeslagen leidend voor aanvraag/wijziging | Centrale reportdisclaimer |

Privacyregels:

- Gebruik geen volledige geboortedatum in de PDF wanneer leeftijd of geboortejaar voldoende is.
- Neem geen namen, adressen, BSN's, bankgegevens of opvangcontractnummers op.
- Toon kindregels als `Kind 1`, `Kind 2` met leeftijd/geboortejaar en relevante status.
- Toon alleen persoonsgegevens die nodig zijn om de berekening of blocker te begrijpen.
- Bewaar geen PDF-data buiten de browser tenzij een latere privacy- en securitybeslissing dat expliciet toestaat.

Blockers in PDF:

- status `Niet berekend`;
- concrete reden in gebruikerstaal;
- ontbrekend of unsupported gegeven;
- vervolgstap;
- geen bedragkolom met EUR 0;
- niet opgenomen in totaal.

## 20. Scherm/PDF-gelijkheidsmatrix

| Schermveld | PDF-weergave | Resultcomponent | Bron van waarheid | Conditionele zichtbaarheid | Privacybehandeling |
|---|---|---|---|---|---|
| Titel scan | Titel rapport | Report header | `AllowanceAdvisorReportModel.title` | Altijd | Geen persoonsgegevens |
| Berekeningsdatum | Berekeningsdatum | Report header | `generatedAt` uit reportmodel | Altijd | Datum, geen extra input |
| Berekeningsjaar | Berekeningsjaar | Header/samenvatting | Centrale calculation year | Altijd | Geen persoonsgegevens |
| Totaal per maand | Totaal per maand | Summary total | Centrale resultmapper, alleen concrete maandbedragen | Alleen bij >= 1 concrete bedragkaart | Geen detailinput |
| Totaal per jaar | Totaal per jaar | Summary total | Centrale resultmapper, alleen concrete jaarbedragen | Alleen bij >= 1 concrete bedragkaart | Geen detailinput |
| Toeslagstatus | Status per toeslag | Result card/report result | `PublicAllowanceBenefitResult.status` | Altijd per kaart | Geen persoonsgegevens |
| Maandbedrag | Maandbedrag | Result amount | Engine-resultaat via mapper | Alleen `calculated` of expliciet engine-`0` | Bedrag is berekeningsuitkomst |
| Jaarbedrag | Jaarbedrag | Result amount | Engine-resultaat via mapper | Alleen waar maandbedrag ook verantwoord is | Bedrag is berekeningsuitkomst |
| Redenen | Belangrijkste redenen | Reason list | Centrale reason codes + copyadapter | Altijd wanneer aanwezig | Geen ruwe technische codes |
| Waarschuwingen | Waarschuwingen | Warning list | Centrale warnings/reason codes | Alleen wanneer aanwezig | Geen ruwe technische codes |
| Blockers | Niet berekend + vervolgstap | Blocker card/report missing input | Missing fields en reason codes | Alleen incomplete/unsupported/manual-review | Geen EUR 0 |
| Ingevulde leeftijd | Leeftijd | Input summary | Canonieke scaninput | Alleen relevant voor uitkomst | Leeftijd tonen, geen geboortedatum |
| Geboortedatum kind | Leeftijd/geboortejaar kind | Input summary | Canonieke scaninput + afleiding | Alleen KGB/KOT relevant | Geen volledige datum tenzij nodig voor foutuitleg |
| Toetsingsinkomen | Ingevuld inkomen | Input summary | Canonieke scaninput | Alleen relevant voor berekende of geblokkeerde toeslag | Bedrag tonen omdat het uitkomst verklaart |
| Vermogen | Ingevuld vermogen | Input summary | Canonieke scaninput | Alleen relevant voor toeslag met vermogenstoets | Bedrag tonen omdat het blocker/uitkomst verklaart |
| Kale huur | Kale huur | Input summary/result details | Canonieke scaninput | Alleen huurtoeslag relevant | Bedrag tonen |
| Servicekosten | Waarschuwing/servicekostengegeven | Detailregel | Canonieke scaninput + mapperwarning | Alleen ingevuld bij huur | Bedrag tonen, niet optellen |
| Zelfstandige woning | Woningstatus | Input/blocker | Canonieke scaninput | Alleen huur | Ja/nee tonen |
| Co-ouderschap | Blocker of bevestigde nee | Blocker/input summary | Canonieke scaninput | Alleen KGB relevant | Geen extra details over ouderschapsregeling |
| LRK | Signalering/blocker | Childcare card | Canonieke scaninput | Alleen kinderopvang | Geen opvangnaam vereist in PDF |
| Aanvraaglink | Vervolgstap/link | Next steps | Advisor guidance/source links | Per toeslag | Alleen URL/label |
| Bronverwijzingen | Bronnenlijst | Source section | Centrale source metadata | Altijd wanneer resultaat of blocker bronbaar is | Geen inputdata in URL |

Borgingsregels:

- De PDF en schermweergave renderen dezelfde mappervelden; labels komen uit dezelfde copyadapter.
- Afronding vindt uitsluitend in de centrale engine/resultmapper plaats.
- Iedere waarschuwing in de PDF moet ook op het scherm kunnen verschijnen.
- De PDF mag details compacter of uitgebreider tonen, maar niet inhoudelijk anders.

## 21. Implementatievolgorde voor publieke aansluiting

1. Voeg in Fase A `apps/toeslagen-scan/engine-adapters.ts` toe met typed scaninput, vraagconfiguratie en pure mapping zonder publieke bedragactivatie.
2. Voeg adaptertests toe voor conditionele vragen, required-regels, blockers, no-defaults en resultmapping.
3. Sluit de stapsgewijze intake in `Calculator.tsx` aan zonder routes/manifests te wijzigen.
4. Activeer huurtoeslagbedragen pas wanneer alle huurvelden uit sectie 15 concreet beschikbaar zijn en blockers uit sectie 17 getest zijn.
5. Activeer kindgebonden-budgetbedragen pas wanneer geboortedata, per-kind recht, woonland, co-ouderschap en deeljaarblocking getest zijn.
6. Houd kinderopvangtoeslag bedragloos tot een volledige centrale totaalengine bestaat.
7. Sluit PDF pas aan op het gedeelde report/resultmodel nadat schermresultaten stabiel zijn.
8. Draai bij publieke activatie volledige generate-, lint-, typecheck-, test-, build- en browser/UX-checks.

Concrete vervolgprompt voor de Feature Integrator:

```text
Agentchat: Add feature integrator guide

Doel: voer Fase A uit uit docs/toeslagen-scan-integration-guide.md zonder publieke bedragactivatie.

Werk uitsluitend in de Project Site repository op main. Behoud AGENTS.md en ideetjes.txt als gebruikerswijzigingen.

Implementeer:
- apps/toeslagen-scan/engine-adapters.ts met typed PublicAllowanceScanInput, PublicAllowanceBenefitResult en pure mapperfuncties;
- vraagconfiguratie volgens secties 14-17;
- tests voor conditionele vragen, required-regels, co-ouderschapblocker, deeljaarblocker, partnerafhankelijke velden, geboortedatumvalidatie, kale-huurvalidatie, no-defaults en PDF/scherm-resultmapping;
- geen React-bedragactivatie, geen routes, geen manifests, geen engine/source wijzigingen.

Commit bij groen:
feat(allowances): prepare scan form and pdf flow
```
