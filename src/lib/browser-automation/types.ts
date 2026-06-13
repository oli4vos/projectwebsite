export type MortgageAutomationProviderId = "independer" | "abnamro" | "rabobank" | "ing";

export type MortgageAutomationScenarioInput = {
  grossAnnualHouseholdIncome: number;
  grossAnnualPartnerIncome?: number;
  annualMortgageRate: number;
  fixedRatePeriodMonths?: number;
  mortgageTermYears: number;
  monthlyDebtPayments?: number;
  ownFunds?: number;
  purchasePrice?: number;
  marketValue?: number;
  nhgRequested?: boolean;
  energyLabel?: "unknown" | "A" | "B" | "C" | "D" | "E";
  energySavingMeasuresAmount?: number;
  hasStudentLoan?: boolean;
  studentLoanMonthlyPayment?: number;
};

export type MortgageAutomationScenario = {
  id: number;
  label: string;
  input: MortgageAutomationScenarioInput;
};

export type MortgageAutomationProviderSpec = {
  id: MortgageAutomationProviderId;
  name: string;
  url: string;
  notes: string;
  fieldHints: Array<{
    key: keyof MortgageAutomationScenarioInput;
    keywords: string[];
    kind?: "text" | "checkbox" | "select";
  }>;
  submitButtonLabels: string[];
  resultSelectors: string[];
};

export type MortgageAutomationProviderRunStatus =
  | "success"
  | "partial"
  | "failed"
  | "manual-check";

export type MortgageAutomationProviderRun = {
  providerId: MortgageAutomationProviderId;
  providerName: string;
  scenarioId: number;
  scenarioLabel: string;
  status: MortgageAutomationProviderRunStatus;
  url: string;
  capturedText: string;
  extractedAmounts: number[];
  notes: string[];
};
