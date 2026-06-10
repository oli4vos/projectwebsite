import type { AppManifest } from "@/lib/app-types";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export const appRegistry = [
  {
    "slug": "familiehulp-eerste-woning",
    "title": "Familiehulp eerste woning",
    "description": "Combineer bancaire hypotheek, DUO, schenking, eigen geld en familielening voor een eerste woning.",
    "type": "frontend",
    "category": "Familiefinanciering",
    "tags": [
      "familielening",
      "schenking",
      "studieschuld",
      "hypotheek",
      "starter"
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
      "savingInvesting.targetEmergencyFund"
    ],
    "reasonHint": "Handig als je een eerste woning wilt financieren met hypotheek, DUO, familiehulp en eigen geld.",
    "assumptionsUsed": [
      "duo",
      "mortgage"
    ],
    "calculationDomains": [
      "studentDebt",
      "mortgage",
      "housing",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "hypotheek-impact-studieschuld",
    "title": "Hypotheek-impact studieschuld",
    "description": "Zie welk DUO-bedrag kan meetellen en wat dat indicatief doet met je hypotheekruimte.",
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
    "reasonHint": "Handig als je wilt weten welk DUO-bedrag kan meetellen bij je hypotheekruimte.",
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
    "slug": "schulden-volgorde",
    "title": "Welke schuld eerst?",
    "description": "Zet dure schulden, DUO, hypotheek en achteraf betalen in een extra-aflosvolgorde.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "schulden",
      "BNPL",
      "DUO",
      "hypotheek",
      "aflossen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt zien welke schuld bij extra geld waarschijnlijk eerst aandacht vraagt.",
    "assumptionsUsed": [
      "duo",
      "mortgage"
    ],
    "calculationDomains": [
      "cashflow",
      "studentDebt",
      "mortgage"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "checklist",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "studieschuld-vs-beleggen",
    "title": "Studieschuld extra aflossen of beleggen?",
    "description": "Vergelijk wat extra aflossen op je studieschuld doet ten opzichte van sparen of beleggen.",
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
    "reasonHint": "Handig als je wilt vergelijken wat extra aflossen op je studieschuld doet ten opzichte van beleggen.",
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
  },
  {
    "slug": "volgende-euro",
    "title": "Wat doe ik met mijn volgende euro?",
    "description": "Ontdek of extra geld logischer naar buffer, aflossen, pensioen, woning of beleggen kan.",
    "type": "frontend",
    "category": "Persoonlijke financiën",
    "tags": [
      "buffer",
      "beleggen",
      "aflossen",
      "pensioen",
      "FIRE"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "savingInvesting.targetEmergencyFund",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "savingInvesting.riskProfile",
      "studentDebt.remainingDebt",
      "studentDebt.duoInterestRate",
      "housing.mortgageRate",
      "housing.targetHomePrice",
      "housing.ownFunds"
    ],
    "reasonHint": "Handig als je niet zeker weet of extra geld beter naar buffer, aflossen, pensioen of beleggen kan.",
    "assumptionsUsed": [
      "duo",
      "tax",
      "box3",
      "mortgage",
      "investment"
    ],
    "calculationDomains": [
      "saving",
      "investing",
      "studentDebt",
      "mortgage",
      "tax",
      "cashflow",
      "pension"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
