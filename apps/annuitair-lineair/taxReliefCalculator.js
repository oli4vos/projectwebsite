// Belastingteruggaaf (renteaftrek) op basis van rente en tarief (%).
export const calculateTaxRelief = (interestPayment, taxRatePercent) => {
  const rate = Number(taxRatePercent) / 100;
  if (!Number.isFinite(rate)) return 0;
  return interestPayment * rate;
};
