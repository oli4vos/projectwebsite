import type { AnnualFinancialConstants } from "@/lib/financial-constants/types";

export const DEFAULT_FINANCIAL_YEAR = 2026;

export const FINANCIAL_CONSTANTS_BY_YEAR: Record<number, AnnualFinancialConstants> =
  {
    2026: {
      year: 2026,
      duo: {
        meta: {
          sourceLabel: "DUO rente bij DUO",
          lastChecked: "2026-05-18",
          status: "definitief",
          sourceUrl: "https://www.duo.nl/particulier/studieschuld-terugbetalen/rentemiddeling",
          sourceTier: "overheidsuitleg",
          notes: "DUO-rente volgt de officiële vaststelling; de draagkrachtvrijstellingen en -percentages berusten op de studiefinanciering-regelgeving (aparte bron volgt).",
        },
        rates: {
          SF35: 2.33,
          SF15: 2.29,
          SF15_OLD: 2.29,
          SF15_LLLK: 2.33,
          UNKNOWN: 2.33,
        },
        defaultTerms: {
          SF35: 35,
          SF15: 15,
          SF15_OLD: 15,
          SF15_LLLK: 15,
          UNKNOWN: 35,
        },
        incomeBasedRules: {
          SF35: {
            singleAllowance: 26819.42,
            partnerOrSingleParentAllowance: 38351.77,
            percentage: 4,
          },
          SF15: {
            singleAllowance: 22528.31,
            partnerOrSingleParentAllowance: 32183.3,
            percentage: 12,
          },
          SF15_OLD: {
            singleAllowance: 13409.71,
            partnerOrSingleParentAllowance: 26819.42,
            percentage: null,
            notes:
              "SF15-oud gebruikt schijven met oplopende percentages in plaats van één vast percentage.",
          },
          SF15_LLLK: {
            singleAllowance: 22528.31,
            partnerOrSingleParentAllowance: 32183.3,
            percentage: 12,
          },
          UNKNOWN: {
            singleAllowance: 26819.42,
            partnerOrSingleParentAllowance: 38351.77,
            percentage: 4,
            notes:
              "Onbekende regeling valt indicatief terug op SF35-draagkrachtregels.",
          },
        },
      },
      mortgage: {
        meta: {
          sourceLabel: "Indicatieve bruteringsstaffel studieschuld",
          lastChecked: "2026-05-18",
          status: "indicatief",
          sourceUrl: "https://www.rijksoverheid.nl/onderwerpen/huis-kopen/vraag-en-antwoord/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek",
          sourceTier: "indicatieve-benadering",
        },
        defaultMortgageRate: 4.0,
        defaultMortgageTermYears: 30,
        indicativeIncomeHousingCostRatio: 24,
        studentDebtGrossUpFactors: [
          { minRate: 0, maxRate: 2.0, factor: 1.05, label: "2,0% of lager" },
          {
            minRate: 2.0,
            maxRate: 2.5,
            factor: 1.1,
            label: "2,0% tot 2,5%",
          },
          {
            minRate: 2.5,
            maxRate: 3.0,
            factor: 1.15,
            label: "2,5% tot 3,0%",
          },
          {
            minRate: 3.0,
            maxRate: 3.5,
            factor: 1.2,
            label: "3,0% tot 3,5%",
          },
          {
            minRate: 3.5,
            maxRate: 4.0,
            factor: 1.2,
            label: "3,5% tot 4,0%",
          },
          {
            minRate: 4.0,
            maxRate: 4.5,
            factor: 1.25,
            label: "4,0% tot 4,5%",
          },
          {
            minRate: 4.5,
            maxRate: 5.0,
            factor: 1.3,
            label: "4,5% tot 5,0%",
          },
          {
            minRate: 5.0,
            maxRate: 5.5,
            factor: 1.3,
            label: "5,0% tot 5,5%",
          },
          {
            minRate: 5.5,
            maxRate: 6.0,
            factor: 1.35,
            label: "5,5% tot 6,0%",
          },
          {
            minRate: 6.0,
            maxRate: null,
            factor: 1.4,
            label: "6,0% of hoger",
          },
        ],
      },
      box1: {
        meta: {
          sourceLabel: "Rijksoverheid box 1 tarieven 2026",
          lastChecked: "2026-05-18",
          status: "definitief",
          sourceUrl: "https://www.belastingdienst.nl/inkomstenbelasting",
          sourceTier: "overheidsuitleg",
        },
        brackets: [
          { upTo: 38883, rate: 35.75, label: "Schijf 1 t/m 38.883" },
          { upTo: 78426, rate: 37.56, label: "Schijf 2 t/m 78.426" },
          { upTo: null, rate: 49.5, label: "Schijf 3 boven 78.426" },
        ],
      },
      box3: {
        meta: {
          sourceLabel: "Belastingdienst box 3 voorlopige aanslag 2026",
          lastChecked: "2026-05-18",
          status: "voorlopig",
          sourceUrl: "https://www.belastingdienst.nl/box-3-vermogensbelasting",
          sourceTier: "overheidsuitleg",
          notes:
            "Box 3-percentages voor banktegoeden en schulden kunnen voorlopig zijn en later definitief worden vastgesteld.",
        },
        taxRate: 36,
        taxFreeAllowanceSingle: 59357,
        taxFreeAllowancePartners: 118714,
        deemedReturns: {
          bankDeposits: 1.28,
          investmentsAndOtherAssets: 6.0,
          debts: 2.7,
        },
      },
      charts: {
        meta: {
          sourceLabel: "Projectpresentatie-afspraken",
          lastChecked: "2026-05-18",
          status: "indicatief",
          sourceUrl: null,
          sourceTier: "projectaanname",
        },
        defaultCurrency: "EUR",
        defaultTimeUnit: "years",
      },
    },
  };
