# Release Notes

Doel: publieke releases herleidbaar maken met datum, commit en relevante aannamewijzigingen.

## 2026-07-05 — Studieschuld-positionering
- Commit: `fc17f93`
- Scope:
  - Site herpositioneerd naar “studieschuld begrijpen” met drie fases: schuldopbouw, maandbedrag en wonen.
  - Nieuwe publieke DUO-tools opgenomen: `duo-doorlenen-of-stoppen`, `duo-maandbedrag` en `duo-extra-aflossen`.
  - Publieke route houdt 7 tools zichtbaar; oude aflossen-vs-beleggen-content blijft hidden in de codebase.
  - Kennisbank vernieuwd rond studieschuldbronnen en feitelijke uitleg.
  - CI/security-hardening en GitHub Pages deploy bijgewerkt.
- Aannames/percentages aangepast: geen nieuwe rekenaanname in deze release; DUO-rentes en normen blijven centraal in `src/lib/financial-constants/`.
- Bekende beperkingen: tools blijven indicatief en geen persoonlijk financieel advies.
- Checkresultaat (`npm run check` / CI): CI groen op `main`; Pages deploy groen na workflowupdate.

## 2026-05-21 — Beta release kandidaat
- Commit: `5f7365c`
- Scope:
  - Copy vereenvoudigd voor box 3 en studieschuld/beleggen (minder technische compound-termen).
  - Automatische horizon in studieschuld-vs-beleggen op basis van verwacht aflosmoment met extra aflossen.
  - Grafische vergelijking schuldverloop versus beleggingswaarde toegevoegd.
- Controle:
  - `npm run check` lokaal groen op releasekandidaat.

## Template voor volgende release
- Datum:
- Commit:
- Scope:
- Aannames/percentages aangepast:
- Bekende beperkingen:
- Checkresultaat (`npm run check` / CI):
