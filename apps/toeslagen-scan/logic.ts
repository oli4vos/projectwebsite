import {
  ALLOWANCE_SIGNAL_ORDER,
  evaluateAllowanceSignals,
  type AllowanceScanInput,
  type UnknownableBoolean,
} from "@/lib/allowances/signaling";
import type { SourceReference } from "@/lib/financial-constants";
import { parseOptionalDecimalInput } from "@/lib/number-input";
import {
  allowanceTitles,
  getMissingFieldCopy,
  getReasonCodeCopy,
  getUncertaintyCopy,
  statusLabels,
  statusSummaries,
} from "./copy";
import type {
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
  const usesChildcare = hasChildren && values.usesChildcare === "yes";
  const renting = values.tenure === "rent";
  const coResidents = values.hasCoResidents === "yes";
  const childResidence = childLivesChoice(values.childLivesWithApplicant);
  const childAges = hasChildren ? parseChildAges(values.childAges) : noChildren ? [] : undefined;
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
      hasChildren: yesNoUnknown(values.hasChildren),
      childAges,
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
      hasChildren: yesNoUnknown(values.hasChildren),
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

function createSummary(statuses: string[]) {
  if (statuses.includes("insufficient-information")) {
    return "Voor één of meer toeslagen ontbreken nog gegevens.";
  }
  if (statuses.includes("possible")) {
    return "Op basis van je antwoorden kan één of meer toeslagen relevant zijn. Controleer dit met de officiële proefberekening.";
  }
  if (statuses.every((status) => status === "official-calculation-recommended")) {
    return "Voor één of meer toeslagen is een officiële proefberekening nodig om een bruikbaar antwoord te krijgen.";
  }
  if (statuses.every((status) => status === "probably-not")) {
    return "Op basis van de ingevulde harde voorwaarden lijken de onderzochte toeslagen waarschijnlijk niet van toepassing.";
  }
  return "Bekijk per toeslag het signaal en controleer complexe situaties met de officiële proefberekening.";
}

export function createAllowanceScanView(values: AllowanceScanFormState): AllowanceScanView {
  const errors = validateAllowanceScanForm(values);
  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, result: null };
  }

  const input = mapFormToAllowanceScanInput(values);
  const scan = evaluateAllowanceSignals(input);
  const ordered = [...scan.results].sort(
    (a, b) =>
      ALLOWANCE_SIGNAL_ORDER.indexOf(a.allowanceKind) -
      ALLOWANCE_SIGNAL_ORDER.indexOf(b.allowanceKind),
  );

  return {
    isValid: true,
    errors,
    result: {
      summary: createSummary(ordered.map((item) => item.status)),
      ruleYear: scan.ruleYear,
      datasetId: scan.datasetId,
      datasetVersion: scan.datasetVersion,
      cards: ordered.map((item) => ({
        kind: item.allowanceKind,
        title: allowanceTitles[item.allowanceKind],
        status: item.status,
        statusLabel: statusLabels[item.status],
        summary: statusSummaries[item.status],
        hardExclusion: item.hardExclusion,
        reasonMessages: item.reasonCodes.map(getReasonCodeCopy),
        missingFieldMessages: item.missingFields.map(getMissingFieldCopy),
        uncertaintyMessages: item.uncertaintyCodes.map(getUncertaintyCopy),
        officialCalculationUrl: item.officialCalculationUrl,
        sourceLinks: dedupeOfficialLinks(item.sourceReferences, item.officialCalculationUrl),
        ruleYear: item.ruleYear,
        datasetId: item.datasetId,
        datasetVersion: item.datasetVersion,
      })),
    },
  };
}
