export function annualToMonthlyRate(annualPercent) {
  const p = Number(annualPercent);
  if (!Number.isFinite(p)) return 0;
  return Math.pow(1 + p / 100, 1 / 12) - 1;
}

/**
 * Simuleert “annuitair betalen” en verschil t.o.v. lineair investeren/onttrekken.
 * verschil = (lineair netto) - (annuïtair netto)
 *  - positief: annuïtair goedkoper => inleg in pot
 *  - negatief: annuïtair duurder => onttrekking uit pot
 */
export function simulateInvestmentPot({ annuityRows, linearRows, annualReturnPercent, clampToZero = true }) {
  const rm = annualToMonthlyRate(annualReturnPercent);

  let pot = 0;
  let maxPot = 0;
  let totalInleg = 0;
  let totalOnttrekking = 0;
  let totalRendement = 0;
  let totalTekort = 0;

  const months = annuityRows.map((a, idx) => {
    const l = linearRows[idx];

    const annuityNetto = Number(a.nettoMonthly) || 0;
    const linearNetto = Number(l.nettoMonthly) || 0;

    // > 0 => annuïtair goedkoper => beleggen
    // < 0 => annuïtair duurder => pot “opeten”
    const verschil = linearNetto - annuityNetto;

    const potStart = pot;
    const rendement = potStart * rm;
    const potNaRendement = potStart + rendement;

    let potEind = potNaRendement + verschil;
    let tekort = 0;

    if (clampToZero && potEind < 0) {
      tekort = -potEind; // deel dat je niet meer uit pot kan betalen
      potEind = 0;
    }

    pot = potEind;

    if (verschil > 0) totalInleg += verschil;
    if (verschil < 0) totalOnttrekking += -verschil;
    totalRendement += rendement;
    totalTekort += tekort;

    if (potEind > maxPot) maxPot = potEind;

    return {
      month: a.month,
      annuityNetto,
      linearNetto,
      verschilLinearMinusAnnuity: verschil,
      potStart,
      rendement,
      potEind,
      tekort,
    };
  });

  // omslagmaand = eerste maand dat verschil < 0 nadat het ooit > 0 was geweest
  let hadPositive = false;
  let omslagMaand = null;
  for (const m of months) {
    if (m.verschilLinearMinusAnnuity > 0) hadPositive = true;
    if (hadPositive && m.verschilLinearMinusAnnuity < 0) {
      omslagMaand = m.month;
      break;
    }
  }

  return {
    months,
    summary: {
      eindPot: pot,
      maxPot,
      totalInleg,
      totalOnttrekking,
      totalRendement,
      totalTekort,
      omslagMaand,
    },
  };
}

export function aggregatePerYear({ potMonths }) {
  const byYear = new Map();

  const ensure = (year) => {
    if (!byYear.has(year)) {
      byYear.set(year, {
        year,
        annuityNettoSum: 0,
        linearNettoSum: 0,
        verschilSum: 0,
        rendementSum: 0,
        tekortSum: 0,
        potEind: 0,
      });
    }
    return byYear.get(year);
  };

  for (let i = 0; i < potMonths.length; i++) {
    const m = potMonths[i];
    const year = Math.ceil(m.month / 12);
    const row = ensure(year);

    row.annuityNettoSum += m.annuityNetto;
    row.linearNettoSum += m.linearNetto;
    row.verschilSum += m.verschilLinearMinusAnnuity;
    row.rendementSum += m.rendement;
    row.tekortSum += m.tekort;
    row.potEind = m.potEind; // laatste maand van het jaar overschrijft, dat is ok
  }

  return Array.from(byYear.values()).sort((a, b) => a.year - b.year);
}
