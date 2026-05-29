# Geld lenen & financiering — Uitvoeringsstatus

Peildatum: 2026-05-29
Protocol: `START_HIER_AGENT.md`

## Statuswaarden

- `done`: logic + tests + UI + checks groen
- `ready`: invulblad volledig, klaar om te implementeren
- `needs-spec`: onvoldoende ingevuld invulblad
- `blocked`: technische blokkade buiten invulblad

## Toolstatus

1. Aflossingstermijnen lening — `done`
2. Doorlopend krediet vergelijken — `done`
3. Geld lenen kost geld — `done`
4. Hoogte lening — `done`
5. Kopen op afbetaling — `done`
6. Leasetermijn financial lease — `done`
7. Lening aflossen — `done`
8. Looptijd aflossing lening — `done`
9. Maandbedrag voor aflossing lening — `done`
10. Maximale lening — `done`
11. Persoonlijke lening vergelijken — `done`
12. Rente bij lening — `done`
13. Rente in financial lease — `done`
14. Restschuld bij financial lease — `done`
15. Restschuld lening — `done`
16. Studiefinanciering terugbetalen — `done`
17. Toename schuld — `done`

## Uitgevoerde implementaties in deze batch

- Nieuwe specifieke runtime-profielen voor alle 17 lening-tools in `apps/_artifact_shared/runtime.ts`.
- Profielkoppelingen in alle `apps/artifact-geld-lenen-financiering-*/logic.ts` omgezet van generiek naar tool-specifiek.
- Artifact-calculator aangevuld met strikte velden/validatie en gestructureerde outputs voor lening/lease-profielen in `apps/_artifact_shared/ArtifactCalculator.tsx`.

## Validatie (geslaagd)

- `npx vitest run apps/_artifact_shared/runtime.test.ts`
- `npx vitest run apps/artifact-geld-lenen-financiering-*/logic.test.ts`
- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
