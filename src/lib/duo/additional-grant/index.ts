import type {
  DuoAdditionalGrantEducationType,
  DuoAdditionalGrantRules2026,
  DuoAdditionalGrantSourceValue,
} from "@/lib/financial-constants/duo-additional-grant-rules-2026";
import {
  getDatasetForDate,
  getDatasetFreshness,
} from "@/lib/financial-constants/source-datasets";
import type { SourceDataset, SourceFreshnessStatus, SourceReference } from "@/lib/financial-constants/types";

export type DuoAdditionalGrantStatus =
  | "calculated"
  | "incomplete"
  | "special-case"
  | "unsupported"
  | "official-verification-required";

export type DuoAdditionalGrantResidence = "living-at-home" | "living-away";
export type DuoAdditionalGrantFamilySituation = "single-parent" | "two-parents";
export type DuoAdditionalGrantIncomeReliability = "final" | "estimated";
export type DuoAdditionalGrantReferenceYearLikelihood =
  | "not-requested"
  | "possible"
  | "unlikely"
  | "not-beneficial"
  | "official-verification-required";

export type DuoAdditionalGrantSpecialCase =
  | "parent-deceased"
  | "parent-unknown"
  | "parent-abroad"
  | "parent-ignored"
  | "no-contact-or-conflict"
  | "unknown-parent-income"
  | "estimated-income"
  | "entrepreneur-income-not-final"
  | "sibling-factor-uncertain"
  | "calculation-year-unsupported"
  | "mbo-no-tuition-due"
  | "period-after-july-2026";

export type DuoAdditionalGrantParentInput = {
  readonly income: number;
  readonly annualDuoRepaymentTerms?: number;
  readonly otherQualifyingChildren?: number;
  readonly childrenWithAdditionalGrant?: number;
  readonly incomeReliability?: DuoAdditionalGrantIncomeReliability;
  readonly hasMinorChildCare?: boolean;
};

export type DuoAdditionalGrantScenarioInput = {
  readonly parent1Income?: number;
  readonly parent2Income?: number;
  readonly parent1AnnualDuoRepaymentTerms?: number;
  readonly parent2AnnualDuoRepaymentTerms?: number;
  readonly parent1OtherQualifyingChildren?: number;
  readonly parent2OtherQualifyingChildren?: number;
  readonly parent1ChildrenWithAdditionalGrant?: number;
  readonly parent2ChildrenWithAdditionalGrant?: number;
  readonly parent1IncomeReliability?: DuoAdditionalGrantIncomeReliability;
  readonly parent2IncomeReliability?: DuoAdditionalGrantIncomeReliability;
  readonly parent1HasMinorChildCare?: boolean;
  readonly parent2HasMinorChildCare?: boolean;
};

export type DuoAdditionalGrantInput = {
  readonly calculationYear: number;
  readonly educationType?: DuoAdditionalGrantEducationType;
  readonly residence?: DuoAdditionalGrantResidence;
  readonly familySituation?: DuoAdditionalGrantFamilySituation;
  readonly calculationMonth?: number;
  readonly tuitionDue?: boolean;
  readonly standardReferenceYearInput?: DuoAdditionalGrantScenarioInput;
  readonly alternativeReferenceYear?: 2025 | 2026;
  readonly alternativeReferenceYearInput?: DuoAdditionalGrantScenarioInput;
  readonly specialCases?: readonly DuoAdditionalGrantSpecialCase[];
};

export type DuoAdditionalGrantMissingInput = {
  readonly fieldId: string;
  readonly blocking: boolean;
  readonly guidance: {
    readonly title: string;
    readonly explanation: string;
    readonly examples: readonly string[];
    readonly sourceReferences: readonly SourceReference[];
  };
};

export type DuoAdditionalGrantTraceStep = {
  readonly stepId: string;
  readonly label: string;
  readonly value: number | string | boolean;
  readonly sourceRuleIds: readonly string[];
};

export type DuoAdditionalGrantParentContribution = {
  readonly parentId: "parent1" | "parent2";
  readonly income: number;
  readonly freeFoot: number;
  readonly incomeAboveFreeFoot: number;
  readonly taperPercent: number;
  readonly annualContributionBeforeDeductions: number;
  readonly annualDuoRepaymentTerms: number;
  readonly otherQualifyingChildren: number;
  readonly otherChildrenDeduction: number;
  readonly annualContributionAfterDeductions: number;
  readonly childrenWithAdditionalGrant: number;
  readonly annualContributionPerChild: number;
  readonly monthlyContributionPerChild: number;
};

export type DuoAdditionalGrantScenarioResult = {
  readonly status: DuoAdditionalGrantStatus;
  readonly referenceYear: number;
  readonly estimatedMonthlyGrant?: number;
  readonly estimatedAnnualGrant?: number;
  readonly maximumMonthlyGrant?: number;
  readonly parentalMonthlyContribution?: number;
  readonly parentalAnnualContribution?: number;
  readonly parentContributions: readonly DuoAdditionalGrantParentContribution[];
  readonly usedJointParentIncome?: number;
  readonly missingInputs: readonly DuoAdditionalGrantMissingInput[];
  readonly reasonCodes: readonly string[];
  readonly calculationTrace: readonly DuoAdditionalGrantTraceStep[];
  readonly sourceReferences: readonly SourceReference[];
  readonly confidence: "high" | "medium" | "low";
  readonly officialVerificationRequired: boolean;
};

export type DuoAdditionalGrantReferenceYearComparison = {
  readonly standardReferenceYear: number;
  readonly alternativeReferenceYear?: number;
  readonly standardJointIncome?: number;
  readonly alternativeJointIncome?: number;
  readonly absoluteIncomeDrop?: number;
  readonly incomeDropPercent?: number;
  readonly meetsFifteenPercentCondition?: boolean;
  readonly referenceYearChangeLikelihood: DuoAdditionalGrantReferenceYearLikelihood;
  readonly estimatedMonthlyBenefit?: number;
  readonly estimatedAnnualBenefit?: number;
  readonly reasonCodes: readonly string[];
};

export type DuoAdditionalGrantResult = {
  readonly status: DuoAdditionalGrantStatus;
  readonly calculationYear: number;
  readonly educationType?: DuoAdditionalGrantEducationType;
  readonly residence?: DuoAdditionalGrantResidence;
  readonly standardReferenceYear: number;
  readonly alternativeReferenceYear?: number;
  readonly standardReferenceYearResult: DuoAdditionalGrantScenarioResult;
  readonly alternativeReferenceYearResult?: DuoAdditionalGrantScenarioResult;
  readonly referenceYearComparison: DuoAdditionalGrantReferenceYearComparison;
  readonly estimatedMonthlyGrant?: number;
  readonly estimatedAnnualGrant?: number;
  readonly appliedMaximumMonthlyGrant?: number;
  readonly decisiveInputs: readonly string[];
  readonly derivedInputs: readonly string[];
  readonly missingInputs: readonly DuoAdditionalGrantMissingInput[];
  readonly reasonCodes: readonly string[];
  readonly calculationTrace: readonly DuoAdditionalGrantTraceStep[];
  readonly sourceReferences: readonly SourceReference[];
  readonly confidence: "high" | "medium" | "low";
  readonly officialVerificationRequired: boolean;
  readonly assumptions: readonly string[];
  readonly limitations: readonly string[];
};

const CALCULATION_YEAR = 2026;
const SOURCE_SCENARIO = "official-2026-prepared";

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function sourceReference(
  dataset: SourceDataset<DuoAdditionalGrantRules2026>,
  freshnessStatus: SourceFreshnessStatus,
  source: DuoAdditionalGrantSourceValue,
): SourceReference {
  return {
    label: `${source.officialSourceTitle} - ${source.sourceSection}`,
    sourceName: dataset.meta.sourceName,
    sourceUrl: source.officialSourceUrl,
    sourceType: dataset.meta.sourceType,
    referenceDate: source.retrievedAt,
    year: source.calculationYear,
    effectiveFrom: source.validFrom,
    effectiveTo: source.validUntil,
    methodology: dataset.meta.methodology,
    methodologyType: dataset.meta.methodologyType,
    freshnessStatus,
    datasetId: dataset.meta.id,
    version: dataset.meta.version,
  };
}

function resolveDataset() {
  return getDatasetForDate("duo-additional-grant-rules", "2026-07-20", {
    scenario: SOURCE_SCENARIO,
  }) as SourceDataset<DuoAdditionalGrantRules2026>;
}

function guidance(
  fieldId: string,
  title: string,
  explanation: string,
  examples: readonly string[],
  sourceReferences: readonly SourceReference[],
): DuoAdditionalGrantMissingInput {
  return {
    fieldId,
    blocking: true,
    guidance: { title, explanation, examples, sourceReferences },
  };
}

function hasInvalidNumber(value: number | undefined, allowNegative = false) {
  return value !== undefined && (!Number.isFinite(value) || (!allowNegative && value < 0));
}

function valueNumber(source: DuoAdditionalGrantSourceValue) {
  return Number(source.value);
}

function maximumSource(input: {
  readonly rules: DuoAdditionalGrantRules2026;
  readonly educationType: DuoAdditionalGrantEducationType;
  readonly residence: DuoAdditionalGrantResidence;
}) {
  if (input.educationType === "hbo" || input.educationType === "university") {
    return input.rules.amounts.hboUniversity.maximum;
  }
  return input.residence === "living-away"
    ? input.rules.amounts.mbo.maximumLivingAway
    : input.rules.amounts.mbo.maximumLivingAtHome;
}

function formulaSources(rules: DuoAdditionalGrantRules2026, educationType: DuoAdditionalGrantEducationType) {
  if (educationType === "hbo" || educationType === "university") {
    return {
      taper: rules.amounts.hboUniversity.parentalContributionTaperPercent,
      singleParentFreeFoot: rules.amounts.hboUniversity.parentFreeFootSingleParent,
      twoParentFreeFoot: rules.amounts.hboUniversity.parentFreeFootTwoParentsPerParent,
      ignoredParentFreeFoot: rules.amounts.hboUniversity.parentFreeFootOtherParentDiedOrIgnored,
      childDeduction: rules.amounts.hboUniversity.parentalStudentDebtDeductionFactor,
    };
  }
  return {
    taper: rules.amounts.mbo.parentalContributionTaperPercent,
    singleParentFreeFoot: rules.amounts.mbo.parentFreeFootSingleParent,
    twoParentFreeFoot: rules.amounts.mbo.parentFreeFootTwoParentsPerParent,
    ignoredParentFreeFoot: rules.amounts.mbo.parentFreeFootOtherParentDiedOrIgnored,
    childDeduction: rules.amounts.mbo.parentalStudentDebtDeductionFactor,
  };
}

function scenarioParent(input: {
  readonly scenario: DuoAdditionalGrantScenarioInput;
  readonly parentId: "parent1" | "parent2";
}): DuoAdditionalGrantParentInput | undefined {
  const isParent1 = input.parentId === "parent1";
  const income = isParent1 ? input.scenario.parent1Income : input.scenario.parent2Income;
  if (income === undefined) return undefined;
  return {
    income,
    annualDuoRepaymentTerms: isParent1
      ? input.scenario.parent1AnnualDuoRepaymentTerms
      : input.scenario.parent2AnnualDuoRepaymentTerms,
    otherQualifyingChildren: isParent1
      ? input.scenario.parent1OtherQualifyingChildren
      : input.scenario.parent2OtherQualifyingChildren,
    childrenWithAdditionalGrant: isParent1
      ? input.scenario.parent1ChildrenWithAdditionalGrant
      : input.scenario.parent2ChildrenWithAdditionalGrant,
    incomeReliability: isParent1
      ? input.scenario.parent1IncomeReliability
      : input.scenario.parent2IncomeReliability,
    hasMinorChildCare: isParent1
      ? input.scenario.parent1HasMinorChildCare
      : input.scenario.parent2HasMinorChildCare,
  };
}

function calculateParentContribution(input: {
  readonly parentId: "parent1" | "parent2";
  readonly parent: DuoAdditionalGrantParentInput;
  readonly freeFoot: number;
  readonly taperPercent: number;
  readonly childDeductionAmount: number;
}): DuoAdditionalGrantParentContribution {
  const annualDuoRepaymentTerms = roundMoney(Math.max(input.parent.annualDuoRepaymentTerms ?? 0, 0));
  const otherQualifyingChildren = Math.max(Math.round(input.parent.otherQualifyingChildren ?? 0), 0);
  const childrenWithAdditionalGrant = Math.max(Math.round(input.parent.childrenWithAdditionalGrant ?? 1), 1);
  const incomeAboveFreeFoot = roundMoney(input.parent.income - input.freeFoot);
  const contributionBeforeDeductions = roundMoney(Math.max(incomeAboveFreeFoot, 0) * input.taperPercent / 100);
  const otherChildrenDeduction = roundMoney(otherQualifyingChildren * input.childDeductionAmount);
  const afterDeductions = roundMoney(Math.max(
    contributionBeforeDeductions - annualDuoRepaymentTerms - otherChildrenDeduction,
    0,
  ));
  const annualContributionPerChild = roundMoney(afterDeductions / childrenWithAdditionalGrant);
  return {
    parentId: input.parentId,
    income: roundMoney(input.parent.income),
    freeFoot: roundMoney(input.freeFoot),
    incomeAboveFreeFoot,
    taperPercent: input.taperPercent,
    annualContributionBeforeDeductions: contributionBeforeDeductions,
    annualDuoRepaymentTerms,
    otherQualifyingChildren,
    otherChildrenDeduction,
    annualContributionAfterDeductions: afterDeductions,
    childrenWithAdditionalGrant,
    annualContributionPerChild,
    monthlyContributionPerChild: roundMoney(annualContributionPerChild / 12),
  };
}

function missingInputsFor(input: {
  readonly scanInput: DuoAdditionalGrantInput;
  readonly scenario?: DuoAdditionalGrantScenarioInput;
  readonly sourceReferences: readonly SourceReference[];
}) {
  const missing: DuoAdditionalGrantMissingInput[] = [];
  if (!input.scanInput.educationType) {
    missing.push(guidance(
      "educationType",
      "Opleidingstype",
      "Kies of de student mbo niveau 1/2, mbo niveau 3/4, hbo of universiteit volgt. Dit bepaalt het maximale maandbedrag en of de beurs direct gift is of prestatiebeurs.",
      ["Gebruik de inschrijving van de opleiding of Mijn DUO.", "Bij mbo is het niveau nodig."],
      input.sourceReferences,
    ));
  }
  if (!input.scanInput.residence) {
    missing.push(guidance(
      "residence",
      "Woonsituatie",
      "Voor mbo verschilt het maximale bedrag tussen thuiswonend en uitwonend. Gebruik de woonsituatie zoals DUO die voor studiefinanciering beoordeelt.",
      ["Thuiswonend: wonen bij ouder(s).", "Uitwonend: niet bij ouder(s), passend bij DUO/BRP-gegevens."],
      input.sourceReferences,
    ));
  }
  if (!input.scanInput.familySituation) {
    missing.push(guidance(
      "familySituation",
      "Aantal ouders in de reguliere berekening",
      "Geef aan of de reguliere formule met één ouder of twee ouders moet rekenen. Bij overleden, onbekende, buitenlandse of buitenbeschouwing-ouders gebruikt de scan een special-case.",
      ["Kies twee ouders als beide ouderinkomens meetellen.", "Kies één ouder alleen bij een reguliere alleenstaande-oudersituatie."],
      input.sourceReferences,
    ));
  }
  if (!input.scenario) {
    missing.push(guidance(
      "standardReferenceYearInput",
      "Ouderinkomen standaardpeiljaar",
      "Voor 2026 gebruikt DUO normaal het ouderinkomen uit 2024. Nodig is het verzamelinkomen uit de definitieve aanslag of het belastbaar loon als er geen aangifte is.",
      ["Aanslag inkomstenbelasting 2024.", "Jaaropgave 2024 met belastbaar loon."],
      input.sourceReferences,
    ));
    return missing;
  }
  if (input.scenario.parent1Income === undefined) {
    missing.push(guidance(
      "parent1ReferenceYearIncome",
      "Inkomen ouder 1 in 2024",
      "Vul het verzamelinkomen 2024 van ouder 1 in, of het belastbaar loon wanneer geen aangifte inkomstenbelasting is gedaan.",
      ["Definitieve aanslag inkomstenbelasting 2024.", "Jaaropgave 2024."],
      input.sourceReferences,
    ));
  }
  if (input.scanInput.familySituation === "two-parents" && input.scenario.parent2Income === undefined) {
    missing.push(guidance(
      "parent2ReferenceYearIncome",
      "Inkomen ouder 2 in 2024",
      "Bij een reguliere tweouderberekening is ook het verzamelinkomen of belastbaar loon van ouder 2 nodig.",
      ["Definitieve aanslag inkomstenbelasting 2024.", "Jaaropgave 2024."],
      input.sourceReferences,
    ));
  }
  return missing;
}

function specialCaseReasons(input: DuoAdditionalGrantInput) {
  const cases = new Set(input.specialCases ?? []);
  const reasons: string[] = [];
  for (const specialCase of cases) {
    reasons.push(`duo-additional-grant-special-case-${specialCase}`);
  }
  if (input.educationType?.startsWith("mbo") && input.tuitionDue === false) {
    reasons.push("duo-additional-grant-mbo-no-tuition-due-special-case");
  }
  if (input.calculationMonth !== undefined && (input.calculationMonth < 1 || input.calculationMonth > 12)) {
    reasons.push("duo-additional-grant-invalid-calculation-month");
  }
  if (input.educationType?.startsWith("mbo") && input.calculationMonth !== undefined && input.calculationMonth > 7) {
    reasons.push("duo-additional-grant-mbo-period-after-july-special-case");
  }
  return unique(reasons);
}

function validateNumbers(input: DuoAdditionalGrantScenarioInput | undefined) {
  if (!input) return [];
  const invalid: string[] = [];
  const entries = {
    parent1Income: input.parent1Income,
    parent2Income: input.parent2Income,
    parent1AnnualDuoRepaymentTerms: input.parent1AnnualDuoRepaymentTerms,
    parent2AnnualDuoRepaymentTerms: input.parent2AnnualDuoRepaymentTerms,
    parent1OtherQualifyingChildren: input.parent1OtherQualifyingChildren,
    parent2OtherQualifyingChildren: input.parent2OtherQualifyingChildren,
    parent1ChildrenWithAdditionalGrant: input.parent1ChildrenWithAdditionalGrant,
    parent2ChildrenWithAdditionalGrant: input.parent2ChildrenWithAdditionalGrant,
  };
  for (const [field, value] of Object.entries(entries)) {
    const allowNegative = field === "parent1Income" || field === "parent2Income";
    if (hasInvalidNumber(value, allowNegative)) invalid.push(`invalid-${field}`);
  }
  return invalid;
}

function calculateScenario(input: {
  readonly scanInput: DuoAdditionalGrantInput;
  readonly scenario: DuoAdditionalGrantScenarioInput | undefined;
  readonly referenceYear: number;
  readonly rules: DuoAdditionalGrantRules2026;
  readonly dataset: SourceDataset<DuoAdditionalGrantRules2026>;
  readonly freshnessStatus: SourceFreshnessStatus;
}): DuoAdditionalGrantScenarioResult {
  const educationType = input.scanInput.educationType;
  const residence = input.scanInput.residence;
  const formulaSourceSet = educationType ? formulaSources(input.rules, educationType) : undefined;
  const sourceReferences = formulaSourceSet && educationType && residence
    ? [
        sourceReference(input.dataset, input.freshnessStatus, maximumSource({ rules: input.rules, educationType, residence })),
        sourceReference(input.dataset, input.freshnessStatus, formulaSourceSet.taper),
        sourceReference(input.dataset, input.freshnessStatus, formulaSourceSet.singleParentFreeFoot),
        sourceReference(input.dataset, input.freshnessStatus, formulaSourceSet.twoParentFreeFoot),
        sourceReference(input.dataset, input.freshnessStatus, formulaSourceSet.childDeduction),
      ]
    : [];
  const missing = missingInputsFor({
    scanInput: input.scanInput,
    scenario: input.scenario,
    sourceReferences,
  });
  const invalid = validateNumbers(input.scenario);
  const specialReasons = specialCaseReasons(input.scanInput);
  const reasonCodes = unique([
    ...invalid,
    ...specialReasons,
    ...missing.map((item) => `missing-${item.fieldId}`),
  ]);

  if (input.scanInput.calculationYear !== CALCULATION_YEAR) {
    return {
      status: "unsupported",
      referenceYear: input.referenceYear,
      parentContributions: [],
      missingInputs: [],
      reasonCodes: ["duo-additional-grant-calculation-year-unsupported"],
      calculationTrace: [],
      sourceReferences,
      confidence: "low",
      officialVerificationRequired: true,
    };
  }
  if (invalid.length > 0) {
    return {
      status: "incomplete",
      referenceYear: input.referenceYear,
      parentContributions: [],
      missingInputs: missing,
      reasonCodes,
      calculationTrace: [],
      sourceReferences,
      confidence: "low",
      officialVerificationRequired: true,
    };
  }
  if (specialReasons.length > 0) {
    return {
      status: "special-case",
      referenceYear: input.referenceYear,
      parentContributions: [],
      missingInputs: missing,
      reasonCodes,
      calculationTrace: [],
      sourceReferences,
      confidence: "low",
      officialVerificationRequired: true,
    };
  }
  if (!educationType || !residence || !formulaSourceSet || !input.scenario || missing.length > 0) {
    return {
      status: "incomplete",
      referenceYear: input.referenceYear,
      parentContributions: [],
      missingInputs: missing,
      reasonCodes,
      calculationTrace: [],
      sourceReferences,
      confidence: "low",
      officialVerificationRequired: true,
    };
  }

  const maxMonthlyGrant = valueNumber(maximumSource({ rules: input.rules, educationType, residence }));
  const taperPercent = valueNumber(formulaSourceSet.taper);
  const childDeductionAmount = valueNumber(formulaSourceSet.childDeduction);
  const parent1 = scenarioParent({ scenario: input.scenario, parentId: "parent1" });
  const parent2 = scenarioParent({ scenario: input.scenario, parentId: "parent2" });
  if (!parent1 || (input.scanInput.familySituation === "two-parents" && !parent2)) {
    return {
      status: "incomplete",
      referenceYear: input.referenceYear,
      parentContributions: [],
      missingInputs: missing,
      reasonCodes,
      calculationTrace: [],
      sourceReferences,
      confidence: "low",
      officialVerificationRequired: true,
    };
  }
  const parentContributions = [
    calculateParentContribution({
      parentId: "parent1",
      parent: parent1,
      freeFoot: input.scanInput.familySituation === "single-parent"
        ? valueNumber(formulaSourceSet.singleParentFreeFoot)
        : parent1.hasMinorChildCare
          ? valueNumber(formulaSourceSet.singleParentFreeFoot)
          : valueNumber(formulaSourceSet.twoParentFreeFoot),
      taperPercent,
      childDeductionAmount,
    }),
    ...(input.scanInput.familySituation === "two-parents" && parent2
      ? [calculateParentContribution({
          parentId: "parent2",
          parent: parent2,
          freeFoot: parent2.hasMinorChildCare
            ? valueNumber(formulaSourceSet.singleParentFreeFoot)
            : valueNumber(formulaSourceSet.twoParentFreeFoot),
          taperPercent,
          childDeductionAmount,
        })]
      : []),
  ];
  const parentalAnnualContribution = roundMoney(
    parentContributions.reduce((sum, parent) => sum + parent.annualContributionPerChild, 0),
  );
  const parentalMonthlyContribution = roundMoney(parentalAnnualContribution / 12);
  const estimatedMonthlyGrant = roundMoney(Math.max(maxMonthlyGrant - parentalMonthlyContribution, 0));
  const estimatedAnnualGrant = roundMoney(estimatedMonthlyGrant * 12);
  const usedJointParentIncome = roundMoney(
    parentContributions.reduce((sum, parent) => sum + parent.income, 0),
  );
  const estimatedIncomeUsed = [parent1, parent2].some((parent) => parent?.incomeReliability === "estimated");
  const status: DuoAdditionalGrantStatus = estimatedIncomeUsed
    ? "official-verification-required"
    : "calculated";

  return {
    status,
    referenceYear: input.referenceYear,
    estimatedMonthlyGrant,
    estimatedAnnualGrant,
    maximumMonthlyGrant: maxMonthlyGrant,
    parentalMonthlyContribution,
    parentalAnnualContribution,
    parentContributions,
    usedJointParentIncome,
    missingInputs: [],
    reasonCodes: unique([
      estimatedMonthlyGrant === 0
        ? "duo-additional-grant-parental-contribution-at-or-above-maximum"
        : "duo-additional-grant-calculated",
      ...(estimatedIncomeUsed ? ["duo-additional-grant-estimated-income-repayment-risk"] : []),
    ]),
    calculationTrace: [
      { stepId: "maximum-monthly-grant", label: "Maximale aanvullende beurs per maand", value: maxMonthlyGrant, sourceRuleIds: [maximumSource({ rules: input.rules, educationType, residence }).regulationId] },
      { stepId: "parental-annual-contribution", label: "Ouderbijdrage per jaar", value: parentalAnnualContribution, sourceRuleIds: [formulaSourceSet.taper.regulationId] },
      { stepId: "parental-monthly-contribution", label: "Inhouding per maand", value: parentalMonthlyContribution, sourceRuleIds: [formulaSourceSet.taper.regulationId] },
      { stepId: "monthly-grant", label: "Aanvullende beurs per maand", value: estimatedMonthlyGrant, sourceRuleIds: [maximumSource({ rules: input.rules, educationType, residence }).regulationId] },
    ],
    sourceReferences,
    confidence: estimatedIncomeUsed ? "medium" : "high",
    officialVerificationRequired: estimatedIncomeUsed,
  };
}

function compareReferenceYears(input: {
  readonly rules: DuoAdditionalGrantRules2026;
  readonly standard: DuoAdditionalGrantScenarioResult;
  readonly alternative?: DuoAdditionalGrantScenarioResult;
  readonly alternativeReferenceYear?: number;
}): DuoAdditionalGrantReferenceYearComparison {
  const standardReferenceYear = valueNumber(input.rules.referenceYear.standardReferenceYear);
  if (!input.alternative || input.alternativeReferenceYear === undefined) {
    return {
      standardReferenceYear,
      referenceYearChangeLikelihood: "not-requested",
      reasonCodes: ["duo-additional-grant-reference-year-change-not-requested"],
    };
  }
  const standardJointIncome = input.standard.usedJointParentIncome;
  const alternativeJointIncome = input.alternative.usedJointParentIncome;
  if (standardJointIncome === undefined || alternativeJointIncome === undefined || standardJointIncome <= 0) {
    return {
      standardReferenceYear,
      alternativeReferenceYear: input.alternativeReferenceYear,
      standardJointIncome,
      alternativeJointIncome,
      referenceYearChangeLikelihood: "official-verification-required",
      reasonCodes: ["duo-additional-grant-reference-year-change-income-incomplete"],
    };
  }
  const absoluteIncomeDrop = roundMoney(standardJointIncome - alternativeJointIncome);
  const incomeDropPercent = roundPercent(absoluteIncomeDrop / standardJointIncome * 100);
  const minimumDrop = valueNumber(input.rules.referenceYearChange.minimumIncomeDropPercent);
  const meetsFifteenPercentCondition = incomeDropPercent >= minimumDrop;
  const monthlyBenefit = input.alternative.estimatedMonthlyGrant !== undefined && input.standard.estimatedMonthlyGrant !== undefined
    ? roundMoney(input.alternative.estimatedMonthlyGrant - input.standard.estimatedMonthlyGrant)
    : undefined;
  const estimatedMonthlyBenefit = monthlyBenefit !== undefined ? Math.max(monthlyBenefit, 0) : undefined;
  const estimatedAnnualBenefit = estimatedMonthlyBenefit !== undefined ? roundMoney(estimatedMonthlyBenefit * 12) : undefined;
  const referenceYearChangeLikelihood: DuoAdditionalGrantReferenceYearLikelihood =
    !meetsFifteenPercentCondition
      ? "unlikely"
      : (monthlyBenefit ?? 0) <= 0
        ? "not-beneficial"
        : input.alternative.status === "official-verification-required"
          ? "official-verification-required"
          : "possible";

  return {
    standardReferenceYear,
    alternativeReferenceYear: input.alternativeReferenceYear,
    standardJointIncome,
    alternativeJointIncome,
    absoluteIncomeDrop,
    incomeDropPercent,
    meetsFifteenPercentCondition,
    referenceYearChangeLikelihood,
    estimatedMonthlyBenefit: referenceYearChangeLikelihood === "possible" || referenceYearChangeLikelihood === "official-verification-required"
      ? estimatedMonthlyBenefit
      : 0,
    estimatedAnnualBenefit: referenceYearChangeLikelihood === "possible" || referenceYearChangeLikelihood === "official-verification-required"
      ? estimatedAnnualBenefit
      : 0,
    reasonCodes: unique([
      meetsFifteenPercentCondition
        ? "duo-additional-grant-income-drop-at-least-15-percent"
        : "duo-additional-grant-income-drop-below-15-percent",
      (monthlyBenefit ?? 0) > 0
        ? "duo-additional-grant-alternative-reference-year-financially-beneficial"
        : "duo-additional-grant-alternative-reference-year-not-financially-beneficial",
      ...(input.alternative.status === "official-verification-required"
        ? ["duo-additional-grant-estimated-income-repayment-risk"]
        : []),
    ]),
  };
}

export function calculateDuoAdditionalGrant(input: DuoAdditionalGrantInput): DuoAdditionalGrantResult {
  const dataset = resolveDataset();
  const freshness = getDatasetFreshness(dataset, "2026-07-20");
  const rules = dataset.data;
  const standardReferenceYear = valueNumber(rules.referenceYear.standardReferenceYear);
  const standard = calculateScenario({
    scanInput: input,
    scenario: input.standardReferenceYearInput,
    referenceYear: standardReferenceYear,
    rules,
    dataset,
    freshnessStatus: freshness.status,
  });
  const allowedAlternativeYears = new Set(
    rules.referenceYearChange.allowedAlternativeYearsWhenReferenceYear2024.map((year) => valueNumber(year)),
  );
  const alternativeYearAllowed =
    input.alternativeReferenceYear === undefined || allowedAlternativeYears.has(input.alternativeReferenceYear);
  const alternative = input.alternativeReferenceYear !== undefined && alternativeYearAllowed
    ? calculateScenario({
        scanInput: input,
        scenario: input.alternativeReferenceYearInput,
        referenceYear: input.alternativeReferenceYear,
        rules,
        dataset,
        freshnessStatus: freshness.status,
      })
    : undefined;
  const comparison = compareReferenceYears({
    rules,
    standard,
    alternative,
    alternativeReferenceYear: input.alternativeReferenceYear,
  });
  const resultReasonCodes = unique([
    ...standard.reasonCodes,
    ...(alternative?.reasonCodes ?? []),
    ...comparison.reasonCodes,
    ...(alternativeYearAllowed ? [] : ["duo-additional-grant-alternative-reference-year-not-allowed"]),
  ]);
  const status: DuoAdditionalGrantStatus = !alternativeYearAllowed
    ? "unsupported"
    : standard.status === "calculated" && (!alternative || alternative.status === "calculated")
      ? "calculated"
      : standard.status;

  return deepFreeze({
    status,
    calculationYear: input.calculationYear,
    educationType: input.educationType,
    residence: input.residence,
    standardReferenceYear,
    alternativeReferenceYear: input.alternativeReferenceYear,
    standardReferenceYearResult: standard,
    alternativeReferenceYearResult: alternative,
    referenceYearComparison: comparison,
    estimatedMonthlyGrant: standard.estimatedMonthlyGrant,
    estimatedAnnualGrant: standard.estimatedAnnualGrant,
    appliedMaximumMonthlyGrant: standard.maximumMonthlyGrant,
    decisiveInputs: [
      "calculationYear",
      "educationType",
      "residence",
      "familySituation",
      "parent incomes",
      "parent deductions",
      "childrenWithAdditionalGrant",
    ],
    derivedInputs: [],
    missingInputs: standard.missingInputs,
    reasonCodes: resultReasonCodes,
    calculationTrace: standard.calculationTrace,
    sourceReferences: unique([
      ...standard.sourceReferences,
      ...(alternative?.sourceReferences ?? []),
      sourceReference(dataset, freshness.status, rules.referenceYear.standardReferenceYear),
      sourceReference(dataset, freshness.status, rules.referenceYearChange.minimumIncomeDropPercent),
    ]),
    confidence: status === "calculated" ? standard.confidence : "low",
    officialVerificationRequired:
      status !== "calculated" ||
      standard.officialVerificationRequired ||
      Boolean(alternative?.officialVerificationRequired),
    assumptions: [
      "Bedragen worden in euro per maand afgerond op centen.",
      "Jaarbedrag is maandbedrag maal 12 voor de ondersteunde reguliere berekening.",
      "Negatief ouderinkomen is toegestaan, conform DUO-folderinstructie; negatieve aantallen en negatieve termijnen niet.",
    ],
    limitations: [
      "Mbo-bedragen na juli 2026 blijven special-case totdat de tweede periode centraal is gevalideerd.",
      "Overleden, onbekende, buitenlandse of buitenbeschouwing-ouders en ernstige conflictsituaties vereisen handmatige DUO-beoordeling.",
      "De publieke tool mag deze centrale laag pas gebruiken met concrete waarden of bevestigde afleidingen; unresolved unknown is geen rekeninput.",
    ],
  });
}
