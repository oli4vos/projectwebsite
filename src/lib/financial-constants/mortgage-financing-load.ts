import { MORTGAGE_FINANCING_LOAD_DATA } from "@/lib/financial-constants/mortgage-financing-load-data";
import type {
  MortgageFinancingLoadAgeGroup,
  MortgageFinancingLoadLookupInput,
  MortgageFinancingLoadRow,
  MortgageFinancingLoadTable,
} from "@/lib/financial-constants/types";

function selectAgeGroup(ageYears?: number): MortgageFinancingLoadAgeGroup {
  if (!Number.isFinite(ageYears ?? Number.NaN)) {
    return "beforeAow";
  }

  return (ageYears as number) >= 67 ? "fromAow" : "beforeAow";
}

function selectRateBandIndex(mortgageRate: number) {
  const safeRate = Number.isFinite(mortgageRate) ? Math.max(mortgageRate, 0) : 0;

  for (let index = 0; index < MORTGAGE_FINANCING_LOAD_DATA.rateBands.length; index += 1) {
    const upperBound = MORTGAGE_FINANCING_LOAD_DATA.rateBands[index].maxRate;
    if (upperBound === null || safeRate <= upperBound) {
      return index;
    }
  }

  return MORTGAGE_FINANCING_LOAD_DATA.rateBands.length - 1;
}

function selectIncomeRow(ageYears: number | undefined, annualIncome: number) {
  const ageGroup = selectAgeGroup(ageYears);
  const rows: readonly MortgageFinancingLoadRow[] =
    MORTGAGE_FINANCING_LOAD_DATA[ageGroup];
  const safeIncome = Number.isFinite(annualIncome) ? Math.max(annualIncome, 0) : 0;

  let selected: MortgageFinancingLoadRow = rows[0];
  for (const row of rows) {
    if (safeIncome >= row.minIncome) {
      selected = row;
    } else {
      break;
    }
  }

  return selected;
}

export function getMortgageFinancingLoadTable(ageYears?: number): MortgageFinancingLoadTable {
  const ageGroup = selectAgeGroup(ageYears);

  return {
    normYear: MORTGAGE_FINANCING_LOAD_DATA.normYear,
    versionLabel: MORTGAGE_FINANCING_LOAD_DATA.versionLabel,
    sourceLabel: MORTGAGE_FINANCING_LOAD_DATA.sourceLabel,
    sourceUrl: MORTGAGE_FINANCING_LOAD_DATA.sourceUrl,
    lastChecked: MORTGAGE_FINANCING_LOAD_DATA.lastChecked,
    status: MORTGAGE_FINANCING_LOAD_DATA.status,
    ageGroup,
    rateBands: MORTGAGE_FINANCING_LOAD_DATA.rateBands,
    rows: MORTGAGE_FINANCING_LOAD_DATA[ageGroup],
  };
}

export function getMortgageFinancingLoadPercentage(input: MortgageFinancingLoadLookupInput) {
  if (input.year !== undefined && input.year !== MORTGAGE_FINANCING_LOAD_DATA.normYear) {
    return null;
  }

  const row = selectIncomeRow(input.ageYears, input.annualIncome);
  const rateBandIndex = selectRateBandIndex(input.mortgageRate);
  return row.percentages[rateBandIndex] ?? null;
}
