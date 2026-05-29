# Kalender & vrije tijd — Implementatiestatus

Laatst bijgewerkt: 29-05-2026

## Doel

8 artifact-tools zijn uitgewerkt naar werkende app-structuur met:

- `app.json`
- `logic.ts`
- `logic.test.ts`
- `Calculator.tsx`

## Opgeleverde tools

1. `artifact-kalender-vrije-tijd-aantal-werkdagen`
2. `artifact-kalender-vrije-tijd-begin-of-einddatum`
3. `artifact-kalender-vrije-tijd-dag-van-de-week`
4. `artifact-kalender-vrije-tijd-eerstvolgende-of-vorige-weekdag`
5. `artifact-kalender-vrije-tijd-feestdagen`
6. `artifact-kalender-vrije-tijd-periode-duur`
7. `artifact-kalender-vrije-tijd-schoolvakanties`
8. `artifact-kalender-vrije-tijd-wisselkoers-valuta`

## UX/validatie toegepast

- Strikte invoervalidatie per veld met duidelijke Nederlandstalige foutmeldingen.
- Gelaagde UX per tool: invoervelden, compacte samenvatting, uitklapbare details.
- Mobiele veldsturing via `MobileFieldFlowControls`.
- Aannames/disclaimers zichtbaar in de output.

## Technische checks

Uitgevoerd op 29-05-2026:

- `npm run generate:apps` ✅
- `npm run test` ✅ (165 testbestanden, 668 tests geslaagd)
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅

## Opmerking

De tools zijn geïmporteerd als artifact-categorie (`Artifacts (invulbladen)`) en kunnen later 1-op-1 doorgezet worden naar reguliere app-categorieën.
