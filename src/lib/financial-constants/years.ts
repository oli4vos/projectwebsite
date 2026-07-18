import type { AnnualFinancialConstants } from "@/lib/financial-constants/types";

export const DEFAULT_FINANCIAL_YEAR = 2026;

export const FINANCIAL_CONSTANTS_BY_YEAR: Record<number, AnnualFinancialConstants> =
  {
    2026: {
      year: 2026,
      duo: {
        meta: {
          sourceLabel: "DUO rente bij DUO",
          lastChecked: "2026-07-18",
          status: "definitief",
          sourceUrl: "https://duo.nl/particulier/studieschuld-terugbetalen/terugbetalingsregels.jsp",
          sourceTier: "overheidsuitleg",
          notes: "DUO-rente volgt de officiële vaststelling via https://www.duo.nl/particulier/rente/rente-voor-terugbetalers.jsp. Voor terugbetalers hangt toepassing af van de persoonlijke rentevaste periode in Mijn DUO. Draagkrachtvrijstellingen en -percentages berusten op de studiefinanciering-regelgeving en hebben nog exactere bronmetadata per bedrag nodig.",
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
        borrowingLimits: {
          monthlyLoanAmountMax: 1213.95,
          monthlyLoanAmountStep: 25,
          sourceUrl: "https://duo.nl/particulier/studiefinanciering/bedragen.jsp",
          notes:
            "DUO vermeldt op de bedragenpagina voor 2026 dat de gewone rentedragende lening in de leenfase maximaal € 1.213,95 per maand is. Collegegeldkrediet staat daar apart van en is niet opgenomen in deze standaard sliderlimiet.",
        },
      },
      mortgage: {
        meta: {
          sourceLabel: "Indicatieve bruteringsstaffel studieschuld",
          lastChecked: "2026-07-18",
          status: "indicatief",
          sourceUrl: "https://www.rijksoverheid.nl/onderwerpen/huis-kopen/vraag-en-antwoord/hoe-zwaar-telt-mijn-studieschuld-mee-voor-mijn-hypotheek",
          sourceTier: "indicatieve-benadering",
          validFrom: "2026-01-01",
          validUntil: "2026-12-31",
          appliesTo:
            "Indicatieve omzetting van DUO-maandlast naar hypotheektoetslast; geldverstrekkers kunnen acceptatiebeleid anders invullen.",
          ruleType: "projectaanname",
          uncertainties:
            "De bruteringsstaffel is geen wettelijke tabel. Gebruik als projectmatige benadering totdat exact acceptatiebeleid of wettelijke norm is gecentraliseerd.",
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
        nhg: {
          meta: {
            sourceLabel: "NHG grens 2026",
            lastChecked: "2026-07-18",
            status: "definitief",
            sourceUrl: "https://www.nhg.nl/het-product-nhg/een-hypotheek-met-nhg/",
            sourceTier: "overheidsuitleg",
            publishedAt: "2025-10-31",
            validFrom: "2026-01-01",
            validUntil: "2026-12-31",
            appliesTo:
              "Indicatieve NHG-grens voor koopwoningen; volledige acceptatie volgt uit NHG Voorwaarden en normen.",
            unit: "EUR",
            ruleType: "uitvoeringsbeleid",
            uncertainties:
              "De publieke grens is gecentraliseerd; volledige NHG-voorwaarden moeten bij activatie van gedetailleerde NHG-tools apart worden gecontroleerd.",
          },
          standardLimit: 470_000,
          withEnergyMeasuresLimit: 498_200,
          guaranteeFeePercent: 0.4,
        },
        ltv: {
          meta: {
            sourceLabel: "LTV en energiebesparende voorzieningen 2026",
            lastChecked: "2026-07-18",
            status: "definitief",
            sourceUrl:
              "https://www.volkshuisvestingnederland.nl/onderwerpen/huren-en-wonen/tijdelijke-regeling-hypothecair-krediet/maximale-hypotheek-op-basis-van-woningwaarde-ltv",
            sourceTier: "overheidsuitleg",
            validFrom: "2026-01-01",
            validUntil: "2026-12-31",
            appliesTo:
              "Maximale hypotheek op basis van woningwaarde en extra ruimte voor energiebesparende voorzieningen.",
            unit: "percent",
            ruleType: "wet",
          },
          baseMaxLtvPercent: 100,
          energySavingMeasuresMaxLtvPercent: 106,
          energySavingMeasuresAllowanceCapRatio: 0.06,
        },
        energy: {
          meta: {
            sourceLabel: "Energielabelbedragen hypotheeknormen 2026",
            lastChecked: "2026-07-18",
            status: "definitief",
            sourceUrl: "https://zoek.officielebekendmakingen.nl/stcrt-2025-36471.html",
            sourceTier: "wet",
            publishedAt: "2025-10-31",
            validFrom: "2026-01-01",
            validUntil: "2026-12-31",
            appliesTo:
              "Extra leenruimte op inkomen per energielabel en maximaal mee te financieren energiebesparende voorzieningen.",
            unit: "EUR",
            ruleType: "wet",
          },
          purchaseAllowances: {
            G: 0,
            F: 0,
            E: 0,
            D: 5_000,
            C: 5_000,
            B: 10_000,
            A: 10_000,
            "A+": 20_000,
            "A++": 20_000,
            "A+++": 25_000,
            "A++++": 30_000,
            APLUSGUARANTEE: 40_000,
            unknown: 0,
          },
          energySavingMeasureAllowances: {
            G: 20_000,
            F: 20_000,
            E: 20_000,
            D: 15_000,
            C: 15_000,
            B: 10_000,
            A: 10_000,
            "A+": 10_000,
            "A++": 10_000,
            "A+++": 0,
            "A++++": 0,
            APLUSGUARANTEE: 0,
            unknown: 0,
          },
        },
        afmTestRates: [
          {
            quarter: "2026-Q3",
            rate: 5,
            meta: {
              sourceLabel: "AFM toetsrente Q3 2026",
              lastChecked: "2026-07-18",
              status: "definitief",
              sourceUrl: "https://www.afm.nl/nl-nl/sector/actueel/2026/jun/sb-toetstrente-q3-2026",
              sourceTier: "toezicht",
              publishedAt: "2026-06-16",
              validFrom: "2026-07-01",
              validUntil: "2026-09-30",
              appliesTo:
                "Hypotheken met een rentevaste periode korter dan tien jaar.",
              unit: "percent",
              ruleType: "uitvoeringsbeleid",
              uncertainties:
                "Q4 2026 was op 2026-07-18 nog niet de actuele kwartaalwaarde.",
            },
          },
        ],
        defaultAfmTestRateQuarter: "2026-Q3",
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
          sourceUrl: "https://www.belastingdienst.nl/box3",
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
