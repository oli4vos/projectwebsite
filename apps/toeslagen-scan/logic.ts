import {
  ALLOWANCE_ADVISOR_APPLICATION_GUIDANCE,
  ALLOWANCE_UNKNOWN_RESOLUTION_MATRIX,
  type AllowanceAdvisorReliabilityLabel,
  type AllowanceAdvisorReportLine,
  type AllowanceAdvisorReportModel,
  type AllowanceAdvisorReportResult,
} from "@/lib/allowances/advisor-experience";
import {
  calculateOfficialAllowanceScan2026,
  type OfficialAllowanceCalculationResult,
} from "@/lib/allowances/official-calculations";
import {
  evaluateAllowanceRegulations,
} from "@/lib/allowances/regulations-pipeline";
import {
  ALLOWANCE_SIGNAL_ORDER,
  type AllowanceKind,
  type AllowanceMissingField,
  type AllowanceScanInput,
  type UnknownableBoolean,
} from "@/lib/allowances/signaling";
import type { SourceReference } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import { buildQuestionFlow } from "@/lib/regulations/question-flow";
import type { AnswerState, FieldId } from "@/lib/regulations/types";
import {
  allowanceTitles,
  getPublicResultStatusLabel,
  getReasonCodeCopy,
  getReliabilityDescription,
  getReliabilityLabel,
  getUncertaintyCopy,
} from "./copy";
import type {
  AllowanceQuestionFlowItemView,
  AllowanceQuestionFlowView,
  AllowancePublicResultStatus,
  AllowanceMissingInputView,
  AllowanceScanErrors,
  AllowanceScanField,
  AllowanceScanFormState,
  AllowanceScanView,
  ChildResidenceChoice,
  QualifyingActivityChoice,
  YesNoUnknown,
} from "./types";

export const defaultValues: AllowanceScanFormState = {
  age: "",
  partnerStatus: "unknown",
  assessmentIncome: "",
  jointAssessmentIncome: "",
  assets: "",
  jointAssets: "",
  complexSituation: "unknown",
  foreignOrResidenceSituation: "unknown",
  specialAssets: "unknown",
  partYearPartner: "unknown",
  hasDutchHealthInsurance: "unknown",
  tenure: "unknown",
  independentHome: "unknown",
  basicRent: "",
  hasCoResidents: "unknown",
  householdIncome: "",
  householdAssets: "",
  complexHousing: "unknown",
  adaptedHomeOrDisability: "unknown",
  uncertainSubsidiableRent: "unknown",
  hasChildren: "unknown",
  childCount: "",
  childAges: "",
  receivesChildBenefit: "unknown",
  childLivesWithApplicant: "unknown",
  complexFamily: "unknown",
  usesChildcare: "unknown",
  registeredChildcare: "unknown",
  paysOwnContribution: "unknown",
  childcareHoursPerMonth: "",
  applicantActivity: "unknown",
  partnerActivity: "unknown",
  complexChildcare: "unknown",
};

export const exampleValues: AllowanceScanFormState = {
  ...defaultValues,
  age: "34",
  partnerStatus: "no",
  assessmentIncome: "30000",
  assets: "12000",
  hasDutchHealthInsurance: "yes",
  tenure: "rent",
  independentHome: "yes",
  basicRent: "850",
  hasCoResidents: "no",
  hasChildren: "yes",
  childCount: "1",
  childAges: "6",
  receivesChildBenefit: "yes",
  childLivesWithApplicant: "yes",
  usesChildcare: "yes",
  registeredChildcare: "yes",
  paysOwnContribution: "yes",
  childcareHoursPerMonth: "80",
  applicantActivity: "work",
};

function parseMoney(value: string) {
  return parseOptionalDecimalInput(value);
}

function parseInteger(value: string) {
  if (value.trim().length === 0) {
    return undefined;
  }
  const parsed = Number(value.replace(/\s+/g, ""));
  return Number.isInteger(parsed) ? parsed : undefined;
}

function yesNoUnknown(value: YesNoUnknown): UnknownableBoolean {
  if (value === "yes") return true;
  if (value === "no") return false;
  return "unknown";
}

function optionalFlag(value: YesNoUnknown) {
  return value === "yes" ? true : undefined;
}

function childLivesChoice(value: ChildResidenceChoice): UnknownableBoolean {
  if (value === "yes" || value === "partial") return true;
  if (value === "no") return false;
  return "unknown";
}

function activityToBoolean(value: QualifyingActivityChoice): UnknownableBoolean {
  if (value === "work" || value === "study" || value === "trajectory") return true;
  if (value === "none") return false;
  return "unknown";
}

function parseChildAges(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  return trimmed
    .split(/[,\n;]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item.replace(",", ".")));
}

function hasInvalidNumberInput(value: string) {
  return value.trim().length > 0 && parseMoney(value) === undefined;
}

function hasNegativeNumberInput(value: string) {
  const parsed = parseMoney(value);
  return parsed !== undefined && parsed < 0;
}

function hasInvalidIntegerInput(value: string) {
  return value.trim().length > 0 && parseInteger(value) === undefined;
}

export function validateAllowanceScanForm(values: AllowanceScanFormState): AllowanceScanErrors {
  const errors: AllowanceScanErrors = {};

  function validateMoneyField(
    field: Extract<
      AllowanceScanField,
      | "age"
      | "assessmentIncome"
      | "jointAssessmentIncome"
      | "assets"
      | "jointAssets"
      | "basicRent"
      | "householdIncome"
      | "householdAssets"
      | "childcareHoursPerMonth"
    >,
  ) {
    if (hasInvalidNumberInput(values[field])) {
      errors[field] = "Gebruik een geldig getal of laat dit veld leeg.";
    } else if (hasNegativeNumberInput(values[field])) {
      errors[field] = "Gebruik 0 of een hogere waarde.";
    }
  }

  for (const field of ["age", "assessmentIncome", "assets"] as const) {
    validateMoneyField(field);
  }

  if (values.age.trim().length > 0) {
    const age = parseInteger(values.age);
    if (age === undefined || age < 0 || age > 120) {
      errors.age = "Gebruik een leeftijd tussen 0 en 120 jaar.";
    }
  }

  if (values.partnerStatus === "yes") {
    validateMoneyField("jointAssessmentIncome");
    validateMoneyField("jointAssets");
    if (values.jointAssessmentIncome.trim().length > 0 && errors.jointAssessmentIncome) {
      errors.jointAssessmentIncome = "Gebruik een geldig gezamenlijk inkomen.";
    }
    if (values.jointAssets.trim().length > 0 && errors.jointAssets) {
      errors.jointAssets = "Gebruik een geldig gezamenlijk vermogen.";
    }
  }

  if (values.tenure === "rent") {
    validateMoneyField("basicRent");
    if (errors.basicRent) {
      errors.basicRent = "Gebruik een geldige kale huur per maand.";
    }

    if (values.hasCoResidents === "yes") {
      validateMoneyField("householdIncome");
      validateMoneyField("householdAssets");
      if (errors.householdIncome) {
        errors.householdIncome = "Gebruik een geldig huishoudinkomen.";
      }
      if (errors.householdAssets) {
        errors.householdAssets = "Gebruik een geldig huishoudvermogen.";
      }
    }
  }

  if (values.hasChildren === "yes") {
    if (hasInvalidIntegerInput(values.childCount)) {
      errors.childCount = "Gebruik een heel aantal kinderen.";
    } else {
      const childCount = parseInteger(values.childCount);
      if (childCount !== undefined && childCount < 0) {
        errors.childCount = "Gebruik 0 of een hoger aantal kinderen.";
      }
    }

    const childAges = parseChildAges(values.childAges);
    if (childAges?.some((age) => !Number.isInteger(age) || age < 0 || age > 30)) {
      errors.childAges = "Gebruik leeftijden als hele jaren, gescheiden door komma's.";
    }
  }

  if (values.hasChildren === "yes" && values.usesChildcare === "yes") {
    validateMoneyField("childcareHoursPerMonth");
    const hours = parseMoney(values.childcareHoursPerMonth);
    if (values.childcareHoursPerMonth.trim().length > 0) {
      if (hours === undefined || !Number.isFinite(hours)) {
        errors.childcareHoursPerMonth = "Gebruik een geldig aantal opvanguren.";
      } else if (hours < 0) {
        errors.childcareHoursPerMonth = "Gebruik 0 of meer opvanguren.";
      }
    }
  }

  return errors;
}

export function mapFormToAllowanceScanInput(values: AllowanceScanFormState): AllowanceScanInput {
  const hasPartner = values.partnerStatus === "yes";
  const hasChildren = values.hasChildren === "yes";
  const noChildren = values.hasChildren === "no";
  const childAges = parseChildAges(values.childAges);
  const inferChildrenFromAges = values.hasChildren === "unknown" && (childAges?.length ?? 0) > 0;
  const usesChildcare = hasChildren && values.usesChildcare === "yes";
  const renting = values.tenure === "rent";
  const coResidents = values.hasCoResidents === "yes";
  const childResidence = childLivesChoice(values.childLivesWithApplicant);
  const input: AllowanceScanInput = {
    year: 2026,
    age: parseInteger(values.age),
    partnerStatus: values.partnerStatus,
    assessmentIncome: parseMoney(values.assessmentIncome),
    assets: parseMoney(values.assets),
    complexSituation: optionalFlag(values.complexSituation),
    foreignOrResidenceSituation: optionalFlag(values.foreignOrResidenceSituation),
    specialAssets: optionalFlag(values.specialAssets),
    partYearPartner: optionalFlag(values.partYearPartner),
    healthcare: {
      hasDutchHealthInsurance: yesNoUnknown(values.hasDutchHealthInsurance),
    },
    rent: {
      tenure: values.tenure,
      independentHome: renting ? yesNoUnknown(values.independentHome) : false,
      basicRent: renting ? parseMoney(values.basicRent) : 0,
      hasCoResidents: renting ? yesNoUnknown(values.hasCoResidents) : false,
      householdIncome: renting && coResidents ? parseMoney(values.householdIncome) : undefined,
      householdAssets: renting && coResidents ? parseMoney(values.householdAssets) : undefined,
      complexHousing: renting ? optionalFlag(values.complexHousing) : undefined,
      adaptedHomeOrDisability: renting ? optionalFlag(values.adaptedHomeOrDisability) : undefined,
      uncertainSubsidiableRent: renting ? optionalFlag(values.uncertainSubsidiableRent) : undefined,
    },
    childBudget: {
      hasChildren: inferChildrenFromAges ? undefined : yesNoUnknown(values.hasChildren),
      childAges: hasChildren || inferChildrenFromAges ? childAges : noChildren ? [] : undefined,
      receivesChildBenefit: hasChildren
        ? yesNoUnknown(values.receivesChildBenefit)
        : noChildren
          ? false
          : "unknown",
      childLivesWithApplicant: hasChildren ? childResidence : noChildren ? false : "unknown",
      coParenting: values.childLivesWithApplicant === "partial",
      compositeFamily: hasChildren ? optionalFlag(values.complexFamily) : undefined,
      specialChildBenefitSituation: hasChildren ? optionalFlag(values.complexFamily) : undefined,
    },
    childcare: {
      hasChildren: inferChildrenFromAges ? undefined : yesNoUnknown(values.hasChildren),
      usesChildcare: hasChildren ? yesNoUnknown(values.usesChildcare) : noChildren ? false : "unknown",
      registeredChildcare: usesChildcare ? yesNoUnknown(values.registeredChildcare) : false,
      paysOwnContribution: usesChildcare ? yesNoUnknown(values.paysOwnContribution) : false,
      childLivesWithApplicant: usesChildcare ? childResidence : noChildren ? false : "unknown",
      applicantHasQualifyingActivity: usesChildcare ? activityToBoolean(values.applicantActivity) : false,
      partnerHasQualifyingActivity: hasPartner
        ? usesChildcare
          ? activityToBoolean(values.partnerActivity)
          : false
        : "not-applicable",
      hoursPerMonth: usesChildcare ? parseMoney(values.childcareHoursPerMonth) : 0,
      complexActivityOrPartnerSituation: usesChildcare ? optionalFlag(values.complexChildcare) : undefined,
      variableHours: usesChildcare ? optionalFlag(values.complexChildcare) : undefined,
      multipleChildcareTypes: usesChildcare ? optionalFlag(values.complexChildcare) : undefined,
      lrkUncertain: usesChildcare && values.registeredChildcare === "unknown" ? true : undefined,
    },
  };

  if (hasPartner) {
    input.jointAssessmentIncome = parseMoney(values.jointAssessmentIncome);
    input.jointAssets = parseMoney(values.jointAssets);
  }

  return input;
}

function dedupeOfficialLinks(references: SourceReference[], officialCalculationUrl: string) {
  const links = [
    ...references.map((reference) => ({
      label: reference.label.replace("Officiele", "Officiële"),
      href: reference.sourceUrl,
    })),
    { label: "Officiële proefberekening", href: officialCalculationUrl },
  ].filter((link) => link.href.startsWith("https://www.belastingdienst.nl/"));

  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function publicStatusFor(result: OfficialAllowanceCalculationResult): AllowancePublicResultStatus {
  if (result.status === "incomplete") {
    return "incomplete";
  }
  if (result.status === "special-case") {
    return "special-case";
  }
  if (result.status === "unavailable") {
    return result.eligibilityStatus === "fails-known-hard-checks" ? "ineligible" : "unavailable";
  }
  if (result.eligibilityStatus === "fails-known-hard-checks") {
    return "ineligible";
  }
  return "eligible-estimate";
}

function publicSummary(result: OfficialAllowanceCalculationResult) {
  const status = publicStatusFor(result);
  if (status === "eligible-estimate") {
    return result.amount.monthlyAmount !== undefined
      ? "De centrale berekening kan voor deze toeslag een indicatief maand- en jaarbedrag tonen. Controleer altijd met Mijn Toeslagen."
      : "De bekende harde voorwaarden sluiten deze toeslag niet uit, maar er is nog geen bedrag beschikbaar.";
  }
  if (status === "ineligible") {
    return "Op basis van bekende harde voorwaarden lijkt deze toeslag waarschijnlijk niet van toepassing.";
  }
  if (status === "incomplete") {
    return "Er ontbreken nog gegevens voordat de centrale berekening deze toeslag kan beoordelen.";
  }
  if (status === "special-case") {
    return "Je situatie bevat een bijzondere of onzekere factor. Officiële controle blijft nodig.";
  }
  return "De centrale berekening kan voor deze toeslag nog geen bedrag tonen.";
}

function reliabilityFor(result: OfficialAllowanceCalculationResult): {
  label: AllowanceAdvisorReliabilityLabel;
} {
  if (result.status === "available" && result.amount.monthlyAmount !== undefined) {
    return {
      label: result.officialVerificationRequired ? "redelijke-indicatie" : "sterke-indicatie",
    };
  }
  if (result.status === "incomplete") {
    return {
      label: "voorlopige-indicatie",
    };
  }
  if (result.status === "special-case") {
    return {
      label: "voorlopige-indicatie",
    };
  }
  return {
    label: "voorlopige-indicatie",
  };
}

function createSummary(statuses: readonly AllowancePublicResultStatus[]) {
  if (statuses.includes("incomplete")) {
    return "Voor één of meer toeslagen ontbreken nog gegevens.";
  }
  if (statuses.includes("eligible-estimate")) {
    return "De centrale toeslagenberekening kan voor één of meer toeslagen een indicatie tonen. Controleer aanvragen of wijzigingen altijd in Mijn Toeslagen.";
  }
  if (statuses.includes("special-case")) {
    return "Voor één of meer toeslagen is officiële controle nodig door een bijzondere situatie.";
  }
  if (statuses.every((status) => status === "ineligible")) {
    return "Op basis van de ingevulde harde voorwaarden lijken de onderzochte toeslagen waarschijnlijk niet van toepassing.";
  }
  return "Bekijk per toeslag de centrale status, ontbrekende gegevens en vervolgstappen.";
}

function unknownDesignForField(fieldId: string) {
  return ALLOWANCE_UNKNOWN_RESOLUTION_MATRIX.find((item) =>
    item.fieldIds.includes(fieldId as AllowanceMissingField),
  );
}

function missingInputViews(fields: readonly string[]): readonly AllowanceMissingInputView[] {
  return fields.map((fieldId) => {
    const design = unknownDesignForField(fieldId);
    return {
      label: fieldLabel(fieldId),
      whyNeeded: design?.whyNeeded ?? "Deze informatie is nodig om de centrale toeslagenberekening verantwoord te maken.",
      alternativeQuestions: design?.alternativeQuestions ?? ["Kun je dit controleren in Mijn Toeslagen of je eigen documenten?"],
      whereToFind: design?.whereToFind ?? ["Mijn Toeslagen"],
    };
  });
}

function sourceLinksFor(result: OfficialAllowanceCalculationResult) {
  return dedupeOfficialLinks(
    result.sourceReferences as SourceReference[],
    result.signal.officialCalculationUrl,
  );
}

function reportLine(
  label: string,
  value: string,
  reasonCodes: readonly string[],
  sourceFieldId?: string,
  inputState?: AllowanceAdvisorReportLine["inputState"],
): AllowanceAdvisorReportLine {
  return {
    label,
    value,
    inputState,
    sourceFieldId: sourceFieldId ? sourceFieldId as AllowanceMissingField : undefined,
    reasonCodes,
  };
}

function formatReportValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : "Geen";
  }
  if (typeof value === "boolean") {
    return value ? "Ja" : "Nee";
  }
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : new Intl.NumberFormat("nl-NL").format(value);
  }
  if (value === "yes") return "Ja";
  if (value === "no") return "Nee";
  if (value === "unknown") return "Weet ik niet";
  if (value === "not-applicable") return "Niet van toepassing";
  if (value === "rent") return "Huurwoning";
  if (value === "owner") return "Koopwoning";
  if (value === "other") return "Anders";
  if (value === "work") return "Werk";
  if (value === "study") return "Studie";
  if (value === "trajectory") return "Traject";
  if (value === "none") return "Geen";
  if (value === undefined || value === null || value === "") return "Ontbreekt";
  return String(value);
}

function reportAnsweredInputs(
  results: readonly OfficialAllowanceCalculationResult[],
  values: AllowanceScanFormState,
): readonly AllowanceAdvisorReportLine[] {
  const byField = new Map<FieldId, AnswerState>();
  for (const result of results) {
    const visibleAnswers = applyQuestionFlowVisibility(values, result.assessment.resolvedAnswers);
    for (const [fieldId, answer] of Object.entries(visibleAnswers)) {
      const existing = byField.get(fieldId);
      if (!existing || existing.state === "unknown") {
        byField.set(fieldId, answer);
      }
    }
  }

  return [...byField.entries()]
    .filter(([, answer]) => answer.state === "known")
    .sort(([left], [right]) => fieldLabel(left).localeCompare(fieldLabel(right), "nl-NL"))
    .map(([fieldId, answer]) =>
      reportLine(
        fieldLabel(fieldId),
        "value" in answer ? formatReportValue(answer.value) : "Ingevuld",
        "reasonCodes" in answer ? answer.reasonCodes : [],
        fieldId,
        "answered",
      ),
    );
}

function reportStatusFor(status: AllowancePublicResultStatus): AllowanceAdvisorReportResult["status"] {
  if (status === "eligible-estimate") return "likely-eligible-with-indication";
  if (status === "ineligible") return "likely-not-eligible";
  if (status === "special-case") return "special-situation";
  return "not-determinable-yet";
}

function buildReport(input: {
  summary: string;
  calculationYear: number;
  results: readonly OfficialAllowanceCalculationResult[];
  cards: readonly ReturnType<typeof cardForResult>[];
  values: AllowanceScanFormState;
  generatedAt: string;
}): AllowanceAdvisorReportModel {
  const answeredInputs = reportAnsweredInputs(input.results, input.values);
  const reportResults = input.results.map((result, index) => {
    const card = input.cards[index];
    if (!card) {
      throw new Error("Ontbrekende rapportkaart voor toeslagenrapport.");
    }
    const guidance = ALLOWANCE_ADVISOR_APPLICATION_GUIDANCE.find((item) =>
      item.allowanceKind === result.allowanceKind,
    );
    const reasons = result.reasonCodes.map((code) =>
      reportLine("Reden", getReasonCodeCopy(code), [code]),
    );
    const missingInputs = result.missingFields.map((fieldId) =>
      reportLine("Ontbrekend gegeven", fieldLabel(fieldId), result.reasonCodes, fieldId, "missing"),
    );
    const warnings = result.uncertaintyCodes.map((code) =>
      reportLine("Waarschuwing", getUncertaintyCopy(code), [code]),
    );
    const resultFieldIds = new Set(result.assessment.definition.inputDefinitions.map((field) => field.fieldId));
    const resultAnsweredInputs = answeredInputs.filter((line) =>
      line.sourceFieldId ? resultFieldIds.has(line.sourceFieldId) : false,
    );

    return {
      allowanceKind: result.allowanceKind,
      status: reportStatusFor(card.status),
      reliability: card.reliabilityLabel,
      monthlyAmountLabel: card.monthlyAmountLabel,
      yearlyAmountLabel: card.annualAmountLabel,
      calculationYear: input.calculationYear,
      reasons,
      answeredInputs: resultAnsweredInputs,
      inferredInputs: [
        ...card.inferredInputMessages.map((message) =>
          reportLine("Afgeleid gegeven", message, result.reasonCodes, undefined, "inferred"),
        ),
        ...card.confirmationMessages.map((message) =>
          reportLine("Nog te bevestigen", message, result.reasonCodes, undefined, "pending-confirmation"),
        ),
      ],
      missingInputs,
      warnings,
      applicationSteps: guidance?.steps ?? ["Controleer je gegevens in Mijn Toeslagen."],
      officialSources: result.sourceReferences,
    } satisfies AllowanceAdvisorReportResult;
  });

  return {
    title: "Toeslagenscan",
    generatedAt: input.generatedAt,
    calculationYear: input.calculationYear,
    summary: [input.summary],
    results: reportResults,
    answeredInputs,
    inferredInputs: reportResults.flatMap((item) => item.inferredInputs),
    missingInputs: reportResults.flatMap((item) => item.missingInputs),
    officialSources: [...new Map(input.results.flatMap((item) => item.sourceReferences).map((source) => [
      `${source.datasetId}:${source.version}:${source.sourceUrl}`,
      source,
    ])).values()],
    disclaimer: "Deze rapportdata gebruikt dezelfde centrale berekening en invoer als het scherm. Het is geen beschikking en geen advies; Mijn Toeslagen blijft leidend voor aanvragen en wijzigingen.",
  };
}

function cardForResult(item: OfficialAllowanceCalculationResult) {
  const status = publicStatusFor(item);
  const reliability = reliabilityFor(item);
  const inferred = item.assessment.inferredValues.map((inference) =>
    `${fieldLabel(inference.targetField)} is afgeleid uit ${inference.sourceFields.map(fieldLabel).join(", ")}.`,
  );
  const confirmationMessages = item.assessment.inferredValues
    .filter((inference) => inference.overwriteAllowed)
    .map((inference) => `Controleer ${fieldLabel(inference.targetField).toLowerCase()} en pas de invoer aan als dit niet klopt.`);

  return {
    kind: item.allowanceKind,
    title: allowanceTitles[item.allowanceKind],
    status,
    statusLabel: getPublicResultStatusLabel(status),
    summary: publicSummary(item),
    hardExclusion: item.signal.hardExclusion,
    monthlyAmountLabel: item.amount.monthlyAmount !== undefined
      ? formatCurrency(item.amount.monthlyAmount)
      : undefined,
    annualAmountLabel: item.amount.annualAmount !== undefined
      ? formatCurrency(item.amount.annualAmount)
      : undefined,
    reliabilityLabel: reliability.label,
    reliabilityDisplayLabel: getReliabilityLabel(reliability.label),
    reliabilityDescription: getReliabilityDescription(reliability.label),
    reasonMessages: item.reasonCodes.map(getReasonCodeCopy),
    missingFieldMessages: item.missingFields.map((field) => fieldLabel(field)),
    missingInputs: missingInputViews(item.missingFields),
    uncertaintyMessages: item.uncertaintyCodes.map(getUncertaintyCopy),
    inferredInputMessages: inferred,
    confirmationMessages,
    officialCalculationUrl: item.signal.officialCalculationUrl,
    sourceLinks: sourceLinksFor(item),
    ruleYear: item.calculationYear,
    datasetId: item.datasetId,
    datasetVersion: item.datasetVersion,
  };
}

export function createAllowanceScanView(
  values: AllowanceScanFormState,
  options: { readonly generatedAt?: string | Date } = {},
): AllowanceScanView {
  const errors = validateAllowanceScanForm(values);
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, result: null };
  }

  const input = mapFormToAllowanceScanInput(values);
  const calculation = calculateOfficialAllowanceScan2026({
    ...input,
    calculationYear: 2026,
  });
  if (!calculation.ok) {
    throw new Error(`Toeslagenberekening kon niet worden opgebouwd: ${calculation.errors.join(", ")}`);
  }
  const ordered = [...calculation.value.results].sort(
    (a, b) =>
      ALLOWANCE_SIGNAL_ORDER.indexOf(a.allowanceKind) -
      ALLOWANCE_SIGNAL_ORDER.indexOf(b.allowanceKind),
  );
  const cards = ordered.map(cardForResult);
  const summary = createSummary(cards.map((card) => card.status));

  return {
    isValid: true,
    errors,
    result: {
      summary,
      ruleYear: calculation.value.calculationYear,
      datasetId: calculation.value.datasetId,
      datasetVersion: calculation.value.datasetVersion,
      cards,
      report: buildReport({
        summary,
        calculationYear: calculation.value.calculationYear,
        results: ordered,
        cards,
        values,
        generatedAt: options.generatedAt instanceof Date
          ? options.generatedAt.toISOString()
          : options.generatedAt ?? new Date().toISOString(),
      }),
    },
  };
}

const fieldLabels: Record<AllowanceMissingField, string> = {
  year: "Kalenderjaar",
  age: "Leeftijd",
  partnerStatus: "Toeslagpartner",
  assessmentIncome: "Geschat toetsingsinkomen",
  jointAssessmentIncome: "Gezamenlijk toetsingsinkomen",
  assets: "Vermogen op 1 januari",
  jointAssets: "Gezamenlijk vermogen op 1 januari",
  householdIncome: "Huishoudinkomen voor huurtoeslag",
  householdAssets: "Huishoudvermogen",
  "healthcare.hasDutchHealthInsurance": "Nederlandse zorgverzekering",
  "rent.tenure": "Woonsituatie",
  "rent.independentHome": "Zelfstandige woonruimte",
  "rent.basicRent": "Kale huur per maand",
  "rent.hasCoResidents": "Medebewoners",
  "children.hasChildren": "Kinderen",
  "children.childAges": "Leeftijden kinderen",
  "children.receivesChildBenefit": "Kinderbijslag",
  "children.childLivesWithApplicant": "Kind woont bij jou",
  "childcare.usesChildcare": "Betaalde kinderopvang",
  "childcare.registeredChildcare": "LRK-registratie opvang",
  "childcare.paysOwnContribution": "Eigen bijdrage opvang",
  "childcare.childLivesWithApplicant": "Kind woont bij jou",
  "childcare.applicantHasQualifyingActivity": "Jouw activiteit",
  "childcare.partnerHasQualifyingActivity": "Activiteit toeslagpartner",
  "childcare.hoursPerMonth": "Opvanguren per maand",
};

function allowanceOrder(kind: AllowanceKind) {
  return ALLOWANCE_SIGNAL_ORDER.indexOf(kind);
}

function fieldLabel(fieldId: FieldId | undefined) {
  if (!fieldId) {
    return "Aanvullende informatie";
  }

  return fieldLabels[fieldId as AllowanceMissingField] ?? fieldId;
}

function skipped(fieldId: FieldId, reasonCodes: readonly string[]): AnswerState {
  return { state: "skipped", fieldId, reasonCodes };
}

function notApplicable(fieldId: FieldId, reasonCodes: readonly string[]): AnswerState {
  return { state: "not-applicable", fieldId, reasonCodes };
}

function applyQuestionFlowVisibility(
  values: AllowanceScanFormState,
  answers: Readonly<Record<FieldId, AnswerState>>,
): Readonly<Record<FieldId, AnswerState>> {
  const mapped = { ...answers };
  const hasPartner = values.partnerStatus === "yes";
  const renting = values.tenure === "rent";
  const notRenting = values.tenure === "owner" || values.tenure === "other";
  const hasCoResidents = renting && values.hasCoResidents === "yes";
  const hasChildren = values.hasChildren === "yes";
  const noChildren = values.hasChildren === "no";
  const usesChildcare = hasChildren && values.usesChildcare === "yes";

  if (!hasPartner) {
    mapped.jointAssessmentIncome = skipped("jointAssessmentIncome", ["allowance.flow.hidden.no-partner"]);
    mapped.jointAssets = skipped("jointAssets", ["allowance.flow.hidden.no-partner"]);
    mapped["childcare.partnerHasQualifyingActivity"] = notApplicable(
      "childcare.partnerHasQualifyingActivity",
      ["allowance.flow.not-applicable.no-partner"],
    );
  }

  if (notRenting) {
    for (const fieldId of [
      "rent.independentHome",
      "rent.basicRent",
      "rent.hasCoResidents",
      "householdIncome",
      "householdAssets",
    ] as const) {
      mapped[fieldId] = skipped(fieldId, ["allowance.flow.hidden.not-renting"]);
    }
  } else if (!hasCoResidents) {
    mapped.householdIncome = skipped("householdIncome", ["allowance.flow.hidden.no-co-residents"]);
    mapped.householdAssets = skipped("householdAssets", ["allowance.flow.hidden.no-co-residents"]);
  }

  if (noChildren) {
    for (const fieldId of [
      "children.childAges",
      "children.receivesChildBenefit",
      "children.childLivesWithApplicant",
      "childcare.usesChildcare",
      "childcare.registeredChildcare",
      "childcare.paysOwnContribution",
      "childcare.childLivesWithApplicant",
      "childcare.applicantHasQualifyingActivity",
      "childcare.hoursPerMonth",
    ] as const) {
      mapped[fieldId] = skipped(fieldId, ["allowance.flow.hidden.no-children"]);
    }
  } else if (!usesChildcare) {
    for (const fieldId of [
      "childcare.registeredChildcare",
      "childcare.paysOwnContribution",
      "childcare.childLivesWithApplicant",
      "childcare.applicantHasQualifyingActivity",
      "childcare.partnerHasQualifyingActivity",
      "childcare.hoursPerMonth",
    ] as const) {
      mapped[fieldId] = skipped(fieldId, ["allowance.flow.hidden.no-childcare"]);
    }
  }

  return mapped;
}

function mapFormToAllowanceQuestionFlowInput(
  values: AllowanceScanFormState,
): AllowanceScanInput {
  const input = mapFormToAllowanceScanInput(values);
  const childAges = parseChildAges(values.childAges) ?? [];

  if (values.hasChildren === "unknown" && childAges.length > 0) {
    input.childBudget = {
      ...input.childBudget,
      hasChildren: undefined,
      childAges,
    };
    input.childcare = {
      ...input.childcare,
      hasChildren: undefined,
    };
  }

  return input;
}

function statusRank(status: NonNullable<AllowanceQuestionFlowView["questionStatuses"][AllowanceMissingField]>) {
  return {
    blocked: 7,
    inferred: 6,
    active: 5,
    pending: 4,
    "not-applicable": 3,
    skipped: 2,
    answered: 1,
  }[status];
}

function aggregateDecision(
  items: readonly AllowanceQuestionFlowItemView[],
): AllowanceQuestionFlowView["decisionReason"] {
  if (items.length === 0) {
    return "empty";
  }
  if (items.some((item) => item.decisionReason === "blocked")) {
    return "blocked";
  }
  if (items.some((item) => item.decisionReason === "next-pending")) {
    return "next-pending";
  }

  return "complete";
}

function emptyQuestionFlowView(errors: AllowanceScanErrors): AllowanceQuestionFlowView {
  return {
    isValid: false,
    errors,
    totalRelevant: 0,
    completed: 0,
    answered: 0,
    inferred: 0,
    skipped: 0,
    blocked: 0,
    remaining: 0,
    percentage: 0,
    decisionReason: "empty",
    items: [],
    questionStatuses: {},
    reporting: {
      answeredFieldLabels: [],
      inferredFieldLabels: [],
      skippedFieldLabels: [],
      notApplicableFieldLabels: [],
      blockingFieldLabels: [],
      confidenceLabels: [],
      officialVerificationRequired: false,
      recommendationIds: [],
    },
  };
}

function labelsForQuestions(
  questionIds: readonly string[],
  questions: ReturnType<typeof buildQuestionFlow>["questions"],
) {
  return questionIds
    .map((questionId) => questions.find((question) => question.questionId === questionId)?.fieldId)
    .map(fieldLabel)
    .filter((label): label is string => Boolean(label));
}

function uniqueLabels(labels: readonly string[]) {
  return [...new Set(labels)];
}

export function createAllowanceQuestionFlowView(
  values: AllowanceScanFormState,
): AllowanceQuestionFlowView {
  const errors = validateAllowanceScanForm(values);
  if (Object.keys(errors).length > 0) {
    return emptyQuestionFlowView(errors);
  }

  const input = mapFormToAllowanceQuestionFlowInput(values);
  const regulations = evaluateAllowanceRegulations(input);
  if (!regulations.ok) {
    throw new Error(`Toeslagenvraagflow kon niet worden opgebouwd: ${regulations.errors.join(", ")}`);
  }

  const flows = [...regulations.value.assessments]
    .sort((left, right) => allowanceOrder(left.allowanceKind) - allowanceOrder(right.allowanceKind))
    .map((assessment) => ({
      assessment,
      flow: buildQuestionFlow({
        definition: assessment.definition,
        answers: applyQuestionFlowVisibility(values, assessment.resolvedAnswers),
        unknownResolutions: assessment.unknownResolutions,
        inferences: assessment.inferredValues,
        evaluation: assessment.evaluation,
        recommendations: assessment.recommendations,
      }),
    }));

  const items = flows.map(({ assessment, flow }) => ({
    regulationId: assessment.regulationId,
    allowanceKind: assessment.allowanceKind,
    nextFieldLabel: fieldLabel(flow.decision.nextFieldId),
    decisionReason: flow.decision.reason,
    progress: flow.progress,
    answeredFieldLabels: labelsForQuestions(flow.summary.answeredQuestionIds, flow.questions),
    blockingFieldLabels: flow.summary.missingBlockingFieldIds
      .map(fieldLabel)
      .filter((label): label is string => Boolean(label)),
    inferredFieldLabels: labelsForQuestions(flow.summary.inferredQuestionIds, flow.questions),
    skippedFieldLabels: labelsForQuestions(flow.summary.skippedQuestionIds, flow.questions),
    notApplicableFieldLabels: labelsForQuestions(flow.summary.notApplicableQuestionIds, flow.questions),
    confidenceLabel: assessment.evaluation.confidence.label,
    officialVerificationRequired: assessment.officialVerification.required,
    recommendationIds: flow.summary.recommendationIds,
  })) satisfies AllowanceQuestionFlowItemView[];

  const totalRelevant = items.reduce((sum, item) => sum + item.progress.totalRelevant, 0);
  const completed = items.reduce((sum, item) => sum + item.progress.completed, 0);
  const answered = items.reduce((sum, item) => sum + item.progress.answered, 0);
  const inferred = items.reduce((sum, item) => sum + item.progress.inferred, 0);
  const skipped = items.reduce((sum, item) => sum + item.progress.skipped, 0);
  const reporting: AllowanceQuestionFlowView["reporting"] = {
    answeredFieldLabels: uniqueLabels(items.flatMap((item) => item.answeredFieldLabels)),
    inferredFieldLabels: uniqueLabels(items.flatMap((item) => item.inferredFieldLabels)),
    skippedFieldLabels: uniqueLabels(items.flatMap((item) => item.skippedFieldLabels)),
    notApplicableFieldLabels: uniqueLabels(items.flatMap((item) => item.notApplicableFieldLabels)),
    blockingFieldLabels: uniqueLabels(items.flatMap((item) => item.blockingFieldLabels)),
    confidenceLabels: uniqueLabels(items.map((item) => item.confidenceLabel)),
    officialVerificationRequired: items.some((item) => item.officialVerificationRequired),
    recommendationIds: uniqueLabels(items.flatMap((item) => item.recommendationIds)),
  };
  const questionStatuses: AllowanceQuestionFlowView["questionStatuses"] = {};
  for (const { flow } of flows) {
    for (const question of flow.questions) {
      const fieldId = question.fieldId as AllowanceMissingField;
      const existing = questionStatuses[fieldId];
      if (!existing || statusRank(question.status) > statusRank(existing)) {
        questionStatuses[fieldId] = question.status;
      }
    }
  }

  return {
    isValid: true,
    errors,
    totalRelevant,
    completed,
    answered,
    inferred,
    skipped,
    blocked: items.reduce((sum, item) => sum + item.progress.blocked, 0),
    remaining: items.reduce((sum, item) => sum + item.progress.remaining, 0),
    percentage: totalRelevant === 0 ? 100 : Math.round((completed / totalRelevant) * 100),
    nextFieldLabel: items.find((item) => item.decisionReason === "blocked")?.nextFieldLabel ??
      items.find((item) => item.decisionReason === "next-pending")?.nextFieldLabel,
    decisionReason: aggregateDecision(items),
    items,
    questionStatuses,
    reporting,
  };
}
