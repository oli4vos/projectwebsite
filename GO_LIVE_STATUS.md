# Go-Live Status

Dit bestand is een append-only log voor releasegereedheid. Voeg per release een nieuw blok toe met datum, referentiecommit en status per checklistpunt. Oude blokken blijven staan als historie.

Actuele toolzichtbaarheid staat niet in dit historische log maar in `FUNCTIONALITY_STATUS.md` en de gegenereerde `src/lib/app-registry.ts`.

## 2026-07-05 — Studieschuld-positionering live

Referentie commit: `fc17f93`
Status: **Gereed voor huidige publicatie op GitHub Pages**

### 1) Juridische copy en positionering
- Status: **Gereed**
- Opmerking: de zichtbare site is herpositioneerd naar informatieve studieschuldtools. Publieke copy blijft feitelijk: geen persoonlijk advies, geen beleggingsadvies en geen zichtbare aflossen-vs-beleggen-route.

### 2) Versiebeheer en traceerbaarheid
- Status: **Gereed**
- Borging:
  - `RELEASE_NOTES.md`
  - `ASSUMPTION_CHANGELOG.md`
  - `FUNCTIONALITY_STATUS.md`

### 3) Regressiechecks in CI
- Status: **Gereed**
- Opmerking: CI draait generate/test/lint/typecheck/build. Security-hardening heeft gitleaks en SHA-gepinde actions toegevoegd; GitHub Pages deploy is bijgewerkt naar actuele Pages-actions.

### 4) Betrouwbaarheidspagina aannames
- Status: **Gereed**
- Borging: `/variabelen` toont een lichte samenvatting met uitklapbare details en bronmetadata.

### 5) Frontend foutmonitoring (privacy-first)
- Status: **Gereed (technisch)**
- Borging:
  - `src/lib/runtime-monitoring.ts`
  - `src/components/RuntimeMonitoringBootstrap.tsx`
- Actie voor productie:
  - zet `NEXT_PUBLIC_RELEASE_VERSION` op commit/tag;
  - optioneel `NEXT_PUBLIC_MONITORING_WEBHOOK_URL` voor alerts.

### 6) Gebruikersexport en data-continuïteit
- Status: **Gereed**
- Opmerking: profiel en scenario-opslag blijven browser-local en feature-flagged waar van toepassing.

### 7) Publieke tools
- Status: **Gereed**
- Opmerking: er zijn 7 publieke tools in de registry:
  - `duo-doorlenen-of-stoppen`
  - `duo-maandbedrag`
  - `duo-extra-aflossen`
  - `hypotheek-impact-studieschuld`
  - `artifact-hypotheek-wonen-maximale-hypotheek`
  - `schulden-volgorde`
  - `familiehulp-eerste-woning`

### 8) Kennisbank
- Status: **Gereed**
- Opmerking: de kennisbank is vernieuwd rond studieschuld begrijpen; oude horizon-/beleggingskaders blijven hidden in de codebase.

### Open handmatige release-gate
- [ ] Voer rooktest uit op mobiel + desktop op de productie-URL.
- [ ] Controleer na deploy of GitHub Pages de laatste commit serveert.

## 2026-05-21 — Beta release kandidaat

Referentie commit: `4a01d14`
Status: **Historie**

### 1) Juridische copy en positionering
- Status: **Gereed**
- Opmerking: tools en verdiepingen benoemden indicatief + geen advies.

### 2) Versiebeheer en traceerbaarheid
- Status: **Gereed**
- Borging:
  - `RELEASE_NOTES.md`
  - `ASSUMPTION_CHANGELOG.md`

### 3) Regressiechecks in CI
- Status: **Gereed (lokaal)**
- Laatste lokale run: `npm run check` groen.
- Nog handmatig te verifiëren: GitHub CI-groen op laatste commit.

### 4) Betrouwbaarheidspagina aannames
- Status: **Gereed**
- Borging: `/variabelen` light samenvatting + uitklapbare details.

### 5) Frontend foutmonitoring (privacy-first)
- Status: **Gereed (technisch)**
- Borging:
  - `src/lib/runtime-monitoring.ts`
  - `src/components/RuntimeMonitoringBootstrap.tsx`
- Actie voor productie:
  - zet `NEXT_PUBLIC_RELEASE_VERSION` op commit/tag;
  - optioneel `NEXT_PUBLIC_MONITORING_WEBHOOK_URL` voor alerts.

### 6) Gebruikersexport en data-continuïteit
- Status: **Gereed**
- Opmerking: export aanwezig in relevante flows; profiel blijft browser-local.

### Open handmatige release-gate
- [ ] Controleer GitHub CI op laatste commit (groen).
- [ ] Voer rooktest uit op mobiel + desktop op productie-URL.
