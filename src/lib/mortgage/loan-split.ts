import { calculateAnnuityPayment } from "@/lib/mortgage/annuity";
import type {
  MortgageLoanPart,
  MortgageLoanPartSplit,
  MortgageMaxMortgageResult,
} from "@/lib/mortgage/types";

function roundMoney(value: number) {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

function buildMortgageLoanPart(params: {
  id: MortgageLoanPart["id"];
  label: string;
  amount: number;
  interestRate: number;
  calculationRate: number;
  fixedRatePeriod: MortgageLoanPart["fixedRatePeriod"];
  years: number;
  explanation: string;
}): MortgageLoanPart {
  const amount = roundMoney(Math.max(params.amount, 0));
  const monthlyPayment = roundMoney(
    amount > 0 && params.years > 0
      ? calculateAnnuityPayment({
          principal: amount,
          annualRate: params.calculationRate,
          years: params.years,
        })
      : 0,
  );

  return {
    id: params.id,
    label: params.label,
    amount,
    interestRate: params.interestRate,
    calculationRate: params.calculationRate,
    fixedRatePeriod: params.fixedRatePeriod,
    monthlyPayment,
    explanation: params.explanation,
  };
}

export function calculateMortgageLoanPartSplit(
  result: MortgageMaxMortgageResult,
): MortgageLoanPartSplit {
  const years = Math.max(result.breakdown.mortgageTermMonths / 12, 0);
  const currentRate = result.breakdown.annualMortgageRateUsed;
  const shortFixedRate = 5;
  const baseMortgage = roundMoney(result.finalMaxMortgage);
  const alternativeMortgage = roundMoney(
    result.breakdown.higherMortgageOpportunity?.alternativeFinalMaxMortgage ?? baseMortgage,
  );
  const usefulExtraMortgage = roundMoney(Math.max(alternativeMortgage - baseMortgage, 0));
  const hasUsefulSplit = Boolean(
    result.breakdown.higherMortgageOpportunity?.higherMortgagePossible && usefulExtraMortgage > 0,
  );
  const totalMortgage = hasUsefulSplit ? alternativeMortgage : baseMortgage;

  const regularPart = buildMortgageLoanPart({
    id: "regular",
    label: "Leningdeel A",
    amount: baseMortgage,
    interestRate: currentRate,
    calculationRate: currentRate,
    fixedRatePeriod: "10y-or-longer",
    years,
    explanation:
      "Dit is het reguliere leningdeel dat rekent met de hypotheekrente die je zelf hebt ingevuld.",
  });

  const shortFixedPart = hasUsefulSplit
    ? buildMortgageLoanPart({
        id: "shortFixed",
        label: "Leningdeel B",
        amount: usefulExtraMortgage,
        interestRate: shortFixedRate,
        calculationRate: shortFixedRate,
        fixedRatePeriod: "shorter-than-10y",
        years,
        explanation:
          "Dit is het aanvullende leningdeel dat indicatief wordt doorgerekend met 5% rekenrente omdat de rentevaste periode korter dan 10 jaar is.",
      })
    : null;

  const totalMonthlyPayment = roundMoney(
    regularPart.monthlyPayment + (shortFixedPart?.monthlyPayment ?? 0),
  );

  return {
    totalMortgage,
    regularPart,
    shortFixedPart,
    totalMonthlyPayment,
    hasUsefulSplit,
    explanation: hasUsefulSplit
      ? "De hogere toetsrente levert indicatief extra ruimte op. De verdeling hieronder laat zien welk deel binnen de huidige rentestructuur valt en welk deel met 5% wordt getoetst."
      : "Er is op basis van deze invoer geen extra of zinvolle verdeling in twee leningdelen gevonden.",
  };
}
