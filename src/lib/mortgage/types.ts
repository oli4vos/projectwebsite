export type MortgageAnnuityInput = {
  principal: number;
  annualRate: number;
  years: number;
};

export type MortgagePresentValueInput = {
  monthlyPayment: number;
  annualRate: number;
  years: number;
};
