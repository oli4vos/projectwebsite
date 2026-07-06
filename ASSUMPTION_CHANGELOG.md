# Assumption Changelog

Doel: wijzigingen in vaste aannames/percentages expliciet loggen los van feature-code.

## Werkwijze
- Log elke wijziging in `src/lib/financial-constants/*` en relevante DUO/tax-aannames.
- Noteer altijd:
  - datum,
  - commit hash,
  - wat is aangepast,
  - impact op tools.

## 2026-05-21
- Commit: `5f7365c`
- Wijziging: geen aanname/percentagewijziging, alleen copy-vereenvoudiging.
- Impact: geen rekentechnische impact.

## 2026-06-14
- Commit: `73cb154`, `8b42bb8`
- Wijziging: bronmetadata toegevoegd (sourceUrl + sourceTier per AssumptionMeta-blok in years.ts); velden verplicht gesteld in types.ts.
- Impact: geen rekentechnische impact; puur machineleesbare documentatie.

## 2026-07-05
- Commit: `fc17f93`
- Wijziging: studieschuld-positionering en nieuwe DUO-tools gepubliceerd zonder nieuwe financiële aannames of percentages.
- Impact: geen rekentechnische impact; bestaande DUO-rentes, hypotheeknormen en bronmetadata blijven centraal in `src/lib/financial-constants/`.

## Template
- Datum:
- Commit:
- Wijziging:
- Impact:
