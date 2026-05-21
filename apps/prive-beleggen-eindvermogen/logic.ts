import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { calculateBox3Tax, type Box3Method } from "@/lib/tax";

export type PriveBeleggenInput = {
  taxYear?: number;
  hasFiscalPartner?: boolean;
  box3Method?: Box3Method;
  startVermogen?: number;
  maandelijkseInleg?: number;
  verwachtRendementPct?: number;
  horizonJaren?: number;
};

export type PriveBeleggenPoint = {
  jaar: number;
  kalenderJaar: number;
  startVermogen: number;
  jaarlijkseInleg: number;
  brutoGroei: number;
  eindVermogenVoorBox3: number;
  box3Belasting: number;
  eindVermogenNaBox3: number;
  cumulatieveBox3Belasting: number;
  eindVermogenZonderBox3: number;
};

export type PriveBeleggenResult = {
  taxYear: number;
  horizonJaren: number;
  startVermogen: number;
  maandelijkseInleg: number;
  jaarlijkseInleg: number;
  verwachtRendementPct: number;
  hasFiscalPartner: boolean;
  box3Method: Box3Method;
  eindVermogenMetBox3: number;
  eindVermogenZonderBox3: number;
  verschilDoorBox3: number;
  totaleBox3Belasting: number;
  timeline: PriveBeleggenPoint[];
  warnings: string[];
};

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeYear(value: number | undefined) {
  if (!Number.isFinite(value)) return getDefaultFinancialYear();
  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) return getDefaultFinancialYear();
  return rounded;
}

function sanitizeHorizon(value: number | undefined) {
  if (!Number.isFinite(value)) return 10;
  return Math.min(Math.max(Math.round(value as number), 1), 60);
}

export function calculatePriveBeleggenEindvermogen(
  input: PriveBeleggenInput,
): PriveBeleggenResult {
  const taxYear = sanitizeYear(input.taxYear);
  const hasFiscalPartner = Boolean(input.hasFiscalPartner);
  const box3Method = input.box3Method ?? "forfaitary";
  const startVermogen = roundMoney(sanitizeMoney(input.startVermogen));
  const maandelijkseInleg = roundMoney(sanitizeMoney(input.maandelijkseInleg));
  const jaarlijkseInleg = roundMoney(maandelijkseInleg * 12);
  const verwachtRendementPct = sanitizePercent(input.verwachtRendementPct);
  const horizonJaren = sanitizeHorizon(input.horizonJaren);

  const monthlyRate = verwachtRendementPct / 100 / 12;
  const timeline: PriveBeleggenPoint[] = [];

  let vermogenMetBox3 = startVermogen;
  let vermogenZonderBox3 = startVermogen;
  let cumulatieveBox3Belasting = 0;

  for (let jaar = 1; jaar <= horizonJaren; jaar += 1) {
    const startMetBox3 = roundMoney(vermogenMetBox3);
    for (let maand = 0; maand < 12; maand += 1) {
      vermogenMetBox3 += maandelijkseInleg;
      vermogenMetBox3 *= 1 + monthlyRate;
      vermogenZonderBox3 += maandelijkseInleg;
      vermogenZonderBox3 *= 1 + monthlyRate;
    }

    const eindVermogenVoorBox3 = roundMoney(vermogenMetBox3);
    const brutoGroei = roundMoney(eindVermogenVoorBox3 - startMetBox3 - jaarlijkseInleg);
    const box3Result = calculateBox3Tax({
      year: taxYear + jaar - 1,
      method: box3Method,
      hasFiscalPartner,
      bankDeposits: 0,
      investmentsAndOtherAssets: eindVermogenVoorBox3,
      debts: 0,
      actualAnnualReturnRate: box3Method === "actual" ? verwachtRendementPct : undefined,
    });

    const box3Belasting = roundMoney(box3Result.box3Tax);
    cumulatieveBox3Belasting = roundMoney(cumulatieveBox3Belasting + box3Belasting);
    vermogenMetBox3 = roundMoney(Math.max(eindVermogenVoorBox3 - box3Belasting, 0));
    vermogenZonderBox3 = roundMoney(vermogenZonderBox3);

    timeline.push({
      jaar,
      kalenderJaar: taxYear + jaar - 1,
      startVermogen: startMetBox3,
      jaarlijkseInleg,
      brutoGroei,
      eindVermogenVoorBox3,
      box3Belasting,
      eindVermogenNaBox3: vermogenMetBox3,
      cumulatieveBox3Belasting,
      eindVermogenZonderBox3: vermogenZonderBox3,
    });
  }

  const eindVermogenMetBox3 = timeline[timeline.length - 1]?.eindVermogenNaBox3 ?? startVermogen;
  const eindVermogenZonderBox3 =
    timeline[timeline.length - 1]?.eindVermogenZonderBox3 ?? startVermogen;
  const verschilDoorBox3 = roundMoney(
    Math.max(eindVermogenZonderBox3 - eindVermogenMetBox3, 0),
  );
  const totaleBox3Belasting =
    timeline[timeline.length - 1]?.cumulatieveBox3Belasting ?? 0;

  return {
    taxYear,
    horizonJaren,
    startVermogen,
    maandelijkseInleg,
    jaarlijkseInleg,
    verwachtRendementPct,
    hasFiscalPartner,
    box3Method,
    eindVermogenMetBox3,
    eindVermogenZonderBox3,
    verschilDoorBox3,
    totaleBox3Belasting,
    timeline,
    warnings: [
      "Deze uitkomst is indicatief en geen persoonlijk financieel advies.",
      "Box 3 wordt jaarlijks meegenomen zodra je belastbare grondslag boven de vrijstelling uitkomt.",
      "Werkelijke rendementen en belastingregels kunnen afwijken.",
    ],
  };
}
