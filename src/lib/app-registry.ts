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
    "reasonHint": "Handig als je annuïtaire en lineaire hypotheeklasten naast elkaar wilt zetten.",
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
    "reasonHint": "Handig als je wilt zien wat spaargeld, beleggingen en schulden indicatief doen in box 3.",
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
    "slug": "fire-na-belasting",
    "title": "FIRE na belasting",
    "description": "Bereken wanneer je indicatief financieel onafhankelijk bent, inclusief box 3-effect en aannames.",
    "type": "frontend",
    "category": "Beleggen",
    "tags": [
      "FIRE",
      "beleggen",
      "box 3",
      "financiële vrijheid",
      "vermogen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "savingInvesting.currentSavings",
      "savingInvesting.monthlyFreeCashflow",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "savingInvesting.riskProfile",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner"
    ],
    "reasonHint": "Handig als je wilt zien hoe rendement, inleg, uitgaven en box 3 je financiële vrijheid beïnvloeden.",
    "assumptionsUsed": [
      "box3",
      "tax",
      "investment",
      "inflation"
    ],
    "calculationDomains": [
      "investing",
      "saving",
      "tax",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "financialEducation",
    "outputType": "timeline",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "hypotheek-aflossen-vs-beleggen",
    "title": "Hypotheek aflossen of beleggen?",
    "description": "Vergelijk extra aflossen op je hypotheek met vrij beleggen, inclusief renteaftrek en box 3-effect.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "aflossen",
      "beleggen",
      "box 3",
      "renteaftrek"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "housing.mortgageRate",
      "housing.mortgageTermYears",
      "savingInvesting.currentSavings",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "tax.hasFiscalPartner",
      "tax.preferredTaxYear",
      "savingInvesting.targetEmergencyFund",
      "savingInvesting.monthlyFreeCashflow"
    ],
    "reasonHint": "Handig als je extra geld wilt vergelijken tussen hypotheek aflossen en vrij beleggen.",
    "assumptionsUsed": [
      "tax",
      "box3",
      "mortgage",
      "investment"
    ],
    "calculationDomains": [
      "mortgage",
      "investing",
      "tax",
      "saving"
    ],
    "riskLevel": "high",
    "disclaimerType": "mortgageIndicative",
    "outputType": "scenarioComparison",
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
    "slug": "jaarruimte-vs-vrij-beleggen",
    "title": "Jaarruimte of vrij beleggen?",
    "description": "Vergelijk pensioeninleg met vrij beleggen, inclusief indicatief belastingvoordeel en box 3-effect.",
    "type": "frontend",
    "category": "Belasting",
    "tags": [
      "jaarruimte",
      "pensioen",
      "box 3",
      "beleggen",
      "FIRE"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.grossAnnualIncome",
      "savingInvesting.currentSavings",
      "savingInvesting.expectedAnnualReturn",
      "savingInvesting.investmentHorizonYears",
      "tax.preferredTaxYear",
      "tax.hasFiscalPartner",
      "savingInvesting.pensionBuildUp"
    ],
    "reasonHint": "Handig als je twijfelt tussen pensioeninleg met belastingvoordeel en flexibel vrij beleggen.",
    "assumptionsUsed": [
      "tax",
      "box1",
      "box3",
      "investment"
    ],
    "calculationDomains": [
      "tax",
      "investing",
      "pension"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
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
    "description": "Bepaal of extra geld logischer naar buffer, aflossen, pensioen, woning of beleggen kan.",
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
  },
  {
    "slug": "zzp-uurtarief",
    "title": "ZZP-uurtarief calculator",
    "description": "Bereken welk uurtarief je ongeveer nodig hebt inclusief belasting, buffer, pensioen en AOV.",
    "type": "frontend",
    "category": "Werk",
    "tags": [
      "ZZP",
      "uurtarief",
      "AOV",
      "pensioen",
      "inkomen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "income.employmentType",
      "income.grossAnnualIncome",
      "savingInvesting.targetEmergencyFund",
      "tax.preferredTaxYear",
      "employment.grossAnnualSalary",
      "employment.businessProfitBeforeTax",
      "employment.aovPremiumAnnual",
      "employment.pensionContributionAnnual"
    ],
    "reasonHint": "Handig als je wilt weten welk uurtarief past bij inkomen, belasting, pensioen, AOV en buffer.",
    "assumptionsUsed": [
      "tax",
      "box1"
    ],
    "calculationDomains": [
      "employment",
      "cashflow",
      "pension",
      "tax"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
