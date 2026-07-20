export type AllowanceValueSource = {
  readonly regulationId: string;
  readonly calculationYear: 2026;
  readonly value: number | string | readonly number[];
  readonly unit: "eur" | "eur-per-month" | "eur-per-hour" | "percent" | "count" | "boolean" | "text";
  readonly validFrom: string;
  readonly validUntil: string;
  readonly reviewedAt: string;
  readonly officialSourceTitle: string;
  readonly officialSourceUrl: string;
  readonly publicationDate?: string;
  readonly sourceSection: string;
  readonly verificationStatus: "verified" | "blocked-pending-official-normalization";
  readonly interpretationNote: string;
};

export type IncomeToMonthlyAmount = {
  readonly incomeUpTo: number;
  readonly monthlyAmount: number;
};

export type AllowanceCalculationRules2026 = {
  readonly year: 2026;
  readonly ruleVersion: string;
  readonly generatedFor: "calculation-guardian";
  readonly effectiveFrom: string;
  readonly effectiveTo: string;
  readonly officialApplicationUrl: string;
  readonly officialCalculationUrl: string;
  readonly healthcare: {
    readonly requiredInputs: readonly string[];
    readonly minimumAge: AllowanceValueSource;
    readonly maxIncomeSingle: AllowanceValueSource;
    readonly maxIncomeWithPartner: AllowanceValueSource;
    readonly maxAssetsSingle: AllowanceValueSource;
    readonly maxAssetsWithPartner: AllowanceValueSource;
    readonly monthlyTableSingle: readonly IncomeToMonthlyAmount[];
    readonly monthlyTableWithPartner: readonly IncomeToMonthlyAmount[];
    readonly calculationNotes: readonly string[];
  };
  readonly rent: {
    readonly requiredInputs: readonly string[];
    readonly maxAssetsSingle: AllowanceValueSource;
    readonly maxAssetsWithPartner: AllowanceValueSource;
    readonly maxAssetsPerCoResident: AllowanceValueSource;
    readonly cappedRentThreshold: AllowanceValueSource;
    readonly cappedRentThresholdUnder21: AllowanceValueSource;
    readonly calculationNotes: readonly string[];
    readonly blockers: readonly string[];
  };
  readonly childBudget: {
    readonly requiredInputs: readonly string[];
    readonly maxAssetsSingle: AllowanceValueSource;
    readonly maxAssetsWithPartner: AllowanceValueSource;
    readonly thresholdIncomeSingleParentChange2026: AllowanceValueSource;
    readonly thresholdIncomePartnersChange2026: AllowanceValueSource;
    readonly calculationNotes: readonly string[];
    readonly blockers: readonly string[];
  };
  readonly childcare: {
    readonly requiredInputs: readonly string[];
    readonly maxHoursPerMonth: AllowanceValueSource;
    readonly maxHourlyRateDaycare: AllowanceValueSource;
    readonly maxHourlyRateOutOfSchoolCare: AllowanceValueSource;
    readonly maxHourlyRateChildminderCare: AllowanceValueSource;
    readonly calculationNotes: readonly string[];
    readonly blockers: readonly string[];
  };
  readonly unknownRoutes: readonly {
    readonly fieldId: string;
    readonly followUpOrder: readonly string[];
    readonly inferableWhen: string;
    readonly confirmationRequired: string;
    readonly blockingWhen: string;
  }[];
  readonly officialTestVectors: readonly {
    readonly id: string;
    readonly allowance: "healthcare" | "rent" | "child-budget" | "childcare";
    readonly input: Readonly<Record<string, number | string | boolean>>;
    readonly expected: Readonly<Record<string, number | string | boolean>>;
    readonly sourceRuleIds: readonly string[];
  }[];
};

const reviewedAt = "2026-07-20";
const validFrom = "2026-01-01";
const validUntil = "2026-12-31";

function valueSource(input: Omit<AllowanceValueSource, "calculationYear" | "validFrom" | "validUntil" | "reviewedAt">): AllowanceValueSource {
  return {
    calculationYear: 2026,
    validFrom,
    validUntil,
    reviewedAt,
    ...input,
  };
}

export const ALLOWANCE_CALCULATION_RULES_2026: AllowanceCalculationRules2026 = {
  year: 2026,
  ruleVersion: "0.1.0",
  generatedFor: "calculation-guardian",
  effectiveFrom: validFrom,
  effectiveTo: validUntil,
  officialApplicationUrl:
    "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/aanvragen/ik-wil-een-toeslag-aanvragen",
  officialCalculationUrl:
    "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
  healthcare: {
    requiredInputs: [
      "age",
      "hasDutchHealthInsurance",
      "partnerStatus",
      "assessmentIncome or jointAssessmentIncome",
      "assets or jointAssets on 2026-01-01",
    ],
    minimumAge: valueSource({
      regulationId: "allowance.healthcare.minimum-age.2026",
      value: 18,
      unit: "count",
      officialSourceTitle: "Wat zijn de voorwaarden voor zorgtoeslag?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/kan-ik-zorgtoeslag-krijgen",
      publicationDate: "2026-07-16",
      sourceSection: "U bent 18 jaar of ouder",
      verificationStatus: "verified",
      interpretationNote: "Wettelijke harde voorwaarde; aanvraag kan pas na afsluiten eigen Nederlandse zorgverzekering.",
    }),
    maxIncomeSingle: valueSource({
      regulationId: "allowance.healthcare.max-income-single.2026",
      value: 40_857,
      unit: "eur",
      officialSourceTitle: "Hoe hoog mag mijn inkomen zijn voor zorgtoeslag?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag",
      publicationDate: "2026-07-16",
      sourceSection: "Inkomen 2026 zonder toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Toetsingsinkomen per jaar; boven deze grens geen zorgtoeslag volgens Dienst Toeslagen.",
    }),
    maxIncomeWithPartner: valueSource({
      regulationId: "allowance.healthcare.max-income-with-partner.2026",
      value: 51_142,
      unit: "eur",
      officialSourceTitle: "Hoe hoog mag mijn inkomen zijn voor zorgtoeslag?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag",
      publicationDate: "2026-07-16",
      sourceSection: "Gezamenlijk inkomen 2026 met toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Gezamenlijk toetsingsinkomen per jaar; boven deze grens geen zorgtoeslag.",
    }),
    maxAssetsSingle: valueSource({
      regulationId: "allowance.healthcare.max-assets-single.2026",
      value: 146_011,
      unit: "eur",
      officialSourceTitle: "Hoeveel vermogen mag ik hebben om zorgtoeslag te krijgen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-vermogen-zorgtoeslag",
      publicationDate: "2026-07-16",
      sourceSection: "Vermogen op 1 januari 2026 zonder toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Vermogenstoets op 1 januari 2026.",
    }),
    maxAssetsWithPartner: valueSource({
      regulationId: "allowance.healthcare.max-assets-with-partner.2026",
      value: 184_633,
      unit: "eur",
      officialSourceTitle: "Hoeveel vermogen mag ik hebben om zorgtoeslag te krijgen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-vermogen-zorgtoeslag",
      publicationDate: "2026-07-16",
      sourceSection: "Vermogen op 1 januari 2026 met toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Gezamenlijke vermogenstoets op 1 januari 2026.",
    }),
    monthlyTableSingle: [
      { incomeUpTo: 29_500, monthlyAmount: 129 },
      { incomeUpTo: 30_000, monthlyAmount: 126 },
      { incomeUpTo: 30_500, monthlyAmount: 120 },
      { incomeUpTo: 31_000, monthlyAmount: 114 },
      { incomeUpTo: 31_500, monthlyAmount: 109 },
      { incomeUpTo: 32_000, monthlyAmount: 103 },
      { incomeUpTo: 32_500, monthlyAmount: 97 },
      { incomeUpTo: 33_000, monthlyAmount: 91 },
      { incomeUpTo: 33_500, monthlyAmount: 86 },
      { incomeUpTo: 34_000, monthlyAmount: 80 },
      { incomeUpTo: 34_500, monthlyAmount: 74 },
      { incomeUpTo: 35_000, monthlyAmount: 69 },
      { incomeUpTo: 35_500, monthlyAmount: 63 },
      { incomeUpTo: 36_000, monthlyAmount: 57 },
      { incomeUpTo: 36_500, monthlyAmount: 51 },
      { incomeUpTo: 37_000, monthlyAmount: 46 },
      { incomeUpTo: 37_500, monthlyAmount: 40 },
      { incomeUpTo: 38_000, monthlyAmount: 34 },
      { incomeUpTo: 38_500, monthlyAmount: 28 },
      { incomeUpTo: 39_000, monthlyAmount: 23 },
      { incomeUpTo: 39_500, monthlyAmount: 17 },
      { incomeUpTo: 40_000, monthlyAmount: 11 },
      { incomeUpTo: 40_500, monthlyAmount: 6 },
      { incomeUpTo: 41_000, monthlyAmount: 0 },
    ],
    monthlyTableWithPartner: [
      { incomeUpTo: 29_500, monthlyAmount: 246 },
      { incomeUpTo: 30_000, monthlyAmount: 243 },
      { incomeUpTo: 30_500, monthlyAmount: 238 },
      { incomeUpTo: 31_000, monthlyAmount: 232 },
      { incomeUpTo: 31_500, monthlyAmount: 226 },
      { incomeUpTo: 32_000, monthlyAmount: 221 },
      { incomeUpTo: 32_500, monthlyAmount: 215 },
      { incomeUpTo: 33_000, monthlyAmount: 209 },
      { incomeUpTo: 33_500, monthlyAmount: 203 },
      { incomeUpTo: 34_000, monthlyAmount: 198 },
      { incomeUpTo: 34_500, monthlyAmount: 192 },
      { incomeUpTo: 35_000, monthlyAmount: 186 },
      { incomeUpTo: 35_500, monthlyAmount: 180 },
      { incomeUpTo: 36_000, monthlyAmount: 175 },
      { incomeUpTo: 36_500, monthlyAmount: 169 },
      { incomeUpTo: 37_000, monthlyAmount: 163 },
      { incomeUpTo: 37_500, monthlyAmount: 158 },
      { incomeUpTo: 38_000, monthlyAmount: 152 },
      { incomeUpTo: 38_500, monthlyAmount: 146 },
      { incomeUpTo: 39_000, monthlyAmount: 140 },
      { incomeUpTo: 39_500, monthlyAmount: 135 },
      { incomeUpTo: 40_000, monthlyAmount: 129 },
      { incomeUpTo: 40_500, monthlyAmount: 123 },
      { incomeUpTo: 41_000, monthlyAmount: 118 },
      { incomeUpTo: 41_500, monthlyAmount: 112 },
      { incomeUpTo: 42_000, monthlyAmount: 106 },
      { incomeUpTo: 42_500, monthlyAmount: 100 },
      { incomeUpTo: 43_000, monthlyAmount: 95 },
      { incomeUpTo: 43_500, monthlyAmount: 89 },
      { incomeUpTo: 44_000, monthlyAmount: 83 },
      { incomeUpTo: 44_500, monthlyAmount: 78 },
      { incomeUpTo: 45_000, monthlyAmount: 72 },
      { incomeUpTo: 45_500, monthlyAmount: 66 },
      { incomeUpTo: 46_000, monthlyAmount: 60 },
      { incomeUpTo: 46_500, monthlyAmount: 55 },
      { incomeUpTo: 47_000, monthlyAmount: 49 },
      { incomeUpTo: 47_500, monthlyAmount: 43 },
      { incomeUpTo: 48_000, monthlyAmount: 37 },
      { incomeUpTo: 48_500, monthlyAmount: 32 },
      { incomeUpTo: 49_000, monthlyAmount: 26 },
      { incomeUpTo: 49_500, monthlyAmount: 20 },
      { incomeUpTo: 50_000, monthlyAmount: 15 },
      { incomeUpTo: 50_500, monthlyAmount: 9 },
      { incomeUpTo: 51_000, monthlyAmount: 3 },
      { incomeUpTo: 51_500, monthlyAmount: 0 },
    ],
    calculationNotes: [
      "Tabelbedragen zijn maandbedragen uit de officiele Dienst Toeslagen-pagina; 0-regels markeren de publieke tabelrij 'en meer'.",
      "Voor latere implementatie moet de Calculation Guardian bepalen of tabellookup of wettelijke formule leidend wordt gebruikt.",
      "Start na 18e verjaardag en verzekering per maand blijven apart te modelleren tijdvakregels.",
    ],
  },
  rent: {
    requiredInputs: [
      "age",
      "tenure",
      "independentHome",
      "basicRent",
      "eligibleServiceCosts",
      "partnerStatus",
      "coResidents",
      "householdIncome",
      "householdAssets on 2026-01-01",
    ],
    maxAssetsSingle: valueSource({
      regulationId: "allowance.rent.max-assets-single.2026",
      value: 38_479,
      unit: "eur",
      officialSourceTitle: "Hoeveel vermogen mag ik hebben om huurtoeslag te krijgen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/maximaal-vermogen-huurtoeslag",
      publicationDate: "2026-07-16",
      sourceSection: "Vermogen op 1 januari 2026 zonder toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Per-bewoner vermogenstoets; thuiswonend minderjarig kind telt mee bij het vermogen.",
    }),
    maxAssetsWithPartner: valueSource({
      regulationId: "allowance.rent.max-assets-with-partner.2026",
      value: 76_958,
      unit: "eur",
      officialSourceTitle: "Hoeveel vermogen mag ik hebben om huurtoeslag te krijgen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/maximaal-vermogen-huurtoeslag",
      publicationDate: "2026-07-16",
      sourceSection: "Vermogen op 1 januari 2026 met toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Gezamenlijke vermogenstoets voor toeslagpartners; medebewoners hebben eigen grens.",
    }),
    maxAssetsPerCoResident: valueSource({
      regulationId: "allowance.rent.max-assets-per-co-resident.2026",
      value: 38_479,
      unit: "eur",
      officialSourceTitle: "Kan ik huurtoeslag krijgen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen",
      publicationDate: "2026-07-16",
      sourceSection: "Uw vermogen mag niet te hoog zijn",
      verificationStatus: "verified",
      interpretationNote: "Iedere bewoner mag op 1 januari 2026 maximaal dit vermogen hebben, partners samen tweemaal deze grens.",
    }),
    cappedRentThreshold: valueSource({
      regulationId: "allowance.rent.capped-rent-threshold.2026",
      value: 932.93,
      unit: "eur-per-month",
      officialSourceTitle: "Huurtoeslag verandert vanaf 2026",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/huurtoeslag-verandert-vanaf-2026",
      publicationDate: "2026-07-16",
      sourceSection: "Geen maximale huurgrens meer",
      verificationStatus: "verified",
      interpretationNote: "Vanaf 2026 geen harde maximale huurgrens voor recht; deze maximale huur begrenst de berekening van de hoogte.",
    }),
    cappedRentThresholdUnder21: valueSource({
      regulationId: "allowance.rent.capped-rent-threshold-under-21.2026",
      value: 498.20,
      unit: "eur-per-month",
      officialSourceTitle: "Huurtoeslag verandert vanaf 2026",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/huurtoeslag-verandert-vanaf-2026",
      publicationDate: "2026-07-16",
      sourceSection: "Nieuwe leeftijdsgrens voor jongeren: tot 21 jaar",
      verificationStatus: "verified",
      interpretationNote: "Lagere berekeningsgrens voor jongeren tot 21 jaar; jongeren van 21 en 22 jaar vallen vanaf 2026 niet meer onder deze lagere grens.",
    }),
    calculationNotes: [
      "De publieke Dienst Toeslagen-uitleg geeft geen eenvoudige algemene inkomensgrens; inkomen, huur, huishoudgrootte en leeftijd bepalen samen het bedrag.",
      "Rekenhuur bestaat uit kale huur plus subsidiabele servicekosten; splitsing en maxima per servicekostensoort moeten nog uit officiele berekeningsdocumentatie worden genormaliseerd.",
    ],
    blockers: [
      "Volledige huurtoeslagformule 2026, basishuur, kwaliteitskorting, aftoppingsgrenzen en afbouw zijn nog niet als gevalideerde centrale tabel vastgelegd.",
      "Bijzondere woonvormen, aangepaste woning, onderhuur, overlijden en medebewoners vereisen aparte uitzonderingsregels.",
    ],
  },
  childBudget: {
    requiredInputs: [
      "partnerStatus",
      "assessmentIncome or jointAssessmentIncome",
      "assets or jointAssets on 2026-01-01",
      "children under 18",
      "child ages",
      "child benefit or official exception",
      "child residence or co-parenting status",
    ],
    maxAssetsSingle: valueSource({
      regulationId: "allowance.child-budget.max-assets-single.2026",
      value: 146_011,
      unit: "eur",
      officialSourceTitle: "Hoeveel vermogen mag ik hebben om kindgebonden budget te krijgen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-vermogen-kindgebonden-budget",
      publicationDate: "2026-07-16",
      sourceSection: "Maximaal vermogen kindgebonden budget 2026 zonder toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Vermogenstoets voor kindgebonden budget; vermogen van minderjarige kinderen telt mee.",
    }),
    maxAssetsWithPartner: valueSource({
      regulationId: "allowance.child-budget.max-assets-with-partner.2026",
      value: 184_633,
      unit: "eur",
      officialSourceTitle: "Hoeveel vermogen mag ik hebben om kindgebonden budget te krijgen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-vermogen-kindgebonden-budget",
      publicationDate: "2026-07-16",
      sourceSection: "Maximaal vermogen kindgebonden budget 2026 met toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Gezamenlijke vermogenstoets voor kindgebonden budget.",
    }),
    thresholdIncomeSingleParentChange2026: valueSource({
      regulationId: "allowance.child-budget.change-threshold-single-parent.2026",
      value: 29_736,
      unit: "eur",
      officialSourceTitle: "Wat verandert er in 2026 voor uw toeslagen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen-2026/topics/veranderingen-toeslagen-2026",
      publicationDate: "2026-07-16",
      sourceSection: "Kindgebonden budget",
      verificationStatus: "verified",
      interpretationNote: "Publieke wijzigingsgrens voor hogere uitkomst bij alleenstaande ouders; niet gebruiken als volledige inkomensgrens.",
    }),
    thresholdIncomePartnersChange2026: valueSource({
      regulationId: "allowance.child-budget.change-threshold-partners.2026",
      value: 39_141,
      unit: "eur",
      officialSourceTitle: "Wat verandert er in 2026 voor uw toeslagen?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen-2026/topics/veranderingen-toeslagen-2026",
      publicationDate: "2026-07-16",
      sourceSection: "Kindgebonden budget",
      verificationStatus: "verified",
      interpretationNote: "Publieke wijzigingsgrens voor stellen; niet gebruiken als volledige inkomensgrens of rechtgrens.",
    }),
    calculationNotes: [
      "Officiele uitleg bevestigt afhankelijkheid van inkomen, gezinssituatie, aantal kinderen, leeftijden 12/16 jaar en alleenstaande-ouderkop.",
      "Publieke pagina verwijst voor exact bedrag naar proefberekening; volledige reken-PDF moet apart genormaliseerd worden.",
    ],
    blockers: [
      "Maximumbedragen per kind, alleenstaande-ouderkop, leeftijdsverhogingen en afbouwpercentage 2026 zijn nog niet volledig centraal vastgelegd.",
      "Co-ouderschap, samengesteld gezin, pleeg-/stief-/adoptiekind en buitenlandse kinderen vereisen aparte uitzonderingsregels.",
    ],
  },
  childcare: {
    requiredInputs: [
      "partnerStatus",
      "assessmentIncome or jointAssessmentIncome",
      "children using childcare",
      "registered childcare",
      "LRK number",
      "childcare type per child",
      "paid hourly rate per child",
      "hours per month per child",
      "applicant qualifying activity",
      "partner qualifying activity when partner exists",
      "own contribution paid",
    ],
    maxHoursPerMonth: valueSource({
      regulationId: "allowance.childcare.max-hours-per-month.2026",
      value: 230,
      unit: "count",
      officialSourceTitle: "Wat zijn de voorwaarden voor kinderopvangtoeslag?",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/kan-ik-kinderopvangtoeslag-krijgen",
      sourceSection: "Aantal opvanguren",
      verificationStatus: "verified",
      interpretationNote: "Kinderopvangtoeslag kan worden berekend over maximaal 230 uur per kind per maand.",
    }),
    maxHourlyRateDaycare: valueSource({
      regulationId: "allowance.childcare.max-hourly-rate-daycare.2026",
      value: 11.23,
      unit: "eur-per-hour",
      officialSourceTitle: "Maximale uurprijs voor de kinderopvangtoeslag",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/maximaal-uurtarief-voor-de-kinderopvang",
      publicationDate: "2026-07-16",
      sourceSection: "Maximale uurprijs dagopvang 2026",
      verificationStatus: "verified",
      interpretationNote: "Kosten boven dit uurtarief worden niet meegenomen voor kinderopvangtoeslag.",
    }),
    maxHourlyRateOutOfSchoolCare: valueSource({
      regulationId: "allowance.childcare.max-hourly-rate-out-of-school-care.2026",
      value: 9.98,
      unit: "eur-per-hour",
      officialSourceTitle: "Maximale uurprijs voor de kinderopvangtoeslag",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/maximaal-uurtarief-voor-de-kinderopvang",
      publicationDate: "2026-07-16",
      sourceSection: "Maximale uurprijs buitenschoolse opvang 2026",
      verificationStatus: "verified",
      interpretationNote: "Kosten boven dit uurtarief worden niet meegenomen voor kinderopvangtoeslag.",
    }),
    maxHourlyRateChildminderCare: valueSource({
      regulationId: "allowance.childcare.max-hourly-rate-childminder.2026",
      value: 8.49,
      unit: "eur-per-hour",
      officialSourceTitle: "Maximale uurprijs voor de kinderopvangtoeslag",
      officialSourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/maximaal-uurtarief-voor-de-kinderopvang",
      publicationDate: "2026-07-16",
      sourceSection: "Maximale uurprijs gastouderopvang 2026",
      verificationStatus: "verified",
      interpretationNote: "Kosten boven dit uurtarief worden niet meegenomen voor kinderopvangtoeslag.",
    }),
    calculationNotes: [
      "Bedrag volgt uit opvangkosten, maximaal uurtarief, aantal uren, inkomen en percentage per eerste/volgende kind.",
      "Alle kinderen, opvangsoorten en uurtarieven moeten per kind/per opvangcontract gemodelleerd worden.",
    ],
    blockers: [
      "Vergoedingstabel 2026 per inkomen, eerste kind en volgende kinderen moet uit de officiele berekening worden genormaliseerd.",
      "Werk/opleiding/traject-erkenning en LRK-registratie kunnen niet betrouwbaar volledig worden afgeleid zonder officiele controle.",
    ],
  },
  unknownRoutes: [
    {
      fieldId: "partnerStatus",
      followUpOrder: ["getrouwd/geregistreerd partner", "samenwonend met kind/woning/pensioenregeling", "vorig jaar toeslagpartner"],
      inferableWhen: "Alleen veilig afleidbaar als gebruiker expliciet geen enkele officiele partnertrigger bevestigt.",
      confirmationRequired: "Altijd, omdat partnerstatus meerdere toeslagen en gezamenlijke grenzen wijzigt.",
      blockingWhen: "Als gebruiker partnertriggers niet kan beoordelen; toon officiele partnercheck.",
    },
    {
      fieldId: "assessmentIncome",
      followUpOrder: ["verwachte jaarinkomen", "laatste loonstrook/uitkering", "aangifte of voorlopige aanslag", "inkomenswijzigingen dit jaar"],
      inferableWhen: "Alleen als gebruiker maandinkomen en vakantiegeld/13e maand redelijk kan schatten.",
      confirmationRequired: "Altijd, omdat Dienst Toeslagen op toetsingsinkomen beslist.",
      blockingWhen: "Bij sterk wisselend inkomen zonder bandbreedte; alleen signaal of brede schatting.",
    },
    {
      fieldId: "assets",
      followUpOrder: ["saldo 1 januari 2026", "spaargeld/beleggingen", "schulden die meetellen", "vermogen minderjarige kinderen"],
      inferableWhen: "Niet veilig uit andere Project Site-tools afleidbaar zonder expliciete peildatum.",
      confirmationRequired: "Altijd.",
      blockingWhen: "Bij onbekend vermogen rond harde grens.",
    },
    {
      fieldId: "rent.basicRent",
      followUpOrder: ["huurcontract", "specificatie kale huur", "servicekosten uitsplitsen", "rekenhuur bevestigen"],
      inferableWhen: "Alleen als gebruiker kale huur en subsidiabele servicekosten apart invult.",
      confirmationRequired: "Altijd.",
      blockingWhen: "Als alleen totaalbedrag bekend is en servicekosten niet kunnen worden uitgesplitst.",
    },
    {
      fieldId: "childcare.registeredChildcare",
      followUpOrder: ["LRK-nummer op contract/factuur", "opvangsoort", "startdatum registratie"],
      inferableWhen: "Niet uit bedragen afleiden; LRK of officiele registratie is nodig.",
      confirmationRequired: "Altijd.",
      blockingWhen: "Als LRK/registratie onbekend blijft.",
    },
    {
      fieldId: "childcare.hoursAndHourlyRate",
      followUpOrder: ["contracturen per maand", "factuururen", "uurtarief per opvangsoort", "eerste/volgende kind bepalen"],
      inferableWhen: "Alleen uit contract/factuur die gebruiker bevestigt.",
      confirmationRequired: "Altijd per kind en opvangsoort.",
      blockingWhen: "Als uren of tarief ontbreken; bedrag kan dan niet verantwoord worden geschat.",
    },
  ],
  officialTestVectors: [
    {
      id: "healthcare-single-income-29500",
      allowance: "healthcare",
      input: { partnerStatus: "no", assessmentIncome: 29_500, assets: 0, age: 18, hasDutchHealthInsurance: true },
      expected: { monthlyAmount: 129, annualAmount: 1_548, hardExclusion: false },
      sourceRuleIds: ["allowance.healthcare.monthly-table-single.2026"],
    },
    {
      id: "healthcare-partners-income-51000",
      allowance: "healthcare",
      input: { partnerStatus: "yes", jointAssessmentIncome: 51_000, jointAssets: 0, age: 18, hasDutchHealthInsurance: true },
      expected: { monthlyAmount: 3, annualAmount: 36, hardExclusion: false },
      sourceRuleIds: ["allowance.healthcare.monthly-table-with-partner.2026"],
    },
    {
      id: "rent-assets-single-above-limit",
      allowance: "rent",
      input: { partnerStatus: "no", assets: 38_480, age: 30, tenure: "rent", independentHome: true },
      expected: { hardExclusion: true, reasonCode: "rent-assets-above-limit" },
      sourceRuleIds: ["allowance.rent.max-assets-single.2026"],
    },
    {
      id: "childcare-daycare-hourly-cap",
      allowance: "childcare",
      input: { childcareType: "daycare", hourlyRate: 12, hoursPerMonth: 100 },
      expected: { cappedHourlyRate: 11.23, cappedMonthlyCosts: 1_123 },
      sourceRuleIds: ["allowance.childcare.max-hourly-rate-daycare.2026"],
    },
  ],
};
