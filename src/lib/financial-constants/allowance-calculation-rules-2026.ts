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

export type AllowanceCalculationReadiness =
  | "amount-ready"
  | "signal-only"
  | "blocked-pending-formula";

export type ChildcarePercentageBand = {
  readonly incomeFrom: number;
  readonly incomeTo: number;
  readonly firstChildPercent: number;
  readonly nextChildPercent: number;
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
    readonly calculationStatus: AllowanceCalculationReadiness;
    readonly requiredInputs: readonly string[];
    readonly maxAssetsSingle: AllowanceValueSource;
    readonly maxAssetsWithPartner: AllowanceValueSource;
    readonly maxAssetsPerCoResident: AllowanceValueSource;
    readonly cappedRentThreshold: AllowanceValueSource;
    readonly cappedRentThresholdUnder21: AllowanceValueSource;
    readonly baseRentSingleHousehold: AllowanceValueSource;
    readonly baseRentMultiPersonHousehold: AllowanceValueSource;
    readonly qualityDiscountThreshold: AllowanceValueSource;
    readonly cappingThresholdOneOrTwoPersons: AllowanceValueSource;
    readonly cappingThresholdThreeOrMorePersons: AllowanceValueSource;
    readonly childIncomeExemptionUnder23: AllowanceValueSource;
    readonly incomeReferencePointSingleHousehold: AllowanceValueSource;
    readonly incomeReferencePointMultiPersonHousehold: AllowanceValueSource;
    readonly incomeTaperSingleHousehold: AllowanceValueSource;
    readonly incomeTaperMultiPersonHousehold: AllowanceValueSource;
    readonly qualityDiscountReimbursementPercent: AllowanceValueSource;
    readonly cappingBandReimbursementPercent: AllowanceValueSource;
    readonly aboveCappingReimbursementPercent: AllowanceValueSource;
    readonly roundingRule: AllowanceValueSource;
    readonly calculationSteps: readonly string[];
    readonly calculationNotes: readonly string[];
    readonly blockers: readonly string[];
  };
  readonly childBudget: {
    readonly calculationStatus: AllowanceCalculationReadiness;
    readonly requiredInputs: readonly string[];
    readonly maxAssetsSingle: AllowanceValueSource;
    readonly maxAssetsWithPartner: AllowanceValueSource;
    readonly thresholdIncomeSingleParentChange2026: AllowanceValueSource;
    readonly thresholdIncomePartnersChange2026: AllowanceValueSource;
    readonly maxAnnualOneChildSingleParent: AllowanceValueSource;
    readonly maxAnnualTwoChildrenSingleParent: AllowanceValueSource;
    readonly maxAnnualOneChildWithPartner: AllowanceValueSource;
    readonly maxAnnualTwoChildrenWithPartner: AllowanceValueSource;
    readonly additionalAnnualFromThirdChild: AllowanceValueSource;
    readonly ageIncrease12To15: AllowanceValueSource;
    readonly ageIncrease16To17: AllowanceValueSource;
    readonly taperPercent: AllowanceValueSource;
    readonly domesticResidenceFactor: AllowanceValueSource;
    readonly roundingRule: AllowanceValueSource;
    readonly calculationSteps: readonly string[];
    readonly calculationNotes: readonly string[];
    readonly blockers: readonly string[];
  };
  readonly childcare: {
    readonly calculationStatus: AllowanceCalculationReadiness;
    readonly requiredInputs: readonly string[];
    readonly maxHoursPerMonth: AllowanceValueSource;
    readonly maxHourlyRateDaycare: AllowanceValueSource;
    readonly maxHourlyRateOutOfSchoolCare: AllowanceValueSource;
    readonly maxHourlyRateChildminderCare: AllowanceValueSource;
    readonly firstChildRule: AllowanceValueSource;
    readonly roundingRule: AllowanceValueSource;
    readonly percentageTable: readonly ChildcarePercentageBand[];
    readonly calculationSteps: readonly string[];
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
    calculationStatus: "amount-ready",
    requiredInputs: [
      "age",
      "tenure",
      "independentHome",
      "basicRent",
      "partnerStatus",
      "coResidents",
      "householdMemberAges",
      "hasChildOrDisabilityExceptionWhenUnder21",
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
    baseRentSingleHousehold: valueSource({
      regulationId: "allowance.rent.base-rent-single-household.2026",
      value: 202.52,
      unit: "eur-per-month",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 2: bepaal de basishuur",
      verificationStatus: "verified",
      interpretationNote: "Basishuur voor huishoudens van 1 persoon; vanaf 2026 niet meer inkomensafhankelijk.",
    }),
    baseRentMultiPersonHousehold: valueSource({
      regulationId: "allowance.rent.base-rent-multi-person-household.2026",
      value: 200.71,
      unit: "eur-per-month",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 2: bepaal de basishuur",
      verificationStatus: "verified",
      interpretationNote: "Basishuur voor huishoudens van 2 of meer personen.",
    }),
    qualityDiscountThreshold: valueSource({
      regulationId: "allowance.rent.quality-discount-threshold.2026",
      value: 498.20,
      unit: "eur-per-month",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 3: bepaal de kwaliteitskortingsgrens",
      verificationStatus: "verified",
      interpretationNote: "Voor iedereen gelijk; deel tussen basishuur en deze grens wordt voor 100 procent vergoed.",
    }),
    cappingThresholdOneOrTwoPersons: valueSource({
      regulationId: "allowance.rent.capping-threshold-one-or-two-persons.2026",
      value: 713.02,
      unit: "eur-per-month",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 4: bepaal de aftoppingsgrens",
      verificationStatus: "verified",
      interpretationNote: "Aftoppingsgrens voor huishoudens van 1 of 2 personen met minimaal 1 persoon van 21 jaar of ouder.",
    }),
    cappingThresholdThreeOrMorePersons: valueSource({
      regulationId: "allowance.rent.capping-threshold-three-or-more-persons.2026",
      value: 764.14,
      unit: "eur-per-month",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 4: bepaal de aftoppingsgrens",
      verificationStatus: "verified",
      interpretationNote: "Aftoppingsgrens voor huishoudens van 3 of meer personen met minimaal 1 persoon van 21 jaar of ouder.",
    }),
    childIncomeExemptionUnder23: valueSource({
      regulationId: "allowance.rent.child-income-exemption-under-23.2026",
      value: 6218,
      unit: "eur",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 5: Kinderen",
      verificationStatus: "verified",
      interpretationNote: "Voor inwonende kinderen die bij aanvang van 2026 jonger zijn dan 23 jaar telt alleen inkomen boven deze vrijstelling mee.",
    }),
    incomeReferencePointSingleHousehold: valueSource({
      regulationId: "allowance.rent.income-reference-point-single-household.2026",
      value: 23425,
      unit: "eur",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 6: Bepaal de inkomensafhankelijke correctie",
      verificationStatus: "verified",
      interpretationNote: "Boven dit rekeninkomen geldt voor eenpersoonshuishoudens de inkomensafhankelijke correctie.",
    }),
    incomeReferencePointMultiPersonHousehold: valueSource({
      regulationId: "allowance.rent.income-reference-point-multi-person-household.2026",
      value: 31500,
      unit: "eur",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 6: Bepaal de inkomensafhankelijke correctie",
      verificationStatus: "verified",
      interpretationNote: "Boven dit rekeninkomen geldt voor meerpersoonshuishoudens de inkomensafhankelijke correctie.",
    }),
    incomeTaperSingleHousehold: valueSource({
      regulationId: "allowance.rent.income-taper-single-household.2026",
      value: 27,
      unit: "percent",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 6: Bepaal de inkomensafhankelijke correctie",
      verificationStatus: "verified",
      interpretationNote: "Jaarpercentage; maandcorrectie is (rekeninkomen - ijkpunt) x (27 procent / 12).",
    }),
    incomeTaperMultiPersonHousehold: valueSource({
      regulationId: "allowance.rent.income-taper-multi-person-household.2026",
      value: 22,
      unit: "percent",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 6: Bepaal de inkomensafhankelijke correctie",
      verificationStatus: "verified",
      interpretationNote: "Jaarpercentage; maandcorrectie is (rekeninkomen - ijkpunt) x (22 procent / 12).",
    }),
    qualityDiscountReimbursementPercent: valueSource({
      regulationId: "allowance.rent.quality-discount-reimbursement-percent.2026",
      value: 100,
      unit: "percent",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 7: Onderdeel A",
      verificationStatus: "verified",
      interpretationNote: "Vergoeding over deel boven basishuur tot en met kwaliteitskortingsgrens.",
    }),
    cappingBandReimbursementPercent: valueSource({
      regulationId: "allowance.rent.capping-band-reimbursement-percent.2026",
      value: 65,
      unit: "percent",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 7: Onderdeel B",
      verificationStatus: "verified",
      interpretationNote: "Vergoeding over deel boven kwaliteitskortingsgrens tot en met aftoppingsgrens.",
    }),
    aboveCappingReimbursementPercent: valueSource({
      regulationId: "allowance.rent.above-capping-reimbursement-percent.2026",
      value: 40,
      unit: "percent",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 7: Onderdeel C",
      verificationStatus: "verified",
      interpretationNote: "Vergoeding over deel boven aftoppingsgrens tot aan huurgrens van 932,93.",
    }),
    roundingRule: valueSource({
      regulationId: "allowance.rent.rounding-monthly-down-whole-euros.2026",
      value: "round-monthly-down-whole-euros",
      unit: "text",
      officialSourceTitle: "Berekening huurtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_huurtoeslag_tg0831z62fd.pdf",
      publicationDate: "2026-06-01",
      sourceSection: "Stap 7: Totaalbedrag huurtoeslag per maand",
      verificationStatus: "verified",
      interpretationNote: "Officiële voorbeelden ronden het maandbedrag naar beneden af op hele euro's.",
    }),
    calculationSteps: [
      "1. Bepaal rechtvoorwaarden: huurwoning, zelfstandige woonruimte of expliciete uitzondering, inschrijving, leeftijd, partner/medebewoners en vermogen per 1 januari 2026.",
      "2. Bepaal rekenhuur: vanaf 2026 kale huur; servicekosten tellen niet mee. Cap op 498,20 als iedereen jonger dan 21 is, behalve bij (pleeg)kind of handicap; anders cap op 932,93.",
      "3. Kies basishuur: 202,52 voor 1-persoonshuishouden, 200,71 voor 2 of meer personen.",
      "4. Deel A = max(min(rekenhuur, 498,20) - basishuur, 0) x 100%. Als rekenhuur niet boven basishuur ligt, is toeslag 0.",
      "5. Als iedereen jonger dan 21 is en geen uitzondering geldt: sla aftoppingsdelen over; alleen deel A telt.",
      "6. Kies aftoppingsgrens: 713,02 bij 1 of 2 personen, 764,14 bij 3 of meer personen.",
      "7. Deel B = max(min(rekenhuur, aftoppingsgrens) - 498,20, 0) x 65%.",
      "8. Deel C = max(rekenhuur - aftoppingsgrens, 0) x 40%, gemaximeerd doordat rekenhuur al is gecapt.",
      "9. Bereken rekeninkomen: aanvrager + toeslagpartner + medebewoners, met kindvrijstelling onder 23 en onderhuurderuitsluiting.",
      "10. Correctie D = max(rekeninkomen - inkomensijkpunt, 0) x (afbouwpercentage / 12); ijkpunt/percentage volgt 1-persoon of 2+-persoonshuishouden.",
      "11. Maandbedrag = max(A + B + C - D, 0), naar beneden afgerond op hele euro's. Jaarindicatie = maandbedrag x aantal geldige maanden.",
    ],
    calculationNotes: [
      "Vanaf 2026 bestaat de rekenhuur voor woningen uit kale huur; servicekosten tellen niet meer mee.",
      "Een hoge kale huur sluit vanaf 2026 niet meer automatisch uit, maar het bedrag boven de toepasselijke huurgrens levert geen toeslag op.",
      "Onderhuurders en personen in hun huishouden tellen niet mee voor huishouden of inkomen.",
    ],
    blockers: [
      "Bijzondere uitzonderingen voor onzelfstandige woonruimte, begeleid wonen, aangepaste woning, overlijden of wisselende medebewoners moeten vóór publieke bedragkoppeling als reason codes worden gemodelleerd.",
      "De maanden-tijdvaklogica bij verhuizen, partner/medebewonerwissel en start/einde huurtoeslag moet door de Calculation Guardian apart worden geïmplementeerd.",
    ],
  },
  childBudget: {
    calculationStatus: "amount-ready",
    requiredInputs: [
      "partnerStatus",
      "assessmentIncome or jointAssessmentIncome",
      "assets or jointAssets on 2026-01-01",
      "children under 18",
      "child ages",
      "child benefit or official exception",
      "child residence or co-parenting status",
      "child country of residence",
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
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 4: grensinkomen zonder toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Dit is het grensinkomen/eerste afbouwpunt voor alleenstaande ouders, niet een absolute inkomensgrens.",
    }),
    thresholdIncomePartnersChange2026: valueSource({
      regulationId: "allowance.child-budget.change-threshold-partners.2026",
      value: 39_141,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 4: grensinkomen met toeslagpartner",
      verificationStatus: "verified",
      interpretationNote: "Dit is het grensinkomen/eerste afbouwpunt voor ouders met toeslagpartner, niet een absolute inkomensgrens.",
    }),
    maxAnnualOneChildSingleParent: valueSource({
      regulationId: "allowance.child-budget.max-annual-one-child-single-parent.2026",
      value: 5996,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 1: Maximaal jaarbedrag kindgebonden budget",
      verificationStatus: "verified",
      interpretationNote: "Maximaal jaarbedrag voor alleenstaande ouder met 1 kind; bevat alleenstaande-ouderkop in tabelbedrag.",
    }),
    maxAnnualTwoChildrenSingleParent: valueSource({
      regulationId: "allowance.child-budget.max-annual-two-children-single-parent.2026",
      value: 8576,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 1: Maximaal jaarbedrag kindgebonden budget",
      verificationStatus: "verified",
      interpretationNote: "Maximaal jaarbedrag voor alleenstaande ouder met 2 kinderen.",
    }),
    maxAnnualOneChildWithPartner: valueSource({
      regulationId: "allowance.child-budget.max-annual-one-child-with-partner.2026",
      value: 2580,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 1: Maximaal jaarbedrag kindgebonden budget",
      verificationStatus: "verified",
      interpretationNote: "Maximaal jaarbedrag voor ouder met toeslagpartner met 1 kind.",
    }),
    maxAnnualTwoChildrenWithPartner: valueSource({
      regulationId: "allowance.child-budget.max-annual-two-children-with-partner.2026",
      value: 5160,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 1: Maximaal jaarbedrag kindgebonden budget",
      verificationStatus: "verified",
      interpretationNote: "Maximaal jaarbedrag voor ouder met toeslagpartner met 2 kinderen.",
    }),
    additionalAnnualFromThirdChild: valueSource({
      regulationId: "allowance.child-budget.additional-annual-from-third-child.2026",
      value: 2580,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 1: Maximaal jaarbedrag kindgebonden budget",
      verificationStatus: "verified",
      interpretationNote: "Verhoging vanaf het derde kind en ieder volgend kind.",
    }),
    ageIncrease12To15: valueSource({
      regulationId: "allowance.child-budget.age-increase-12-to-15.2026",
      value: 724,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 2: verhoog het maximale toeslagbedrag",
      verificationStatus: "verified",
      interpretationNote: "Jaarverhoging voor elk kind van 12 tot en met 15 jaar.",
    }),
    ageIncrease16To17: valueSource({
      regulationId: "allowance.child-budget.age-increase-16-to-17.2026",
      value: 964,
      unit: "eur",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 2: verhoog het maximale toeslagbedrag",
      verificationStatus: "verified",
      interpretationNote: "Jaarverhoging voor elk kind van 16 of 17 jaar.",
    }),
    taperPercent: valueSource({
      regulationId: "allowance.child-budget.taper-percent.2026",
      value: 7.6,
      unit: "percent",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 4: vermindering boven grensinkomen",
      verificationStatus: "verified",
      interpretationNote: "Afbouwpercentage over toetsingsinkomen boven het toepasselijke grensinkomen.",
    }),
    domesticResidenceFactor: valueSource({
      regulationId: "allowance.child-budget.residence-factor-netherlands.2026",
      value: 100,
      unit: "percent",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Woonlandfactor kindgebonden budget 2026",
      verificationStatus: "verified",
      interpretationNote: "Nederland heeft woonlandfactor 100 procent; volledige internationale tabel is een aparte normalisatietaak.",
    }),
    roundingRule: valueSource({
      regulationId: "allowance.child-budget.rounding-monthly-down-whole-euros.2026",
      value: "round-monthly-down-whole-euros",
      unit: "text",
      officialSourceTitle: "Berekening kindgebonden budget 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kindgebonden_budget_tg0811z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Rekenvoorbeelden",
      verificationStatus: "verified",
      interpretationNote: "Officiële voorbeelden delen jaarbedrag door 12 en ronden het maandbedrag naar beneden af op hele euro's.",
    }),
    calculationSteps: [
      "1. Controleer recht: ten minste 1 rechtgevend kind jonger dan 18, kinderbijslag of vergelijkbare kindvoorwaarde, woon-/onderhoudssituatie, partnerstatus en vermogen per 1 januari 2026.",
      "2. Bepaal maximaal jaarbedrag op basis van aantal kinderen en partnerstatus: 1 kind, 2 kinderen, plus 2.580 voor elk derde en volgend kind.",
      "3. Voeg leeftijdsverhogingen toe: 724 voor kinderen 12-15 jaar en 964 voor kinderen 16-17 jaar. Bij leeftijdswijziging gedurende het jaar moet de maand/tijdvakregel nog expliciet door Calculation Guardian worden uitgewerkt.",
      "4. Bepaal toetsingsinkomen: alleenstaand inkomen of gezamenlijk inkomen met toeslagpartner.",
      "5. Kies grensinkomen: 29.736 zonder toeslagpartner, 39.141 met toeslagpartner.",
      "6. Vermindering = max(toetsingsinkomen - grensinkomen, 0) x 7,6%.",
      "7. Jaarbedrag = max(maximaal jaarbedrag + leeftijdsverhogingen - vermindering, 0), daarna woonlandfactor toepassen indien kind niet in Nederland woont.",
      "8. Maandbedrag = jaarbedrag / 12, naar beneden afgerond op hele euro's. Deeljaar of leeftijdsmaand vereist tijdvaklogica.",
    ],
    calculationNotes: [
      "De bedragen 29.736 en 39.141 zijn afbouwpunten/grensinkomens, geen harde inkomensgrenzen.",
      "De officiële PDF bevat woonlandfactoren; Nederland is genormaliseerd op 100 procent en buitenlandse woonlanden blijven expliciet geblokkeerd tot volledige tabelnormalisatie.",
      "Alleenstaande-ouderkop is verwerkt in de officiële maxima voor alleenstaande ouder.",
    ],
    blockers: [
      "Volledige woonlandfactortabel moet apart machineleesbaar worden genormaliseerd vóór bedragen voor kinderen buiten Nederland.",
      "Co-ouderschap, samengesteld gezin, pleeg-/stief-/adoptiekind en leeftijdswijzigingen gedurende het jaar vereisen tijdvak- en uitzonderingsregels vóór publieke koppeling.",
    ],
  },
  childcare: {
    calculationStatus: "blocked-pending-formula",
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
    firstChildRule: valueSource({
      regulationId: "allowance.childcare.first-child-rule.2026",
      value: "child-with-most-subsidisable-hours-then-highest-subsidisable-costs",
      unit: "text",
      officialSourceTitle: "Berekening kinderopvangtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 3: bereken de opvangkosten voor het 1e kind",
      verificationStatus: "verified",
      interpretationNote: "Het 1e kind is niet automatisch het oudste kind; het is het kind met de meeste berekende opvanguren en bij gelijke uren de hoogste opvangkosten.",
    }),
    roundingRule: valueSource({
      regulationId: "allowance.childcare.rounding-monthly-down-whole-euros.2026",
      value: "round-monthly-down-whole-euros",
      unit: "text",
      officialSourceTitle: "Berekening kinderopvangtoeslag 2026",
      officialSourceUrl:
        "https://download.belastingdienst.nl/toeslagen/docs/berekening_kinderopvangtoeslag_tg0801z61fd.pdf",
      publicationDate: "2026-01-01",
      sourceSection: "Stap 7: bereken het totaal aan kinderopvangtoeslag",
      verificationStatus: "verified",
      interpretationNote: "Officiële voorbeelden tellen maandbedragen op en ronden het totaal naar beneden af op hele euro's.",
    }),
    percentageTable: [
      { incomeFrom: 0, incomeTo: 24_149, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 24_150, incomeTo: 25_756, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 25_757, incomeTo: 27_363, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 27_364, incomeTo: 28_973, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 28_974, incomeTo: 30_579, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 30_580, incomeTo: 32_189, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 32_190, incomeTo: 33_795, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 33_796, incomeTo: 35_400, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 35_401, incomeTo: 37_129, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 37_130, incomeTo: 38_855, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 38_856, incomeTo: 40_586, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 40_587, incomeTo: 42_313, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 42_314, incomeTo: 44_046, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 44_047, incomeTo: 45_776, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 45_777, incomeTo: 47_546, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 47_547, incomeTo: 49_318, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 49_319, incomeTo: 51_092, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 51_093, incomeTo: 52_864, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 52_865, incomeTo: 54_641, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 54_642, incomeTo: 56_412, firstChildPercent: 96.0, nextChildPercent: 96.0 },
      { incomeFrom: 56_413, incomeTo: 58_184, firstChildPercent: 95.5, nextChildPercent: 95.6 },
      { incomeFrom: 58_185, incomeTo: 59_957, firstChildPercent: 94.8, nextChildPercent: 95.6 },
      { incomeFrom: 59_958, incomeTo: 61_895, firstChildPercent: 93.9, nextChildPercent: 95.6 },
      { incomeFrom: 61_896, incomeTo: 65_695, firstChildPercent: 92.4, nextChildPercent: 95.6 },
      { incomeFrom: 65_696, incomeTo: 69_492, firstChildPercent: 91.6, nextChildPercent: 95.2 },
      { incomeFrom: 69_493, incomeTo: 73_292, firstChildPercent: 90.5, nextChildPercent: 94.6 },
      { incomeFrom: 73_293, incomeTo: 77_094, firstChildPercent: 88.2, nextChildPercent: 94.2 },
      { incomeFrom: 77_095, incomeTo: 80_891, firstChildPercent: 85.9, nextChildPercent: 93.9 },
      { incomeFrom: 80_892, incomeTo: 84_693, firstChildPercent: 83.7, nextChildPercent: 93.2 },
      { incomeFrom: 84_694, incomeTo: 88_491, firstChildPercent: 81.2, nextChildPercent: 92.7 },
      { incomeFrom: 88_492, incomeTo: 92_291, firstChildPercent: 78.9, nextChildPercent: 92.2 },
      { incomeFrom: 92_292, incomeTo: 96_091, firstChildPercent: 76.7, nextChildPercent: 91.5 },
      { incomeFrom: 96_092, incomeTo: 99_889, firstChildPercent: 74.3, nextChildPercent: 90.9 },
      { incomeFrom: 99_890, incomeTo: 103_694, firstChildPercent: 72.1, nextChildPercent: 90.5 },
      { incomeFrom: 103_695, incomeTo: 107_492, firstChildPercent: 69.6, nextChildPercent: 90.2 },
      { incomeFrom: 107_493, incomeTo: 111_290, firstChildPercent: 67.3, nextChildPercent: 89.5 },
      { incomeFrom: 111_291, incomeTo: 115_090, firstChildPercent: 65.1, nextChildPercent: 89.1 },
      { incomeFrom: 115_091, incomeTo: 118_963, firstChildPercent: 62.7, nextChildPercent: 88.6 },
      { incomeFrom: 118_964, incomeTo: 122_857, firstChildPercent: 60.6, nextChildPercent: 87.9 },
      { incomeFrom: 122_858, incomeTo: 126_747, firstChildPercent: 58.5, nextChildPercent: 87.4 },
      { incomeFrom: 126_748, incomeTo: 130_638, firstChildPercent: 56.4, nextChildPercent: 87.0 },
      { incomeFrom: 130_639, incomeTo: 134_527, firstChildPercent: 54.2, nextChildPercent: 86.7 },
      { incomeFrom: 134_528, incomeTo: 138_420, firstChildPercent: 52.3, nextChildPercent: 86.0 },
      { incomeFrom: 138_421, incomeTo: 142_312, firstChildPercent: 50.4, nextChildPercent: 85.4 },
      { incomeFrom: 142_313, incomeTo: 146_205, firstChildPercent: 48.5, nextChildPercent: 85.0 },
      { incomeFrom: 146_206, incomeTo: 150_092, firstChildPercent: 46.5, nextChildPercent: 84.4 },
      { incomeFrom: 150_093, incomeTo: 153_982, firstChildPercent: 44.5, nextChildPercent: 84.0 },
      { incomeFrom: 153_983, incomeTo: 157_877, firstChildPercent: 42.5, nextChildPercent: 83.3 },
      { incomeFrom: 157_878, incomeTo: 161_766, firstChildPercent: 40.5, nextChildPercent: 82.7 },
      { incomeFrom: 161_767, incomeTo: 165_657, firstChildPercent: 38.5, nextChildPercent: 81.7 },
      { incomeFrom: 165_658, incomeTo: 169_547, firstChildPercent: 36.5, nextChildPercent: 81.4 },
      { incomeFrom: 169_548, incomeTo: 173_440, firstChildPercent: 36.5, nextChildPercent: 80.6 },
      { incomeFrom: 173_441, incomeTo: 177_335, firstChildPercent: 36.5, nextChildPercent: 79.7 },
      { incomeFrom: 177_336, incomeTo: 181_223, firstChildPercent: 36.5, nextChildPercent: 79.1 },
      { incomeFrom: 181_224, incomeTo: 185_114, firstChildPercent: 36.5, nextChildPercent: 78.2 },
      { incomeFrom: 185_115, incomeTo: 189_002, firstChildPercent: 36.5, nextChildPercent: 77.7 },
      { incomeFrom: 189_003, incomeTo: 192_896, firstChildPercent: 36.5, nextChildPercent: 76.9 },
      { incomeFrom: 192_897, incomeTo: 196_789, firstChildPercent: 36.5, nextChildPercent: 76.2 },
      { incomeFrom: 196_790, incomeTo: 200_681, firstChildPercent: 36.5, nextChildPercent: 75.5 },
      { incomeFrom: 200_682, incomeTo: 204_571, firstChildPercent: 36.5, nextChildPercent: 74.5 },
      { incomeFrom: 204_572, incomeTo: 208_458, firstChildPercent: 36.5, nextChildPercent: 74.0 },
      { incomeFrom: 208_459, incomeTo: 212_353, firstChildPercent: 36.5, nextChildPercent: 73.3 },
      { incomeFrom: 212_354, incomeTo: 216_242, firstChildPercent: 36.5, nextChildPercent: 72.5 },
      { incomeFrom: 216_243, incomeTo: 220_134, firstChildPercent: 36.5, nextChildPercent: 71.8 },
      { incomeFrom: 220_135, incomeTo: 224_026, firstChildPercent: 36.5, nextChildPercent: 71.2 },
      { incomeFrom: 224_027, incomeTo: 227_915, firstChildPercent: 36.5, nextChildPercent: 70.4 },
      { incomeFrom: 227_916, incomeTo: 231_807, firstChildPercent: 36.5, nextChildPercent: 69.6 },
      { incomeFrom: 231_808, incomeTo: 235_697, firstChildPercent: 36.5, nextChildPercent: 69.1 },
      { incomeFrom: 235_698, incomeTo: 99_999_999, firstChildPercent: 36.5, nextChildPercent: 68.2 },
    ],
    calculationSteps: [
      "1. Controleer recht: betaalde en geregistreerde opvang, kind woont bij aanvrager, eigen bijdrage, kwalificerende activiteit van aanvrager en partner, en leeftijd/einde recht.",
      "2. Bepaal per kind en opvangsoort het subsidiabele uurtarief: min(werkelijk tarief, maximumuurtarief voor dagopvang/BSO/gastouderopvang).",
      "3. Bepaal subsidiabele uren: maximaal 230 uur per kind per maand en gekoppeld aan gewerkte maanden; bij twee ouders geldt de ouder die het minst werkt.",
      "4. Bepaal het 1e kind: kind met meeste subsidiabele opvanguren; bij gelijke uren het kind met hoogste subsidiabele opvangkosten.",
      "5. Bereken subsidiabele kosten per kind: subsidiabele uren x subsidiabel uurtarief.",
      "6. Zoek de inkomensband op basis van gezamenlijk toetsingsinkomen; grenzen zijn inclusief van/tot volgens de officiële tabel.",
      "7. Toeslag 1e kind = kosten 1e kind x percentage 1e kind. Toeslag volgende kinderen = kosten per kind x percentage 2e en volgende kind.",
      "8. Tel de toeslagbedragen per maand op en rond het totaal naar beneden af op hele euro's. Jaarindicatie volgt uit som van maanden/tijdvakken.",
    ],
    calculationNotes: [
      "De volledige officiële percentage-/vergoedingstabel 2026 is genormaliseerd met inclusieve inkomensbanden.",
      "Het eerste kind wordt bepaald op basis van opvanguren en daarna kosten, niet op leeftijd.",
      "Voor meerdere opvangorganisaties of soorten moet de toekomstige engine per kind per contract normaliseren voordat de eerste-kindregel wordt toegepast.",
    ],
    blockers: [
      "Rechtgevende activiteit, LRK-registratie, eigen bijdrage en partneractiviteit moeten als blokkerende invoer/controle worden gemodelleerd vóór publieke bedragkoppeling.",
      "Wisselende uren, opvang gedurende deel van het jaar, meerdere contracten en wijzigingen in inkomen/partnerstatus vereisen tijdvaklogica.",
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
      id: "rent-official-example-young-single-2026",
      allowance: "rent",
      input: { age: 20, householdSize: 1, allHouseholdMembersUnder21: true, basicRent: 600, householdIncome: 22_000 },
      expected: { cappedRent: 498.2, monthlyAmount: 295, annualAmount: 3_540 },
      sourceRuleIds: [
        "allowance.rent.capped-rent-threshold-under-21.2026",
        "allowance.rent.base-rent-single-household.2026",
        "allowance.rent.rounding-monthly-down-whole-euros.2026",
      ],
    },
    {
      id: "rent-official-example-partners-high-rent-2026",
      allowance: "rent",
      input: { age: 30, householdSize: 3, partnerStatus: "yes", basicRent: 1_200, householdIncome: 34_000 },
      expected: { cappedRent: 932.93, incomeCorrection: 45.83, monthlyAmount: 492, annualAmount: 5_904 },
      sourceRuleIds: [
        "allowance.rent.capped-rent-threshold.2026",
        "allowance.rent.capping-threshold-three-or-more-persons.2026",
        "allowance.rent.income-taper-multi-person-household.2026",
      ],
    },
    {
      id: "rent-official-example-aow-single-2026",
      allowance: "rent",
      input: { age: 69, householdSize: 1, partnerStatus: "no", basicRent: 710, householdIncome: 29_000 },
      expected: { cappedRent: 710, incomeCorrection: 125.44, monthlyAmount: 307, annualAmount: 3_684 },
      sourceRuleIds: [
        "allowance.rent.capping-threshold-one-or-two-persons.2026",
        "allowance.rent.income-taper-single-household.2026",
      ],
    },
    {
      id: "child-budget-official-example-two-children-partners-2026",
      allowance: "child-budget",
      input: { partnerStatus: "yes", childrenUnder18: 2, childAges: "4,8", jointAssessmentIncome: 45_000, countryOfResidence: "Nederland" },
      expected: { annualAmount: 4_714.72, monthlyAmount: 392 },
      sourceRuleIds: [
        "allowance.child-budget.max-annual-two-children-with-partner.2026",
        "allowance.child-budget.change-threshold-partners.2026",
        "allowance.child-budget.taper-percent.2026",
      ],
    },
    {
      id: "child-budget-official-example-age-increases-2026",
      allowance: "child-budget",
      input: { partnerStatus: "yes", childrenUnder18: 2, childAges: "13,16", jointAssessmentIncome: 45_000, countryOfResidence: "Nederland" },
      expected: { ageIncreaseAnnual: 1_688, annualAmount: 6_402.72, monthlyAmount: 533 },
      sourceRuleIds: [
        "allowance.child-budget.age-increase-12-to-15.2026",
        "allowance.child-budget.age-increase-16-to-17.2026",
      ],
    },
    {
      id: "child-budget-official-example-single-parent-2026",
      allowance: "child-budget",
      input: { partnerStatus: "no", childrenUnder18: 1, childAges: "8", assessmentIncome: 30_000, countryOfResidence: "Nederland" },
      expected: { annualAmount: 5_975.94, monthlyAmount: 497 },
      sourceRuleIds: [
        "allowance.child-budget.max-annual-one-child-single-parent.2026",
        "allowance.child-budget.change-threshold-single-parent.2026",
      ],
    },
    {
      id: "childcare-daycare-hourly-cap",
      allowance: "childcare",
      input: { childcareType: "daycare", hourlyRate: 12, hoursPerMonth: 100 },
      expected: { cappedHourlyRate: 11.23, cappedMonthlyCosts: 1_123 },
      sourceRuleIds: ["allowance.childcare.max-hourly-rate-daycare.2026"],
    },
    {
      id: "childcare-official-example-one-child-daycare-2026",
      allowance: "childcare",
      input: { childrenInChildcare: 1, childcareType: "daycare", hourlyRate: 10.5, hoursPerMonth: 122, jointAssessmentIncome: 60_000 },
      expected: { cappedHourlyRate: 10.5, cappedHours: 122, percentageFirstChild: 93.9, monthlyAmount: 1_202 },
      sourceRuleIds: ["allowance.childcare.first-child-rule.2026"],
    },
    {
      id: "childcare-official-example-two-children-2026",
      allowance: "childcare",
      input: { childrenInChildcare: 2, youngestHours: 87, youngestRate: 12.45, oldestHours: 65, oldestRate: 10.1, jointAssessmentIncome: 120_000 },
      expected: { firstChild: "youngest", monthlyAmount: 1_162 },
      sourceRuleIds: ["allowance.childcare.first-child-rule.2026"],
    },
    {
      id: "childcare-official-example-hour-cap-2026",
      allowance: "childcare",
      input: { childrenInChildcare: 1, childcareType: "childminder", hourlyRate: 8.25, hoursPerMonth: 240, assessmentIncome: 40_000 },
      expected: { cappedHours: 230, monthlyAmount: 1_821 },
      sourceRuleIds: ["allowance.childcare.max-hours-per-month.2026"],
    },
    {
      id: "childcare-official-example-childminder-rate-cap-2026",
      allowance: "childcare",
      input: { childrenInChildcare: 1, childcareType: "childminder", hourlyRate: 9.52, hoursPerMonth: 108, jointAssessmentIncome: 50_000 },
      expected: { cappedHourlyRate: 8.49, monthlyAmount: 880 },
      sourceRuleIds: ["allowance.childcare.max-hourly-rate-childminder.2026"],
    },
  ],
};
