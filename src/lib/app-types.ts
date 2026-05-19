export type AppType = "frontend" | "api";
export type AppStatus = "active" | "beta" | "draft";
export type AppVisibility = "public" | "hidden";
export type AppAssumptionDomain =
  | "duo"
  | "tax"
  | "box1"
  | "box3"
  | "mortgage"
  | "investment"
  | "inflation"
  | "charts";
export type AppCalculationDomain =
  | "studentDebt"
  | "mortgage"
  | "housing"
  | "tax"
  | "investing"
  | "saving"
  | "cashflow"
  | "employment"
  | "pension";
export type AppRiskLevel = "low" | "medium" | "high";
export type AppDisclaimerType =
  | "indicative"
  | "financialEducation"
  | "taxIndicative"
  | "mortgageIndicative"
  | "duoIndicative";
export type AppOutputType =
  | "singleResult"
  | "scenarioComparison"
  | "timeline"
  | "checklist"
  | "mixed";

export type AppManifest = {
  slug: string;
  title: string;
  description: string;
  type: AppType;
  category: string;
  tags: string[];
  status: AppStatus;
  visibility?: AppVisibility;
  requiredProfileFields?: string[];
  assumptionsUsed?: AppAssumptionDomain[];
  calculationDomains?: AppCalculationDomain[];
  riskLevel?: AppRiskLevel;
  disclaimerType?: AppDisclaimerType;
  outputType?: AppOutputType;
  version?: string;
  entry: string;
};
