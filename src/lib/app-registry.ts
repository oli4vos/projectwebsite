import type { AppManifest } from "@/lib/app-types";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export const appRegistry = [
  {
    "slug": "annuitair-lineair",
    "title": "Annuïtair of lineair",
    "description": "Vergelijk bruto en netto maandlasten van een annuïtaire en lineaire hypotheek, inclusief het effect van een beleggingspot.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "annuiteit",
      "lineair",
      "maandlasten"
    ],
    "status": "active",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "income.partnerGrossAnnualIncome",
      "housing.mortgageRate",
      "housing.mortgageTermYears"
    ],
    "assumptionsUsed": [
      "mortgage",
      "tax",
      "investment"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "investing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "box-3-impact",
    "title": "Box 3-impact calculator",
    "description": "Bereken indicatief wat spaargeld, beleggingen en schulden doen in box 3.",
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "box 3",
      "belasting",
      "sparen",
      "beleggen",
      "vermogen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "tax.hasFiscalPartner",
      "tax.preferredTaxYear"
    ],
    "assumptionsUsed": [
      "tax",
      "box3"
    ],
    "calculationDomains": [
      "tax",
      "saving",
      "investing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "box3-indicatie",
    "title": "Box 3 indicatie",
    "description": "Bereken indicatief je box 3-heffing op spaargeld, beleggingen en schulden met werkelijk of forfaitair rendement.",
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "box 3",
      "belasting",
      "vermogen",
      "beleggen",
      "spaargeld"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "tax.hasFiscalPartner",
      "tax.preferredTaxYear",
      "tax.preferredBox3Method"
    ],
    "assumptionsUsed": [
      "tax",
      "box3"
    ],
    "calculationDomains": [
      "tax",
      "saving",
      "investing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "hypotheek-impact-studieschuld",
    "title": "Hypotheek-impact studieschuld",
    "description": "Zie welk DUO-bedrag waarschijnlijk meetelt, hoe brutering werkt en wat je studieschuld indicatief doet met je hypotheekruimte.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "studieschuld",
      "hypotheek",
      "DUO",
      "brutering",
      "starter",
      "pechgeneratie"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "income.partnerGrossAnnualIncome",
      "studentDebt.remainingDebt",
      "studentDebt.currentMonthlyPayment",
      "studentDebt.statutoryMonthlyPayment",
      "studentDebt.repaymentRule",
      "studentDebt.duoSituation",
      "studentDebt.duoInterestRate",
      "studentDebt.remainingTermYears",
      "housing.targetHomePrice",
      "housing.ownFunds",
      "housing.mortgageRate",
      "housing.mortgageTermYears",
      "housing.maxMortgageWithoutStudentDebt"
    ],
    "assumptionsUsed": [
      "duo",
      "mortgage"
    ],
    "calculationDomains": [
      "studentDebt",
      "mortgage",
      "housing"
    ],
    "riskLevel": "medium",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "studieschuld-vs-beleggen",
    "title": "Studieschuld aflossen of beleggen",
    "description": "Vergelijk vrijwillig extra aflossen versus beleggen, met wettelijk DUO-bedrag, draagkrachtminimum en optioneel box 3-effect.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "studieschuld",
      "beleggen",
      "rente"
    ],
    "status": "active",
    "visibility": "public",
    "requiredProfileFields": [
      "studentDebt.remainingDebt",
      "studentDebt.duoInterestRate",
      "studentDebt.remainingTermYears",
      "income.grossAnnualIncome",
      "income.partnerGrossAnnualIncome",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "savingInvesting.currentSavings",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner",
      "tax.preferredBox3Method"
    ],
    "assumptionsUsed": [
      "duo",
      "box3",
      "investment"
    ],
    "calculationDomains": [
      "studentDebt",
      "investing",
      "saving",
      "tax"
    ],
    "riskLevel": "medium",
    "disclaimerType": "financialEducation",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
