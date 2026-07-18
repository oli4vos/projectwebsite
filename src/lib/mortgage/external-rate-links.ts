export type MortgageExternalRateLink = {
  id: string;
  label: string;
  url: string;
  sourceName: string;
  explanation: string;
  purpose: "inspiration";
  lastVerifiedAt: string;
  nextReviewAt: string;
  fallbackUrl?: string;
  fallbackSourceName?: string;
};

export const MORTGAGE_RATE_EXTERNAL_REFERENCE_LINK: MortgageExternalRateLink = {
  id: "geldnl-current-mortgage-rates-inspiration",
  label: "Bekijk actuele hypotheekrentes ter inspiratie",
  url: "https://www.geld.nl/hypotheek/hypotheekrente",
  sourceName: "Geld.nl hypotheekrente vergelijken",
  explanation:
    "Controleer altijd of de rente past bij jouw rentevaste periode, hypotheekvorm, NHG-situatie en verhouding tussen lening en woningwaarde. Vul het percentage daarna zelf in.",
  purpose: "inspiration",
  lastVerifiedAt: "2026-07-19",
  nextReviewAt: "2026-10-19",
  fallbackUrl: "https://www.consumentenbond.nl/hypotheek/hypotheekadvies-rentevergelijker",
  fallbackSourceName: "Consumentenbond rentevergelijker",
};
