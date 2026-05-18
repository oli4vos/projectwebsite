export const TAX_FACTOR_DEFAULT = 0.6303;

function calcDiscountRatePerMonth(discountFactorPercent) {
  const df = Number(discountFactorPercent);
  if (!Number.isFinite(df) || df <= 0) return 1;
  return Math.pow(1 + df / 100, 1 / 12);
}

export function calculateAnnuitySchedule(loanAmount, interestRatePercent, loanTermYears, taxFactor = TAX_FACTOR_DEFAULT) {
  const r = (interestRatePercent / 100) / 12;
  const n = loanTermYears * 12;

  const monthlyPayment =
    r === 0 ? loanAmount / n : loanAmount * (r / (1 - Math.pow(1 + r, -n)));

  let remaining = loanAmount;
  const rows = [];

  for (let month = 1; month <= n; month++) {
    const interestPayment = remaining * r;
    const principalPayment = monthlyPayment - interestPayment;

    remaining = Math.max(0, remaining - principalPayment);

    rows.push({
      month,
      principalPayment,
      interestPayment,
      totalPayment: monthlyPayment,
      nettoMonthly: principalPayment + taxFactor * interestPayment,
      remaining,
    });
  }

  return rows;
}

export function calculateLinearSchedule(loanAmount, interestRatePercent, loanTermYears, taxFactor = TAX_FACTOR_DEFAULT) {
  const r = (interestRatePercent / 100) / 12;
  const n = loanTermYears * 12;

  const principalFixed = loanAmount / n;

  let remaining = loanAmount;
  const rows = [];

  for (let month = 1; month <= n; month++) {
    const interestPayment = remaining * r;
    const totalPayment = principalFixed + interestPayment;

    remaining = Math.max(0, remaining - principalFixed);

    rows.push({
      month,
      principalPayment: principalFixed,
      interestPayment,
      totalPayment,
      nettoMonthly: principalFixed + taxFactor * interestPayment,
      remaining,
    });
  }

  return rows;
}

// Tijdswaarde van het verschil. Positieve waarde = annuïtair duurder in de toekomst.
export function calculateTimeValueDifference(difference, loanTermYears, month, discountFactorPercent) {
  const ratePerMonth = calcDiscountRatePerMonth(discountFactorPercent);
  const remainingMonths = loanTermYears * 12 - month + 1;
  return (difference * Math.pow(ratePerMonth, remainingMonths)) * -1;
}
