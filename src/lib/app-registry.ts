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
    "slug": "duo-aanvullende-beurs",
    "title": "Aanvullende beurs berekenen",
    "description": "Schat je aanvullende beurs voor 2026 met de centrale DUO-rekenlaag en ouderinkomen uit het peiljaar.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "aanvullende beurs",
      "studiefinanciering",
      "ouderinkomen"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt zien welk maandbedrag bij mbo, hbo of universiteit past.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-extra-aflossen",
    "title": "Wat doet extra aflossen?",
    "description": "Bekijk feitelijk wat een extra DUO-aflossing doet met maandtermijn, looptijd en rentelast.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "studieschuld",
      "extra aflossen",
      "looptijd"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "studentDebt.remainingDebt",
      "studentDebt.currentMonthlyPayment",
      "studentDebt.repaymentRule"
    ],
    "reasonHint": "Handig als je wilt zien wat extra aflossen bij DUO verandert in maandlast en looptijd.",
    "assumptionsUsed": [
      "duo",
      "charts"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "timeline",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-leenbedrag-impact",
    "title": "Impact van mijn leenbedrag",
    "description": "Bereken simpel wat een nieuw leenbedrag per maand doet met je eindschuld terwijl je al studeert.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "leenbedrag",
      "eindschuld",
      "studieschuld"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je al studeert en wilt zien wat meer of minder lenen per maand doet.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-maandbedrag",
    "title": "Wat wordt mijn DUO-maandbedrag?",
    "description": "Bereken je wettelijke DUO-maandtermijn en bekijk optioneel een draagkrachtindicatie.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "studieschuld",
      "maandbedrag",
      "draagkracht"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [
      "studentDebt.remainingDebt",
      "studentDebt.repaymentRule",
      "income.grossAnnualIncome",
      "income.householdType"
    ],
    "reasonHint": "Handig als je wilt begrijpen welk DUO-maandbedrag bij je schuld hoort.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-schuld-bij-starten-lenen",
    "title": "Wat wordt mijn studieschuld?",
    "description": "Bereken simpel wat je schuld wordt als je nu begint met studeren en per maand gaat lenen.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "studieschuld",
      "lenen",
      "student"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt weten wat je schuld wordt voordat je begint met lenen.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
    "version": "1.0.0",
    "entry": "Calculator.tsx"
  },
  {
    "slug": "duo-stoppen-kosten-prestatiebeurs",
    "title": "Wat kost stoppen met studeren?",
    "description": "Bereken wat stoppen kost door basisbeurs, aanvullende beurs en studentenreisproduct die geen gift worden.",
    "type": "frontend",
    "category": "Schulden",
    "tags": [
      "DUO",
      "stoppen",
      "prestatiebeurs",
      "studieschuld"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "Handig als je wilt weten welk prestatiebeursbedrag schuld blijft als je stopt zonder diploma.",
    "assumptionsUsed": [
      "duo"
    ],
    "calculationDomains": [
      "studentDebt",
      "cashflow"
    ],
    "riskLevel": "medium",
    "disclaimerType": "duoIndicative",
    "outputType": "singleResult",
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
  },
  {
    "slug": "toeslagen-scan",
    "title": "Welke toeslagen passen mogelijk bij mij?",
    "description": "Bekijk of zorgtoeslag, huurtoeslag, kindgebonden budget of kinderopvangtoeslag mogelijk relevant is. Voor ondersteunde 2026-standaardscenario's toont de scan een euro-indicatie per maand en jaar.",
    "type": "frontend",
    "category": "Regelingen en maandruimte",
    "tags": [
      "toeslagen",
      "zorgtoeslag",
      "huurtoeslag",
      "kindgebonden budget",
      "kinderopvangtoeslag",
      "inkomen",
      "huishouden"
    ],
    "status": "beta",
    "visibility": "public",
    "requiredProfileFields": [],
    "reasonHint": "2026-scan: zorgtoeslag, huurtoeslag, kindgebonden budget en kinderopvangtoeslag kunnen voor ondersteunde standaardscenario's een bedragindicatie tonen.",
    "assumptionsUsed": [
      "tax"
    ],
    "calculationDomains": [
      "tax",
      "cashflow"
    ],
    "riskLevel": "high",
    "disclaimerType": "taxIndicative",
    "outputType": "checklist",
    "version": "1.0.0-beta.1",
    "entry": "Calculator.tsx"
  }
] satisfies AppManifest[];

export const appRegistryBySlug = Object.fromEntries(
  appRegistry.map((app) => [app.slug, app]),
) as Record<string, AppManifest>;
