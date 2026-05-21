# Go-Live Status

Datum: 2026-05-21  
Referentie commit: `4a01d14`

## 1) Juridische copy en positionering
- Status: **Gereed**
- Opmerking: tools en verdiepingen benoemen indicatief + geen advies.

## 2) Versiebeheer en traceerbaarheid
- Status: **Gereed**
- Borging:
  - `RELEASE_NOTES.md`
  - `ASSUMPTION_CHANGELOG.md`

## 3) Regressiechecks in CI
- Status: **Gereed (lokaal)**
- Laatste lokale run: `npm run check` groen.
- Nog handmatig te verifiëren: GitHub CI-groen op laatste commit.

## 4) Betrouwbaarheidspagina aannames
- Status: **Gereed**
- Borging: `/variabelen` light samenvatting + uitklapbare details.

## 5) Frontend foutmonitoring (privacy-first)
- Status: **Gereed (technisch)**
- Borging:
  - `src/lib/runtime-monitoring.ts`
  - `src/components/RuntimeMonitoringBootstrap.tsx`
- Actie voor productie:
  - zet `NEXT_PUBLIC_RELEASE_VERSION` op commit/tag;
  - optioneel `NEXT_PUBLIC_MONITORING_WEBHOOK_URL` voor alerts.

## 6) Gebruikersexport en data-continuïteit
- Status: **Gereed**
- Opmerking: export aanwezig in relevante flows; profiel blijft browser-local.

## Open handmatige release-gate
- [ ] Controleer GitHub CI op laatste commit (groen).
- [ ] Voer rooktest uit op mobiel + desktop op productie-URL.
