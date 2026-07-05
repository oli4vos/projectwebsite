import type { AppManifest } from "@/lib/app-types";

// AUTO-GENERATED FILE. DO NOT EDIT MANUALLY.
// Run: npm run generate:apps

export const appRegistry = [
  {
    "slug": "artifact-hypotheek-wonen-maximale-hypotheek",
    "title": "Maximale hypotheek",
    "description": "Indicatieve tool voor starters zonder bestaande hypotheek: schat je maximale hypotheek op basis van inkomen, woningwaarde, studieschuld en NHG.",
    "type": "frontend",
    "category": "Hypotheek",
    "tags": [
      "hypotheek",
      "woningwaarde",
      "inkomen",
      "NHG",
      "studieschuld"
    ],
    "status": "active",
    "visibility": "public",
    "reasonHint": "Indicatieve tool voor starters zonder bestaande hypotheek die hun maximale hypotheek willen inschatten.",
    "assumptionsUsed": [
      "mortgage"
    ],
    "calculationDomains": [
      "mortgage",
      "housing",
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "mortgageIndicative",
    "outputType": "mixed",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-doorlenen-of-stoppen",
    "title": "DUO doorlenen of stoppen",
    "description": "Projecteer wat doorlenen in de leenfase doet met je studieschuld, toekomstige maandtermijn en optionele hypotheekruimte.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "studieschuld",
      "leenfase",
      "hypotheek",
      "starter"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "studentDebt.remainingDebt"
    ],
    "reasonHint": "Handig als je wilt zien wat langer of meer lenen doet met je eindschuld en toekomstige DUO-maandtermijn.",
    "assumptionsUsed": [
      "duo",
      "mortgage"
    ],
    "calculationDomains": [
      "studentDebt",
      "mortgage",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "scenarioComparison",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "familiehulp-eerste-woning",
    "title": "Lenen of schenken voor eerste woning",
    "description": "Vergelijk studieschuld, bankhypotheek, eigen geld, familielening en schenkingen voor een eerste woning.",
    "type": "frontend",
    "category": "Studieschuld & wonen",
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
    "reasonHint": "Handig als je door studieschuld wilt zien hoe bankhypotheek, eigen geld, familielening en schenking samen uitpakken.",
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
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
